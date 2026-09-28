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

vec4 blockDissolve(vec2 uv,float p){
  vec2 grid=vec2(24.,13.5);
  vec2 cell=floor(uv*grid);
  vec2 cellUv=fract(uv*grid);
  float h=hash21(cell*1.37+2.9);
  float front=p*1.28;
  float slide=smoothstep(h,h+.22,front);
  slide=slide*slide;
  float gone=step(h+.22,front);
  vec2 off=vec2((h-.5)*.09*slide,slide*.36);
  vec4 a=tex(u_from,uv-off);
  vec4 b=tex(u_to,uv);
  vec4 c=mix(a,b,clamp(slide*1.5-.25,0.,1.));
  c=mix(c,b,gone);
  float edge=step(cellUv.x,.07)+step(.93,cellUv.x)+step(cellUv.y,.07)+step(.93,cellUv.y);
  float falling=step(.001,slide)*(1.-gone);
  c.rgb=mix(c.rgb,vec3(.48,.82,.29),clamp(edge,0.,1.)*falling*.5);
  return c;
}

vec2 swirlWarp(vec2 uv,float amt){
  vec2 q=uv-.5; q.x*=u_resolution.x/u_resolution.y;
  float d=length(q);
  float ang=atan(q.y,q.x)+amt*exp(-d*2.8);
  vec2 r=vec2(cos(ang),sin(ang))*d; r.x/=u_resolution.x/u_resolution.y;
  return .5+r;
}
vec4 portalSwirl(vec2 uv,float p){
  float phase=sin(p*3.14159265);
  vec2 ua=swirlWarp(uv,phase*4.2);
  vec2 ub=swirlWarp(uv,-phase*4.2);
  vec2 q=uv-.5; q.x*=u_resolution.x/u_resolution.y;
  float d=length(q);
  float ang=mod(atan(q.y,q.x)+3.14159265,6.2831853)/6.2831853;
  float field=ang+(1.-d)*.9;
  float front=p*2.2;
  float reveal=smoothstep(front-.06,front+.06,field);
  vec4 a=tex(u_from,ua);
  vec4 b=tex(u_to,ub);
  vec4 c=mix(a,b,reveal);
  float glow=1.-smoothstep(.0,.05,abs(field-front));
  c.rgb=mix(c.rgb,vec3(.48,.82,.29),glow*.65);
  c.rgb+=vec3(.48,.82,.29)*glow*.25;
  c.rgb*=1.-.22*phase*smoothstep(.35,.85,d);
  return c;
}

vec4 pixelSort(vec2 uv,float p){
  float cols=36.;
  float col=floor(uv.x*cols);
  float ch=hash21(vec2(col,7.7));
  float local=clamp((p-ch*.5)/.5,0.,1.);
  local=floor(local*10.)/10.;
  float band=floor(uv.y*22.);
  float bh=hash21(vec2(col*1.3,band*.7));
  vec2 offA=vec2(0.,(bh-.5)*.28*sin(p*3.14159265));
  vec2 offB=vec2(0.,(bh-.5)*.12*sin(p*3.14159265));
  vec4 a=tex(u_from,uv+offA);
  vec4 b=tex(u_to,uv-offB);
  float front=local*1.15-.075;
  float reveal=step(1.-front,uv.y);
  vec4 c=mix(a,b,reveal);
  float edge=(1.-smoothstep(.0,.012,abs(uv.y-(1.-front))))*step(.001,local)*step(local,.999);
  c.rgb=mix(c.rgb,vec3(.48,.82,.29),edge*.6);
  return c;
}

vec4 terrainRise(vec2 uv,float p){
  float cols=18.;
  float col=floor(uv.x*cols);
  float h=hash21(vec2(col*1.13,4.2));
  float q=1./30.;
  float sink=floor(p*(.5+.5*h)/q)*q;
  float rise=floor(p*(.55+.45*(1.-h))/q)*q;
  vec4 a=tex(u_from,uv+vec2(0.,sink));
  vec4 b=tex(u_to,uv+vec2(0.,1.-rise));
  vec4 bFlat=tex(u_to,uv);
  float risen=step(uv.y,rise);
  float vacated=step(1.-sink,uv.y);
  vec4 c=a;
  c=mix(c,b,risen);
  c=mix(c,bFlat,vacated);
  float edge=(1.-smoothstep(.0,.014,abs(uv.y-rise)))*step(.001,rise)*step(rise,1.05);
  c.rgb=mix(c.rgb,vec3(.48,.82,.29),edge*.7);
  float edgeA=(1.-smoothstep(.0,.014,abs(uv.y-(1.-sink))))*step(.001,sink)*step(sink,1.05);
  c.rgb*=1.-edgeA*.3;
  return c;
}

vec4 redstoneSurge(vec2 uv,float p){
  float row=floor(uv.y*9.);
  float zx=hash21(vec2(row*.77,1.9))-.5;
  float front=p*1.24-.12+zx*.11;
  float d=uv.x-front;
  float reveal=smoothstep(.012,-.012,d);
  vec4 a=tex(u_from,uv);
  vec4 b=tex(u_to,uv);
  float behind=clamp(-d*2.5,0.,1.)*step(d,0.);
  float tick=floor(p*16.);
  float fl=step(.45,hash21(vec2(floor(uv.y*40.),tick)));
  vec3 bGlow=b.rgb*(1.+behind*.38*fl);
  vec3 c=mix(a.rgb,bGlow,reveal);
  float line=1.-smoothstep(.0,.008,abs(d));
  float glow=exp(-abs(d)*36.);
  c=mix(c,vec3(.89,.44,.23),clamp(line+glow*.55,0.,1.)*.92);
  c+=vec3(.89,.44,.23)*glow*.18;
  return vec4(c,1.);
}

void main(){
  float p=ease(clamp(u_progress,0.,1.));
  if(p<=.001){gl_FragColor=tex(u_from,v_uv);return;}
  if(p>=.999){gl_FragColor=tex(u_to,v_uv);return;}
  vec4 color;
  if(u_effect<.5) color=blockDissolve(v_uv,p);
  else if(u_effect<1.5) color=portalSwirl(v_uv,p);
  else if(u_effect<2.5) color=pixelSort(v_uv,p);
  else if(u_effect<3.5) color=terrainRise(v_uv,p);
  else color=redstoneSurge(v_uv,p);
  float grain=(hash21(v_uv*u_resolution+17.3)-.5)*.018;
  gl_FragColor=vec4(color.rgb+grain,1.);
}`;

export const voxelHarnessAdvancedTransitionMeta={
  "block-dissolve-chunks":{index:0,label:"方块崩解",duration:1.1,role:"hero",fallback:"block-shatter",use:"核心 UI 亮相、主结论与作品揭晓"},
  "portal-warp-swirl":{index:1,label:"传送门旋涡",duration:1.2,role:"signature",fallback:"portal-cross",use:"片头、维度切换与品牌性交接"},
  "pixel-sort-cascade":{index:2,label:"像素排序瀑布",duration:1.0,role:"contrast",fallback:"command-cut",use:"数据对比、版本差异与强提示"},
  "terrain-column-rise":{index:3,label:"地形柱隆升",duration:1.3,role:"chapter",fallback:"terrain-wipe",use:"大章节、世界或段落层级变化"},
  "redstone-surge-pulse":{index:4,label:"红石涌流",duration:.9,role:"impact",fallback:"redstone-pulse",use:"结论落点、状态确认与充能提示"}
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

export function createVoxelHarnessAdvancedTransition(canvas,{from,to,effect="block-dissolve-chunks"}={}){
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
    setEffect(id){if(voxelHarnessAdvancedTransitionMeta[id])effectId=id;return api},
    setSources(nextFrom,nextTo){
      gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);
      fromTexture=textureFrom(gl,nextFrom);toTexture=textureFrom(gl,nextTo);return api;
    },
    render(progress){
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fromTexture);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,toTexture);
      gl.uniform1f(progressLoc,Math.max(0,Math.min(1,progress)));
      gl.uniform1f(effectLoc,voxelHarnessAdvancedTransitionMeta[effectId].index);
      gl.uniform2f(resolutionLoc,canvas.width,canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return api;
    },
    destroy(){gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);gl.deleteProgram(program)}
  };
  return api.render(0);
}

export function createVoxelTexture(width,height,variant="from"){
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d"),game=variant==="from";
  const bg=game?"#0E1410":"#172019",ink="#ECE8D6",accent="#7BD14B",alert="#E46F3A",muted="#A6AD9F",line="#3B493D",surface2="#202B22";
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle="rgba(123,209,75,.08)";ctx.lineWidth=1;
  for(let x=0;x<width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
  for(let y=0;y<height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
  if(game){
    const groundTop=height*.62;
    ctx.fillStyle=surface2;ctx.fillRect(0,groundTop,width,height-groundTop);
    ctx.fillStyle=accent;ctx.fillRect(0,groundTop,width,10);
    for(let i=0;i<12;i++){
      const bx=width*.06+i*width*.078,bh=(20+((i*37)%5)*16);
      ctx.fillStyle=i%3?surface2:line;ctx.fillRect(bx,groundTop-bh+10,width*.062,bh);
      ctx.fillStyle=accent;ctx.fillRect(bx,groundTop-bh+10,width*.062,6);
    }
    ctx.fillStyle=ink;ctx.font=`700 ${Math.max(11,width*.015)}px "Pixelify Sans",monospace`;
    ctx.fillText("GAME VIEW / 01",36,52);
    ctx.textAlign="right";ctx.fillText("LIVE CAPTURE",width-36,52);ctx.textAlign="left";
    ctx.font=`400 ${Math.max(30,width*.066)}px "Pixelify Sans",sans-serif`;
    ctx.fillText("实机画面",44,height*.3);
    ctx.fillStyle=accent;ctx.fillRect(44,height*.34,width*.3,10);
    ctx.fillStyle=muted;ctx.font=`700 ${Math.max(10,width*.013)}px "Pixelify Sans",monospace`;
    ctx.fillText("HARNESS UI OVERLAY / READY",44,height*.43);
    ctx.fillStyle=alert;ctx.fillRect(width*.82,height*.12,width*.1,14);
    ctx.fillStyle=ink;ctx.font=`700 ${Math.max(9,width*.012)}px "Pixelify Sans",monospace`;
    ctx.fillText("60 FPS",width*.82,height*.12-8);
  }else{
    ctx.fillStyle=accent;ctx.fillRect(0,0,width,10);
    ctx.fillStyle=ink;ctx.font=`700 ${Math.max(11,width*.015)}px "Pixelify Sans",monospace`;
    ctx.fillText("PLUGIN UI / 02",36,58);
    ctx.textAlign="right";ctx.fillText("BUILD V1.0.0",width-36,58);ctx.textAlign="left";
    ctx.font=`400 ${Math.max(30,width*.066)}px "Pixelify Sans",sans-serif`;
    ctx.fillText("功能界面",44,height*.3);
    ctx.fillStyle=accent;ctx.fillRect(44,height*.34,width*.3,10);
    ctx.fillStyle="#090D0A";ctx.fillRect(44,height*.42,width*.56,54);
    ctx.strokeStyle=line;ctx.lineWidth=3;ctx.strokeRect(44,height*.42,width*.56,54);
    ctx.fillStyle=accent;ctx.font=`700 ${Math.max(12,width*.016)}px "Pixelify Sans",monospace`;
    ctx.fillText("> harness install minecraft-ui",64,height*.42+36);
    for(let i=0;i<6;i++){
      const sx=44+i*(width*.078+8),sy=height*.56,size=width*.078;
      ctx.fillStyle=surface2;ctx.fillRect(sx,sy,size,size);
      ctx.strokeStyle=i===2?accent:line;ctx.lineWidth=4;ctx.strokeRect(sx,sy,size,size);
    }
    ctx.fillStyle=muted;ctx.font=`700 ${Math.max(10,width*.013)}px "Pixelify Sans",monospace`;
    ctx.fillText("6 MODULES LOADED / NO CONFLICTS",44,height*.88);
    ctx.fillStyle=accent;ctx.fillRect(44,height*.9,width*.4,12);
    ctx.fillStyle="#080B09";ctx.fillRect(44+width*.4,height*.9,width*.22,12);
  }
  return canvas;
}

const bootShowroom=()=>{
  document.querySelectorAll('.transition-card[data-role="advanced"]').forEach(card=>{
    const stage=card.querySelector(".transition-stage"),button=card.querySelector(".replay"),id=card.dataset.transition;
    if(!stage||!button)return;
    stage.innerHTML=`<canvas class="tx-gpu" width="960" height="540" aria-label="${voxelHarnessAdvancedTransitionMeta[id].label}实时预览"></canvas><span class="tx-duration">${card.dataset.duration}s</span><span class="tx-gpu-badge">GPU / VOXEL FIELD</span>`;
    const canvas=stage.querySelector("canvas"),from=createVoxelTexture(960,540,"from"),to=createVoxelTexture(960,540,"to");
    let engine;
    try{engine=createVoxelHarnessAdvancedTransition(canvas,{from,to,effect:id})}catch(error){stage.dataset.error=error.message;}
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
  const start=()=>{
    if(document.fonts&&document.fonts.load){
      document.fonts.load('40px "Pixelify Sans"').then(bootShowroom);
    }else if(document.fonts&&document.fonts.ready)document.fonts.ready.then(bootShowroom);
    else bootShowroom();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
}
