import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
import {lesson as L} from './lesson.mjs';
export function check(){
 const first=L.controls[0],states=[0,L.duration/4,L.duration/2,L.duration*.79,L.duration].map((t,i)=>O.advance(O.create({[first.id]:i%2?first.max:first.min}),t));
 // Include conditional assemblies and both physical limits of their travel.
 states.push(O.create({cells:1,source:0}),O.create({cells:6,source:0}));
 auditScene(S,states);
}
