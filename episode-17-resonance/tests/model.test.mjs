import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../model.mjs';
const close=(a,b,tol=1e-8)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
test('El oscilador parte del reposo y la solución satisface la ecuación de movimiento',()=>{
 for(const frequency of[.4,1,1.6])for(const damping of[.16,.8]){
  const s=M.create({frequency,damping,force:.08});close(M.snapshot(s).x,0);close(M.snapshot(s).v,0);
  for(const t of[.1,.7,2,10]){const q=M.snapshot(M.advance(s,t)),h=1e-5,vp=M.snapshot(M.advance(s,t+h)).v,vm=M.snapshot(M.advance(s,t-h)).v;close((vp-vm)/(2*h),q.a,2e-8);close(M.MASS*q.a+damping*q.v+M.K*q.x,q.F);}
 }
});
test('El amortiguamiento desplaza el máximo de desplazamiento y reduce su amplitud',()=>{
 const s=M.create(),q=M.snapshot(s);assert(q.fr<q.f0);assert(M.response(s,q.fr)>M.response(s,q.f0));assert(M.response({...s,damping:.6},q.fr)<M.response(s,q.fr));
});
test('Una fuerza nula no produce movimiento; el transitorio desaparece',()=>{
 close(M.snapshot(M.advance(M.create({force:0}),30)).x,0);
 const s=M.create({frequency:1.1,damping:.4}),q=M.snapshot(M.advance(s,60)),w=M.TAU*s.frequency;
 close(q.x,q.A*Math.cos(w*60-q.phase),1e-10);
});
test('El dominio de controles mantiene el carro dentro de su recorrido útil',()=>{
 for(let f=.4;f<1.601;f+=.04){const s=M.create({frequency:f,force:.08,damping:.16});for(let t=0;t<30;t+=.025)assert(Math.abs(M.snapshot(M.advance(s,t)).x)<.16);}
});
