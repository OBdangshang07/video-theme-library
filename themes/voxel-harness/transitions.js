const OBSIDIAN="#0E1410",SURFACE="#172019",SURFACE2="#202B22",ACCENT="#7BD14B",ALERT="#E46F3A";

const setSwap=(tl,outgoing,incoming,at)=>{
  tl.fromTo(incoming,{opacity:0},{opacity:1,duration:0},at);
  tl.fromTo(outgoing,{opacity:1},{opacity:0,duration:0},at);
};

export const voxelHarnessTransitions={
  chunkPush(tl,{outgoing,incoming},at,duration=.56){
    tl.fromTo(incoming,{x:1920,opacity:1},{x:0,opacity:1,duration,ease:"steps(8)"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-1920,opacity:1,duration,ease:"steps(8)"},at);
    return tl;
  },
  blockRise(tl,{outgoing,incoming},at,duration=.6){
    tl.fromTo(incoming,{y:1080,opacity:1},{y:0,opacity:1,duration:duration*.86,ease:"steps(7)"},at);
    tl.fromTo(incoming,{y:-18},{y:0,duration:duration*.14,ease:"steps(2)",immediateRender:false},at+duration*.86);
    tl.fromTo(outgoing,{y:0,opacity:1,filter:"brightness(1)"},{y:-420,opacity:1,filter:"brightness(.55)",duration,ease:"steps(7)"},at);
    return tl;
  },
  portalCross(tl,{outgoing,incoming},at,duration=.78){
    tl.fromTo(incoming,{clipPath:"circle(0% at 50% 50%)",scale:.86,filter:"blur(8px)",opacity:1},{clipPath:"circle(145% at 50% 50%)",scale:1,filter:"blur(0px)",opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{scale:1,filter:"blur(0px)",opacity:1},{scale:1.12,filter:"blur(9px)",opacity:1,duration,ease:"power2.inOut"},at);
    return tl;
  },
  cameraStep(tl,{outgoing,incoming},at,duration=.64){
    tl.fromTo(incoming,{scale:.72,x:190,opacity:0},{scale:1,x:0,opacity:1,duration,ease:"steps(8)"},at+duration*.14);
    tl.fromTo(outgoing,{scale:1,x:0,opacity:1},{scale:1.34,x:-230,opacity:0,duration:duration*.72,ease:"power4.in"},at);
    return tl;
  },
  craftGrid(tl,{outgoing,incoming,tiles},at,duration=.72){
    tl.set(tiles,{opacity:1},at);
    tl.fromTo(tiles,{scale:0},{scale:1,duration:duration*.46,stagger:.018,ease:"steps(3)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.to(tiles,{scale:0,duration:duration*.5,stagger:.014,ease:"steps(3)"},at+duration*.5);
    tl.set(tiles,{opacity:0},at+duration);
    return tl;
  },
  inventorySwap(tl,{outgoing,incoming,slots},at,duration=.68){
    tl.fromTo(slots,{y:160,opacity:0},{y:0,opacity:1,duration:duration*.5,stagger:.035,ease:"back.out(1.5)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.to(slots,{y:-160,opacity:0,duration:duration*.5,stagger:.035,ease:"power3.in"},at+duration*.5);
    return tl;
  },
  terrainWipe(tl,{outgoing,incoming,columns},at,duration=.72){
    tl.set(columns,{opacity:1},at);
    tl.fromTo(columns,{scaleY:0,transformOrigin:"center bottom"},{scaleY:1,duration:duration*.5,stagger:.035,ease:"steps(6)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.fromTo(columns,{yPercent:0},{yPercent:101,duration:duration*.46,stagger:.03,ease:"steps(5)"},at+duration*.54);
    tl.set(columns,{opacity:0},at+duration);
    return tl;
  },
  commandCut(tl,{outgoing,incoming,overlay},at,duration=.58){
    tl.set(overlay,{opacity:1,backgroundColor:ACCENT,transformOrigin:"left center"},at);
    tl.fromTo(overlay,{scaleX:0},{scaleX:1,duration:duration*.48,ease:"steps(8)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.48);
    tl.set(overlay,{transformOrigin:"right center"},at+duration*.5);
    tl.to(overlay,{scaleX:0,duration:duration*.5,ease:"steps(8)"},at+duration*.5);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  },
  enderIris(tl,{outgoing,incoming},at,duration=.76){
    tl.fromTo(incoming,{clipPath:"polygon(50% 50%,50% 50%,50% 50%,50% 50%)",rotation:.6,opacity:1},{clipPath:"polygon(-15% -15%,115% -15%,115% 115%,-15% 115%)",rotation:0,opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{scale:1,rotation:0,filter:"blur(0px)",opacity:1},{scale:1.08,rotation:-.4,filter:"blur(5px)",opacity:1,duration,ease:"power2.inOut"},at);
    return tl;
  },
  blockShatter(tl,{outgoing,incoming,tiles},at,duration=.7){
    tl.set(incoming,{opacity:1},at);
    tl.fromTo(tiles,{x:0,y:0,rotation:0,scale:1,opacity:1},{x:(index)=>((index%6)-2.5)*150,y:(index)=>(Math.floor(index/6)-1.5)*120,rotation:(index)=>(index%2?18:-18),scale:.45,opacity:0,duration,stagger:.012,ease:"power4.in"},at);
    tl.fromTo(outgoing,{opacity:1},{opacity:0,duration:.08,ease:"none"},at+duration*.5);
    return tl;
  },
  redstonePulse(tl,{outgoing,incoming,overlay},at,duration=.64){
    tl.set(overlay,{opacity:0,backgroundColor:ALERT},at);
    tl.to(overlay,{opacity:1,duration:duration*.38,ease:"steps(4)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.42);
    tl.to(overlay,{opacity:0,duration:duration*.58,ease:"power3.out"},at+duration*.42);
    return tl;
  },
  voxelFold(tl,{outgoing,incoming},at,duration=.72){
    tl.fromTo(outgoing,{rotationY:0,x:0,opacity:1,transformOrigin:"left center",transformPerspective:1200},{rotationY:-90,x:-220,opacity:0,duration,ease:"steps(8)"},at);
    tl.fromTo(incoming,{rotationY:90,x:220,opacity:1,transformOrigin:"right center",transformPerspective:1200},{rotationY:0,x:0,opacity:1,duration,ease:"steps(8)"},at);
    return tl;
  },
  pixelRain(tl,{outgoing,incoming,drops},at,duration=.78){
    tl.set(drops,{opacity:1},at);
    tl.fromTo(drops,{yPercent:-101},{yPercent:0,duration:duration*.42,stagger:.04,ease:"steps(6)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.fromTo(drops,{yPercent:0},{yPercent:101,duration:duration*.5,stagger:.04,ease:"steps(6)",immediateRender:false},at+duration*.5);
    tl.set(drops,{opacity:0},at+duration);
    return tl;
  },
  craftFlip(tl,{outgoing,incoming,tiles},at,duration=.76){
    tl.set(tiles,{opacity:1,transformPerspective:1000},at);
    tl.fromTo(tiles,{rotationX:-90,transformOrigin:"center center"},{rotationX:0,duration:duration*.44,stagger:.016,ease:"steps(4)"},at);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.to(tiles,{rotationX:90,duration:duration*.44,stagger:.016,ease:"steps(4)"},at+duration*.54);
    tl.set(tiles,{opacity:0},at+duration);
    return tl;
  },
  torchFlickerCut(tl,{outgoing,incoming,overlay},at,duration=.62){
    tl.set(overlay,{opacity:0,backgroundColor:ALERT},at);
    tl.to(overlay,{opacity:.55,duration:duration*.08,ease:"steps(1)"},at);
    tl.to(overlay,{opacity:.18,duration:duration*.07,ease:"steps(1)"},at+duration*.08);
    tl.to(overlay,{opacity:.82,duration:duration*.08,ease:"steps(1)"},at+duration*.15);
    tl.to(overlay,{opacity:1,duration:duration*.12,ease:"steps(1)"},at+duration*.23);
    setSwap(tl,outgoing,incoming,at+duration*.42);
    tl.to(overlay,{opacity:.35,duration:duration*.08,ease:"steps(1)"},at+duration*.46);
    tl.to(overlay,{opacity:.7,duration:duration*.07,ease:"steps(1)"},at+duration*.54);
    tl.to(overlay,{opacity:.22,duration:duration*.08,ease:"steps(1)"},at+duration*.61);
    tl.to(overlay,{opacity:0,duration:duration*.14,ease:"steps(2)"},at+duration*.69);
    return tl;
  },
  xpDrain(tl,{outgoing,incoming,track,fill},at,duration=.7){
    tl.set(track,{opacity:1},at);
    tl.set(fill,{opacity:1,transformOrigin:"left center"},at);
    tl.fromTo(fill,{scaleX:0,scaleY:1},{scaleX:1,duration:duration*.34,ease:"steps(10)"},at);
    tl.set(fill,{transformOrigin:"center center"},at+duration*.34);
    tl.to(fill,{scaleY:64,duration:duration*.14,ease:"steps(3)"},at+duration*.34);
    tl.to(track,{opacity:0,duration:duration*.1,ease:"none"},at+duration*.34);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.set(fill,{transformOrigin:"center bottom"},at+duration*.52);
    tl.to(fill,{scaleY:1,duration:duration*.16,ease:"steps(3)"},at+duration*.52);
    tl.set(fill,{transformOrigin:"right center"},at+duration*.68);
    tl.to(fill,{scaleX:0,duration:duration*.24,ease:"steps(10)"},at+duration*.68);
    tl.set(fill,{opacity:0},at+duration);
    return tl;
  }
};

export const voxelHarnessTransitionMeta={
  roles:{
    primary:["chunk-push","block-rise","portal-cross","camera-step"],
    section:["craft-grid","inventory-swap","terrain-wipe","command-cut"],
    accent:["ender-iris","block-shatter","redstone-pulse","voxel-fold","pixel-rain","craft-flip","torch-flicker-cut","xp-drain"]
  },
  presets:{
    "chunk-push":{label:"区块横推",duration:.56,parts:["outgoing","incoming"],use:"相邻画面常规前推，新页步进压过旧页"},
    "block-rise":{label:"地层升起",duration:.6,parts:["outgoing","incoming"],use:"纵向推进：新页升起后落块压实，旧页视差滞后变暗"},
    "portal-cross":{label:"传送门穿越",duration:.78,parts:["outgoing","incoming"],use:"维度或模式切换，旧场失焦放大、新场自传送门圈入"},
    "camera-step":{label:"相机步进",duration:.64,parts:["outgoing","incoming"],use:"视角推进或缩放式交接，步进跟拍"},
    "craft-grid":{label:"合成格重组",duration:.72,parts:["outgoing","incoming","tiles"],use:"功能组与配方揭晓，合成格拼满后拆解"},
    "inventory-swap":{label:"物品栏换页",duration:.68,parts:["outgoing","incoming","slots"],use:"并列功能或物品组切换，热键栏飞过"},
    "terrain-wipe":{label:"地形生长",duration:.72,parts:["outgoing","incoming","columns"],use:"章节段落，地形柱生长覆盖后沉降让位"},
    "command-cut":{label:"指令裁切",duration:.58,parts:["outgoing","incoming","overlay"],use:"短促果断的段落切：草绿指令带步进扫过"},
    "ender-iris":{label:"末影光圈",duration:.76,parts:["outgoing","incoming"],use:"英雄结果或核心 UI 的方形光圈圈入"},
    "block-shatter":{label:"方块碎解",duration:.7,parts:["outgoing","incoming","tiles"],use:"强对比或重构，旧场碎成方块散场"},
    "redstone-pulse":{label:"红石脉冲",duration:.64,parts:["outgoing","incoming","overlay"],use:"状态翻转与构建脉冲，一次干净的红石电流"},
    "voxel-fold":{label:"体素折页",duration:.72,parts:["outgoing","incoming"],use:"版本或文档更替，旧场 3D 折出、新场折入"},
    "pixel-rain":{label:"像素雨幕",duration:.78,parts:["outgoing","incoming","drops"],use:"段落收尾或场景沉降，方块柱步进坠落覆盖再坠离"},
    "craft-flip":{label:"格阵翻板",duration:.76,parts:["outgoing","incoming","tiles"],use:"配方或界面组翻面更替，翻板合拢再翻开"},
    "torch-flicker-cut":{label:"火把烁切",duration:.62,parts:["outgoing","incoming","overlay"],use:"洞穴感换场：火光不规则烁亮完成交换"},
    "xp-drain":{label:"经验槽抽换",duration:.7,parts:["outgoing","incoming","track","fill"],use:"能量交接：XP 槽充能、爆满覆盖、回流排空"}
  }
};
