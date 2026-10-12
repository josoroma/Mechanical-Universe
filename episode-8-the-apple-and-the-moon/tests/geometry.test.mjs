import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../model.mjs';
import * as S from '../scene.mjs';
import {orderParts} from '../painter.mjs';
test('Cada pieza se ordena una sola vez a partir de su sólido real',()=>{
  const parts=S.scene(),order=orderParts(parts,S.P);
  assert.equal(parts.length,58);assert.equal(new Set(order).size,parts.length);
  assert.deepEqual([...order].sort(),parts.map(p=>p.name).sort());
  assert.ok(parts.every(p=>['cylinder','disc','slab','prism'].includes(p.shape.type)));
});
test('Todos los recorridos quedan dentro del encuadre fijo hasta su evento final',()=>{
  for(const v of [0,4,7.4,M.CIRCULAR,8.5,9.5,M.ESCAPE,12]){
    const f=M.flight(v);
    for(const sample of f.samples){const[x,y]=S.project(sample.s);assert.ok(x>20&&x<S.WIDTH-20&&y>20&&y<S.HEIGHT-20,`${v}: ${x}, ${y}`);}
  }
});
