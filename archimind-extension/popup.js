import{c as a,j as e,g as c,B as n,Z as r,a as i,R as l}from"./assets/i18n.Dx0FIZMU.js";import{C as h,a as d,b as p,S as x,c as m}from"./assets/separator.Y2N7MMCX.js";/* empty css            *//**
 * @license lucide-react v0.482.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],u=a("Bot",y);/**
 * @license lucide-react v0.482.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]],g=a("Cpu",k);/**
 * @license lucide-react v0.482.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],j=a("Globe",M);/**
 * @license lucide-react v0.482.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],N=a("Shield",w),v=[{name:"ChatGPT",icon:e.jsx(u,{className:"h-5 w-5 text-green-500"}),url:"https://chat.openai.com/",description:"OpenAI's conversational AI"},{name:"Claude",icon:e.jsx(N,{className:"h-5 w-5 text-blue-500"}),url:"https://claude.ai/",description:"Anthropic's AI assistant"},{name:"Gemini",icon:e.jsx(r,{className:"h-5 w-5 text-purple-500"}),url:"https://gemini.google.com/",description:"Google's generative AI"},{name:"Mistral",icon:e.jsx(g,{className:"h-5 w-5 text-red-500"}),url:"https://chat.mistral.ai/",description:"Mistral AI's conversational model"},{name:"Perplexity",icon:e.jsx(j,{className:"h-5 w-5 text-indigo-500"}),url:"https://www.perplexity.ai/",description:"AI-powered search and chat"}],C=()=>{const o=t=>{chrome.tabs.create({url:t})};return e.jsx("div",{className:"w-80 bg-background",children:e.jsxs(h,{className:"w-full",children:[e.jsx(d,{children:e.jsx(p,{className:"text-yellow-500 text-center",children:c("aiToolLauncher",void 0,"AI Tool Launcher")})}),e.jsx(x,{}),e.jsx(m,{className:"p-4 space-y-2",children:v.map(t=>e.jsxs(n,{variant:"outline",className:"w-full justify-start space-x-3",onClick:()=>o(t.url),children:[t.icon,e.jsx("span",{className:"flex-grow text-left",children:t.name})]},t.name))})]})})},s=document.getElementById("root");if(!s)throw new Error("Root element not found");i.createRoot(s).render(e.jsx(l.StrictMode,{children:e.jsx(C,{})}));
