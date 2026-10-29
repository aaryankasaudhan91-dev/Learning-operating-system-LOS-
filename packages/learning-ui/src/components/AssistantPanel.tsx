import {useEffect, useRef, useState, type FormEvent} from 'react';
import {MessageSquare, X} from 'lucide-react';
import {assistantValue, desktopAssistant} from '../services/assistant.service';
import type {AssistantAction, AssistantProposal, AssistantStatus} from '../services/assistant.types';
interface Props {account?: string; onApply: (action: AssistantAction) => void}
export default function AssistantPanel({account, onApply}: Props) {
  const [open, setOpen] = useState(false), [text, setText] = useState('');
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [proposal, setProposal] = useState<AssistantProposal | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const active = useRef<string | null>(null), epoch = useRef(0);
  const applyButton = useRef<HTMLButtonElement>(null), input = useRef<HTMLInputElement>(null), trigger = useRef<HTMLButtonElement>(null);
  function cancel() {
    epoch.current++; const id = active.current; active.current = null;
    if (id) void desktopAssistant()?.cancel(id).catch(() => {}); setBusy(false);
  }
  function close() {cancel(); setOpen(false); setProposal(null); setText(''); setError(''); trigger.current?.focus()}
  useEffect(() => {
    let live = true;
    void desktopAssistant()?.status().then(result => {if (live) setStatus(assistantValue(result))}).catch(() => {if (live) setStatus(null)});
    return () => {live = false};
  }, []);
  useEffect(() => {
    epoch.current++; active.current = null; setText(''); setProposal(null); setError(''); setBusy(false);
    void desktopAssistant()?.reset().catch(() => {});
    return () => {epoch.current++; const id = active.current; if (id) void desktopAssistant()?.cancel(id).catch(() => {})};
  }, [account]);
  useEffect(() => {if (open) input.current?.focus()}, [open]);
  useEffect(() => {if (proposal?.kind === 'proposal') applyButton.current?.focus()}, [proposal]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || !text.trim()) return;
    const bridge = desktopAssistant(); if (!bridge) return;
    const id = crypto.randomUUID(), version = ++epoch.current;
    active.current = id; setBusy(true); setProposal(null); setError('');
    try {
      const result = assistantValue(await bridge.propose(text.trim(), id));
      if (version === epoch.current && active.current === id) setProposal(result);
    } catch (reason) {if (version === epoch.current) setError(reason instanceof Error ? reason.message : 'Local command failed.')}
    finally {if (version === epoch.current) {setBusy(false); active.current = null}}
  }
  const ready = status?.local === 'ready';
  return <>
    <button ref={trigger} className="assistant-trigger" onClick={() => {if (open) close(); else setOpen(true)}} aria-expanded={open} aria-controls="local-assistant-panel"><MessageSquare size={19} aria-hidden="true"/><span>Local assistant</span></button>
    {open && <section id="local-assistant-panel" className="assistant-panel" aria-labelledby="local-assistant-heading" onKeyDown={event => {if (event.key === 'Escape') close()}}>
      <div className="assistant-panel-header"><div><h2 id="local-assistant-heading">Local assistant</h2><p>{ready ? 'Ready on this device' : status?.local === 'invalid' ? 'Local files need repair' : 'Local model not ready'}</p></div><button className="text-button" onClick={close} aria-label="Close local assistant"><X size={20}/></button></div>
      <p>Your command stays on this device. Try “open courses” or “prepare a 20 minute focus session on algebra”.</p>
      <p className="assistant-note">Commands create proposals. Web reading and cloud explanations are not enabled here.</p>
      {!ready && <p role="status">{status?.local === 'unsupported-platform' ? 'Local commands currently support Windows x64.' : 'Run the local assistant setup and restart Synapse to enable commands.'}</p>}
      <form onSubmit={submit}><label htmlFor="local-command">Your command</label><input ref={input} id="local-command" value={text} maxLength={2000} onChange={event => setText(event.target.value)} disabled={busy || !ready} autoComplete="off"/>
        <div className="assistant-actions"><button className="ink-button" disabled={!ready || busy || !text.trim()}>{busy ? 'Reading locally…' : 'Prepare action'}</button>{busy && <button type="button" className="text-button" onClick={cancel}>Cancel</button>}</div>
      </form>
      {error && <p role="alert">{error}</p>}
      {proposal?.kind === 'unsupported' && <p role="status">I could not match that to an app command. Try naming the screen, or a focus topic and duration. Nothing was changed.</p>}
      {proposal?.kind === 'proposal' && <div className="assistant-proposal" role="status"><strong>{proposal.action.name === 'open_view' ? 'Open ' + ({map:'My adventure', courses:'Courses', chamber:'Focus zone', profile:'Profile', settings:'Settings', help:'Help & support'}[proposal.action.arguments.view]) : `Prepare ${proposal.action.arguments.minutes} minutes: ${proposal.action.arguments.topic}`}</strong>
        <p>{proposal.action.name === 'prepare_focus' ? 'This fills the focus form. Review it and press Start there to record a session.' : 'Review this suggestion before opening the screen.'}</p>
        <button ref={applyButton} className="ink-button" onClick={() => {if (proposal.kind === 'proposal') {onApply(proposal.action); close()}}}>Use this action</button><button className="text-button" onClick={() => setProposal(null)}>Dismiss</button>
      </div>}
    </section>}
  </>;
}
