/** Actual Electron main/preload boundary test. Never calls a backend or cloud model. */
import {app, BrowserWindow} from 'electron';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {attachAssistant} from '../assistant/ipc';
import {createLocalRuntime} from '../assistant/runtime';

app.whenReady().then(async()=>{
  const temporary=await mkdtemp(path.join(os.tmpdir(),'synapse-ipc-'));
  const windows:BrowserWindow[]=[];
  let dispose:(()=>void)|undefined;
  let result=1;
  try {
    const root=process.env.SYNAPSE_ASSISTANT_PROJECT_ROOT || app.getAppPath();
    const doc=path.join(temporary,'index.html'), other=path.join(temporary,'other.html');
    await writeFile(doc,'<!doctype html><title>Assistant boundary test</title>');await writeFile(other,'<!doctype html><title>Untrusted document</title>');
    const options={show:false,webPreferences:{preload:path.join(root,'desktop-app/preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}};
    const main=new BrowserWindow(options);windows.push(main);
    const runtime=createLocalRuntime(path.join(root,'resources/native/win32-x64'),path.join(root,'desktop-app/native-manifest.json'));
    dispose=attachAssistant(main,pathToFileURL(doc).href,runtime);
    await main.loadFile(doc);
    const evaluate=(script:string)=>main.webContents.executeJavaScript(script);
    const status=await evaluate('window.losAssistant.status()');assert.equal(status.ok,true);assert.equal(status.value.local,'ready');
    assert.deepEqual(await evaluate('Object.keys(window.losAssistant).sort()'),['cancel','propose','reset','status']);
    const proposed=await evaluate("window.losAssistant.propose('open courses',crypto.randomUUID())");
    assert.equal(proposed.ok,true);assert.deepEqual(proposed.value.action,{name:'open_view',arguments:{view:'courses'}});
    const invalid=await evaluate("window.losAssistant.propose('open courses','not-an-id')");assert.equal(invalid.ok,false);
    const otherWindow=new BrowserWindow(options);windows.push(otherWindow);await otherWindow.loadFile(doc);
    assert.equal((await otherWindow.webContents.executeJavaScript('window.losAssistant.status()')).code,'DENIED');
    await main.loadFile(other);assert.equal((await evaluate('window.losAssistant.status()')).code,'DENIED');
    await main.loadFile(doc);assert.equal((await evaluate('window.losAssistant.status()')).ok,true);
    // Verify the actual shipped React panel, without signing in or touching accounts.
    const ui=new BrowserWindow(options);windows.push(ui);
    const uiFile=path.join(root,'desktop-app/frontend-dist/index.html');
    dispose();dispose=attachAssistant(ui,pathToFileURL(uiFile).href,runtime);
    await ui.loadFile(uiFile);
    const waitFor=async(window:BrowserWindow,expression:string)=>{
      const limit=Date.now()+10000;
      while(Date.now()<limit){if(await window.webContents.executeJavaScript(expression))return;await new Promise(resolve=>setTimeout(resolve,100))}
      throw new Error('UI condition timed out: '+expression);
    };
    await waitFor(ui,"!!document.querySelector('.assistant-trigger')");
    await ui.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Skip introduction')?.click()");
    await waitFor(ui,"!document.querySelector('[inert]')");
    await ui.webContents.executeJavaScript("document.querySelector('.assistant-trigger').click()");
    await waitFor(ui,"document.querySelector('.assistant-panel')?.textContent.includes('Ready on this device')");
    await ui.webContents.executeJavaScript("{const input=document.querySelector('#local-command');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'open courses');input.dispatchEvent(new Event('input',{bubbles:true}));}");
    await waitFor(ui,"!document.querySelector('.assistant-actions .ink-button').disabled");
    await ui.webContents.executeJavaScript("document.querySelector('.assistant-panel form').requestSubmit()");
    await waitFor(ui,"document.querySelector('.assistant-proposal')?.textContent.includes('Open Courses')");
    // Focus drafts must fill controls and never write until Start is explicitly clicked.
    const focus=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});windows.push(focus);
    await focus.loadFile(path.join(root,'build/assistant-ui-test/index.html'));
    await waitFor(focus,"document.querySelector('#focus-topic')?.value==='algebra'");
    assert.equal(await focus.webContents.executeJavaScript("document.querySelector('#focus-duration').value"),'20');
    assert.equal(await focus.webContents.executeJavaScript('window.focusWrites'),0);
    await focus.webContents.executeJavaScript("Array.from(document.querySelectorAll('button')).find(button=>button.textContent.includes('Start session')).click()");
    await waitFor(focus,'window.focusWrites===1');
    assert.equal(await focus.webContents.executeJavaScript('window.focusWrites'),1);
    console.log('Electron assistant checks passed: real preload, native proposal, invalid request, wrong window, wrong document, trusted reload.');
    console.log('React checks passed: local readiness panel, focus draft prefill, zero automatic writes, explicit Start required.');
    result=0;
  } catch(error) {console.error(error)}
  finally {dispose?.();for(const window of windows)if(!window.isDestroyed())window.destroy();await rm(temporary,{recursive:true,force:true});app.exit(result)}
});
