import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t*Math.max(1,Math.abs(a),Math.abs(b)));
test('Franja central, mínimo destructivo y pérdida ideal de interferencia',()=>{const s=O.create(),v=O.snapshot(s);near(O.intensity(s,0),1);near(O.intensity(s,v.spacing/2),0);assert.ok(O.intensity({...s,which:1},v.spacing/2)>.1);for(const y of[-20,-5,0,3,17])near(O.intensity(s,y),O.intensity(s,-y));});
test('La vista no cambia la probabilidad; el muestreo está normalizado y es reproducible',()=>{const s=O.create(),d=O.distribution(s);near(d.weights.reduce((a,b)=>a+b,0),1);near(d.cdf.at(-1),1);for(let i=0;i<600;i++){const a=O.hit(s,i),b=O.hit({...s,view:0},i);assert.deepEqual(a,b);assert.ok(a.y>=-20&&a.y<=20&&a.height>=0&&a.height<1);}assert.equal(O.snapshot(O.advance(s,12)).count,600);});
test('Miles de impactos reproducen la probabilidad central de la misma distribución',()=>{for(const which of[0,1]){const s=O.create({which}),expected=O.snapshot(s).central/100;let n=0;for(let i=0;i<20000;i++)if(Math.abs(O.hit(s,i).y)<1)n++;near(n/20000,expected,.01);}});
test('El espaciado aumenta con λ y disminuye con d',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.create({wavelength:400})),c=O.snapshot(O.create({separation:.5}));near(b.spacing/a.spacing,2/3);near(c.spacing,a.spacing/2);});
