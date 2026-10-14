const phi=(1+Math.sqrt(5))/2;
export const SOLIDS=[
 {name:'Cubo',faces:6,ratio:1/Math.sqrt(3),between:'Saturno y Júpiter'},
 {name:'Tetraedro',faces:4,ratio:1/3,between:'Júpiter y Marte'},
 {name:'Dodecaedro',faces:12,ratio:Math.sqrt((5+2*Math.sqrt(5))/15),between:'Marte y la Tierra'},
 {name:'Icosaedro',faces:20,ratio:Math.sqrt((5+2*Math.sqrt(5))/15),between:'la Tierra y Venus'},
 {name:'Octaedro',faces:8,ratio:1/Math.sqrt(3),between:'Venus y Mercurio'}
];
export const norm=p=>Math.hypot(...p);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const mul=(a,s)=>a.map(v=>v*s);
export function vertices(i){let v=[];if(i===0||i===1||i===2)for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])if(i!==1||x*y*z===1)v.push([x,y,z]);if(i===2||i===3)for(const a of[-1,1])for(const b of[-1,1]){const u=i===2?1/phi:1,w=phi;v.push([0,a*u,b*w],[a*u,b*w,0],[b*w,0,a*u]);}if(i===4)for(let j=0;j<3;j++)for(const s of[-1,1])v.push([0,0,0].map((_,k)=>j===k?s:0));return v.map(p=>mul(p,1/norm(p)));}
export function edges(v){const result=[],length=Math.min(...v.flatMap((p,i)=>v.slice(i+1).map(q=>norm(sub(p,q)))));for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++)if(Math.abs(norm(sub(v[i],v[j]))-length)<1e-8)result.push([i,j]);return result;}
export function rotate([x,y,z],[ax,ay,az]){let c=Math.cos(ax),s=Math.sin(ax);[y,z]=[c*y-s*z,s*y+c*z];c=Math.cos(ay);s=Math.sin(ay);[x,z]=[c*x+s*z,-s*x+c*z];c=Math.cos(az);s=Math.sin(az);return[c*x-s*y,s*x+c*y,z];}
// Orientations leave clear vertical paths for the real support columns.
export const ROTATIONS=[[0,0,0],[1.585531494539493,.5537059905227432,3.627164742839208],[1.3983496941004603,2.360342630979059,.16125106985144877],[2.8103512036652605,.7443061550646475,5.490333437191055],[6.24947146473701,5.360830817378556,3.139561476685979]];
export function cages(){let radius=100;return SOLIDS.map((s,i)=>{const r=radius;radius*=s.ratio;const v=vertices(i).map(p=>add([-75,0,135],mul(rotate(p,ROTATIONS[i]),r)));return{...s,radius:r,innerRadius:radius,vertices:v,edges:edges(v),joint:i===0?1.1:i===1?.55:.34,strut:i===0?.45:i===1?.28:.16};});}
