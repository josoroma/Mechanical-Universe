import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as Q from '../../laboratory/orbits.mjs';
test('ecuación de Kepler sin saltos en vueltas positivas y negativas',()=>{for(const e of[0,.45,.65])for(const M of[-20,-.1,0,1,Math.PI,8,30]){const E=Q.eccentricAnomaly(M,e);assert.ok(Math.abs(E-e*Math.sin(E)-M)<1e-12);}});
test('aceleración inversa al cuadrado y energía constante',()=>{for(const e of[0,.65]){const s=O.create({eccentricity:e}),dt=1e-5;for(const t of[.02,.3,.5,.9]){const p=O.position(s,t),a=O.position(s,t-dt),b=O.position(s,t+dt);assert.ok(Math.abs((b.vx-a.vx)/(2*dt)+Q.SOLAR_MU*p.x/p.r**3)<1e-4);assert.ok(Math.abs(.5*p.speed**2-Q.SOLAR_MU/p.r-p.energy)<1e-10);}}});
test('sectores numéricos iguales y tercera ley',()=>{const s=O.create({axis:1.3,eccentricity:.65}),p=O.snapshot(s),delta=p.period/12;for(const start of[0,p.period/2]){let area=0,prev=O.position(s,start);for(let i=1;i<=2000;i++){const cur=O.position(s,start+i*delta/2000);area+=(prev.x*cur.y-prev.y*cur.x)/2;prev=cur;}assert.ok(Math.abs(area-p.area)<1e-7);}assert.ok(Math.abs(p.ratio-1)<1e-12);});
