import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommandService } from '../command-service/command-service';
import { CommandName, CommandResult } from '../command-service/command.model';

@Component({
  imports: [],
  selector: 'app-commands-panel',
  styleUrl: './commands-panel.css',
  templateUrl: './commands-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandsPanel {
  private readonly commandService = inject(CommandService);

  /** Command currently in flight, or null when idle. One at a time. */
  readonly pending = signal<CommandName | null>(null);
  /** Result of the most recent command, or null before any has been sent. */
  readonly lastResult = signal<CommandResult | null>(null);

  arm(): void {
    this.run('arm', () => this.commandService.arm());
  }

  takeoff(): void {
    this.run('takeoff', () => this.commandService.takeoff());
  }

  land(): void {
    this.run('land', () => this.commandService.land());
  }

  returnToLaunch(): void {
    this.run('rtl', () => this.commandService.returnToLaunch());
  }

  // The service resolves rather than rejects on failure, so the result carries
  // both outcomes. Ignore a press while another command is still in flight.
  private async run(name: CommandName, send: () => Promise<CommandResult>): Promise<void> {
    if (this.pending() !== null) return;
    this.pending.set(name);
    try {
      this.lastResult.set(await send());
    } finally {
      this.pending.set(null);
    }
  }
}
