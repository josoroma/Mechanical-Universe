export const TAU = 2 * Math.PI;
export const END = 6, WHEEL_R = 12, RADIAL_SCALE = 24, INPUT_SCALE = Math.PI / 3;
export const DEFAULTS = Object.freeze({profile:"wave", amplitude:1, a:0, x:1.2, speed:.6, n:8, rectangles:true});
export const PROFILES = Object.freeze({
  constant:{name:"Altura constante", formula:"1", description:"La altura no cambia: el área crece a un ritmo constante."},
  ramp:{name:"Rampa", formula:"x/4", description:"La altura aumenta: la rueda se aleja del centro y el área crece cada vez más deprisa."},
  wave:{name:"Onda positiva", formula:"0,9 + 0,6 sen(πx/3)", description:"La rueda cambia de velocidad, pero mantiene el sentido: toda la curva está por encima del eje."},
  signed:{name:"Área con signo", formula:"1,5 sen(πx/3)", description:"Después de x = 3, la rueda cruza el centro y gira al revés. En [0, 6], las áreas positiva y negativa se cancelan."}
});
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function ordinate(profile,x){
  if(profile==="constant")return 1;
  if(profile==="ramp")return x/4;
  if(profile==="wave")return .9+.6*Math.sin(Math.PI*x/3);
  if(profile==="signed")return 1.5*Math.sin(Math.PI*x/3);
  throw new Error(`Función desconocida: ${profile}`);
}
export function primitive(profile,x){
  if(profile==="constant")return x;
  if(profile==="ramp")return x*x/8;
  if(profile==="wave")return .9*x-1.8/Math.PI*Math.cos(Math.PI*x/3);
  if(profile==="signed")return -4.5/Math.PI*Math.cos(Math.PI*x/3);
  throw new Error(`Función desconocida: ${profile}`);
}
export const integral=(profile,a,b,amplitude=1)=>amplitude*(primitive(profile,b)-primitive(profile,a));
export function areas(profile,a,b,amplitude=1){
  const lo=Math.min(a,b),hi=Math.max(a,b),cuts=[lo,...(profile==="signed"&&lo<3&&hi>3?[3]:[]),hi];
  let positive=0,negative=0;
  for(let i=1;i<cuts.length;i++){const value=integral(profile,cuts[i-1],cuts[i],amplitude);if(value>=0)positive+=value;else negative-=value;}
  return {positive,negative,geometric:positive+negative,net:integral(profile,a,b,amplitude)};
}
export function rectangles(state,x=state.x){
  const width=(x-state.a)/state.n;
  return Array.from({length:state.n},(_,i)=>{const left=state.a+i*width,right=left+width,mid=(left+right)/2,height=state.amplitude*ordinate(state.profile,mid);return {left,right,mid,height,area:width*height};});
}
export function snapshot(state=DEFAULTS,x=state.x){
  x=clamp(x,state.a,END);
  const f=state.amplitude*ordinate(state.profile,x),A=areas(state.profile,state.a,x,state.amplitude),sum=rectangles(state,x).reduce((s,r)=>s+r.area,0);
  const r=RADIAL_SCALE*f,theta=INPUT_SCALE*(x-state.a),phi=RADIAL_SCALE*INPUT_SCALE/WHEEL_R*A.net;
  return {x,f,r,theta,phi,turns:phi/TAU,...A,sum,error:sum-A.net,rate:RADIAL_SCALE*INPUT_SCALE/WHEEL_R*f,finished:x>=END-1e-9};
}
export function number(v,digits=2){const clean=Math.abs(v)<.5*10**(-digits)?0:v;return new Intl.NumberFormat("es",{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(clean);}
