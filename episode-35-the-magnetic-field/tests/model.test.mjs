import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import {MU0} from '../../laboratory/electrical.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(Math.abs(a),Math.abs(b),1e-20));
test('Campo central y simetría axial del solenoide finito',()=>{near(O.fieldAt(0,1,120),MU0*120/(2*Math.hypot(.025,.03)));near(O.fieldAt(.08,1,120),O.fieldAt(-.08,1,120));assert.ok(O.fieldAt(.08,1,120)<O.fieldAt(.04,1,120));});
test('Invertir I invierte B y Hall; duplicar N duplica ambos',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.create({current:-1})),c=O.snapshot(O.create({turns:240}));near(a.field,-b.field);near(a.hall,-b.hall);near(c.field,2*a.field);near(c.hall,2*a.hall);});
test('La fórmula coincide con integrar numéricamente el campo de espiras',()=>{const z=.08,n=10000,ds=O.LENGTH/n;let sum=0;for(let i=0;i<n;i++){const u=-O.LENGTH/2+(i+.5)*ds;sum+=MU0*120/O.LENGTH*O.RADIUS**2/(2*(O.RADIUS**2+(z-u)**2)**1.5)*ds;}assert.ok(Math.abs(sum/O.fieldAt(z,1,120)-1)<2e-8);});
