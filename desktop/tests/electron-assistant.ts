/** Real Electron/preload/privacy/UI checks; no real account or cloud provider. */
import {app,BrowserWindow,dialog} from 'electron';
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
  assert.deepEqual(await evaluate('Object.keys(window.losAssistant).sort()'),['bindAccount','cancel','forgetPreferences','onChanged','preferences','propose','readPage','reset','status']);
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
  // Deterministic main-side confirmation tests: production still uses Electron's
  // own modal. Renderer cannot supply the response or override this function.
  const originalMessageBox=dialog.showMessageBox;
  let approvals=0,reads=0,decision=0;
  dialog.showMessageBox=(async(_window:BrowserWindow,options:Electron.MessageBoxOptions)=>{
    approvals++;assert.equal(options.defaultId,0);assert.equal(options.cancelId,0);
    assert.ok(options.signal);return {response:decision,checkboxChecked:false};
  }) as typeof dialog.showMessageBox;
  const webRuntime={...runtime,readPage:async(url:string,_signal:AbortSignal)=>{
    reads++;return {requestedUrl:url,finalUrl:url,status:200,text:'Untrusted <img src=x onerror=alert(1)> page text',truncated:false,fetchedAt:new Date().toISOString(),mode:'offline-document' as const,untrusted:true as const};
  }};
  dispose();dispose=attachAssistant(main,pathToFileURL(doc).href,webRuntime,new PrivacyStore(path.join(temporary,'web-flags')));
  await evaluate('window.losAssistant.bindAccount(null).then(result=>window.testContext=result.value)');
  assert.equal((await evaluate("window.losAssistant.readPage('http://127.0.0.1/',crypto.randomUUID(),window.testContext.token)")).code,'URL_DENIED');
  assert.equal(approvals,0);
  assert.equal((await evaluate("window.losAssistant.readPage('https://en.wikipedia.org/wiki/Physics',crypto.randomUUID(),window.testContext.token)")).code,'CANCELLED');
  assert.equal(reads,0);decision=1;
  assert.equal((await evaluate("window.losAssistant.readPage('https://en.wikipedia.org/wiki/Physics',crypto.randomUUID(),window.testContext.token)")).value.untrusted,true);
  assert.equal(reads,1);
  assert.equal((await wrong.webContents.executeJavaScript("window.losAssistant.readPage('https://en.wikipedia.org/wiki/Physics',crypto.randomUUID(),'anything')")).code,'DENIED');
  // Exercise the real React UI with external network requests blocked.
  const ui=new BrowserWindow(options);windows.push(ui);
  const uiFile=path.join(root,'desktop-app/frontend-dist/index.html');
  const uiFlags=path.join(temporary,'ui-flags');
  dispose();dispose=attachAssistant(ui,pathToFileURL(uiFile).href,webRuntime,new PrivacyStore(uiFlags));
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
  ui.webContents.send('los-assistant:changed',{context:null,clearContent:true,invalidatedToken:'old-binding-token'});
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(await ui.webContents.executeJavaScript("document.querySelector('.assistant-privacy-toggle input').checked"),true);

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
  await ui.webContents.executeJavaScript("{const input=document.querySelector('#public-page-url');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'https://en.wikipedia.org/wiki/Physics');input.dispatchEvent(new Event('input',{bubbles:true}));}");
  await waitFor(ui,"!document.querySelector('.assistant-web-reader button.ink-button').disabled");
  await ui.webContents.executeJavaScript("document.querySelector('.assistant-web-reader form').requestSubmit()");
  await waitFor(ui,"!!document.querySelector('.assistant-web-result pre')");
  assert.match(await ui.webContents.executeJavaScript("document.querySelector('.assistant-web-result pre').textContent"),/<img src=x/);
  assert.equal(await ui.webContents.executeJavaScript("document.querySelectorAll('.assistant-web-result img').length"),0);
  await ui.webContents.executeJavaScript("Array.from(document.querySelectorAll('.assistant-privacy-settings button')).find(button=>button.textContent==='Clear current assistant data').click()");
  await waitFor(ui,"!document.querySelector('.assistant-web-result') && document.querySelector('#public-page-url').value===''");
  dialog.showMessageBox=originalMessageBox;
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
  assert.deepEqual(await focus.webContents.executeJavaScript('window.testBlockedCloud()'),{status:403,calls:0});
  assert.equal(await focus.webContents.executeJavaScript('window.focusWrites'),0);
  await focus.webContents.executeJavaScript('window.clearAssistantFixture()');
  await waitFor(focus,"document.querySelector('#focus-topic').value===''");
  assert.equal(await focus.webContents.executeJavaScript('window.focusWrites'),0);
  await focus.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent.includes('Start session')).click()");
  await waitFor(focus,'window.focusWrites===1');
  // Real React cloud controls, with fixture-only authenticated HTTP responses.
  const cloud=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});windows.push(cloud);
  await cloud.loadFile(path.join(root,'build/assistant-ui-test/cloud.html'));
  await waitFor(cloud,"!!document.querySelector('#cloud-question')");
  assert.equal(await cloud.webContents.executeJavaScript('window.cloudUploads.length'),0);
  assert.equal(await cloud.webContents.executeJavaScript('window.cloudFixtureAuthRace()'),true);
  assert.equal(await cloud.webContents.executeJavaScript('window.cloudUploads.length'),0);
  assert.equal(await cloud.webContents.executeJavaScript("document.querySelector('.assistant-cloud fieldset').disabled"),true);
  await cloud.webContents.executeJavaScript("Array.from(document.querySelectorAll('.assistant-privacy-settings input')).find(input=>input.type==='checkbox').click()");
  await cloud.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Enable reviewed cloud questions').click()");
  await waitFor(cloud,"!document.querySelector('.assistant-cloud fieldset').disabled");
  await cloud.webContents.executeJavaScript("{const input=document.querySelector('#cloud-question');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Explain fractions');input.dispatchEvent(new Event('input',{bubbles:true}));}");
  await waitFor(cloud,"document.querySelector('#cloud-question').value==='Explain fractions'");
  assert.equal(await cloud.webContents.executeJavaScript("document.querySelector('.assistant-cloud .ink-button').disabled"),true);
  await cloud.webContents.executeJavaScript("document.querySelector('.assistant-cloud input[type=checkbox]').click()");
  await cloud.webContents.executeJavaScript("document.querySelector('.assistant-cloud form').requestSubmit()");
  await waitFor(cloud,"!!document.querySelector('.assistant-cloud-answer')");
  assert.equal(await cloud.webContents.executeJavaScript('window.cloudUploads.length'),1);
  assert.equal(await cloud.webContents.executeJavaScript("document.querySelectorAll('.assistant-cloud-answer img').length"),0);
  await cloud.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Turn cloud AI off').click()");
  await waitFor(cloud,"!document.querySelector('.assistant-cloud-answer') && document.querySelector('.assistant-cloud fieldset').disabled");
  await cloud.webContents.executeJavaScript('window.cloudFixtureLegacy()');
  await waitFor(cloud,"document.querySelector('.assistant-cloud fieldset').disabled");
  assert.equal(await cloud.webContents.executeJavaScript('window.cloudUploads.length'),1);
  console.log('Electron/privacy/UI checks passed, including explicit cloud consent, per-question review, safe text display, revocation clearing and old-backend refusal.');
  result=0;
 }catch(error){console.error(error);const last=windows[windows.length-1];if(last && !last.isDestroyed())console.error(await last.webContents.executeJavaScript("(async()=>({privacy:document.querySelector('.assistant-privacy-settings')?.textContent,checkbox:document.querySelector('.assistant-privacy-toggle input')?.checked,disabled:document.querySelector('.assistant-privacy-toggle input')?.disabled,panel:document.querySelector('.assistant-panel')?.textContent,url:location.href,status:await window.losAssistant?.status()}))()"))}
 finally{if(process.env.SYNAPSE_ASSISTANT_RESULT)await writeFile(process.env.SYNAPSE_ASSISTANT_RESULT,JSON.stringify({ok:result===0}));dispose?.();for(const window of windows)if(!window.isDestroyed())window.destroy();await rm(temporary,{recursive:true,force:true});app.exit(result)}
});
