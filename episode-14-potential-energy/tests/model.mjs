import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as S from '../scene.mjs';
import * as K from '../kit/iso-kit.mjs';
import * as G from '../kit/lathe.mjs';
import {orderParts} from '../painter.mjs';

const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
for(const amplitude of [0,.01,.35,.5])for(const side of [-1,1])for(const factor of [1,2]){
  const initial=O.create({amplitude,side,factor}),state=O.advance(initial,40),s=O.snapshot(state);
  assert.equal(initial.t,0);near(initial.balls[0].x,side*amplitude);
  for(const b of [...s.balls,s.spring]){
    near(b.total,b.initial,Math.max(1e-13,b.initial*1e-8));
    assert.ok(Math.abs(b.x)<=amplitude+1e-9);
    near(b.Krot,(b.beta||0)*b.Ktr);
  }
  if(!amplitude)for(const b of [...s.balls,s.spring])for(const key of ['x','speed','U','Ktr','Krot','total'])near(b[key],0);
}
const a=O.create(),b=O.advance(a,.35),s=O.snapshot(b);
assert.ok(s.balls[0].x<s.balls[1].x&&s.balls[0].speed>s.balls[1].speed,'La maciza baja más deprisa en la primera caída');
for(const x of [-.5,-.1,0,.1,.5])near(O.potential(x),O.K0*x*x/2);
near(O.spring(O.create({factor:2})).initial,2*O.potential(.35));
const period=2*Math.PI/Math.sqrt(O.K0/O.MASS);
near(O.spring(O.advance(a,period)).x,.35);
near(O.spring(O.advance(O.create({factor:2}),period/Math.sqrt(2))).x,.35);
for(const beta of [.4,2/3]){
  const x=.32,u=-.6,[dx,du]=O.derivative(x,u,beta);
  const dEdt=O.MASS*O.G*x/O.R*dx+O.MASS*(1+beta)*(x/O.R**2*u*u*dx+(1+(x/O.R)**2)*u*du);
  near(dEdt,0);
}
const right=O.advance(a,3),left=O.advance(O.create({side:-1}),3);
for(let i=0;i<2;i++)for(const key of ['x','u','angle'])near(right.balls[i][key],-left.balls[i][key]);
let split=a;for(let i=0;i<30;i++)split=O.advance(split,.1);
for(let i=0;i<2;i++)for(const key of ['x','u','angle'])near(split.balls[i][key],right.balls[i][key],1e-9);
for(const params of [{amplitude:-1},{amplitude:.51},{amplitude:NaN},{side:0},{factor:3}])assert.throws(()=>O.create(params),RangeError);
for(const dt of [-1,Infinity,61,NaN])assert.throws(()=>O.advance(a,dt),RangeError);

// Toda la envolvente móvil: orden real, número estable de nodos y contacto.
const cache=new WeakMap(),floor=S.floorSamples();
for(let n=0;n<=80;n++){
  const state=O.advance(O.create({amplitude:.5,side:n%2?-1:1,factor:n%3?1:2}),n*.075),parts=S.scene(state);
  assert.equal(parts.length,236);assert.equal(new Set(parts.map(p=>p.name)).size,236);
  assert.equal(parts.filter(p=>p.lit).length,1);
  assert.equal(parts.filter(p=>p.tube).length,32);
  const order=orderParts(parts,S.P,cache);assert.equal(order.length,236);assert.equal(new Set(order).size,236);
  for(const ball of S.balls(state)){
    const [x,,z]=ball.at;
    const distance=Math.min(...floor.map(({a,b})=>{
      const dx=b[0]-a[0],dz=b[1]-a[1],t=O.clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
      return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
    }));
    assert.ok(distance>=S.RADIUS-1e-8&&distance-S.RADIUS<.015,`Contacto: ${distance}`);
    const nums=ball.ball.mark.match(/-?\d+(?:\.\d+)?/g).map(Number);
    // pathOf redondea cada coordenada SVG a décimas (error radial ≤ √2 · 0,05).
    for(const p of [nums.slice(0,2),nums.slice(-2)])near(Math.hypot(p[0]-ball.ball.cx,p[1]-ball.ball.cy),S.RADIUS*G.scaleOf(S.P),.071);
    const projected=K.iso(ball.at,S.P);near(projected[0],ball.ball.cx);near(projected[1],ball.ball.cy);
  }
}
console.log('Modelo físico y 81 estados geométricos: correctos.');
