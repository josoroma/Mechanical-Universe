import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(actual,expected,relative=1e-11)=>assert.ok(Math.abs(actual-expected)<=relative*Math.max(Math.abs(expected),1e-30),`${actual} ≠ ${expected}`);

test('El signo del campo y de la fuerza corresponde a una gota negativa',()=>{
  const drop=O.dropAt(0),up=O.physics(drop,300),down=O.physics(drop,-300);
  assert.ok(up.field<0&&up.q<0&&up.electric>0);assert.ok(down.field>0&&down.electric<0);
  near(up.electric,-down.electric);assert.ok(down.velocity<-down.freefall);
});
test('Gravedad, fuerza eléctrica y arrastre se compensan a velocidad terminal',()=>{
  for(const drop of O.DROPS)for(const U of [-500,-200,0,200,500]){
    const s=O.physics(drop,U),sum=s.electric-s.weight-s.drag*s.velocity;
    assert.ok(Math.abs(sum)<1e-27);assert.ok(s.relaxation<20e-6);
  }
});
test('Todas las gotas se pueden suspender dentro del rango del aparato',()=>{
  for(const drop of O.DROPS){const s=O.physics(drop,0),balanced=O.physics(drop,s.balance);assert.ok(s.balance>0&&s.balance<500);assert.ok(balanced.balanced);assert.ok(Math.abs(balanced.velocity)<1e-18);}
});
test('Capturar un electrón cambia el equilibrio pero conserva la caída libre',()=>{
  const drop=O.dropAt(0),s=O.physics(drop,0),charged={...drop,n:drop.n+1},next=O.physics(charged,0);
  near(next.freefall,s.freefall);near(next.weight,s.weight);near(next.balance/s.balance,drop.n/(drop.n+1));
  assert.ok(O.physics(charged,s.balance).velocity>0);
});
test('La inversión del arrastre corregido recupera radios y cargas sin usar n',()=>{
  for(const radius of [.4e-6,.7e-6,.85e-6,1e-6,1.5e-6])for(const n of [1,4,7]){
    const s=O.physics({radius,n},0),estimate=O.measuredCharge(s.freefall,s.balance);
    near(O.radiusFromFall(s.freefall),radius);near(estimate.radius,radius);near(estimate.units,n);near(estimate.q,-n*O.E_CHARGE);
    assert.ok(s.drag<6*Math.PI*O.ETA*radius&&s.slip>1);
  }
});
test('La tolerancia de equilibrio limita el error de carga al 0,301 %',()=>{
  const drop=O.dropAt(0),s=O.physics(drop,0);
  for(const multiplier of [.997001,1.002999]){const U=s.balance*multiplier;assert.ok(O.physics(drop,U).balanced);const estimate=O.measuredCharge(s.freefall,U);assert.ok(Math.abs(estimate.units/drop.n-1)<.00301);}
  assert.equal(O.physics(drop,s.balance*1.004).balanced,false);
});
test('Una tensión constante produce el desplazamiento terminal exacto',()=>{
  const drop=O.dropAt(0),U=120,dt=2.3,result=O.advance(drop,U,U,dt);
  near(result.z,drop.z+O.physics(drop,U).velocity*dt);near(result.U,U);assert.equal(result.contact,null);
});
test('El seguimiento exponencial de tensión es independiente de subdividir el tiempo',()=>{
  const drop=O.dropAt(0),full=O.advance(drop,0,400,1.1),first=O.advance(drop,0,400,.4),second=O.advance({...drop,z:first.z},first.U,400,.7);
  near(second.U,full.U);near(second.z,full.z);near(second.velocity,full.velocity);
});
test('La medición termina exactamente a 0,20 mm aunque el último paso sea parcial',()=>{
  const drop=O.dropAt(0),s=O.physics(drop,0),t=O.MEASURE_DISTANCE/s.freefall;
  const result=O.advance(drop,0,0,t);near(drop.z-result.z,O.MEASURE_DISTANCE);near(O.MEASURE_DISTANCE/t,s.freefall);
  assert.ok(t>2&&t<3);
});
test('Las placas limitan la posición; entradas no físicas se rechazan',()=>{
  const drop=O.dropAt(0),lower=O.advance(drop,0,0,200),upper=O.advance(drop,500,500,200);
  assert.equal(lower.contact,'lower');assert.equal(upper.contact,'upper');near(lower.z,-O.GAP/2+drop.radius);near(upper.z,O.GAP/2-drop.radius);
  assert.throws(()=>O.radiusFromFall(0),TypeError);assert.throws(()=>O.measuredCharge(1e-4,0),TypeError);assert.throws(()=>O.advance(drop,0,0,-1),TypeError);assert.throws(()=>O.physics({...drop,n:1.5},0),TypeError);
});
