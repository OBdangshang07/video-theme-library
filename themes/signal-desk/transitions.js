const INK="#F3EFE4",AMBER="#FFB000",ALERT="#EF4B3F",BG="#0B1320";

const setSwap=(tl,outgoing,incoming,at)=>{
  tl.fromTo(incoming,{opacity:0},{opacity:1,duration:0},at);
  tl.fromTo(outgoing,{opacity:1},{opacity:0,duration:0},at);
};

export const signalDeskTransitions={
  ribbonHandoff(tl,{outgoing,incoming,ribbon},at,duration=.72){
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-120,opacity:.28,duration,ease:"power3.inOut"},at);
    tl.fromTo(incoming,{x:210,opacity:0,clipPath:"inset(0 0 0 22%)"},{x:0,opacity:1,clipPath:"inset(0 0 0 0%)",duration:duration*.66,ease:"power4.out"},at+duration*.34);
    tl.set(ribbon,{opacity:1},at);
    tl.fromTo(ribbon,{xPercent:-105,skewX:-8},{xPercent:105,skewX:0,duration,ease:"expo.inOut"},at);
    tl.set(ribbon,{opacity:0},at+duration);
    return tl;
  },
  headlinePush(tl,{outgoing,incoming,headline},at,duration=.68){
    tl.fromTo(outgoing,{y:0,opacity:1,clipPath:"inset(0 0 0% 0)"},{y:-100,opacity:1,clipPath:"inset(0 0 48% 0)",duration:duration*.55,ease:"power3.in"},at);
    tl.fromTo(incoming,{y:130,opacity:0,clipPath:"inset(50% 0 0 0)"},{y:0,opacity:1,clipPath:"inset(0% 0 0 0)",duration:duration*.55,ease:"power4.out"},at+duration*.35);
    tl.set(headline,{opacity:1},at);
    tl.fromTo(headline,{xPercent:100,scaleX:1.35},{xPercent:-100,scaleX:1,duration,ease:"expo.inOut"},at);
    tl.set(headline,{opacity:0},at+duration);
    return tl;
  },
  deskCross(tl,{outgoing,incoming,rails},at,duration=.74){
    tl.set(rails,{opacity:1},at);
    tl.fromTo(rails,{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:duration*.44,stagger:.045,ease:"expo.in"},at);
    tl.fromTo(outgoing,{scale:1,opacity:1},{scale:.965,opacity:.18,duration:duration*.54,ease:"power2.in"},at);
    tl.fromTo(incoming,{scale:1.04,opacity:0},{scale:1,opacity:1,duration:duration*.5,ease:"power3.out"},at+duration*.42);
    tl.set(rails,{transformOrigin:"right center"},at+duration*.58);
    tl.to(rails,{scaleX:0,duration:duration*.34,stagger:.035,ease:"expo.out"},at+duration*.58);
    tl.set(rails,{opacity:0},at+duration);
    return tl;
  },
  feedRise(tl,{outgoing,incoming,rows},at,duration=.7){
    tl.set(rows,{opacity:1},at);
    tl.fromTo(rows,{yPercent:640},{yPercent:-640,duration,stagger:.04,ease:"power3.inOut"},at);
    tl.set(rows,{opacity:0},at+duration);
    tl.fromTo(outgoing,{y:0,opacity:1},{y:-86,opacity:.18,duration:duration*.56,ease:"power2.in"},at);
    tl.fromTo(incoming,{y:110,opacity:0},{y:0,opacity:1,duration:duration*.5,ease:"power4.out"},at+duration*.42);
    return tl;
  },
  timecodeJump(tl,{outgoing,incoming,timecode},at,duration=.76){
    tl.set(timecode,{opacity:1},at);
    tl.fromTo(timecode,{scale:1,xPercent:0},{scale:5.8,xPercent:-240,duration:duration*.47,ease:"power4.in"},at);
    setSwap(tl,outgoing,incoming,at+duration*.47);
    tl.fromTo(incoming,{clipPath:"inset(45% 0 45% 0)"},{clipPath:"inset(0% 0 0% 0)",duration:duration*.53,ease:"expo.out"},at+duration*.47);
    tl.to(timecode,{scale:6.4,xPercent:-260,opacity:0,duration:duration*.38,ease:"power3.out"},at+duration*.48);
    return tl;
  },
  bulletinShutter(tl,{outgoing,incoming,slats},at,duration=.78){
    tl.set(slats,{opacity:1},at);
    tl.fromTo(slats,{scaleY:0,transformOrigin:"center top"},{scaleY:1,duration:duration*.42,stagger:.035,ease:"power4.in"},at);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.set(slats,{transformOrigin:"center bottom"},at+duration*.46);
    tl.to(slats,{scaleY:0,duration:duration*.45,stagger:{each:.03,from:"end"},ease:"power4.out"},at+duration*.46);
    tl.set(slats,{opacity:0},at+duration);
    return tl;
  },
  sourceStack(tl,{outgoing,incoming,cards},at,duration=.8){
    tl.set(cards,{opacity:1},at);
    tl.fromTo(cards,{xPercent:125,rotationZ:2},{xPercent:-125,rotationZ:-1,duration,stagger:.055,ease:"expo.inOut"},at);
    tl.set(cards,{opacity:0},at+duration);
    tl.fromTo(outgoing,{x:0,scale:1,opacity:1},{x:-130,scale:.97,opacity:.2,duration:duration*.6,ease:"power3.in"},at);
    tl.fromTo(incoming,{x:130,scale:1.02,opacity:0},{x:0,scale:1,opacity:1,duration:duration*.48,ease:"power4.out"},at+duration*.45);
    return tl;
  },
  signalCut(tl,{outgoing,incoming,signal,rings},at,duration=.68){
    tl.set(signal,{opacity:1},at);
    tl.fromTo(signal,{scale:.1},{scale:1,duration:duration*.38,ease:"back.out(1.6)"},at);
    tl.set(rings,{opacity:.9},at+.08);
    tl.fromTo(rings,{scale:.2},{scale:7,duration:duration*.64,stagger:.05,ease:"power3.out"},at+.08);
    tl.set(rings,{opacity:0},at+.08+duration*.64);
    tl.fromTo(outgoing,{clipPath:"circle(145% at 78% 22%)"},{clipPath:"circle(0% at 78% 22%)",duration:duration*.52,ease:"power4.in"},at+.08);
    tl.fromTo(incoming,{opacity:1,clipPath:"circle(0% at 78% 22%)"},{opacity:1,clipPath:"circle(145% at 78% 22%)",duration:duration*.48,ease:"power4.out"},at+duration*.34);
    tl.to(signal,{scale:.7,opacity:0,duration:duration*.2,ease:"power2.out"},at+duration*.62);
    return tl;
  },
  breakingFlash(tl,{outgoing,incoming,flash,banner},at,duration=.58){
    tl.set(flash,{opacity:1},at);
    tl.fromTo(flash,{scaleY:.04,transformOrigin:"center center"},{scaleY:1,duration:duration*.32,ease:"expo.in"},at);
    tl.set(banner,{opacity:1},at);
    tl.fromTo(banner,{xPercent:-110,skewX:-12},{xPercent:110,skewX:0,duration:duration*.7,ease:"expo.inOut"},at+.04);
    tl.set(banner,{opacity:0},at+.04+duration*.7);
    setSwap(tl,outgoing,incoming,at+duration*.34);
    tl.to(flash,{scaleY:.04,duration:duration*.3,ease:"expo.out"},at+duration*.36);
    tl.set(flash,{opacity:0},at+duration*.66);
    return tl;
  },
  headlineCrush(tl,{outgoing,incoming,words},at,duration=.72){
    tl.fromTo(outgoing,{scaleX:1,opacity:1,filter:"blur(0px)",transformOrigin:"left center"},{scaleX:.12,opacity:.2,filter:"blur(10px)",duration:duration*.46,ease:"power4.in"},at);
    tl.set(words,{opacity:1},at);
    tl.fromTo(words,{scaleX:3.2,x:420,transformOrigin:"left center"},{scaleX:1,x:0,duration:duration*.55,stagger:.045,ease:"expo.out"},at+duration*.31);
    tl.fromTo(incoming,{opacity:0,clipPath:"inset(0 0 0 92%)"},{opacity:1,clipPath:"inset(0 0 0 0%)",duration:duration*.5,ease:"power4.out"},at+duration*.34);
    tl.to(words,{x:-70,scaleX:.9,opacity:0,duration:duration*.16,stagger:.025,ease:"power2.in"},at+duration*.82);
    return tl;
  },
  mapAperture(tl,{outgoing,incoming,aperture,markers},at,duration=.82){
    tl.set(aperture,{opacity:.92},at);
    tl.fromTo(aperture,{clipPath:"polygon(50% 50%,50% 50%,50% 50%,50% 50%)",rotation:8},{clipPath:"polygon(0% 8%,92% 0%,100% 92%,8% 100%)",rotation:0,duration:duration*.62,ease:"expo.inOut"},at);
    tl.fromTo(outgoing,{scale:1,opacity:1,filter:"blur(0px)"},{scale:1.13,opacity:.15,filter:"blur(8px)",duration:duration*.62,ease:"power3.in"},at);
    tl.set(markers,{opacity:1},at+duration*.5);
    tl.fromTo(markers,{scale:0},{scale:1,duration:duration*.32,stagger:.06,ease:"back.out(1.7)"},at+duration*.5);
    tl.fromTo(incoming,{scale:.93,opacity:0},{scale:1,opacity:1,duration:duration*.42,ease:"power3.out"},at+duration*.4);
    tl.to(aperture,{opacity:0,duration:duration*.22,ease:"power2.out"},at+duration*.62);
    tl.to(markers,{scale:.7,opacity:0,duration:duration*.18,stagger:.025,ease:"power2.in"},at+duration*.78);
    return tl;
  },
  dataCollapse(tl,{outgoing,incoming,bars,datum},at,duration=.78){
    tl.set(bars,{opacity:1},at);
    tl.fromTo(bars,{scaleY:1,transformOrigin:"center bottom"},{scaleY:.04,duration:duration*.3,stagger:{each:.025,from:"edges"},ease:"power4.in"},at);
    tl.to(bars,{opacity:0,duration:duration*.1},at+duration*.55);
    tl.fromTo(outgoing,{opacity:1,clipPath:"inset(0% 0 0% 0)"},{opacity:.3,clipPath:"inset(46% 0 46% 0)",duration:duration*.42,ease:"expo.in"},at+.08);
    tl.fromTo(incoming,{opacity:0,clipPath:"inset(48% 0 48% 0)"},{opacity:1,clipPath:"inset(0% 0 0% 0)",duration:duration*.5,ease:"power4.out"},at+duration*.28);
    tl.set(datum,{opacity:1},at+duration*.31);
    tl.fromTo(datum,{scale:6,filter:"blur(12px)"},{scale:1,filter:"blur(0px)",duration:duration*.46,ease:"expo.out"},at+duration*.31);
    tl.to(datum,{scale:.9,opacity:0,duration:duration*.14,ease:"power2.in"},at+duration*.78);
    return tl;
  },
  staticWipe(tl,{outgoing,incoming,band},at,duration=.64){
    tl.set(band,{opacity:1},at);
    tl.fromTo(band,{xPercent:-130,skewX:-6},{xPercent:560,skewX:0,duration,ease:"power2.inOut"},at);
    tl.set(band,{opacity:0},at+duration);
    tl.fromTo(outgoing,{opacity:1,filter:"brightness(1)"},{opacity:1,filter:"brightness(1.7)",duration:duration*.3,ease:"power2.in"},at+duration*.18);
    tl.to(outgoing,{filter:"brightness(1)",duration:duration*.25,ease:"power2.out"},at+duration*.48);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.fromTo(incoming,{scale:1.04},{scale:1,duration:duration*.5,ease:"power3.out"},at+duration*.5);
    return tl;
  },
  amberRuleCut(tl,{outgoing,incoming,rule,slabs},at,duration=.66){
    tl.set(rule,{opacity:1},at);
    tl.set(slabs,{opacity:1},at);
    tl.fromTo(rule,{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:.18,ease:"power3.inOut"},at);
    tl.fromTo(slabs,{scaleY:0,transformOrigin:(index)=>index?"center top":"center bottom"},{scaleY:1,duration:duration*.34,ease:"power3.in"},at+.14);
    setSwap(tl,outgoing,incoming,at+.14+duration*.34);
    tl.to(slabs,{yPercent:(index)=>index?101:-101,duration:duration*.36,ease:"power3.inOut"},at+.18+duration*.34);
    tl.to(rule,{scaleX:0,transformOrigin:"right center",duration:.14,ease:"power2.in"},at+duration-.14);
    tl.set([rule,slabs],{opacity:0},at+duration);
    return tl;
  },
  teletypeRoll(tl,{outgoing,incoming,bar},at,duration=.7){
    tl.fromTo(outgoing,{opacity:1,filter:"brightness(1)"},{opacity:.35,filter:"brightness(.55)",duration:duration*.5,ease:"power2.inOut"},at+duration*.3);
    tl.fromTo(incoming,{yPercent:100,opacity:1},{yPercent:0,opacity:1,duration:duration*.8,ease:"steps(14)"},at+duration*.2);
    tl.set(bar,{opacity:1},at+duration*.2);
    tl.fromTo(bar,{y:1080},{y:0,duration:duration*.8,ease:"steps(14)"},at+duration*.2);
    tl.set(bar,{opacity:0},at+duration);
    return tl;
  },
  channelZap(tl,{outgoing,incoming,glow},at,duration=.62){
    tl.fromTo(outgoing,{scaleY:1,opacity:1,filter:"brightness(1)",transformOrigin:"center center"},{scaleY:.004,opacity:1,filter:"brightness(2.2)",duration:duration*.42,ease:"power4.in"},at);
    tl.set(glow,{opacity:1},at+duration*.38);
    tl.fromTo(glow,{scaleX:.15,transformOrigin:"center center"},{scaleX:1,duration:duration*.18,ease:"power2.out"},at+duration*.38);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.fromTo(incoming,{scaleY:.004,transformOrigin:"center center"},{scaleY:1,duration:duration*.44,ease:"power3.out"},at+duration*.5);
    tl.to(glow,{scaleX:1.1,opacity:0,duration:duration*.24,ease:"power2.out"},at+duration*.56);
    return tl;
  }
};

export const signalDeskTransitionMeta={
  roles:{
    primary:["ribbon-handoff","headline-push","desk-cross","feed-rise"],
    section:["timecode-jump","bulletin-shutter","source-stack","signal-cut"],
    accent:["breaking-flash","headline-crush","map-aperture","data-collapse","static-wipe","amber-rule-cut","teletype-roll","channel-zap"]
  },
  presets:{
    "ribbon-handoff":{label:"快讯带交接",duration:.72,parts:["outgoing","incoming","ribbon"],use:"相邻快讯的常规交接，琥珀快讯带扫过带出新页"},
    "headline-push":{label:"标题层推进",duration:.68,parts:["outgoing","incoming","headline"],use:"标题带横向推进，旧页上收、新页下迎"},
    "desk-cross":{label:"编辑台交叉",duration:.74,parts:["outgoing","incoming","rails"],use:"栏目内的冷静交叉，琥珀规线编织后交换"},
    "feed-rise":{label:"信息流上卷",duration:.7,parts:["outgoing","incoming","rows"],use:"时间线或信息流推进，行组上卷飞过"},
    "timecode-jump":{label:"时间码跳转",duration:.76,parts:["outgoing","incoming","timecode"],use:"时间跳跃或节点推进，时间码放大扑出后揭示新场"},
    "bulletin-shutter":{label:"公报百叶",duration:.78,parts:["outgoing","incoming","slats"],use:"公告与档案段落，竖条合拢交换后展开"},
    "source-stack":{label:"来源卡堆叠",duration:.8,parts:["outgoing","incoming","cards"],use:"多来源汇总，来源卡自右飞入自左飞出"},
    "signal-cut":{label:"信号点切换",duration:.68,parts:["outgoing","incoming","signal","rings"],use:"状态切换，信号点定位后环形扩散圈入新场"},
    "breaking-flash":{label:"突发闪切",duration:.58,parts:["outgoing","incoming","flash","banner"],use:"突发与修正专用，红色闪屏覆盖交换"},
    "headline-crush":{label:"标题压缩",duration:.72,parts:["outgoing","incoming","words"],use:"强对比转折，旧标题压扁退场、关键词砸入"},
    "map-aperture":{label:"空间光圈",duration:.82,parts:["outgoing","incoming","aperture","markers"],use:"地点、空间或维度切换，旋转光圈覆盖后揭示"},
    "data-collapse":{label:"数据坍缩",duration:.78,parts:["outgoing","incoming","bars","datum"],use:"关键数据揭晓，数据条坍缩后单值放大定格"},
    "static-wipe":{label:"静噪扫拭",duration:.64,parts:["outgoing","incoming","band"],use:"信号受扰的硬切，静噪带扫过完成交换"},
    "amber-rule-cut":{label:"琥珀规切",duration:.66,parts:["outgoing","incoming","rule","slabs"],use:"短促有力的段落切：规线绘出、铺满、分裂退场"},
    "teletype-roll":{label:"电传上卷",duration:.7,parts:["outgoing","incoming","bar"],use:"机械电传感换页，新页步进上卷、引导规线同步"},
    "channel-zap":{label:"频道瞬切",duration:.62,parts:["outgoing","incoming","glow"],use:"快速换台感切换，旧场压成亮线后新场展开"}
  }
};
