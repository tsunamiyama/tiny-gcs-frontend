import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  selector: 'app-link-info-panel',
  styleUrl: './link-info-panel.css',
  templateUrl: './link-info-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkInfoPanel {
  /** Timestamp of the last received frame, in epoch seconds, or null before the first frame arrives. */
  readonly timestamp = input<number | null>(null);
}
