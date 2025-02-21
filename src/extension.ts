import * as vscode from 'vscode';
import { Logger } from './Logger/logger';

const logger = new Logger();

export function activate(context: vscode.ExtensionContext) {
    logger.initializeChannel();

    logger.logInfo('This is a info message');
    logger.logWarning('This is a warning message');
    logger.logError('This is a error message');

    const disposable = vscode.commands.registerCommand(
        'templator.helloWorld',
        () => {
            vscode.window.showInformationMessage('Hello World from Templator!');
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
