import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={length:1,energy:1,state:0,experiment:0};
export const A=.0380998212,HBAR=.6582119569,V0=2;
export const clamp=E.clamp;
export const create=(p={})=>({...DEFAULTS,...p,t:0});
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export const level=(n,L)=>A*Math.PI**2*n*n/(L*L);
const mul=(a,b)=>({re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re});
const norm=a=>a.re*a.re+a.im*a.im;
export function well(s,u){if(u<0||u>1)return {re:0,im:0,rho:0};const modes=s.state?[s.state]:[1,2],factor=s.state?1:1/Math.SQRT2;let re=0,im=0;for(const n of modes){const amplitude=factor*Math.sqrt(2/s.length)*Math.sin(n*Math.PI*u),phase=level(n,s.length)*s.t/HBAR;re+=amplitude*Math.cos(phase);im-=amplitude*Math.sin(phase);}return {re,im,rho:re*re+im*im};}
export function coefficients(s){const k=Math.sqrt(s.energy/A),delta=s.energy-V0,a=s.length;let c,b;
 if(Math.abs(delta)<1e-10){c=1;b=k*a/2;}
 else if(delta>0){const q=Math.sqrt(delta/A);c=Math.cos(q*a);b=(k/q+q/k)*Math.sin(q*a)/2;}
 else{const q=Math.sqrt(-delta/A);c=Math.cosh(q*a);b=(k/q-q/k)*Math.sinh(q*a)/2;}
 const den=c*c+b*b,F={re:c/den,im:b/den},atZero=mul(F,insideFactor(s,-a,k)),r={re:atZero.re-1,im:atZero.im};return {k,F,r,T:norm(F),R:norm(r)};
}
function insideFactor(s,d,k){const delta=s.energy-V0;if(Math.abs(delta)<1e-10)return {re:1,im:k*d};const q=Math.sqrt(Math.abs(delta)/A);return delta>0?{re:Math.cos(q*d),im:k*Math.sin(q*d)/q}:{re:Math.cosh(q*d),im:k*Math.sinh(q*d)/q};}
export function scattering(s,x,c=coefficients(s)){let psi;if(x<0){const co=Math.cos(c.k*x),si=Math.sin(c.k*x),reflected=mul(c.r,{re:co,im:-si});psi={re:co+reflected.re,im:si+reflected.im};}else if(x<=s.length)psi=mul(c.F,insideFactor(s,x-s.length,c.k));else psi=mul(c.F,{re:Math.cos(c.k*(x-s.length)),im:Math.sin(c.k*(x-s.length))});const phase=s.energy*s.t/HBAR,rotated=mul(psi,{re:Math.cos(phase),im:-Math.sin(phase)});return {...rotated,rho:norm(psi)};}
export const barrierX=(s,u)=>s.length/2+(u-.5)*130/35;
export function snapshot(s){const c=coefficients(s),e1=level(1,s.length),period=2*Math.PI*HBAR/(3*e1),right=s.state ? .5 : .5-4*Math.cos(3*e1*s.t/HBAR)/(3*Math.PI),barrier=s.experiment===1;return {t:s.t,length:s.length,energy:barrier?s.energy:s.state?level(s.state,s.length):2.5*e1,probability:100*(barrier?c.T:right),transmission:100*c.T,reflection:barrier?100*c.R:'—',wellRight:100*right,period:!barrier&&!s.state?period:'—',height:V0,experiment:barrier?'Dispersión por una barrera':'Partícula en un pozo infinito',state:barrier?'Onda estacionaria incidente':s.state?'Estado n = '+s.state:'Superposición de n = 1 y n = 2',regime:barrier?(Math.abs(s.energy-V0)<1e-10?'E = V₀ · caso límite':s.energy<V0?'E < V₀ · efecto túnel':'E > V₀ · reflexión y transmisión'):'Energías permitidas discretas',normalization:barrier?'Flujo incidente unitario':'Probabilidad total igual a 1'};}
export function plot(s){const c=coefficients(s),curve=Array.from({length:241},(_,i)=>{const u=i/240;return [u,s.experiment?scattering(s,barrierX(s,u),c).rho:well(s,u).rho];}),max=Math.max(...curve.map(p=>p[1]),1e-30);return {curve:curve.map(([x,y])=>[x,y/max]),marker:[.5,curve[120][1]/max]};}
