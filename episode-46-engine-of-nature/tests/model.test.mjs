import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
test('El ciclo cierra y cumple la primera y segunda leyes en cada instante',()=>{for(const hot of[400,800])for(const cold of[200,350])for(const ratio of[1.5,3]){const s=O.create({hot,cold,ratio});for(let t=0;t<=12;t+=.125){const v=O.snapshot(O.advance(s,t));near(O.N*O.CV*(v.temperature-hot),v.heatHot-v.heatCold-v.work);near(v.entropy+v.reservoirEntropy,0);}const a=O.snapshot(s),b=O.snapshot(O.advance(s,12));near(a.volume,b.volume);near(a.temperature,b.temperature);near(b.work,b.net);near(b.efficiency,100*(1-cold/hot));}});
test('Presión y temperatura son continuas al cambiar de etapa',()=>{const s=O.create();for(const t of[3,6,9]){const a=O.snapshot(O.advance(s,t-1e-8)),b=O.snapshot(O.advance(s,t+1e-8));near(a.volume,b.volume);near(a.temperature,b.temperature);near(a.pressure,b.pressure);}});
test('La biela mantiene exactamente su longitud y el trabajo neto es positivo',()=>{for(let t=0;t<=12;t+=.03){const v=O.snapshot(O.advance(O.create(),t)),dx=60-30*Math.cos(v.angle)-v.slider,dz=30*Math.sin(v.angle);near(Math.hypot(dx,dz),100);assert.ok(v.net>0);}});
