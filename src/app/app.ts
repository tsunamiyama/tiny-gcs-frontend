import { Component, signal, computed, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelemetryService } from './telemetry/telemetry.service';
import { LINK_DISPLAY } from './telemetry/telemetry.model';
import { DatePipe, JsonPipe, UpperCasePipe } from '@angular/common';
import { PositionPanel } from './position-panel/position-panel';
import { BatteryPanel } from './battery-panel/battery-panel';
import { LinkInfoPanel } from './link-info-panel/link-info-panel';
import { AttitudePanel } from './attitude-panel/attitude-panel';
import { RoutePanel } from './route-panel/route-panel';
import { CommandsPanel } from './commands-panel/commands-panel';
import { CommandService } from './command-service/command-service';
import { SourceMode } from './command-service/command.model';

@Component({
  selector: 'app-root',
  imports: [CommandsPanel, RoutePanel, AttitudePanel, PositionPanel, BatteryPanel, LinkInfoPanel, RouterOutlet, JsonPipe, DatePipe, UpperCasePipe],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy{
  private readonly telemetryService = inject(TelemetryService);
  private readonly commandService = inject(CommandService);

  protected readonly title = signal('tiny-gcs-frontend');
  protected readonly frame = this.telemetryService.frame;
  protected readonly timestamp = this.telemetryService.timestamp;
  protected readonly position = this.telemetryService.position;
  protected readonly attitude = this.telemetryService.attitude;
  protected readonly battery = this.telemetryService.battery;
  protected readonly flightMode = this.telemetryService.flightMode;
  protected readonly armed = this.telemetryService.armed;
  protected readonly linkStatus = this.telemetryService.status;
  protected readonly linkDisplay = computed(() => LINK_DISPLAY[this.linkStatus()]);

  /** Telemetry source the backend is currently serving. */
  protected readonly sourceMode = signal<SourceMode>('replay');
  /** True while a source switch is in flight. */
  protected readonly sourceSwitching = signal(false);

  /** Wall-clock time, re-read once a second. */
  protected readonly now = signal(new Date());
  private clockTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.scheduleClockTick();
    this.telemetryService.connect();
  }

  ngOnDestroy(): void {
    clearTimeout(this.clockTimer);
    this.telemetryService.disconnect();
  }

  // switchLive rejects on failure, so keep the old mode when the switch fails.
  // Ignore a press while a switch is still in flight.
  protected async toggleSource(): Promise<void> {
    if (this.sourceSwitching()) return;
    const next: SourceMode = this.sourceMode() === 'live' ? 'replay' : 'live';
    this.sourceSwitching.set(true);
    try {
      const { active } = await this.commandService.switchLive(next);
      this.sourceMode.set(next);
    } catch {
      // Already logged by the service; leave the displayed mode unchanged.
    } finally {
      this.sourceSwitching.set(false);
    }
  }

  // Re-align to the next second boundary each tick so the displayed time
  // never drifts far enough to skip or repeat a second.
  private scheduleClockTick(): void {
    this.clockTimer = setTimeout(() => {
      this.now.set(new Date());
      this.scheduleClockTick();
    }, 1000 - (Date.now() % 1000));
  }
}
