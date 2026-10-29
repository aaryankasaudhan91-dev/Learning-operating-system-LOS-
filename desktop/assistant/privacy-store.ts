import {createHash, randomUUID} from 'node:crypto';
import {mkdir, lstat, readFile, writeFile, rename, unlink, readdir} from 'node:fs/promises';
import path from 'node:path';
import {ASSISTANT_PRIVACY_NOTICE, type AssistantPreferences} from '../../packages/learning-ui/src/services/assistant.types';

const defaults = (): AssistantPreferences => ({localCommandsEnabled:true, revision:0, noticeVersion:ASSISTANT_PRIVACY_NOTICE});
export function accountScope(account: unknown): string {
  if (account !== null && (typeof account !== 'string' || !account || account.length > 128)) throw new Error('INVALID');
  return createHash('sha256').update(JSON.stringify({account})).digest('hex');
}
/** Stores preference flags only. No prompts, proposals, identifiers or credentials. */
export class PrivacyStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly directory: string) {if (!path.isAbsolute(directory)) throw new Error('INVALID')}
  private serial<T>(work: () => Promise<T>): Promise<T> {
    const pending = this.queue.then(work); this.queue = pending.catch(() => {}); return pending;
  }
  private file(scope: string) {
    if (!/^[a-f0-9]{64}$/.test(scope)) throw new Error('INVALID');
    return path.join(this.directory, scope + '.json');
  }
  private async checkDirectory(create = false) {
    if (create) await mkdir(this.directory, {recursive:true, mode:0o700});
    try {const info=await lstat(this.directory);if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('PRIVACY_UNAVAILABLE')}
    catch (error) {if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error}
  }
  private async readCurrent(scope: string): Promise<AssistantPreferences> {
    await this.checkDirectory();
    const file = this.file(scope);
    try {
      const info = await lstat(file);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 1024) throw new Error('PRIVACY_UNAVAILABLE');
      const data = JSON.parse(await readFile(file, 'utf8'));
      if (!data || Object.keys(data).sort().join(',') !== 'localCommandsEnabled,noticeVersion,revision' ||
        typeof data.localCommandsEnabled !== 'boolean' || data.noticeVersion !== ASSISTANT_PRIVACY_NOTICE ||
        !Number.isSafeInteger(data.revision) || data.revision < 1) throw new Error('PRIVACY_UNAVAILABLE');
      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return defaults();
      throw new Error('PRIVACY_UNAVAILABLE');
    }
  }
  read(scope: string) {return this.serial(() => this.readCurrent(scope))}
  update(scope: string, revision: number, enabled: boolean) {
    return this.serial(async () => {
      if (typeof enabled !== 'boolean' || !Number.isSafeInteger(revision) || revision < 0) throw new Error('INVALID');
      const current = await this.readCurrent(scope);
      if (current.revision !== revision) throw new Error('CONFLICT');
      await this.checkDirectory(true);
      const file = this.file(scope);
      const entries = await readdir(this.directory);
      if (current.revision === 0 && entries.filter(name => name.endsWith('.json')).length >= 128) throw new Error('PRIVACY_UNAVAILABLE');
      const value = {...defaults(), localCommandsEnabled:enabled, revision:revision+1};
      const temporary = path.join(this.directory, '.' + randomUUID() + '.tmp');
      try {
        await writeFile(temporary, JSON.stringify(value), {flag:'wx', mode:0o600});
        await rename(temporary, file);
      } finally {await unlink(temporary).catch(error => {if (error.code !== 'ENOENT') throw error})}
      return value;
    });
  }
  forget(scope: string) {
    return this.serial(async () => {
      await this.checkDirectory();
      const file = this.file(scope);
      try {
        const info=await lstat(file);
        if (!info.isFile() || info.isSymbolicLink()) throw new Error('PRIVACY_UNAVAILABLE');
        await unlink(file);
      } catch(error) {if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error}
      return defaults();
    });
  }
}
