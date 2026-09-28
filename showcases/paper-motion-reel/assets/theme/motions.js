// paper-editorial 3.0 motions — every preset is a material event (ink soaking, brush strokes,
// seal ink transfer, paper landing), built once at timeline-construction time and driven only
// by the timeline clock. Signatures match v2.3; the old presets stay in ./classic/motions.js.
import {paperEditorialMotions as classic} from "./classic/motions.js";
import {brushShapeURL,edgeMaskURL,hasDOM,motionBlurFilter,sealInkFilter,soakMaskURL,wetInkFilter} from "./paper-kit.js";

const INK="#20262c",RED="#b83b2f";
const NR={immediateRender:false};
// 遮罩收尾一律换成不透明渐变而不是 none：Chrome 在 var() 驱动的 mask-image 切到 none 时
// 不会重绘该元素（整块内容消失，只剩自带遮罩的子元素）。
const FULL="linear-gradient(#000,#000)";
const OPPOSITE={ltr:"rtl",rtl:"ltr",ttb:"btt",btt:"ttb"};
const resolve=(target)=>typeof target==="string"&&hasDOM?[...document.querySelectorAll(target)]:
  target?.length!==undefined&&typeof target!=="string"?[...target]:[target];
const elements=(target)=>hasDOM?resolve(target).filter((el)=>el instanceof Element):[];
let motionSeed=0;
const nextSeed=()=>++motionSeed*7+3;

// 建轴时测一次字面外框（元素本地像素，已抵消祖先缩放）。不在补间中测量。
const textFrame=(el)=>{
  const box=el.getBoundingClientRect(),k=box.width?el.offsetWidth/box.width:1;
  const range=document.createRange();range.selectNodeContents(el);
  const text=range.getBoundingClientRect();
  const w=(text.width||box.width)*k,h=(text.height||box.height)*k;
  const cx=((text.width?text.left:box.left)-box.left)*k+w/2,cy=((text.height?text.top:box.top)-box.top)*k+h/2;
  return {cx,cy,span:Math.max(w,h)};
};
const inkOf=(el)=>getComputedStyle(el).color||INK;
const redOf=(el)=>{
  const cs=getComputedStyle(el),parent=el.parentElement?getComputedStyle(el.parentElement):null;
  const candidates=[cs.backgroundColor,parseFloat(cs.borderTopWidth)?cs.borderTopColor:null,parent?.backgroundColor,cs.color];
  let best=RED,score=40;
  for(const c of candidates){
    const m=/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/.exec(c||"");
    if(!m||m[4]==="0")continue;
    const s=Number(m[1])-(Number(m[2])+Number(m[3]))/2;
    if(s>score){score=s;best=c}
  }
  return best;
};
const setMask=(el,{images,sizes,positions,composite})=>{
  const s=el.style;
  for(const pre of ["","-webkit-"]){
    s.setProperty(`${pre}mask-image`,images);s.setProperty(`${pre}mask-size`,sizes);
    s.setProperty(`${pre}mask-position`,positions);s.setProperty(`${pre}mask-repeat`,"no-repeat");
  }
  if(composite){s.setProperty("mask-composite","intersect");s.setProperty("-webkit-mask-composite","source-in")}
};

// ---------- 原语 ----------

// 纤维边揭示：一条带纤维毛边的边界扫过元素。direction 为最先显出的一侧；hide 反向吞掉。
// 静止态由 immediateRender 在建轴时写入（遮罩在起点即完全遮住），结束后撤掉遮罩。
function edgeReveal(tl,el,t,{direction="ltr",duration=.66,ease="power3.inOut",hide=false,keep=false}={}){
  const dir=hide?OPPOSITE[direction]:direction;
  const horizontal=dir==="ltr"||dir==="rtl";
  // 300% 遮罩的边界位置 = 1.5 − 2p（元素宽度单位）。毛边振幅+纤维+羽化约 0.2 个元素宽，
  // 所以 p 只在 86 ↔ 19 之间走：边界从刚好藏在元素外开始，刚好离开元素时结束，不浪费时长。
  const hidden=dir==="ltr"||dir==="ttb"?86:14,shown=100-hidden;
  el.style.setProperty("--pe-mask-a",edgeMaskURL(dir,nextSeed()%6+1));
  setMask(el,{images:"var(--pe-mask-a)",sizes:horizontal?"300% 100%":"100% 300%",
    positions:horizontal?"calc(var(--pe-edge) * 1%) 0%":"0% calc(var(--pe-edge) * 1%)"});
  const [a,b]=hide?[shown,hidden]:[hidden,shown];
  tl.fromTo(el,{"--pe-edge":a},{"--pe-edge":b,duration,ease},t);
  if(!keep&&!hide)tl.set(el,{"--pe-mask-a":FULL},t+duration);
  return tl;
}

// 毛笔行笔：笔锋边界沿行笔方向推进，笔形（顿笔、提按、飞白收尾）作为第二层遮罩常驻。
function brushStroke(tl,el,t,{direction="ltr",duration=.95,ease="power3.inOut",dry=.26}={}){
  const flip=direction==="rtl";
  el.style.setProperty("--pe-mask-a",edgeMaskURL(direction,nextSeed()%6+1));
  el.style.setProperty("--pe-mask-b",brushShapeURL(nextSeed()%5+1,{dry,flip}));
  setMask(el,{images:"var(--pe-mask-a), var(--pe-mask-b)",sizes:"300% 100%, 100% 100%",
    positions:"calc(var(--pe-edge) * 1%) 0%, 0% 0%",composite:true});
  const [a,b]=flip?[14,81]:[86,19];
  tl.fromTo(el,{"--pe-edge":a,scaleX:1},{"--pe-edge":b,duration,ease},t);
  // 笔毫压下再提起：行笔前段略粗，末段收细。
  tl.fromTo(el,{scaleY:1.22},Object.assign({scaleY:1,duration:duration*.9,ease:"power2.out"},NR),t);
  tl.set(el,{"--pe-mask-a":FULL},t+duration);
  return tl;
}

// 湿墨定形：字形先晕成墨团，再随墨被纸吸干收紧为锐边，外圈墨晕渗开后干透。
function wetSettle(tl,el,t,{duration=.8,soft=10,goo=15,warp=26,halo=.6,haloBlur=18,color}={}){
  const wet=wetInkFilter({seed:nextSeed(),color:color||inkOf(el)});
  const k=duration/.8;
  tl.set(el,{filter:wet.url},t);
  if(soft){
    tl.fromTo(wet.soft,{attr:{stdDeviation:soft}},Object.assign({attr:{stdDeviation:0},duration:.6*k,ease:"power2.out"},NR),t);
    tl.fromTo(wet.gooAlpha,{attr:{slope:goo,intercept:-(goo-1)*.39}},Object.assign({attr:{slope:1,intercept:0},duration:.6*k,ease:"power2.out"},NR),t);
  }
  if(warp)tl.fromTo(wet.warp,{attr:{scale:warp}},Object.assign({attr:{scale:0},duration:.72*k,ease:"power3.out"},NR),t);
  if(halo){
    tl.fromTo(wet.haloAlpha,{attr:{slope:0}},Object.assign({attr:{slope:halo},duration:.18*k,ease:"power2.out"},NR),t+.1*k);
    tl.to(wet.haloAlpha,{attr:{slope:0},duration:.52*k,ease:"power2.inOut"},t+.28*k);
    tl.fromTo(wet.haloBlur,{attr:{stdDeviation:2}},Object.assign({attr:{stdDeviation:haloBlur},duration:.7*k,ease:"power2.out"},NR),t+.1*k);
  }
  tl.set(el,{filter:""},t+duration);
  return wet;
}

// 墨团渗开：以字面中心为圆心，纤维毛边的圆形墨团向外吸开。
function soak(tl,el,t,{duration=.72,from=.18,to=2.7,ease="power1.out"}={}){
  const {cx,cy,span}=textFrame(el);
  el.style.setProperty("--pe-mask-a",soakMaskURL(nextSeed()%5+1));
  const size=`calc(var(--pe-soak) * ${span}px)`;
  setMask(el,{images:"var(--pe-mask-a)",sizes:`${size} ${size}`,
    positions:`calc(${cx}px - var(--pe-soak) * ${span/2}px) calc(${cy}px - var(--pe-soak) * ${span/2}px)`});
  tl.fromTo(el,{"--pe-soak":from},{"--pe-soak":to,duration,ease},t);
  tl.set(el,{"--pe-mask-a":FULL},t+duration);
  return tl;
}

// 落印：印面悬空时是一团虚化的朱影，接触瞬间印泥不均匀地转印，压实后留下带微小缺墨的印痕，
// 朱砂向纸纤维渗出。o.keep=false 时结束后撤掉印泥滤镜（默认保留印痕质感）。
// 覆盖阈值：分形噪声集中在 0.5 附近，intercept −3.6 ≈ 三成着墨（接触瞬间），−0.9 ≈ 只剩零星缺墨。
function sealImpress(tl,el,t,{rotFrom=-10,rotTo,scaleFrom=1.45,air=.24,color,keep=true,final=-.9}={}){
  const f=sealInkFilter({seed:nextSeed(),color:color||redOf(el)});
  const rot=rotTo===undefined?(Number(el.dataset.rotation)||0):rotTo;
  tl.set(el,{filter:f.url},t);
  tl.fromTo(el,{autoAlpha:0,scale:scaleFrom,rotation:rotFrom,transformOrigin:"50% 50%"},
    {autoAlpha:.34,scale:1.03,rotation:rot,duration:air,ease:"power3.in"},t);
  tl.fromTo(f.blur,{attr:{stdDeviation:9}},Object.assign({attr:{stdDeviation:2.5},duration:air,ease:"power2.in"},NR),t);
  tl.fromTo(f.cover,{attr:{intercept:1}},Object.assign({attr:{intercept:1},duration:air},NR),t);
  // 接触
  tl.set(el,{autoAlpha:1},t+air);
  tl.set(f.blur,{attr:{stdDeviation:0}},t+air);
  tl.fromTo(f.cover,{attr:{intercept:-3.6}},Object.assign({attr:{intercept:final},duration:.22,ease:"power2.out"},NR),t+air);
  tl.fromTo(el,{scale:1.03},Object.assign({scale:.968,duration:.06,ease:"power2.out"},NR),t+air);
  tl.to(el,{scale:1,duration:.22,ease:"power2.out"},t+air+.06);
  tl.fromTo(f.haloAlpha,{attr:{slope:0}},Object.assign({attr:{slope:.55},duration:.12,ease:"power2.out"},NR),t+air);
  tl.to(f.haloAlpha,{attr:{slope:0},duration:.7,ease:"power2.inOut"},t+air+.14);
  tl.fromTo(f.haloBlur,{attr:{stdDeviation:1.5}},Object.assign({attr:{stdDeviation:16},duration:.84,ease:"power2.out"},NR),t+air);
  if(!keep)tl.set(el,{filter:""},t+air+.9);
  return t+air;
}

// 纸落定：纸页带着空气垫落下 —— 前倾的纸面放平，投影由散到实。
function paperLand(tl,el,t,{y=72,x=0,tilt=14,duration=.78}={}){
  tl.fromTo(el,{autoAlpha:0,x,y,rotationX:tilt,rotation:x?0:.7,scale:.985,transformPerspective:1400,transformOrigin:"50% 100%",
    boxShadow:"0px 40px 46px rgba(40,32,22,0.20)"},
    {autoAlpha:1,x:0,y:0,rotationX:0,rotation:0,scale:1,boxShadow:"0px 2px 3px rgba(40,32,22,0.10)",duration,ease:"expo.out"},t);
  tl.to(el,{boxShadow:"0px 0px 0px rgba(40,32,22,0)",duration:.22,ease:"power1.out"},t+duration);
  tl.set(el,{boxShadow:""},t+duration+.22);
  return tl;
}

const driveMaterial=(tl,controller,at,fallback,o={})=>{
  const duration=o.duration||controller.duration||fallback;
  const state={time:0};
  return tl.to(state,{time:duration,duration,ease:"none",
    onUpdate:()=>controller.render?.(state.time)},at);
};

export const paperEditorialMotions={
  // A 文字 ------------------------------------------------------------------

  // 墨定标题：墨落在纸上被吸进去。湿墨团自中心沿纤维渗开 → 字形从墨团收紧为实边 →
  // 击打下沉并压实回弹 → 外圈墨晕向外吸散并干透。约 0.96s。
  inkSlam(tl,target,at=0,o={}){
    const els=elements(target);
    if(!els.length)return classic.inkSlam(tl,target,at);
    const d=o.duration===undefined?.96:o.duration,k=d/.96;
    els.forEach((el,i)=>{
      const t=at+(o.stagger||0)*i;
      tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.12*k,ease:"power1.out"},t);
      soak(tl,el,t,{duration:.72*k});
      tl.fromTo(el,{scale:1.075,y:-12,transformOrigin:"50% 60%"},
        Object.assign({scale:.982,y:2,duration:.36*k,ease:"power3.in"},NR),t);
      tl.to(el,{scale:1,y:0,duration:.42*k,ease:"power2.out"},t+.36*k);
      wetSettle(tl,el,t,{duration:d,soft:10,goo:15,warp:26,halo:.62,color:o.color});
    });
    return tl;
  },

  // 定行：墨从基线向上吃进纸里 —— 纤维边自下而上打开，笔画先微晕再收锐，可级联。
  lineSet(tl,target,at=0,o={}){
    const els=elements(target);
    if(!els.length)return classic.lineSet(tl,target,at,o);
    const d=o.duration===undefined?.72:o.duration,rise=o.rise===undefined?0:o.rise,blur=o.blur===undefined?5:o.blur;
    els.forEach((el,i)=>{
      const t=at+(o.stagger||0)*i;
      tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.1,ease:"none"},t);
      edgeReveal(tl,el,t,{direction:"btt",duration:d,ease:o.ease||"power3.out"});
      if(rise)tl.fromTo(el,{y:rise},Object.assign({y:0,duration:d,ease:o.ease||"expo.out"},NR),t);
      if(blur)wetSettle(tl,el,t,{duration:d,soft:blur*.8,goo:7,warp:12,halo:.34,haloBlur:12});
    });
    return tl;
  },

  // 页眉更替：细纤维边自左拭入，元数据只轻移不跳动。
  folioSwap(tl,target,at=0){
    const els=elements(target);
    if(!els.length)return classic.folioSwap(tl,target,at);
    els.forEach((el)=>{
      tl.fromTo(el,{autoAlpha:0,y:-8},{autoAlpha:1,y:0,duration:.42,ease:"power2.out"},at);
      edgeReveal(tl,el,at,{direction:"ltr",duration:.46,ease:"power2.inOut"});
    });
    return tl;
  },

  // 背景水印落定：大号淡墨像被水洇开，缓慢渗出轮廓后安静落定。
  ghostSettle(tl,target,at=0){
    const els=elements(target);
    if(!els.length)return classic.ghostSettle(tl,target,at);
    els.forEach((el)=>{
      tl.fromTo(el,{autoAlpha:0,x:40},{autoAlpha:1,x:0,duration:1.3,ease:"power3.out"},at);
      soak(tl,el,at,{duration:1.2,from:.3,to:2.8,ease:"power2.out"});
      wetSettle(tl,el,at,{duration:1.3,soft:14,goo:6,warp:30,halo:.25,haloBlur:26});
    });
    return tl;
  },

  // 引文揭示：纸条落定 → 引文逐行吃墨 → 出处以细纤维边拭入。
  quoteReveal(tl,root,at=0){
    if(!hasDOM)return classic.quoteReveal(tl,root,at);
    const [box]=elements(root);if(!box)return tl;
    paperLand(tl,box,at,{x:-30,y:0,tilt:0,duration:.6});
    const quote=box.querySelector("blockquote"),cite=box.querySelector("cite");
    if(quote)paperEditorialMotions.lineSet(tl,quote,at+.1,{rise:18,duration:.8});
    if(cite){tl.fromTo(cite,{autoAlpha:0},{autoAlpha:1,duration:.1},at+.52);edgeReveal(tl,cite,at+.52,{duration:.5,ease:"power2.out"})}
    return tl;
  },

  // 导语飞行：同一节点从引导页飞进作品页页眉。x 与 y 用不同缓动，路径成一道弧而不是直线。
  // 配套契约：作品窗必须等到 at+duration 之后才允许出场。
  slateFlight(tl,legs,at=0,duration=.86,ease="power3.inOut"){
    if(!legs||typeof legs[Symbol.iterator]!=="function")return tl;
    for(const [sel,leg] of legs){
      if(leg.from)tl.set(sel,leg.from,0);
      const {y,...rest}=leg.to||{};
      tl.to(sel,Object.assign({},rest,{duration,ease:"expo.inOut"}),at);
      if(y!==undefined)tl.to(sel,{y,duration,ease},at);
    }
    return tl;
  },

  // B 线与条 ----------------------------------------------------------------

  // 证据绘条：一笔毛笔横画 —— 顿笔起、中段行、飞白收。
  barDraw(tl,target,at=0,origin="left center"){
    const els=elements(target);
    if(!els.length)return classic.barDraw(tl,target,at,origin);
    const direction=String(origin).startsWith("right")?"rtl":"ltr";
    els.forEach((el)=>brushStroke(tl,el,at,{direction,duration:1.02}));
    return tl;
  },

  // 批注下划线：朱砂细笔快速一挑，收笔带一点飞白。
  underlineDraw(tl,target,at=0,origin="left center"){
    const els=elements(target);
    if(!els.length)return classic.underlineDraw(tl,target,at,origin);
    const direction=String(origin).startsWith("right")?"rtl":"ltr";
    els.forEach((el)=>brushStroke(tl,el,at,{direction,duration:.56,ease:"power2.inOut",dry:.2}));
    return tl;
  },

  // 度支谱入账：刻度逐齿点下（带墨珠回弹），账目逐行吃墨入账。
  ledgerStrike(tl,root,at=0,o={}){
    if(!hasDOM)return classic.ledgerStrike(tl,root,at,o);
    const ticks=elements(`${root} .pe-ticks i`);
    tl.fromTo(ticks,{scaleY:0,transformOrigin:"top center"},
      {scaleY:1,duration:.34,stagger:o.tickStagger===undefined?.018:o.tickStagger,ease:"back.out(2.6)"},at);
    paperEditorialMotions.lineSet(tl,`${root} .pe-ledger-row`,at+(o.lead===undefined?.2:o.lead),
      {stagger:o.stagger===undefined?.09:o.stagger,duration:o.duration===undefined?.6:o.duration,rise:10});
    return tl;
  },

  // 朱红横带：一刀湿朱砂横拉过画面，毛边前缘；文字随后吃墨入场。全画面唯一饱和色，用一次。
  barPull(tl,root,at=0,o={}){
    if(!hasDOM)return classic.barPull(tl,root,at,o);
    const [bar]=elements(`${root} .pe-bar`);if(!bar)return tl;
    const d=o.duration===undefined?.8:o.duration;
    tl.fromTo(bar,{autoAlpha:0},{autoAlpha:1,duration:.05},at);
    edgeReveal(tl,bar,at,{direction:"ltr",duration:d,ease:"power3.inOut"});
    tl.fromTo(bar,{scaleY:1.18,transformOrigin:"50% 50%"},Object.assign({scaleY:1,duration:d,ease:"power2.out"},NR),at);
    const words=elements(`${root} .pe-bar b, ${root} .pe-bar em`);
    words.forEach((w,i)=>{
      const t=at+d+.1+i*.12;
      tl.fromTo(w,{autoAlpha:0,x:-18},{autoAlpha:1,x:0,duration:.5,ease:"power3.out"},t);
      edgeReveal(tl,w,t,{duration:.5,ease:"power2.out"});
    });
    return tl;
  },

  // C 印 --------------------------------------------------------------------

  // 落印：印面斜着砸下，接触时印泥不均匀转印，压实回弹，朱砂向纸里渗。
  stampImpact(tl,target,at=0){
    const els=elements(target);
    if(!els.length)return classic.stampImpact(tl,target,at);
    els.forEach((el)=>sealImpress(tl,el,at,{rotFrom:-12,rotTo:-3,scaleFrom:1.8,air:.26}));
    return tl;
  },

  // 印面落定：纵向盖下（无旋转），印泥转印 + 压实 + 可选墨晕扩散（o.bloom）。
  sealPress(tl,target,at=0,o={}){
    const els=elements(target);
    if(!els.length)return classic.sealPress(tl,target,at,o);
    const air=o.drop===undefined?.3:o.drop*.66;
    let contact=at+air;
    els.forEach((el)=>{contact=sealImpress(tl,el,at,{rotFrom:0,rotTo:0,scaleFrom:1.35,air})});
    if(o.bloom)tl.fromTo(o.bloom,{scale:.25,opacity:.7},
      Object.assign({scale:2.4,opacity:0,duration:o.bloomDuration||1.25,ease:"power2.out"},NR),contact);
    return tl;
  },

  // 印谱累积：一组朱印逐枚盖下。印泥滤镜作用在内层 .end-seal-in 上，
  // 外层 .end-seal 的独立倾角（CSS transform）保持不动。
  sealSheet(tl,target,at=0,o={}){
    const outer=elements(target);
    if(!outer.length)return classic.sealSheet(tl,target,at,o);
    const inner=elements(o.inner||".end-seal-in");
    const stagger=o.stagger===undefined?.12:o.stagger,spin=o.spin===undefined?-6:o.spin;
    outer.forEach((el,i)=>{
      const t=at+i*stagger,face=inner[i]||el;
      tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.01},t);
      sealImpress(tl,face,t,{rotFrom:spin*(i%2?-1:1),rotTo:0,scaleFrom:o.fromScale===undefined?1.6:o.fromScale,air:.2});
    });
    return tl;
  },

  // 朱砂点题：墨色被朱砂浸透 —— 颜色转红的同时朱砂向外渗晕，数字轻压回弹。
  redResultEmphasis(tl,target,at=0){
    const els=elements(target);
    if(!els.length)return classic.redResultEmphasis(tl,target,at);
    els.forEach((el)=>{
      tl.fromTo(el,{color:INK,scale:.92},{color:RED,scale:1.045,duration:.34,ease:"power2.out"},at);
      tl.to(el,{scale:1,duration:.3,ease:"power2.out"},at+.34);
      wetSettle(tl,el,at,{duration:.9,soft:0,warp:8,halo:.7,haloBlur:22,color:RED});
    });
    return tl;
  },

  // D 版面与容器 -------------------------------------------------------------

  // 纸面升起：纸页带空气垫落下，前倾放平，投影由散到实，可级联。
  paperRise(tl,target,at=0,stagger=0){
    const els=elements(target);
    if(!els.length)return classic.paperRise(tl,target,at,stagger);
    els.forEach((el,i)=>paperLand(tl,el,at+i*stagger));
    return tl;
  },

  // 级联清单：每行像纸条滑入，前缘纤维毛边随行揭开。
  cascadeList(tl,target,at=0,stagger=.07){
    const els=elements(target);
    if(!els.length)return classic.cascadeList(tl,target,at,stagger);
    els.forEach((el,i)=>{
      const t=at+i*stagger;
      tl.fromTo(el,{autoAlpha:0,x:-64},{autoAlpha:1,x:0,duration:.58,ease:"expo.out"},t);
      edgeReveal(tl,el,t,{duration:.5,ease:"power3.out"});
    });
    return tl;
  },

  // 版面拭入：纤维毛边扫过版面，内容带微弱景深落定。支持四方向。
  editorialWipe(tl,target,at=0,direction="ltr"){
    const els=elements(target);
    if(!els.length)return classic.editorialWipe(tl,target,at,direction);
    els.forEach((el)=>{
      edgeReveal(tl,el,at,{direction:OPPOSITE[direction]?direction:"ltr",duration:.72});
      tl.fromTo(el,{scale:1.018},Object.assign({scale:1,duration:.9,ease:"power2.out"},NR),at);
    });
    return tl;
  },

  // 作品窗浮出：媒体面绝不用 clip-path/mask 揭示（被裁剪的 <video> 会停止合成）。
  // 改为"显影"：虚焦、过曝、低饱和一起收回，像相纸在显影液里浮出。
  windowSurface(tl,target,at=0,o={}){
    const scale=o.scale===undefined?1.035:o.scale,blur=o.blur===undefined?10:o.blur;
    return tl.fromTo(target,
      {autoAlpha:0,scale,filter:`blur(${blur}px) brightness(1.2) saturate(0.55)`},
      {autoAlpha:1,scale:1,filter:"blur(0px) brightness(1) saturate(1)",duration:o.duration===undefined?.9:o.duration,ease:o.ease||"power3.out"},at);
  },

  // 对照双栏：分栏格自上而下以纤维边展开，两侧条目逐行吃墨。
  comparePair(tl,root,at=0,o={}){
    if(!hasDOM)return classic.comparePair(tl,root,at,o);
    const [grid]=elements(`${root} .cm-grid`);
    if(grid)edgeReveal(tl,grid,at,{direction:"ttb",duration:o.gridDuration===undefined?.76:o.gridDuration});
    elements(`${root} .cm-row`).forEach((row,i)=>{
      const t=at+.42+i*(o.stagger===undefined?.05:o.stagger);
      tl.fromTo(row,{autoAlpha:0,x:-18},{autoAlpha:1,x:0,duration:.5,ease:"expo.out"},t);
      edgeReveal(tl,row,t,{duration:.46,ease:"power3.out"});
    });
    return tl;
  },

  // 装裱落框：界格以纤维边自左绘出，画面显影浮定，图注吃墨落款。
  mountSeat(tl,root,at=0,o={}){
    if(!hasDOM)return classic.mountSeat(tl,root,at,o);
    const d=o.duration===undefined?.76:o.duration;
    elements(`${root} .pe-plate, ${root} .pe-artifact-mount`).forEach((el)=>{
      tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.05},at);
      edgeReveal(tl,el,at,{duration:d});
    });
    if(o.art)paperEditorialMotions.windowSurface(tl,o.art,at+.08,{duration:d+.2,blur:6,scale:1.02});
    paperEditorialMotions.lineSet(tl,`${root} .pe-plate-caption, ${root} .pe-artifact-caption`,at+d+.08,{rise:8,duration:.56});
    return tl;
  },

  // E 数字 ------------------------------------------------------------------

  // 数字滚动：高速段带纵向动态模糊（由缓动导数算出，逐帧确定），落定时轻压一下。
  countUp(tl,target,at=0,end=100,duration=1.1,formatter=(value)=>Math.round(value).toString()){
    const element=typeof target==="string"&&hasDOM?document.querySelector(target):target;
    const state={value:0};
    if(!hasDOM||!(element instanceof Element))
      return tl.to(state,{value:end,duration,ease:"power3.out",onUpdate:()=>{if(element)element.textContent=formatter(state.value)}},at);
    const mb=motionBlurFilter();
    tl.set(element,{filter:mb.url},at);
    tl.to(state,{value:end,duration,ease:"power3.out",onUpdate(){
      const p=this.progress();
      element.textContent=formatter(state.value);
      mb.blur.setAttribute("stdDeviation",`0 ${(9*(1-p)**2).toFixed(2)}`);
    }},at);
    tl.fromTo(element,{scale:1},Object.assign({scale:1.035,duration:.1,ease:"power2.out"},NR),at+duration-.12);
    tl.to(element,{scale:1,duration:.26,ease:"power2.out"},at+duration-.02);
    tl.set(element,{filter:""},at+duration);
    return tl;
  },

  // F 组合编排 ----------------------------------------------------------------

  // 章节落版：栏目细边拭入 → 序号墨定 → 标题吃墨 → 朱砂一笔横画。
  chapterMark(tl,root,at=0){
    if(!hasDOM)return classic.chapterMark(tl,root,at);
    const M=paperEditorialMotions,q=(s)=>elements(`${root} ${s}`);
    q(".pe-chapter-kicker").forEach((el)=>{tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.1},at);edgeReveal(tl,el,at,{duration:.42,ease:"power2.out"})});
    M.inkSlam(tl,q(".pe-chapter-index"),at+.06,{duration:.9});
    M.lineSet(tl,q(".pe-chapter-title"),at+.24,{duration:.72,rise:14});
    q(".pe-chapter-rule").forEach((el)=>brushStroke(tl,el,at+.42,{duration:.7}));
    return tl;
  },

  // 收尾锁定：结语逐行吃墨 → 朱砂句读盖印 → 落款拭入。
  endLock(tl,root,at=0){
    if(!hasDOM)return classic.endLock(tl,root,at);
    const M=paperEditorialMotions,q=(s)=>elements(`${root} ${s}`);
    M.lineSet(tl,q(".pe-end-line"),at,{stagger:.14,rise:30,duration:.8});
    q(".pe-end-mark").forEach((el)=>sealImpress(tl,el,at+.52,{rotFrom:0,rotTo:0,scaleFrom:2.4,air:.2,keep:false,final:1}));
    q(".pe-end-note").forEach((el)=>{tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.1},at+.86);edgeReveal(tl,el,at+.86,{duration:.56,ease:"power2.out"})});
    return tl;
  },

  // 放映揭幕：头部拭入 → 画框纤维边展开 → 裁切角标钉入 → 页脚与书脊落定 → 进度轨。
  // 媒体面本身不参与遮罩（见 window-surface 契约）。
  screeningUnveil(tl,root,at=0,progressDuration=0){
    if(!hasDOM)return classic.screeningUnveil(tl,root,at,progressDuration);
    const q=(s)=>elements(`${root} ${s}`);
    q(".pe-screening-head").forEach((el)=>{tl.fromTo(el,{autoAlpha:0,y:-12},{autoAlpha:1,y:0,duration:.4,ease:"power2.out"},at+.04);edgeReveal(tl,el,at+.04,{duration:.5,ease:"power2.out"})});
    q(".pe-screening-frame").forEach((el)=>edgeReveal(tl,el,at+.1,{duration:.72}));
    tl.fromTo(q(".pe-screening-crop"),{autoAlpha:0,scale:1.8},{autoAlpha:1,scale:1,duration:.34,stagger:.05,ease:"back.out(2.2)"},at+.3);
    q(".pe-screening-footer").forEach((el)=>{tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.1},at+.34);edgeReveal(tl,el,at+.34,{duration:.5,ease:"power2.out"})});
    tl.fromTo(q(".pe-screening-spine, .pe-screening-edition"),{autoAlpha:0,y:10},{autoAlpha:1,y:0,duration:.44,ease:"power2.out"},at+.42);
    if(progressDuration>0)tl.fromTo(q(".pe-screening-progress > span"),{scaleX:0},{scaleX:1,duration:progressDuration,ease:"none"},at);
    return tl;
  },

  // 交接换版：同一个命题换一个模型。毛笔朱砂一笔横扫吞掉左半，朱印盖进新的右半，
  // 新模型名像活字一样落下，整页吃一次冲击，墨点飞散。约 3.9s。DOM 需求同 v2.3。
  handoffSwap(tl,root,at=0){
    if(!hasDOM)return classic.handoffSwap(tl,root,at);
    const M=paperEditorialMotions,q=(s)=>elements(`${root} ${s}`);
    M.cascadeList(tl,q(".handoff-kicker"),at+.08,0);
    M.inkSlam(tl,q(".handoff-thesis"),at+.2,{duration:.9});
    M.paperRise(tl,q(".handoff-zone.out"),at+.48,0);
    tl.fromTo(q(".handoff-centre"),{scaleY:0},Object.assign({scaleY:1,duration:.5,ease:"power3.out"},NR),at+.84);
    q(".brush-body").forEach((el)=>brushStroke(tl,el,at+1.24,{duration:.95,dry:.18}));
    q(".brush-tail").forEach((el)=>brushStroke(tl,el,at+1.42,{duration:.62,ease:"power2.out",dry:.5}));
    q(".handoff-zone.out").forEach((el)=>edgeReveal(tl,el,at+1.3,{hide:true,duration:.74,ease:"power2.inOut"}));
    // 笔锋必须离场：停在原地会压在它刚刚揭示的那个名字上
    tl.to(q(".handoff-brush"),{x:2520,duration:.52,ease:"power2.in"},at+2.42);
    const contact=q(".handoff-zone.in .handoff-seal").reduce((c,el)=>sealImpress(tl,el,at+2.16,{rotFrom:0,rotTo:0,scaleFrom:1.35,air:.4}),at+2.56);
    tl.fromTo(q(".handoff-bloom"),{scale:.2,opacity:.6},Object.assign({scale:2.5,opacity:0,duration:1.2,ease:"power2.out"},NR),contact-.02);
    const F=q(".handoff-frame");
    [[contact,{x:11,y:-8,scale:1.012},.055,"power2.out"],[contact+.055,{x:-8,y:6},.06,"power1.inOut"],
     [contact+.115,{x:5,y:-4},.07,"power1.inOut"],[contact+.185,{x:-3,y:2},.08,"power1.inOut"],
     [contact+.265,{x:0,y:0,scale:1},.13,"power2.out"]]
      .forEach(([t,v,d,e])=>tl.to(F,Object.assign({},v,{duration:d,ease:e}),t));
    tl.fromTo(q(".handoff-splat"),{opacity:.85,scale:.35,x:0,y:0},
      Object.assign({opacity:0,scale:1.4,duration:.62,ease:"power2.out",stagger:.011,
        x:(i,el)=>Number(el.dataset.dx),y:(i,el)=>Number(el.dataset.dy)},NR),contact);
    tl.fromTo(q(".handoff-zone.in .handoff-model span"),
      {y:-78,autoAlpha:0,rotation:-8,scale:1.28},
      Object.assign({y:0,autoAlpha:1,rotation:0,scale:1,duration:.44,ease:"back.out(1.7)",stagger:.045},NR),contact+.04);
    M.cascadeList(tl,q(".handoff-zone.in .handoff-role"),at+2.46,0);
    M.cascadeList(tl,q(".handoff-zone.in .handoff-work"),at+3.26,0);
    M.lineSet(tl,q(".handoff-caption"),at+3.4);
    M.cascadeList(tl,q(".handoff-foot"),at+3.62,0);
    return tl;
  },

  // 纸面漂移：整场戏的底噪，由根时间轴驱动。颗粒背景缓慢平移；o.breathe 给纸面极轻的呼吸缩放。
  paperDrift(tl,spans,o={}){
    classic.paperDrift(tl,spans,o);
    if(o.breathe&&spans&&typeof spans[Symbol.iterator]==="function")
      for(const [sel,t0,len] of spans)tl.fromTo(sel,{scale:1},{scale:1+o.breathe,duration:len,ease:"sine.inOut"},t0);
    return tl;
  },

  // 分版套印：木刻谱按墨版次序上纸 —— 每一版都带印泥不均的转印与轻微套准偏移归位。
  plateStrike(tl,root,at=0,o={}){
    if(!hasDOM)return classic.plateStrike(tl,root,at,o);
    const stagger=o.stagger===undefined?.24:o.stagger,d=o.duration===undefined?.5:o.duration;
    elements(`${root} .pe-plate-forme path`).forEach((path,i)=>{
      const t=at+i*stagger,f=sealInkFilter({seed:nextSeed(),color:path.getAttribute("fill")||INK,frequency:.05,roughness:1.2});
      tl.set(path,{filter:f.url},t);
      tl.fromTo(path,{autoAlpha:0,x:i%2?5:-5,y:i%2?-3:3},{autoAlpha:1,x:0,y:0,duration:d,ease:"power3.out"},t);
      tl.fromTo(f.cover,{attr:{intercept:-3.8}},Object.assign({attr:{intercept:-.7},duration:d,ease:"power2.out"},NR),t);
      tl.set(f.haloAlpha,{attr:{slope:0}},t);
    });
    return tl;
  },

  // 材料组件驱动：画面只取决于时间值
  inkForm(tl,controller,at=0,o={}){
    return driveMaterial(tl,controller,at,4.8,o);
  },
  movableType(tl,controller,at=0,o={}){
    return driveMaterial(tl,controller,at,5.6,o);
  },
  rubbingReveal(tl,controller,at=0,o={}){
    return driveMaterial(tl,controller,at,5.4,o);
  },
  paperCutaway(tl,controller,at=0,o={}){
    return driveMaterial(tl,controller,at,6.6,o);
  }
};

export const paperEditorialMotionMeta={
  "ink-slam":{label:"墨定标题",duration:.96,use:"墨团自中心沿纤维渗开，字形由墨团收紧为锐边，击打下沉，墨晕吸散"},
  "paper-rise":{label:"纸面升起",duration:1,use:"纸页带空气垫落下：前倾放平、投影由散到实，可级联"},
  "bar-draw":{label:"证据绘条",duration:1.02,use:"一笔毛笔横画：顿笔起、中段行、飞白收"},
  "cascade-list":{label:"级联清单",duration:.58,use:"每行像纸条滑入，前缘纤维毛边随行揭开"},
  "editorial-wipe":{label:"版面拭入",duration:.9,use:"纤维毛边扫过版面，内容带景深落定，支持四方向"},
  "stamp-impact":{label:"落印",duration:1.1,use:"印面斜砸，印泥不均匀转印，压实回弹，朱砂渗纸"},
  "underline-draw":{label:"批注下划线",duration:.56,use:"朱砂细笔一挑，收笔带飞白"},
  "folio-swap":{label:"页眉更替",duration:.46,use:"细纤维边拭入，元数据只轻移不跳动"},
  "red-result-emphasis":{label:"朱砂点题",duration:.9,use:"墨色被朱砂浸透：转红同时朱砂外渗，轻压回弹"},
  "count-up":{label:"数字滚动",duration:1.1,use:"高速段纵向动态模糊，落定轻压；支持格式化"},
  "ghost-settle":{label:"背景水印落定",duration:1.3,use:"大号淡墨被水洇开，渗出轮廓后安静落定"},
  "quote-reveal":{label:"引文揭示",duration:1.02,use:"纸条落定 → 引文逐行吃墨 → 出处纤维边拭入"},
  "chapter-mark":{label:"章节落版",duration:1.12,use:"栏目拭入 → 序号墨定 → 标题吃墨 → 朱砂一笔横画"},
  "end-lock":{label:"收尾锁定",duration:1.42,use:"结语逐行吃墨 → 朱砂句读盖印 → 落款拭入"},
  "screening-unveil":{label:"放映揭幕",duration:1.1,use:"头部拭入 → 画框纤维边展开 → 角标钉入 → 页脚书脊落定 → 进度轨"},
  "line-set":{label:"定行",duration:.72,use:"所有文字行的默认出场：墨从基线吃进纸里，笔画微晕后收锐，可级联"},
  "slate-flight":{label:"导语飞行",duration:.86,use:"引导页文案沿弧线飞进作品页页眉，作品窗延后出场"},
  "window-surface":{label:"作品窗浮出",duration:.9,use:"录屏/媒体面显影浮出：虚焦、过曝、低饱和一起收回。绝不用 clip/mask"},
  "seal-press":{label:"印面落定",duration:1.1,use:"纵向盖印，印泥转印 + 压实 + 可选墨晕扩散"},
  "seal-sheet":{label:"印谱累积",duration:1.1,use:"一组朱印逐枚盖下，印泥各自不均；保留每枚独立倾角"},
  "compare-pair":{label:"对照双栏",duration:1.2,use:"分栏格纤维边展开 + 两侧条目逐行吃墨"},
  "handoff-swap":{label:"交接换版",duration:3.9,use:"毛笔朱砂横扫吞掉左半 → 朱印盖进右半 → 活字落下 → 整页冲击 → 墨点飞散"},
  "paper-drift":{label:"纸面漂移",duration:0,use:"整片底噪：颗粒背景平移，可选纸面呼吸，由根时间轴驱动"},
  "ledger-strike":{label:"度支谱入账",duration:1,use:"刻度逐齿点下带回弹 + 账目逐行吃墨"},
  "bar-pull":{label:"朱红横带",duration:1.4,use:"湿朱砂一刀横拉，毛边前缘，文字随后入。全画面唯一饱和色，用一次"},
  "mount-seat":{label:"装裱落框",duration:1.4,use:"界格纤维边绘出 + 画面显影 + 图注吃墨"},
  "plate-strike":{label:"分版套印",duration:1.2,use:"按墨版次序上纸，每版印泥不均转印并套准归位"},
  "ink-form":{label:"墨迹聚形",duration:4.8,use:"种子墨粒由散到环，聚成任意文字或透明图形轮廓；绝对时间可回放"},
  "movable-type":{label:"活字归版",duration:5.6,use:"木活字落版、滚墨、压印转印，起版后留下凹印墨字"},
  "rubbing-reveal":{label:"拓印显影",duration:5.4,use:"覆纸捶实 → 拓包三遍扑墨逐次加深 → 收拓晾干；支持阴刻拓 mode:intaglio"},
  "paper-cutaway":{label:"纸层剖视",duration:6.6,use:"对位纸层沿纤维撕口卷起，背面可见，逐层露出下层证据"}
};

export const countUp=paperEditorialMotions.countUp;
// 旧版（v2.3）预设，函数签名一致：paperEditorialMotionsClassic.inkSlam(tl,target,at)
export const paperEditorialMotionsClassic=classic;
