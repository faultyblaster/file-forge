import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "templator" is now active!');

    const disposable = vscode.commands.registerCommand(
        'templator.helloWorld',
        () => {
            vscode.window.showInformationMessage('Hello World from Templator!');
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
