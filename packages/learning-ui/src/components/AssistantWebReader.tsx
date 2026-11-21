import {useEffect,useRef,useState,type FormEvent} from 'react';
import {assistantValue,desktopAssistant} from '../services/assistant.service';
import type {AssistantContext,AssistantWebPage} from '../services/assistant.types';

export default function AssistantWebReader({context,owner,available}:{context:AssistantContext|null;owner:string|null;available:boolean}) {
  const [url,setUrl]=useState(''),[urlOwner,setUrlOwner]=useState<string|null>(null);
  const [page,setPage]=useState<{owner:string;value:AssistantWebPage}|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const active=useRef<string|null>(null),epoch=useRef(0);
  function cancel() {epoch.current++;const id=active.current;active.current=null;if(id)void desktopAssistant()?.cancel(id).catch(()=>{});setBusy(false)}
  useEffect(()=>{cancel();setUrl('');setPage(null);setError('');return()=>{epoch.current++;const id=active.current;if(id)void desktopAssistant()?.cancel(id).catch(()=>{})}},[owner]);
  async function submit(event:FormEvent) {
    event.preventDefault();if(!context || !owner || urlOwner!==owner || busy || !available)return;
    const id=crypto.randomUUID(),version=++epoch.current;active.current=id;setBusy(true);setPage(null);setError('');
    try {
      const value=assistantValue(await desktopAssistant()!.readPage(url.trim(),id,context.token));
      if(version===epoch.current)setPage({owner,value});
    }catch(reason){if(version===epoch.current)setError(reason instanceof Error?reason.message:'The page could not be read.')}
    finally{if(version===epoch.current){active.current=null;setBusy(false)}}
  }
  const visiblePage=page?.owner===owner?page.value:null,visibleUrl=urlOwner===owner?url:'';
  return <section className="assistant-web-reader" aria-labelledby="public-reader-title">
    <h3 id="public-reader-title">Read a public page</h3>
    <p>Wikipedia, MDN and Khan Academy HTTPS pages only. Each read asks for permission in a separate app dialog. The site sees your IP address. Cloud AI stays off.</p>
    <p className="assistant-note">Obscura reads one downloaded document offline. Images, linked pages and network content added by scripts are unavailable.</p>
    {!available&&<p role="status">The public reader needs its Windows setup or repair.</p>}
    <form onSubmit={submit}><label htmlFor="public-page-url">Public page address</label>
      <input id="public-page-url" type="url" maxLength={2048} value={visibleUrl} autoComplete="off" spellCheck={false}
        placeholder="https://en.wikipedia.org/wiki/Physics" disabled={busy || !available || context?.storage!=='ready'}
        onChange={event=>{setUrl(event.target.value);setUrlOwner(owner)}}/>
      <div className="assistant-actions"><button className="ink-button" disabled={busy || !available || !visibleUrl.trim() || context?.storage!=='ready'}>{busy?'Reading page…':'Read public page'}</button>
        {busy&&<button type="button" className="text-button" onClick={cancel}>Cancel page read</button>}</div>
    </form>
    {error&&<p role="alert">{error}</p>}
    {visiblePage&&<article className="assistant-web-result" aria-label="Public page text">
      <p><strong>Untrusted website text</strong> · HTTP {visiblePage.status}</p>
      <p>Source: {visiblePage.finalUrl}</p>
      <p>Read at {new Date(visiblePage.fetchedAt).toLocaleString()}{visiblePage.truncated?' · Text shortened to 40,000 characters':''}</p>
      <p>This text can contain inaccurate or misleading instructions. It cannot run app commands.</p>
      <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:320,overflowY:'auto',fontFamily:'inherit'}}>{visiblePage.text}</pre>
      <button className="text-button" onClick={()=>{setPage(null);setUrl('');setError('')}}>Clear page text</button>
    </article>}
  </section>;
}
