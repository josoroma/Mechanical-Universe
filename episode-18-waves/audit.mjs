import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){const states=[];for(const p of[{frequency:3,tension:4,stiffness:20},{frequency:.5,tension:36,stiffness:80}])for(const t of[0,1/(4*p.frequency),1/(2*p.frequency),3/(4*p.frequency)])states.push(O.advance(O.create(p),t));auditScene(S,states);}
