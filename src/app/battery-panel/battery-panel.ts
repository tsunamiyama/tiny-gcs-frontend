import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Battery } from '../telemetry/telemetry.model';

@Component({
  imports: [DecimalPipe],
  selector: 'app-battery-panel',
  styleUrl: './battery-panel.css',
  templateUrl: './battery-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatteryPanel {
  /** Latest battery state, or null before the first frame arrives. */
  readonly battery = input<Battery | null>(null);
}
