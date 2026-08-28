const setSwap=(tl,outgoing,incoming,at)=>{
  tl.set(incoming,{opacity:1},at);
  tl.set(outgoing,{opacity:0},at);
};

const coverTransition=(tl,{outgoing,incoming,overlay},at,duration,color="#20262c",axis="x")=>{
  const scale=axis==="y"?"scaleY":"scaleX";
  const originIn=axis==="y"?"center top":"left center";
  const originOut=axis==="y"?"center bottom":"right center";
  const half=duration*.5;
  tl.set(overlay,{opacity:1,backgroundColor:color,transformOrigin:originIn},at);
  tl.fromTo(overlay,{[scale]:0},{[scale]:1,duration:half,ease:"power3.inOut"},at);
  setSwap(tl,outgoing,incoming,at+half);
  tl.set(overlay,{transformOrigin:originOut},at+half);
  tl.to(overlay,{[scale]:0,duration:half,ease:"power3.inOut"},at+half);
  tl.set(overlay,{opacity:0},at+duration);
  return tl;
};

export const paperEditorialTransitions={
  paperPush(tl,{outgoing,incoming},at,duration=.62){
    tl.fromTo(incoming,{x:1920,opacity:1},{x:0,opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{x:0,opacity:1},{x:-1920,opacity:1,duration,ease:"power3.inOut"},at);
    return tl;
  },
  folioRise(tl,{outgoing,incoming},at,duration=.66){
    tl.fromTo(incoming,{y:1080,opacity:1},{y:0,opacity:1,duration,ease:"power3.inOut"},at);
    tl.fromTo(outgoing,{y:0,opacity:1},{y:-1080,opacity:1,duration,ease:"power3.inOut"},at);
    return tl;
  },
  redRuleCut(tl,parts,at,duration=.56){return coverTransition(tl,parts,at,duration,"#b83b2f","x")},
  marginPull(tl,parts,at,duration=.68){return coverTransition(tl,parts,at,duration,"#20262c","x")},
  inkDip(tl,{outgoing,incoming,overlay},at,duration=.72){
    const half=duration*.5;
    tl.set(overlay,{opacity:0,backgroundColor:"#20262c"},at);
    tl.to(overlay,{opacity:1,duration:half,ease:"sine.inOut"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.to(overlay,{opacity:0,duration:half,ease:"sine.inOut"},at+half);
    return tl;
  },
  inkSweep(tl,{outgoing,incoming},at,duration=.78){
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0 0,0 0,4% 18%,0 38%,6% 58%,0 78%,3% 100%,0 100%)"},{opacity:1,clipPath:"polygon(0 0,100% 0,100% 18%,100% 38%,100% 58%,100% 78%,100% 100%,0 100%)",duration,ease:"power3.inOut"},at);
    tl.to(outgoing,{x:-70,scale:.985,duration,ease:"power2.inOut"},at);
    return tl;
  },
  tearWipe(tl,{outgoing,incoming},at,duration=.7){
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0 0,0 0,0 12%,3% 20%,0 30%,4% 40%,0 52%,3% 63%,0 75%,4% 86%,0 100%,0 100%)"},{opacity:1,clipPath:"polygon(0 0,100% 0,100% 12%,100% 20%,100% 30%,100% 40%,100% 52%,100% 63%,100% 75%,100% 86%,100% 100%,0 100%)",duration,ease:"power2.inOut"},at);
    tl.to(outgoing,{x:-38,rotation:-.35,duration,ease:"power2.inOut"},at);
    return tl;
  },
  diagonalSlice(tl,{outgoing,incoming},at,duration=.62){
    tl.fromTo(incoming,{opacity:1,clipPath:"polygon(0 0,0 0,0 100%,0 100%)"},{opacity:1,clipPath:"polygon(0 0,100% 0,100% 100%,0 100%)",duration,ease:"power3.inOut"},at);
    tl.to(outgoing,{x:-90,y:34,scale:.98,duration,ease:"power3.inOut"},at);
    return tl;
  },
  inkIris(tl,{outgoing,incoming},at,duration=.76){
    tl.fromTo(incoming,{opacity:1,clipPath:"circle(0% at 52% 48%)"},{opacity:1,clipPath:"circle(145% at 52% 48%)",duration,ease:"power3.inOut"},at);
    tl.to(outgoing,{scale:1.035,filter:"blur(5px)",duration,ease:"power2.inOut"},at);
    return tl;
  },
  focusPress(tl,{outgoing,incoming},at,duration=.72){
    tl.fromTo(incoming,{opacity:0,scale:.94,filter:"blur(18px)"},{opacity:1,scale:1,filter:"blur(0px)",duration,ease:"power2.inOut"},at);
    tl.fromTo(outgoing,{opacity:1,scale:1,filter:"blur(0px)"},{opacity:0,scale:1.08,filter:"blur(16px)",duration,ease:"power2.inOut"},at);
    return tl;
  },
  paperFold(tl,{outgoing,incoming},at,duration=.72){
    tl.fromTo(incoming,{opacity:1,scale:.96,x:90},{opacity:1,scale:1,x:0,duration,ease:"power2.out"},at+duration*.18);
    tl.fromTo(outgoing,{rotationY:0,x:0,opacity:1},{rotationY:-88,x:-240,opacity:0,duration,ease:"power3.in",transformOrigin:"left center",transformPerspective:1400},at);
    return tl;
  },
  stampCover(tl,{outgoing,incoming,overlay},at,duration=.66){
    tl.set(overlay,{opacity:1,backgroundColor:"#b83b2f",transformOrigin:"center center"},at);
    tl.fromTo(overlay,{scale:.02,rotation:-12},{scale:1.55,rotation:-3,duration:duration*.52,ease:"power4.in"},at);
    setSwap(tl,outgoing,incoming,at+duration*.5);
    tl.to(overlay,{scale:.02,rotation:5,duration:duration*.48,ease:"power4.out"},at+duration*.52);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  },
  archiveShutter(tl,{outgoing,incoming,slats},at,duration=.72){
    const half=duration*.5;
    tl.fromTo(slats,{scaleX:0,opacity:1,transformOrigin:"left center"},{scaleX:1,duration:half,stagger:half*.08,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.set(slats,{transformOrigin:"right center"},at+half);
    tl.to(slats,{scaleX:0,duration:half,stagger:half*.08,ease:"power3.inOut"},at+half);
    return tl;
  },
  columnCascade(tl,{outgoing,incoming,columns},at,duration=.76){
    const half=duration*.52;
    tl.fromTo(columns,{scaleY:0,opacity:1,transformOrigin:"center top"},{scaleY:1,duration:half,stagger:.045,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+half);
    tl.set(columns,{transformOrigin:"center bottom"},at+half);
    tl.to(columns,{scaleY:0,duration:duration-half,stagger:.045,ease:"power3.inOut"},at+half);
    return tl;
  },
  paperStack(tl,{outgoing,incoming,sheets},at,duration=.78){
    tl.fromTo(sheets,{x:1920,y:120,rotation:3,opacity:1},{x:0,y:0,rotation:0,duration:duration*.5,stagger:.07,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+duration*.52);
    tl.to(sheets,{x:-1920,y:-90,rotation:-2,duration:duration*.48,stagger:.06,ease:"power3.inOut"},at+duration*.52);
    return tl;
  },
  chapterBridge(tl,{outgoing,incoming,overlay},at,duration=.82){
    tl.set(overlay,{opacity:1,x:-1920,backgroundColor:"#20262c"},at);
    tl.to(overlay,{x:0,duration:duration*.46,ease:"power3.inOut"},at);
    setSwap(tl,outgoing,incoming,at+duration*.46);
    tl.to(overlay,{x:1920,duration:duration*.54,ease:"power3.inOut"},at+duration*.46);
    tl.set(overlay,{opacity:0},at+duration);
    return tl;
  }
};

export const paperEditorialTransitionMeta={
  primary:["paper-push","folio-rise","focus-press","margin-pull"],
  section:["red-rule-cut","column-cascade","archive-shutter","chapter-bridge"],
  accent:["ink-sweep","tear-wipe","diagonal-slice","ink-iris","paper-fold","stamp-cover","paper-stack","ink-dip"]
};
