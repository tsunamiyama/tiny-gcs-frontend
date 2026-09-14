export type CommandName = 'arm' | 'takeoff' | 'land' | 'rtl';

export type CommandResult =
  | { status: 'accepted'; command: string }
  | { status: 'rejected'; reason: string }   // 409 — bad flight state
  | { status: 'unavailable'; reason: string } // 503 — vehicle not connected
  | { status: 'error'; reason: string };      // anything else / network

export type SourceMode = 'live' | 'replay';

export interface ModeSwitch {
  active: string;
}
