import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage} from "./lib/showroom.mjs";

// GPU 旗舰转场按确定进度抽帧：每个效果 0.25 / 0.45 / 0.65 / 0.85 拼成一张图。
const out=path.resolve("snapshots/advanced-transitions");fs.mkdirSync(out,{recursive:true});
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage({width:1400,height:900});
await page.goto(`${base}/index.html?gpu-frames`,{waitUntil:"networkidle"});
const ids=["ink-diffusion-field","fiber-tear-displacement","editorial-depth-warp","vermilion-pressure-wave","calligraphy-stroke-morph"];
for(const id of ids){
  const url=await page.evaluate(async(id)=>{
    const m=await import("/themes/paper-editorial/advanced-transitions.js");
    const c=document.createElement("canvas");c.width=960;c.height=540;
    const engine=m.createPaperEditorialAdvancedTransition(c,{from:m.createEditorialTexture(960,540,"from"),to:m.createEditorialTexture(960,540,"to"),effect:id});
    const sheet=document.createElement("canvas");sheet.width=960*2;sheet.height=540*2;const x=sheet.getContext("2d");
    [.25,.45,.65,.85].forEach((p,i)=>{engine.render(p);x.drawImage(c,(i%2)*960,Math.floor(i/2)*540)});
    engine.destroy();
    return sheet.toDataURL("image/png");
  },id);
  fs.writeFileSync(path.join(out,`frames-${id}.png`),Buffer.from(url.split(",")[1],"base64"));
}
await browser.close();
await new Promise((resolve)=>server.close(resolve));
if(errors.length)throw new Error(errors.join("\n"));
console.log(`GPU frame sheets written to ${out}`);
