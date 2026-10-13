import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import * as S from '../scene.mjs';
import * as G from '../kit/lathe.mjs';
import {orderParts} from '../painter.mjs';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
// Cuadratura independiente de K: contrasta el cálculo mediante AGM.
function integral(k){const n=10000,h=Math.PI/(2*n),f=t=>1/Math.sqrt(1-k*k*Math.sin(t)**2);let sum=f(0)+f(Math.PI/2);for(let i=1;i<n;i++)sum+=(i%2?4:2)*f(i*h);return sum*h/3;}
near(O.ellipticK(0),Math.PI/2);for(const k of[.1,.25,Math.sin(Math.PI/8)])near(O.ellipticK(k),integral(k),1e-12);
let configurations=0;
for(const angle of[0,5,15,45])for(const mass of[.1,.2,.4])for(const length of[.6,1,1.4])for(const linear of[false,true]){
  const c=O.create({angle,mass,length,linear}),state=O.advance(c,40),s=O.snapshot(state);configurations++;near(c.t,0);near(c.theta,angle*O.DEG);
  for(const b of[s.spring,s.pendulum]){near(b.E,b.E0,Math.max(1e-13,b.E0*1e-7));assert.ok(Math.abs(b.q)<=1+1e-8&&Math.abs(b.u)<=1+1e-8);}
  if(!angle){near(s.pendulum.theta,0);near(s.pendulum.omega,0);near(s.pendulum.E,0);assert.equal(s.pendulum.period,null);assert.deepEqual(O.orbit(c,'pendulum'),[[0,0]]);}
  else{const quarter=O.snapshot(O.advance(c,c.Tp/4)),half=O.snapshot(O.advance(c,c.Tp/2)),full=O.snapshot(O.advance(c,c.Tp));near(quarter.pendulum.theta,0,2e-9);near(half.pendulum.theta,-c.theta0,2e-9);near(full.pendulum.theta,c.theta0,2e-9);assert.ok(quarter.pendulum.omega<0);near(quarter.pendulum.U,0,1e-12);
    for(const[q,u]of O.orbit(c,'pendulum')){const theta=q*c.theta0,omega=u*c.w0*c.theta0,U=linear?O.BOB_MASS*O.G*length*theta*theta/2:O.BOB_MASS*O.G*length*(1-Math.cos(theta)),K=O.BOB_MASS*length*length*omega*omega/2;near(U+K,s.pendulum.E0);}
  }
  near(O.snapshot(O.advance(c,c.Ts/4)).spring.x,0);near(O.snapshot(O.advance(c,c.Ts/2)).spring.x,-O.A);
  if(linear)near(c.Tp,c.T0);else assert.ok(c.Tp>=c.T0-1e-12);
}
const large=O.create({angle:45}),small=O.create({angle:5});assert.ok(large.Tp>small.Tp);near(large.Tp/large.T0,1.0399733431968032);
near(O.create({mass:.4}).Ts/O.create({mass:.1}).Ts,2);near(O.create({length:1.4}).Tp/O.create({length:.6}).Tp,Math.sqrt(1.4/.6));
const harmonic=O.create({linear:true});for(const t of[0,.25,.5,1,2,10]){const s=O.snapshot(O.advance(harmonic,t));near(s.spring.q,s.pendulum.q);near(s.spring.u,s.pendulum.u);}
let split=O.create({angle:45});for(let i=0;i<30;i++)split=O.advance(split,.1);const once=O.advance(O.create({angle:45}),3);near(split.theta,once.theta,1e-9);near(split.omega,once.omega,1e-9);
for(const params of[{angle:-1},{angle:46},{angle:NaN},{mass:.3},{length:0},{linear:1}])assert.throws(()=>O.create(params),RangeError);for(const dt of[-1,Infinity,NaN,61])assert.throws(()=>O.advance(large,dt),RangeError);
const cache=new WeakMap();let poses=0;
for(const length of[.6,1.4])for(let i=0;i<=80;i++){const c={...O.create({angle:45,length,mass:[.1,.2,.4][i%3]}),theta:(-45+i*90/80)*O.DEG,t:i*.05},parts=S.scene(c),order=orderParts(parts,S.P,cache),bob=S.bobCentre(c),thread=S.threadRoute(c);poses++;assert.equal(new Set(order).size,parts.length);assert.equal(parts.filter(p=>p.lit).length,1);assert.equal(parts.filter(p=>p.shape.route==='spring.coil').length,16);assert.equal(parts.filter(p=>p.shape.route==='pendulum.thread').length,4);near(G.len3(G.sub3(bob,S.PIVOT)),length*S.PENDULUM_SCALE);near(G.len3(G.sub3(thread[0],S.PIVOT)),2);near(G.len3(G.sub3(thread.at(-1),bob)),S.BOB_RADIUS);assert.ok(bob[2]-S.BOB_RADIUS>22);const port=parts.find(p=>p.name==='spring.port.moving');near(S.coilRoute(O.snapshot(c).spring.x).at(-1)[0],port.shape.s0);}
console.log(`${configurations} configuraciones físicas y ${poses} estados geométricos: correctos.`);
