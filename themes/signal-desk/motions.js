const INK="#F3EFE4",AMBER="#FFB000",ALERT="#EF4B3F";

export const signalDeskMotions={
  headlineSplit(tl,target,at=0,duration=.64){
    return tl.fromTo(target,
      {x:-62,opacity:0,clipPath:"inset(0 100% 0 0)"},
      {x:0,opacity:1,clipPath:"inset(0 0% 0 0)",duration,ease:"expo.out"},at);
  },
  tickerRoll(tl,target,at=0,duration=.72){
    return tl.fromTo(target,
      {xPercent:18,opacity:0},
      {xPercent:0,opacity:1,duration,ease:"power3.out"},at);
  },
  timecodeRoll(tl,target,at=0,duration=.48){
    return tl.fromTo(target,
      {y:-34,opacity:0,letterSpacing:".16em"},
      {y:0,opacity:1,letterSpacing:"0em",duration,ease:"power4.out"},at);
  },
  sourcePin(tl,target,at=0,duration=.58){
    return tl.fromTo(target,
      {x:-48,opacity:0,boxShadow:`inset 0px 0 0 0 ${AMBER}`},
      {x:0,opacity:1,boxShadow:`inset 8px 0 0 0 ${AMBER}`,duration,ease:"expo.out"},at);
  },
  signalPulse(tl,target,at=0,duration=.56){
    return tl.fromTo(target,
      {scale:.35,opacity:0,boxShadow:"0 0 0 0 rgba(255,176,0,0)"},
      {scale:1,opacity:1,boxShadow:"0 0 0 16px rgba(255,176,0,.12)",duration,ease:"back.out(1.5)"},at);
  },
  storyStack(tl,targets,at=0,duration=.58,stagger=.09){
    return tl.fromTo(targets,
      {x:70,opacity:0,clipPath:"inset(0 0 0 35%)"},
      {x:0,opacity:1,clipPath:"inset(0 0 0 0%)",duration,stagger,ease:"power4.out"},at);
  },
  barSurge(tl,targets,at=0,duration=.68,stagger=.035){
    return tl.fromTo(targets,
      {scaleY:0,transformOrigin:"center bottom"},
      {scaleY:1,duration,stagger,ease:"expo.out"},at);
  },
  quoteCut(tl,target,at=0,duration=.62){
    return tl.fromTo(target,
      {opacity:0,clipPath:"polygon(0 0,0 0,0 100%,0 100%)",letterSpacing:".045em"},
      {opacity:1,clipPath:"polygon(0 0,100% 0,96% 100%,0 100%)",letterSpacing:"0em",duration,ease:"power3.out"},at);
  },
  alertHit(tl,target,at=0,duration=.46){
    return tl.fromTo(target,
      {scaleX:.72,opacity:0,filter:"brightness(1.8)",transformOrigin:"left center"},
      {scaleX:1,opacity:1,filter:"brightness(1)",duration,ease:"back.out(1.3)"},at);
  },
  deskLock(tl,target,at=0,duration=.7){
    return tl.fromTo(target,
      {scale:.92,opacity:0,clipPath:"inset(40% 8% 40% 8%)"},
      {scale:1,opacity:1,clipPath:"inset(0% 0% 0% 0%)",duration,ease:"expo.out"},at);
  },
  signalCount(tl,target,at=0,end=100,duration=1,formatter=(value)=>Math.round(value).toString()){
    const element=typeof target==="string"&&typeof document!=="undefined"?document.querySelector(target):target;
    const state={value:0};
    return tl.to(state,{value:end,duration,ease:"power3.out",onUpdate:()=>{element.textContent=formatter(state.value)}},at);
  },
  bulletinUnveil(tl,root,at=0,progressDuration=0){
    tl.fromTo(`${root} .sd-bulletin-head`,{y:-16,opacity:0},{y:0,opacity:1,duration:.3,ease:"power2.out"},at+.04);
    tl.fromTo(`${root} .sd-bulletin-frame`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.6,ease:"power3.inOut"},at+.08);
    tl.fromTo(`${root} .sd-bulletin-crop`,{opacity:0,scale:1.5},{opacity:1,scale:1,duration:.28,stagger:.04,ease:"power2.out"},at+.22);
    tl.fromTo(`${root} .sd-bulletin-footer`,{y:-10,opacity:0},{y:0,opacity:1,duration:.3,ease:"power2.out"},at+.26);
    tl.fromTo(`${root} .sd-bulletin-spine, ${root} .sd-bulletin-edition`,{opacity:0},{opacity:1,duration:.34,ease:"power2.out"},at+.32);
    if(progressDuration>0)tl.fromTo(`${root} .sd-bulletin-progress > span`,{scaleX:0},{scaleX:1,duration:progressDuration,ease:"none"},at);
    return tl;
  },
  chapterSignal(tl,root,at=0){
    tl.fromTo(`${root} .sd-segment-kicker`,{y:-12,opacity:0},{y:0,opacity:1,duration:.28,ease:"power2.out"},at);
    tl.fromTo(`${root} .sd-segment-index`,{scale:1.12,opacity:0,filter:"blur(4px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:.46,ease:"power4.out"},at+.06);
    tl.fromTo(`${root} .sd-segment-title`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.5,ease:"power3.inOut"},at+.18);
    return tl.fromTo(`${root} .sd-segment-rule`,{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:.46,ease:"power3.out"},at+.3);
  },
  evidenceReveal(tl,root,at=0){
    tl.fromTo(`${root} .sd-evidence-frame`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.6,ease:"power3.inOut"},at);
    tl.fromTo(`${root} .sd-evidence-meta`,{y:34,opacity:0},{y:0,opacity:1,duration:.5,ease:"power3.out"},at+.14);
    return tl.fromTo(`${root} .sd-evidence-meta h3, ${root} .sd-evidence-meta .sd-mono`,{y:10,opacity:0},{y:0,opacity:1,duration:.34,stagger:.06,ease:"power2.out"},at+.3);
  }
};

export const signalDeskMotionMeta={
  "headline-split":{label:"标题切入",duration:.64,use:"主标题与结构线作为一次编辑切入"},
  "ticker-roll":{label:"快讯滚入",duration:.72,use:"快讯轨、市场横条进入并锁定到信息轨"},
  "timecode-roll":{label:"时间码落位",duration:.48,use:"时间码、编号与更新标记滚到固定基线"},
  "source-pin":{label:"来源钉边",duration:.58,use:"来源卡钉上琥珀锚边（inset 阴影条生长，不碰布局）"},
  "signal-pulse":{label:"信号脉冲",duration:.56,use:"直播点、状态指示的一次有限脉冲"},
  "story-stack":{label:"故事叠入",duration:.58,use:"多条消息卡按编辑顺序叠入，可级联"},
  "bar-surge":{label:"数据涌升",duration:.68,use:"数据条以压缩节奏上升"},
  "quote-cut":{label:"引文斜切",duration:.62,use:"引文与关键表态通过斜切遮罩出现"},
  "alert-hit":{label:"突发落位",duration:.46,use:"突发带短促落位，红色仅用于突发/风险/修正"},
  "desk-lock":{label:"桌面锁定",duration:.7,use:"结尾系统压缩锁定为稳定署名"},
  "signal-count":{label:"信号计数",duration:1,use:"data-pulse 数值的参数化滚动，支持自定义格式化"},
  "bulletin-unveil":{label:"公报揭幕",duration:1,use:"bulletin-dossier 协同揭幕：头部、边框、裁切标记、页脚与进度轨分层入场"},
  "chapter-signal":{label:"章节信号",duration:.76,use:"segment-divider 整体编排：序号定版、标题拭入、琥珀规线绘出"},
  "evidence-reveal":{label:"证据揭示",duration:.7,use:"evidence-window 协同入场：画面拭入、元信息升起、标题逐行落位"}
};

export const signalCount=signalDeskMotions.signalCount;
