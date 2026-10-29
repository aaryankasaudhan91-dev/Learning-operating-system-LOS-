export type View = 'map' | 'courses' | 'chamber' | 'profile' | 'settings' | 'help';
export type Action = {name: 'open_view'; arguments: {view: View}} |
  {name: 'prepare_focus'; arguments: {topic: string; minutes: number}};
export type Proposal = {kind: 'proposal'; action: Action; confidence: number | null} |
  {kind: 'unsupported'};
export type Reply<T> = {ok: true; value: T} | {ok: false; code: string};
export const views: readonly string[] = ['map', 'courses', 'chamber', 'profile', 'settings', 'help'];
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID');
  return value as Record<string, unknown>;
}
export function exact(value: Record<string, unknown>, keys: string[]) {
  if (Object.keys(value).some(key => !keys.includes(key))) throw new Error('INVALID');
}
export function boundedText(value: unknown, limit: number): string {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0') ||
      Buffer.byteLength(value, 'utf8') > limit) throw new Error('INVALID');
  return value.trim();
}
export function request(value: unknown, field: 'text' | 'url') {
  const data = record(value); exact(data, ['id', field]);
  if (typeof data.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(data.id)) throw new Error('INVALID');
  return {id: data.id, value: boundedText(data[field], field === 'text' ? 4096 : 2048)};
}
export function action(value: unknown): Action {
  const data = record(value); exact(data, ['name', 'arguments']);
  const args = record(data.arguments);
  if (data.name === 'open_view') {
    exact(args, ['view']);
    if (typeof args.view !== 'string' || !views.includes(args.view)) throw new Error('INVALID');
    return {name: 'open_view', arguments: {view: args.view as View}};
  }
  if (data.name === 'prepare_focus') {
    exact(args, ['topic', 'minutes']);
    const topic = boundedText(args.topic, 400);
    if (topic.length > 100) throw new Error('INVALID');
    if (typeof args.minutes !== 'number' || !Number.isInteger(args.minutes) ||
        args.minutes < 1 || args.minutes > 120) throw new Error('INVALID');
    return {name: 'prepare_focus', arguments: {topic, minutes: args.minutes}};
  }
  throw new Error('INVALID');
}
export function proposal(value: unknown): Proposal {
  const data = record(value); exact(data, ['kind', 'action', 'confidence']);
  if (data.kind === 'unsupported' && Object.keys(data).length === 1) return {kind: 'unsupported'};
  if (data.kind !== 'proposal') throw new Error('INVALID');
  if (data.confidence !== null && (typeof data.confidence !== 'number' ||
      !Number.isFinite(data.confidence) || data.confidence < 0 || data.confidence > 1)) throw new Error('INVALID');
  return {kind: 'proposal', action: action(data.action), confidence: data.confidence as number | null};
}
export function approvedUrl(value: unknown): string {
  const url = new URL(boundedText(value, 2048));
  // This is a TOP-LEVEL allowlist, not a subresource/redirect firewall.
  const hosts = new Set(['en.wikipedia.org', 'developer.mozilla.org', 'www.khanacademy.org']);
  if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password ||
      (url.port && url.port !== '443') || url.search || url.hash) throw new Error('URL_DENIED');
  return url.href;
}
