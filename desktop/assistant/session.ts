/** Request lifetime and admission are separate from Electron so they are testable. */
export class AssistantSession {
  private jobs = new Map<string, AbortController>();
  private epoch = 0;
  private tokens = 10;
  private last: number;
  constructor(private readonly clock: () => number = Date.now) {this.last = clock()}
  reset() {
    this.epoch++;
    for (const controller of this.jobs.values()) controller.abort();
    // Keep reservations until child closure to prevent cancel/restart floods.
  }
  cancel(id: string) {this.jobs.get(id)?.abort()}
  async run<T>(id: string, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const now = this.clock();
    this.tokens = Math.min(10, this.tokens + Math.max(0, now - this.last) / 6000);
    this.last = now;
    if (this.tokens < 1) throw new Error('RATE_LIMIT');
    if (this.jobs.size >= 1 || this.jobs.has(id)) throw new Error('BUSY');
    this.tokens--;
    const epoch = this.epoch;
    const controller = new AbortController(); this.jobs.set(id, controller);
    try {
      const result = await work(controller.signal);
      if (controller.signal.aborted || epoch !== this.epoch) throw new Error('CANCELLED');
      return result;
    } finally {this.jobs.delete(id)}
  }
}
