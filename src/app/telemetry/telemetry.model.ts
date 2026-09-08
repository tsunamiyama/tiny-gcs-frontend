export type LinkStatus = 'connecting' | 'open' | 'stale' | 'closed';

/** Status-light colour and badge label for each link state. */
export const LINK_DISPLAY: Record<LinkStatus, { dot: string; label: string }> = {
  connecting: { dot: 'bg-caution', label: 'CONNECTING' },
  open: { dot: 'bg-good', label: 'CONNECTED' },
  stale: { dot: 'bg-caution', label: 'STALE' },
  closed: { dot: 'bg-fault', label: 'DISCONNECTED' },
};

export interface Position {
  lat: number;
  lon: number;
  abs_alt: number;
  rel_alt: number;
}

export interface Attitude {
  roll: number;   // degrees
  pitch: number;  // degrees
  yaw: number;    // degrees
}

export interface Battery {
  voltage: number;
  remaining: number;  // 0.0–1.0
}

/** One telemetry frame, matching TelemetryState.to_json() on the backend. */
export interface TelemetryFrame {
  timestamp: number;              // epoch seconds (Python time.time())
  connected: boolean;
  position: Position | null;
  attitude: Attitude | null;
  flight_mode: string | null;
  armed: boolean | null;
  battery: Battery | null;
}