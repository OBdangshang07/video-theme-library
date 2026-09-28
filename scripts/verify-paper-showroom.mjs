import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage,cardOverflow} from "./lib/showroom.mjs";

const out=path.resolve("snapshots/showroom");fs.mkdirSync(out,{recursive:true});
const theme=JSON.parse(fs.readFileSync("themes/paper-editorial/theme.json","utf8"));
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage();
await page.goto(`${base}/`,{waitUntil:"networkidle"});
const componentIds=await page.locator("#component-grid .component-card .id").allTextContents();
const motionIds=await page.locator(".motion-card").evaluateAll((cards)=>cards.map((card)=>card.dataset.motion));
const counts={components:componentIds.length,motions:motionIds.length,transitions:await page.locator("#transition-grid .card").count()};
if(JSON.stringify([...componentIds].sort())!==JSON.stringify([...theme.components].sort()))throw new Error("Component cards do not match theme.json");
if(JSON.stringify([...motionIds].sort())!==JSON.stringify([...theme.motions].sort()))throw new Error("Motion cards do not match theme.json");
if(counts.transitions!==21)throw new Error(`Unexpected transition count: ${counts.transitions}`);
await page.screenshot({path:path.join(out,"01-hero.png")});
for(const [n,selector] of [[2,"#system"],[3,"#components"],[4,"#motions"],[5,"#transitions"]]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(450);
  await page.screenshot({path:path.join(out,`0${n}-${selector.slice(1)}.png`)});
}
for(const card of [page.locator('.motion-card[data-motion="movable-type"]'),page.locator('.motion-card[data-motion="rubbing-reveal"]'),page.locator('.motion-card[data-motion="paper-cutaway"]'),page.locator(".motion-card").last()]){
  await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(400);
}
await page.locator("#motions").scrollIntoViewIfNeeded();await page.waitForTimeout(300);
await page.screenshot({path:path.join(out,"06-motions-replayed.png")});
for(const card of [page.locator('.transition-card[data-role="primary"]').first(),page.locator('.transition-card[data-role="section"]').first(),page.locator('.transition-card[data-role="accent"]').last()]){
  await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(360);
}
const gpuCount=await page.locator('.transition-card[data-role="advanced"] canvas').count();
if(gpuCount!==5)throw new Error(`Expected 5 GPU canvases, found ${gpuCount}`);
const overflow=await cardOverflow(page);
await browser.close();
await new Promise((resolve)=>server.close(resolve));
if(overflow.length)throw new Error(`Horizontal overflow: ${overflow.join(", ")}`);
if(errors.length)throw new Error(errors.join("\n"));
console.log(`Paper showroom verified: ${counts.components} components, ${counts.motions} motions, ${counts.transitions} transitions (5 GPU canvases live).`);
