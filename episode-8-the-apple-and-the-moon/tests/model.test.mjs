import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../model.mjs';
const close=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≠ ${b}`);
test('La órbita circular coincide con la solución analítica durante una vuelta',()=>{
  const f=M.flight(M.CIRCULAR),w=M.CIRCULAR/M.R0;
  assert.equal(f.event,'orbit');close(f.duration,2*Math.PI/w);
  for(let i=0;i<=90;i++){
    const t=i*f.duration/90,p=M.at(f,t);
    close(p.s[0],M.R0*Math.sin(w*t),1e-6);close(p.s[1],M.R0*Math.cos(w*t),1e-6);
    close(p.height,M.ALTITUDE,1e-6);close(p.speed,M.CIRCULAR,1e-9);
  }
});
test('Se conservan energía y momento angular, incluso entre muestras',()=>{
  for(const v of [0,4,7.4,M.CIRCULAR,8.5,9.5,M.ESCAPE,12]){
    const f=M.flight(v);
    for(let i=0;i<=79;i++){const p=M.at(f,f.duration*i/79);close(p.energy,f.orbit.energy,1e-7);close(p.angular,-f.orbit.angular,1e-5);}
  }
});
test('El impacto se detiene en la superficie y la caída radial no avanza lateralmente',()=>{
  for(const v of [0,4,7]){const f=M.flight(v),p=M.at(f,f.duration);assert.equal(f.event,'impact');close(p.radius,M.R,1e-7);if(v===0)close(p.s[0],0);}
  const r=M.R/M.R0;
  const radialTime=Math.sqrt(M.R0**3/(2*M.MU))*(Math.acos(Math.sqrt(r))+Math.sqrt(r*(1-r)));
  close(M.flight(0).duration,radialTime,1e-7);
});
test('Una órbita subcircular puede evitar el suelo cuando hay altitud inicial',()=>{
  const f=M.flight(7.4);assert.equal(f.orbit.kind,'ellipse');assert.equal(f.event,'orbit');assert.ok(f.orbit.peri>M.R);
  const half=M.at(f,f.duration/2);close(half.radius,f.orbit.peri,1e-6);
});
test('Elipse completa: apogeo y período verifican relaciones keplerianas',()=>{
  const f=M.flight(8.5),p=M.at(f,f.duration/2),last=M.at(f,f.duration);
  assert.equal(f.event,'orbit');close(p.radius,f.orbit.apo,1e-5);close(last.s[0],0,1e-5);close(last.s[1],M.R0,1e-5);
  close(p.speed,Math.sqrt(M.MU*(2/p.radius-1/f.orbit.a)),1e-8);
});
test('Salir del campo no se confunde con escapar; el umbral incluye energía nula',()=>{
  const bound=M.flight(9.5);assert.equal(bound.event,'view');assert.equal(bound.orbit.kind,'ellipse');assert.ok(bound.orbit.energy<0);
  for(const v of [M.ESCAPE,12]){const f=M.flight(v);assert.equal(f.orbit.kind,'escape');assert.equal(f.event,'view');close(M.at(f,f.duration).radius,M.VIEW_RADIUS,1e-7);}
  close(M.elements(M.ESCAPE).energy,0,1e-10);assert.equal(M.elements(M.ESCAPE-1e-5).kind,'ellipse');
});
test('El lanzamiento que roza la superficie termina en el contacto tangente',()=>{
  const v=Math.sqrt(2*M.MU*M.R/(M.R0*(M.R+M.R0))),f=M.flight(v);
  assert.equal(f.event,'impact');close(M.at(f,f.duration).radius,M.R,1e-6);close(f.duration,f.orbit.period/2,1e-5);
});
test('Distancia lunar e inverso del cuadrado: atracción terrestre, no gravedad lunar',()=>{
  close(M.gravity(M.R)/M.gravity(2*M.R),4);close(M.gravity(M.R)/M.gravity(M.MOON_DISTANCE),(M.MOON_DISTANCE/M.R)**2,1e-9);
  assert.ok(M.gravity(M.MOON_DISTANCE)>.00269&&M.gravity(M.MOON_DISTANCE)<.00270);
});
test('Entradas y extremos permanecen finitos; el tiempo se limita al vuelo',()=>{
  assert.throws(()=>M.flight(NaN));assert.throws(()=>M.flight(Infinity));
  assert.equal(M.flight(-5).v,0);assert.equal(M.flight(15).v,12);
  const f=M.flight(4);assert.equal(M.at(f,-1).t,0);assert.equal(M.at(f,1e9).t,f.duration);
  for(let v=0;v<=12;v+=.1){const f=M.flight(v);assert.ok(f.duration>0&&f.duration<20000);assert.ok(f.samples.every(p=>p.s.every(Number.isFinite)));assert.ok(['impact','view','orbit'].includes(f.event));}
});
