import * as vscode from 'vscode';
import { all_languages, extensionData, logger } from '../extension';
import { ErrorsMessages } from '../logger/logger';
import { ShowError, ShowInfo } from '../messages';
import { Language, Template } from '../templates/interface';
import path from 'path';
import * as fs from 'fs';
import { Namespacer } from './namespace';

/**
 * Register all the commands to vs code
 * @param ctx The vs code context variable
 */
export function registerCommands(ctx: vscode.ExtensionContext) {
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
                let selectedTemplate: usrSelection = await selectTemplate(ctx);
                await createFile(destinyInitialPath, selectedTemplate);
            } catch (error) {
                if (error instanceof Error) {
                    logger.logError(error.message);
                    ShowError(error.message);
                }
            }
            logger.logInfo(
                'File creation process finished! No issues reported\n'
            );
        }
    );

    const createCSharpNamespace = vscode.commands.registerCommand(
        `${extensionData.id}.createCSharpNamespace`,
        async (clicker: vscode.Uri) => {
            let nsLine = `namespace ${await Namespacer.createCSharpNamespace(
                clicker
            )};`;
            vscode.env.clipboard.writeText(nsLine);
            ShowInfo('The namespace is now on your clipboard');
        }
    );

    // File specific commands: Creating a specific file, skipping the selectTemplate part

    // Trigger the file creation, for C# files
    const createCSFile = vscode.commands.registerCommand(
        FileCreation.newCSFile,
        async (clicker: vscode.Uri) => {
            let destinyInitialPath: vscode.Uri;
            logger.logInfo(
                `File creation process initiated: Creating a C# file...`
            );
            try {
                destinyInitialPath = await determinateDestination(clicker);
                logger.logInfo(
                    `File requested initially at: ${destinyInitialPath.fsPath}`
                );
                let selectedTemplate: usrSelection = await selectTemplate(
                    ctx,
                    'C#'
                );
                await createFile(destinyInitialPath, selectedTemplate);
            } catch (error) {
                if (error instanceof Error) {
                    logger.logError(error.message);
                    ShowError(error.message);
                }
            }
            logger.logInfo(
                'File creation process finished! No issues reported\n'
            );
        }
    );

    // Create C# Class
    // const createCSClass = vscode.commands.registerCommand(
    //     FileCreation.newCSClass,
    //     async (clicker: vscode.Uri) => {}
    // );

    ctx.subscriptions.push(
        createNewFile,
        createCSharpNamespace,
        // C# files
        createCSFile
        // createCSClass
    );
}

async function createFile(filePath: vscode.Uri, template: usrSelection) {
    logger.logInfo(`Creating file at ${filePath.fsPath}`);
    // Full directory of the new file
    let FullDir = '';

    // Temp values
    let basePath = filePath.fsPath;
    let filename = template[1].fileName;
    let fileExtension = template[1].extensionOverride
        ? template[1].extensionOverride
        : template[0].extension;

    logger.logInfo('Asking to the user a name for the new file');
    // Prompts the user for changes on dir and filename/extension
    let confirmedDir = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Enter your file name, and confirm the directory',
        title: 'Enter your file name',
        value: path.join(basePath, filename + '.' + fileExtension),
        valueSelection: [
            basePath.length + 1,
            basePath.length + 1 + filename.length,
        ],
    });

    if (confirmedDir === undefined) {
        logger.logWarning(`Process cancelled by user`);
        throw new Error(ErrorsMessages.cancelledByUser);
    }
    // The path as a string
    FullDir = path.normalize(confirmedDir);
    // Uri of the file
    let fileDirectory = vscode.Uri.file(FullDir);
    logger.logInfo(`Creating file at ${fileDirectory.fsPath}`);

    logger.logInfo('Checking if the file already exist...');
    let attempts = 0;

    let ext = path.extname(FullDir);
    let pathNoExt = FullDir.slice(0, FullDir.length - ext.length);

    let fileExist = fs.existsSync(FullDir);
    while (fileExist && attempts < 10) {
        logger.logWarning(`The file ${FullDir} already exist!`);
        attempts++;
        FullDir = pathNoExt + attempts + ext;
        FullDir = path.normalize(FullDir);
        logger.logInfo(`Checking with ${FullDir}`);
        fileExist = fs.existsSync(FullDir);
    }
    if (fileExist) {
        logger.logError(ErrorsMessages.fileExist);
        ShowError(ErrorsMessages.fileExist);
        throw new Error();
    }
    fileDirectory = vscode.Uri.file(FullDir);

    // Snippet prep
    let Namespace: string = await Namespacer.createCSharpNamespace(
        fileDirectory
    );
    let Snippet: vscode.SnippetString = createSnippet(
        template[1].snippet,
        Namespace
    );

    // Actual file creation
    try {
        logger.logInfo('Creating file');
        await vscode.workspace.fs.writeFile(fileDirectory, new Uint8Array());
        const doc = await vscode.workspace.openTextDocument(fileDirectory);
        await vscode.window.showTextDocument(fileDirectory).then((editor) => {
            logger.logInfo('Inserting snippet');
            editor.insertSnippet(Snippet);
        });
        doc.save();
    } catch (error) {
        if (error instanceof Error) {
            logger.logError(error.message);
        }
    }
}

function createSnippet(
    text: string[],
    namespace: string | undefined
): vscode.SnippetString {
    let preSnippet = '';
    text.forEach((line) => {
        preSnippet += line + '\n';
    });
    if (namespace) {
        preSnippet = preSnippet.replace(/(\[namespace\])/, namespace);
    }
    return new vscode.SnippetString(preSnippet);
}

/**
 * Ask the user to select a template from the templates file
 * @returns the language and the template as two different objects
 */
async function selectTemplate(
    ctx: vscode.ExtensionContext,
    selectLang: string = '',
    selectTempl: string = ''
): Promise<usrSelection> {
    let selectedLang: Language | undefined;
    let selectedTemplate: Template | undefined;
    const options: vscode.QuickPickOptions = {
        placeHolder: 'Choose a language or template',
        canPickMany: false,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
    };

    // Language selection:
    if (selectLang === '') {
        const tempLanguage = await vscode.window.showQuickPick(
            all_languages.map((item): vscode.QuickPickItem => {
                const iconUri = vscode.Uri.file(
                    path.join(
                        ctx.extensionPath,
                        `/media/icons/langs/${item.extension}.svg`
                    )
                );
                return {
                    label: item.alias,
                    description: item.extension,
                    iconPath: iconUri,
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
    } else {
        logger.logInfo(
            `A language was already requested: '${selectLang}', skipping user intervention`
        );
        selectedLang = all_languages.find((lang) => lang.alias === selectLang);
    }

    if (selectedLang === undefined) {
        logger.logError('The requested language was not found!');
        throw new Error(ErrorsMessages.unexpected);
    }

    const temTemplate = await vscode.window.showQuickPick(
        selectedLang.templates.map((item): vscode.QuickPickItem => {
            let iconUri: vscode.Uri;
            if (item.extensionOverride) {
                iconUri = vscode.Uri.file(
                    path.join(
                        ctx.extensionPath,
                        `/media/icons/langs/${item.extensionOverride}.svg`
                    )
                );
            } else {
                iconUri = vscode.Uri.file(
                    path.join(
                        ctx.extensionPath,
                        `/media/icons/langs/${selectedLang.extension}.svg`
                    )
                );
            }
            let filename: string;
            if (item.extensionOverride) {
                filename = item.fileName + '.' + item.extensionOverride;
            } else {
                filename = item.fileName + '.' + selectedLang.extension;
            }
            return {
                label: item.alias,
                // detail: item.description,
                description: filename,
                iconPath: iconUri,
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
    newCSFile = `${extensionData.id}.newCSFile`,
    newCSClass = `${extensionData.id}.newCSClass`,
}

type usrSelection = [Language, Template];
