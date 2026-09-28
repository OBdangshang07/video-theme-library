const OBSIDIAN="#0E1410",SURFACE="#172019",INK="#ECE8D6",ACCENT="#7BD14B",ALERT="#E46F3A";

export const voxelHarnessMotions={
  chunkLoad(tl,target,at=0,duration=.62){
    return tl.fromTo(target,
      {clipPath:"inset(0 100% 100% 0)",opacity:1},
      {clipPath:"inset(0 0% 0% 0)",opacity:1,duration,ease:"steps(6)"},at);
  },
  blockDrop(tl,target,at=0,duration=.5){
    return tl.fromTo(target,
      {y:-96,rotation:-2,opacity:0},
      {y:0,rotation:0,opacity:1,duration,ease:"bounce.out"},at);
  },
  slotCascade(tl,targets,at=0,duration=.44,stagger=.055){
    return tl.fromTo(targets,
      {scale:.45,opacity:0},
      {scale:1,opacity:1,duration,stagger,ease:"back.out(1.7)"},at);
  },
  commandType(tl,target,at=0,duration=.72){
    return tl.fromTo(target,
      {clipPath:"inset(0 100% 0 0)"},
      {clipPath:"inset(0 0% 0 0)",duration,ease:"steps(12)"},at);
  },
  cursorSnap(tl,target,at=0,duration=.38){
    return tl.fromTo(target,
      {x:-48,opacity:0},
      {x:0,opacity:1,duration,ease:"expo.out"},at);
  },
  barCharge(tl,target,at=0,duration=.82){
    return tl.fromTo(target,
      {scaleX:0,transformOrigin:"left center"},
      {scaleX:1,duration,ease:"steps(16)"},at);
  },
  itemPop(tl,target,at=0,duration=.42){
    return tl.fromTo(target,
      {scale:.2,rotation:-18,opacity:0},
      {scale:1,rotation:0,opacity:1,duration,ease:"back.out(2.2)"},at);
  },
  paneUnfold(tl,target,at=0,duration=.66){
    return tl.fromTo(target,
      {rotationY:-82,opacity:0,transformOrigin:"left center",transformPerspective:1300},
      {rotationY:0,opacity:1,duration,ease:"power3.out"},at);
  },
  statusFlash(tl,target,at=0,duration=.54){
    return tl.fromTo(target,
      {backgroundColor:ALERT,color:OBSIDIAN,scale:1.12},
      {backgroundColor:SURFACE,color:INK,scale:1,duration,ease:"power3.out"},at);
  },
  logoCraft(tl,target,at=0,duration=.74){
    return tl.fromTo(target,
      {scale:1.45,rotation:3,filter:"blur(9px)",opacity:0},
      {scale:1,rotation:0,filter:"blur(0px)",opacity:1,duration,ease:"expo.out"},at);
  },
  xpCount(tl,target,at=0,end=100,duration=1.1,formatter=(value)=>Math.round(value).toString()){
    const element=typeof target==="string"&&typeof document!=="undefined"?document.querySelector(target):target;
    const state={value:0};
    return tl.to(state,{value:end,duration,ease:"steps(16)",onUpdate:()=>{element.textContent=formatter(state.value)}},at);
  },
  hudUnveil(tl,root,at=0,progressDuration=0){
    tl.fromTo(`${root} .vh-dossier-head`,{y:-16,opacity:0},{y:0,opacity:1,duration:.3,ease:"steps(4)"},at+.04);
    tl.fromTo(`${root} .vh-dossier-frame`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.6,ease:"steps(8)"},at+.08);
    tl.fromTo(`${root} .vh-dossier-crop`,{opacity:0,scale:1.6},{opacity:1,scale:1,duration:.26,stagger:.05,ease:"steps(3)"},at+.22);
    tl.fromTo(`${root} .vh-dossier-footer`,{y:-10,opacity:0},{y:0,opacity:1,duration:.3,ease:"steps(4)"},at+.26);
    tl.fromTo(`${root} .vh-dossier-spine, ${root} .vh-dossier-edition`,{opacity:0},{opacity:1,duration:.32,ease:"steps(4)"},at+.32);
    if(progressDuration>0)tl.fromTo(`${root} .vh-dossier-progress > span`,{scaleX:0},{scaleX:1,duration:progressDuration,ease:"none"},at);
    return tl;
  },
  chunkMark(tl,root,at=0){
    tl.fromTo(`${root} .vh-chunk-kicker`,{y:-12,opacity:0},{y:0,opacity:1,duration:.28,ease:"steps(3)"},at);
    tl.fromTo(`${root} .vh-chunk-index`,{scale:1.18,opacity:0,filter:"blur(4px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:.46,ease:"steps(5)"},at+.06);
    tl.fromTo(`${root} .vh-chunk-title`,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.5,ease:"steps(7)"},at+.18);
    return tl.fromTo(`${root} .vh-chunk-rule`,{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:.46,ease:"steps(8)"},at+.3);
  },
  lockupBoot(tl,root,at=0){
    tl.fromTo(`${root} .vh-lockup-line`,{y:36,opacity:0},{y:0,opacity:1,duration:.5,stagger:.12,ease:"steps(6)"},at);
    tl.fromTo(`${root} .vh-lockup-mark`,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.28,ease:"back.out(2)"},at+.48);
    return tl.fromTo(`${root} .vh-lockup-note`,{opacity:0},{opacity:1,duration:.34,ease:"steps(4)"},at+.66);
  }
};

export const voxelHarnessMotionMeta={
  "chunk-load":{label:"区块加载",duration:.62,use:"面板与整版内容的阶梯式区块揭示"},
  "block-drop":{label:"落块",duration:.5,use:"方块、物品或重点元素带重量落下弹稳"},
  "slot-cascade":{label:"槽位级联",duration:.44,use:"物品栏、功能槽位依次弹出，可级联"},
  "command-type":{label:"指令输入",duration:.72,use:"命令行、路径与代码的逐段步进输入"},
  "cursor-snap":{label:"光标锁定",duration:.38,use:"提示符、状态行快速锁定到位"},
  "bar-charge":{label:"经验充能",duration:.82,use:"XP 条、进度与加载刻度分段充能"},
  "item-pop":{label:"物品弹入",duration:.42,use:"图标、标记与快捷键落入槽位"},
  "pane-unfold":{label:"界面展开",duration:.66,use:"UI 面板沿左轴 3D 展开"},
  "status-flash":{label:"状态确认",duration:.54,use:"构建/发布状态由红石脉冲回到稳定态"},
  "logo-craft":{label:"主标合成",duration:.74,use:"英雄标题与发布主张合成聚焦"},
  "xp-count":{label:"经验计数",duration:1.1,use:"xp-stat 数值的参数化步进滚动，支持格式化"},
  "hud-unveil":{label:"HUD 揭幕",duration:1,use:"gameplay-dossier 协同揭幕：头部、边框、裁切标记、页脚与进度轨分层入场"},
  "chunk-mark":{label:"章节落块",duration:.76,use:"chunk-divider 整体编排：序号定版、标题步进拭入、草绿规线充能"},
  "lockup-boot":{label:"收尾启动",duration:1,use:"release-lockup 整体编排：结语句步进升起、句读落印、落款淡入"}
};

export const xpCount=voxelHarnessMotions.xpCount;
