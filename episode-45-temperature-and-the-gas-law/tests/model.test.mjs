import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)));
test('PV = nRT: duplicar T o n, o reducir V a la mitad, duplica P',()=>{const s=O.create(),v=O.snapshot(s);for(const p of[{temperature:600},{amount:.1},{volume:5}])near(O.snapshot(O.create(p)).pressure,2*v.pressure);near(v.pressure*s.volume,s.amount*O.R*s.temperature);});
test('Rapidez y energía interna corresponden a un gas monoatómico',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.create({temperature:600}));near(b.vrms/a.vrms,Math.SQRT2);near(a.internal,1.5*a.pressure*a.volume);near(a.molecules,.05*O.NA);});
test('Reflexiones continuas y partículas dentro de la cámara en todos los extremos',()=>{near(O.reflect(1),1);near(O.reflect(2),0);near(O.reflect(-.3),.3);for(const temperature of[150,600])for(const volume of[5,20])for(let t=0;t<=10;t+=.1)for(const p of O.particles(O.advance(O.create({temperature,volume,amount:.1}),t)))assert.ok(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);});
