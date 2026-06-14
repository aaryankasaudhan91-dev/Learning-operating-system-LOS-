
/**
 * Real-time API Mock Service
 * Simulates WebSocket cognitive telemetry data streams.
 */

export type TelemetryUpdateCallback = (load: number) => void;

class MockApiService {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Set<TelemetryUpdateCallback> = new Set();
  private currentLoad: number = 42;

  /**
   * Mock WebSocket "Connect"
   */
  startTelemetryStream() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Periodic fluctuation simulating real-time cognitive shift
      const delta = (Math.random() - 0.5) * 12;
      this.currentLoad = Math.min(Math.max(this.currentLoad + delta, 15), 98);
      
      this.broadcast();
    }, 4000); // 4-second resolution
  }

  /**
   * Mock WebSocket "Subscribe"
   */
  subscribeToCognitiveLoad(callback: TelemetryUpdateCallback) {
    this.subscribers.add(callback);
    callback(Math.round(this.currentLoad));
    return () => this.subscribers.delete(callback);
  }

  private broadcast() {
    const val = Math.round(this.currentLoad);
    this.subscribers.forEach(cb => cb(val));
  }

  stopTelemetryStream() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const mockApi = new MockApiService();
