import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol*Math.max(1e-16,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
test('El camino racionalizado coincide con la resta de los tiempos clásicos',()=>{const v=3000,theta=.37,b=(v*1000/O.C0)**2,t=a=>2*O.LENGTH/O.C0*Math.sqrt(1-b*Math.sin(a)**2)/(1-b);near(O.etherPath(v,theta),O.C0*(t(theta)-t(theta+Math.PI/2)),1e-10);});
test('A 30 km/s y 589 nm se esperan unas 0,374 franjas en un giro de 90°',()=>{const v=O.snapshot(O.create());assert.ok(Math.abs(v.shift90-.374)<.001);near(v.shift90,2*O.LENGTH*(30000/O.C0)**2/(589e-9),1e-7);});
test('Giros de 90° y 180°, amplitud cuadrática y longitud de onda',()=>{const s=O.create({mode:1}),a=O.snapshot(s),b=O.snapshot(O.create({...s,angle:90})),c=O.snapshot(O.create({...s,angle:180}));near(a.orientation,-b.orientation);near(a.orientation,c.orientation);near(O.snapshot(O.create({...s,speed:60})).shift90,4*a.shift90,1e-7);near(O.snapshot(O.create({...s,wavelength:589/2})).shift90,2*a.shift90);});
test('Luz isotrópica y velocidad nula: no hay diferencia por orientación',()=>{for(const angle of[0,45,90,140]){const a=O.snapshot(O.create({angle})),b=O.snapshot(O.create({angle,speed:0,mode:1}));assert.equal(a.orientation,0);assert.equal(b.orientation,0);assert.equal(b.delay,0);}});
test('Mover el espejo λ/2 repite las franjas; λ/4 invierte su intensidad',()=>{const s=O.create({mode:1,angle:37}),half=s.wavelength/2000,quarter=half/2;for(const u of[-.4,-.2,0,.1,.3]){const a=O.intensityAt(s,u);near(a,O.intensityAt({...s,offset:half},u));near(1-a,O.intensityAt({...s,offset:quarter},u));}near(O.snapshot({...s,offset:half}).mirrorPath,2*half);});
