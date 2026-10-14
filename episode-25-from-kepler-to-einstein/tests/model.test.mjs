import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
test('Mercurio reproduce el período y el exceso relativista conocidos',()=>{const p=O.snapshot(O.create());assert.ok(Math.abs(p.perCentury-42.98)<.02);assert.ok(Math.abs(p.periodDays-87.969)<.005);});
test('la ampliación cambia el dibujo y conserva todas las medidas reales',()=>{const a=O.snapshot(O.advance(O.create({amplification:1}),4)),b=O.snapshot(O.advance(O.create({amplification:100000}),4));assert.equal(a.actualArcsec,b.actualArcsec);assert.equal(a.perCentury,b.perCentury);assert.ok(Math.abs(b.shownDegrees/a.shownDegrees-100000)<1e-8);});
test('Newton cierra la órbita y el perihelio relativista avanza por vuelta',()=>{const s=O.create({amplification:100000}),a=O.position(s),b=O.position(O.advance(s,1)),c=O.position(O.advance(s,1),true);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-12);assert.ok(Math.abs(Math.atan2(c.y,c.x)-O.shift(s.eccentricity)*s.amplification)<1e-12);assert.ok(Math.abs(c.r-a.r)<1e-12);});
