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

@Component({
  selector: 'app-root',
  imports: [RoutePanel, AttitudePanel, PositionPanel, BatteryPanel, LinkInfoPanel, RouterOutlet, JsonPipe, DatePipe, UpperCasePipe],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy{
  private readonly telemetryService = inject(TelemetryService);

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

  // Re-align to the next second boundary each tick so the displayed time
  // never drifts far enough to skip or repeat a second.
  private scheduleClockTick(): void {
    this.clockTimer = setTimeout(() => {
      this.now.set(new Date());
      this.scheduleClockTick();
    }, 1000 - (Date.now() % 1000));
  }
}
