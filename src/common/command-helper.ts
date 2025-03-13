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
import { Language, Template } from '../templates/template-definition';
import path from 'path';
import { Namespacer } from '../systems/namespacer';
import { ErrorMessages, ShowError } from './messages';
import * as fs from 'fs';

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
            all_languages
                .map((item) => {
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
                        id: item.id,
                    } as QuickPickItem & {
                        id: string;
                    };
                })
                .sort((a, b) => {
                    return a.label.localeCompare(b.label);
                }),
            options
        );
        if (tempLanguage === undefined) {
            throw new Error(ErrorMessages.cancelledByUser);
        }
        selectedLang = all_languages.find(
            (lang) => lang.id === tempLanguage.id
        );
    } else {
        logger.logInfo(
            `A language was already requested: '${selectLang}', skipping user intervention`
        );
        selectedLang = all_languages.find((lang) => lang.id === selectLang);
    }

    if (selectedLang === undefined) {
        logger.logError(
            `The requested language (${selectLang}) was not found!`
        );
        throw new Error(ErrorMessages.unexpected);
    }

    if (selectTempl === undefined) {
        logger.logInfo(
            `No template pre-requested! Asking the user to select a template`
        );

        // Template mapping
        let languageTemplateItems = selectedLang.templates
            .map((item) => {
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
                    description: filename,
                    iconPath: iconUri,
                    id: item.id,
                } as QuickPickItem & {
                    id: string;
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });

        // Template selection:
        const temTemplate = await window.showQuickPick(
            languageTemplateItems,
            options
        );
        if (temTemplate === undefined) {
            throw new Error(ErrorMessages.cancelledByUser);
        }
        selectedTemplate = selectedLang.templates.find(
            (templ) => templ.id === temTemplate.id
        );
    } else {
        logger.logInfo(
            `A template was already requested: '${selectTempl}', skipping user intervention:`
        );
        selectedTemplate = selectedLang.templates.find(
            (templ) => templ.id === selectTempl
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

/**
 * Creates a file at the given path using the selected template
 * @param filePath the path where the file will be created
 * @param template the template to be used for the file creation
 */
export async function createFile(filePath: Uri, template: usrSelection) {
    // Stop the process if we are not in a workspace
    const wsFolders = workspace.workspaceFolders;
    if (wsFolders === undefined) {
        logger.logError(ErrorMessages.badWorkspace);
        throw new Error(ErrorMessages.badWorkspace);
    }
    logger.logInfo(`Creating file at ${filePath.fsPath}`);
    let FullDir = '';
    let filename = template[1].fileName;
    let fileExtension = template[1].extensionOverride
        ? template[1].extensionOverride
        : template[0].extension;

    // The dir where the file will be created, where the workspace is located
    let externalFilePath: string = wsFolders.filter((folder) => {
        return filePath.fsPath.startsWith(folder.uri.fsPath);
    })[0].uri.fsPath;
    externalFilePath = path.normalize(externalFilePath);
    if (externalFilePath === '.') {
        externalFilePath = '';
    }
    logger.logInfo(`External file path: ${externalFilePath}`);

    // The dir where the file will be created, inside the workspace
    let localePath = filePath.fsPath.replace(externalFilePath, '');
    localePath = path.normalize(localePath);
    if (localePath === '.') {
        localePath = '';
    }
    logger.logInfo(`Locale file path: ${localePath}`);

    logger.logInfo(`File path: ${filePath.fsPath}`);
    logger.logInfo(`Current workspace: ${externalFilePath}`);

    let confirmedDir = await window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Enter your file name, and confirm the directory',
        title: 'Enter your file name',
        value: path.join(localePath, filename + '.' + fileExtension),
        valueSelection: [
            localePath.length === 0 ? 0 : localePath.length + 1,
            localePath.length +
                filename.length +
                (localePath.length > 0 ? 1 : 0),
        ],
        validateInput: (input) => {
            // Check for invalid characters in a path
            const regex = /[<>"|?:*\x00-\x1F]/g;
            const invalidChars = input.match(regex);
            if (invalidChars) {
                return `The following characters are not allowed in a path: '${invalidChars.join(
                    ', '
                )}'. Please remove them.`;
            }

            // Check for only white spaces
            const onlySpaces = /^\s*$/;
            if (onlySpaces.test(input)) {
                return 'The input cannot be empty or only contain spaces.';
            }

            // Check if the path contains a relative path (e.g. "..")
            const relativePath = /(\.\.\/|\.\.\\)/;
            if (relativePath.test(input)) {
                return 'Relative paths are not allowed. Please provide an absolute path.';
            }

            // At the end, return null to indicate that the input is valid
            return null;
        },
    });

    if (confirmedDir === undefined) {
        logger.logWarning(`Process cancelled by user`);
        throw new Error(ErrorMessages.cancelledByUser);
    }
    confirmedDir = path.join(externalFilePath, confirmedDir);
    FullDir = path.normalize(confirmedDir);
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
    if (template[1].snippet === undefined) {
        logger.logError('The snippet is empty!');
        throw new Error(ErrorMessages.templateError);
    }
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

/**
 * Creates a snippet string from a array of strings
 * @param text the array of strings to be converted into a snippet
 * @param namespace in case the snippet has a namespace, it will be replaced by this value
 * @returns a SnippetString object `vscode.SnippetString`
 */
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
// export async function determinateDestination(
//     clicker: Uri | undefined
// ): Promise<Uri> {

//     if (clicker !== undefined) {
//         logger.logInfo(`The command was called from the context menu`);
//         return clicker;
//     } else if (wsFolders === undefined) {
//         throw new Error(ErrorMessages.badWorkspace);
//     } else if (wsFolders.length === 1) {
//         return wsFolders[0].uri;
//     } else {
//         let workingFolder = await window.showWorkspaceFolderPick();
//         if (workingFolder === undefined) {
//             throw new Error(ErrorMessages.cancelledByUser);
//         }
//         return workingFolder.uri;
//     }
// }

export type usrSelection = [Language, Template];
