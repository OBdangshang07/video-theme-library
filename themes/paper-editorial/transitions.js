// paper-editorial 3.0 transitions — no flat colour blocks, no straight geometric edges.
// Every overlay is a textured material (wet ink sheets, vermilion seal faces, paper strips),
// every reveal edge is fibrous. Generated once at timeline-build time, positioned with
// percentage transforms so showroom thumbnails and 1920×1080 renders share the same numbers.
// Signatures and parts match v2.3; the old presets stay in ./classic/transitions.js.
import {paperEditorialTransitions as classic,paperEditorialTransitionMeta as classicMeta} from "./classic/transitions.js";
import {brushShapeURL,edgeMaskURL,bandMaskURL,hasDOM,inkSheetCanvas,materialURL,orientedInkSheet,
  sealInkFilter,soakMaskURL,tornEdgeStrip} from "./paper-kit.js";

const INK="#20262c",RED="#b83b2f",PAPER_LIGHT="#f4ead4";
const NR={immediateRender:false};
const FULL="linear-gradient(#000,#000)";
const isEl=(x)=>hasDOM&&x instanceof Element;
const one=(part)=>typeof part==="string"&&hasDOM?document.querySelector(part):part?.length!==undefined&&!isEl(part)?part[0]:part;
const many=(part)=>typeof part==="string"&&hasDOM?[...document.querySelectorAll(part)]:part?.length!==undefined&&!isEl(part)?[...part]:part?[part]:[];
let serial=0;

// 画面尺寸：宽高比取本地布局像素，纹理分辨率取屏幕像素（夹在 960–1920）。
const frameOf=(el)=>{
  const rect=el.getBoundingClientRect();
  const w=el.offsetWidth||rect.width||1920,h=el.offsetHeight||rect.height||1080;
  return {aspect:h/w,res:Math.round(Math.min(1920,Math.max(960,rect.width||1920)))};
};
// 把材料画布挂进宿主（一次）。axis=y 时画布高度为宿主高度的 total 倍，axis=x 时为宽度的 total 倍。
const mountSheet=(host,key,build,axis="y")=>{
  host.__peSheets??={};
  if(!host.__peSheets[key]){
    const {canvas,total}=build();
    canvas.className="pe-tx-sheet";
    canvas.style.cssText=`position:absolute;left:0;top:0;${axis==="y"?`width:100%;height:${total*100}%`:`height:100%;width:${total*100}%`};display:block;pointer-events:none;visibility:hidden`;
    host.appendChild(canvas);
    host.__peSheets[key]=canvas;
  }
  return host.__peSheets[key];
};
// 装饰层：挂在 anchor 的父节点里、紧跟 anchor 之后，盖在两幕之上。
const mountDecor=(anchor,key,build)=>{
  const parent=anchor.parentElement;
  parent.__peDecor??={};
  if(!parent.__peDecor[key]){
    const el=build();
    el.style.position="absolute";el.style.pointerEvents="none";el.style.visibility="hidden";el.style.zIndex="20";
    parent.appendChild(el);
    parent.__peDecor[key]=el;
  }
  return parent.__peDecor[key];
};
const setMask=(el,images,sizes,positions)=>{
  for(const pre of ["","-webkit-"]){
    el.style.setProperty(`${pre}mask-image`,images);el.style.setProperty(`${pre}mask-size`,sizes);
    el.style.setProperty(`${pre}mask-position`,positions);el.style.setProperty(`${pre}mask-repeat`,"no-repeat");
  }
};
const setSwap=(tl,outgoing,incoming,at)=>{
  tl.set(incoming,{opacity:1},at);
  tl.set(outgoing,{opacity:0},at);
};
// 两段行程：power2.in 压入 → power2.out 放开，按路程分配时长，换页点速度连续。
const travel=(tl,target,prop,from,swap,to,at,duration)=>{
  const swapAt=at+duration*(swap-from)/(to-from);
  tl.fromTo(target,{[prop]:from},Object.assign({[prop]:swap,duration:swapAt-at,ease:"power2.in"},NR),at);
  tl.to(target,{[prop]:to,duration:at+duration-swapAt,ease:"power2.out"},swapAt);
  return swapAt;
};
// 场景级纤维边揭示（ltr）。返回种子，供撕口/笔带装饰按同一条边界绘制。
const sceneEdge=(el,seed,fibres=1)=>{
  el.style.setProperty("--pe-tx-mask",edgeMaskURL("ltr",seed,fibres));
  setMask(el,"var(--pe-tx-mask)","300% 100%","calc(var(--pe-tx-edge) * 1%) 0%");
};
// 场景级墨团渗开：以 (cx,cy) 比例坐标为圆心。
const sceneSoak=(tl,el,at,duration,{cx=.5,cy=.5,to=3,ease="power2.inOut"}={})=>{
  const w=el.offsetWidth||1920,h=el.offsetHeight||1080,span=Math.max(w,h);
  el.style.setProperty("--pe-tx-mask",soakMaskURL((++serial)%5+1));
  const size=`calc(var(--pe-tx-soak) * ${span}px)`;
  setMask(el,"var(--pe-tx-mask)",`${size} ${size}`,
    `calc(${cx*w}px - var(--pe-tx-soak) * ${span/2}px) calc(${cy*h}px - var(--pe-tx-soak) * ${span/2}px)`);
  tl.fromTo(el,{"--pe-tx-soak":0},{"--pe-tx-soak":to,duration,ease},at);
  tl.set(el,{"--pe-tx-mask":FULL},at+duration);
};

export const paperEditorialTransitions={
  // 主转场 ------------------------------------------------------------------

  // 纸页推进：新页像一张纸从右侧滑入并放平，前缘投影压在旧页上；旧页视差后退并被压暗。
  paperPush(tl,{outgoing,incoming},at,duration=.8){
    if(!isEl(one(incoming)))return classic.paperPush(tl,{outgoing,incoming},at,duration);
    tl.fromTo(incoming,{opacity:1,xPercent:100,rotationY:-9,transformPerspective:2400,transformOrigin:"0% 50%",
      boxShadow:"-60px 0px 80px rgba(24,18,10,0.34)"},
      {xPercent:0,rotationY:0,boxShadow:"0px 0px 0px rgba(24,18,10,0)",duration,ease:"power4.inOut"},at);
    tl.fromTo(outgoing,{xPercent:0,filter:"brightness(1)"},{xPercent:-28,filter:"brightness(0.76)",duration,ease:"power4.inOut"},at);
    tl.set(outgoing,{filter:""},at+duration);
    tl.set(incoming,{boxShadow:""},at+duration);
    return tl;
  },

  // 对开升起：新页自下方翻起放平（下缘先到），旧页被推上去、缩远、压暗。
  folioRise(tl,{outgoing,incoming},at,duration=.82){
    if(!isEl(one(incoming)))return classic.folioRise(tl,{outgoing,incoming},at,duration);
    tl.fromTo(incoming,{opacity:1,yPercent:100,rotationX:14,transformPerspective:2400,transformOrigin:"50% 0%",
      boxShadow:"0px -50px 70px rgba(24,18,10,0.3)"},
      {yPercent:0,rotationX:0,boxShadow:"0px 0px 0px rgba(24,18,10,0)",duration,ease:"power4.inOut"},at);
    tl.fromTo(outgoing,{yPercent:0,scale:1,filter:"brightness(1)"},{yPercent:-24,scale:.965,filter:"brightness(0.78)",duration,ease:"power4.inOut"},at);
    tl.set(outgoing,{filter:""},at+duration);
    tl.set(incoming,{boxShadow:""},at+duration);
    return tl;
  },

  // 焦点压合：旧页失焦推远，新页像墨滴在纸心洇开一样由中心渗出，同时收焦。
  focusPress(tl,{outgoing,incoming},at,duration=.86){
    const inc=one(incoming);
    if(!isEl(inc))return classic.focusPress(tl,{outgoing,incoming},at,duration);
    tl.fromTo(outgoing,{scale:1,filter:"blur(0px) brightness(1)"},{scale:1.06,filter:"blur(14px) brightness(0.9)",duration,ease:"power2.inOut"},at);
    tl.fromTo(incoming,{opacity:1,scale:.955,filter:"blur(16px)"},{scale:1,filter:"blur(0px)",duration:duration*.86,ease:"power3.out"},at+duration*.14);
    sceneSoak(tl,inc,at+duration*.08,duration*.8,{to:3.1,ease:"power2.inOut"});
    tl.set(outgoing,{opacity:0,filter:""},at+duration);
    tl.set(incoming,{filter:""},at+duration);
    return tl;
  },

  // 墨边扯页：一整张湿墨版自上而下被扯过画面。前缘积墨湿边 + 垂坠墨滴，
  // 尾部散成干笔飞白 —— 新页先透过飞白丝缝露出来。约 1.0s。
  marginPull(tl,{outgoing,incoming,overlay},at,duration=1){
    const host=one(overlay);
    if(!isEl(host))return classic.marginPull(tl,{outgoing,incoming,overlay},at,duration);
    const {aspect,res}=frameOf(host),seed=Number(host.dataset.seed||23);
    const sheet=mountSheet(host,`margin-pull:${seed}:${res}`,()=>inkSheetCanvas({
      width:res,frameHeight:Math.round(res*aspect),seed,dry:.72,body:1.4,wet:.16}));
    const total=.72+1.4+.16;
    // 满屏覆盖区间：主体顶 ≤ 0 且主体底 ≥ 1 帧高 → yPercent ∈ [(-1.4-.72+1)/total, -.72/total]
    tl.set(host,{opacity:1,y:0,overflow:"hidden",backgroundColor:"transparent",clipPath:"none"},at);
    tl.set(sheet,{visibility:"visible"},at);
    const swapAt=travel(tl,sheet,"yPercent",-100,100*(-.72-.2)/total,100/total,at,duration);
    tl.fromTo(outgoing,{yPercent:0},Object.assign({yPercent:2.6,duration:swapAt-at,ease:"power2.in"},NR),at);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.set(outgoing,{yPercent:0},swapAt);
    tl.fromTo(incoming,{yPercent:-1.2,scale:1.035},Object.assign({yPercent:0,scale:1,duration:at+duration-swapAt,ease:"expo.out"},NR),swapAt);
    tl.set(sheet,{visibility:"hidden"},at+duration);
    tl.set(host,{opacity:0},at+duration);
    return tl;
  },

  // 章节转场 ----------------------------------------------------------------

  // 朱砂规切：朱砂一笔横线划过画面中线，湿朱砂以毛边沿线上下涨满，换页后退回线里，横线收笔离场。
  redRuleCut(tl,{outgoing,incoming,overlay,rule},at,duration=.8){
    const host=one(overlay),line=one(rule);
    if(!isEl(host)||!isEl(line))return classic.redRuleCut(tl,{outgoing,incoming,overlay,rule},at,duration);
    const red=materialURL("red",3);
    host.style.backgroundImage=red;host.style.backgroundSize="512px 512px";
    host.style.setProperty("--pe-tx-mask",bandMaskURL(++serial%4+1));
    setMask(host,"var(--pe-tx-mask)","100% calc(var(--pe-tx-band) * 1%)","50% 50%");
    line.style.backgroundImage=red;
    line.style.setProperty("--pe-tx-mask",brushShapeURL(++serial%5+1,{dry:.3}));
    line.style.setProperty("--pe-tx-edge-mask",edgeMaskURL("ltr",serial%6+1));
    for(const pre of ["","-webkit-"]){
      line.style.setProperty(`${pre}mask-image`,"var(--pe-tx-edge-mask), var(--pe-tx-mask)");
      line.style.setProperty(`${pre}mask-size`,"300% 100%, 100% 100%");
      line.style.setProperty(`${pre}mask-position`,"calc(var(--pe-tx-edge) * 1%) 0%, 0% 0%");
      line.style.setProperty(`${pre}mask-repeat`,"no-repeat");
    }
    line.style.setProperty("mask-composite","intersect");line.style.setProperty("-webkit-mask-composite","source-in");
    const draw=duration*.26,fill=duration*.32,swapAt=at+draw*.6+fill;
    tl.set(line,{opacity:1,scaleX:1,scaleY:2.4,backgroundColor:RED},at);
    tl.fromTo(line,{"--pe-tx-edge":86},Object.assign({"--pe-tx-edge":19,duration:draw,ease:"power3.inOut"},NR),at);
    tl.set(host,{opacity:1,scaleY:1,backgroundColor:RED},at);
    tl.fromTo(host,{"--pe-tx-band":0},Object.assign({"--pe-tx-band":260,duration:fill,ease:"power3.in"},NR),at+draw*.6);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.to(host,{"--pe-tx-band":0,duration:duration*.3,ease:"power3.out"},swapAt+.03);
    tl.fromTo(line,{"--pe-tx-edge":19},Object.assign({"--pe-tx-edge":86,duration:duration*.2,ease:"power2.in"},NR),at+duration*.8);
    tl.set([host,line],{opacity:0},at+duration);
    return tl;
  },

  // 栏栅瀑布：一条条带纸纹的纸条上下交错落下、编织成一面纸墙，换页后继续穿出。
  columnCascade(tl,{outgoing,incoming,columns},at,duration=.9){
    const cols=many(columns);
    if(!cols.length||!isEl(cols[0]))return classic.columnCascade(tl,{outgoing,incoming,columns},at,duration);
    cols.forEach((c,i)=>{
      c.style.backgroundImage=materialURL(i%2?"paper":"paperDeep",i%3+1);c.style.backgroundSize="512px 512px";
      c.style.boxShadow="inset -1px 0 0 rgba(60,48,32,.18), 6px 0 14px rgba(40,30,18,.16)";
    });
    const half=duration*.5,stagger=duration*.045,swapAt=at+half+stagger*(cols.length-1)*.5;
    tl.set(cols,{opacity:1},at);
    tl.fromTo(cols,{yPercent:(i)=>i%2?104:-104,rotation:(i)=>i%2?1.4:-1.4},
      Object.assign({yPercent:0,rotation:0,duration:half,stagger,ease:"power3.in"},NR),at);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.to(cols,{yPercent:(i)=>i%2?-104:104,rotation:(i)=>i%2?-1.2:1.2,duration:duration-half,stagger,ease:"power3.in"},swapAt+.02);
    tl.set(cols,{opacity:0},at+duration+stagger*cols.length);
    return tl;
  },

  // 档案百叶：墨色百叶片从侧立翻平合拢（受光由暗到亮），换页后再翻开 —— 真实的叶片转动。
  archiveShutter(tl,{outgoing,incoming,slats},at,duration=.86){
    const list=many(slats);
    if(!list.length||!isEl(list[0]))return classic.archiveShutter(tl,{outgoing,incoming,slats},at,duration);
    list.forEach((s,i)=>{
      s.style.backgroundImage=`linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.18)),${materialURL("ink",i%3+1)}`;
      s.style.backgroundSize="100% 100%,512px 512px";
      s.style.boxShadow="0 4px 10px rgba(0,0,0,.28)";
    });
    const half=duration*.5,stagger=duration*.03,swapAt=at+half+stagger*list.length;
    tl.set(list,{opacity:1,transformPerspective:900,transformOrigin:"50% 50%"},at);
    tl.fromTo(list,{rotationX:88,filter:"brightness(0.5)"},Object.assign({rotationX:0,filter:"brightness(1)",duration:half,stagger,ease:"power3.inOut"},NR),at);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.to(list,{rotationX:-88,filter:"brightness(1.35)",duration:half,stagger,ease:"power3.inOut"},swapAt+.02);
    tl.set(list,{opacity:0,filter:""},swapAt+.02+half+stagger*list.length);
    return tl;
  },

  // 章节墨桥：一整张湿墨版自左向右横扫，前缘积墨、尾部飞白；旧页缩远，新页由近落定。
  chapterBridge(tl,{outgoing,incoming,overlay},at,duration=1.05){
    const host=one(overlay);
    if(!isEl(host))return classic.chapterBridge(tl,{outgoing,incoming,overlay},at,duration);
    const {aspect,res}=frameOf(host),seed=Number(host.dataset.seed||31);
    const dry=.6,body=1.25,wet=.12,total=dry+body+wet;
    const sheet=mountSheet(host,`chapter-bridge:${seed}:${res}`,()=>orientedInkSheet({rotate:90,
      width:Math.round(res*aspect),frameHeight:res,seed,dry,body,wet}),"x");
    tl.set(host,{opacity:1,x:0,skewX:0,overflow:"hidden",backgroundColor:"transparent"},at);
    tl.set(sheet,{visibility:"visible"},at);
    const swapAt=travel(tl,sheet,"xPercent",-100,100*(-dry-.12)/total,100/total,at,duration);
    tl.fromTo(outgoing,{scale:1},Object.assign({scale:.972,duration:swapAt-at,ease:"power2.in"},NR),at);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.set(outgoing,{scale:1},swapAt);
    tl.fromTo(incoming,{scale:1.03},Object.assign({scale:1,duration:at+duration-swapAt,ease:"expo.out"},NR),swapAt);
    tl.set(sheet,{visibility:"hidden"},at+duration);
    tl.set(host,{opacity:0},at+duration);
    return tl;
  },

  // 点缀转场 ----------------------------------------------------------------

  // 墨扫：一道饱蘸的笔带自左扫过，新页从笔带身后显出（纤维边与笔带同步），旧页被推开。
  inkSweep(tl,{outgoing,incoming},at,duration=.92){
    const inc=one(incoming);
    if(!isEl(inc))return classic.inkSweep(tl,{outgoing,incoming},at,duration);
    const {aspect,res}=frameOf(inc),seed=(++serial)%6+1;
    const dry=.3,body=.1,wet=.05,total=dry+body+wet;
    const band=mountDecor(inc,`ink-sweep:${res}`,()=>{
      const {canvas}=orientedInkSheet({rotate:90,width:Math.round(res*aspect),frameHeight:res,seed:41,dry,body,wet});
      canvas.style.cssText+=`;left:0;top:0;height:100%;width:${total*100}%;display:block`;
      return canvas;
    });
    sceneEdge(inc,seed);
    // 笔带主体中心 x_c = xs·total + dry + body/2（帧宽单位）；遮罩边界 = 1.5 − 2p ⇒ p = (1.5 − x_c)/2。
    const xs0=-1,xs1=1/total,centre=(xs)=>xs*total+dry+body/2;
    const p=(xs)=>(1.5-centre(xs))/2*100;
    tl.set(incoming,{opacity:1},at);
    tl.set(band,{visibility:"visible"},at);
    tl.fromTo(band,{xPercent:xs0*100},Object.assign({xPercent:xs1*100,duration,ease:"power3.inOut"},NR),at);
    tl.fromTo(inc,{"--pe-tx-edge":p(xs0)},{"--pe-tx-edge":p(xs1),duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{xPercent:0,scale:1},Object.assign({xPercent:-3.5,scale:.985,duration,ease:"power2.inOut"},NR),at);
    tl.set(band,{visibility:"hidden"},at+duration);
    tl.set(inc,{"--pe-tx-mask":FULL},at+duration);
    tl.set(outgoing,{opacity:0,xPercent:0,scale:1},at+duration);
    return tl;
  },

  // 撕页：旧页被撕开 —— 撕口露出白色纸浆与翘起的纤维，身后新页带着撕口的投影。
  tearWipe(tl,{outgoing,incoming},at,duration=.84){
    const inc=one(incoming);
    if(!isEl(inc))return classic.tearWipe(tl,{outgoing,incoming},at,duration);
    const {aspect,res}=frameOf(inc),seed=(++serial)%6+1,span=.2;
    const strip=mountDecor(inc,`tear-wipe:${seed}:${res}`,()=>{
      const {canvas}=tornEdgeStrip({seed,frameWidth:res,frameHeight:Math.round(res*aspect),span});
      canvas.style.cssText+=`;left:0;top:0;height:100%;width:${span*100}%;display:block`;
      return canvas;
    });
    sceneEdge(inc,seed,0);
    // 边界 x_e = 1.5 − 2p；撕口条中心对齐边界：xPercent = (x_e − span/2)/span·100。
    const [p0,p1]=[86,19],xp=(p)=>((1.5-2*p/100)-span/2)/span*100;
    tl.set(incoming,{opacity:1},at);
    tl.set(strip,{visibility:"visible"},at);
    tl.fromTo(inc,{"--pe-tx-edge":p0},{"--pe-tx-edge":p1,duration,ease:"power2.inOut"},at);
    tl.fromTo(strip,{xPercent:xp(p0)},Object.assign({xPercent:xp(p1),duration,ease:"power2.inOut"},NR),at);
    tl.fromTo(outgoing,{xPercent:0,rotation:0},Object.assign({xPercent:1.6,rotation:.25,duration,ease:"power2.in"},NR),at);
    tl.set(strip,{visibility:"hidden"},at+duration);
    tl.set(inc,{"--pe-tx-mask":FULL},at+duration);
    tl.set(outgoing,{opacity:0,xPercent:0,rotation:0},at+duration);
    return tl;
  },

  // 对角裁切：裁纸刀斜切（刀口是干净的），一线湿朱砂沿刀口拉过，旧页顺刀口滑落。
  diagonalSlice(tl,{outgoing,incoming,slash},at,duration=.72){
    if(!isEl(one(incoming)))return classic.diagonalSlice(tl,{outgoing,incoming,slash},at,duration);
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0% 0%,0% 0%,-20% 100%,-20% 100%)"},
      {clipPath:"polygon(0% 0%,120% 0%,100% 100%,-20% 100%)",duration,ease:"power4.inOut"},at);
    tl.fromTo(outgoing,{xPercent:0,yPercent:0,scale:1},{xPercent:4.6,yPercent:3.2,scale:.98,duration,ease:"power3.in"},at);
    const s=one(slash);
    if(isEl(s)){
      s.style.backgroundImage=materialURL("red",5);
      s.style.setProperty("--pe-tx-mask",brushShapeURL(++serial%5+1,{dry:.35}));
      setMask(s,"var(--pe-tx-mask)","100% 100%","0% 0%");
      tl.set(s,{opacity:1,scaleY:1.8,backgroundColor:RED},at);
      tl.fromTo(s,{xPercent:-100},Object.assign({xPercent:100,duration,ease:"power4.inOut"},NR),at);
      tl.set(s,{opacity:0},at+duration);
    }
    tl.set(outgoing,{opacity:0,xPercent:0,yPercent:0,scale:1},at+duration);
    tl.set(incoming,{clipPath:""},at+duration);
    return tl;
  },

  // 墨圈聚焦：一滴墨落在画面主体上，沿纸纤维不规则地洇开成新页；旧页随之压暗推远。
  inkIris(tl,{outgoing,incoming},at,duration=.9){
    const inc=one(incoming);
    if(!isEl(inc))return classic.inkIris(tl,{outgoing,incoming},at,duration);
    tl.set(incoming,{opacity:1},at);
    tl.fromTo(incoming,{scale:1.05},{scale:1,duration,ease:"power3.out"},at);
    sceneSoak(tl,inc,at,duration,{cx:.52,cy:.48,to:3.2,ease:"power3.in"});
    tl.fromTo(outgoing,{scale:1,filter:"brightness(1) blur(0px)"},{scale:1.035,filter:"brightness(0.72) blur(4px)",duration,ease:"power2.in"},at);
    tl.set(outgoing,{opacity:0,scale:1,filter:""},at+duration);
    return tl;
  },

  // 纸页折合：旧页沿左缘折起，折面随角度变暗；新页早已在下面，被折起的纸投下一道移动的影子。
  paperFold(tl,{outgoing,incoming},at,duration=.84){
    const out=one(outgoing),inc=one(incoming);
    if(!isEl(out)||!isEl(inc))return classic.paperFold(tl,{outgoing,incoming},at,duration);
    const shade=mountDecor(out,`paper-fold-shade`,()=>{const d=document.createElement("div");d.style.inset="0";return d});
    // 折面暗部作为旧页的子层才能跟着旋转；投影放在新页之上、旧页之下。
    if(shade.parentElement!==out){out.appendChild(shade);shade.style.background="linear-gradient(90deg,rgba(20,16,10,.1),rgba(20,16,10,.6))";}
    const cast=mountDecor(inc,`paper-fold-cast`,()=>{const d=document.createElement("div");d.style.inset="0";
      d.style.background="linear-gradient(90deg,rgba(24,18,10,.45),rgba(24,18,10,.18) 40%,rgba(24,18,10,0) 75%)";d.style.transformOrigin="0% 50%";return d});
    cast.style.zIndex="4";
    // 折起的旧页必须压在新页之上，投影夹在两者之间。
    tl.set(outgoing,{zIndex:5},at);
    tl.set(incoming,{opacity:1},at);
    tl.set([shade,cast],{visibility:"visible"},at);
    tl.fromTo(incoming,{scale:.97},{scale:1,duration,ease:"power2.out"},at);
    tl.fromTo(outgoing,{rotationY:0,transformPerspective:1600,transformOrigin:"0% 50%"},
      {rotationY:-90,duration,ease:"power2.in"},at);
    tl.fromTo(shade,{opacity:0},{opacity:1,duration,ease:"power2.in"},at);
    tl.fromTo(cast,{scaleX:1,opacity:.9},{scaleX:.02,opacity:.3,duration,ease:"power2.in"},at);
    tl.set([shade,cast],{visibility:"hidden"},at+duration);
    tl.set(outgoing,{opacity:0,rotationY:0,zIndex:""},at+duration);
    return tl;
  },

  // 印章盖页：一方巨印悬空压下（先是虚化朱影），接触瞬间印泥不均匀地转印、迅速压实，
  // 换页后印面带着纸纤维揭起离场。
  stampCover(tl,{outgoing,incoming,overlay},at,duration=.92){
    const host=one(overlay);
    if(!isEl(host))return classic.stampCover(tl,{outgoing,incoming,overlay},at,duration);
    host.style.backgroundImage=materialURL("red",7);host.style.backgroundSize="512px 512px";
    const rim=Math.min(host.offsetWidth||1920,host.offsetHeight||1080);
    host.style.boxShadow=`inset 0 0 0 ${rim*.045}px ${RED}, inset 0 0 0 ${rim*.06}px ${PAPER_LIGHT}`;
    host.__peSeal??=sealInkFilter({seed:++serial,color:RED,frequency:.035,roughness:5});
    const f=host.__peSeal,air=duration*.3,press=duration*.18,swapAt=at+air+press;
    tl.set(host,{opacity:1,x:0,y:0,yPercent:0,xPercent:0,backgroundColor:RED,filter:f.url,transformOrigin:"50% 50%"},at);
    tl.fromTo(host,{autoAlpha:0,scale:1.7,rotation:-7},{autoAlpha:.26,scale:1.1,rotation:-2,duration:air,ease:"power3.in"},at);
    tl.fromTo(f.blur,{attr:{stdDeviation:18}},Object.assign({attr:{stdDeviation:4},duration:air,ease:"power2.in"},NR),at);
    tl.fromTo(f.cover,{attr:{intercept:1}},Object.assign({attr:{intercept:1},duration:air},NR),at);
    tl.set(host,{autoAlpha:1},at+air);
    tl.set(f.blur,{attr:{stdDeviation:0}},at+air);
    tl.fromTo(f.cover,{attr:{intercept:-3.4}},Object.assign({attr:{intercept:1.2},duration:press,ease:"power2.out"},NR),at+air);
    tl.fromTo(host,{scale:1.1},Object.assign({scale:1.07,duration:.06,ease:"power2.out"},NR),at+air);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.to(host,{yPercent:-115,xPercent:18,rotation:8,scale:1.14,duration:at+duration-swapAt,ease:"power3.in"},swapAt+.02);
    tl.set(host,{opacity:0,filter:"",yPercent:0,xPercent:0,rotation:0,scale:1},at+duration);
    return tl;
  },

  // 纸叠飞页：几张带纸纹与投影的档案纸自右侧斜飞入、层层压上，换页后向左掀走。
  paperStack(tl,{outgoing,incoming,sheets},at,duration=.95){
    const list=many(sheets);
    if(!list.length||!isEl(list[0]))return classic.paperStack(tl,{outgoing,incoming,sheets},at,duration);
    list.forEach((s,i)=>{
      s.style.backgroundImage=materialURL(i%2?"paperDeep":"paper",i+2);s.style.backgroundSize="512px 512px";
      s.style.boxShadow="-18px 14px 36px rgba(40,30,18,.28)";
    });
    const stagger=duration*.08,swapAt=at+duration*.48+stagger*(list.length-1);
    tl.set(list,{opacity:1,transformPerspective:2000},at);
    tl.fromTo(list,{xPercent:112,yPercent:(i)=>6+i*3,rotation:(i)=>i%2?4:-3,rotationY:-14},
      Object.assign({xPercent:0,yPercent:0,rotation:(i)=>(i-1)*.6,rotationY:0,duration:duration*.48,stagger,ease:"power3.out"},NR),at);
    setSwap(tl,outgoing,incoming,swapAt);
    tl.to(list,{xPercent:-115,yPercent:-8,rotation:-5,rotationY:12,duration:duration*.42,stagger:stagger*.8,ease:"power3.in"},swapAt+.02);
    tl.set(list,{opacity:0},at+duration+stagger*list.length);
    return tl;
  },

  // 墨浸：画面像被浸进墨里 —— 墨沿纸纤维自下而上吸满，谷底一线朱砂划过，
  // 换页后墨继续上行、从飞白里放出新页。
  inkDip(tl,{outgoing,incoming,overlay,flash},at,duration=1){
    const host=one(overlay);
    if(!isEl(host))return classic.inkDip(tl,{outgoing,incoming,overlay,flash},at,duration);
    const {aspect,res}=frameOf(host),seed=Number(host.dataset.seed||47);
    const dry=.55,body=1.3,wet=.14,total=dry+body+wet;
    const sheet=mountSheet(host,`ink-dip:${seed}:${res}`,()=>orientedInkSheet({rotate:180,
      width:res,frameHeight:Math.round(res*aspect),seed,dry,body,wet,drips:false}));
    // 旋转 180° 后前缘在上：主体占 [wet, wet+body]（自顶向下），yPercent 从 +1 帧高（在下方）走到 −total。
    tl.set(host,{opacity:1,overflow:"hidden",backgroundColor:"transparent"},at);
    tl.set(sheet,{visibility:"visible"},at);
    const from=100/total,to=-100,swap=100*(-wet-.15)/total;
    const swapAt=travel(tl,sheet,"yPercent",from,swap,to,at,duration);
    const f=one(flash);
    if(isEl(f)){
      f.style.backgroundImage=materialURL("red",9);
      f.style.setProperty("--pe-tx-mask",brushShapeURL(++serial%5+1,{dry:.3}));
      setMask(f,"var(--pe-tx-mask)","100% 100%","0% 0%");
      tl.set(f,{opacity:1,scaleX:1,scaleY:2,backgroundColor:RED},swapAt-.1);
      tl.fromTo(f,{xPercent:-100},Object.assign({xPercent:100,duration:.3,ease:"power2.inOut"},NR),swapAt-.1);
      tl.set(f,{opacity:0},swapAt+.2);
    }
    setSwap(tl,outgoing,incoming,swapAt);
    tl.fromTo(incoming,{scale:1.02},Object.assign({scale:1,duration:at+duration-swapAt,ease:"expo.out"},NR),swapAt);
    tl.set(sheet,{visibility:"hidden"},at+duration);
    tl.set(host,{opacity:0},at+duration);
    return tl;
  }
};

// 旧版（v2.3）预设与元数据，签名一致。
export const paperEditorialTransitionsClassic=classic;
export const paperEditorialTransitionMetaClassic=classicMeta;

export const paperEditorialTransitionMeta={
  roles:{
    primary:["paper-push","folio-rise","focus-press","margin-pull"],
    section:["red-rule-cut","column-cascade","archive-shutter","chapter-bridge"],
    accent:["ink-sweep","tear-wipe","diagonal-slice","ink-iris","paper-fold","stamp-cover","paper-stack","ink-dip"]
  },
  presets:{
    "paper-push":{label:"纸页推进",duration:.8,parts:["outgoing","incoming"],use:"新页如纸滑入放平，前缘投影压住旧页，旧页视差后退压暗"},
    "folio-rise":{label:"对开升起",duration:.82,parts:["outgoing","incoming"],use:"新页自下翻起放平，旧页推上缩远；有序步骤、纵向推进"},
    "focus-press":{label:"焦点压合",duration:.86,parts:["outgoing","incoming"],use:"旧页失焦推远，新页如墨滴自纸心洇开并收焦"},
    "margin-pull":{label:"墨边扯页",duration:1,parts:["outgoing","incoming","overlay"],use:"湿墨版纵向扯过：积墨前缘垂坠墨滴，尾部散成干笔飞白，新页从丝缝里透出"},
    "red-rule-cut":{label:"朱砂规切",duration:.8,parts:["outgoing","incoming","overlay","rule"],use:"朱砂一笔划过中线，湿朱砂毛边上下涨满，换页后退回线里"},
    "column-cascade":{label:"栏栅瀑布",duration:.9,parts:["outgoing","incoming","columns"],use:"带纸纹的纸条上下交错落下编成纸墙，换页后穿出"},
    "archive-shutter":{label:"档案百叶",duration:.86,parts:["outgoing","incoming","slats"],use:"墨色百叶片翻平合拢、受光由暗到亮，换页后再翻开"},
    "chapter-bridge":{label:"章节墨桥",duration:1.05,parts:["outgoing","incoming","overlay"],use:"湿墨版自左横扫，积墨前缘、飞白尾迹；旧页缩远，新页落定"},
    "ink-sweep":{label:"墨扫",duration:.92,parts:["outgoing","incoming"],use:"饱蘸的笔带自左扫过，新页从笔带身后以纤维边显出"},
    "tear-wipe":{label:"撕页",duration:.84,parts:["outgoing","incoming"],use:"旧页被撕开：白色纸浆与翘起纤维，新页上带撕口投影"},
    "diagonal-slice":{label:"对角裁切",duration:.72,parts:["outgoing","incoming","slash"],use:"裁纸刀斜切，一线湿朱砂沿刀口拉过，旧页顺刀口滑落"},
    "ink-iris":{label:"墨圈聚焦",duration:.9,parts:["outgoing","incoming"],use:"一滴墨落在主体上，沿纤维不规则洇开成新页"},
    "paper-fold":{label:"纸页折合",duration:.84,parts:["outgoing","incoming"],use:"旧页沿左缘折起、折面变暗，新页上投下移动的折影"},
    "stamp-cover":{label:"印章盖页",duration:.92,parts:["outgoing","incoming","overlay"],use:"巨印压下，印泥不均转印后压实，换页后揭起离场"},
    "paper-stack":{label:"纸叠飞页",duration:.95,parts:["outgoing","incoming","sheets"],use:"档案纸斜飞入层层压上，换页后向左掀走"},
    "ink-dip":{label:"墨浸",duration:1,parts:["outgoing","incoming","overlay","flash"],use:"墨沿纤维自下而上吸满，谷底一线朱砂，换页后从飞白放出新页"}
  }
};
