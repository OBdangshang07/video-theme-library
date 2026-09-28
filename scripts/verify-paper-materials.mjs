import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage} from "./lib/showroom.mjs";

// 材料组件验收（1920×1080）：关键时刻截图 + 顺序/乱序跳帧像素哈希一致 + 单帧耗时。
// 用法：node scripts/verify-paper-materials.mjs [movable-type|rubbing-reveal|paper-cutaway|ink-form ...]
const only=process.argv.slice(2);
const out=path.resolve("snapshots/materials");fs.mkdirSync(out,{recursive:true});
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage({width:1920,height:1080});
await page.goto(`${base}/index.html?materials`,{waitUntil:"networkidle"});
await page.evaluate(()=>{document.body.innerHTML=`<div class="pe-scene pe-theme" style="position:fixed;inset:0;width:1920px;height:1080px;z-index:99"><div class="pe-paper-bg"></div><div class="pe-grain"></div><canvas id="mat" style="position:absolute;inset:0;width:1920px;height:1080px"></canvas></div>`;window.scrollTo(0,0)});
const specs={
  "movable-type":{module:"movable-type.js",factory:"createMovableType",options:{text:"见字如面",seed:71,duration:5.6,accentIndex:3},times:[.6,1.3,2.05,2.6,3.2,3.7,4.2,5.6]},
  "rubbing-reveal":{module:"rubbing-reveal.js",factory:"createRubbingReveal",options:{visual:{src:"/showcases/editorial-materials/assets/mirror.svg"},seed:83,duration:5.4,density:1.4,mode:"intaglio"},times:[.5,1.5,2.8,4,5.4]},
  "paper-cutaway":{module:"paper-cutaway.js",factory:"createPaperCutaway",options:{seed:97,duration:6.6,layers:[
    {src:"/showcases/editorial-materials/assets/surface.svg",label:"山体表象",caption:"SURFACE / 01"},
    {src:"/showcases/editorial-materials/assets/strata.svg",label:"地下地层",caption:"STRATA / 02"},
    {src:"/showcases/editorial-materials/assets/vein.svg",label:"深层矿脉",caption:"VEIN / 03"}]},times:[.5,1.1,1.6,2.1,2.8,4.4,5.2,6.6]}
};
const report={};
for(const [id,spec] of Object.entries(specs)){
  if(only.length&&!only.includes(id))continue;
  await page.evaluate(async({spec})=>{
    const mod=await import(`/themes/paper-editorial/${spec.module}`);
    const old=document.querySelector("#mat"),c=old.cloneNode();old.replaceWith(c);
    window.__mat=await mod[spec.factory](c,{...spec.options,width:1920,height:1080});
  },{spec});
  for(const t of spec.times){
    await page.evaluate((t)=>window.__mat.render(t),t);
    await page.screenshot({path:path.join(out,`${id}-${String(t).replace(".","_")}.png`)});
  }
  report[id]=await page.evaluate((times)=>{
    const c=document.querySelector("#mat"),ctx=c.getContext("2d"),m=window.__mat;
    const hash=()=>{const d=ctx.getImageData(0,0,c.width,c.height).data;let h=2166136261;for(let i=0;i<d.length;i+=7){h^=d[i];h=Math.imul(h,16777619)}return h>>>0};
    for(let i=0;i<4;i++){m.render(i*.7);hash()}
    const seq={},cost=[];
    for(const t of times){const s=performance.now();m.render(t);cost.push(performance.now()-s);seq[t]=hash()}
    const mismatched=[];
    for(const t of [...times].reverse().sort((a,b)=>((a*7919)%1)-((b*7919)%1))){m.render(t);if(hash()!==seq[t])mismatched.push(t)}
    return {mismatched,maxMs:Math.round(Math.max(...cost)*10)/10};
  },spec.times);
}
await browser.close();
await new Promise((resolve)=>server.close(resolve));
console.log(JSON.stringify(report));
const bad=Object.entries(report).filter(([,r])=>r.mismatched.length);
if(bad.length)throw new Error(`not seek-deterministic: ${bad.map(([id,r])=>`${id}@${r.mismatched}`).join("; ")}`);
if(errors.length)throw new Error(errors.join("\n"));
console.log(`Materials verified: frames in ${out}`);
