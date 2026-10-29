import {contextBridge,ipcRenderer} from 'electron';
import type {AssistantBridge} from '../packages/learning-ui/src/services/assistant.types';
const bridge:AssistantBridge={
 status:()=>ipcRenderer.invoke('los-assistant:status'),
 bindAccount:account=>ipcRenderer.invoke('los-assistant:bind',{account}),
 propose:(text,id,context)=>ipcRenderer.invoke('los-assistant:propose',{text,id,context}),
 preferences:(context,revision,localCommandsEnabled)=>ipcRenderer.invoke('los-assistant:preferences',{context,revision,localCommandsEnabled}),
 forgetPreferences:context=>ipcRenderer.invoke('los-assistant:forget',{context}),
 cancel:id=>ipcRenderer.invoke('los-assistant:cancel',{id}),
 reset:()=>ipcRenderer.invoke('los-assistant:reset'),
 onChanged:callback=>{const listener=(_event:Electron.IpcRendererEvent,value:Parameters<typeof callback>[0])=>callback(value);ipcRenderer.on('los-assistant:changed',listener);return()=>ipcRenderer.removeListener('los-assistant:changed',listener)}
};
contextBridge.exposeInMainWorld('losAssistant',bridge);
