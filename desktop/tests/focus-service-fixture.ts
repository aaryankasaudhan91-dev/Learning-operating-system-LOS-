/** Isolated UI fixture: no HTTP, auth, database or real account. */
export interface FocusSession {id:string;topic:string;goalSeconds:number;activeSeconds:number;state:'running'|'paused'|'completed';recordedMinutes:number;revision:number;reflection?:'easy'|'good'|'hard'}
declare global {interface Window {focusWrites?: number}}
window.focusWrites=0;
const session:FocusSession={id:'fixture-session',topic:'algebra',goalSeconds:1200,activeSeconds:0,state:'running',recordedMinutes:0,revision:0};
export const focusService={active:async()=>({session:null}),
  start:async(topic:string,minutes:number)=>{window.focusWrites!++;return {...session,topic,goalSeconds:minutes*60}},
  pause:async()=>({...session,state:'paused' as const}),resume:async()=>session,
  heartbeat:async()=>session,complete:async()=>({...session,state:'completed' as const}),
  reflect:async()=>session};
