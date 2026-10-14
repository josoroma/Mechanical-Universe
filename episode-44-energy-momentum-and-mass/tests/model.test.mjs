import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b)));
test('La relación energía-momento conserva la masa invariante',()=>{for(const drive of[.1,1,2])for(const initial of[0,4])for(const t of[0,1,8]){const v=O.snapshot(O.advance(O.create({drive,initial}),t));near(v.total*v.total-v.momentum*v.momentum,O.REST*O.REST);assert.ok(v.beta<1);near(v.rest,O.REST);}});
test('dp/dt = F y la derivada de la posición coincide con v',()=>{const s=O.advance(O.create({drive:1.3,initial:.7}),2),a=O.snapshot(s),b=O.snapshot(O.advance(s,1e-6));near((b.p-a.p)/1e-6,s.drive,1e-6);near((b.distance-a.distance)/1e-6,a.beta,1e-6);});
test('El trabajo equivale al cambio de energía y aparece el límite clásico',()=>{const s=O.create({drive:.1}),a=O.snapshot(s),b=O.snapshot(O.advance(s,.001));near(b.work,b.kinetic-a.kinetic);near(b.kinetic,.5*b.beta*b.beta*O.REST,1e-8);});
