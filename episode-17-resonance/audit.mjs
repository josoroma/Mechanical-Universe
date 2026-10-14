import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){const states=[];for(const frequency of[.4,1,1.6])for(const t of[0,.25,1,4,10])states.push(O.advance(O.create({frequency,force:.08,damping:.16}),t));auditScene(S,states);}
