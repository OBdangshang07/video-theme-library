import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage} from "./lib/showroom.mjs";

// 动效/转场接触表：所有卡片定位到各自时长的同一比例，逐卡截图后拼成 3×4 网格；并检查控制台错误。
// 用法：node scripts/verify-paper-motions.mjs [motion|transition]   FRACTIONS=.2,.5,1
const kind=process.argv[2]||"motion";
const out=path.resolve(`snapshots/${kind}-sheets`);fs.mkdirSync(out,{recursive:true});
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage({width:1440,height:1300});
await page.goto(`${base}/?jump=${kind}s`,{waitUntil:"networkidle"});
const cards=kind==="motion"?".motion-card":'.transition-card:not([data-role="advanced"])';
const count=await page.locator(cards).count();
for(let i=0;i<count;i++){
  const card=page.locator(cards).nth(i);
  await card.scrollIntoViewIfNeeded();
  await card.locator(".replay").click();
}
await page.waitForFunction(({cards})=>[...document.querySelectorAll(cards)].every((c)=>c.motionTl),{cards},{timeout:20000});
await page.waitForTimeout(800);
const fractions=(process.env.FRACTIONS||".2,.45,.7,1").split(",").map(Number);
const perSheet=12;
for(const f of fractions){
  await page.evaluate(({cards,f})=>document.querySelectorAll(cards).forEach((c)=>{const tl=c.motionTl;tl.pause();tl.seek(tl.duration()*f,false)}),{cards,f});
  await page.waitForTimeout(250);
  const shots=[];
  for(let i=0;i<count;i++){
    const card=page.locator(cards).nth(i);
    await card.scrollIntoViewIfNeeded();
    const stage=card.locator(".mini,.motion-stage,.tx-stage").first();
    shots.push({id:await card.locator(".id").textContent(),png:(await stage.screenshot()).toString("base64")});
  }
  for(let s=0;s*perSheet<shots.length;s++){
    const url=await page.evaluate(async(items)=>{
      const W=440,H=260,cols=3,rows=Math.ceil(items.length/cols);
      const c=document.createElement("canvas");c.width=cols*W;c.height=rows*(H+22);
      const x=c.getContext("2d");x.fillStyle="#e7dcc4";x.fillRect(0,0,c.width,c.height);
      for(const [i,it] of items.entries()){
        const img=new Image();img.src=`data:image/png;base64,${it.png}`;await img.decode();
        const cx=(i%cols)*W,cy=Math.floor(i/cols)*(H+22);
        const k=Math.min((W-8)/img.width,H/img.height);
        x.drawImage(img,cx+4,cy+22,img.width*k,img.height*k);
        x.fillStyle="#b83b2f";x.font="700 14px monospace";x.fillText(it.id,cx+6,cy+16);
      }
      return c.toDataURL("image/png");
    },shots.slice(s*perSheet,(s+1)*perSheet));
    fs.writeFileSync(path.join(out,`${String(f).replace(".","")}-${s}.png`),Buffer.from(url.split(",")[1],"base64"));
  }
}
await browser.close();
await new Promise((resolve)=>server.close(resolve));
if(errors.length)throw new Error(errors.join("\n"));
console.log(`${kind} sheets written to ${out}`);
