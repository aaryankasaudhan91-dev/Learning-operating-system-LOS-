/**
 * Real-time API Mock Service - DEPRECATED
 * Replaced by Firebase DB connections and local React State.
 */
export const mockApi = {
  startTelemetryStream: () => {},
  stopTelemetryStream: () => {},
  subscribeToCognitiveLoad: (cb: any) => { return () => {}; }
};
