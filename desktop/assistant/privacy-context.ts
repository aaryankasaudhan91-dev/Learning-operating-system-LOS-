import {randomUUID} from 'node:crypto';
import {ASSISTANT_PRIVACY_NOTICE, type AssistantContext} from '../../packages/learning-ui/src/services/assistant.types';
import {accountScope, PrivacyStore} from './privacy-store';
import {AssistantSession} from './session';

/** Local account scope selects flags only; it never authorizes a backend account. */
export class PrivacyContext {
  readonly session = new AssistantSession();
  private current: {scope:string; value:AssistantContext} | null = null;
  private epoch = 0;
  private updating = false;
  constructor(private readonly store: PrivacyStore, private readonly changed: (context:AssistantContext|null)=>void) {}
  resetContent() {this.session.reset();this.changed(this.current?.value ?? null)}
  invalidate() {this.epoch++;this.current=null;this.session.reset();this.changed(null)}
  async bind(account: unknown): Promise<AssistantContext> {
    const scope=accountScope(account);
    this.invalidate(); const epoch=this.epoch;
    let value:AssistantContext;
    try {value={token:randomUUID(),preferences:await this.store.read(scope),storage:'ready'}}
    catch {value={token:randomUUID(),preferences:{localCommandsEnabled:false,revision:0,noticeVersion:ASSISTANT_PRIVACY_NOTICE},storage:'unavailable'}}
    if (epoch!==this.epoch) throw new Error('STALE_CONTEXT');
    this.current={scope,value};this.changed(value);return value;
  }
  require(token: unknown) {
    if (!this.current || token!==this.current.value.token) throw new Error('STALE_CONTEXT');
    if (this.updating) throw new Error('BUSY');
    return this.current;
  }
  async propose<T>(token:unknown,id:string,work:(signal:AbortSignal)=>Promise<T>) {
    const current=this.require(token);
    if (current.value.storage!=='ready') throw new Error('PRIVACY_UNAVAILABLE');
    if (!current.value.preferences.localCommandsEnabled) throw new Error('PRIVACY_DISABLED');
    return this.session.run(id,work);
  }
  async update(token:unknown,revision:number,enabled:boolean) {
    const current=this.require(token);this.session.reset();this.updating=true;
    const epoch=this.epoch;
    try {
      const preferences=await this.store.update(current.scope,revision,enabled);
      if (epoch!==this.epoch) throw new Error('STALE_CONTEXT');
      current.value={...current.value,preferences,storage:'ready'};
      this.changed(current.value);return current.value;
    } catch(error) {
      if (epoch===this.epoch && (error as Error).message!=='CONFLICT') {
        current.value={...current.value,storage:'unavailable',preferences:{...current.value.preferences,localCommandsEnabled:false}};
        this.changed(current.value);
      }
      throw error;
    } finally {this.updating=false}
  }
  async forget(token:unknown) {
    const current=this.require(token);this.session.reset();this.updating=true;
    const epoch=this.epoch;
    try {
      const preferences=await this.store.forget(current.scope);
      if (epoch!==this.epoch) throw new Error('STALE_CONTEXT');
      current.value={token:randomUUID(),preferences,storage:'ready'};
      this.changed(current.value);return current.value;
    } finally {this.updating=false}
  }
}
