import fs from "node:fs";
import path from "node:path";
import {chromium} from "playwright";
const out=path.resolve("snapshots/signal-desk");fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on("console",m=>{if(m.type()==="error"&&!m.text().includes("Failed to load resource"))errors.push(m.text())});page.on("pageerror",e=>errors.push(e.message));
await page.goto(`${process.env.SHOWROOM_URL||"http://127.0.0.1:4179"}/showrooms/signal-desk.html`,{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);
const counts={components:await page.locator("#component-grid .card").count(),motions:await page.locator("#motion-grid .card").count(),transitions:await page.locator("#transition-grid .card").count()};
if(counts.components!==16||counts.motions!==10||counts.transitions!==12)throw new Error(`Unexpected catalog counts: ${JSON.stringify(counts)}`);
for(const family of ['Inter','"JetBrains Mono"'])if(!await page.evaluate(f=>document.fonts.check(`18px ${f}`),family))throw new Error(`${family} did not load`);
await page.screenshot({path:path.join(out,"01-hero.png")});
for(const [n,selector] of [[2,"#components"],[3,"#motions"],[4,"#transitions"]]){await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`0${n}-${selector.slice(1)}.png`)})}
for(const card of [page.locator(".motion-card").first(),page.locator(".motion-card").last()]){await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(760)}
for(const card of [page.locator(".transition-card").first(),page.locator(".transition-card").nth(4),page.locator(".transition-card").last()]){await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(1200)}
await page.locator("#transitions").scrollIntoViewIfNeeded();await page.waitForTimeout(1400);await page.screenshot({path:path.join(out,"05-transitions-settled.png")});
const overflow=await page.evaluate(()=>[...document.querySelectorAll('.card')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.querySelector('.id')?.textContent));
await browser.close();if(overflow.length)throw new Error(`Horizontal overflow: ${overflow.join(", ")}`);if(errors.length)throw new Error(errors.join("\n"));
console.log(`Signal Desk showroom verified: fonts loaded; ${counts.components} components, ${counts.motions} motions, ${counts.transitions} transitions.`);
