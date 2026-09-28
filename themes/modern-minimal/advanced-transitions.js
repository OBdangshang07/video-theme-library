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

vec4 gridWarp(vec2 uv,float p){
  float front=p*1.24-.12;
  float field=uv.x+(fbm(uv*7.+3.1)-.5)*.07;
  float mask=smoothstep(front-.045,front+.045,field);
  float near=1.-smoothstep(0.,.15,abs(field-front));
  vec2 warp=vec2(sin(uv.y*26.+field*8.)*.028,(noise(vec2(uv.x*11.,2.7))-.5)*.12)*near*sin(p*3.14159265);
  vec4 a=tex(u_from,uv-warp);
  vec4 b=tex(u_to,uv+warp*.6);
  vec4 c=mix(b,a,mask);
  vec2 gp=fract((uv+warp*2.2)*vec2(16.,9.));
  float gl=(1.-smoothstep(0.,.03,min(gp.x,1.-gp.x)))+(1.-smoothstep(0.,.045,min(gp.y,1.-gp.y)));
  gl=clamp(gl,0.,1.);
  vec3 gridCol=mix(vec3(.07,.075,.08),vec3(.141,.333,1.),near);
  c.rgb=mix(c.rgb,gridCol,gl*(.10+.5*near));
  float edge=1.-smoothstep(0.,.012,abs(field-front));
  c.rgb=mix(c.rgb,vec3(.141,.333,1.),edge*.85);
  return c;
}

vec4 scanSweep(vec2 uv,float p){
  float y=1.14-p*1.28;
  float dy=uv.y-y;
  float reveal=smoothstep(-.018,.018,dy);
  float near=1.-smoothstep(0.,.12,abs(dy));
  vec2 off=vec2((hash21(vec2(floor(uv.y*260.),3.3))-.5)*.06*near,0.);
  vec4 a=tex(u_from,uv+off*p);
  vec4 b=tex(u_to,uv-off*.5*(1.-p));
  vec4 c=mix(a,b,reveal);
  float scan=step(.5,fract(uv.y*160.));
  c.rgb*=1.-scan*.14*near;
  float beam=exp(-pow(dy*110.,2.));
  float halo=exp(-pow(dy*16.,2.));
  c.rgb+=vec3(.141,.333,1.)*(beam*1.25+halo*.28);
  float tick=step(.985,fract(uv.x*32.))*exp(-abs(dy+.03)*60.);
  c.rgb+=vec3(.141,.333,1.)*tick*.35;
  return c;
}

vec4 axisMirror(vec2 uv,float p){
  float open=sin(clamp(p,0.,1.)*3.14159265*.5);
  float hw=open*.58;
  float d=uv.x-.5;
  float ad=abs(d);
  float reveal=1.-smoothstep(hw-.02,hw+.02,ad);
  float mirrorAmt=smoothstep(.04,.22,p);
  float seam=.5+sign(d)*hw;
  vec2 sa=vec2(mix(uv.x,seam*2.-uv.x+sign(d)*hw*.5,mirrorAmt),uv.y);
  vec4 a=tex(u_from,sa);
  vec4 b=tex(u_to,uv);
  vec4 c=mix(a,b,reveal);
  float seamGlow=1.-smoothstep(0.,.016,abs(ad-hw));
  c.rgb+=vec3(.141,.333,1.)*seamGlow*.8;
  c.rgb*=1.-.22*(1.-reveal)*open;
  float axis=1.-smoothstep(0.,.004,abs(d));
  c.rgb=mix(c.rgb,vec3(.07,.075,.08),axis*.5*(1.-p));
  return c;
}

vec4 blur9(sampler2D t,vec2 uv,float r){
  vec4 c=tex(t,uv)*.25;
  c+=tex(t,uv+vec2(r,0.))*.125;c+=tex(t,uv-vec2(r,0.))*.125;
  c+=tex(t,uv+vec2(0.,r))*.125;c+=tex(t,uv-vec2(0.,r))*.125;
  c+=tex(t,uv+vec2(r,r)*.7)*.0625;c+=tex(t,uv-vec2(r,r)*.7)*.0625;
  c+=tex(t,uv+vec2(r,-r)*.7)*.0625;c+=tex(t,uv+vec2(-r,r)*.7)*.0625;
  return c;
}
vec4 focusRack(vec2 uv,float p){
  float bell=sin(p*3.14159265);
  float rA=smoothstep(.0,.5,p)*.024;
  float rB=(1.-smoothstep(.5,1.,p))*.024;
  vec4 a=blur9(u_from,uv,rA);
  vec4 b=blur9(u_to,uv,rB);
  float m=smoothstep(.52,.66,p+(fbm(uv*9.)-.5)*.05);
  vec4 c=mix(a,b,m);
  vec2 q=uv-.5;
  c.rgb*=1.-bell*.14*dot(q,q)*1.6;
  c.rgb+=vec3(.141,.333,1.)*bell*.03;
  return c;
}

vec4 thresholdResolve(vec2 uv,float p){
  float bell=sin(p*3.14159265);
  vec4 a=tex(u_from,uv);
  vec4 b=tex(u_to,uv);
  vec2 cell=floor(uv*vec2(16.,9.));
  float order=(cell.x+cell.y*16.)/144.;
  float t=smoothstep(.3,.7,p);
  float m=step(order,t+(hash21(cell)-.5)*.1);
  vec4 c=mix(a,b,m);
  float levels=mix(16.,2.,bell);
  vec3 post=floor(c.rgb*levels+.5)/levels;
  vec3 col=mix(c.rgb,post,bell*.94);
  float edge=1.-smoothstep(0.,.045,abs(order-t));
  col=mix(col,vec3(.141,.333,1.),edge*bell*.75);
  col+=(hash21(uv*u_resolution+7.7)-.5)*.03*bell;
  return vec4(col,1.);
}

void main(){
  float p=ease(clamp(u_progress,0.,1.));
  if(p<=.001){gl_FragColor=tex(u_from,v_uv);return;}
  if(p>=.999){gl_FragColor=tex(u_to,v_uv);return;}
  vec4 color;
  if(u_effect<.5) color=gridWarp(v_uv,p);
  else if(u_effect<1.5) color=scanSweep(v_uv,p);
  else if(u_effect<2.5) color=axisMirror(v_uv,p);
  else if(u_effect<3.5) color=focusRack(v_uv,p);
  else color=thresholdResolve(v_uv,p);
  float grain=(hash21(v_uv*u_resolution+17.3)-.5)*.018;
  gl_FragColor=vec4(color.rgb+grain,1.);
}`;

export const modernMinimalAdvancedTransitionMeta={
  "grid-warp-field":{index:0,label:"网格翘曲场",duration:1.2,role:"chapter",fallback:"grid-shift",use:"大章节、结构变化与维度切换"},
  "cobalt-scan-sweep":{index:1,label:"钴蓝扫描",duration:1.0,role:"signature",fallback:"blue-line-cut",use:"片头、品牌性切换与栏目包装"},
  "axis-mirror-split":{index:2,label:"轴镜分裂",duration:.9,role:"contrast",fallback:"split-slide",use:"反转、纠错与强对比"},
  "focus-rack-depth":{index:3,label:"景深焦移",duration:1.1,role:"hero",fallback:"clean-cross",use:"主结论、关键证据或作品揭晓"},
  "threshold-resolve":{index:4,label:"阈值解析",duration:.8,role:"impact",fallback:"precision-zoom",use:"结论落点、状态确认与强提示"}
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

export function createModernMinimalAdvancedTransition(canvas,{from,to,effect="grid-warp-field"}={}){
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
    setEffect(id){if(modernMinimalAdvancedTransitionMeta[id])effectId=id;return api},
    setSources(nextFrom,nextTo){
      gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);
      fromTexture=textureFrom(gl,nextFrom);toTexture=textureFrom(gl,nextTo);return api;
    },
    render(progress){
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fromTexture);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,toTexture);
      gl.uniform1f(progressLoc,Math.max(0,Math.min(1,progress)));
      gl.uniform1f(effectLoc,modernMinimalAdvancedTransitionMeta[effectId].index);
      gl.uniform2f(resolutionLoc,canvas.width,canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return api;
    },
    destroy(){gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);gl.deleteProgram(program)}
  };
  return api.render(0);
}

export function createModernTexture(width,height,variant="from"){
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");
  const light=variant==="from";
  const bg=light?"#F4F5F2":"#111317",ink=light?"#111317":"#F4F5F2",accent=light?"#2455FF":"#7593FF",muted=light?"#666C75":"#9AA1AB",grid=light?"rgba(17,19,23,.05)":"rgba(244,245,242,.06)";
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle=grid;ctx.lineWidth=1;
  for(let x=0;x<width;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
  for(let y=0;y<height;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
  ctx.fillStyle=ink;ctx.fillRect(40,44,width-80,3);
  ctx.font=`700 ${Math.max(11,width*.014)}px "IBM Plex Mono",monospace`;ctx.fillStyle=muted;
  ctx.fillText(light?"CURRENT / 01":"NEXT / 02",40,84);
  ctx.textAlign="right";ctx.fillText(light?"ANALYSIS":"CONCLUSION",width-40,84);ctx.textAlign="left";
  ctx.fillStyle=ink;ctx.font=`900 ${Math.max(30,width*.07)}px Montserrat,"Microsoft YaHei",sans-serif`;
  ctx.fillText(light?"分析页面":"结论页面",54,height*.6);
  ctx.fillStyle=accent;ctx.fillRect(54,height*.65,width*.3,10);
  ctx.fillStyle=muted;ctx.font=`700 ${Math.max(10,width*.013)}px "IBM Plex Mono",monospace`;
  ctx.fillText(light?"IN REVIEW · GRID 08":"VERIFIED RESULT · GRID 08",54,height*.75);
  ctx.fillStyle=light?"rgba(17,19,23,.08)":"rgba(244,245,242,.1)";ctx.fillRect(width*.68,height*.24,width*.24,height*.26);
  ctx.fillStyle=accent;ctx.fillRect(width*.72,height*.29,width*.045,height*.16);ctx.fillRect(width*.79,height*.34,width*.045,height*.11);ctx.fillRect(width*.86,height*.26,width*.045,height*.19);
  ctx.fillStyle=muted;ctx.font=`700 ${Math.max(9,width*.011)}px "IBM Plex Mono",monospace`;
  ctx.fillText("MODERN MINIMAL · 现代秩序",54,height*.9);
  return canvas;
}

const bootShowroom=()=>{
  document.querySelectorAll('.transition-card[data-role="advanced"]').forEach(card=>{
    const stage=card.querySelector(".transition-stage"),button=card.querySelector(".replay"),id=card.dataset.transition;
    if(!stage||!button)return;
    stage.innerHTML=`<canvas class="tx-gpu" width="960" height="540" aria-label="${modernMinimalAdvancedTransitionMeta[id].label}实时预览"></canvas><span class="tx-duration">${card.dataset.duration}s</span><span class="tx-gpu-badge">GPU · GRID FIELD</span>`;
    const canvas=stage.querySelector("canvas"),from=createModernTexture(960,540,"from"),to=createModernTexture(960,540,"to");
    let engine;
    try{engine=createModernMinimalAdvancedTransition(canvas,{from,to,effect:id})}catch(error){stage.dataset.error=error.message;}
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
      Promise.all([
        document.fonts.load('900 64px Montserrat'),
        document.fonts.load('700 16px "IBM Plex Mono"'),
        document.fonts.load('400 18px "Helvetica Neue"')
      ]).then(bootShowroom);
    }else if(document.fonts&&document.fonts.ready)document.fonts.ready.then(bootShowroom);
    else bootShowroom();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
}
