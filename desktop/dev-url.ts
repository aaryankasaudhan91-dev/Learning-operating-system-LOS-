export function developmentUrl(packaged: boolean, value?: string): string | undefined {
  if (packaged || !value) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.port !== '5173' || url.username || url.password) {
    throw new Error('Desktop development mode only accepts the local app preview on port 5173.');
  }
  return url.href;
}
