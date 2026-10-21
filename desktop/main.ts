import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
function createWindow() {
 const window = new BrowserWindow({width:1360,height:900,minWidth:800,minHeight:600,title:'Synapse',backgroundColor:'#f5f6f2',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://')) void shell.openExternal(url);return {action:'deny'}});
 window.webContents.on('will-navigate',(event,url)=>{event.preventDefault();if(url.startsWith('https://')) void shell.openExternal(url)});
 void window.loadFile(path.join(__dirname,'../frontend/dist/index.html'));
}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
