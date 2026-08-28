export const voxelHarnessMotions={
  chunkLoad(tl,target,at=0,duration=.62){return tl.fromTo(target,{clipPath:"inset(0 100% 100% 0)",opacity:1},{clipPath:"inset(0 0% 0% 0)",opacity:1,duration,ease:"steps(6)"},at)},
  blockDrop(tl,target,at=0,duration=.5){return tl.fromTo(target,{y:-96,rotation:-2,opacity:0},{y:0,rotation:0,opacity:1,duration,ease:"bounce.out"},at)},
  slotCascade(tl,targets,at=0,duration=.44){return tl.fromTo(targets,{scale:.45,opacity:0},{scale:1,opacity:1,duration,stagger:.055,ease:"back.out(1.7)"},at)},
  commandType(tl,target,at=0,duration=.72){return tl.fromTo(target,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration,ease:"steps(12)"},at)},
  cursorSnap(tl,target,at=0,duration=.38){return tl.fromTo(target,{x:-48,opacity:0},{x:0,opacity:1,duration,ease:"expo.out"},at)},
  barCharge(tl,target,at=0,duration=.82){return tl.fromTo(target,{scaleX:0},{scaleX:1,duration,ease:"steps(16)",transformOrigin:"left center"},at)},
  itemPop(tl,target,at=0,duration=.42){return tl.fromTo(target,{scale:.2,rotation:-18,opacity:0},{scale:1,rotation:0,opacity:1,duration,ease:"back.out(2.2)"},at)},
  paneUnfold(tl,target,at=0,duration=.66){return tl.fromTo(target,{rotationY:-82,opacity:0},{rotationY:0,opacity:1,duration,ease:"power3.out",transformOrigin:"left center",transformPerspective:1300},at)},
  statusFlash(tl,target,at=0,duration=.54){return tl.fromTo(target,{backgroundColor:"#e46f3a",color:"#0e1410",scale:1.12},{backgroundColor:"#172019",color:"#ece8d6",scale:1,duration,ease:"power3.out"},at)},
  logoCraft(tl,target,at=0,duration=.74){return tl.fromTo(target,{scale:1.45,rotation:3,filter:"blur(9px)",opacity:0},{scale:1,rotation:0,filter:"blur(0px)",opacity:1,duration,ease:"expo.out"},at)}
};
export const voxelHarnessMotionMeta={
  "chunk-load":"Stepped chunk reveal","block-drop":"Weighted block arrival","slot-cascade":"Inventory slot sequence","command-type":"Command-line typing mask","cursor-snap":"Directional cursor lock","bar-charge":"Stepped XP/progress charge","item-pop":"Item icon impact","pane-unfold":"3D UI pane opening","status-flash":"Build status confirmation","logo-craft":"Hero lockup assembles into focus"
};

