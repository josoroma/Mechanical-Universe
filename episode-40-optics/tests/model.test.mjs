import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ≠ ${b}`);
test('La lente cumple la ecuación, el aumento y la intersección de ambos rayos',()=>{for(const focus of[40,60,80])for(const distance of[160,240])for(const t of[0,3,9]){const s={...O.create({focus,distance}),t},v=O.snapshot(s),r=O.lensRays(s);near(1/focus,1/v.distance+1/v.image);near(v.height/O.OBJECT_HEIGHT,-v.image/v.distance);near(r[0][2][1],r[1][2][1]);near((r[0][2][1]-r[0][1][1])/(r[0][2][0]-r[0][1][0]),-O.OBJECT_HEIGHT/focus);assert.ok(v.image>0&&v.magnification<0);}});
test('Reflexión exacta: punto sobre la circunferencia y ángulos iguales',()=>{for(const f of[40,80])for(const h of[-12,12]){const r=O.mirrorRay(f,h),R=2*f,n=[(r.hit[0]+R)/R,h/R];near((r.hit[0]+R)**2+h*h,R*R);near(Math.hypot(...r.direction),1);near(r.direction[0]*n[0]+r.direction[1]*n[1],-n[0]);assert.ok(-r.axis<f);}});
test('El rayo paraxial del espejo se acerca a R/2',()=>{near(-O.mirrorRay(60,.001).axis,60,1e-8);});
test('Snell en ambas caras del prisma y desviación simétrica',()=>{for(const index of[1.3,1.5,1.8]){const s=O.create({index}),v=O.snapshot(s),p=O.prismRay(s),i=v.incidence*Math.PI/180;near(Math.sin(i),index*Math.sin(Math.PI/6));near(Math.acos(p.incoming[0]*p.outgoing[0]+p.incoming[1]*p.outgoing[1])*180/Math.PI,v.deviation);near(p.points[1][1],p.points[2][1]);}assert.ok(O.snapshot(O.create({index:1.8})).deviation>O.snapshot(O.create()).deviation);});
