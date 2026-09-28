const INK="#111317",ACCENT="#2455ff";

const setSwap=(tl,outgoing,incoming,at)=>{
  tl.set(incoming,{opacity:1},at);
  tl.set(outgoing,{opacity:0},at);
};

export const modernMinimalTransitions={
  splitSlide(tl,{outgoing,incoming},at,duration=.58){
    tl.fromTo(incoming,{xPercent:100,opacity:1},{xPercent:0,opacity:1,duration,ease:"expo.inOut"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-360,opacity:.35,duration,ease:"power3.inOut"},at);
    return tl;
  },
  axisRise(tl,{outgoing,incoming,rule},at,duration=.66){
    tl.set(rule,{opacity:1,backgroundColor:ACCENT},at);
    tl.fromTo(rule,{top:"100%"},{top:"0%",duration,ease:"power3.inOut"},at);
    tl.set(rule,{opacity:0},at+duration);
    tl.fromTo(incoming,{yPercent:100,opacity:1},{yPercent:0,opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{y:0,opacity:1,scale:1},{y:-140,opacity:.3,scale:.99,duration:duration*.92,ease:"power2.inOut"},at+duration*.08);
    return tl;
  },
  cleanCross(tl,{outgoing,incoming},at,duration=.68){
    tl.fromTo(incoming,{opacity:0,scale:.985},{opacity:1,scale:1,duration,ease:"sine.inOut"},at);
    tl.fromTo(outgoing,{opacity:1,scale:1},{opacity:0,scale:1.015,duration,ease:"sine.inOut"},at);
    return tl;
  },
  framePull(tl,{outgoing,incoming},at,duration=.64){
    tl.fromTo(incoming,{opacity:1,clipPath:"inset(7% 7% 7% 93%)",scale:.97},{opacity:1,clipPath:"inset(0% 0% 0% 0%)",scale:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-90,opacity:.45,duration,ease:"power2.inOut"},at);
    return tl;
  },
  blueLineCut(tl,{outgoing,incoming,overlay},at,duration=.52){
    const half=duration*.48;
    tl.set(overlay,{opacity:1,backgroundColor:ACCENT},at);
    tl.fromTo(overlay,{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:half,ease:"expo.in"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.to(overlay,{scaleX:0,transformOrigin:"right center",duration:duration-half,ease:"expo.out"},at+half);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  },
  gridShift(tl,{outgoing,incoming,columns},at,duration=.7){
    tl.set(columns,{opacity:1},at);
    tl.fromTo(columns,{yPercent:100},{yPercent:-100,duration,stagger:.035,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+duration*.48);
    tl.set(columns,{opacity:0},at+duration);
    return tl;
  },
  panelLock(tl,{outgoing,incoming,overlay},at,duration=.66){
    tl.set(overlay,{opacity:1,backgroundColor:INK},at);
    tl.fromTo(overlay,{scale:.82,borderRadius:"120px"},{scale:1,borderRadius:"0px",duration:duration*.5,ease:"power3.in"},at);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.to(overlay,{scale:.82,borderRadius:"120px",opacity:0,duration:duration*.5,ease:"power3.out"},at+duration*.5);
    return tl;
  },
  sectionIndexSwap(tl,{outgoing,incoming,index},at,duration=.76){
    tl.set(index,{opacity:1},at);
    tl.fromTo(index,{x:1920},{x:-1920,duration,ease:"expo.inOut"},at);
    tl.set(index,{opacity:0},at+duration);
    setSwap(tl,outgoing,incoming,at+duration*.48);
    tl.fromTo(incoming,{scale:.965},{scale:1,duration:duration*.52,ease:"power2.out"},at+duration*.48);
    return tl;
  },
  apertureBox(tl,{outgoing,incoming},at,duration=.68){
    tl.fromTo(incoming,{opacity:1,clipPath:"inset(48% 48% 48% 48%)"},{opacity:1,clipPath:"inset(0% 0% 0% 0%)",duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{scale:1,filter:"blur(0px)",opacity:1},{scale:1.045,filter:"blur(4px)",opacity:1,duration,ease:"power2.inOut"},at);
    return tl;
  },
  precisionZoom(tl,{outgoing,incoming},at,duration=.62){
    tl.fromTo(incoming,{scale:.72,opacity:0,filter:"blur(10px)"},{scale:1,opacity:1,filter:"blur(0px)",duration,ease:"expo.out"},at+duration*.18);
    tl.fromTo(outgoing,{scale:1,opacity:1,filter:"blur(0px)"},{scale:1.32,opacity:0,filter:"blur(8px)",duration:duration*.7,ease:"power4.in"},at);
    return tl;
  },
  axisFold(tl,{outgoing,incoming},at,duration=.72){
    tl.fromTo(outgoing,{rotationX:0,opacity:1},{rotationX:-86,opacity:0,duration,ease:"power3.in",transformOrigin:"center top",transformPerspective:1500},at);
    tl.fromTo(incoming,{rotationX:84,opacity:1},{rotationX:0,opacity:1,duration,ease:"power3.out",transformOrigin:"center bottom",transformPerspective:1500},at+duration*.2);
    return tl;
  },
  dotExpand(tl,{outgoing,incoming},at,duration=.7){
    tl.fromTo(incoming,{opacity:1,clipPath:"circle(0% at 78% 22%)"},{opacity:1,clipPath:"circle(140% at 78% 22%)",duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{x:0,y:0,scale:1,opacity:1},{x:-42,y:24,scale:.985,opacity:1,duration,ease:"power2.inOut"},at);
    return tl;
  },
  swissCrossCut(tl,{outgoing,incoming,ruleV,ruleH,cross},at,duration=.66){
    tl.set(ruleV,{opacity:1,backgroundColor:ACCENT},at);
    tl.set(ruleH,{opacity:1,backgroundColor:INK},at);
    tl.fromTo(ruleV,{left:"0%"},{left:"100%",duration:duration*.72,ease:"power3.inOut"},at);
    tl.fromTo(ruleH,{top:"0%"},{top:"100%",duration:duration*.72,ease:"power3.inOut"},at);
    tl.fromTo(incoming,{opacity:1,clipPath:"inset(0 100% 0 0)"},{opacity:1,clipPath:"inset(0 0% 0 0)",duration:duration*.72,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-56,opacity:.45,duration:duration*.72,ease:"power2.inOut"},at);
    tl.set(cross,{opacity:1,backgroundColor:ACCENT},at+duration*.34);
    tl.fromTo(cross,{scale:.3},{scale:1,duration:.1,ease:"power2.out"},at+duration*.34);
    tl.to(cross,{scale:1.5,opacity:0,duration:.16,ease:"power2.in"},at+duration*.46);
    tl.set([ruleV,ruleH],{opacity:0},at+duration*.72);
    return tl;
  },
  gridDissolve(tl,{outgoing,incoming,cells},at,duration=.78){
    const half=duration*.5;
    tl.set(cells,{opacity:1},at);
    tl.fromTo(cells,{rotationX:-90,transformOrigin:"center center",transformPerspective:900},{rotationX:0,duration:.16,stagger:{each:.01,grid:[4,6],from:"start"},ease:"power2.out"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.to(cells,{rotationX:90,duration:.16,stagger:{each:.01,grid:[4,6],from:"start"},ease:"power2.in"},at+half);
    tl.set(cells,{opacity:0},at+duration);
    return tl;
  },
  measureCut(tl,{outgoing,incoming,caliperL,caliperR},at,duration=.7){
    tl.set([caliperL,caliperR],{opacity:1,backgroundColor:ACCENT},at);
    tl.fromTo(caliperL,{left:"0%"},{left:"50%",duration:duration*.42,ease:"expo.in"},at);
    tl.fromTo(caliperR,{right:"0%"},{right:"50%",duration:duration*.42,ease:"expo.in"},at);
    tl.to([caliperL,caliperR],{scaleY:1.6,duration:.08,ease:"power2.out"},at+duration*.42);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.fromTo(incoming,{scale:1.015},{scale:1,duration:duration*.4,ease:"power2.out"},at+duration*.46);
    tl.to([caliperL,caliperR],{scaleY:1,duration:.1,ease:"power2.inOut"},at+duration*.5);
    tl.to(caliperL,{left:"0%",duration:duration*.4,ease:"expo.out"},at+duration*.56);
    tl.to(caliperR,{right:"0%",duration:duration*.4,ease:"expo.out"},at+duration*.56);
    tl.set([caliperL,caliperR],{opacity:0},at+duration);
    return tl;
  },
  panelSlideOver(tl,{outgoing,incoming,edge},at,duration=.74){
    tl.set(edge,{opacity:1,backgroundColor:ACCENT},at);
    tl.fromTo(edge,{left:"100%"},{left:"0%",duration:duration*.68,ease:"power4.inOut"},at);
    tl.set(edge,{opacity:0},at+duration*.68);
    tl.fromTo(incoming,{xPercent:100,opacity:1},{xPercent:0,opacity:1,duration:duration*.68,ease:"power4.inOut"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-110,opacity:.4,duration:duration*.66,ease:"power2.inOut"},at);
    tl.to(outgoing,{xPercent:-100,opacity:1,duration:duration*.3,ease:"power3.in"},at+duration*.68);
    return tl;
  }
};

export const modernMinimalTransitionMeta={
  roles:{
    primary:["split-slide","axis-rise","clean-cross","frame-pull"],
    section:["blue-line-cut","grid-shift","panel-lock","section-index-swap"],
    accent:["aperture-box","precision-zoom","axis-fold","dot-expand","swiss-cross-cut","grid-dissolve","measure-cut","panel-slide-over"]
  },
  presets:{
    "split-slide":{label:"分屏推进",duration:.58,parts:["outgoing","incoming"],use:"相邻内容常规前推，新页压过旧页并带 360px 视差"},
    "axis-rise":{label:"纵轴规线上卷",duration:.66,parts:["outgoing","incoming","rule"],use:"纵向推进，钴蓝引导规线贴新页上缘行走"},
    "clean-cross":{label:"净交叉",duration:.68,parts:["outgoing","incoming"],use:"低干扰的冷静叠化，双方微缩呼吸"},
    "frame-pull":{label:"画框抽换",duration:.64,parts:["outgoing","incoming"],use:"新页自右侧开口拉满画框，旧页轻退"},
    "blue-line-cut":{label:"钴蓝裁线",duration:.52,parts:["outgoing","incoming","overlay"],use:"短促章节切：蓝线绘出、铺满、收拢"},
    "grid-shift":{label:"网格柱列飞越",duration:.7,parts:["outgoing","incoming","columns"],use:"结构变化，8 根柱列错位飞越完成交换"},
    "panel-lock":{label:"面板锁合",duration:.66,parts:["outgoing","incoming","overlay"],use:"炭黑面板由圆角锁合到全帧再释放"},
    "section-index-swap":{label:"章节索引换页",duration:.76,parts:["outgoing","incoming","index"],use:"大章节过门，巨号索引横穿画面"},
    "aperture-box":{label:"矩形光圈",duration:.68,parts:["outgoing","incoming"],use:"中心矩形光圈打开揭示新页，旧页失焦"},
    "precision-zoom":{label:"精密变焦",duration:.62,parts:["outgoing","incoming"],use:"旧页前推放大失焦，新页自景深收回"},
    "axis-fold":{label:"轴线折叠",duration:.72,parts:["outgoing","incoming"],use:"旧页绕水平轴折出，新页自底缘展开"},
    "dot-expand":{label:"焦点扩张",duration:.7,parts:["outgoing","incoming"],use:"焦点圆自 (78%,22%) 扩开圈入新页"},
    "swiss-cross-cut":{label:"十字规切",duration:.66,parts:["outgoing","incoming","ruleV","ruleH","cross"],use:"纵横规线同步扫过并在中心相交，竖线骑行揭示前缘"},
    "grid-dissolve":{label:"网格翻牌",duration:.78,parts:["outgoing","incoming","cells"],use:"24 格按阅读顺序翻牌覆盖再翻开，中点交换"},
    "measure-cut":{label:"量规裁切",duration:.7,parts:["outgoing","incoming","caliperL","caliperR"],use:"两根量规自两侧夹紧测量，咬合瞬间交换再释放"},
    "panel-slide-over":{label:"面板覆盖",duration:.74,parts:["outgoing","incoming","edge"],use:"新面板带钴蓝边缘滑覆旧页，旧页滞留后快速离场"}
  }
};
