import * as vscode from 'vscode';
import { extensionData } from '../definitions';
/**
 * Logger class
 */

export class Logger {
    channel: vscode.OutputChannel | undefined;

    public initializeChannel() {
        if (this.channel === undefined) {
            this.channel = vscode.window.createOutputChannel(
                extensionData.name,
                'log'
            );
        }
        this.logInfo('Logger successfully initialized');
    }
    public logInfo(message: string): void {
        let date = new Date(Date.now());
        this.channel?.appendLine(
            `[${date.toLocaleString()}] [ INFO    ]: ${message}`
        );
    }
    public logWarning(message: string): void {
        let date = new Date(Date.now());
        this.channel?.appendLine(
            `[${date.toLocaleString()}] [ WARNING ]: ${message}`
        );
    }
    public logError(message: string): void {
        let date = new Date(Date.now());
        this.channel?.appendLine(
            `[${date.toLocaleString()}] [ ERROR   ]: ${message}`
        );
    }
}
