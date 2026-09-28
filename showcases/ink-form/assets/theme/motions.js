const INK="#20262c",RED="#b83b2f";

export const paperEditorialMotions={
  inkSlam(tl,target,at=0){
    return tl.fromTo(target,
      {scale:1.22,y:-16,opacity:0,filter:"blur(7px)"},
      {scale:1,y:0,opacity:1,filter:"blur(0px)",duration:.58,ease:"power4.out"},at);
  },
  paperRise(tl,target,at=0,stagger=0){
    return tl.fromTo(target,
      {y:64,opacity:0,rotation:.6,transformOrigin:"50% 100%"},
      {y:0,opacity:1,rotation:0,duration:.62,stagger,ease:"expo.out"},at);
  },
  barDraw(tl,target,at=0,origin="left center"){
    return tl.fromTo(target,
      {scaleX:0,transformOrigin:origin},
      {scaleX:1,duration:.95,ease:"power2.out"},at);
  },
  cascadeList(tl,target,at=0,stagger=.07){
    return tl.fromTo(target,
      {x:-96,opacity:0},
      {x:0,opacity:1,duration:.5,stagger,ease:"expo.out"},at);
  },
  editorialWipe(tl,target,at=0,direction="ltr"){
    const clips={ltr:["inset(0 100% 0 0)","inset(0 0% 0 0)"],rtl:["inset(0 0 0 100%)","inset(0 0 0 0%)"],ttb:["inset(0 0 100% 0)","inset(0 0 0% 0)"],btt:["inset(100% 0 0 0)","inset(0% 0 0 0)"]};
    const [from,to]=clips[direction]||clips.ltr;
    return tl.fromTo(target,{clipPath:from},{clipPath:to,duration:.65,ease:"power3.inOut"},at);
  },
  stampImpact(tl,target,at=0){
    tl.fromTo(target,
      {scale:1.9,rotation:-10,opacity:0},
      {scale:1,rotation:-3,opacity:1,duration:.3,ease:"power3.in"},at);
    tl.to(target,{scale:1.06,duration:.07,ease:"power1.out"},at+.3);
    return tl.to(target,{scale:1,duration:.11,ease:"power2.out"},at+.37);
  },
  underlineDraw(tl,target,at=0,origin="left center"){
    return tl.fromTo(target,
      {scaleX:0,transformOrigin:origin},
      {scaleX:1,duration:.5,ease:"power2.out"},at);
  },
  folioSwap(tl,target,at=0){
    return tl.fromTo(target,{y:-18,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out"},at);
  },
  redResultEmphasis(tl,target,at=0){
    tl.fromTo(target,{color:INK,scale:.9},{color:RED,scale:1.04,duration:.3,ease:"power2.out"},at);
    return tl.to(target,{scale:1,duration:.2,ease:"back.out(2)"},at+.3);
  },
  countUp(tl,target,at=0,end=100,duration=1.1,formatter=(value)=>Math.round(value).toString()){
    const element=typeof target==="string"&&typeof document!=="undefined"?document.querySelector(target):target;
    const state={value:0};
    return tl.to(state,{value:end,duration,ease:"power3.out",onUpdate:()=>{element.textContent=formatter(state.value)}},at);
  },
  ghostSettle(tl,target,at=0){
    return tl.fromTo(target,
      {opacity:0,x:56,filter:"blur(4px)"},
      {opacity:1,x:0,filter:"blur(0px)",duration:1.1,ease:"power3.out"},at);
  },
  quoteReveal(tl,root,at=0){
    tl.fromTo(root,{x:-26,opacity:0},{x:0,opacity:1,duration:.5,ease:"power3.out"},at);
    tl.fromTo(`${root} blockquote`,{y:26,opacity:0},{y:0,opacity:1,duration:.55,ease:"power3.out"},at+.08);
    return tl.fromTo(`${root} cite`,{opacity:0},{opacity:1,duration:.35,ease:"power2.out"},at+.3);
  },
  chapterMark(tl,root,at=0){
    tl.fromTo(`${root} .pe-chapter-kicker`,{y:-14,opacity:0},{y:0,opacity:1,duration:.3,ease:"power2.out"},at);
    tl.fromTo(`${root} .pe-chapter-index`,{scale:1.14,opacity:0,filter:"blur(5px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:.5,ease:"power4.out"},at+.06);
    tl.fromTo(`${root} .pe-chapter-title`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.55,ease:"power3.inOut"},at+.18);
    return tl.fromTo(`${root} .pe-chapter-rule`,{scaleX:0},{scaleX:1,duration:.5,ease:"power3.out"},at+.3);
  },
  endLock(tl,root,at=0){
    tl.fromTo(`${root} .pe-end-line`,{y:44,opacity:0},{y:0,opacity:1,duration:.6,stagger:.12,ease:"expo.out"},at);
    tl.fromTo(`${root} .pe-end-mark`,{scale:2,opacity:0},{scale:1,opacity:1,duration:.3,ease:"back.out(2.4)"},at+.5);
    return tl.fromTo(`${root} .pe-end-note`,{opacity:0},{opacity:1,duration:.35,ease:"power2.out"},at+.7);
  },
  screeningUnveil(tl,root,at=0,progressDuration=0){
    tl.fromTo(`${root} .pe-screening-head`,{y:-18,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out"},at+.04);
    tl.fromTo(`${root} .pe-screening-frame`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.65,ease:"power3.inOut"},at+.08);
    tl.fromTo(`${root} .pe-screening-crop`,{opacity:0,scale:1.6},{opacity:1,scale:1,duration:.3,stagger:.04,ease:"power2.out"},at+.22);
    tl.fromTo(`${root} .pe-screening-footer`,{y:-12,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out"},at+.26);
    tl.fromTo(`${root} .pe-screening-spine, ${root} .pe-screening-edition`,{opacity:0},{opacity:1,duration:.36,ease:"power2.out"},at+.32);
    if(progressDuration>0)tl.fromTo(`${root} .pe-screening-progress > span`,{scaleX:0},{scaleX:1,duration:progressDuration,ease:"none"},at);
    return tl;
  },

  // 定行：一行字从基线处被"印"出来 —— 行遮罩自下而上打开，字随之上浮并收掉浅虚焦。
  // 这是主题里所有文字的默认出场方式，取代"跳一下"的纯 opacity 淡入。
  // rise 只在目标不参与位移飞行时使用（飞行已经占用了 y，两个写入者会互相打架）。
  lineSet(tl,target,at=0,o={}){
    const rise=o.rise===undefined?0:o.rise,blur=o.blur===undefined?6:o.blur;
    const from={clipPath:"inset(100% 0 0 0)",autoAlpha:0};
    const to={clipPath:"inset(0% 0 0 0)",autoAlpha:1,
      duration:o.duration===undefined?.68:o.duration,ease:o.ease||"expo.out"};
    if(rise){from.y=rise;to.y=0}
    if(blur){from.filter=`blur(${blur}px)`;to.filter="blur(0px)"}
    if(o.stagger)to.stagger=o.stagger;
    return tl.fromTo(target,from,to,at);
  },

  // 导语飞行：同一个节点从"引导页排版"飞进"作品页页眉"，共用元素因此不需要跨场景堆叠。
  // legs = [[选择器,{from,to}],…]；from 在 0 时刻写入，to 在 at 时刻落位。
  // 配套契约：作品窗（边框、素材、页脚、进度轨）必须等到 at+duration 之后才允许出场。
  slateFlight(tl,legs,at=0,duration=.86,ease="power3.inOut"){
    if(!legs||typeof legs[Symbol.iterator]!=="function")return tl;
    for(const [sel,leg] of legs){
      if(leg.from)tl.set(sel,leg.from,0);
      tl.to(sel,Object.assign({},leg.to,{duration,ease}),at);
    }
    return tl;
  },

  // 作品窗浮出：媒体面绝不能用 clip-path 揭示 —— Chrome 会停止合成被裁剪的 <video> 画面，
  // 补间期间整块素材变成空白纸，看起来就像"素材停顿了一下"。
  // 改用 autoAlpha + 轻微缩放 + 虚焦收束，既不动 clip 也不动 video 表面。
  windowSurface(tl,target,at=0,o={}){
    const scale=o.scale===undefined?1.035:o.scale,blur=o.blur===undefined?10:o.blur;
    return tl.fromTo(target,
      {autoAlpha:0,scale,filter:`blur(${blur}px)`},
      {autoAlpha:1,scale:1,filter:"blur(0px)",duration:o.duration===undefined?.8:o.duration,ease:o.ease||"power3.out"},at);
  },

  // 印面落定：印面自上而下砸落 → 压实回弹，可选墨晕向外扩散。
  // 与 stamp-impact 的区别：这个是"盖下去"的纵向动作，stamp-impact 是横向砸入。
  // o.bloom 传墨晕元素选择器时同步播放；o.drop / o.press 可调节奏。
  sealPress(tl,target,at=0,o={}){
    const NR={immediateRender:false};
    const drop=o.drop===undefined?.46:o.drop, press=o.press===undefined?.07:o.press;
    tl.fromTo(target,{scaleY:0,autoAlpha:0},
      Object.assign({scaleY:1,autoAlpha:1,duration:drop,ease:"power4.in"},NR),at);
    tl.to(target,{scaleY:.968,duration:press,ease:"power1.out"},at+drop);
    tl.to(target,{scaleY:1,duration:.16,ease:"power2.out"},at+drop+press);
    if(o.bloom)tl.fromTo(o.bloom,{scale:.25,opacity:.7},
      Object.assign({scale:2.4,opacity:0,duration:o.bloomDuration||1.25,ease:"power2.out"},NR),at+drop);
    return tl;
  },

  // 印谱累积：一组朱印逐枚落下。缩放只作用在内层 .end-seal-in 上，
  // 外层 .end-seal 的每枚独立倾角由 :nth-child 的 CSS transform 提供 ——
  // 对外层写 transform 会把那些倾角整个抹掉，整张印谱会平掉。
  sealSheet(tl,target,at=0,o={}){
    const inner=o.inner||".end-seal-in";
    tl.fromTo(target,{autoAlpha:0},
      {autoAlpha:1,duration:o.duration===undefined?.26:o.duration,
       stagger:o.stagger===undefined?.075:o.stagger,ease:"power2.out"},at);
    return tl.fromTo(inner,{scale:o.fromScale===undefined?1.5:o.fromScale,rotation:o.spin===undefined?-6:o.spin},
      {scale:1,rotation:0,duration:o.duration===undefined?.26+.08:o.duration+.08,
       stagger:o.stagger===undefined?.075:o.stagger,ease:o.ease||"back.out(2)"},at);
  },

  // 对照双栏：分栏格先自上而下绘出，两侧条目再各自级联入场。
  // 需要 DOM：${root} .cm-grid（双栏容器）、${root} .cm-row（条目行）。
  comparePair(tl,root,at=0,o={}){
    const NR={immediateRender:false};
    tl.fromTo(`${root} .cm-grid`,{clipPath:"inset(0 0 100% 0)"},
      Object.assign({clipPath:"inset(0 0 0% 0)",duration:o.gridDuration===undefined?.7:o.gridDuration,ease:"power3.inOut"},NR),at);
    return tl.fromTo(`${root} .cm-row`,{clipPath:"inset(100% 0 0 0)",x:-22,autoAlpha:0},
      Object.assign({clipPath:"inset(0% 0 0 0)",x:0,autoAlpha:1,duration:.44,
        stagger:o.stagger===undefined?.05:o.stagger,ease:"expo.out"},NR),at+.42);
  },

  // 交接换版：同一个命题换一个模型。笔锋横扫吃掉左半，朱印砸进新的右半，
  // 新模型名像活字一样落下，整页吃一次冲击，墨点向外飞散。跨约 3.6s。
  // 需要 DOM：${root} .handoff-kicker/.handoff-thesis/.handoff-centre
  //          .handoff-zone.out/.in、.handoff-brush(.brush-body/.brush-tail)、
  //          .handoff-zone.in 内的 .handoff-seal/.handoff-model span/.handoff-role/.handoff-work、
  //          .handoff-bloom、.handoff-frame、.handoff-splat[data-dx][data-dy]、
  //          .handoff-caption、.handoff-foot。
  handoffSwap(tl,root,at=0){
    const NR={immediateRender:false};
    const M=paperEditorialMotions;
    M.cascadeList(tl,`${root} .handoff-kicker`,at+.08,0);
    M.inkSlam(tl,`${root} .handoff-thesis`,at+.20);
    M.paperRise(tl,`${root} .handoff-zone.out`,at+.48,0);
    tl.fromTo(`${root} .handoff-centre`,{scaleY:0},
      Object.assign({scaleY:1,duration:.5,ease:"power3.out"},NR),at+.84);
    tl.fromTo(`${root} .brush-body`,{scaleX:0},
      Object.assign({scaleX:1,duration:.95,ease:"power3.inOut"},NR),at+1.24);
    tl.fromTo(`${root} .brush-tail`,{scaleX:0},
      Object.assign({scaleX:1,duration:.62,ease:"power2.out"},NR),at+1.42);
    // 出场的左半被笔锋吃掉
    tl.fromTo(`${root} .handoff-zone.out`,{clipPath:"inset(0 0% 0 0)"},
      Object.assign({clipPath:"inset(0 100% 0 0)",duration:.74,ease:"power2.inOut"},NR),at+1.30);
    // 笔锋必须离场：停在原地会压在它刚刚揭示的那个名字上
    tl.to(`${root} .handoff-brush`,{x:2520,duration:.52,ease:"power2.in"},at+2.42);
    tl.fromTo(`${root} .handoff-zone.in .handoff-seal`,{scaleY:0,autoAlpha:0},
      Object.assign({scaleY:1,autoAlpha:1,duration:.40,ease:"power4.in"},NR),at+2.16);
    tl.to(`${root} .handoff-zone.in .handoff-seal`,{scaleY:.972,duration:.07,ease:"power1.out"},at+2.56);
    tl.to(`${root} .handoff-zone.in .handoff-seal`,{scaleY:1,duration:.17,ease:"power2.out"},at+2.63);
    tl.fromTo(`${root} .handoff-bloom`,{scale:.2,opacity:.6},
      Object.assign({scale:2.5,opacity:0,duration:1.2,ease:"power2.out"},NR),at+2.54);
    // 整页吃一次冲击，四拍衰减
    const F=`${root} .handoff-frame`;
    [[at+2.56,{x:11,y:-8,scale:1.012},.055,"power2.out"],[at+2.615,{x:-8,y:6},.060,"power1.inOut"],
     [at+2.675,{x:5,y:-4},.070,"power1.inOut"],[at+2.745,{x:-3,y:2},.080,"power1.inOut"],
     [at+2.825,{x:0,y:0,scale:1},.130,"power2.out"]]
      .forEach(([t,v,d,e])=>tl.to(F,Object.assign({},v,{duration:d,ease:e}),t));
    tl.fromTo(`${root} .handoff-splat`,{opacity:.85,scale:.35,x:0,y:0},
      Object.assign({opacity:0,scale:1.4,duration:.62,ease:"power2.out",stagger:.011,
        x:(i,el)=>Number(el.dataset.dx),y:(i,el)=>Number(el.dataset.dy)},NR),at+2.56);
    tl.fromTo(`${root} .handoff-zone.in .handoff-model span`,
      {y:-78,autoAlpha:0,rotation:-8,scale:1.28},
      Object.assign({y:0,autoAlpha:1,rotation:0,scale:1,duration:.44,ease:"back.out(1.7)",stagger:.045},NR),at+2.60);
    M.cascadeList(tl,`${root} .handoff-zone.in .handoff-role`,at+2.46,0);
    M.cascadeList(tl,`${root} .handoff-zone.in .handoff-work`,at+3.26,0);
    M.lineSet(tl,`${root} .handoff-caption`,at+3.40,{rise:0});
    M.cascadeList(tl,`${root} .handoff-foot`,at+3.62,0);
    return tl;
  },

  // 纸面漂移：整场戏的底噪，由根时间轴驱动而不是子场景。
  // 颗粒背景缓慢平移 + 水印横向漂移 —— 就是这一层把"幻灯片感"去掉的。
  // spans 传 [[选择器, 起始秒, 持续秒], …]；整片所有场景一次传进来即可。
  paperDrift(tl,spans,o={}){
    if(!spans||typeof spans[Symbol.iterator]!=="function")return tl;
    const gx=o.grainX===undefined?252:o.grainX, gy=o.grainY===undefined?138:o.grainY;
    for(const [sel,t0,len] of spans){
      tl.fromTo(sel,{backgroundPosition:"0px 0px"},
        {backgroundPosition:`${gx}px ${gy}px`,duration:len,ease:"none"},t0);
    }
    return tl;
  },

  // 度支谱入账：刻度尺逐齿立起，账目再逐行打出。记录页的"开户"动作。
  // 需要 DOM：${root} .pe-ticks > i、${root} .pe-ledger-row。
  ledgerStrike(tl,root,at=0,o={}){
    tl.fromTo(`${root} .pe-ticks i`,{scaleY:0},
      {scaleY:1,duration:.3,stagger:o.tickStagger===undefined?.018:o.tickStagger,ease:"power2.out",transformOrigin:"top center"},at);
    return tl.fromTo(`${root} .pe-ledger-row`,{autoAlpha:0,y:12},
      {autoAlpha:1,y:0,duration:o.duration===undefined?.5:o.duration,
       stagger:o.stagger===undefined?.09:o.stagger,ease:"power3.out"},at+(o.lead===undefined?.2:o.lead));
  },

  // 朱红横带：满宽一刀拉开，文字与落印随后从左入。全画面唯一饱和色，用一次。
  barPull(tl,root,at=0,o={}){
    const bar=`${root} .pe-bar`, d=o.duration===undefined?.72:o.duration;
    tl.fromTo(bar,{scaleX:0},{scaleX:1,duration:d,ease:"power3.inOut"},at);
    return tl.fromTo(`${bar} b, ${bar} em`,
      {autoAlpha:0,x:-22},{autoAlpha:1,x:0,duration:.5,stagger:.12,ease:"power3.out"},at+d+.15);
  },

  // 装裱落框：界格自左绘出，画面随后浮定，图注最后落。
  // o.art 传画面选择器（${root} .pe-plate-forme 之类）时同步播放。
  mountSeat(tl,root,at=0,o={}){
    const d=o.duration===undefined?.7:o.duration;
    tl.fromTo(`${root} .pe-plate, ${root} .pe-artifact-mount`,
      {clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:d,ease:"power3.inOut"},at);
    if(o.art)tl.fromTo(o.art,{autoAlpha:0,scale:1.02},{autoAlpha:1,scale:1,duration:d,ease:"power2.out"},at+.08);
    return tl.fromTo(`${root} .pe-plate-caption, ${root} .pe-artifact-caption`,
      {autoAlpha:0,y:8},{autoAlpha:1,y:0,duration:.4,ease:"power2.out"},at+d+.1);
  },

  // 分版套印：木刻谱按墨版次序上纸 —— 淡墨先、中墨次、深墨最后，朱红套版压轴。
  // 上版次序由 ink-plate.mjs 的输出顺序决定，所以绘制顺序本身就是印刷顺序。
  plateStrike(tl,root,at=0,o={}){
    return tl.fromTo(`${root} .pe-plate-forme path`,{autoAlpha:0},
      {autoAlpha:1,duration:o.duration===undefined?.45:o.duration,
       stagger:o.stagger===undefined?.22:o.stagger,ease:"power2.out"},at);
  },

  // controller 来自 createInkForm(canvas, options)。画面只取决于时间值。
  inkForm(tl,controller,at=0,o={}){
    const duration=o.duration||controller.duration||4.8;
    const state={time:0};
    return tl.to(state,{time:duration,duration,ease:"none",
      onUpdate:()=>controller.render?.(state.time)},at);
  }
};

export const paperEditorialMotionMeta={
  "ink-slam":{label:"墨定标题",duration:.58,use:"主标题、关键判断的定版击打"},
  "paper-rise":{label:"纸面升起",duration:.62,use:"面板、卡片与整组内容入场，可级联"},
  "bar-draw":{label:"证据绘条",duration:.95,use:"条形、规则线与进度刻度从左绘出"},
  "cascade-list":{label:"级联清单",duration:.5,use:"排行、目录与有序条目快速依次入场"},
  "editorial-wipe":{label:"版面拭入",duration:.65,use:"图片、媒体与整版内容的印刷式揭示，支持四方向"},
  "stamp-impact":{label:"落印",duration:.48,use:" verdict 印章、结论与状态确认，含压实回弹"},
  "underline-draw":{label:"批注下划线",duration:.5,use:"关键词句的朱砂批注划线"},
  "folio-swap":{label:"页眉更替",duration:.32,use:"页眉、编号与元数据的克制切换"},
  "red-result-emphasis":{label:"朱砂点题",duration:.5,use:"最终数值或结论由墨转朱砂"},
  "count-up":{label:"数字滚动",duration:1.1,use:"统计数值的参数化滚动，支持格式化"},
  "ghost-settle":{label:"背景水印落定",duration:1.1,use:"大号 ghost 排版从右侧安静落定"},
  "quote-reveal":{label:"引文揭示",duration:.93,use:"quote-pullout 整体编排：引文滑入、正文升起、出处淡入"},
  "chapter-mark":{label:"章节落版",duration:1.05,use:"chapter-divider 整体编排：序号定版、标题拭入、朱砂线绘出"},
  "end-lock":{label:"收尾锁定",duration:1.05,use:"end-card 整体编排：结语句升起、朱砂句读落印、落款淡入"},
  "screening-unveil":{label:"放映揭幕",duration:1.0,use:"screening-dossier 协同揭幕：头部、边框、裁切标记、页脚与进度轨分层入场"},
  "line-set":{label:"定行",duration:.68,use:"所有文字行的默认出场：行遮罩自基线打开 + 上浮 + 虚焦收束，可级联"},
  "slate-flight":{label:"导语飞行",duration:.86,use:"引导页文案飞进作品页页眉的共用元素飞行，附带作品窗延后出场的时序契约"},
  "window-surface":{label:"作品窗浮出",duration:.8,use:"录屏/媒体面的揭示。绝不使用 clip-path——被裁剪的 video 会停止合成"},
  "seal-press":{label:"印面落定",duration:.69,use:"印章纵向盖下 + 压实回弹 + 可选墨晕扩散"},
  "seal-sheet":{label:"印谱累积",duration:.34,use:"一组朱印逐枚落下；缩放走内层，保留每枚的独立倾角"},
  "compare-pair":{label:"对照双栏",duration:1.12,use:"comparison-split 的整组编排：分栏格绘出 + 两侧条目级联"},
  "handoff-swap":{label:"交接换版",duration:3.9,use:"同题换模型：笔锋吃掉左半 → 朱印砸进右半 → 活字落下 → 整页吃冲击 → 墨点飞散"},
  "paper-drift":{label:"纸面漂移",duration:0,use:"整片底噪：颗粒背景平移，由根时间轴驱动，去掉幻灯片感"},
  "ledger-strike":{label:"度支谱入账",duration:.9,use:"刻度尺逐齿立起 + 账目逐行打出，记录页的开户动作"},
  "bar-pull":{label:"朱红横带",duration:.87,use:"满宽一刀拉开，文字随后入。全画面唯一饱和色，用一次"},
  "mount-seat":{label:"装裱落框",duration:.8,use:"界格自左绘出 + 画面浮定 + 图注落款"},
  "plate-strike":{label:"分版套印",duration:.9,use:"木刻谱按墨版次序上纸：淡墨→中墨→深墨→朱红套版，绘制顺序即印刷顺序"},
  "ink-form":{label:"墨迹聚形",duration:4.8,use:"种子墨粒由散到环，聚成任意文字或透明图形轮廓；绝对时间可回放"}
};

export const countUp=paperEditorialMotions.countUp;
