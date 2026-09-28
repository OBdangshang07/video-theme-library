const VERTEX_SHADER=`
attribute vec2 a_position;
varying vec2 v_uv;
void main(){
  v_uv=a_position*.5+.5;
  gl_Position=vec4(a_position,0.,1.);
}`;

const FRAGMENT_SHADER=`
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform float u_time;
uniform float u_effect;
uniform vec2 u_resolution;

float hash21(vec2 p){
  p=fract(p*vec2(123.34,456.21));
  p+=dot(p,p+45.32);
  return fract(p.x*p.y);
}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 r=mat2(.8,-.6,.6,.8);
  for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.03+11.7;a*=.5;}
  return v;
}
// Domain-warped fbm that keeps flowing with time: the ink keeps moving through the fibres.
float flow(vec2 p,float t){
  vec2 q=vec2(fbm(p+vec2(0.,t*.23)),fbm(p+vec2(5.2,1.3)-vec2(t*.17,0.)));
  return fbm(p+q*1.6+vec2(t*.11,-t*.07));
}
vec4 tex(sampler2D t,vec2 uv){return texture2D(t,clamp(uv,0.,1.));}
float aspect(){return u_resolution.x/u_resolution.y;}

// 墨场渗化：水痕先行、墨沿纤维渗进、前缘积墨与朱砂沉淀、身后留下墨粒颗粒。
vec4 inkDiffusion(vec2 uv,float p,float t){
  vec2 a=vec2(uv.x*aspect(),uv.y);
  float paper=flow(a*6.5+vec2(1.7,-2.1),t);
  float veins=fbm(vec2(a.x*26.,a.y*6.)+paper*2.4+t*.4);
  float tendril=fbm(a*38.+vec2(t*.9,-t*.5));
  float front=p*1.36-.18;
  float field=uv.x+(paper-.5)*.26+(veins-.5)*.09+(tendril-.5)*.035*(1.-p);
  float mask=smoothstep(front-.05,front+.05,field);
  vec2 dir=vec2((paper-.5)*.04,(veins-.5)*.02)*(1.-abs(mask-.5)*2.);
  vec4 c=mix(tex(u_to,uv+dir*(1.-p)),tex(u_from,uv-dir*p),mask);
  float dist=field-front;
  float rimW=.03+.03*veins;
  float rim=1.-smoothstep(.01,rimW,abs(dist));
  // Water mark running ahead of the ink: the paper lightens, then darkens as the ink arrives.
  float water=smoothstep(.16,.02,dist)*smoothstep(-.005,.03,dist);
  c.rgb=mix(c.rgb,c.rgb*1.07+.03,water*.45);
  c.rgb=mix(c.rgb,vec3(.07,.075,.08),rim*.62);
  c.rgb=mix(c.rgb,vec3(.46,.08,.05),rim*smoothstep(.55,.8,veins)*.7);
  // Granulation left behind the front, fading as it dries.
  float behind=smoothstep(0.,-.22,dist);
  float grain=smoothstep(.62,.8,noise(uv*u_resolution*.18+t*3.));
  c.rgb-=grain*behind*(1.-p)*.08;
  return c;
}

// 纤维断页：撕口沿纸纤维不规则推进，纸浆高光、跨越撕口的纤维丝、抬起的纸页阴影随时间加深。
vec4 fiberTear(vec2 uv,float p,float t){
  float coarse=fbm(vec2(uv.y*5.3,uv.y*22.)+t*.05);
  float fiber=noise(vec2(uv.y*170.,uv.y*31.));
  float edge=p*1.26-.13+(coarse-.5)*.13+(fiber-.5)*.035;
  float sd=uv.x-edge;
  float lift=sin(p*3.14159);
  vec2 drag=vec2(-.06*(1.-smoothstep(0.,.2,abs(sd))),(.5-coarse)*.02)*lift;
  vec4 c=mix(tex(u_to,uv-drag*(1.-p)),tex(u_from,uv+drag*p),smoothstep(-.01,.01,sd));
  float shadow=smoothstep(-.09-.05*lift,0.,sd)*(1.-smoothstep(0.,.05,sd));
  c.rgb*=1.-shadow*(.26+.18*lift);
  vec3 pulp=mix(vec3(.97,.92,.8),vec3(.74,.66,.51),clamp(fiber*.6+coarse*.4,0.,1.));
  c.rgb=mix(c.rgb,pulp,(1.-smoothstep(0.,.024,abs(sd)))*.85);
  // Stray fibres bridging the tear, stretching as it opens.
  float strands=smoothstep(.93,.99,noise(vec2(uv.y*260.,sd*18.)))*(1.-smoothstep(0.,.06,abs(sd)));
  c.rgb=mix(c.rgb,vec3(.96,.92,.82),strands*.8);
  float red=1.-smoothstep(.003,.012,abs(sd+(fiber-.5)*.012));
  c.rgb=mix(c.rgb,vec3(.55,.09,.06),red*.4);
  return c;
}

// 纵深折版：两版在透视纵深中弯折压合，中央折脊有高光和纸纹。
vec4 depthWarp(vec2 uv,float p,float t){
  float phase=sin(p*3.14159265);
  vec2 q=uv-.5;
  float bend=phase*(.2+.08*cos(q.y*3.14159265));
  vec2 ua=vec2(.5+q.x*(1.+bend)+phase*.21,.5+q.y*(1.-phase*.13));
  vec2 ub=vec2(.5+q.x*(1.+bend)-phase*.21,.5+q.y*(1.-phase*.13));
  float split=smoothstep(.42,.58,p+q.x*.62+sin(q.y*5.+t*.8)*.035*phase);
  vec4 c=mix(tex(u_from,ua),tex(u_to,ub),split);
  float spine=q.x+(p-.5)*.62;
  float fold=exp(-abs(spine)*22.)*phase;
  float gloss=exp(-abs(spine-.012)*90.)*phase;
  c.rgb*=(1.-phase*.3*dot(q,q)*2.2)*(1.-fold*.36);
  c.rgb+=vec3(.36,.09,.055)*fold*.26+vec3(1.,.97,.9)*gloss*.22;
  c.rgb-=(fbm(uv*vec2(60.,8.))-.5)*.05*phase;
  return c;
}

// 朱砂压力波：主波推开像素并揭出新页，第二道回波与朱砂色散随后跟进。
vec4 pressureWave(vec2 uv,float p,float t){
  vec2 q=uv-vec2(.47,.52);
  q.x*=aspect();
  float d=length(q);
  float r=p*1.2,r2=max(0.,p-.16)*1.2;
  float wave=exp(-pow((d-r)*24.,2.))*sin((d-r)*105.-t*6.);
  float echo=exp(-pow((d-r2)*30.,2.))*sin((d-r2)*140.)*.5;
  vec2 dir=q/max(d,.001);
  vec2 off=dir*(wave+echo)*.026*sin(p*3.14159265);
  float reveal=smoothstep(r+.045,r-.045,d+flow(uv*7.,t)*.05);
  vec4 c=mix(tex(u_from,uv+off),tex(u_to,uv-off*.55),reveal);
  float ring=exp(-pow((d-r)*46.,2.));
  c.r=mix(c.r,tex(u_to,uv-off*1.5).r,ring*.18);
  c.b=mix(c.b,tex(u_from,uv+off*1.4).b,ring*.1);
  c.rgb=mix(c.rgb,vec3(.64,.12,.08),ring*.5);
  c.rgb=mix(c.rgb,vec3(.64,.12,.08),exp(-pow((d-r2)*60.,2.))*.18);
  return c;
}

// 笔势流场：笔锋沿轨迹行进，鬃毛纹顺笔势流动，湿墨在笔头聚积，尾段散成飞白。
vec4 brushMorph(vec2 uv,float p,float t){
  float y=.72-.5*uv.x+.09*sin(uv.x*8.2)+.04*sin(uv.x*23.);
  float taper=mix(.028,.16,sin(clamp(uv.x,0.,1.)*3.14159265));
  float bristle=(fbm(vec2(uv.x*18.-t*1.5,uv.y*55.))-.5)*.1;
  float dist=abs(uv.y-y+bristle);
  float head=p*1.34-.17;
  float passed=smoothstep(head+.035,head-.035,uv.x+(flow(uv*6.,t)-.5)*.09);
  float stroke=1.-smoothstep(taper,taper+.045,dist);
  // Dry-brush: far behind the head the stroke splits into bristle streaks.
  float age=clamp(head-uv.x,0.,1.);
  float streak=noise(vec2(uv.x*4.,(uv.y-y)*140.));
  stroke*=mix(1.,smoothstep(.25,.6,streak),smoothstep(.15,.6,age)*.8);
  float reveal=max(passed,stroke*smoothstep(head+.18,head-.05,uv.x));
  vec2 tangent=normalize(vec2(1.,-.5+.72*cos(uv.x*8.2)));
  vec2 warp=tangent*(stroke-.5)*.055*sin(p*3.14159265);
  vec4 c=mix(tex(u_from,uv+warp),tex(u_to,uv-warp*.7),reveal);
  float wet=stroke*(1.-smoothstep(0.,.12,abs(uv.x-head)));
  c.rgb=mix(c.rgb,vec3(.05,.055,.06),wet*.85);
  c.rgb=mix(c.rgb,vec3(.05,.055,.06),stroke*smoothstep(head+.02,head-.3,uv.x)*.18*(1.-p));
  float redEdge=(1.-smoothstep(0.,.025,abs(dist-taper)))*smoothstep(head+.12,head-.06,uv.x);
  // The vermilion edge dries into the page and is gone before the cut to the clean frame.
  c.rgb=mix(c.rgb,vec3(.62,.11,.07),redEdge*.4*(1.-smoothstep(.5,.92,p)));
  return c;
}

void main(){
  float p=clamp(u_progress,0.,1.);
  if(p<=.001){gl_FragColor=tex(u_from,v_uv);return;}
  if(p>=.999){gl_FragColor=tex(u_to,v_uv);return;}
  vec4 color;
  if(u_effect<.5) color=inkDiffusion(v_uv,p,u_time);
  else if(u_effect<1.5) color=fiberTear(v_uv,p,u_time);
  else if(u_effect<2.5) color=depthWarp(v_uv,p,u_time);
  else if(u_effect<3.5) color=pressureWave(v_uv,p,u_time);
  else color=brushMorph(v_uv,p,u_time);
  float grain=(hash21(v_uv*u_resolution+17.3)-.5)*.018;
  gl_FragColor=vec4(color.rgb+grain,1.);
}`;

import {paperEditorialTransitions} from "./transitions.js";

// 每个旗舰转场有自己的节奏曲线（不再共用对称 smoothstep）：进度先过 ease 再进 shader。
const smooth=(x)=>x*x*(3-2*x);
const EASES={
  // 墨场渗化：落墨快，渗开慢，长尾收干。
  diffusion:(x)=>1-Math.pow(1-smooth(Math.pow(x,.72)),1.35),
  // 纤维断页：先绷住，再猛地撕开，末段拖出纤维。
  tear:(x)=>x<.28?.12*smooth(x/.28):.12+.88*(1-Math.pow(1-(x-.28)/.72,2.6)),
  // 纵深折版：对称但更陡，中段折脊停留短。
  warp:(x)=>smooth(smooth(x)),
  // 朱砂压力波：瞬间冲击、指数衰减。
  impact:(x)=>1-Math.pow(1-x,3.2),
  // 笔势流场：起笔顿、中段疾行、收笔提。
  brush:(x)=>x<.14?.05*smooth(x/.14):x>.86?.95+.05*smooth((x-.86)/.14):.05+.9*smooth((x-.14)/.72)
};

export const paperEditorialAdvancedTransitionMeta={
  "ink-diffusion-field":{index:0,label:"墨场渗化",duration:1.3,role:"hero",fallback:"focus-press",ease:"diffusion",use:"主结论、关键证据或作品揭晓：水痕先行、墨沿纤维渗进、前缘积墨与朱砂沉淀"},
  "fiber-tear-displacement":{index:1,label:"纤维断页",duration:1.1,role:"contrast",fallback:"tear-wipe",ease:"tear",use:"反转、纠错与强对比：先绷后撕，纤维丝跨越撕口"},
  "editorial-depth-warp":{index:2,label:"纵深折版",duration:1.24,role:"chapter",fallback:"chapter-bridge",ease:"warp",use:"大章节、时间或空间层级变化：折脊高光与纸纹"},
  "vermilion-pressure-wave":{index:3,label:"朱砂压力波",duration:1,role:"impact",fallback:"red-rule-cut",ease:"impact",use:"结论落点、状态确认：主波冲击 + 回波色散"},
  "calligraphy-stroke-morph":{index:4,label:"笔势流场",duration:1.2,role:"signature",fallback:"ink-sweep",ease:"brush",use:"片头、主角登场与品牌性切换：起笔顿、疾行、飞白收"}
};
export const easeAdvancedProgress=(id,x)=>{
  const meta=paperEditorialAdvancedTransitionMeta[id];
  const v=Math.max(0,Math.min(1,x));
  return meta?EASES[meta.ease](v):v;
};

const compile=(gl,type,source)=>{
  const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};

const textureFrom=(gl,source)=>{
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  return texture;
};

export function createPaperEditorialAdvancedTransition(canvas,{from,to,effect="ink-diffusion-field"}={}){
  const gl=canvas.getContext("webgl",{alpha:false,antialias:false,preserveDrawingBuffer:true});
  if(!gl)return null;
  const program=gl.createProgram();
  gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,VERTEX_SHADER));
  gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,FRAGMENT_SHADER));
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,"a_position");gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  let fromTexture=textureFrom(gl,from),toTexture=textureFrom(gl,to),effectId=effect;
  const progressLoc=gl.getUniformLocation(program,"u_progress"),timeLoc=gl.getUniformLocation(program,"u_time"),effectLoc=gl.getUniformLocation(program,"u_effect"),resolutionLoc=gl.getUniformLocation(program,"u_resolution");
  gl.uniform1i(gl.getUniformLocation(program,"u_from"),0);gl.uniform1i(gl.getUniformLocation(program,"u_to"),1);
  const api={
    setEffect(id){if(paperEditorialAdvancedTransitionMeta[id])effectId=id;return api},
    setSources(nextFrom,nextTo){
      gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);
      fromTexture=textureFrom(gl,nextFrom);toTexture=textureFrom(gl,nextTo);return api;
    },
    // progress：线性进度 0–1（由时间线给出），内部先套该效果的节奏曲线；
    // seconds：转场内经过的秒数，驱动持续流动的噪声，默认 progress × 建议时长。
    render(progress,seconds){
      const meta=paperEditorialAdvancedTransitionMeta[effectId],linear=Math.max(0,Math.min(1,progress));
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fromTexture);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,toTexture);
      gl.uniform1f(progressLoc,easeAdvancedProgress(effectId,linear));
      gl.uniform1f(timeLoc,seconds===undefined?linear*meta.duration:seconds);
      gl.uniform1f(effectLoc,paperEditorialAdvancedTransitionMeta[effectId].index);
      gl.uniform2f(resolutionLoc,canvas.width,canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return api;
    },
    destroy(){gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);gl.deleteProgram(program)}
  };
  return api.render(0);
}

// 生产驱动：单一 paused 时间线里的一段补间，画面只取决于时间线进度。
// engine 为 null（无 WebGL）时自动改用 meta.fallback 指定的基础转场，parts 按该转场的约定传入。
export function driveAdvancedTransition(tl,engine,at,{effect="ink-diffusion-field",duration,parts,canvas}={}){
  const meta=paperEditorialAdvancedTransitionMeta[effect];
  if(!meta)throw new Error(`unknown advanced transition: ${effect}`);
  const d=duration||meta.duration;
  if(!engine){
    const camel=meta.fallback.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
    if(!parts)throw new Error(`${effect} fallback ${meta.fallback} needs parts`);
    return paperEditorialTransitions[camel](tl,parts,at);
  }
  engine.setEffect(effect);
  const state={p:0};
  if(canvas)tl.fromTo(canvas,{autoAlpha:0},{autoAlpha:1,duration:.001},at);
  tl.fromTo(state,{p:0},{p:1,duration:d,ease:"none",onUpdate:()=>engine.render(state.p,state.p*d)},at);
  if(canvas)tl.set(canvas,{autoAlpha:0},at+d);
  return tl;
}

// 展厅贴图：带纸纤维、宋体标题与朱砂批注的两版版面（生产中请换成场景截图）。
export function createEditorialTexture(width,height,variant="from"){
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const from=variant==="from";
  const ctx=canvas.getContext("2d"),paper=from?"#efe5ce":"#20262c",ink=from?"#20262c":"#efe5ce",red=from?"#b83b2f":"#e56a59";
  ctx.fillStyle=paper;ctx.fillRect(0,0,width,height);
  let seed=from?11:29;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  for(let i=0;i<width*1.2;i++){
    const x=rnd()*width,y=rnd()*height,len=3+rnd()*14,a=rnd()*Math.PI;
    ctx.strokeStyle=from?`rgba(120,98,66,${.05+rnd()*.08})`:`rgba(239,229,206,${.02+rnd()*.04})`;ctx.lineWidth=.6;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();
  }
  ctx.strokeStyle=from?"rgba(66,55,41,.07)":"rgba(239,229,206,.05)";ctx.lineWidth=1;
  for(let x=0;x<width;x+=27){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
  for(let y=0;y<height;y+=27){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
  ctx.fillStyle=ink;ctx.fillRect(42,42,width-84,3);
  ctx.font=`700 ${Math.max(10,width*.013)}px "JetBrains Mono",ui-monospace,monospace`;ctx.fillText(from?"SECTION 01 · 分析":"SECTION 02 · 结论",42,68);
  ctx.textAlign="right";ctx.fillText("PAPER EDITORIAL",width-42,68);ctx.textAlign="left";
  ctx.font=`900 ${Math.max(28,width*.07)}px "Source Han Serif SC",STSong,serif`;ctx.fillText(from?"三组样本，":"结论强度",58,height*.52);
  ctx.fillText(from?"同一把标尺。":"88%",58,height*.52+width*.08);
  ctx.fillStyle=red;ctx.fillRect(58,height*.52+width*.1,width*.3,7);
  ctx.fillStyle=from?"rgba(32,38,44,.08)":"rgba(239,229,206,.08)";ctx.fillRect(width*.64,height*.24,width*.26,height*.5);
  ctx.fillStyle=red;[[.68,.34],[.75,.46],[.82,.3]].forEach(([x,y])=>ctx.fillRect(width*x,height*y,width*.045,height*(.7-y)));
  return canvas;
}

const bootShowroom=()=>{
  document.querySelectorAll('.transition-card[data-role="advanced"]').forEach(card=>{
    const stage=card.querySelector(".transition-stage"),button=card.querySelector(".replay"),id=card.dataset.transition;
    if(!stage||!button)return;
    stage.innerHTML=`<canvas class="tx-gpu" width="960" height="540" aria-label="${paperEditorialAdvancedTransitionMeta[id].label}实时预览"></canvas><span class="tx-duration">${card.dataset.duration}s</span><span class="tx-gpu-badge">GPU · PIXEL FIELD</span>`;
    const canvas=stage.querySelector("canvas"),from=createEditorialTexture(960,540,"from"),to=createEditorialTexture(960,540,"to");
    let engine;
    try{engine=createPaperEditorialAdvancedTransition(canvas,{from,to,effect:id})}catch(error){stage.dataset.error=error.message;}
    if(!engine){stage.classList.add("tx-fallback");return}
    let frame=0;
    const play=()=>{
      cancelAnimationFrame(frame);const duration=Number(card.dataset.duration)*1000,start=performance.now();
      const tick=now=>{const p=Math.min(1,(now-start)/duration);engine.render(p,p*duration/1000);if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);
    };
    button.addEventListener("click",play);
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&!card.dataset.gpuPlayed){card.dataset.gpuPlayed="1";play()}}),{threshold:.45});observer.observe(card);
  });
};

if(typeof document!=="undefined"){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootShowroom);else bootShowroom();
}
