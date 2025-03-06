import {
    ExtensionContext,
    QuickPickItem,
    QuickPickOptions,
    Uri,
    window,
    SnippetString,
    workspace,
} from 'vscode';
import { all_languages, logger } from '../extension';
import { Language, Template } from '../templates/interface';
import path from 'path';
import { Namespacer } from './namespace';
import { ShowError } from './messages';
import * as fs from 'fs';
import { ErrorMessages } from '../loggerSystem/logger';

/**
 * Ask the user to select a template from the templates file
 * @returns the language and the template as two different objects
 */
export async function selectTemplate(
    ctx: ExtensionContext,
    selectLang: string | undefined,
    selectTempl: string | undefined
): Promise<usrSelection> {
    let selectedLang: Language | undefined;
    let selectedTemplate: Template | undefined;
    const options: QuickPickOptions = {
        placeHolder: 'Choose a language or template',
        canPickMany: false,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
    };

    // Language selection:
    if (selectLang === undefined) {
        logger.logInfo(
            `No language preselected! Asking the user for a language and template`
        );
        const tempLanguage = await window.showQuickPick(
            all_languages.map((item): QuickPickItem => {
                const iconUri = Uri.file(
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
            throw new Error(ErrorMessages.cancelledByUser);
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
        throw new Error(ErrorMessages.unexpected);
    }

    if (selectTempl === undefined) {
        logger.logInfo(
            `No template pre-requested! Asking the user to select a template`
        );
        const temTemplate = await window.showQuickPick(
            selectedLang.templates.map((item): QuickPickItem => {
                let iconUri: Uri;
                if (item.extensionOverride) {
                    iconUri = Uri.file(
                        path.join(
                            ctx.extensionPath,
                            `/media/icons/langs/${item.extensionOverride}.svg`
                        )
                    );
                } else {
                    iconUri = Uri.file(
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
            throw new Error(ErrorMessages.cancelledByUser);
        }
        selectedTemplate = selectedLang.templates.find(
            (templ) => templ.alias === temTemplate.label
        );
    } else {
        logger.logInfo(
            `A template was already requested: '${selectTempl}', skipping user intervention:`
        );
        selectedTemplate = selectedLang.templates.find(
            (templ) => templ.alias === selectTempl
        );
    }
    if (selectedTemplate === undefined) {
        logger.logError('The requested template was not found!');
        throw new Error(ErrorMessages.unexpected);
    }
    logger.logInfo(
        `Selected language: ${selectedLang.alias}:${selectedTemplate.alias}`
    );

    return [selectedLang, selectedTemplate];
}

export async function createFile(filePath: Uri, template: usrSelection) {
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
    let confirmedDir = await window.showInputBox({
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
        throw new Error(ErrorMessages.cancelledByUser);
    }
    // The path as a string
    FullDir = path.normalize(confirmedDir);
    // Uri of the file
    let fileDirectory = Uri.file(FullDir);
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
        logger.logError(ErrorMessages.fileExist);
        ShowError(ErrorMessages.fileExist);
        throw new Error();
    }
    fileDirectory = Uri.file(FullDir);

    // Snippet prep
    let Namespace: string = await Namespacer.createCSharpNamespace(
        fileDirectory
    );
    let Snippet: SnippetString = createSnippet(template[1].snippet, Namespace);

    // Actual file creation
    try {
        logger.logInfo('Creating file');
        await workspace.fs.writeFile(fileDirectory, new Uint8Array());
        const doc = await workspace.openTextDocument(fileDirectory);
        await window.showTextDocument(fileDirectory).then((editor) => {
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
): SnippetString {
    let preSnippet = '';
    text.forEach((line) => {
        preSnippet += line + '\n';
    });
    if (namespace) {
        preSnippet = preSnippet.replace(/(\[namespace\])/, namespace);
    }
    return new SnippetString(preSnippet);
}

/**
 * Makes sure the destination folder is defined and properly selected by the user
 * @param clicker if the command was called using the context menu, this will not be undefined
 * @returns a URI with a properly set destination
 */
export async function determinateDestination(
    clicker: Uri | undefined
): Promise<Uri> {
    const wsFolders = workspace.workspaceFolders;

    if (clicker) {
        return clicker;
    } else if (wsFolders === undefined) {
        throw new Error(ErrorMessages.badWorkspace);
    } else if (wsFolders.length === 1) {
        return wsFolders[0].uri;
    } else {
        let workingFolder = await window.showWorkspaceFolderPick();
        if (workingFolder === undefined) {
            throw new Error(ErrorMessages.cancelledByUser);
        }
        return workingFolder.uri;
    }
}

export type usrSelection = [Language, Template];
