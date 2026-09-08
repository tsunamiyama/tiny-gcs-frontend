import { computed, inject, NgZone, OnDestroy, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Attitude, Battery, LinkStatus, Position, TelemetryFrame } from './telemetry.model';

/** Frames arrive at ~10 Hz. If none for this long, the link is stale. */
const STALE_MS = 1000;
/** Reconnect backoff, capped. */
const RECONNECT_MIN_MS = 500;
const RECONNECT_MAX_MS = 5000;

@Service()
export class TelemetryService implements OnDestroy {
  private zone = inject(NgZone)
  private ws?: WebSocket;
  private reconnectDelay = RECONNECT_MIN_MS;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private staleTimer?: ReturnType<typeof setTimeout>;
  private manuallyClosed = false;

  /** Latest telemetry frame, or null before the first arrives. */
  readonly frame = signal<TelemetryFrame | null>(null);
  readonly timestamp = signal<number | null>(null);
  readonly position = signal<Position | null>(null, {
    equal: (prev, curr) => {
        return (prev?.lat == curr?.lat && prev?.lon == curr?.lon) && (prev?.abs_alt == curr?.abs_alt && prev?.rel_alt == curr?.rel_alt);
    }
  })
  readonly attitude = signal<Attitude | null>(null, {
    equal: (prev, curr) => {
        return prev?.roll == curr?.roll && prev?.pitch == curr?.pitch && prev?.yaw == curr?.yaw;
    }
  })
  readonly battery = signal<Battery | null>(null, {
    equal: (prev, curr) => {
        return prev?.voltage == curr?.voltage && prev?.remaining == curr?.remaining;
    }
  })
  /** Flight mode string reported by the vehicle, or null when unknown. */
  readonly flightMode = signal<string | null>(null);
  /** Arm state, or null when the vehicle hasn't reported one yet. */
  readonly armed = signal<boolean | null>(null);
  /** Socket/link status, driven by both socket events and the watchdog. */
  readonly status = signal<LinkStatus>('closed');

  /** True only when we have a live link AND the backend reports the vehicle connected. */
  readonly vehicleConnected = computed(
    () => this.status() === 'open' && (this.frame()?.connected ?? false),
  );

  // Run socket callbacks outside Angular's zone to avoid change-detection
  // churn at 10 Hz; signal writes still notify the UI.
  constructor() {}

  connect(): void {
    this.manuallyClosed = false;
    console.log("connect called")
    this.open();
  }

  private open(): void {
    console.log('zone is', this.zone, this.zone?.constructor?.name);
    this.zone.runOutsideAngular(() => {
      const ws = new WebSocket(environment.wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        this.reconnectDelay = RECONNECT_MIN_MS;
        this.status.set('open');
        this.armStaleTimer();
      };

      ws.onmessage = (ev) => {
        let parsed: TelemetryFrame;
        try {
          parsed = JSON.parse(ev.data as string);
        } catch {
          return; // ignore malformed frame, keep the link
        }
        this.frame.set(parsed);
        this.timestamp.set(parsed.timestamp);
        this.position.set(parsed.position);
        this.attitude.set(parsed.attitude);
        this.battery.set(parsed.battery);
        this.flightMode.set(parsed.flight_mode);
        this.armed.set(parsed.armed);
        if (this.status() === 'stale') this.status.set('open');
        this.armStaleTimer();
      };

      ws.onerror = () => {
        // onclose will follow; let it handle reconnect.
      };

      ws.onclose = () => {
        this.clearStaleTimer();
        if (this.manuallyClosed) {
          this.status.set('closed');
          return;
        }
        this.status.set('closed');
        this.scheduleReconnect();
      };
    });
  }

  private armStaleTimer(): void {
    this.clearStaleTimer();
    this.staleTimer = setTimeout(() => {
      // No frame in STALE_MS despite an open socket — treat as stale and
      // force a reconnect, since a silently dead socket won't fire onclose.
      this.status.set('stale');
      this.ws?.close();
    }, STALE_MS);
  }

  private clearStaleTimer(): void {
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
      this.staleTimer = undefined;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => this.open(), this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, RECONNECT_MAX_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  disconnect(): void {
    this.manuallyClosed = true;
    this.clearReconnectTimer();
    this.clearStaleTimer();
    this.ws?.close();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
