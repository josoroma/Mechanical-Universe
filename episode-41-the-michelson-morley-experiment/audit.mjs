import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
import {lesson as L} from './lesson.mjs';
export function check(){const c=L.controls[0],states=[0,L.duration/4,L.duration/2,L.duration*.79,L.duration].map((t,i)=>O.advance(O.create({[c.id]:i%2?c.max:c.min}),t));states.push(O.create({angle:35,offset:-.5}),O.advance(O.create({angle:145,offset:.5}),1.2));auditScene(S,states);}
