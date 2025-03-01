import * as vscode from 'vscode';
import { all_languages, extensionData, logger } from '../extension';
import { ErrorsMessages } from '../logger/logger';
import { ShowError } from '../messages';
import { Language, Template } from '../templates/interface';
import path from 'path';

/**
 * Register all the commands to vs code
 * @param context The vs code context variable
 */
export function registerCommands(context: vscode.ExtensionContext) {
    // Basic default command
    const createNewFile = vscode.commands.registerCommand(
        FileCreation.newFile,
        async (clicker: vscode.Uri) => {
            let destinyInitialPath: vscode.Uri;
            logger.logInfo(`File creation process initiated`);
            try {
                destinyInitialPath = await determinateDestination(clicker);
                logger.logInfo(
                    `File requested initially at: ${destinyInitialPath.fsPath}`
                );
                let selectedTemplate: usrSelection = await selectTemplate();
                await createFileHere(destinyInitialPath, selectedTemplate);

                //
            } catch (error) {
                if (error instanceof Error) {
                    logger.logError(error.message);
                    ShowError(error.message);
                }
            }
        }
    );

    context.subscriptions.push(createNewFile);
}

async function createFileHere(filePath: vscode.Uri, template: usrSelection) {
    logger.logInfo(
        `Creating file at ${filePath.fsPath} with ${template[0].alias}`
    );
    let filename = template[1].extensionOverride
        ? `${template[1].fileName}.${template[1].extensionOverride}`
        : `${template[1].fileName}.${template[0].extension}`;

    let fullDir = path.join(filePath.fsPath, filename);
    // TODO: Ask the user for dir changes
    fullDir = path.normalize(fullDir);
    let fileDirectory = vscode.Uri.file(fullDir);
    let snippet: vscode.SnippetString = createSnippet(template[1].snippet);

    logger.logInfo(`Creating file at ${fileDirectory.fsPath}`);

    try {
        await vscode.workspace.fs.writeFile(fileDirectory, new Uint8Array());
        const doc = await vscode.workspace.openTextDocument(fileDirectory);
        const editor = await vscode.window.showTextDocument(fileDirectory);
        await editor.insertSnippet(snippet);
    } catch (error) {
        if (error instanceof Error) {
            logger.logError(error.message);
        }
    }
}

function createSnippet(text: string[]): vscode.SnippetString {
    let preSnippet = '';
    text.forEach((line) => {
        preSnippet += line + '\n';
    });
    return new vscode.SnippetString(preSnippet);
}

/**
 * Ask the user to select a template from the templates file
 * @returns the language and the template as two different objects
 */
async function selectTemplate(): Promise<usrSelection> {
    let selectedLang: Language | undefined;
    let selectedTemplate: Template | undefined;
    // let s
    const options: vscode.QuickPickOptions = {
        placeHolder: 'Choose a language',
        canPickMany: false,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
    };

    // Language selection:
    const tempLanguage = await vscode.window.showQuickPick(
        all_languages.map((item) => {
            return {
                label: item.alias,
                details: item.extension,
            };
        }),
        options
    );
    if (tempLanguage === undefined) {
        throw new Error(ErrorsMessages.cancelledByUser);
    }
    selectedLang = all_languages.find(
        (lang) => lang.alias === tempLanguage.label
    );
    if (selectedLang === undefined) {
        throw new Error(ErrorsMessages.unexpected);
    }

    const temTemplate = await vscode.window.showQuickPick(
        selectedLang.templates.map((item) => {
            let filename: string;
            if (item.extensionOverride) {
                filename = item.fileName + '.' + item.extensionOverride;
            } else {
                filename = item.fileName + '.' + selectedLang.extension;
            }
            return {
                label: item.alias,
                detail: item.description,
                description: filename,
            };
        }),
        options
    );
    if (temTemplate === undefined) {
        throw new Error(ErrorsMessages.cancelledByUser);
    } else {
        if (temTemplate === undefined) {
            throw new Error(ErrorsMessages.cancelledByUser);
        } else {
            selectedTemplate = selectedLang.templates.find(
                (templ) => templ.alias === temTemplate.label
            );
            if (selectedTemplate === undefined) {
                throw new Error(ErrorsMessages.unexpected);
            }
        }
    }
    logger.logInfo(
        `Selected language: ${selectedLang.alias}:${selectedTemplate.alias}`
    );

    return [selectedLang, selectedTemplate];
}

/**
 * Makes sure the destination folder is defined and properly selected by the user
 * @param clicker if the command was called using the context menu, this will not be undefined
 * @returns a URI with a properly set destination
 */
async function determinateDestination(
    clicker: vscode.Uri | undefined
): Promise<vscode.Uri> {
    const wsFolders = vscode.workspace.workspaceFolders;

    if (clicker) {
        return clicker;
    } else if (wsFolders === undefined) {
        throw new Error(ErrorsMessages.badWorkspace);
    } else if (wsFolders.length === 1) {
        return wsFolders[0].uri;
    } else {
        let workingFolder = await vscode.window.showWorkspaceFolderPick();
        if (workingFolder === undefined) {
            throw new Error(ErrorsMessages.cancelledByUser);
        }
        return workingFolder.uri;
    }
}

/**
 * Names for the commands related to `File Creation`
 */
enum FileCreation {
    newFile = `${extensionData.id}.newFile`,
    newCustomFile = `${extensionData.id}.newCustomFile`,
}

type usrSelection = [Language, Template];
