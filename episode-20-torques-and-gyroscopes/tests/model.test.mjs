import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
test('energía y momento vertical se conservan incluso con nutación',()=>{for(const spin of[14,25,60])for(const tilt of[20,45,70]){let s=O.create({spin,tilt}),e=O.snapshot(s).energy;for(let i=0;i<60;i++){s=O.advance(s,.1);const p=O.snapshot(s);assert.ok(Math.abs(p.energy-e)<1e-8);assert.ok(Math.abs(O.vectors(s).L[2]-s.pPhi)<1e-12);assert.ok(p.nutation>-1e-6&&p.nutation<30);}}});
test('precesión uniforme conserva la inclinación',()=>{let s=O.create({preparation:1}),theta=s.theta,omega=O.regular(s.spin,theta);s=O.advance(s,6);assert.ok(Math.abs(s.theta-theta)<1e-10);assert.ok(Math.abs(s.phi-omega*6)<1e-10);});
test('la derivada vectorial de L coincide con el momento gravitatorio',()=>{const s=O.advance(O.create({spin:14}),.7),h=1e-5,a=O.vectors(s),b=O.vectors(O.advance(s,h));for(let i=0;i<3;i++)assert.ok(Math.abs((b.L[i]-a.L[i])/h-a.torque[i])<2e-5);});
