import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import {EPS0,MU0,TAU} from '../../laboratory/electrical.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol*Math.max(1e-12,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
test('Las dos superficies de Ampère dan la misma corriente y circulación',()=>{for(const t of[0,12,37,80]){const v=O.snapshot({...O.create(),t});near(v.current,v.displacement);near(TAU*.06*v.probeB,MU0*v.current);}});
test('La corriente coincide con las derivadas de carga y flujo eléctrico',()=>{const s={...O.create(),t:13},h=.0001,a=O.snapshot({...s,t:s.t-h}),b=O.snapshot({...s,t:s.t+h}),v=O.snapshot(s);near(v.current,(b.charge-a.charge)/(2*h*1e-9));near(v.displacement,EPS0*(b.flux-a.flux)/(2*h*1e-9));});
test('La onda satisface Faraday, E/B y la velocidad en el vacío',()=>{const s={...O.create(),t:11},x=7,h=.0001,w=O.wave(s,x),dEdx=(O.wave(s,x+h).electric-O.wave(s,x-h).electric)/(2*h),dBdt=(O.wave(s,x,s.t+h).magnetic-O.wave(s,x,s.t-h).magnetic)/(2*h*1e-9);near(dEdx,dBdt);near(w.electric,-O.C0*w.magnetic);near(O.C0,1/Math.sqrt(MU0*EPS0));});
test('Duplicar frecuencia reduce λ a la mitad; el flujo energético es positivo',()=>{const s=O.create(),a=O.snapshot(s),b=O.snapshot(O.create({frequency:20}));near(a.wavelength,2*b.wavelength);for(let i=0;i<100;i++)assert.ok(O.wave({...s,t:i},i/5).poynting>=0);near(O.snapshot(O.create({amplitude:0})).meanIntensity,0);near(O.snapshot(O.create({voltage:0})).current,0);});
