import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.25,.5,3.4,8,12].map((t,i)=>O.advance(O.create({eccentricity:i%2?.45:.05,amplification:i%2?100000:1}),t)));}
