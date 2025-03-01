import * as vscode from 'vscode';
import { all_languages, extensionData, logger } from '../extension';
import { ErrorsMessages } from '../logger/logger';
import { ShowError } from '../messages';
import { Language, Template } from '../templates/interface';

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
                let selectedTemplate = await selectTemplate(undefined);
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

async function createFileHere(path: vscode.Uri, template: usrSelection) {
    // TODO
    logger.logInfo(`Creating file at ${path.fsPath} with ${template[0].alias}`);
}

async function selectTemplate(
    requested: string | undefined
): Promise<usrSelection> {
    // TODO: Prompt the user to select a template, and returns that selection as a Selection Type
    if (requested) {
        logger.logInfo(
            `Requested the following language:template : ${requested}`
        );
    }
    logger.logInfo('No requested template, asking user');
    return [all_languages[0], all_languages[0].templates[0]];
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
