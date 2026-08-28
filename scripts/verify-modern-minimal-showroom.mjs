import fs from "node:fs";
import path from "node:path";
import {chromium} from "playwright";
const out=path.resolve("snapshots/modern-minimal");
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];
page.on("console",message=>{if(message.type()==="error"&&!message.text().includes("Failed to load resource"))errors.push(message.text())});
page.on("pageerror",error=>errors.push(error.message));
await page.goto(`${process.env.SHOWROOM_URL||"http://127.0.0.1:4179"}/showrooms/modern-minimal.html`,{waitUntil:"networkidle"});
const counts={components:await page.locator("#component-grid .card").count(),motions:await page.locator("#motion-grid .card").count(),transitions:await page.locator("#transition-grid .card").count()};
if(counts.components!==15||counts.motions!==10||counts.transitions!==12)throw new Error(`Unexpected catalog counts: ${JSON.stringify(counts)}`);
await page.screenshot({path:path.join(out,"01-hero.png")});
for(const [index,selector] of [[2,"#components"],[3,"#motions"],[4,"#transitions"]]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(350);
  await page.screenshot({path:path.join(out,`0${index}-${selector.slice(1)}.png`)});
}
for(const card of [page.locator(".motion-card").first(),page.locator(".motion-card").last(),page.locator(".transition-card").first(),page.locator(".transition-card").last()]){
  await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(280);
}
const overflow=await page.evaluate(()=>[...document.querySelectorAll('.card')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.querySelector('.id')?.textContent));
await browser.close();
if(overflow.length)throw new Error(`Horizontal overflow: ${overflow.join(", ")}`);
if(errors.length)throw new Error(errors.join("\n"));
console.log(`Modern minimal showroom verified: ${counts.components} components, ${counts.motions} motions, ${counts.transitions} transitions.`);
