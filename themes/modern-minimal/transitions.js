const reveal=(tl,outgoing,incoming,at)=>{tl.set(incoming,{opacity:1},at);return tl};
const swap=(tl,outgoing,incoming,at)=>{tl.set(incoming,{opacity:1},at);tl.set(outgoing,{opacity:0},at);return tl};

export const modernMinimalTransitions={
  splitSlide(tl,{outgoing,incoming},at,duration=.58){reveal(tl,outgoing,incoming,at);tl.fromTo(incoming,{x:1920},{x:0,duration,ease:"expo.inOut"},at);tl.to(outgoing,{x:-360,opacity:.35,duration,ease:"power3.inOut"},at);return tl},
  axisRise(tl,{outgoing,incoming},at,duration=.62){reveal(tl,outgoing,incoming,at);tl.fromTo(incoming,{y:1080},{y:0,duration,ease:"power3.inOut"},at);tl.to(outgoing,{y:-180,opacity:.28,duration,ease:"power2.inOut"},at);return tl},
  cleanCross(tl,{outgoing,incoming},at,duration=.68){tl.fromTo(incoming,{opacity:0,scale:.985},{opacity:1,scale:1,duration,ease:"sine.inOut"},at);tl.to(outgoing,{opacity:0,scale:1.015,duration,ease:"sine.inOut"},at);return tl},
  framePull(tl,{outgoing,incoming},at,duration=.64){reveal(tl,outgoing,incoming,at);tl.fromTo(incoming,{clipPath:"inset(7% 7% 7% 93%)",scale:.97},{clipPath:"inset(0% 0% 0% 0%)",scale:1,duration,ease:"power3.inOut"},at);tl.to(outgoing,{x:-90,opacity:.45,duration,ease:"power2.inOut"},at);return tl},
  blueLineCut(tl,{outgoing,incoming,overlay},at,duration=.52){const half=duration*.48;tl.set(overlay,{opacity:1,backgroundColor:"#2455ff",transformOrigin:"left center"},at);tl.fromTo(overlay,{scaleX:0},{scaleX:1,duration:half,ease:"expo.in"},at);swap(tl,outgoing,incoming,at+half);tl.set(overlay,{transformOrigin:"right center"},at+half);tl.to(overlay,{scaleX:0,duration:duration-half,ease:"expo.out"},at+half);return tl},
  gridShift(tl,{outgoing,incoming,columns},at,duration=.7){reveal(tl,outgoing,incoming,at);tl.fromTo(columns,{y:1080,opacity:1},{y:-1080,duration,stagger:.035,ease:"power3.inOut"},at);tl.to(outgoing,{opacity:0,duration:.08},at+duration*.48);return tl},
  panelLock(tl,{outgoing,incoming,overlay},at,duration=.66){tl.set(overlay,{opacity:1,backgroundColor:"#111317"},at);tl.fromTo(overlay,{scale:.82,borderRadius:"120px"},{scale:1,borderRadius:"0px",duration:duration*.5,ease:"power3.in"},at);swap(tl,outgoing,incoming,at+duration*.5);tl.to(overlay,{scale:.82,borderRadius:"120px",opacity:0,duration:duration*.5,ease:"power3.out"},at+duration*.5);return tl},
  sectionIndexSwap(tl,{outgoing,incoming,index},at,duration=.76){reveal(tl,outgoing,incoming,at);tl.fromTo(index,{x:1920,opacity:1},{x:-1920,duration,ease:"expo.inOut"},at);tl.to(outgoing,{opacity:0,duration:.1},at+duration*.48);tl.fromTo(incoming,{scale:.965},{scale:1,duration:duration*.52,ease:"power2.out"},at+duration*.48);return tl},
  apertureBox(tl,{outgoing,incoming},at,duration=.68){reveal(tl,outgoing,incoming,at);tl.fromTo(incoming,{clipPath:"inset(48% 48% 48% 48%)"},{clipPath:"inset(0% 0% 0% 0%)",duration,ease:"power3.inOut"},at);tl.to(outgoing,{scale:1.045,filter:"blur(4px)",duration,ease:"power2.inOut"},at);return tl},
  precisionZoom(tl,{outgoing,incoming},at,duration=.62){tl.fromTo(incoming,{scale:.72,opacity:0,filter:"blur(10px)"},{scale:1,opacity:1,filter:"blur(0px)",duration,ease:"expo.out"},at+duration*.18);tl.to(outgoing,{scale:1.32,opacity:0,filter:"blur(8px)",duration:duration*.7,ease:"power4.in"},at);return tl},
  axisFold(tl,{outgoing,incoming},at,duration=.72){reveal(tl,outgoing,incoming,at);tl.fromTo(outgoing,{rotationX:0,opacity:1},{rotationX:-86,opacity:0,duration,ease:"power3.in",transformOrigin:"center top",transformPerspective:1500},at);tl.fromTo(incoming,{rotationX:84,opacity:1},{rotationX:0,duration,ease:"power3.out",transformOrigin:"center bottom",transformPerspective:1500},at+duration*.2);return tl},
  dotExpand(tl,{outgoing,incoming},at,duration=.7){reveal(tl,outgoing,incoming,at);tl.fromTo(incoming,{clipPath:"circle(0% at 78% 22%)"},{clipPath:"circle(140% at 78% 22%)",duration,ease:"power3.inOut"},at);tl.to(outgoing,{x:-42,y:24,scale:.985,duration,ease:"power2.inOut"},at);return tl}
};

export const modernMinimalTransitionMeta={
  primary:["split-slide","axis-rise","clean-cross","frame-pull"],
  section:["blue-line-cut","grid-shift","panel-lock","section-index-swap"],
  accent:["aperture-box","precision-zoom","axis-fold","dot-expand"]
};

