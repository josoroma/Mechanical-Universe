import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
test('Relojes en reposo coinciden y a 0,8c τ = 0,6t',()=>{for(const t of[0,.5,1,3,6]){const r=O.snapshot(O.advance(O.create({beta:0}),t));near(r.tau,t);near(r.pulse,r.fixedPulse);near(O.snapshot(O.advance(O.create({beta:.8}),t)).tau,.6*t);}});
test('Cada retorno tiene período γΔτ y el módulo de la velocidad luminosa es c',()=>{for(const b of[0,.3,.95]){const s=O.create({beta:b}),v=O.snapshot(s),r=O.snapshot(O.advance(s,v.labPeriod));near(r.pulse,0);near(b*b+v.verticalSpeed*v.verticalSpeed,1);near(v.distance,O.C0*s.period/2);}});
test('La fase del pulso es continua en los dos espejos',()=>{near(O.bounce(.5),1);near(O.bounce(1),0);assert.ok(Math.abs(O.bounce(.5-1e-8)-O.bounce(.5+1e-8))<1e-7);});
