import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as S from '../scene.mjs';
import * as D from '../painter.mjs';
import {check} from '../audit.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11*Math.max(1e-15,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
const base=O.snapshot(),far=O.snapshot({distance:1}),heavy=O.snapshot({mass:2}),charged=O.snapshot({charge:2});
near(base.gravity,2.66972e-10);near(base.electric,3.59502071448e-8);
near(far.gravity,base.gravity/4);near(far.electric,base.electric/4);near(far.ratio,base.ratio);
near(heavy.gravity,4*base.gravity);near(heavy.electric,base.electric);
near(charged.electric,4*base.electric);near(charged.gravity,base.gravity);
const repel=O.snapshot({polarity:'same'}),neutral=O.snapshot({charge:0});
near(repel.signedElectric,-base.electric);near(repel.net,base.gravity-base.electric);
assert.equal(neutral.electric,0);assert.equal(neutral.ratio,0);assert.equal(neutral.electrostatic.angle,0);near(neutral.net,base.gravity);
const equal=O.snapshot({charge:O.equalCharge(1),polarity:'same'});near(equal.ratio,1);assert.ok(Math.abs(equal.net)<1e-24);
assert.ok(O.snapshot(O.PRESETS[3].values).ratio<1);assert.ok(O.snapshot(O.PRESETS[3].values).ratio>.99);
for(const m of [.5,1,5])for(const r of [.2,.5,1])for(const q of [0,.086,1,2])for(const q2 of [-2,-1,0,1,2]){
  const s=O.snapshot({mass:m,distance:r,charge:q},q2);
  for(const b of [s.gravitational,s.electrostatic]){near(b.kappa*b.angle,O.LEVER*b.force);assert.ok(Math.abs(b.angle)<O.MAX_ANGLE);}
}
assert.throws(()=>O.snapshot({mass:NaN}),TypeError);assert.throws(()=>O.snapshot({},Infinity),TypeError);
assert.equal(O.settings({distance:5,charge:-1,mass:0}).distance,1);
const caches={gravity:new WeakMap(),electric:new WeakMap()};let poses=0;
for(let i=0;i<=80;i++)for(const q2 of [-2,-.4,0,.4,2])for(const kind of ['gravity','electric']){
  const r=.2+.8*i/80,values={distance:r,mass:i%2?5:.5,charge:i%3?2:.086},parts=S.scene(values,kind,false,q2);
  const test=parts.find(p=>p.name==='beam.test').at,source=parts.find(p=>p.name==='source.ball').at,delta=source.map((x,j)=>x-test[j]);
  near(Math.hypot(...delta),100*r);assert.ok(Math.abs(delta[0]*test[0]+delta[1]*test[1])<1e-9);
  const order=D.orderParts(parts,S.P,caches[kind]);assert.equal(new Set(order).size,56);poses++;
}
console.log(`Modelo: proporcionalidades, signos, neutralidad, resultante y torsión correctos. Geometría: ${poses} estados con distancia y orden de profundidad válidos.`);
if(process.argv.includes('--audit')){
  const states=[
    [{distance:1,mass:.5,charge:0},0],[{distance:.2,mass:5,charge:2},-2],
    [{distance:.2,mass:5,charge:2,polarity:'same'},2],[{distance:1,mass:.5,charge:2},-2],
    [O.PRESETS[3].values,.086],[{distance:.35,mass:2,charge:1},-.4],
    [{distance:.35,mass:2,charge:1},0],[{distance:.35,mass:2,charge:1},.4]
  ];
  for(const [values,q2]of states)for(const kind of ['gravity','electric'])check(values,kind,q2);
  console.log('Auditoría completa: 16 estados, todas las comprobaciones a cero.');
}
