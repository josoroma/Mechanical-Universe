import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as S from '../scene.mjs';
import {orderParts} from '../painter.mjs';
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} ≠ ${b}`);
test('Equilibrio vertical, fuerza horizontal y geometría del péndulo',()=>{
  for(const angle of [10,35,65])for(const mass of [.1,.25,1]){
    const s=O.snapshot({angle,mass});
    close(s.tension*Math.cos(s.theta),s.weight);
    close(s.tension*Math.sin(s.theta),s.force);
    close(Math.hypot(...s.position),O.LENGTH);
    close(s.speed**2/s.r,s.ac);
    close(s.force,s.mass*s.omega**2*s.r);
    const heavier=O.snapshot({angle,mass:mass*2>1?mass/2:mass*2});
    close(s.omega,heavier.omega);close(s.r,heavier.r);
  }
});
test('En la plataforma: proporcionalidad con masa y radio; cuadrado del giro',()=>{
  const base={mode:'platform',mass:.25,radius:.4,rpm:30},a=O.snapshot(base);
  close(O.snapshot({...base,mass:.5}).force,2*a.force);
  close(O.snapshot({...base,radius:.8}).force,2*a.force);
  close(O.snapshot({...base,rpm:60}).force,4*a.force);
  close(O.snapshot({...base,rpm:60}).period,a.period/2);
  close(O.snapshot({...base,rpm:60}).speed,2*a.speed);
  const rest=O.snapshot({...base,rpm:0});assert.equal(rest.force,0);assert.equal(rest.speed,0);assert.equal(rest.period,Infinity);
});
test('La velocidad es tangente y la aceleración es su derivada temporal',()=>{
  for(const mode of ['pendulum','platform'])for(const phase of [0,.7,2,4]){
    const s=O.snapshot({mode},phase),dt=1e-5;
    close(s.velocity.reduce((sum,v,i)=>sum+v*s.acceleration[i],0),0);
    const before=O.snapshot({mode},phase-s.omega*dt),after=O.snapshot({mode},phase+s.omega*dt);
    for(let i=0;i<3;i++){
      close((after.position[i]-before.position[i])/(2*dt),s.velocity[i],1e-7);
      close((after.velocity[i]-before.velocity[i])/(2*dt),s.acceleration[i],1e-7);
    }
    const full=O.snapshot({mode},phase+s.omega*s.period);full.position.forEach((x,i)=>close(x,s.position[i]));
  }
});
test('Límites de controles y rechazo de valores no finitos',()=>{
  const s=O.settings({angle:100,mass:-1,radius:2,rpm:100});
  assert.equal(s.angle,65);assert.equal(s.mass,.1);assert.equal(s.radius,.85);assert.equal(s.rpm,60);
  assert.throws(()=>O.settings({rpm:NaN}),TypeError);
});
test('Orden geométrico demostrado en 2160 posiciones, incluidos los extremos',()=>{
  const cache=new WeakMap(),cases=[{angle:10},{angle:35},{angle:65},{mode:'platform',radius:.15},{mode:'platform',radius:.65},{mode:'platform',radius:.85}];
  for(const values of cases)for(let i=0;i<360;i++){
    const parts=S.scene(values,i*Math.PI/180,false),order=orderParts(parts,S.P,cache);
    assert.equal(order.length,parts.length);assert.equal(new Set(order).size,parts.length);
  }
});
