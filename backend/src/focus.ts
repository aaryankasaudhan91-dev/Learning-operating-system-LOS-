import type {Express, Request, Response, NextFunction} from 'express';
import {randomUUID} from 'node:crypto';
import {FocusSessionModel as Focus, ProgressModel as Progress} from './models';
import {ApiError, check, limitedNumber, text} from './security';

const cap = 180 * 60;
const active = {endedAt: null};
const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {void fn(req, res).catch(next)};
const snapshot = (session: any) => ({
  id: session.id, topic: session.topic || 'Study time', goalSeconds: session.goalSeconds || 900,
  activeSeconds: session.activeSeconds || 0, startedAt: session.startedAt,
  state: session.endedAt ? 'completed' : session.pausedAt ? 'paused' : 'running',
  recordedMinutes: session.recordedMinutes || 0, reflection: session.reflection, revision: session.revision || 0,
});

function elapsed(session: any, now: Date) {
  if (session.pausedAt) return 0;
  const seconds = (now.getTime() - new Date(session.lastHeartbeatAt).getTime()) / 1000;
  return seconds > 60 ? 0 : Math.max(0, Math.min(30, seconds));
}

/** CAS protects pause/heartbeat/complete from double-counting concurrent requests. */
async function mutate(id: string, uid: string, action: 'heartbeat' | 'pause' | 'resume' | 'complete') {
  for (let attempt = 0; attempt < 8; attempt++) {
    const session: any = await Focus.findOne({id, uid}).lean();
    check(session, 404, 'Focus session not found');
    if (session.endedAt) {
      check(action === 'complete', 409, 'This focus session has ended');
      return {session, alreadyRecorded: true};
    }
    const now = new Date();
    const seconds = Math.min(cap, (session.activeSeconds || 0) + (action === 'resume' ? 0 : elapsed(session, now)));
    const set: Record<string, unknown> = {lastHeartbeatAt: now, activeSeconds: seconds};
    const unset: Record<string, string> = {};
    if (action === 'pause') set.pausedAt = now;
    if (action === 'resume') unset.pausedAt = '';
    if (action === 'complete') {
      set.endedAt = now;
      set.recordedMinutes = Math.floor(seconds / 60);
    }
    const revision = session.revision || 0;
    const updated = await Focus.findOneAndUpdate(
      {id, uid, ...active, revision: revision === 0 ? {$in: [null, 0]} : revision},
      {$set: set, $inc: {revision: 1}, ...(Object.keys(unset).length ? {$unset: unset} : {})},
      {returnDocument: 'after', runValidators: true},
    );
    if (updated) return {session: updated, alreadyRecorded: false};
  }
  throw new ApiError(409, 'Your session changed in another window. Please retry.');
}

export function setupFocusRoutes(app: Express, progressFor: (res: Response) => Promise<unknown>) {
  const uid = (res: Response) => res.locals.identity.uid as string;
  app.get('/api/focus/sessions/active', wrap(async (_req, res) => {
    const session = await Focus.findOne({uid: uid(res), ...active});
    res.json({session: session ? snapshot(session) : null});
  }));
  app.post('/api/focus/sessions', wrap(async (req, res) => {
    check(Object.keys(req.body).every(key => ['topic', 'targetMinutes'].includes(key)), 400, 'Unsupported session field');
    const topic = req.body.topic === undefined ? 'Study time' : text(req.body.topic, 'Topic', 100);
    const minutes = req.body.targetMinutes === undefined ? 15 : req.body.targetMinutes;
    limitedNumber(minutes, 1, 180);
    let session;
    try {
      session = await Focus.findOneAndUpdate({uid: uid(res), ...active}, {$setOnInsert: {
        id: randomUUID(), startedAt: new Date(), lastHeartbeatAt: new Date(), activeSeconds: 0,
        topic, goalSeconds: minutes * 60, revision: 0,
      }}, {upsert: true, returnDocument: 'after', runValidators: true});
    } catch (error: any) {
      if (error.code !== 11000) throw error;
      session = await Focus.findOne({uid: uid(res), ...active});
    }
    check(session, 409, 'Please retry starting your session');
    res.status(201).json(snapshot(session));
  }));
  for (const action of ['heartbeat', 'pause', 'resume'] as const) {
    app.post('/api/focus/sessions/:id/' + action, wrap(async (req, res) => {
      check(Object.keys(req.body).length === 0, 400, 'Session time is recorded by the server');
      const result = await mutate(String(req.params.id), uid(res), action);
      res.json(snapshot(result.session));
    }));
  }
  app.post('/api/focus/sessions/:id/complete', wrap(async (req, res) => {
    check(Object.keys(req.body).length === 0, 400, 'Session time is recorded by the server');
    const {session, alreadyRecorded} = await mutate(String(req.params.id), uid(res), 'complete');
    await Progress.updateOne({uid: uid(res), eventId: 'focus:' + session.id}, {$set: {
      kind: 'focus', minutes: session.recordedMinutes, seconds: session.activeSeconds, topic: session.topic,
      startedAt: session.startedAt, endedAt: session.endedAt, reflection: session.reflection,
    }}, {upsert: true, runValidators: true});
    await progressFor(res);
    res.json({...snapshot(session), minutes: session.recordedMinutes, alreadyRecorded});
  }));
  app.patch('/api/focus/sessions/:id/reflection', wrap(async (req, res) => {
    check(Object.keys(req.body).length === 1 && ['easy', 'good', 'hard'].includes(req.body.reflection), 400, 'Choose a valid reflection');
    const session = await Focus.findOneAndUpdate({id: req.params.id, uid: uid(res), endedAt: {$ne: null}},
      {$set: {reflection: req.body.reflection}}, {returnDocument: 'after', runValidators: true});
    check(session, 404, 'Completed focus session not found');
    await Progress.updateOne({uid: uid(res), eventId: 'focus:' + session.id}, {$set: {reflection: session.reflection}});
    res.json(snapshot(session));
  }));
}
