import * as vscode from 'vscode';
import { extensionData } from '../extension';

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

export enum ErrorsMessages {
    badWorkspace = 'No workspace is open! Please open a folder or workspace first',
    cancelledByUser = 'Process cancelled by the user',
    unexpected = 'An unexpected error has occur',
    fileExist = 'Too many attempts to create a file with the specified name, please select another name',
    noFilesInWorkspace = 'There are no compatibles files in the workspace',
}
