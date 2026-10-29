import {developmentUrl} from './dev-url';
import {app, BrowserWindow, shell} from 'electron';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createLocalRuntime} from './assistant/runtime';
import {attachAssistant} from './assistant/ipc';

let window: BrowserWindow | undefined;
const cleanup = new Set<() => void>();
async function createWindow() {
  if (window && !window.isDestroyed()) {window.focus(); return}
  const preview = developmentUrl(app.isPackaged, process.env.SYNAPSE_DEV_SERVER_URL);
  const document = path.join(__dirname, 'frontend-dist/index.html');
  const expected = preview ?? pathToFileURL(document).href;
  const current = new BrowserWindow({width:1360,height:900,minWidth:800,minHeight:600,
    title:'Synapse',icon:path.join(__dirname,'icon.png'),backgroundColor:'#f5f6f2',autoHideMenuBar:true,
    webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}});
  window = current;
  current.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https://')) void shell.openExternal(url); return {action:'deny'};
  });
  current.webContents.on('will-navigate', (event, url) => {
    const destination = new URL(url); destination.hash = '';
    const trusted = new URL(expected); trusted.hash = '';
    if (destination.href === trusted.href) return;
    event.preventDefault(); if (destination.protocol === 'https:') void shell.openExternal(url);
  });
  const root = app.isPackaged ? path.join(process.resourcesPath, 'native', 'win32-x64')
    : path.join(app.getAppPath(), 'resources', 'native', 'win32-x64');
  const runtime = createLocalRuntime(root, path.join(__dirname, 'native-manifest.json'));
  const dispose = attachAssistant(current, expected, runtime); cleanup.add(dispose);
  current.once('closed', () => {cleanup.delete(dispose); if (window === current) window = undefined});
  if (preview) await current.loadURL(preview); else await current.loadFile(document);
}
app.whenReady().then(async () => {
  await createWindow();
  app.on('activate', () => {if (!BrowserWindow.getAllWindows().length) void createWindow()});
}).catch(() => {app.quit()});
app.on('before-quit', () => {for (const dispose of cleanup) dispose()});
app.on('window-all-closed', () => {if (process.platform !== 'darwin') app.quit()});
