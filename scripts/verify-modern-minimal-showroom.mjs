import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage,cardOverflow} from "./lib/showroom.mjs";

const out=path.resolve("snapshots/modern-minimal");fs.mkdirSync(out,{recursive:true});
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage();
await page.goto(`${base}/showrooms/modern-minimal.html`,{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);
const counts={components:await page.locator("#component-grid .card").count(),motions:await page.locator("#motion-grid .card").count(),transitions:await page.locator("#transition-grid .card").count()};
if(counts.components!==17||counts.motions!==14||counts.transitions!==21)throw new Error(`Unexpected catalog counts: ${JSON.stringify(counts)}`);
for(const family of ['Montserrat','"IBM Plex Mono"'])if(!await page.evaluate(f=>document.fonts.check(`18px ${f}`),family))throw new Error(`${family} did not load`);
const gpuCount=await page.locator('.transition-card[data-role="advanced"] canvas').count();
if(gpuCount!==5)throw new Error(`Expected 5 GPU canvases, found ${gpuCount}`);
await page.screenshot({path:path.join(out,"01-hero.png")});
for(const [n,selector] of [[2,"#system"],[3,"#components"],[4,"#motions"]]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(350);
  await page.screenshot({path:path.join(out,`0${n}-${selector.slice(1)}.png`)});
}
for(const card of [page.locator(".motion-card").first(),page.locator(".motion-card").nth(9),page.locator(".motion-card").last()]){
  await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(760);
}
await page.locator("#motions").scrollIntoViewIfNeeded();await page.waitForTimeout(300);
await page.screenshot({path:path.join(out,"05-motions-replayed.png")});
for(const card of [page.locator('.transition-card[data-role="primary"]').first(),page.locator('.transition-card[data-role="section"]').first(),page.locator('.transition-card[data-role="accent"]').last()]){
  await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(360);
}
for(const card of await page.locator('.transition-card[data-role="advanced"]').all()){
  await card.scrollIntoViewIfNeeded();
  await card.locator(".replay").click();
  await page.waitForTimeout(Number(await card.getAttribute("data-duration"))*450);
  await card.screenshot({path:path.join(out,`gpu-${await card.getAttribute("data-transition")}.png`)});
  await page.waitForTimeout(800);
}
await page.locator("#transitions").scrollIntoViewIfNeeded();await page.waitForTimeout(1200);
await page.screenshot({path:path.join(out,"06-transitions.png")});
const overflow=await cardOverflow(page);
await browser.close();
await new Promise((resolve)=>server.close(resolve));
if(overflow.length)throw new Error(`Horizontal overflow: ${overflow.join(", ")}`);
if(errors.length)throw new Error(errors.join("\n"));
console.log(`Modern minimal showroom verified: fonts loaded; ${counts.components} components, ${counts.motions} motions, ${counts.transitions} transitions (5 GPU canvases live).`);
