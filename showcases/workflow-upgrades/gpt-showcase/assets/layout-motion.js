// Timeline recipes for the two editorial workflows. All positions are absolute.
const sel = (root, selector) => root.querySelector(selector);
const all = (root, selector) => Array.from(root.querySelectorAll(selector));

function enter(tl, element, at, from = {}) {
  if (!element) return;
  tl.fromTo(element,
    { autoAlpha: 0, y: from.y ?? 28, x: from.x ?? 0, scale: from.scale ?? 1 },
    { autoAlpha: 1, y: 0, x: 0, scale: 1, duration: from.duration ?? .62,
      ease: from.ease ?? 'power3.out', immediateRender: false }, at);
}

function draw(tl, element, at, duration = .62) {
  if (!element) return;
  tl.fromTo(element, { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration, ease: 'power3.inOut', immediateRender: false }, at);
}

export function hero(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .24, { x: -35, y: 0, duration: .55 });
  enter(tl, sel(root, 'h1'), start + .56, { y: 46, scale: .985, duration: .84, ease: 'expo.out' });
  enter(tl, sel(root, '.hero-caption'), start + 1.14, { y: 28, duration: .62 });
  draw(tl, sel(root, '.hero-line'), start + 1.70, .78);
  enter(tl, sel(root, '.hero-explain'), start + 2.38, { y: 25, duration: .7 });
  enter(tl, sel(root, '.hero-foot'), start + 3.12, { y: 16, duration: .58 });
  enter(tl, sel(root, '.hero-mark-label'), start + 4.05, { y: 12, duration: .54 });
}

export function slate(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .12, { x: -24, y: 0 });
  enter(tl, sel(root, 'h2'), start + .37, { y: 53, scale: .97, duration: .78, ease: 'expo.out' });
  enter(tl, sel(root, '.slate-work'), start + .88, { y: 28 });
  enter(tl, sel(root, '.slate-question'), start + 1.36, { y: 24 });
  enter(tl, sel(root, '.slate-index'), start + .57, { y: 28, duration: .82 });
  enter(tl, sel(root, '.slate-proof'), start + 2.50, { y: 14 });
}

export function work(tl, root, start, duration, {flightTitle = false, flightIndex = false, stampIndex = false, videoSelector = null, bridgeExit = false} = {}) {
  if (!flightIndex && !stampIndex) enter(tl, sel(root, '.work-index'), start + .17, { y: 26, scale: 1.1 });
  if (!flightTitle) enter(tl, sel(root, '.work-title'), start + .20, { y: 25, duration: .67 });
  enter(tl, sel(root, '.work-source'), start + .45, { x: 38, y: 0 });
  enter(tl, sel(root, '.work-foot'), start + .62, { y: 15 });
  const video = videoSelector && document.querySelector(videoSelector);
  if (video) tl.fromTo(video,
    {autoAlpha:0,scale:1.025,filter:'blur(9px)'},
    {autoAlpha:1,scale:1,filter:'blur(0px)',duration:.64,ease:'power3.out',immediateRender:false},start+(flightTitle?.44:stampIndex?.43:.14));
  const bar = sel(root, '.work-track i');
  if (bar) {
    const drawDuration = bridgeExit ? duration - .25 : duration;
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: drawDuration, ease: 'none', immediateRender: false }, start);
    if (bridgeExit) tl.to(bar, {scaleX:.09,duration:.25,ease:'power3.inOut'},start+drawDuration);
  }
}

// A chapter number with no meaningful source is impressed at its own place.
// The theme's sealPress owns the ink compression; y supplies the short drop.
export function numeralSeal(tl, element, at, motions) {
  motions.sealPress(tl, element, at, {drop:.26,press:.08});
  tl.fromTo(element,{y:-42,rotation:-2.2},
    {y:0,rotation:0,duration:.26,ease:'power4.in',immediateRender:false},at);
}

export function handoff(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .18, { x: -28, y: 0 });
  enter(tl, sel(root, 'h2'), start + .37, { y: 43, duration: .72 });
  enter(tl, sel(root, '.from'), start + .58, { x: -50, y: 0, duration: .72 });
  tl.set(sel(root,'.divide'),{scaleY:0},0);
  tl.fromTo(sel(root, '.divide'), { scaleY: 0 },
    { scaleY: 1, duration: .72, ease: 'power3.out', immediateRender: false }, start + .39);
  tl.to(sel(root, '.from'), { opacity: .34, duration: .42, ease: 'power2.inOut' }, start + 2.25);
  enter(tl, sel(root, '.to'), start + 2.86, { x: 44, y: 0, duration: .62 });
  enter(tl, sel(root, '.handoff-foot'), start + 3.11, { y: 15 });
}

export function comparison(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .12, { x: -26, y: 0 });
  enter(tl, sel(root, 'h2'), start + .40, { y: 42, duration: .75 });
  all(root, '.comp-col').forEach((col, i) => enter(tl, col, start + .18 + i * .10,
    { x: i ? 46 : -46, y: 0, duration: .78 }));
  enter(tl, sel(root, '.compare-foot'), start + 2.17, { y: 22, duration: .7 });
}

export function method(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .12, { x: -28, y: 0 });
  enter(tl, sel(root, 'h2'), start + .35, { y: 45, duration: .78 });
  enter(tl, sel(root, '.method-intro'), start + .84, { y: 22 });
  all(root, '.method-step').forEach((step, i) => enter(tl, step, start + 1.18 + i * .20,
    { y: 39, duration: .7 }));
}

export function evidence(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .12, { x: -26, y: 0 });
  enter(tl, sel(root, 'h2'), start + .32, { y: 38, duration: .75 });
  enter(tl, sel(root, '.evidence-deck'), start + .85, { y: 22 });
  enter(tl, sel(root, '.score'), start + 1.52, { y: 30, duration: .77 });
  tl.fromTo(sel(root, '.score-rule i'), { scaleX: 0 },
    { scaleX: 1, duration: .7, ease: 'power3.out', immediateRender: false }, start + 1.67);
  all(root, '.evidence-list p').forEach((row, i) => enter(tl, row, start + 2.15 + i * .3,
    { y: 21, duration: .63 }));
  enter(tl, sel(root, '.cutaway-caption'), start + 4.9, { y: 14 });
}

export function panel(tl, root, start) {
  enter(tl, sel(root, '.eyebrow'), start + .12, { x: -25, y: 0 });
  enter(tl, sel(root, 'h2'), start + .38, { y: 39, duration: .75 });
  all(root, '.radar .ring').forEach((el, i) => tl.fromTo(el,
    { opacity: 0, scale: .88, transformOrigin: 'center center' },
    { opacity: 1, scale: 1, duration: .55, ease: 'power2.out', immediateRender: false }, start + .29 + i * .09));
  all(root, '.radar .axis').forEach((el, i) => tl.fromTo(el,
    { opacity: 0 }, { opacity: 1, duration: .36, immediateRender: false }, start + .57 + i * .045));
  all(root, '.radar text').forEach((el, i) => tl.fromTo(el,
    { opacity: 0 }, { opacity: 1, duration: .42, ease: 'power2.out', immediateRender: false }, start + .60 + i * .06));
  const shape = sel(root, '.radar .shape');
  if (shape) {
    const length = shape.getTotalLength();
    tl.set(shape, {strokeDasharray:length,strokeDashoffset:length,fillOpacity:0},0);
    tl.fromTo(shape, {opacity:0,strokeDashoffset:length,fillOpacity:0},
      {opacity:1,strokeDashoffset:0,duration:1.22,ease:'power2.inOut',immediateRender:false},start+1.17);
    tl.to(shape, {fillOpacity:.26,duration:.58,ease:'power2.out'},start+2.26);
  }
  all(root, '.radar .dot').forEach((el, i) => tl.fromTo(el,
    { opacity: 0, scale: 0, transformOrigin: 'center center' },
    { opacity: 1, scale: 1, duration: .32, ease: 'back.out(1.7)', immediateRender: false }, start + 2.39 + i * .08));
  all(root, '.ledger-row').forEach((el, i) => enter(tl, el, start + 1.04 + i * .11,
    { x: 31, y: 0, duration: .65 }));
  enter(tl, sel(root, '.total'), start + 3.10, { y: -22, scale: 1.45, duration: .39, ease: 'power4.in' });
  tl.to(sel(root,'.total'),{scale:.96,duration:.09,ease:'power1.out'},start+3.49);
  tl.to(sel(root,'.total'),{scale:1,duration:.18,ease:'back.out(2)'},start+3.58);
  enter(tl, sel(root, '.panel-foot'), start + 4.19, { y: 14 });
}

function overlay(className) {
  const node=document.createElement('div');
  node.className=className;
  node.setAttribute('data-layout-ignore','');
  document.querySelector('#main').appendChild(node);
  return node;
}

// Matching type crosses the clip boundary; only the paper beneath it changes.
// The work media stays hidden until the type has landed in its header.
export function titleFlight(tl, sourceSelector, targetSelector, boundary, duration=.98, via=null) {
  const source=document.querySelector(sourceSelector), target=document.querySelector(targetSelector);
  const main=document.querySelector('#main').getBoundingClientRect();
  const a=source.getBoundingClientRect(), b=target.getBoundingClientRect();
  const cs=getComputedStyle(source), ct=getComputedStyle(target);
  const startScale=parseFloat(cs.fontSize)/parseFloat(ct.fontSize);
  const ghost=overlay('title-flight');
  ghost.textContent=source.textContent;
  Object.assign(ghost.style,{
    left:`${b.left-main.left}px`,top:`${b.top-main.top}px`,width:`${b.width}px`,height:`${b.height}px`,
    fontFamily:ct.fontFamily,fontSize:ct.fontSize,fontWeight:ct.fontWeight,lineHeight:ct.lineHeight,
    letterSpacing:ct.letterSpacing,color:ct.color,textAlign:ct.textAlign,fontStyle:ct.fontStyle,
  });
  const at=boundary-.57, end=at+duration;
  tl.set(ghost,{autoAlpha:1},at);
  tl.set(source,{autoAlpha:0},at);
  if (via) {
    tl.fromTo(ghost,{x:a.left-b.left,y:a.top-b.top,scale:startScale,color:cs.color},
      {x:via.x-(b.left-main.left),y:via.y-(b.top-main.top),scale:via.scale*startScale,color:ct.color,
       duration:duration*.56,ease:'power3.in',immediateRender:false},at);
    tl.to(ghost,{x:0,y:0,scale:1,
      duration:duration*.44,ease:'power3.out'},at+duration*.56);
  } else {
    tl.fromTo(ghost,{x:a.left-b.left,y:a.top-b.top,scale:startScale,color:cs.color},
      {x:0,y:0,scale:1,color:ct.color,
      duration,ease:'power3.inOut',immediateRender:false},at);
  }
  tl.set(target.closest('.work-title') || target,{autoAlpha:1},end);
  tl.set(ghost,{autoAlpha:0},end);
}

// The vermilion progress rule is re-registered as the next page's rule.
export function ruleBridge(tl,boundary,sourceSelector,targetSelector,hold=.9) {
  const main=document.querySelector('#main').getBoundingClientRect();
  const a=document.querySelector(sourceSelector).getBoundingClientRect();
  const b=document.querySelector(targetSelector).getBoundingClientRect();
  const rule=overlay('rule-bridge');
  const x=b.left-main.left,y=b.top-main.top;
  // Take only the last brush mark from the progress rule. It stays on the
  // source page's lower rule until the cut, then crosses blank paper.
  const at=boundary-.02;
  tl.fromTo(rule,{autoAlpha:1,left:a.left-main.left,top:a.top-main.top,width:a.width*.09,height:a.height},
    {autoAlpha:1,left:x,top:y,width:18,height:8,duration:.72,ease:'power3.inOut',immediateRender:false},at);
  tl.to(rule,{left:x,top:y,width:b.width,height:b.height,duration:.56,ease:'power3.out'},at+.72);
  tl.to(rule,{autoAlpha:0,duration:.24,ease:'power2.out'},boundary+hold);
}

export function artifactTransfer(tl,boundary,fromSelector,toSelector,imageSource) {
  const main=document.querySelector('#main').getBoundingClientRect();
  const a=document.querySelector(fromSelector).getBoundingClientRect();
  const target=document.querySelector(toSelector);
  const b=target.getBoundingClientRect();
  const mount=overlay('artifact-transfer');
  Object.assign(mount.style,{left:`${a.left-main.left}px`,top:`${a.top-main.top}px`,width:`${a.width}px`,height:`${a.height}px`});
  const image=document.createElement('img');
  image.src=imageSource;
  image.setAttribute('alt','');
  mount.appendChild(image);
  const at=boundary-.25, end=boundary+1.08;
  tl.set(mount,{autoAlpha:1},at);
  tl.fromTo(mount,{x:0,y:0,scaleX:1,scaleY:1},
    {x:b.left-a.left,y:b.top-a.top,scaleX:b.width/a.width,scaleY:b.height/a.height,
     duration:end-at,ease:'power3.inOut',immediateRender:false},at);
  tl.set(target,{autoAlpha:1},end);
  tl.set(mount,{autoAlpha:0},end+.025);
}
