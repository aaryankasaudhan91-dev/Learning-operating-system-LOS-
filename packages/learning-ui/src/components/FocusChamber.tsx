import React, {useEffect, useRef, useState} from 'react';
import {ArrowLeft, Check, CirclePause, Headphones, Play, RotateCcw, Sparkles} from 'lucide-react';
import {AppView} from '../types';
import {focusService, type FocusSession} from '../services/focus.service';
import AppLoading from './AppLoading';
import type {FocusDraft} from '../services/assistant.types';

interface Props {setView: (view: AppView) => void; draft?: FocusDraft | null; onDraftConsumed?: () => void}
const format = (seconds: number) => Math.floor(seconds / 60).toString().padStart(2, '0') + ':' + Math.floor(seconds % 60).toString().padStart(2, '0');
const reflections = [{value: 'easy', label: 'Comfortable', icon: '🌱'}, {value: 'good', label: 'Steady', icon: '🌤️'}, {value: 'hard', label: 'Challenging', icon: '🧗'}] as const;

export default function FocusChamber({setView, draft, onDraftConsumed}: Props) {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const [sound, setSound] = useState(false);
  const sessionRef = useRef<FocusSession | null>(null);
  const sampledAt = useRef(Date.now());
  const transitioning = useRef(false);
  const heartbeatPending = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(false);
  const audio = useRef<AudioContext | null>(null);

  const appliedDraft = useRef<string | null>(null);
  useEffect(() => {
    if (loading || !draft || appliedDraft.current === draft.id) return;
    appliedDraft.current = draft.id;
    if (sessionRef.current && sessionRef.current.state !== 'completed') {
      setNotice('Finish your current focus session before preparing another.');
    } else {
      setTopic(draft.topic); setMinutes(draft.minutes);
      setNotice('Local draft ready. Review the topic and duration, then press Start.');
    }
    onDraftConsumed?.();
  }, [draft, loading, onDraftConsumed]);

  function accept(value: FocusSession | null) {
    if (value && sessionRef.current?.id === value.id && sessionRef.current.revision > value.revision) return;
    sessionRef.current = value;
    sampledAt.current = Date.now();
    if (mounted.current) {setSession(value); setNow(Date.now())}
  }
  async function restore() {
    setLoading(true); setError('');
    try {
      const result = await focusService.active();
      const value = result.session?.state === 'running' ? await focusService.pause(result.session.id) : result.session;
      if (!mounted.current) return;
      accept(value);
      if (value) {setTopic(value.topic); setMinutes(value.goalSeconds / 60); setNotice('Your unfinished session is ready to resume.')}
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'Unable to load your session.');
    } finally {if (mounted.current) setLoading(false)}
  }
  async function change(action: 'toggle' | 'pause' | 'complete', explanation = '') {
    if (transitioning.current) return;
    transitioning.current = true;
    generation.current++;
    setBusy(true); setError('');
    try {
      const current = sessionRef.current;
      let result: FocusSession;
      if (!current || current.state === 'completed') {
        if (action !== 'toggle') return;
        result = await focusService.start(topic.trim() || 'Study time', minutes);
      } else if (action === 'complete') {
        result = await focusService.complete(current.id);
      } else if (action === 'pause' || current.state === 'running') {
        result = await focusService.pause(current.id);
      } else {
        result = await focusService.resume(current.id);
      }
      accept(result);
      if (result.state === 'completed') {
        setSound(false);
        setNotice('Saved to your account. ' + result.recordedMinutes + ' complete study minutes recorded.');
      } else setNotice(explanation || (result.state === 'paused' ? 'Paused. Your saved time is kept for this session.' : 'Your focus session is connected and recording.'));
    } catch (reason) {
      const current = sessionRef.current;
      if (current?.state === 'running') accept({...current, state: 'paused'});
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'The session could not be saved. Please retry.');
    } finally {
      transitioning.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
    void restore();
    return () => {
      mounted.current = false;
      const current = sessionRef.current;
      if (current?.state === 'running') void focusService.pause(current.id).catch(() => {});
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (session?.state !== 'running') return;
    const clock = window.setInterval(() => setNow(Date.now()), 250);
    const heartbeat = window.setInterval(() => {
      const current = sessionRef.current;
      if (!current || current.state !== 'running' || heartbeatPending.current || transitioning.current) return;
      const requestGeneration = generation.current;
      heartbeatPending.current = true;
      void focusService.heartbeat(current.id).then(value => {
        if (requestGeneration === generation.current && !transitioning.current && sessionRef.current?.id === value.id && sessionRef.current?.state === 'running') accept(value);
      }).catch(() => {
        if (requestGeneration === generation.current && sessionRef.current?.id === current.id && sessionRef.current?.state === 'running') {
          accept({...sessionRef.current, state: 'paused'});
          if (mounted.current) setError('Connection lost. The timer is paused. Reconnect and resume to continue recording.');
        }
      }).finally(() => {heartbeatPending.current = false});
    }, 15000);
    const hidden = () => {
      if (document.visibilityState === 'hidden' && sessionRef.current?.state === 'running') {
        void change('pause', 'Paused while this view was in the background.');
      }
    };
    const offline = () => {if (sessionRef.current?.state === 'running') void change('pause')};
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('offline', offline);
    return () => {
      clearInterval(clock); clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('offline', offline);
    };
  }, [session?.state]);

  const goal = session?.goalSeconds || minutes * 60;
  const elapsed = Math.min(goal, (session?.activeSeconds || 0) + (session?.state === 'running' ? Math.max(0, (now - sampledAt.current) / 1000) : 0));
  const remaining = Math.max(0, Math.ceil(goal - elapsed));
  useEffect(() => {
    if (session?.state === 'running' && remaining === 0) void change('complete');
  }, [remaining, session?.state]);

  async function toggleSound() {
    setError('');
    if (sound) {await audio.current?.suspend(); setSound(false); return}
    try {
      if (!audio.current || audio.current.state === 'closed') {
        const context = new AudioContext();
        const gain = context.createGain(); gain.gain.value = 0.025; gain.connect(context.destination);
        for (const frequency of [80, 120]) {
          const oscillator = context.createOscillator();
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          oscillator.connect(gain); oscillator.start();
        }
        audio.current = context;
      }
      await audio.current.resume(); setSound(true);
    } catch {setError('Sound could not start on this device. Your timer is still available.')}
  }
  useEffect(() => {
    if (!sound) void audio.current?.suspend();
  }, [sound]);

  async function reflect(value: NonNullable<FocusSession['reflection']>) {
    if (!session || busy) return;
    setBusy(true); setError('');
    try {accept(await focusService.reflect(session.id, value)); setNotice('Reflection saved. Thank you for checking in.')}
    catch (reason) {setError(reason instanceof Error ? reason.message : 'Your reflection was not saved.')}
    finally {if (mounted.current) setBusy(false)}
  }
  if (loading) return <AppLoading label="Opening your focus space…"/>;
  return <section className="focus-workspace page-opening" aria-labelledby="focus-title">
    <header>
      <button className="text-button" onClick={() => setView('map')}><ArrowLeft size={16}/> Back to learning</button>
      <span className="editorial-kicker">ONE SMALL GOAL</span>
      <h1 id="focus-title">A little space to focus.</h1>
      <p>Choose something to work on. Keep a pace that works for you.</p>
    </header>
    {error && <div role="alert" className="focus-notice focus-error"><p>{error}</p>{!session && <button className="text-button" onClick={() => void restore()}>Retry connection</button>}</div>}
    {notice && <p className="focus-notice" role="status">{notice}</p>}
    <div className="focus-layout">
      <div className="focus-timer-panel">
        <div className="focus-dial" style={{'--focus-progress': (elapsed / goal * 100) + '%'} as React.CSSProperties}>
          <div><Sparkles size={25}/><strong role="timer" aria-label={format(remaining) + ' remaining'}>{format(remaining)}</strong><span>{session?.state === 'completed' ? 'SAVED' : session?.state === 'running' ? 'FOCUS TIME' : session ? 'PAUSED' : 'READY WHEN YOU ARE'}</span></div>
        </div>
        <p className="focus-record">{session ? Math.floor(session.activeSeconds / 60) + ' min confirmed by the server' : 'Your session starts when you choose.'}</p>
        <div className="focus-actions">
          {session?.state === 'completed' ? <button className="ink-button" onClick={() => {accept(null); setNotice(''); setTopic('')}}><RotateCcw size={16}/> New session</button> : <>
            <button className="ink-button" disabled={busy || (!session && !!error)} onClick={() => void change('toggle')}>
              {session?.state === 'running' ? <CirclePause size={17}/> : <Play size={17}/>}
              {busy ? 'Saving…' : session?.state === 'running' ? 'Pause' : session ? 'Resume session' : 'Start session'}
            </button>
            {session && <button className="text-button" disabled={busy} onClick={() => void change('complete')}>Save and finish</button>}
          </>}
        </div>
      </div>
      <aside className="focus-settings">
        <article>
          <h2>Your small goal</h2>
          <label htmlFor="focus-topic">What would you like to work on?</label>
          <input id="focus-topic" maxLength={100} placeholder="Read a chapter, practise fractions…" value={topic} disabled={busy || !!session} onChange={event => setTopic(event.target.value)}/>
          <label htmlFor="focus-duration">Study time</label>
          <select id="focus-duration" value={minutes} disabled={busy || !!session} onChange={event => setMinutes(Number(event.target.value))}>
            {[5, 15, 25, 45].map(value => <option key={value} value={value}>{value} minutes</option>)}
            {![5, 15, 25, 45].includes(minutes) && <option value={minutes}>{minutes} minutes</option>}
          </select>
          <p>Pausing keeps your session together. Only time confirmed by the server is added to your learning records.</p>
        </article>
        <article className="focus-sound"><div><Headphones size={20}/><h2>A soft background hum</h2><p>Optional sound generated on your device.</p></div><button className="text-button" aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? 'Sound off' : 'Try sound'}</button></article>
      </aside>
    </div>
    {session?.state === 'completed' && <section className="focus-reflection" aria-labelledby="reflection-title">
      <span className="focus-saved"><Check size={16}/> Session saved</span>
      <h2 id="reflection-title">How did that feel?</h2><p>An optional check-in before your next step.</p>
      <div>{reflections.map(option => <button key={option.value} disabled={busy} aria-pressed={session.reflection === option.value} onClick={() => void reflect(option.value)}><span aria-hidden="true">{option.icon}</span>{option.label}{session.reflection === option.value && <Check size={15}/>}</button>)}</div>
    </section>}
  </section>;
}
