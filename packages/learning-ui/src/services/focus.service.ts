import {apiFetch} from './http';

export interface FocusSession {
  id: string;
  topic: string;
  goalSeconds: number;
  activeSeconds: number;
  state: 'running' | 'paused' | 'completed';
  recordedMinutes: number;
  revision: number;
  reflection?: 'easy' | 'good' | 'hard';
}
async function request<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await apiFetch('/api/focus/sessions' + path, {
    method, ...(data === undefined ? {} : {headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Your focus session could not be saved. Please retry.');
  return result;
}
export const focusService = {
  active: () => request<{session: FocusSession | null}>('/active'),
  start: (topic: string, targetMinutes: number) => request<FocusSession>('', 'POST', {topic, targetMinutes}),
  pause: (id: string) => request<FocusSession>('/' + id + '/pause', 'POST', {}),
  resume: (id: string) => request<FocusSession>('/' + id + '/resume', 'POST', {}),
  heartbeat: (id: string) => request<FocusSession>('/' + id + '/heartbeat', 'POST', {}),
  complete: (id: string) => request<FocusSession>('/' + id + '/complete', 'POST', {}),
  reflect: (id: string, reflection: NonNullable<FocusSession['reflection']>) =>
    request<FocusSession>('/' + id + '/reflection', 'PATCH', {reflection}),
};
