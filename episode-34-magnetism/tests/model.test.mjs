import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(Math.abs(a),Math.abs(b),1e-20));
test('Hilo: inversión de corriente e inverso de la distancia',()=>{const a=O.wire(.04,0,4),b=O.wire(.08,0,4),c=O.wire(.04,0,-4);near(a[0],0);near(a[1],-c[1]);near(a[1],2*b[1]);assert.ok(a[1]>0);});
test('Dipolo: relación axial/ecuatorial y dependencia cúbica',()=>{const a=O.dipole(.18,0,0),b=O.dipole(0,.18,0),c=O.dipole(.36,0,0);near(a[0],-2*b[0]);near(a[0],8*c[0]);near(a[1],0);});
test('Superposición: el campo terrestre suma 25 μT en +x',()=>{const a=O.field(O.create({earth:0}),1,0),b=O.field(O.create({earth:1}),1,0);near(b[0]-a[0],25e-6);near(a[1],b[1]);assert.equal(O.snapshot(O.create({current:0,earth:0})).wireDirection,'Sin orientación definida');});
