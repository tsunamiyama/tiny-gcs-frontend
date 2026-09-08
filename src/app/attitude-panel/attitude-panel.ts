import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Attitude } from '../telemetry/telemetry.model';

/** Horizon travel per degree of pitch — puts the ±26px ladder lines at ±10°. */
const PX_PER_DEG = 2.6;

@Component({
  imports: [DecimalPipe],
  selector: 'app-attitude-panel',
  styleUrl: './attitude-panel.css',
  templateUrl: './attitude-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttitudePanel {
  /** Latest vehicle attitude, or null before the first frame arrives. */
  readonly attitude = input<Attitude | null>(null);

  /** Horizon transform: counter-rotates with roll, slides down as the nose pitches up. */
  readonly horizonTransform = computed(() => {
    const att = this.attitude();
    if (!att) return 'rotate(0deg) translateY(0px)';
    return `rotate(${-att.roll}deg) translateY(${att.pitch * PX_PER_DEG}px)`;
  });
}
