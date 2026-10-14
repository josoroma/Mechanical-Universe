import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
test('las elipses reproducen la posición y velocidad inicial seleccionadas',()=>{for(const speedRatio of[.7,1,1.15]){const s=O.create({speedRatio}),p=O.snapshot(s);assert.ok(Math.abs(p.x-s.distance)<1e-12);assert.ok(Math.abs(p.y)<1e-12);assert.ok(Math.abs(p.vx)<1e-12);assert.ok(Math.abs(p.vy-p.initialSpeed)<1e-12);assert.ok(p.energy<0);}});
test('fuerza inversa al cuadrado y aceleración vectorial del disco',()=>{const s=O.create({speedRatio:.7}),h=1e-5;assert.equal(O.force(s,.1),4*O.force(s,.2));for(const t of[.1,1,3]){const p=O.position(s,t),a=O.position(s,t-h),b=O.position(s,t+h);for(const [axis,v]of[['x','vx'],['y','vy']])assert.ok(Math.abs((b[v]-a[v])/(2*h)+s.mu*p[axis]/p.r**3)<1e-6);}});
test('energía y momento angular se conservan durante una vuelta',()=>{const s=O.create({speedRatio:1.15}),p0=O.position(s);for(let i=0;i<=50;i++){const p=O.position(s,p0.period*i/50);assert.ok(Math.abs(p.x*p.vy-p.y*p.vx-p0.h)<1e-12);assert.ok(Math.abs(.5*p.speed**2-s.mu/p.r-p0.energy)<1e-12);}});
