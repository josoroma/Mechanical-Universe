import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.13,.5,1,2,4,6].map((t,i)=>O.advance(O.create({spin:i%2?14:60,tilt:i%2?70:20,preparation:i%3===0?1:0}),t)));}
