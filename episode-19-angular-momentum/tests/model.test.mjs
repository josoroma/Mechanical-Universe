import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
test('L se conserva entre configuraciones; acercar las pesas exige trabajo',()=>{const a=O.properties(O.create({radius:1.2})),b=O.properties(O.create({radius:.3}));assert.equal(a.L,b.L);assert.ok(b.omega>a.omega);assert.ok(b.energy>a.energy);assert.ok(b.work>0);assert.ok(Math.abs(b.I*b.omega-b.L)<1e-12);});
test('el trabajo equivale al cambio de energía; precesión inversa al giro',()=>{const s=O.create(),a=O.properties(s),b=O.properties({...s,spin:80});assert.equal(a.work,0);assert.equal(a.precession,2*b.precession);assert.ok(Math.abs(a.precession*a.wheelL-O.WHEEL_MASS*O.GRAVITY*O.LEVER)<1e-12);});
test('las fases avanzan con las velocidades calculadas',()=>{const s=O.snapshot(O.advance(O.create(),3));assert.equal(s.theta,3*s.omega);assert.equal(s.phi,3*s.precession);assert.equal(s.psi,120);});
