import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as Q from '../../laboratory/orbits.mjs';
test('a h fijo, la energía crece con e y satisface su relación orbital',()=>{const s=O.create(),ps=[0,.4,.6].map(e=>O.position(s,e));assert.ok(ps.every(p=>Math.abs(p.h-ps[0].h)<1e-12));assert.ok(ps[2].energy>ps[1].energy&&ps[1].energy>ps[0].energy);for(const p of ps)assert.ok(Math.abs(p.e*p.e-1-2*p.energy*p.h*p.h/Q.SOLAR_MU**2)<1e-12);});
test('el perfil y la cinética radial suman la energía normalizada',()=>{for(const e of[0,.4,.6])for(const t of[0,.1,.5,1]){const s=O.advance(O.create({eccentricity:e}),t),p=O.snapshot(s),vr=p.radialSpeedKms/Q.KM_S;assert.ok(Math.abs(p.potentialNorm+.5*vr*vr*s.parameter/Q.SOLAR_MU-p.energyNorm)<1e-12);assert.ok(p.radialKinetic>-1e-12);}});
test('los cruces del perfil dan los radios extremos',()=>{for(const e of[0,.4,.6]){const s=O.create({eccentricity:e}),p=O.snapshot(s);for(const r of[p.rmin,p.rmax])assert.ok(Math.abs(O.potential(r/s.parameter)-p.energyNorm)<1e-12);}});
