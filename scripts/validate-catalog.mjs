import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const library=JSON.parse(fs.readFileSync(path.join(root,"library.json"),"utf8"));
const fail=(message)=>{throw new Error(message)};
if(!library.themes.some((theme)=>theme.id===library.defaultTheme)) fail("defaultTheme is not registered");
for(const file of Object.values(library.showroom||{})) if(!fs.existsSync(path.join(root,file))) fail(`Missing showroom file: ${file}`);
for(const theme of library.themes){
  for(const key of ["path","reference"]){
    if(!fs.existsSync(path.join(root,theme[key]))) fail(`Missing ${key}: ${theme[key]}`);
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(root,theme.path),"utf8"));
  if(manifest.id!==theme.id) fail(`Theme id mismatch: ${theme.id}`);
  const base=path.dirname(path.join(root,theme.path));
  for(const file of Object.values(manifest.files||{})) if(!fs.existsSync(path.join(base,file))) fail(`Missing theme file: ${file}`);
  if(theme.showroom){
    const showroomPath=path.join(root,theme.showroom);
    if(!fs.existsSync(showroomPath))fail(`Missing theme showroom: ${theme.showroom}`);
    const showroom=fs.readFileSync(showroomPath,"utf8");
    for(const kind of ["components","motions","transitions"])for(const id of manifest[kind]||[])if(!showroom.includes(id))fail(`${theme.id} ${kind} item missing from showroom: ${id}`);
  }
  for(const [kind,fileKey,exportSuffix] of [["motions","motions","Motions"],["transitions","transitions","Transitions"]]){
    if(!manifest.files?.[fileKey]||!manifest[kind])continue;
    const module=await import(pathToFileURL(path.join(base,manifest.files[fileKey])).href);
    const presets=Object.entries(module).find(([key,value])=>key.endsWith(exportSuffix)&&value&&typeof value==="object")?.[1];
    if(!presets)fail(`${theme.id} missing ${exportSuffix} export`);
    for(const id of manifest[kind]){const method=id.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());if(typeof presets[method]!=="function")fail(`${theme.id} missing ${kind} preset: ${id}`)}
  }
}
const unique=(items)=>new Set(items).size===items.length;
if(!unique(library.components)||!unique(library.motions)||!unique(library.transitions)||!unique(library.advancedTransitions)) fail("Duplicate component, motion, or transition id");
const gallery=fs.readFileSync(path.join(root,library.showroom.gallery),"utf8");
for(const id of library.components) if(!gallery.includes(`>${id}<`)) fail(`Component missing from gallery: ${id}`);
for(const id of library.motions) if(!gallery.includes(`data-motion="${id}"`)) fail(`Motion missing from gallery: ${id}`);
for(const id of library.transitions) if(!gallery.includes(`data-transition="${id}"`)) fail(`Transition missing from gallery: ${id}`);
for(const id of library.advancedTransitions) if(!gallery.includes(`data-transition="${id}"`)) fail(`Advanced transition missing from gallery: ${id}`);
const {paperEditorialTransitions}=await import(pathToFileURL(path.join(root,"themes/paper-editorial/transitions.js")).href);
const transitionFunctionNames={
  "paper-push":"paperPush","folio-rise":"folioRise","red-rule-cut":"redRuleCut","margin-pull":"marginPull",
  "ink-dip":"inkDip","ink-sweep":"inkSweep","tear-wipe":"tearWipe","diagonal-slice":"diagonalSlice",
  "ink-iris":"inkIris","focus-press":"focusPress","paper-fold":"paperFold","stamp-cover":"stampCover",
  "archive-shutter":"archiveShutter","column-cascade":"columnCascade","paper-stack":"paperStack","chapter-bridge":"chapterBridge"
};
const fakeTimeline={set(){return this},fromTo(){return this},to(){return this}};
const fakeParts={outgoing:"#old",incoming:"#new",overlay:"#overlay",slats:".slat",columns:".column",sheets:".sheet"};
for(const id of library.transitions){const fn=paperEditorialTransitions[transitionFunctionNames[id]];if(typeof fn!=="function")fail(`Transition function missing: ${id}`);fn(fakeTimeline,fakeParts,1,0.7)}
const {paperEditorialAdvancedTransitionMeta}=await import(pathToFileURL(path.join(root,"themes/paper-editorial/advanced-transitions.js")).href);
for(const id of library.advancedTransitions) if(!paperEditorialAdvancedTransitionMeta[id]) fail(`Advanced transition metadata missing: ${id}`);
console.log(`Catalog valid: ${library.themes.length} theme, ${library.components.length} components, ${library.motions.length} motions, ${library.transitions.length} transitions, ${library.advancedTransitions.length} advanced transitions.`);
