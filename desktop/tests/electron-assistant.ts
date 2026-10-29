/** Real Electron/preload/privacy/UI checks; no real account or cloud provider. */
import {app,BrowserWindow} from 'electron';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp,writeFile,rm,readdir} from 'node:fs/promises';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {attachAssistant} from '../assistant/ipc';
import {createLocalRuntime} from '../assistant/runtime';
import {PrivacyStore} from '../assistant/privacy-store';
if(process.env.SYNAPSE_TEST_PROFILE)app.setPath('userData',process.env.SYNAPSE_TEST_PROFILE);
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const temporary=await mkdtemp(path.join(os.tmpdir(),'synapse-privacy-ipc-'));
 const windows:BrowserWindow[]=[];let dispose:(()=>void)|undefined;let result=1;
 try{
  const root=process.env.SYNAPSE_ASSISTANT_PROJECT_ROOT || app.getAppPath();
  const doc=path.join(temporary,'index.html'),other=path.join(temporary,'other.html');
  await writeFile(doc,'<!doctype html><title>Assistant boundary test</title>');await writeFile(other,'<!doctype html><title>Untrusted document</title>');
  const options={show:false,width:1360,height:1000,webPreferences:{preload:path.join(root,'desktop-app/preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}};
  const main=new BrowserWindow(options);windows.push(main);
  const runtime=createLocalRuntime(path.join(root,'resources/native/win32-x64'),path.join(root,'desktop-app/native-manifest.json'));
  dispose=attachAssistant(main,pathToFileURL(doc).href,runtime,new PrivacyStore(path.join(temporary,'flags')));
  await main.loadFile(doc);
  const evaluate=(script:string)=>main.webContents.executeJavaScript(script);
  assert.equal((await evaluate('window.losAssistant.status()')).value.local,'ready');
  assert.deepEqual(await evaluate('Object.keys(window.losAssistant).sort()'),['bindAccount','cancel','forgetPreferences','onChanged','preferences','propose','reset','status']);
  await evaluate('window.losAssistant.bindAccount(null).then(result=>window.testContext=result.value)');
  const proposed=await evaluate("window.losAssistant.propose('open courses',crypto.randomUUID(),window.testContext.token)");
  assert.equal(proposed.ok,true);assert.deepEqual(proposed.value.action,{name:'open_view',arguments:{view:'courses'}});
  assert.equal((await evaluate("window.losAssistant.propose('open courses','bad',window.testContext.token)")).ok,false);
  await evaluate('window.losAssistant.preferences(window.testContext.token,0,false).then(result=>window.testContext=result.value)');
  assert.equal((await evaluate("window.losAssistant.propose('open courses',crypto.randomUUID(),window.testContext.token)")).code,'PRIVACY_DISABLED');
  const guestToken=await evaluate('window.testContext.token');
  assert.equal((await evaluate("window.losAssistant.bindAccount('another-test-account')")).value.preferences.localCommandsEnabled,true);
  assert.equal((await evaluate(`window.losAssistant.propose('open courses',crypto.randomUUID(),${JSON.stringify(guestToken)})`)).code,'STALE_CONTEXT');
  assert.equal((await evaluate('window.losAssistant.bindAccount(null)')).value.preferences.localCommandsEnabled,false);
  const wrong=new BrowserWindow(options);windows.push(wrong);await wrong.loadFile(doc);
  assert.equal((await wrong.webContents.executeJavaScript('window.losAssistant.bindAccount(null)')).code,'DENIED');
  await main.loadFile(other);assert.equal((await evaluate('window.losAssistant.status()')).code,'DENIED');
  await main.loadFile(doc);assert.equal((await evaluate('window.losAssistant.status()')).ok,true);
  await evaluate("window.losAssistant.bindAccount('clean-test-account').then(result=>window.testContext=result.value)");
  const cancellation=await evaluate("Promise.all([window.losAssistant.propose('open courses',crypto.randomUUID(),window.testContext.token),window.losAssistant.reset()])");
  assert.equal(cancellation[0].code,'CANCELLED');
  // Exercise the real React UI with external network requests blocked.
  const ui=new BrowserWindow(options);windows.push(ui);
  const uiFile=path.join(root,'desktop-app/frontend-dist/index.html');
  const uiFlags=path.join(temporary,'ui-flags');
  dispose();dispose=attachAssistant(ui,pathToFileURL(uiFile).href,runtime,new PrivacyStore(uiFlags));
  ui.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_details,callback)=>callback({cancel:true}));
  const waitFor=async(window:BrowserWindow,expression:string)=>{
   const end=Date.now()+15000;
   while(Date.now()<end){if(await window.webContents.executeJavaScript(expression))return;await new Promise(resolve=>setTimeout(resolve,100))}
   throw new Error('UI condition timed out: '+expression);
  };
  async function openPanel(){
   await waitFor(ui,"!!document.querySelector('.assistant-trigger')");
   await ui.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Skip introduction')?.click()");
   await waitFor(ui,"!document.querySelector('[inert]')");
   await ui.webContents.executeJavaScript("if(!document.querySelector('.assistant-panel'))document.querySelector('.assistant-trigger').click()");
  }
  async function settings(){
   await openPanel();await ui.webContents.executeJavaScript("Array.from(document.querySelectorAll('.assistant-panel button')).find(button=>button.textContent==='Privacy settings').click()");
   await waitFor(ui,"!!document.querySelector('.assistant-privacy-toggle input')");
  }
  await ui.loadFile(uiFile);await settings();
  await waitFor(ui,"document.querySelector('.assistant-privacy-toggle input').checked");
  await ui.webContents.executeJavaScript("document.querySelector('.assistant-privacy-toggle input').click()");
  await waitFor(ui,"document.querySelector('.assistant-privacy-settings').textContent.includes('Local command preference saved')");
  await openPanel();await waitFor(ui,"document.querySelector('.assistant-panel').textContent.includes('Paused in Settings')");
  assert.equal(await ui.webContents.executeJavaScript("document.querySelector('.assistant-actions .ink-button').disabled"),true);
  await ui.loadFile(uiFile);await openPanel();await waitFor(ui,"document.querySelector('.assistant-panel').textContent.includes('Paused in Settings')");
  await settings();assert.equal(await ui.webContents.executeJavaScript("document.querySelector('.assistant-privacy-toggle input').checked"),false);
  await ui.webContents.executeJavaScript("document.querySelector('.assistant-privacy-toggle input').click()");
  await waitFor(ui,"document.querySelector('.assistant-privacy-settings').textContent.includes('Local command preference saved')");
  await openPanel();await waitFor(ui,"document.querySelector('.assistant-panel').textContent.includes('Ready on this device')");
  await ui.webContents.executeJavaScript("{const input=document.querySelector('#local-command');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'open courses');input.dispatchEvent(new Event('input',{bubbles:true}));}");
  await waitFor(ui,"!document.querySelector('.assistant-actions .ink-button').disabled");
  await ui.webContents.executeJavaScript("document.querySelector('.assistant-panel form').requestSubmit()");
  await waitFor(ui,"!!document.querySelector('.assistant-proposal')");
  await ui.webContents.executeJavaScript("Array.from(document.querySelectorAll('.assistant-privacy-settings button')).find(button=>button.textContent==='Clear current assistant data').click()");
  await waitFor(ui,"document.querySelector('#local-command').value==='' && !document.querySelector('.assistant-proposal')");
  assert.equal(await ui.webContents.executeJavaScript("document.querySelector('.assistant-privacy-toggle input').checked"),true);
  await ui.webContents.executeJavaScript("Array.from(document.querySelectorAll('.assistant-privacy-settings button')).find(button=>button.textContent==='Reset saved local choices').click()");
  await waitFor(ui,"document.querySelector('.assistant-privacy-settings').textContent.includes('Saved local choices removed')");
  assert.equal((await readdir(uiFlags)).length,0);
  if(process.env.SYNAPSE_ASSISTANT_CAPTURE){
   await ui.webContents.executeJavaScript("document.querySelector('.assistant-panel button[aria-label]').click()");
   await new Promise(resolve=>setTimeout(resolve,500));
   await writeFile(process.env.SYNAPSE_ASSISTANT_CAPTURE,(await ui.webContents.capturePage()).toPNG());
  }
  // An assistant draft is editable, clearable, and never writes before Start.
  const focus=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});windows.push(focus);
  await focus.loadFile(path.join(root,'build/assistant-ui-test/index.html'));
  await waitFor(focus,"document.querySelector('#focus-topic')?.value==='algebra'");
  assert.equal(await focus.webContents.executeJavaScript('window.focusWrites'),0);
  await focus.webContents.executeJavaScript('window.clearAssistantFixture()');
  await waitFor(focus,"document.querySelector('#focus-topic').value===''");
  assert.equal(await focus.webContents.executeJavaScript('window.focusWrites'),0);
  await focus.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent.includes('Start session')).click()");
  await waitFor(focus,'window.focusWrites===1');
  console.log('Electron/privacy/UI checks passed: isolated accounts, saved opt-out, wrong window/document, cancellation, reload, settings recovery, content clearing, preference removal, and explicit focus Start.');
  result=0;
 }catch(error){console.error(error);const last=windows[windows.length-1];if(last && !last.isDestroyed())console.error(await last.webContents.executeJavaScript("({privacy:document.querySelector('.assistant-privacy-settings')?.textContent,checkbox:document.querySelector('.assistant-privacy-toggle input')?.checked})"))}
 finally{if(process.env.SYNAPSE_ASSISTANT_RESULT)await writeFile(process.env.SYNAPSE_ASSISTANT_RESULT,JSON.stringify({ok:result===0}));dispose?.();for(const window of windows)if(!window.isDestroyed())window.destroy();await rm(temporary,{recursive:true,force:true});app.exit(result)}
});
