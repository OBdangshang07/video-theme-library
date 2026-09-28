import fs from "node:fs";
import path from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const library=JSON.parse(fs.readFileSync(path.join(root,"library.json"),"utf8"));
const fail=(message)=>{throw new Error(message)};
const camel=(id)=>id.replace(/-([a-z0-9])/g,(_,letter)=>letter.toUpperCase());
const asSet=(arr)=>new Set(arr||[]);
const setEq=(a,b)=>a.size===b.size&&[...a].every((x)=>b.has(x));

if(!library.themes.some((theme)=>theme.id===library.defaultTheme)) fail("defaultTheme is not registered");
for(const file of Object.values(library.showroom||{})) if(!fs.existsSync(path.join(root,file))) fail(`Missing showroom file: ${file}`);

const fakeTimeline={set(){return this},fromTo(){return this},to(){return this}};
const fakeParts=new Proxy({},{get:(target,key)=>target[key]||(target[key]=`.fake-${key}`)});
const KINDS=["components","motions","transitions","advancedTransitions"];

for(const theme of library.themes){
  for(const key of ["path","reference"]){
    if(!fs.existsSync(path.join(root,theme[key]))) fail(`Missing ${key}: ${theme[key]}`);
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(root,theme.path),"utf8"));
  if(manifest.id!==theme.id) fail(`Theme id mismatch: ${theme.id}`);
  const base=path.dirname(path.join(root,theme.path));
  for(const file of Object.values(manifest.files||{})) if(!fs.existsSync(path.join(base,file))) fail(`Missing theme file: ${file}`);

  /* library.json 主题条目与 theme.json 清单必须一致 */
  for(const kind of KINDS){
    if(!theme[kind]&&!manifest[kind])continue;
    if(!setEq(asSet(theme[kind]),asSet(manifest[kind])))fail(`${theme.id} ${kind}: library.json entry does not match theme.json manifest`);
  }

  /* 主题展厅覆盖：组件名、动效 data-motion、转场 data-transition */
  const showroomFile=theme.showroom||(theme.id===library.defaultTheme?library.showroom?.gallery:null);
  if(showroomFile){
    const showroomPath=path.join(root,showroomFile);
    if(!fs.existsSync(showroomPath))fail(`Missing theme showroom: ${showroomFile}`);
    const showroom=fs.readFileSync(showroomPath,"utf8");
    for(const id of manifest.components||[])if(!showroom.includes(id))fail(`${theme.id} component missing from showroom: ${id}`);
    for(const id of manifest.motions||[])if(!showroom.includes(`data-motion="${id}"`))fail(`${theme.id} motion missing from showroom: ${id}`);
    for(const id of [...(manifest.transitions||[]),...(manifest.advancedTransitions||[])])if(!showroom.includes(`data-transition="${id}"`))fail(`${theme.id} transition missing from showroom: ${id}`);
  }

  /* 预设导出存在性 + 假时间线冒烟 */
  for(const [kind,fileKey,exportSuffix] of [["motions","motions","Motions"],["transitions","transitions","Transitions"]]){
    if(!manifest.files?.[fileKey]||!manifest[kind])continue;
    const module=await import(pathToFileURL(path.join(base,manifest.files[fileKey])).href);
    const presets=Object.entries(module).find(([key,value])=>key.endsWith(exportSuffix)&&value&&typeof value==="object")?.[1];
    if(!presets)fail(`${theme.id} missing ${exportSuffix} export`);
    for(const id of manifest[kind]){
      const method=camel(id);
      if(typeof presets[method]!=="function")fail(`${theme.id} missing ${kind} preset: ${id}`);
      try{
        if(kind==="motions")presets[method](fakeTimeline,{},0);
        else presets[method](fakeTimeline,fakeParts,0,0.7);
      }catch(error){fail(`${theme.id} ${kind} preset throws on smoke test: ${id}: ${error.message}`)}
    }
  }

  /* GPU 旗舰转场 meta 完整性 */
  if(manifest.files?.advancedTransitions&&manifest.advancedTransitions){
    const module=await import(pathToFileURL(path.join(base,manifest.files.advancedTransitions)).href);
    const meta=Object.entries(module).find(([key,value])=>key.endsWith("AdvancedTransitionMeta")&&value&&typeof value==="object")?.[1];
    if(!meta)fail(`${theme.id} missing AdvancedTransitionMeta export`);
    for(const id of manifest.advancedTransitions){
      if(!meta[id])fail(`${theme.id} advanced transition metadata missing: ${id}`);
      if(meta[id].fallback&&!(manifest.transitions||[]).includes(meta[id].fallback))fail(`${theme.id} advanced transition fallback is not a base transition: ${id} -> ${meta[id].fallback}`);
    }
  }

  /* 16 个 canonical 组件在 components.css 的 catalog 头中均有映射且类存在 */
  if(manifest.files?.components){
    const css=fs.readFileSync(path.join(base,manifest.files.components),"utf8");
    const header=css.match(/\/\*\s*catalog:\s*([^*]+?)\s*\*\//);
    if(!header)fail(`${theme.id} components.css missing /* catalog: ... */ header`);
    const map=Object.fromEntries(header[1].split(";").map((pair)=>pair.split("=").map((part)=>part.trim())).filter((pair)=>pair.length===2&&pair[0]));
    for(const id of library.components){
      if(!map[id])fail(`${theme.id} catalog component unmapped: ${id}`);
      for(const cls of map[id].split("+").map((name)=>name.trim()))if(!css.includes(`.${cls}`))fail(`${theme.id} mapped class missing in components.css: ${cls} (for ${id})`);
    }
  }
}

/* 顶层数组：全库唯一，且动效/转场/GPU 为四主题并集 */
const unique=(items)=>new Set(items).size===items.length;
for(const kind of KINDS)if(!unique(library[kind]))fail(`Duplicate id in top-level ${kind}`);
for(const kind of ["motions","transitions","advancedTransitions"]){
  const union=new Set(library.themes.flatMap((theme)=>theme[kind]||[]));
  if(!setEq(asSet(library[kind]),union))fail(`Top-level ${kind} is not the union of theme entries`);
}

console.log(`Catalog valid: ${library.themes.length} themes, ${library.components.length} canonical components, ${library.motions.length} motions, ${library.transitions.length} transitions, ${library.advancedTransitions.length} advanced transitions.`);
