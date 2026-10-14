import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as Q from '../../laboratory/orbits.mjs';
test('la transferencia parte y llega tangencialmente a los radios elegidos',()=>{for(const destination of[1.2,1.524,2.2]){const s=O.create({destination}),p=O.transfer(s),a=O.positions(s,0),b=O.positions(s,p.flight);assert.ok(Math.abs(a.ship.x-1)<1e-12);assert.ok(Math.abs(b.ship.x+destination)<1e-12);assert.ok(Math.abs(a.ship.vx)<1e-12&&Math.abs(b.ship.vx)<1e-12);assert.ok(Math.hypot(b.ship.x-b.outer.x,b.ship.y-b.outer.y)<1e-12);}});
test('los impulsos son diferencias de velocidades y el segundo circulariza',()=>{const s=O.create(),p=O.transfer(s),a=O.positions(s,0).ship,b=O.positions(s,p.flight).ship,c=O.positions(s,p.flight+1e-6).ship;assert.ok(Math.abs((a.speed-Q.TAU)*Q.KM_S-p.dv1)<1e-12);assert.ok(Math.abs((c.speed-b.speed)*Q.KM_S-p.dv2)<1e-12);assert.ok(Math.abs(c.r-s.destination)<1e-12);});
test('un error de fase produce el desencuentro previsto',()=>{const s=O.create({phaseOffset:30}),p=O.transfer(s),b=O.positions(s,p.flight),distance=Math.hypot(b.ship.x-b.outer.x,b.ship.y-b.outer.y);assert.ok(Math.abs(distance-O.snapshot(s).arrivalMiss)<1e-12);assert.ok(O.snapshot(s).flightDays>250&&O.snapshot(s).flightDays<265);});
