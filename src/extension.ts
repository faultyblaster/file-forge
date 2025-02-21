import * as vscode from 'vscode';
import { Logger } from './Logger/logger';
import { Language, Root, Templates } from './templates/interface';
import { error, log } from 'console';
import path from 'path';

const logger = new Logger();

export async function activate(context: vscode.ExtensionContext) {
    logger.initializeChannel();

    await createATemplate();
    context.subscriptions.push();
}

export function deactivate() {}

async function createATemplate() {
    let helloWorldCs: Templates = {
        alias: 'Hellow',
        description: 'Says Hellow',
        fileName: 'Program',
        snippet: ['Console.WriteLine("Hellow World")'],
    };
    let helloWorld: Templates = {
        alias: 'Hellow',
        description: 'Says Hello',
        fileName: 'Program',
        snippet: ['Console.WriteLine("Hellow World")'],
    };
    let csharp: Language = {
        alias: 'C#',
        id: 'csharp',
        extension: 'cs',
        requireNamespace: true,
        templates: [helloWorldCs, helloWorld],
    };
    let root: Root = {
        languages: [csharp],
    };

    let rootString = JSON.stringify(root);

    const wsFolder = vscode.workspace.workspaceFolders;
    logger.logInfo("We're good so far");
    if (wsFolder !== undefined) {
        let newFileDir = wsFolder[0].uri;
        let newFileName = 'root.json';
        let uri = vscode.Uri.parse(newFileDir + path.sep + newFileName);
        logger.logInfo(uri.fsPath);
        await vscode.workspace.fs
            .writeFile(uri, new TextEncoder().encode(rootString))
            .then(async () => {});
        await vscode.workspace.openTextDocument(uri);
    }
}
