import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../scene.mjs';
import * as D from '../painter.mjs';
test('Las piezas dibujadas conservan un orden de profundidad válido a lo largo de la pista',()=>{
  const cache=new WeakMap();for(let i=0;i<=440;i++){const x=-22+i*.1,parts=S.scene(x,i/9),order=D.orderParts(parts,S.P,cache);assert.equal(order.length,parts.length);assert.equal(new Set(order).size,parts.length);assert.equal(parts.filter(p=>p.lit).length,1);}
});
test('Las ruedas tocan el perfil poligonal que realmente se dibuja',()=>{
  for(let x=-21;x<=21;x+=.25){const wheel=S.car(x).find(p=>p.name==='car.wheel.front'),[cx,,cz]=wheel.shape.F.o;let distance=Infinity;for(let i=0;i<96;i++){const a=-24+i*.5,b=a+.5,ax=a*S.XSCALE,bx=b*S.XSCALE,az=S.zAt(a),bz=S.zAt(b),dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((cx-ax)*dx+(cz-az)*dz)/(dx*dx+dz*dz)));distance=Math.min(distance,Math.hypot(cx-ax-t*dx,cz-az-t*dz));}assert.ok(Math.abs(distance-3.2)<2e-6);}
});
