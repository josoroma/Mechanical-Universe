import test from "node:test";
import assert from "node:assert/strict";
import * as O from "../model.mjs";
import * as S from "../scene.mjs";
import {orderParts} from "../painter.mjs";
test("La rueda conserva el contacto y el orden de profundidad durante todo el recorrido radial",()=>{
  const cache=new WeakMap();
  for(let i=0;i<=240;i++){
    const state={...O.DEFAULTS,profile:"signed",amplitude:1.2,x:i/40},parts=S.scene(state),find=name=>parts.find(p=>p.name===name).shape;
    const wheel=find("wheel.contact"),disk=find("disk.face");
    assert.equal(wheel.r,O.WHEEL_R);assert.equal(wheel.F.o[2]-wheel.r,disk.z+disk.h);
    assert.ok(Math.abs(wheel.F.o[0])+1<disk.r);
    const order=orderParts(parts,S.P,cache);assert.equal(new Set(order).size,parts.length);
  }
});
