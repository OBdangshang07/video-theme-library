import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage} from "./lib/showroom.mjs";

// 样板对照验收：逐帧抽样截图 + 跳帧确定性（顺序 vs 乱序像素哈希一致）+ 材料组件单帧耗时。
const out=path.resolve("snapshots/pilot");fs.mkdirSync(out,{recursive:true});
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage({width:1440,height:1100});
await page.goto(`${base}/?jump=pilot`,{waitUntil:"networkidle"});
await page.waitForFunction(()=>[...document.querySelectorAll(".pilot-card")].every((c)=>c.dataset.ready==="1"),null,{timeout:20000});
await page.evaluate(()=>document.querySelectorAll(".pilot-card").forEach((c)=>{c.dataset.played="1"}));

const fractions=[0,.08,.16,.24,.32,.42,.55,.7,.85,1];
for(const id of ["ink-slam","margin-pull","rubbing-reveal"]){
  const card=page.locator(`.pilot-card[data-pilot="${id}"]`);
  await card.scrollIntoViewIfNeeded();
  const pair=card.locator(".pilot-pair");
  for(const [i,f] of fractions.entries()){
    await card.evaluate((el,f)=>el.pilotSeek(el.pilotSpan*f),f);
    await page.waitForTimeout(60);
    await pair.screenshot({path:path.join(out,`${id}-${String(i).padStart(2,"0")}.png`)});
  }
}

const report=await page.evaluate(async()=>{
  const card=document.querySelector('.pilot-card[data-pilot="rubbing-reveal"]');
  const canvas=card.querySelectorAll(".pilot-canvas")[1];
  const ctx=canvas.getContext("2d");
  const hash=()=>{const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;let h=2166136261;for(let i=0;i<d.length;i+=7){h^=d[i];h=Math.imul(h,16777619)}return h>>>0};
  // Chrome moves a canvas from GPU to CPU after its first readbacks, which shifts blur
  // rasterisation slightly. Warm the readback path so both passes hash the same backend.
  for(let i=0;i<4;i++){card.pilotSeek(i);hash()}
  const times=[0,.4,.9,1.3,1.8,2.4,2.9,3.4,3.9,4.4,4.9,5.4];
  const seq={},rnd={},cost=[];
  for(const t of times){const s=performance.now();card.pilotSeek(t);cost.push(performance.now()-s);seq[t]=hash()}
  const shuffled=[5.4,1.3,3.9,0,4.9,.4,2.9,1.8,4.4,.9,3.4,2.4];
  for(const t of shuffled){card.pilotSeek(t);rnd[t]=hash()}
  const mismatched=times.filter((t)=>seq[t]!==rnd[t]);
  // single-frame worst case: cold rebuild from zero at the last frame
  card.pilotSeek(0);const s=performance.now();card.pilotSeek(5.4);const cold=performance.now()-s;
  return {mismatched,maxSequentialMs:Math.max(...cost),coldSeekMs:cold,size:`${canvas.width}x${canvas.height}`};
});
await browser.close();
await new Promise((resolve)=>server.close(resolve));
console.log(JSON.stringify(report));
if(report.mismatched.length)throw new Error(`rubbing-reveal is not seek-deterministic at ${report.mismatched.join(", ")}`);
if(errors.length)throw new Error(errors.join("\n"));
console.log(`Pilot verified: frames in ${out}`);
