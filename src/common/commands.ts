import * as vscode from 'vscode';
import { extensionData, logger } from '../extension';
import { ShowError, ShowInfo } from './messages';
import { Namespacer } from './namespace';
import {
    createFile,
    determinateDestination,
    selectTemplate,
    usrSelection,
} from './command-helper';

/**
 * Register all the commands to vs code
 * @param ctx The vs code context variable
 */
export function registerCommands(ctx: vscode.ExtensionContext) {
    // Basic default command
    const createNewFile = vscode.commands.registerCommand(
        FileCreation.newFile,
        async (
            clicker: vscode.Uri,
            lang: string | undefined,
            temp: string | undefined
        ) => {
            let destinyInitialPath: vscode.Uri;
            logger.logInfo(`File creation process initiated`);
            if (typeof lang !== 'string') {
                lang = undefined;
            }
            if (typeof temp !== 'string') {
                temp = undefined;
            }
            try {
                destinyInitialPath = await determinateDestination(clicker);
                logger.logInfo(
                    `File requested initially at: ${destinyInitialPath.fsPath}. lang: ${lang} temp: ${temp}`
                );
                let selectedTemplate: usrSelection = await selectTemplate(
                    ctx,
                    lang,
                    temp
                );
                await createFile(destinyInitialPath, selectedTemplate);
                logger.logInfo(
                    'File creation process finished! No issues reported\n'
                );
            } catch (error) {
                if (error instanceof Error) {
                    logger.logError(error.message);
                    ShowError(error.message);
                }
                logger.logError(
                    'File creation process cancelled! Errors were found :(\n'
                );
            }
        }
    );

    // Commands related to Dotnet

    // Namespace fix
    const createCSharpNamespace = vscode.commands.registerCommand(
        `${extensionData.id}.createCSharpNamespace`,
        async (clicker: vscode.Uri) => {
            let ns = await Namespacer.createCSharpNamespace(clicker);
            let nsLine = `namespace ${ns};`;
            vscode.env.clipboard.writeText(nsLine);
            ShowInfo(`The namespace is now on your clipboard:\n ${ns}`);
        }
    );

    // File specific commands: Creating a specific file, skipping the selectTemplate part
    const createCSFile = vscode.commands.registerCommand(
        FileCreation.newCSFile,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#'
            );
        }
    );

    // Create C# Class
    const createCSClass = vscode.commands.registerCommand(
        FileCreation.newCSClass,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Class'
            );
        }
    ); // Create C# Enum
    const createCSEnum = vscode.commands.registerCommand(
        FileCreation.newCSEnum,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Enum'
            );
        }
    );
    // Create C# Interface
    const createCSInterface = vscode.commands.registerCommand(
        FileCreation.newCSInterface,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Interface'
            );
        }
    );
    // Create C# Record
    const createCSRecord = vscode.commands.registerCommand(
        FileCreation.newCSRecord,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Record'
            );
        }
    );
    // Create C# Struct
    const createCSStruct = vscode.commands.registerCommand(
        FileCreation.newCSStruct,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Struct'
            );
        }
    );

    ctx.subscriptions.push(
        createNewFile,
        createCSharpNamespace,
        // C# files
        createCSFile,
        createCSClass,
        createCSEnum,
        createCSInterface,
        createCSRecord,
        createCSStruct
    );
}

/**
 * Names for the commands related to `File Creation`
 */
enum FileCreation {
    newFile = `${extensionData.id}.newFile`,
    newCustomFile = `${extensionData.id}.newCustomFile`,
    newCSFile = `${extensionData.id}.newCSFile`,
    newCSClass = `${extensionData.id}.newCSClass`,
    newCSEnum = `${extensionData.id}.newCSEnum`,
    newCSInterface = `${extensionData.id}.newCSInterface`,
    newCSRecord = `${extensionData.id}.newCSRecord`,
    newCSStruct = `${extensionData.id}.newCSStruct`,
}
