import {dialog,ipcMain, type BrowserWindow, type IpcMainInvokeEvent} from 'electron';
import {approvedUrl,exact, record, request} from './contracts';
import {isTrustedDocument} from './origin';
import {PrivacyContext} from './privacy-context';
import {PrivacyStore} from './privacy-store';
import type {LocalRuntime} from './runtime';
import type {AssistantReply} from '../../packages/learning-ui/src/services/assistant.types';
const names=['status','bind','propose','preferences','forget','cancel','reset','read-page'];
const channels=names.map(name=>'los-assistant:'+name);
const publicErrors=new Set(['DENIED','INVALID','BUSY','RATE_LIMIT','CANCELLED','LOCAL_UNAVAILABLE',
  'NATIVE_START','NATIVE_TIMEOUT','NATIVE_OUTPUT_LIMIT','NATIVE_FAILED','NATIVE_INPUT',
  'STALE_CONTEXT','PRIVACY_DISABLED','PRIVACY_UNAVAILABLE','CONFLICT','URL_DENIED',
  'WEB_UNAVAILABLE','WEB_FETCH_FAILED','WEB_TIMEOUT','WEB_TOO_LARGE','WEB_CONTENT_DENIED',
  'WEB_ROBOTS_DENIED','WEB_REDIRECT_LIMIT','WEB_HTTP_FAILED','WEB_EMPTY','WEB_CLEANUP_FAILED']);
export function attachAssistant(window:BrowserWindow, documentUrl:string, runtime:LocalRuntime, store:PrivacyStore) {
  let disposed=false;
  const privacy=new PrivacyContext(store,(context,invalidatedToken)=>{
    if(!disposed && !window.isDestroyed() && !window.webContents.isDestroyed())
      window.webContents.send('los-assistant:changed',{context,clearContent:true,invalidatedToken});
  });
  function trusted(event:IpcMainInvokeEvent) {
    if(disposed || window.isDestroyed() || event.sender!==window.webContents ||
      event.senderFrame!==window.webContents.mainFrame ||
      !isTrustedDocument(event.senderFrame.url,documentUrl))throw new Error('DENIED');
  }
  async function reply<T>(event:IpcMainInvokeEvent,work:()=>Promise<T>):Promise<AssistantReply<T>> {
    try{trusted(event);const value=await work();trusted(event);return{ok:true,value}}
    catch(error){const code=error instanceof Error?error.message:'';return{ok:false,code:publicErrors.has(code)?code:'UNAVAILABLE'}}
  }
  ipcMain.handle(channels[0],event=>reply(event,runtime.status));
  ipcMain.handle(channels[1],(event,raw)=>reply(event,async()=>{
    const data=record(raw);exact(data,['account']);return privacy.bind(data.account);
  }));
  ipcMain.handle(channels[2],(event,raw)=>reply(event,()=>{
    const data=record(raw);exact(data,['id','text','context']);
    const {id,value}=request({id:data.id,text:data.text},'text');
    return privacy.propose(data.context,id,signal=>runtime.propose(value,signal));
  }));
  ipcMain.handle(channels[3],(event,raw)=>reply(event,async()=>{
    const data=record(raw);exact(data,['context','revision','localCommandsEnabled']);
    if(!Number.isSafeInteger(data.revision) || (data.revision as number)<0 || typeof data.localCommandsEnabled!=='boolean')throw new Error('INVALID');
    return privacy.update(data.context,data.revision as number,data.localCommandsEnabled);
  }));
  ipcMain.handle(channels[4],(event,raw)=>reply(event,async()=>{
    const data=record(raw);exact(data,['context']);return privacy.forget(data.context);
  }));
  ipcMain.handle(channels[5],(event,raw)=>reply(event,async()=>{
    const data=record(raw);exact(data,['id']);
    if(typeof data.id!=='string' || !/^[a-f0-9-]{36}$/i.test(data.id))throw new Error('INVALID');
    privacy.session.cancel(data.id);return null;
  }));
  ipcMain.handle(channels[6],event=>reply(event,async()=>{privacy.resetContent();return null}));
  ipcMain.handle(channels[7],(event,raw)=>reply(event,async()=>{
    const data=record(raw);exact(data,['id','url','context']);
    const {id,value}=request({id:data.id,url:data.url},'url'),url=approvedUrl(value);
    const current=privacy.require(data.context);
    if(current.value.storage!=='ready')throw new Error('PRIVACY_UNAVAILABLE');
    if((await runtime.status()).web!=='ready')throw new Error('WEB_UNAVAILABLE');
    privacy.require(data.context);
    return privacy.session.run(id,async signal=>{
      const confirmation=await dialog.showMessageBox(window,{type:'question',title:'Read a public page',
        message:'Allow this one public page request?',
        detail:url+'\n\nThis website receives your IP address and the page address, including requests for robots.txt and permitted redirects. LOS sends no account token or cookies. The downloaded document is written briefly to local temporary storage and deleted after reading. Obscura reads it offline; scripts have no network permission. Results stay in memory and are not sent to cloud AI.',
        buttons:['Cancel','Read page'],defaultId:0,cancelId:0,noLink:true,signal});
      if(signal.aborted || confirmation.response!==1)throw new Error('CANCELLED');
      privacy.require(data.context);
      return runtime.readPage(url,signal);
    });
  }));
  const navigation=(_event:unknown,_url:string,inPlace:boolean,mainFrame:boolean)=>{if(mainFrame && !inPlace)privacy.invalidate()};
  const reset=()=>privacy.invalidate();
  window.webContents.on('did-start-navigation',navigation);
  window.webContents.on('render-process-gone',reset);
  const dispose=()=>{
    if(disposed)return;disposed=true;privacy.invalidate();
    for(const channel of channels)ipcMain.removeHandler(channel);
    if(!window.webContents.isDestroyed()){
      window.webContents.removeListener('did-start-navigation',navigation);
      window.webContents.removeListener('render-process-gone',reset);
    }
  };
  window.once('closed',dispose);return dispose;
}
