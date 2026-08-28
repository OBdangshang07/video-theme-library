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
vec4 tex(sampler2D t,vec2 uv){return texture2D(t,clamp(uv,0.,1.));}
float ease(float x){return x*x*(3.-2.*x);}

vec4 inkDiffusion(vec2 uv,float p){
  float paper=fbm(uv*13.+vec2(1.7,-2.1));
  float veins=fbm(vec2(uv.x*29.,uv.y*7.)+paper*2.4);
  float front=p*1.32-.16;
  float field=uv.x+(paper-.5)*.22+(veins-.5)*.09;
  float mask=smoothstep(front-.055,front+.055,field);
  vec2 flow=vec2((paper-.5)*.035,(veins-.5)*.018)*(1.-abs(mask-.5)*2.);
  vec4 a=tex(u_from,uv-flow*p);
  vec4 b=tex(u_to,uv+flow*(1.-p));
  vec4 c=mix(b,a,mask);
  float rim=1.-smoothstep(.018,.07,abs(field-front));
  c.rgb=mix(c.rgb,vec3(.47,.08,.045),rim*.72);
  c.rgb-=paper*.045*(1.-rim);
  return c;
}

vec4 fiberTear(vec2 uv,float p){
  float coarse=fbm(vec2(uv.y*5.3,uv.y*22.));
  float fiber=noise(vec2(uv.y*170.,uv.y*31.));
  float edge=p*1.24-.12+(coarse-.5)*.12+(fiber-.5)*.035;
  float signedD=uv.x-edge;
  vec2 drag=vec2(-.055*(1.-smoothstep(0.,.18,abs(signedD))),(.5-coarse)*.018);
  vec4 a=tex(u_from,uv+drag*p);
  vec4 b=tex(u_to,uv-drag*(1.-p));
  float side=smoothstep(-.012,.012,signedD);
  vec4 c=mix(b,a,side);
  float exposed=1.-smoothstep(.0,.026,abs(signedD));
  float shadow=smoothstep(-.07,.0,signedD)*(1.-smoothstep(0.,.045,signedD));
  c.rgb*=1.-shadow*.34;
  vec3 pulp=mix(vec3(.96,.90,.76),vec3(.72,.64,.49),fiber);
  c.rgb=mix(c.rgb,pulp,exposed*.82);
  float vermilion=1.-smoothstep(.003,.012,abs(signedD+(fiber-.5)*.012));
  c.rgb=mix(c.rgb,vec3(.55,.09,.06),vermilion*.38);
  return c;
}

vec4 depthWarp(vec2 uv,float p){
  float phase=sin(p*3.14159265);
  vec2 q=uv-.5;
  float bend=phase*(.20+.08*cos(q.y*3.14159265));
  vec2 ua=vec2(.5+q.x*(1.+bend)+phase*.21,.5+q.y*(1.-phase*.13));
  vec2 ub=vec2(.5+q.x*(1.+bend)-phase*.21,.5+q.y*(1.-phase*.13));
  float split=smoothstep(.43,.57,p+q.x*.62+sin(q.y*5.)*.035*phase);
  vec4 a=tex(u_from,ua);
  vec4 b=tex(u_to,ub);
  vec4 c=mix(a,b,split);
  float fold=exp(-abs(q.x+(p-.5)*.62)*22.)*phase;
  float vignette=1.-phase*.24*dot(q,q)*2.2;
  c.rgb*=vignette*(1.-fold*.38);
  c.rgb+=vec3(.36,.09,.055)*fold*.24;
  return c;
}

vec4 pressureWave(vec2 uv,float p){
  vec2 center=vec2(.47,.52);
  vec2 q=uv-center;
  q.x*=u_resolution.x/u_resolution.y;
  float d=length(q);
  float radius=p*1.18;
  float wave=exp(-pow((d-radius)*24.,2.))*sin((d-radius)*105.);
  vec2 dir=q/max(d,.001);
  vec2 offset=dir*wave*.026*sin(p*3.14159265);
  float reveal=smoothstep(radius+.045,radius-.045,d+fbm(uv*11.)*.035);
  vec4 a=tex(u_from,uv+offset);
  vec4 b=tex(u_to,uv-offset*.55);
  vec4 c=mix(a,b,reveal);
  float ring=exp(-pow((d-radius)*38.,2.));
  float r=tex(u_to,uv-offset*1.5).r;
  float bl=tex(u_from,uv+offset*1.4).b;
  c.r=mix(c.r,r,ring*.22);c.b=mix(c.b,bl,ring*.12);
  c.rgb=mix(c.rgb,vec3(.64,.12,.08),ring*.58);
  return c;
}

vec4 brushMorph(vec2 uv,float p){
  float y=.72-.50*uv.x+.09*sin(uv.x*8.2)+.04*sin(uv.x*23.);
  float taper=mix(.028,.16,sin(clamp(uv.x,0.,1.)*3.14159265));
  float bristle=(fbm(vec2(uv.x*18.,uv.y*55.))-.5)*.085;
  float dist=abs(uv.y-y+bristle);
  float head=p*1.32-.16;
  float passed=smoothstep(head+.035,head-.035,uv.x+(fbm(uv*8.)-.5)*.08);
  float stroke=1.-smoothstep(taper,taper+.055,dist);
  float reveal=max(passed,stroke*smoothstep(head+.18,head-.05,uv.x));
  vec2 tangent=normalize(vec2(1.,-.50+.72*cos(uv.x*8.2)));
  vec2 warp=tangent*(stroke-.5)*.055*sin(p*3.14159265);
  vec4 a=tex(u_from,uv+warp);
  vec4 b=tex(u_to,uv-warp*.7);
  vec4 c=mix(a,b,reveal);
  float wet=stroke*(1.-smoothstep(.0,.12,abs(uv.x-head)));
  c.rgb=mix(c.rgb,vec3(.055,.06,.06),wet*.78);
  float redEdge=(1.-smoothstep(.0,.025,abs(dist-taper)))*smoothstep(head+.12,head-.06,uv.x);
  c.rgb=mix(c.rgb,vec3(.62,.11,.07),redEdge*.42);
  return c;
}

void main(){
  float p=ease(clamp(u_progress,0.,1.));
  if(p<=.001){gl_FragColor=tex(u_from,v_uv);return;}
  if(p>=.999){gl_FragColor=tex(u_to,v_uv);return;}
  vec4 color;
  if(u_effect<.5) color=inkDiffusion(v_uv,p);
  else if(u_effect<1.5) color=fiberTear(v_uv,p);
  else if(u_effect<2.5) color=depthWarp(v_uv,p);
  else if(u_effect<3.5) color=pressureWave(v_uv,p);
  else color=brushMorph(v_uv,p);
  float grain=(hash21(v_uv*u_resolution+17.3)-.5)*.018;
  gl_FragColor=vec4(color.rgb+grain,1.);
}`;

export const paperEditorialAdvancedTransitionMeta={
  "ink-diffusion-field":{index:0,label:"墨场渗化",duration:1.18,role:"hero",use:"主结论、关键证据或作品揭晓"},
  "fiber-tear-displacement":{index:1,label:"纤维断页",duration:1.06,role:"contrast",use:"反转、纠错与强对比"},
  "editorial-depth-warp":{index:2,label:"纵深折版",duration:1.24,role:"chapter",use:"大章节、时间或空间层级变化"},
  "vermilion-pressure-wave":{index:3,label:"朱砂压力波",duration:.94,role:"impact",use:"结论落点、状态确认与强提示"},
  "calligraphy-stroke-morph":{index:4,label:"笔势流场",duration:1.14,role:"signature",use:"片头、主角登场与品牌性切换"}
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
  const progressLoc=gl.getUniformLocation(program,"u_progress"),effectLoc=gl.getUniformLocation(program,"u_effect"),resolutionLoc=gl.getUniformLocation(program,"u_resolution");
  gl.uniform1i(gl.getUniformLocation(program,"u_from"),0);gl.uniform1i(gl.getUniformLocation(program,"u_to"),1);
  const api={
    setEffect(id){if(paperEditorialAdvancedTransitionMeta[id])effectId=id;return api},
    setSources(nextFrom,nextTo){
      gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);
      fromTexture=textureFrom(gl,nextFrom);toTexture=textureFrom(gl,nextTo);return api;
    },
    render(progress){
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fromTexture);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,toTexture);
      gl.uniform1f(progressLoc,Math.max(0,Math.min(1,progress)));
      gl.uniform1f(effectLoc,paperEditorialAdvancedTransitionMeta[effectId].index);
      gl.uniform2f(resolutionLoc,canvas.width,canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return api;
    },
    destroy(){gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);gl.deleteProgram(program)}
  };
  return api.render(0);
}

export function createEditorialTexture(width,height,variant="from"){
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d"),paper=variant==="from"?"#efe5ce":"#20262c",ink=variant==="from"?"#20262c":"#efe5ce",red=variant==="from"?"#b83b2f":"#e56a59";
  ctx.fillStyle=paper;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle=variant==="from"?"rgba(66,55,41,.09)":"rgba(239,229,206,.06)";ctx.lineWidth=1;
  for(let x=0;x<width;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
  for(let y=0;y<height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
  ctx.fillStyle=ink;ctx.fillRect(42,42,width-84,5);
  ctx.font=`700 ${Math.max(10,width*.014)}px ui-monospace,monospace`;ctx.fillText(variant==="from"?"CURRENT / 01":"NEW SECTION / 02",42,72);
  ctx.textAlign="right";ctx.fillText(variant==="from"?"ANALYSIS":"CONCLUSION",width-42,72);ctx.textAlign="left";
  ctx.font=`900 ${Math.max(28,width*.064)}px "Microsoft YaHei",serif`;ctx.fillText(variant==="from"?"分析页面":"结论页面",58,height*.66);
  ctx.fillStyle=red;ctx.fillRect(58,height*.71,width*.34,9);
  ctx.font=`800 ${Math.max(10,width*.015)}px ui-monospace,monospace`;ctx.fillText(variant==="from"?"EVIDENCE IN REVIEW":"VERIFIED RESULT",58,height*.78);
  ctx.fillStyle=variant==="from"?"rgba(32,38,44,.1)":"rgba(239,229,206,.1)";ctx.fillRect(width*.66,height*.24,width*.22,height*.24);
  ctx.fillStyle=red;ctx.fillRect(width*.7,height*.29,width*.04,height*.14);ctx.fillRect(width*.77,height*.34,width*.04,height*.09);ctx.fillRect(width*.84,height*.26,width*.04,height*.17);
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
      const tick=now=>{const p=Math.min(1,(now-start)/duration);engine.render(p);if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);
    };
    button.addEventListener("click",play);
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&!card.dataset.gpuPlayed){card.dataset.gpuPlayed="1";play()}}),{threshold:.45});observer.observe(card);
  });
};

if(typeof document!=="undefined"){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootShowroom);else bootShowroom();
}
