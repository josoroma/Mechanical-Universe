import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
test('La tensión es la derivada negativa del flujo enlazado',()=>{for(const t of[0,.13,.28,.91]){const s={...O.create(),t},h=1e-6;near(O.snapshot(s).voltage,-(O.snapshot({...s,t:t+h}).flux-O.snapshot({...s,t:t-h}).flux)/(2*h));}});
test('Valores eficaces y potencia media coinciden con la cuadratura de un ciclo',()=>{const s=O.create(),period=1/s.frequency,n=10000;let v2=0,p=0;for(let i=0;i<n;i++){const q=O.snapshot({...s,t:(i+.5)*period/n});v2+=q.voltage**2/n;p+=q.power/n;}near(Math.sqrt(v2),O.snapshot(s).rms);near(p,O.snapshot(s).average);});
test('Energía integrada y balance mecánico y eléctrico',()=>{const s=O.create(),t=.73,n=20000;let energy=0;for(let i=0;i<n;i++){const v=O.snapshot({...s,t:(i+.5)*t/n});energy+=v.power*t/n;near(v.power,v.mechanical);}near(energy,O.snapshot({...s,t}).energy,1e-8);});
test('Sin movimiento o sin campo no hay generación',()=>{for(const p of[{frequency:0},{field:0}]){const v=O.snapshot(O.advance(O.create(p),3));for(const k of['voltage','current','rms','energy','power'])near(v[k],0);}});
