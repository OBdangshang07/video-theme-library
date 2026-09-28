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

vec4 staticInterference(vec2 uv,float p){
  float line=floor(uv.y*220.);
  float bandN=hash21(vec2(floor(uv.y*28.),floor(p*7.)));
  float front=p*1.3-.15;
  float field=uv.x+(bandN-.5)*.3+(fbm(vec2(uv.y*22.,3.7))-.5)*.12;
  float mask=smoothstep(front-.055,front+.055,field);
  float near=1.-smoothstep(0.,.18,abs(field-front));
  vec2 offA=vec2((hash21(vec2(line,1.3))-.5)*.1*near*p,0.);
  vec2 offB=vec2((hash21(vec2(line,4.1))-.5)*.07*near*(1.-p),0.);
  vec4 a=tex(u_from,uv+offA);
  vec4 b=tex(u_to,uv-offB);
  vec4 c=mix(b,a,mask);
  float snow=hash21(uv*u_resolution+floor(p*19.)*7.7)-.5;
  c.rgb+=snow*.55*near;
  float edge=1.-smoothstep(.0,.025,abs(field-front));
  c.rgb=mix(c.rgb,vec3(1.,.69,0.),edge*.5);
  c.rgb*=1.-.25*near*step(.5,fract(uv.y*220.));
  return c;
}

vec4 rollBand(vec2 uv,float p){
  float roll=1.12-p*1.24;
  float dy=uv.y-roll;
  float band=exp(-pow(dy*10.,2.));
  float jitter=hash21(vec2(floor(uv.y*120.),floor(p*13.)))-.5;
  vec2 slip=vec2(jitter*.24*band+band*.05*sin(uv.y*260.),0.);
  vec4 a=tex(u_from,uv+slip);
  vec4 b=tex(u_to,uv-slip*.5);
  float reveal=smoothstep(roll-.035,roll+.035,uv.y+(fbm(uv*8.)-.5)*.05);
  vec4 c=mix(a,b,reveal);
  c.rgb*=1.+band*.75;
  c.rgb+=vec3(1.,.69,0.)*band*.22;
  float track=step(.965,fract(uv.y*140.-p*30.));
  c.rgb+=track*.06;
  return c;
}

vec4 radarSweep(vec2 uv,float p){
  vec2 q=uv-vec2(.5,.52);
  q.x*=u_resolution.x/u_resolution.y;
  float d=length(q);
  float ang=mod(atan(q.y,q.x)+3.14159265,6.2831853);
  float front=p*6.2831853*1.06;
  float behind=max(front-ang,0.);
  float swept=smoothstep(0.,.05,behind);
  float beam=exp(-behind*2.6);
  vec4 a=tex(u_from,uv);
  vec4 b=tex(u_to,uv);
  vec4 c=mix(a,b,swept);
  c.rgb+=vec3(1.,.69,0.)*beam*.45;
  float ring=1.-smoothstep(.0,.02,abs(fract(d*5.)-.5)-.46);
  c.rgb=mix(c.rgb,vec3(1.,.69,0.),ring*.1*swept);
  c.rgb*=1.-.3*(1.-swept)*smoothstep(.15,.75,d);
  return c;
}

vec4 dataStream(vec2 uv,float p){
  float phase=sin(p*3.14159265);
  float squeeze=mix(1.,.04,phase);
  vec2 sq=vec2(uv.x,.5+(uv.y-.5)*squeeze);
  vec4 img=mix(tex(u_from,sq),tex(u_to,sq),smoothstep(.46,.54,p));
  float col=floor(uv.x*26.);
  float ch=hash21(vec2(col,2.9));
  float lane=fract(uv.y*(1.+ch)+p*(2.+ch*3.)+ch*7.);
  float glyph=step(.5,hash21(vec2(col*1.7,floor(lane*16.))));
  float bright=.3+.7*hash21(vec2(col,floor(lane*16.)+floor(p*5.)));
  float streamAmt=phase*.9;
  vec3 c=img.rgb*(1.-streamAmt*.8);
  c=mix(c,vec3(1.,.69,0.)*bright,glyph*streamAmt*.55*(1.-abs(uv.x-.5)*.6));
  float line=exp(-pow((uv.y-.5)*260.,2.));
  c+=vec3(1.,.75,.25)*line*phase*1.2;
  return vec4(c,1.);
}

vec4 dispersionSplit(vec2 uv,float p){
  float disp=sin(p*3.14159265);
  float band=hash21(vec2(floor(uv.y*44.),1.7))-.5;
  vec2 off=vec2(disp*(.05+band*.05),band*.02*disp);
  vec4 a;
  a.r=tex(u_from,uv+off).r;a.g=tex(u_from,uv).g;a.b=tex(u_from,uv-off).b;a.a=1.;
  vec4 b;
  b.r=tex(u_to,uv-off*1.3).r;b.g=tex(u_to,uv).g;b.b=tex(u_to,uv+off*1.3).b;b.a=1.;
  float mixv=smoothstep(.44,.56,p+(fbm(uv*10.)-.5)*.1);
  vec4 c=mix(a,b,mixv);
  c.rgb*=1.-.14*disp*step(.5,fract(uv.y*200.));
  c.rgb+=vec3(1.,.69,0.)*disp*.1*(1.-abs(p-.5)*2.);
  return c;
}

void main(){
  float p=ease(clamp(u_progress,0.,1.));
  if(p<=.001){gl_FragColor=tex(u_from,v_uv);return;}
  if(p>=.999){gl_FragColor=tex(u_to,v_uv);return;}
  vec4 color;
  if(u_effect<.5) color=staticInterference(v_uv,p);
  else if(u_effect<1.5) color=rollBand(v_uv,p);
  else if(u_effect<2.5) color=radarSweep(v_uv,p);
  else if(u_effect<3.5) color=dataStream(v_uv,p);
  else color=dispersionSplit(v_uv,p);
  float grain=(hash21(v_uv*u_resolution+17.3)-.5)*.018;
  gl_FragColor=vec4(color.rgb+grain,1.);
}`;

export const signalDeskAdvancedTransitionMeta={
  "signal-static-interference":{index:0,label:"静噪干扰",duration:1,role:"contrast",fallback:"static-wipe",use:"信号中断、反转与强对比"},
  "broadcast-roll-band":{index:1,label:"滚动带滑落",duration:1.1,role:"signature",fallback:"teletype-roll",use:"片头、栏目包装与品牌性切换"},
  "radar-sweep-reveal":{index:2,label:"雷达扫掠揭示",duration:1.2,role:"hero",fallback:"signal-cut",use:"主结论、关键信号或作品揭晓"},
  "data-stream-collapse":{index:3,label:"数据流坍缩",duration:1.15,role:"chapter",fallback:"data-collapse",use:"大章节、数据段落收束再展开"},
  "spectrum-dispersion-split":{index:4,label:"频谱色散分裂",duration:.95,role:"impact",fallback:"channel-zap",use:"结论落点、状态确认与强提示"}
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

export function createSignalDeskAdvancedTransition(canvas,{from,to,effect="signal-static-interference"}={}){
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
    setEffect(id){if(signalDeskAdvancedTransitionMeta[id])effectId=id;return api},
    setSources(nextFrom,nextTo){
      gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);
      fromTexture=textureFrom(gl,nextFrom);toTexture=textureFrom(gl,nextTo);return api;
    },
    render(progress){
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fromTexture);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,toTexture);
      gl.uniform1f(progressLoc,Math.max(0,Math.min(1,progress)));
      gl.uniform1f(effectLoc,signalDeskAdvancedTransitionMeta[effectId].index);
      gl.uniform2f(resolutionLoc,canvas.width,canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return api;
    },
    destroy(){gl.deleteTexture(fromTexture);gl.deleteTexture(toTexture);gl.deleteProgram(program)}
  };
  return api.render(0);
}

export function createSignalTexture(width,height,variant="from"){
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");
  const dark=variant==="from";
  const bg=dark?"#0B1320":"#F3EFE4",ink=dark?"#F3EFE4":"#0B1320",accent=dark?"#FFB000":"#A96500",muted=dark?"#AAB2BC":"#55606C",grid=dark?"rgba(170,178,188,.07)":"rgba(11,19,32,.06)";
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle=grid;ctx.lineWidth=1;
  for(let x=0;x<width;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
  for(let y=0;y<height;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
  ctx.fillStyle=accent;ctx.fillRect(0,0,width,6);
  ctx.fillStyle=ink;ctx.font=`700 ${Math.max(11,width*.015)}px "IBM Plex Mono",monospace`;
  ctx.fillText(dark?"CURRENT SIGNAL / 01":"NEXT SIGNAL / 02",36,52);
  ctx.textAlign="right";ctx.fillText(dark?"MODEL RELEASE":"VERIFIED UPDATE",width-36,52);ctx.textAlign="left";
  ctx.font=`700 ${Math.max(30,width*.068)}px Oswald,"Microsoft YaHei",sans-serif`;
  ctx.fillText(dark?"模型刚刚发布":"价格与能力",44,height*.62);
  ctx.fillStyle=accent;ctx.fillRect(44,height*.67,width*.3,8);
  ctx.fillStyle=muted;ctx.font=`700 ${Math.max(10,width*.013)}px "IBM Plex Mono",monospace`;
  ctx.fillText(dark?"VERIFIED · 09:41 CST":"CONFIRMED · 09:48 CST",44,height*.76);
  const bars=dark?[.35,.55,.42,.7,.88,.6]:[.6,.42,.78,.5,.66,.9];
  bars.forEach((h,i)=>{
    const bx=width*.7+i*width*.038,bh=h*height*.3;
    ctx.fillStyle=i%2?accent:(dark?"#344254":"#8B94A0");ctx.fillRect(bx,height*.86-bh,width*.026,bh);
  });
  ctx.fillStyle=muted;ctx.font=`700 ${Math.max(9,width*.011)}px "IBM Plex Mono",monospace`;
  ctx.fillText(dark?"SIGNAL DESK · LIVE FEED":"SIGNAL DESK · UPDATE LOG",44,height*.9);
  return canvas;
}

const bootShowroom=()=>{
  document.querySelectorAll('.transition-card[data-role="advanced"]').forEach(card=>{
    const stage=card.querySelector(".transition-stage"),button=card.querySelector(".replay"),id=card.dataset.transition;
    if(!stage||!button)return;
    stage.innerHTML=`<canvas class="tx-gpu" width="960" height="540" aria-label="${signalDeskAdvancedTransitionMeta[id].label}实时预览"></canvas><span class="tx-duration">${card.dataset.duration}s</span><span class="tx-gpu-badge">GPU · SIGNAL FIELD</span>`;
    const canvas=stage.querySelector("canvas"),from=createSignalTexture(960,540,"from"),to=createSignalTexture(960,540,"to");
    let engine;
    try{engine=createSignalDeskAdvancedTransition(canvas,{from,to,effect:id})}catch(error){stage.dataset.error=error.message;}
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
        document.fonts.load('700 64px Oswald'),
        document.fonts.load('700 16px "IBM Plex Mono"'),
        document.fonts.load('400 18px Oswald')
      ]).then(bootShowroom);
    }else if(document.fonts&&document.fonts.ready)document.fonts.ready.then(bootShowroom);
    else bootShowroom();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
}
