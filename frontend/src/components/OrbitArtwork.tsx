import { useEffect, useRef } from 'react';
import { animate, createScope, stagger } from 'animejs';
/** Original vector illustration; lightweight enough for the shared mobile client. */
export default function OrbitArtwork({compact=false}:{compact?:boolean}) {
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const scope=createScope({root}).add(()=>{
   animate('.orbit-spark',{translateY:[-5,5],rotate:[-8,8],duration:2700,alternate:true,loop:true,delay:stagger(220),ease:'inOutSine'});
   animate('.orbit-book',{translateY:[0,-9],rotate:[-3,2],duration:3400,alternate:true,loop:true,ease:'inOutSine'});
  });
  return ()=>scope.revert();
 },[]);
 return <div ref={root} className={`orbit-art ${compact?'orbit-art-small':''}`} aria-hidden="true"><svg viewBox="0 0 520 420" fill="none">
 <circle cx="260" cy="210" r="166" fill="currentColor" opacity=".05"/><circle cx="260" cy="210" r="126" stroke="currentColor" strokeDasharray="3 12" opacity=".22"/>
 <ellipse cx="260" cy="350" rx="116" ry="15" fill="#191734" opacity=".1"/>
 <g className="orbit-book"><path d="M155 155 Q210 128 263 161 Q310 128 365 151 L365 292 Q315 277 263 306 Q211 278 155 294Z" fill="#8fb9dd" stroke="#254765" strokeWidth="3"/>
 <path d="M145 142 Q211 116 263 151 L263 289 Q210 262 145 279Z" fill="#fffcf4" stroke="#254765" strokeWidth="3"/><path d="M263 151 Q315 116 375 140 L375 278 Q312 263 263 289Z" fill="#e1f0fc" stroke="#254765" strokeWidth="3"/>
 <path d="M165 170 Q204 158 241 178 M165 191 Q204 179 241 199 M165 212 Q204 200 241 220 M165 233 Q204 221 220 236" stroke="#9cbace" strokeWidth="4" strokeLinecap="round"/>
 <path d="M287 170 Q318 153 352 162 L352 206 Q320 198 287 215Z" fill="#b7e5cc"/>
 <path d="M287 236 Q318 222 352 231 M287 254 Q317 240 333 245" stroke="#9cbace" strokeWidth="4" strokeLinecap="round"/>
 <path d="M289 143 L289 183 L299 176 L309 181 L309 137" fill="#e9a5c4" stroke="#254765" strokeWidth="2"/>
 </g>
 <g className="orbit-spark"><rect x="82" y="110" width="58" height="58" rx="19" fill="#b7e5cc" transform="rotate(-12 111 139)"/><path d="M99 140 L108 149 L124 126" stroke="#31684f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></g>
 <g className="orbit-spark"><circle cx="406" cy="232" r="32" fill="#f2c5db"/><path d="M406 215 L411 226 L423 228 L414 237 L416 249 L406 243 L395 249 L398 237 L389 228 L401 226Z" fill="#aa5b82"/></g>
 <g className="orbit-spark"><path d="M302 58 L307 74 L323 79 L307 84 L302 100 L297 84 L281 79 L297 74Z" fill="#75abd6"/><path d="M97 272 L100 282 L110 285 L100 288 L97 298 L94 288 L84 285 L94 282Z" fill="#79b99b"/></g>
 <circle cx="389" cy="109" r="6" fill="#e9a5c4"/><circle cx="160" cy="329" r="5" fill="#75abd6"/>
 </svg></div>;
}
