import fs from "node:fs";
import path from "node:path";
import {chromium} from "playwright";
const out=path.resolve("snapshots/advanced-transitions");
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];
page.on("console",message=>{if(message.type()==="error"&&!message.text().includes("Failed to load resource"))errors.push(message.text())});
page.on("pageerror",error=>errors.push(error.message));
await page.goto(`${process.env.SHOWROOM_URL||"http://127.0.0.1:4179"}/?jump=transitions&role=advanced`,{waitUntil:"networkidle"});
const cards=page.locator('.transition-card[data-role="advanced"]');
if(await cards.count()!==5)throw new Error(`Expected 5 advanced cards, found ${await cards.count()}`);
for(let index=0;index<5;index++){
  const card=cards.nth(index),id=await card.getAttribute("data-transition"),duration=Number(await card.getAttribute("data-duration"));
  await card.scrollIntoViewIfNeeded();
  await card.locator(".replay").click();
  await page.waitForTimeout(duration*450);
  await card.screenshot({path:path.join(out,`${String(index+1).padStart(2,"0")}-${id}-mid.png`)});
  const state=await card.locator("canvas").evaluate(canvas=>{const gl=canvas.getContext("webgl"),pixel=new Uint8Array(4);gl.readPixels(480,270,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);return {width:canvas.width,height:canvas.height,pixel:[...pixel]}}).catch(()=>null);
  if(!state||state.width!==960||state.height!==540)throw new Error(`Canvas state invalid: ${id}`);
}
await browser.close();
if(errors.length)throw new Error(errors.join("\n"));
console.log("Advanced showroom verified: 5 WebGL cards, mid-transition screenshots captured.");
