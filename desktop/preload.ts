import {contextBridge, ipcRenderer} from 'electron';
import type {AssistantBridge} from '../packages/learning-ui/src/services/assistant.types';
const bridge: AssistantBridge = {
  status: () => ipcRenderer.invoke('los-assistant:status'),
  propose: (text, id) => ipcRenderer.invoke('los-assistant:propose', {text, id}),
  cancel: id => ipcRenderer.invoke('los-assistant:cancel', {id}),
  reset: () => ipcRenderer.invoke('los-assistant:reset')
};
// No generic invoke/send/listeners, Electron events, or native paths.
contextBridge.exposeInMainWorld('losAssistant', bridge);
