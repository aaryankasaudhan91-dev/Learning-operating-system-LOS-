import { io, type Socket } from 'socket.io-client';
import { auth } from '../lib/firebase';
export type Resource = 'tasks' | 'courses' | 'users' | 'prompts';
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';
interface Change { resource: Resource; changedAt: number }
interface ServerEvents { 'data:changed': (change: Change) => void }
let socket: Socket<ServerEvents> | undefined;
export function realtimeSocket() {
 if(!socket) {
  const backend=(import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/,'');
  socket=io(backend || undefined,{auth:callback=>{void (async()=>callback({token:await auth.currentUser?.getIdToken()}))()},autoConnect:false,reconnection:true,reconnectionDelay:1000,reconnectionDelayMax:15000,timeout:10000});
  socket.connect();
 }
 return socket;
}
export function watchResource(resources:Resource[],refresh:()=>void) {
 const socket=realtimeSocket();
 const changed=(event:Change)=>{if(resources.includes(event.resource))refresh()};
 socket.on('data:changed',changed);
 socket.on('connect',refresh); // Refetch after reconnect: notifications are not a durable queue.
 return ()=>{socket.off('data:changed',changed);socket.off('connect',refresh)};
}
export function watchConnection(listener:(state:ConnectionState)=>void){
 const socket=realtimeSocket();
 const connected=()=>listener('connected');const disconnected=()=>listener('disconnected');
 listener(socket.connected?'connected':socket.active?'connecting':'disconnected');
 socket.on('connect',connected);socket.on('disconnect',disconnected);socket.on('connect_error',disconnected);
 return ()=>{socket.off('connect',connected);socket.off('disconnect',disconnected);socket.off('connect_error',disconnected)};
}
