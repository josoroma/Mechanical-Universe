import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
test('Lorentz conserva el intervalo y se invierte cambiando el signo de β',()=>{for(const b of[0,.3,.6,.95])for(const x of[-2,0,1.5])for(const ct of[0,1,4]){const q=O.transform(x,ct,b),r=O.transform(q.xp,q.ctp,-b);near(ct*ct-x*x,q.ctp*q.ctp-q.xp*q.xp);near(r.xp,x);near(r.ctp,ct);}});
test('A 0,6 c γ = 1,25, el reloj marca 0,8t y L = 0,8L₀',()=>{const s=O.snapshot(O.advance(O.create(),2));near(s.gamma,1.25);near(s.tau,1.6);near(s.length,1.6);});
test('Los rayos de luz siguen siendo rayos de luz y la simultaneidad cambia',()=>{for(const b of[.2,.8]){const a=O.transform(2,2,b);near(a.xp,a.ctp);near(O.transform(1,0,b).ctp,-O.gamma(b)*b);}});
