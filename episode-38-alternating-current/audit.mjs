import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
import {lesson as L} from './lesson.mjs';
export function check(){const c=L.controls[0],states=[0,L.duration/4,L.duration/2,L.duration*.79,L.duration].map((t,i)=>O.advance(O.create({[c.id]:i%2?c.max:c.min}),t));states.push(O.advance(O.create({frequency:3}),1/12),O.advance(O.create({frequency:3}),1/24));auditScene(S,states);}
