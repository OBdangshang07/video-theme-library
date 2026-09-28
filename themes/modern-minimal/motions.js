const INK="#111317",ACCENT="#2455ff";

export const modernMinimalMotions={
  gridReveal(tl,target,at=0,duration=.72){
    return tl.fromTo(target,
      {opacity:0,clipPath:"inset(0 100% 0 0)"},
      {opacity:1,clipPath:"inset(0 0% 0 0)",duration,ease:"expo.out"},at);
  },
  precisionRise(tl,target,at=0,stagger=0){
    return tl.fromTo(target,
      {y:48,opacity:0},
      {y:0,opacity:1,duration:.54,stagger,ease:"power3.out"},at);
  },
  numberRoll(tl,target,at=0,end=100,duration=.9,formatter=(value)=>Math.round(value).toString()){
    const element=typeof target==="string"&&typeof document!=="undefined"?document.querySelector(target):target;
    const state={value:0};
    return tl.to(state,{value:end,duration,ease:"power3.out",onUpdate:()=>{element.textContent=formatter(state.value)}},at);
  },
  ruleExpand(tl,target,at=0,origin="left center"){
    return tl.fromTo(target,
      {scaleX:0,transformOrigin:origin},
      {scaleX:1,duration:.5,ease:"expo.out"},at);
  },
  listStagger(tl,targets,at=0,stagger=.08){
    return tl.fromTo(targets,
      {x:-38,opacity:0},
      {x:0,opacity:1,duration:.5,stagger,ease:"power3.out"},at);
  },
  maskSlide(tl,target,at=0,duration=.68){
    return tl.fromTo(target,
      {x:-70,clipPath:"inset(0 100% 0 0)",opacity:1},
      {x:0,clipPath:"inset(0 0% 0 0)",duration,ease:"power4.out"},at);
  },
  focusSnap(tl,target,at=0,duration=.48){
    return tl.fromTo(target,
      {scale:1.08,filter:"blur(12px)",opacity:0},
      {scale:1,filter:"blur(0px)",opacity:1,duration,ease:"power2.out"},at);
  },
  softEmphasis(tl,target,at=0,duration=.72){
    return tl.fromTo(target,
      {color:INK,scale:.94},
      {color:ACCENT,scale:1,duration,ease:"back.out(1.25)"},at);
  },
  indexShift(tl,target,at=0,duration=.62){
    return tl.fromTo(target,
      {x:-86,letterSpacing:".08em",opacity:0},
      {x:0,letterSpacing:"-.07em",opacity:1,duration,ease:"expo.out"},at);
  },
  closingCompress(tl,target,at=0,duration=.66){
    return tl.fromTo(target,
      {scaleX:1.14,opacity:0,transformOrigin:"left center"},
      {scaleX:1,opacity:1,duration,ease:"power3.out"},at);
  },
  gridSettle(tl,target,at=0,duration=1.1){
    return tl.fromTo(target,
      {opacity:0,scale:1.05,transformOrigin:"50% 50%"},
      {opacity:1,scale:1,duration,ease:"power2.out"},at);
  },
  metricSweep(tl,root,at=0){
    tl.fromTo(`${root} .mm-metric`,{y:44,opacity:0},{y:0,opacity:1,duration:.5,stagger:.09,ease:"expo.out"},at);
    return tl.fromTo(`${root} .mm-metric strong`,{y:16,opacity:0},{y:0,opacity:1,duration:.38,stagger:.09,ease:"power3.out"},at+.16);
  },
  sectionMark(tl,root,at=0){
    tl.fromTo(`${root} .mm-chapter-kicker`,{y:-14,opacity:0},{y:0,opacity:1,duration:.3,ease:"power2.out"},at);
    tl.fromTo(`${root} .mm-chapter-index`,{scale:1.1,opacity:0,filter:"blur(5px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:.5,ease:"power4.out"},at+.06);
    tl.fromTo(`${root} .mm-chapter-title`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.55,ease:"power3.inOut"},at+.18);
    return tl.fromTo(`${root} .mm-chapter-rule`,{scaleX:0},{scaleX:1,duration:.5,ease:"power3.out"},at+.3);
  },
  showcaseUnveil(tl,root,at=0,progressDuration=0){
    tl.fromTo(`${root} .mm-dossier-head`,{y:-18,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out"},at+.04);
    tl.fromTo(`${root} .mm-dossier-frame`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.62,ease:"power3.inOut"},at+.08);
    tl.fromTo(`${root} .mm-dossier-crop`,{opacity:0,scale:1.6},{opacity:1,scale:1,duration:.3,stagger:.04,ease:"power2.out"},at+.22);
    tl.fromTo(`${root} .mm-dossier-footer`,{y:-12,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out"},at+.26);
    tl.fromTo(`${root} .mm-dossier-spine, ${root} .mm-dossier-edition`,{opacity:0},{opacity:1,duration:.36,ease:"power2.out"},at+.32);
    if(progressDuration>0)tl.fromTo(`${root} .mm-dossier-progress > span`,{scaleX:0},{scaleX:1,duration:progressDuration,ease:"none"},at);
    return tl;
  }
};

export const modernMinimalMotionMeta={
  "grid-reveal":{label:"网格揭示",duration:.72,use:"主标题、媒体沿网格的clip-path揭示"},
  "precision-rise":{label:"精准升起",duration:.54,use:"面板、卡片短距离上移入场，可级联"},
  "number-roll":{label:"数字递读",duration:.9,use:"统计数值的参数化滚动，支持格式化"},
  "rule-expand":{label:"规线展开",duration:.5,use:"结构线、进度刻度自左展开"},
  "list-stagger":{label:"列表级联",duration:.5,use:"排行、目录与有序条目依次入场"},
  "mask-slide":{label:"遮罩滑入",duration:.68,use:"内容沿方向的遮罩式进入"},
  "focus-snap":{label:"焦点锁定",duration:.48,use:"主体由轻微虚焦锁定到网格"},
  "soft-emphasis":{label:"钴蓝点题",duration:.72,use:"关键词或最终值由炭黑转钴蓝"},
  "index-shift":{label:"索引贴合",duration:.62,use:"大号章节编号收紧字距贴合网格"},
  "closing-compress":{label:"收尾压合",duration:.66,use:"结尾署名自横向张力落定"},
  "grid-settle":{label:"网格落定",duration:1.1,use:"mm-grid 背景网格淡入并自 1.05× 落定"},
  "metric-sweep":{label:"指标横扫",duration:.75,use:"metric-row 协同入场：单元格级联升起、数值逐行落位"},
  "section-mark":{label:"章节定版",duration:1.05,use:"section-index/chapter-divider 整体编排：kicker、序号、标题拭入、钴蓝规线"},
  "showcase-unveil":{label:"展档揭幕",duration:1.0,use:"showcase-dossier 协同揭幕：头部、边框、裁切标记、页脚与进度轨分层入场"}
};

export const numberRoll=modernMinimalMotions.numberRoll;
