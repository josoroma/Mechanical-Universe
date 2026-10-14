import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
test('La tensión de la barra coincide con −dΦ/dt para normal −z',()=>{const s=O.advance(O.create(),.7),h=1e-5,v=O.snapshot(s),a=O.snapshot({...s,t:s.t-h}),b=O.snapshot({...s,t:s.t+h});near(v.rodEmf,-(b.flux-a.flux)/(2*h));});
test('Conservación de potencia y reacción opuesta al movimiento',()=>{for(const mode of[0,1])for(const speed of[-12,-6,0,6,12])for(const field of[-.8,0,.8]){const v=O.snapshot(O.advance(O.create({mode,speed,field}),.8));near(v.mechanical,v.current**2*4);near(v.power,v.mechanical);assert.ok(v.force*v.velocity<=1e-15);assert.ok(v.torque*speed<=1e-15);assert.ok(Object.values(v).filter(x=>typeof x==='number').every(Number.isFinite));}});
test('El disco integra Bωr desde el contacto interior hasta el exterior',()=>{const s=O.create({mode:0}),n=1000,dr=(O.RADIUS-O.INNER)/n;let sum=0;for(let i=0;i<n;i++)sum+=s.field*s.speed*(O.INNER+(i+.5)*dr)*dr;near(sum,O.snapshot(s).diskEmf);});
test('La derivada de la energía acumulada reproduce la potencia instantánea',()=>{for(const mode of[0,1]){const s=O.advance(O.create({mode}),.7),h=1e-5,a=O.snapshot({...s,t:s.t-h}),b=O.snapshot({...s,t:s.t+h});near((b.energy-a.energy)/(2*h),O.snapshot(s).power);}});
