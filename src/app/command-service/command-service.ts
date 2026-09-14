import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommandName, CommandResult, ModeSwitch, SourceMode } from './command.model';
import { firstValueFrom } from 'rxjs';

@Service()
export class CommandService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.baseUrl;

    public arm(): Promise<CommandResult> {
        return this.send('arm');
    }

    public takeoff(): Promise<CommandResult> {
        return this.send('takeoff');
    }

    public land(): Promise<CommandResult> {
        return this.send('land');
    }

    public returnToLaunch(): Promise<CommandResult> {
        return this.send('rtl');
    }

    public async switchLive(mode: SourceMode): Promise<ModeSwitch> {
        const url = `${this.baseUrl}/source/${mode}`;
        try {
            const body = await firstValueFrom(this.http.post<{ active: string }>(url, {}));
            return { active: body.active };
        } catch (err) {
            const message = (err instanceof HttpErrorResponse)
                ? `Failed to switch to ${mode}: ${err.status}`
                : `Failed to switch to ${mode}`;
            console.error(message, err);
            throw new Error(message);
        }
    }

    private async send(command: CommandName): Promise<CommandResult>{
        const url = `${this.baseUrl}/command/${command}`;
        try {
            const body = await firstValueFrom(
                this.http.post<{ status: string; command: string }>(url, {}),
            );
            return { status: 'accepted', command: body.command };
        } catch (err) {
            return this.toResult(err);
        }
    }

    private toResult(err: unknown): CommandResult {
        if (err instanceof HttpErrorResponse) {
            const reason = err.error?.detail ?? err.message;
            if (err.status === 409) return { status: 'rejected', reason };
            if (err.status === 503) return { status: 'unavailable', reason };
            return { status: 'error', reason };
        }
        return { status: 'error', reason: 'unexpected error' };
    }
}
