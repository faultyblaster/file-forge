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

    // Create cs file, no template pre-selection
    const createCSFile = vscode.commands.registerCommand(
        `${extensionData.id}.newCSFile`,
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
        `${extensionData.id}.newCSClass`,
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
        `${extensionData.id}.newCSEnum`,
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
        `${extensionData.id}.newCSInterface`,
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
        `${extensionData.id}.newCSRecord`,
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
        `${extensionData.id}.newCSStruct`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Struct'
            );
        }
    );

    // Create C# Global Usings
    const createCSGlobUsings = vscode.commands.registerCommand(
        `${extensionData.id}.newGlobalUsings`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'GlobalUsings'
            );
        }
    );

    // commands for typescript

    // Create ts file, no template pre-selection
    const createTSFile = vscode.commands.registerCommand(
        `${extensionData.id}.newTSFile`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'TypeScript'
            );
        }
    );

    // create ts class
    const createTSClass = vscode.commands.registerCommand(
        `${extensionData.id}.newTSClass`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'TypeScript',
                'class'
            );
        }
    );

    // create ts interface
    const createTSInterface = vscode.commands.registerCommand(
        `${extensionData.id}.newTSInterface`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'TypeScript',
                'interface'
            );
        }
    );

    // create ts enum
    const createTSEnum = vscode.commands.registerCommand(
        `${extensionData.id}.newTSEnum`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'TypeScript',
                'enum'
            );
        }
    );

    // create Python file, no template pre-selection
    const createPYFile = vscode.commands.registerCommand(
        `${extensionData.id}.newPYFile`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Python'
            );
        }
    );

    // create Python main
    const createPYMain = vscode.commands.registerCommand(
        `${extensionData.id}.newPYMain`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Python',
                'main'
            );
        }
    );

    // create Python requirements.txt
    const createPYRequirements = vscode.commands.registerCommand(
        `${extensionData.id}.newPYRequirements`,
        async (clicker: vscode.Uri) => {
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Python',
                'requirements'
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
        createCSStruct,
        createCSGlobUsings,
        // TypeScript files
        createTSFile,
        createTSClass,
        createTSInterface,
        createTSEnum,
        // Python files
        createPYFile,
        createPYMain,
        createPYRequirements
    );
}

/**
 * Names for the commands related to `File Creation`
 */
enum FileCreation {
    newFile = `${extensionData.id}.newFile`,
    newCustomFile = `${extensionData.id}.newCustomFile`,
}
