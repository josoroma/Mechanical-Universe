import test from "node:test";
import assert from "node:assert/strict";
import * as O from "../model.mjs";
const close=(actual,expected,tolerance=1e-8)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} ≠ ${expected}`);
test("Primitivas: su derivada coincide con la altura para las cuatro curvas",()=>{
  for(const p of Object.keys(O.PROFILES))for(const x of [.1,1.2,2.7,4.1,5.9])close((O.primitive(p,x+1e-5)-O.primitive(p,x-1e-5))/2e-5,O.ordinate(p,x),1e-9);
});
test("Integral desde a, calibración y vueltas completas",()=>{
  const state={...O.DEFAULTS,profile:"constant",a:1,amplitude:1.2};
  const s=O.snapshot(state,6);close(s.net,6);close(s.turns,2);close(s.phi,4*Math.PI);close(O.snapshot(state,1).net,0);
});
test("Rodadura tangencial: R dφ/dx = r dθ/dx, también al girar al revés",()=>{
  for(const profile of Object.keys(O.PROFILES))for(const x of [1,2.5,3,4.8]){
    const state={...O.DEFAULTS,profile},s=O.snapshot(state,x),h=1e-5,dphi=(O.snapshot(state,x+h).phi-O.snapshot(state,x-h).phi)/(2*h);
    close(O.WHEEL_R*dphi,s.r*O.INPUT_SCALE,1e-8);
  }
});
test("Áreas con signo: cancelación neta y área geométrica positiva",()=>{
  const state={...O.DEFAULTS,profile:"signed"},s=O.snapshot(state,6),mid=O.snapshot(state,3);
  close(s.net,0);close(s.geometric,18/Math.PI);close(s.positive,s.negative);assert.ok(mid.net>0);assert.ok(O.snapshot(state,4).rate<0);close(mid.r,0);
});
test("Límite inferior dentro de la región negativa y límites invertidos",()=>{
  close(O.integral("signed",6,0),0);close(O.integral("constant",5,1),-4);
  const s=O.snapshot({...O.DEFAULTS,profile:"signed",a:4},6);assert.ok(s.net<0);close(s.positive,0);close(s.geometric,-s.net);
});
test("Los rectángulos de punto medio convergen; son exactos para funciones afines",()=>{
  for(const profile of ["constant","ramp"])close(O.snapshot({...O.DEFAULTS,profile,n:4},5.7).error,0);
  const state={...O.DEFAULTS,profile:"wave",x:2.7},coarse=O.snapshot({...state,n:4}),fine=O.snapshot({...state,n:32});assert.ok(Math.abs(fine.error)<Math.abs(coarse.error)/50);
});
test("El recorrido radial completo cabe en el disco y usa unidades españolas",()=>{
  for(const profile of Object.keys(O.PROFILES))for(let x=0;x<=6;x+=.05)assert.ok(Math.abs(O.snapshot({...O.DEFAULTS,profile,amplitude:1.2},x).r)<=43.2+1e-9);
  assert.equal(O.number(-1e-12),"0,00");assert.equal(O.number(1.5),"1,50");
});
