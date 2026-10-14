import{auditScene}from'../laboratory/audit-scene.mjs';
import*as O from'./model.mjs';import*as S from'./scene.mjs';import{lesson as L}from'./lesson.mjs';
export function check(){const first=L.controls[0];auditScene(S,[0,L.duration/4,L.duration/2,L.duration*.79,L.duration].map((t,i)=>O.advance(O.create({[first.id]:i%2?first.max:first.min}),t)));}
