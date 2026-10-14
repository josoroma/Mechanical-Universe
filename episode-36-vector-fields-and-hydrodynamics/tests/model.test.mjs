import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
test('Integrales de contorno: caudal de la fuente y circulación del vórtice',()=>{const s=O.create(),n=720,r=.025;let flux=0,circulation=0;for(let i=0;i<n;i++){const a=2*Math.PI*(i+.5)/n,c=Math.cos(a),d=Math.sin(a),v=O.velocity(s,-.08+r*c,r*d),w=O.velocity(s,r*c,r*d);flux+=(v[0]*c+v[1]*d)*r*2*Math.PI/n;circulation+=(-w[0]*d+w[1]*c)*r*2*Math.PI/n;}near(flux,.001);near(circulation,.002);});
test('Fuera de los núcleos, divergencia y vorticidad locales son nulas',()=>{const s=O.create(),x=0,y=.04,h=1e-6,px=O.velocity(s,x+h,y),mx=O.velocity(s,x-h,y),py=O.velocity(s,x,y+h),my=O.velocity(s,x,y-h);near((px[0]-mx[0]+py[1]-my[1])/(2*h),0,1e-8);near((px[1]-mx[1]-py[0]+my[0])/(2*h),0,1e-8);});
test('RK4 sigue la órbita circular analítica de un vórtice aislado',()=>{const s=O.create({flow:0,stream:0,circulation:40});let p=[.1,0];for(let i=0;i<200;i++)p=O.rk4(s,p,.02);const a=.004/(2*Math.PI*.1**2)*4;near(p[0],.1*Math.cos(a));near(p[1],.1*Math.sin(a));});
test('Trazadores deterministas al recorrer el reloj de formas distintas',()=>{const a=O.tracers(O.advance(O.create(),3.7)),b=O.tracers(O.advance(O.advance(O.create(),1.2),2.5));assert.deepEqual(a,b);for(const t of[0,5,10,20])for(const p of O.tracers(O.advance(O.create(),t)))assert.ok(p.point.every(Number.isFinite)&&p.opacity>=0&&p.opacity<=1);});
