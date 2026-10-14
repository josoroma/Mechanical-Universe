import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1e-30,Math.abs(a),Math.abs(b)));
test('La resolución es inversamente proporcional a Q en diez órdenes de magnitud',()=>{for(let logQ=-6;logQ<=3.5;logQ+=.5){const a=O.snapshot(O.create({logQ})),b=O.snapshot(O.create({logQ:logQ+.5}));near(a.probe*a.resolution,O.HBARC);near(b.resolution/a.resolution,10**-.5);}near(O.snapshot(O.create({logQ:0})).resolution,1.973269804e-16);});
test('Las cargas de uud y udd son exactamente +e y cero',()=>{const p=O.snapshot(O.create()),n=O.snapshot(O.create({baryon:1}));assert.equal(p.up,2);assert.equal(p.down,1);assert.equal(p.charge,1);assert.equal(n.up,1);assert.equal(n.down,2);assert.equal(n.charge,0);});
test('Las referencias de escala se alcanzan en el orden correcto',()=>{assert.equal(O.snapshot(O.create({logQ:-6})).stage,-1);assert.equal(O.snapshot(O.create({logQ:-5})).stage,0);assert.equal(O.snapshot(O.create({logQ:-1})).stage,1);assert.equal(O.snapshot(O.create({logQ:1})).stage,2);});
