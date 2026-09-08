import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Position } from '../telemetry/telemetry.model';

@Component({
  imports: [DecimalPipe],
  selector: 'app-position-panel',
  styleUrl: './position-panel.css',
  templateUrl: './position-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionPanel {
  /** Latest vehicle position, or null before the first frame arrives. */
  readonly position = input<Position | null>(null);
}
