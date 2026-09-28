import fs from "node:fs";
import path from "node:path";
import {startServer,launchPage,cardOverflow} from "./lib/showroom.mjs";

const out=path.resolve("snapshots/signal-desk");fs.mkdirSync(out,{recursive:true});
const {server,base}=await startServer();
const {browser,page,errors}=await launchPage();
await page.goto(`${base}/showrooms/signal-desk.html`,{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);
const counts={components:await page.locator("#component-grid .card").count(),motions:await page.locator("#motion-grid .card").count(),transitions:await page.locator("#transition-grid .card").count()};
if(counts.components!==21||counts.motions!==14||counts.transitions!==21)throw new Error(`Unexpected catalog counts: ${JSON.stringify(counts)}`);
for(const family of ['Oswald','"IBM Plex Mono"','"Noto Sans JP"'])if(!await page.evaluate(f=>document.fonts.check(`18px ${f}`),family))throw new Error(`${family} did not load`);
const gpuCount=await page.locator('.transition-card[data-role="advanced"] canvas').count();
if(gpuCount!==5)throw new Error(`Expected 5 GPU canvases, found ${gpuCount}`);
await page.screenshot({path:path.join(out,"01-hero.png")});
for(const [n,selector] of [[2,"#components"],[3,"#motions"],[4,"#transitions"]]){await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`0${n}-${selector.slice(1)}.png`)})}
for(const card of [page.locator(".motion-card").first(),page.locator(".motion-card").last()]){await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(760)}
for(const card of [page.locator(".transition-card").first(),page.locator(".transition-card").nth(4),page.locator(".transition-card").nth(15)]){await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(1200)}
for(const card of await page.locator('.transition-card[data-role="advanced"]').all()){await card.scrollIntoViewIfNeeded();await card.locator(".replay").click();await page.waitForTimeout(500)}
await page.locator("#transitions").scrollIntoViewIfNeeded();await page.waitForTimeout(1400);await page.screenshot({path:path.join(out,"05-transitions-settled.png")});
const overflow=await cardOverflow(page);
await browser.close();
await new Promise((resolve)=>server.close(resolve));
if(overflow.length)throw new Error(`Horizontal overflow: ${overflow.join(", ")}`);
if(errors.length)throw new Error(errors.join("\n"));
console.log(`Signal Desk showroom verified: fonts loaded; ${counts.components} components, ${counts.motions} motions, ${counts.transitions} transitions (5 GPU canvases live).`);
