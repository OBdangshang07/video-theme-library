export const paperEditorialMotions = {
  inkSlam(tl, target, at=0) { return tl.fromTo(target,{scale:1.16,opacity:0},{scale:1,opacity:1,duration:.62,ease:"power4.out"},at); },
  paperRise(tl, target, at=0, stagger=0) { return tl.fromTo(target,{y:46,opacity:0},{y:0,opacity:1,duration:.56,stagger,ease:"power3.out"},at); },
  barDraw(tl, target, at=0) { return tl.fromTo(target,{scaleX:0},{scaleX:1,duration:.95,ease:"power2.out"},at); },
  cascadeList(tl, target, at=0) { return tl.fromTo(target,{x:-88,opacity:0},{x:0,opacity:1,duration:.5,stagger:.08,ease:"expo.out"},at); },
  editorialWipe(tl, target, at=0) { return tl.fromTo(target,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.65,ease:"power3.inOut"},at); },
  stampImpact(tl, target, at=0) { return tl.fromTo(target,{scale:1.7,rotation:-8,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.38,ease:"back.out(2.2)"},at); },
  underlineDraw(tl, target, at=0) { return tl.fromTo(target,{scaleX:0},{scaleX:1,duration:.5,ease:"power2.out"},at); },
  folioSwap(tl, target, at=0) { return tl.fromTo(target,{y:-18,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out"},at); },
  redResultEmphasis(tl, target, at=0) { return tl.fromTo(target,{color:"#20262c",scale:.92},{color:"#b83b2f",scale:1,duration:.55,ease:"back.out(1.7)"},at); }
};

export function countUp(tl, element, end, at=0, duration=1.1, formatter=(v)=>Math.round(v).toString()) {
  const state={value:0};
  return tl.to(state,{value:end,duration,ease:"power3.out",onUpdate:()=>{element.textContent=formatter(state.value)}},at);
}
