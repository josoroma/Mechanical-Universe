import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../model.mjs';
const close=(a,b,tol=1e-9)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
test('La tensión fija la rapidez transversal y la frecuencia fija su longitud de onda',()=>{
 const a=M.properties(M.create()),b=M.properties(M.create({tension:32})),c=M.properties(M.create({frequency:1}));close(a.cT,4);close(a.lambdaT,2);close(b.cT/a.cT,2);close(b.lambdaT/a.lambdaT,2);close(c.cT,a.cT);close(c.lambdaT,2*a.lambdaT);
});
test('Las muestras longitudinales satisfacen la ecuación discreta de masas y muelles',()=>{
 for(const stiffness of[20,80])for(const frequency of[.5,3])for(const t of[0,.07,.29]){const s=M.advance(M.create({stiffness,frequency}),t),p=M.properties(s);assert(frequency<p.cutoff);for(let j=1;j<12;j++){const x=j*M.SPACING,q=M.displacement(s,x,'longitudinal'),left=M.displacement(s,x-M.SPACING,'longitudinal'),right=M.displacement(s,x+M.SPACING,'longitudinal');close(-M.MASS*p.w*p.w*q,stiffness*(left-2*q+right),1e-10);}}
});
test('Las muestras oscilan alrededor de su posición y no viajan con la onda',()=>{
 const s=M.create();for(let j=0;j<13;j++){const x=j*M.SPACING;close(M.displacement(s,x),M.displacement(M.advance(s,1/s.frequency),x));close(M.displacement(s,x,'longitudinal'),M.displacement(M.advance(s,1/s.frequency),x,'longitudinal'));}
});
test('La curva y las lecturas usan los mismos desplazamientos',()=>{
 const s=M.advance(M.create(),.17),q=M.snapshot(s),p=M.plot(s);close(p.marker[1],q.y*1000);close(p.reference[90][1],q.xi*1000);assert(q.transverse.every(v=>Math.abs(v)<=M.AMPLITUDE));assert(q.longitudinal.every(v=>Math.abs(v)<=M.AMPLITUDE));
});
