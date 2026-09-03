(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4016],{4779:function(e,t,n){Promise.resolve().then(n.bind(n,8692))},8692:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return l}});var r=n(7573),a=n(7653),s=n(3015),i=n(1602),c=n(9135);function l(){let[e,t]=(0,a.useState)([{code:"COMP-PYTHON",name:"Python Engineering",category:"Core Technical",level:"Intermediate",links:4},{code:"COMP-FASTAPI",name:"FastAPI Backend Architecture",category:"Core Technical",level:"Intermediate",links:3},{code:"COMP-REACT",name:"React & Next.js Ecosystem",category:"Core Technical",level:"Advanced",links:3},{code:"COMP-NEO4J",name:"Neo4j Graph DB & Cypher",category:"Architectural",level:"Advanced",links:5},{code:"COMP-DOCKER",name:"Docker & Cloud Deployments",category:"DevOps",level:"Intermediate",links:3},{code:"COMP-ML-SYSTEMS",name:"Applied ML & Neural Architectures",category:"Applied Domain",level:"Advanced",links:4}]),[n,l]=(0,a.useState)(""),[o,d]=(0,a.useState)(""),[h,u]=(0,a.useState)("Core Technical");return(0,r.jsxs)("div",{className:"min-h-screen bg-[#090D16] text-slate-100 flex flex-col",children:[(0,r.jsx)(s.Z,{}),(0,r.jsxs)("div",{className:"flex flex-1",children:[(0,r.jsx)(i.Z,{role:"admin"}),(0,r.jsxs)("main",{className:"flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:"text-2xl font-black text-slate-100",children:"Global Competency Ontology & Taxonomy Manager"}),(0,r.jsx)("p",{className:"text-xs text-slate-400 mt-0.5",children:"Governs skill nodes, prerequisite dependencies, and industry difficulty classifications."})]}),(0,r.jsxs)("div",{className:"glass-panel p-5 rounded-2xl border border-white/10 space-y-4",children:[(0,r.jsx)("h3",{className:"text-xs font-bold uppercase tracking-wider text-rose-300",children:"Add New Competency to Neo4j Ontology"}),(0,r.jsxs)("form",{onSubmit:r=>{r.preventDefault(),n&&o&&(t([{code:o,name:n,category:h,level:"Intermediate",links:1},...e]),l(""),d(""))},className:"grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs",children:[(0,r.jsx)("input",{type:"text",placeholder:"Competency Name (e.g. Graph Neural Networks)",value:n,onChange:e=>l(e.target.value),className:"bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"}),(0,r.jsx)("input",{type:"text",placeholder:"Node Code (e.g. COMP-GNN)",value:o,onChange:e=>d(e.target.value),className:"bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"}),(0,r.jsxs)("select",{value:h,onChange:e=>u(e.target.value),className:"bg-[#131826] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500",children:[(0,r.jsx)("option",{children:"Core Technical"}),(0,r.jsx)("option",{children:"Applied Domain"}),(0,r.jsx)("option",{children:"Architectural"}),(0,r.jsx)("option",{children:"DevOps"}),(0,r.jsx)("option",{children:"Soft Skill"})]}),(0,r.jsxs)("button",{type:"submit",className:"py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-1 shadow-md shadow-rose-500/20",children:[(0,r.jsx)(c.Z,{className:"w-4 h-4"}),(0,r.jsx)("span",{children:"Register Node"})]})]})]}),(0,r.jsxs)("div",{className:"glass-panel rounded-2xl p-5 border border-white/10 space-y-3",children:[(0,r.jsxs)("h3",{className:"text-sm font-bold text-slate-100",children:["Live Neo4j Competency Taxonomy (",e.length," Active Nodes)"]}),(0,r.jsx)("div",{className:"space-y-2",children:e.map((e,t)=>(0,r.jsxs)("div",{className:"flex flex-wrap items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs gap-2",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:"font-bold text-slate-200",children:e.name}),(0,r.jsxs)("span",{className:"text-[11px] text-slate-400 font-mono ml-2",children:["[",e.code,"]"]})]}),(0,r.jsxs)("div",{className:"flex items-center gap-4 text-[11px]",children:[(0,r.jsx)("span",{className:"px-2 py-0.5 rounded bg-white/5 text-slate-300",children:e.category}),(0,r.jsxs)("span",{className:"text-indigo-400 font-mono",children:[e.links," Graph Links"]})]})]},t))})]})]})]})]})}},3386:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});var r=n(7653),a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=(e,t)=>{let n=(0,r.forwardRef)((n,i)=>{let{color:c="currentColor",size:l=24,strokeWidth:o=2,absoluteStrokeWidth:d,className:h="",children:u,...p}=n;return(0,r.createElement)("svg",{ref:i,...a,width:l,height:l,stroke:c,strokeWidth:d?24*Number(o)/Number(l):o,className:["lucide","lucide-".concat(s(e)),h].join(" "),...p},[...t.map(e=>{let[t,n]=e;return(0,r.createElement)(t,n)}),...Array.isArray(u)?u:[u]])});return n.displayName="".concat(e),n}},1581:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},1865:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Award",[["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}],["path",{d:"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11",key:"em7aur"}]])},4684:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]])},6091:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]])},3100:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]])},9096:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Building",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",ry:"2",key:"76otgf"}],["path",{d:"M9 22v-4h6v4",key:"r93iot"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}]])},2366:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},9278:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("CircleUser",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}],["path",{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662",key:"154egf"}]])},5120:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Compass",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76",key:"m9r19z"}]])},1146:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("FileCheck2",[["path",{d:"M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4",key:"1pf5j1"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m3 15 2 2 4-4",key:"1lhrkk"}]])},7631:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},6218:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]])},5604:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},7998:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},8677:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]])},9135:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},8575:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},590:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},5325:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Sparkles",[["path",{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",key:"17u4zn"}],["path",{d:"M5 3v4",key:"bklmnn"}],["path",{d:"M19 17v4",key:"iiml17"}],["path",{d:"M3 5h4",key:"nem4j1"}],["path",{d:"M17 19h4",key:"lbex7p"}]])},6660:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]])},1535:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},1871:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.359.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(3386).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])}},function(e){e.O(0,[5248,8361,1293,286,1744],function(){return e(e.s=4779)}),_N_E=e.O()}]);