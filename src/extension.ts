import * as vscode from 'vscode';
import { Logger } from './logger/logger';
import * as DefaultTemplates from './templates/default_templates.json';
import { Language } from './templates/interface';
import { registerCommands } from './commands/commands';

/**
 * the `logger` will help to display the user all the important information, in a output channel, directly on vscode.
 */
export const logger = new Logger();

/**
 * Holds all the default languages information, as an array, it also contains all the snippets.
 */
export let all_languages: Language[];

// Extension activation and initialization
export async function activate(context: vscode.ExtensionContext) {
    logger.initializeChannel();
    readTemplates();
    registerCommands(context);
    context.subscriptions.push();
}

/**
 * Reads and parses the default templates to a more friendly format, initializes `logger` and `all_languages` global variables.
 */
function readTemplates() {
    all_languages = DefaultTemplates.languages;
    let template_count = 0;
    all_languages.forEach((x) => {
        template_count += x.templates.length;
    });
    logger.logInfo(
        `The Default templates file contains ${DefaultTemplates.languages.length} languages and ${template_count} templates.`
    );
}

/**
 * Important extension data available globally to avoid typos.
 */
export enum extensionData {
    id = 'templator',
    name = 'Templator',
}

// async function createATemplate() {
//     let helloWorldCs: Templates = {
//         alias: 'Hellow',
//         description: 'Says Hellow',
//         fileName: 'Program',
//         snippet: ['Console.WriteLine("Hellow World")'],
//     };
//     let helloWorld: Templates = {
//         alias: 'Hellow',
//         description: 'Says Hello',
//         fileName: 'Program',
//         snippet: ['Console.WriteLine("Hellow World")'],
//     };
//     let csharp: Language = {
//         alias: 'C#',
//         id: 'csharp',
//         extension: 'cs',
//         requireNamespace: true,
//         templates: [helloWorldCs, helloWorld],
//     };
//     let root: Root = {
//         languages: [csharp],
//     };

//     let rootString = JSON.stringify(root);

//     const wsFolder = vscode.workspace.workspaceFolders;
//     logger.logInfo("We're good so far");
//     if (wsFolder !== undefined) {
//         let newFileDir = wsFolder[0].uri;
//         let newFileName = 'root.json';
//         let uri = vscode.Uri.parse(newFileDir + path.sep + newFileName);
//         logger.logInfo(uri.fsPath);
//         await vscode.workspace.fs
//             .writeFile(uri, new TextEncoder().encode(rootString))
//             .then(async () => {});
//         await vscode.workspace.openTextDocument(uri);
//     }
// }
