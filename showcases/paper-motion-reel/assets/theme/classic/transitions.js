const INK="#20262c",RED="#b83b2f";

const setSwap=(tl,outgoing,incoming,at)=>{
  tl.set(incoming,{opacity:1},at);
  tl.set(outgoing,{opacity:0},at);
};

const RAGGED_BOTTOM="polygon(0 0,100% 0,100% 96.5%,92% 97.8%,84% 96.8%,76% 98.2%,68% 97%,60% 98.6%,52% 97.2%,44% 98.4%,36% 96.9%,28% 98.1%,20% 97%,12% 98.3%,4% 97.1%,0 98%)";

export const paperEditorialTransitions={
  paperPush(tl,{outgoing,incoming},at,duration=.62){
    tl.fromTo(incoming,{x:1920,scale:.995,opacity:1},{x:0,scale:1,opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-560,opacity:1,duration,ease:"power3.inOut"},at);
    return tl;
  },
  folioRise(tl,{outgoing,incoming},at,duration=.66){
    tl.fromTo(incoming,{y:1080,opacity:1},{y:0,opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{y:0,scale:1,opacity:1},{y:-320,scale:.985,opacity:1,duration,ease:"power3.inOut"},at);
    return tl;
  },
  focusPress(tl,{outgoing,incoming},at,duration=.72){
    tl.fromTo(outgoing,{opacity:1,scale:1,filter:"blur(0px)"},{opacity:0,scale:1.06,filter:"blur(14px)",duration,ease:"power2.inOut"},at);
    tl.fromTo(incoming,{opacity:0,scale:.955,filter:"blur(16px)"},{opacity:1,scale:1,filter:"blur(0px)",duration,ease:"power2.inOut"},at+duration*.22);
    return tl;
  },
  marginPull(tl,{outgoing,incoming,overlay},at,duration=.7){
    tl.set(overlay,{opacity:1,y:-1150,backgroundColor:INK,clipPath:RAGGED_BOTTOM},at);
    tl.to(overlay,{y:0,duration:duration*.46,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.to(overlay,{y:1150,duration:duration*.54,ease:"power3.inOut"},at+duration*.46);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  },
  redRuleCut(tl,{outgoing,incoming,overlay,rule},at,duration=.66){
    tl.set(rule,{opacity:1,scaleX:0,transformOrigin:"left center",backgroundColor:RED},at);
    tl.set(overlay,{opacity:1,scaleY:0,transformOrigin:"center center",backgroundColor:RED},at);
    tl.to(rule,{scaleX:1,duration:.18,ease:"power3.inOut"},at);
    tl.to(overlay,{scaleY:1,duration:duration*.36,ease:"power3.in"},at+.14);
    setSwap(tl,outgoing,incoming,at+.14+duration*.36);
    tl.to(overlay,{scaleY:0,duration:duration*.3,ease:"power3.out"},at+.18+duration*.36);
    tl.to(rule,{scaleX:0,transformOrigin:"right center",duration:.14,ease:"power2.in"},at+duration-.14);
    tl.set([overlay,rule],{opacity:0},at+duration);
    return tl;
  },
  columnCascade(tl,{outgoing,incoming,columns},at,duration=.76){
    const half=duration*.52;
    tl.set(columns,{opacity:1},at);
    tl.fromTo(columns,{scaleY:0,transformOrigin:(index)=>index%2?"center bottom":"center top"},{scaleY:1,duration:half,stagger:.05,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.set(columns,{transformOrigin:(index)=>index%2?"center top":"center bottom"},at+half);
    tl.to(columns,{scaleY:0,duration:duration-half,stagger:.05,ease:"power3.inOut"},at+half);
    return tl;
  },
  archiveShutter(tl,{outgoing,incoming,slats},at,duration=.72){
    const half=duration*.5;
    tl.set(slats,{opacity:1},at);
    tl.fromTo(slats,{scaleX:0,transformOrigin:(index)=>index%2?"right center":"left center"},{scaleX:1,duration:half,stagger:half*.09,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.set(slats,{transformOrigin:(index)=>index%2?"left center":"right center"},at+half);
    tl.to(slats,{scaleX:0,duration:half,stagger:half*.09,ease:"power3.inOut"},at+half);
    return tl;
  },
  chapterBridge(tl,{outgoing,incoming,overlay},at,duration=.82){
    tl.set(overlay,{opacity:1,x:-1920,skewX:-4,backgroundColor:INK},at);
    tl.to(overlay,{x:0,duration:duration*.46,ease:"power3.inOut"},at);
    tl.to(outgoing,{scale:.975,duration:duration*.5,ease:"power2.inOut"},at);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.fromTo(incoming,{scale:1.025},{scale:1,duration:duration*.54,ease:"power2.out"},at+duration*.46);
    tl.to(overlay,{x:1920,duration:duration*.54,ease:"power3.inOut"},at+duration*.46);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  },
  inkSweep(tl,{outgoing,incoming},at,duration=.78){
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0 0,0 0,4% 18%,0 38%,6% 58%,0 78%,3% 100%,0 100%)"},{opacity:1,clipPath:"polygon(0 0,100% 0,100% 18%,100% 38%,100% 58%,100% 78%,100% 100%,0 100%)",duration,ease:"power3.inOut"},at);
    tl.to(outgoing,{x:-70,scale:.985,duration,ease:"power2.inOut"},at);
    return tl;
  },
  tearWipe(tl,{outgoing,incoming},at,duration=.7){
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0 0,0 0,0 12%,3% 20%,0 30%,4% 40%,0 52%,3% 63%,0 75%,4% 86%,0 100%,0 100%)"},{opacity:1,clipPath:"polygon(0 0,100% 0,100% 12%,100% 20%,100% 30%,100% 40%,100% 52%,100% 63%,100% 75%,100% 86%,100% 100%,0 100%)",duration,ease:"power2.inOut"},at);
    tl.to(outgoing,{x:-38,rotation:-.35,duration,ease:"power2.inOut"},at);
    return tl;
  },
  diagonalSlice(tl,{outgoing,incoming,slash},at,duration=.62){
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0 0,0 0,0 100%,0 100%)"},{opacity:1,clipPath:"polygon(0 0,100% 0,100% 100%,0 100%)",duration,ease:"power3.inOut"},at);
    tl.to(outgoing,{x:-90,y:34,scale:.98,duration,ease:"power3.inOut"},at);
    if(slash){
      tl.set(slash,{opacity:1,x:-2200,backgroundColor:RED},at);
      tl.to(slash,{x:2200,duration,ease:"power3.inOut"},at);
      tl.set(slash,{opacity:0},at+duration);
    }
    return tl;
  },
  inkIris(tl,{outgoing,incoming},at,duration=.76){
    tl.fromTo(incoming,{opacity:1,scale:1.04,clipPath:"circle(0% at 52% 48%)"},{opacity:1,scale:1,clipPath:"circle(145% at 52% 48%)",duration,ease:"power3.inOut"},at);
    tl.to(outgoing,{scale:1.03,filter:"blur(6px)",duration,ease:"power2.inOut"},at);
    return tl;
  },
  paperFold(tl,{outgoing,incoming},at,duration=.72){
    tl.fromTo(incoming,{opacity:1,scale:.96,x:90},{opacity:1,scale:1,x:0,duration,ease:"power2.out"},at+duration*.18);
    tl.fromTo(outgoing,{rotationY:0,x:0,opacity:1,filter:"brightness(1)"},{rotationY:-88,x:-240,opacity:0,filter:"brightness(.72)",duration,ease:"power3.in",transformOrigin:"left center",transformPerspective:1400},at);
    return tl;
  },
  stampCover(tl,{outgoing,incoming,overlay},at,duration=.66){
    tl.set(overlay,{opacity:1,x:0,y:0,backgroundColor:RED,transformOrigin:"center center"},at);
    tl.fromTo(overlay,{scale:.02,rotation:-12},{scale:1.55,rotation:-3,duration:duration*.5,ease:"power4.in"},at);
    setSwap(tl,outgoing,incoming,at+duration*.48);
    tl.to(overlay,{y:-1250,x:420,rotation:7,duration:duration*.5,ease:"power3.in"},at+duration*.5);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  },
  paperStack(tl,{outgoing,incoming,sheets},at,duration=.78){
    tl.fromTo(sheets,{x:1920,y:(index)=>90+index*24,rotation:(index)=>index%2?3:-2,opacity:1},{x:0,y:0,rotation:0,duration:duration*.5,stagger:.07,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+duration*.52);
    tl.to(sheets,{x:-1920,y:-120,rotation:-3,duration:duration*.48,stagger:.06,ease:"power3.inOut"},at+duration*.52);
    return tl;
  },
  inkDip(tl,{outgoing,incoming,overlay,flash},at,duration=.74){
    const half=duration*.5;
    tl.set(overlay,{opacity:0,backgroundColor:INK},at);
    tl.to(overlay,{opacity:1,duration:half,ease:"sine.inOut"},at);
    if(flash){
      tl.set(flash,{opacity:1,scaleX:0,transformOrigin:"left center",backgroundColor:RED},at+half-.12);
      tl.to(flash,{scaleX:1,duration:.16,ease:"power2.inOut"},at+half-.12);
      tl.to(flash,{scaleX:0,transformOrigin:"right center",duration:.14,ease:"power2.in"},at+half+.1);
      tl.set(flash,{opacity:0},at+half+.26);
    }
    setSwap(tl,outgoing,incoming,at+half);
    tl.to(overlay,{opacity:0,duration:half,ease:"sine.inOut"},at+half);
    return tl;
  }
};

export const paperEditorialTransitionMeta={
  roles:{
    primary:["paper-push","folio-rise","focus-press","margin-pull"],
    section:["red-rule-cut","column-cascade","archive-shutter","chapter-bridge"],
    accent:["ink-sweep","tear-wipe","diagonal-slice","ink-iris","paper-fold","stamp-cover","paper-stack","ink-dip"]
  },
  presets:{
    "paper-push":{label:"纸页推进",duration:.62,parts:["outgoing","incoming"],use:"相邻观点的常规前推，新页视差压过旧页"},
    "folio-rise":{label:"对开升起",duration:.66,parts:["outgoing","incoming"],use:"有序步骤、纵向推进"},
    "focus-press":{label:"焦点压合",duration:.72,parts:["outgoing","incoming"],use:"冷静分析、证据交接的景深交换"},
    "margin-pull":{label:"墨边扯页",duration:.7,parts:["outgoing","incoming","overlay"],use:"果断的编辑切断，墨版带毛边纵向扯过"},
    "red-rule-cut":{label:"朱砂规切",duration:.66,parts:["outgoing","incoming","overlay","rule"],use:"短促有力的章节切：朱线绘出、铺满、收拢"},
    "column-cascade":{label:"栏栅瀑布",duration:.76,parts:["outgoing","incoming","columns"],use:"新信息组，栏片上下交错编织"},
    "archive-shutter":{label:"档案百叶",duration:.72,parts:["outgoing","incoming","slats"],use:"方法、档案或证据段落，叶片左右交错合拢"},
    "chapter-bridge":{label:"章节墨桥",duration:.82,parts:["outgoing","incoming","overlay"],use:"大章节过门，墨版斜切扫过并带景深"},
    "ink-sweep":{label:"墨扫",duration:.78,parts:["outgoing","incoming"],use:"有机编辑揭示，粗纤维前缘"},
    "tear-wipe":{label:"撕页",duration:.7,parts:["outgoing","incoming"],use:"强对比或纠错，细纤维撕口"},
    "diagonal-slice":{label:"对角裁切",duration:.62,parts:["outgoing","incoming","slash"],use:"更快的分析交接，可带朱砂裁缝线"},
    "ink-iris":{label:"墨圈聚焦",duration:.76,parts:["outgoing","incoming"],use:"英雄结果或中心主体的圈入"},
    "paper-fold":{label:"纸页折合",duration:.72,parts:["outgoing","incoming"],use:"文档或版本更替，折入时随折痕变暗"},
    "stamp-cover":{label:"印章盖页",duration:.66,parts:["outgoing","incoming","overlay"],use:"判定、通过/否决，盖下后揭起离场"},
    "paper-stack":{label:"纸叠飞页",duration:.78,parts:["outgoing","incoming","sheets"],use:"多源汇总，纸页自右飞入自左飞出"},
    "ink-dip":{label:"墨浸",duration:.74,parts:["outgoing","incoming","overlay","flash"],use:"平静收束或调性重置，谷底可带一线朱砂"}
  }
};
