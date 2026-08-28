export const signalDeskMotions={
  headlineSplit(tl,target,at=0,duration=.64){return tl.fromTo(target,{x:-62,opacity:0,clipPath:"inset(0 100% 0 0)"},{x:0,opacity:1,clipPath:"inset(0 0% 0 0)",duration,ease:"expo.out"},at)},
  tickerRoll(tl,target,at=0,duration=.72){return tl.fromTo(target,{xPercent:18,opacity:0},{xPercent:0,opacity:1,duration,ease:"power3.out"},at)},
  timecodeRoll(tl,target,at=0,duration=.48){return tl.fromTo(target,{y:-34,opacity:0,letterSpacing:".16em"},{y:0,opacity:1,letterSpacing:"0em",duration,ease:"power4.out"},at)},
  sourcePin(tl,target,at=0,duration=.58){return tl.fromTo(target,{x:-48,opacity:0,borderLeftWidth:"0px"},{x:0,opacity:1,borderLeftWidth:"8px",duration,ease:"expo.out"},at)},
  signalPulse(tl,target,at=0,duration=.56){return tl.fromTo(target,{scale:.35,opacity:0,boxShadow:"0 0 0 0 rgba(255,176,0,0)"},{scale:1,opacity:1,boxShadow:"0 0 0 16px rgba(255,176,0,.12)",duration,ease:"back.out(1.5)"},at)},
  storyStack(tl,targets,at=0,duration=.58){return tl.fromTo(targets,{x:70,opacity:0,clipPath:"inset(0 0 0 35%)"},{x:0,opacity:1,clipPath:"inset(0 0 0 0%)",duration,stagger:.09,ease:"power4.out"},at)},
  barSurge(tl,targets,at=0,duration=.68){return tl.fromTo(targets,{scaleY:0},{scaleY:1,duration,stagger:.035,ease:"expo.out",transformOrigin:"center bottom"},at)},
  quoteCut(tl,target,at=0,duration=.62){return tl.fromTo(target,{opacity:0,clipPath:"polygon(0 0,0 0,0 100%,0 100%)",letterSpacing:".045em"},{opacity:1,clipPath:"polygon(0 0,100% 0,96% 100%,0 100%)",letterSpacing:"0em",duration,ease:"power3.out"},at)},
  alertHit(tl,target,at=0,duration=.46){return tl.fromTo(target,{scaleX:.72,opacity:0,filter:"brightness(1.8)"},{scaleX:1,opacity:1,filter:"brightness(1)",duration,ease:"back.out(1.3)",transformOrigin:"left center"},at)},
  deskLock(tl,target,at=0,duration=.7){return tl.fromTo(target,{scale:.92,opacity:0,clipPath:"inset(40% 8% 40% 8%)"},{scale:1,opacity:1,clipPath:"inset(0% 0% 0% 0%)",duration,ease:"expo.out"},at)}
};
export const signalDeskMotionMeta={
  "headline-split":"Headline and rule arrive as one editorial cut","ticker-roll":"Ticker copy locks into the lower rail","timecode-roll":"Timecode drops into a fixed baseline","source-pin":"Source attribution pins to its accent edge","signal-pulse":"Status signal resolves with one finite pulse","story-stack":"Story cards stack into editorial order","bar-surge":"Data bars rise in a compressed cadence","quote-cut":"Quote enters through an angled editorial mask","alert-hit":"Breaking banner lands with controlled urgency","desk-lock":"Closing system compresses into a stable lockup"
};

