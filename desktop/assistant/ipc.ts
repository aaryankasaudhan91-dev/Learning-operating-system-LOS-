import {ipcMain, type BrowserWindow, type IpcMainInvokeEvent} from 'electron';
import {exact, record, request} from './contracts';
import {isTrustedDocument} from './origin';
import {AssistantSession} from './session';
import type {LocalRuntime} from './runtime';
import type {AssistantReply} from '../../packages/learning-ui/src/services/assistant.types';
const channels = ['status', 'propose', 'cancel', 'reset'].map(name => 'los-assistant:' + name);
const publicErrors = new Set(['DENIED','INVALID','BUSY','RATE_LIMIT','CANCELLED','LOCAL_UNAVAILABLE',
  'NATIVE_START','NATIVE_TIMEOUT','NATIVE_OUTPUT_LIMIT','NATIVE_FAILED','NATIVE_INPUT']);
export function attachAssistant(window: BrowserWindow, documentUrl: string, runtime: LocalRuntime) {
  const session = new AssistantSession(); let disposed = false;
  function trusted(event: IpcMainInvokeEvent) {
    if (disposed || window.isDestroyed() || event.sender !== window.webContents ||
      event.senderFrame !== window.webContents.mainFrame ||
      !isTrustedDocument(event.senderFrame.url, documentUrl)) throw new Error('DENIED');
  }
  async function reply<T>(event: IpcMainInvokeEvent, work: () => Promise<T>): Promise<AssistantReply<T>> {
    try {trusted(event); const value = await work(); trusted(event); return {ok: true, value}}
    catch (error) {const code = error instanceof Error ? error.message : ''; return {ok: false, code: publicErrors.has(code) ? code : 'UNAVAILABLE'}}
  }
  ipcMain.handle(channels[0], event => reply(event, runtime.status));
  ipcMain.handle(channels[1], (event, raw) => reply(event, () => {
    const {id, value} = request(raw, 'text'); return session.run(id, signal => runtime.propose(value, signal));
  }));
  ipcMain.handle(channels[2], (event, raw) => reply(event, async () => {
    const data = record(raw); exact(data, ['id']);
    if (typeof data.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(data.id)) throw new Error('INVALID');
    session.cancel(data.id); return null;
  }));
  ipcMain.handle(channels[3], event => reply(event, async () => {session.reset(); return null}));
  const navigation = (_event: unknown, _url: string, inPlace: boolean, mainFrame: boolean) => {
    if (mainFrame && !inPlace) session.reset();
  };
  const reset = () => session.reset();
  window.webContents.on('did-start-navigation', navigation);
  window.webContents.on('render-process-gone', reset);
  const dispose = () => {
    if (disposed) return; disposed = true; session.reset();
    for (const channel of channels) ipcMain.removeHandler(channel);
    if (!window.webContents.isDestroyed()) {
      window.webContents.removeListener('did-start-navigation', navigation);
      window.webContents.removeListener('render-process-gone', reset);
    }
  };
  window.once('closed', dispose); return dispose;
}
