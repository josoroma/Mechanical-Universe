import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as S from '../scene.mjs';
import {orderParts} from '../painter.mjs';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
let configurations=0;
for(const massB of[.1,.2,.4])for(let iv=20;iv<=80;iv+=5)for(const vB of[-.2,0,.2]){
  const c=O.create({massB,vA:iv/100,vB});configurations++;assert.ok(Number.isFinite(c.end)&&c.end>0);
  for(let j=0;j<=160;j++){const s=O.sample(c,c.end*j/160);near(s.P,c.P0);near(s.E,c.E0);near((O.MASS_A*s.xA+massB*s.xB)/(O.MASS_A+massB),s.Q);near(s.impulseA,-s.impulseB);near(s.force,O.K*s.compression);assert.ok(s.compression>=0&&s.compression<.092);assert.ok(Math.max(Math.abs(s.xA),Math.abs(s.xB))<=O.LIMIT+1e-9);near(s.xB-s.xA,Math.max(O.D-s.compression,s.xB-s.xA));}
  const end=O.sample(c,c.end);near(Math.max(Math.abs(end.xA),Math.abs(end.xB)),O.LIMIT);assert.equal(end.done,true);
  if(c.contact+c.duration<c.end){const mid=O.sample(c,c.contact+c.duration/2),after=O.sample(c,c.contact+c.duration+.001),expected=O.finalVelocities(c);near(mid.vA,mid.vB);near(mid.U,.5*c.mu*(c.vA-c.vB)**2);near(after.vA,expected.vA);near(after.vB,expected.vB);near(after.KA+after.KB,c.E0);
    const t=c.contact+c.duration*.3,h=1e-6,p=O.sample(c,t-h),q=O.sample(c,t+h),s=O.sample(c,t);near((q.pA-p.pA)/(2*h),-s.force,1e-8);near((q.xA-p.xA)/(2*h),s.vA,1e-8);near((q.pB-p.pB)/(2*h),s.force,1e-8);
    for(const t of[c.contact,c.contact+c.duration]){const p=O.sample(c,t-1e-9),q=O.sample(c,t+1e-9);for(const key of['xA','xB','vA','vB','U'])near(p[key],q[key],1e-8);}
  }
  const capped=O.advance(c,100);near(capped.t,c.end);near(c.t,0);
}
const equal=O.create(),after=O.sample(equal,equal.contact+equal.duration+.01);near(after.vA,0);near(after.vB,.6);
const neutral=O.create({massB:.4,vA:.4,vB:-.2});near(neutral.P0,0);near(O.sample(neutral,neutral.contact+neutral.duration/2).vA,0);
const none=O.create({vA:.2,vB:.2});assert.equal(none.encounter,false);for(const t of[0,1,none.end]){const s=O.sample(none,t);near(s.force,0);near(s.compression,0);near(s.vA,.2);near(s.vB,.2);}
for(const params of[{massB:.3},{vA:.1},{vA:NaN},{vA:.9},{vB:.3}])assert.throws(()=>O.create(params),RangeError);
for(const dt of[-1,Infinity,NaN])assert.throws(()=>O.advance(equal,dt),RangeError);
const cache=new WeakMap();let poses=0;
for(const massB of[.1,.2,.4]){const c=O.create({massB,vA:.8,vB:-.2});for(const t of[0,...Array.from({length:41},(_,i)=>c.contact+c.duration*i/40),c.end]){const state={...c,t},s=O.sample(state),parts=S.scene(state),order=orderParts(parts,S.P,cache);poses++;assert.equal(order.length,parts.length);assert.equal(new Set(order).size,parts.length);assert.equal(parts.filter(p=>p.lit).length,1);assert.equal(parts.filter(p=>p.shape.route==='A.spring').length,8);assert.equal(parts.filter(p=>p.name.startsWith('B.weight.')&&!p.name.includes('seat')&&!p.name.includes('nut')).length,massB===.1?1:massB===.2?3:7);
    const heads=parts.filter(p=>p.name.endsWith('bumper.head')),gap=heads[1].shape.s0-heads[0].shape.s1;assert.ok(gap>=-1e-8);if(s.compression>0)near(gap,0,1e-8);for(const id of['A','B']){const route=S.springRoute(id,s);near(route[0][2],90);near(route.at(-1)[2],90);assert.ok(Math.abs(route.at(-1)[0]-route[0][0])>14);}
  }}
console.log(`${configurations} configuraciones físicas y ${poses} estados geométricos: correctos.`);
