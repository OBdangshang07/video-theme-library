export const modernMinimalMotions={
  gridReveal(tl,target,at=0,duration=.72){return tl.fromTo(target,{opacity:0,clipPath:"inset(0 100% 0 0)"},{opacity:1,clipPath:"inset(0 0% 0 0)",duration,ease:"expo.out"},at)},
  precisionRise(tl,target,at=0,duration=.54){return tl.fromTo(target,{y:48,opacity:0},{y:0,opacity:1,duration,ease:"power3.out"},at)},
  numberRoll(tl,state,{value,onUpdate},at=0,duration=.9){state.value=0;return tl.to(state,{value,duration,ease:"power3.out",onUpdate:()=>onUpdate(Math.round(state.value*10)/10)},at)},
  ruleExpand(tl,target,at=0,duration=.5){return tl.fromTo(target,{scaleX:0},{scaleX:1,duration,ease:"expo.out",transformOrigin:"left center"},at)},
  listStagger(tl,targets,at=0,duration=.5){return tl.fromTo(targets,{x:-38,opacity:0},{x:0,opacity:1,duration,stagger:.08,ease:"power3.out"},at)},
  maskSlide(tl,target,at=0,duration=.68){return tl.fromTo(target,{x:-70,clipPath:"inset(0 100% 0 0)",opacity:1},{x:0,clipPath:"inset(0 0% 0 0)",duration,ease:"power4.out"},at)},
  focusSnap(tl,target,at=0,duration=.48){return tl.fromTo(target,{scale:1.08,filter:"blur(12px)",opacity:0},{scale:1,filter:"blur(0px)",opacity:1,duration,ease:"power2.out"},at)},
  softEmphasis(tl,target,at=0,duration=.72){return tl.fromTo(target,{color:"#111317",scale:.94},{color:"#2455ff",scale:1,duration,ease:"back.out(1.25)"},at)},
  indexShift(tl,target,at=0,duration=.62){return tl.fromTo(target,{x:-86,letterSpacing:".08em",opacity:0},{x:0,letterSpacing:"-.08em",opacity:1,duration,ease:"expo.out"},at)},
  closingCompress(tl,target,at=0,duration=.66){return tl.fromTo(target,{scaleX:1.14,opacity:0},{scaleX:1,opacity:1,duration,ease:"power3.out",transformOrigin:"left center"},at)}
};

export const modernMinimalMotionMeta={
  "grid-reveal":"Grid-aligned reveal for titles and media",
  "precision-rise":"Short vertical arrival for panels",
  "number-roll":"Measured numeric count-up",
  "rule-expand":"Structural rule draws across the frame",
  "list-stagger":"Ordered row entrance",
  "mask-slide":"Directional content reveal",
  "focus-snap":"Soft optical focus resolves into place",
  "soft-emphasis":"Accent-color emphasis with restrained scale",
  "index-shift":"Large section index locks to the grid",
  "closing-compress":"Closing lockup settles from horizontal tension"
};

