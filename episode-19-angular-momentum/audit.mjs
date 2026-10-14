import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,1,2,3,5,9].map((t,i)=>O.advance(O.create({radius:i%2?.3:1.2,spin:i%2?20:60}),t)));}
