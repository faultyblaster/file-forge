import * as vscode from 'vscode';
import { extensionData, logger } from '../extension';
import { ShowError, ShowInfo } from './messages';
import { Namespacer } from '../systems/namespacer';
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
            logger.logInfo('Creating a new C# file');
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
            logger.logInfo('Creating a new C# class');
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
            logger.logInfo('Creating a new C# enum');
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
            logger.logInfo('Creating a new C# interface');
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
            logger.logInfo('Creating a new C# record');
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
            logger.logInfo('Creating a new C# struct');
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
        `${extensionData.id}.newCsGlobalUsings`,
        async (clicker: vscode.Uri) => {
            logger.logInfo('Creating a new C# Global Usings file');
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'C#',
                'Global Usings'
            );
        }
    );

    // commands for typescript

    // Create ts file, no template pre-selection
    const createTSFile = vscode.commands.registerCommand(
        `${extensionData.id}.newTSFile`,
        async (clicker: vscode.Uri) => {
            logger.logInfo('Creating a new TypeScript file');
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
            logger.logInfo('Creating a new TypeScript class');
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
            logger.logInfo('Creating a new TypeScript interface');
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
            logger.logInfo('Creating a new TypeScript enum');
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
            logger.logInfo('Creating a new Python file');
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
            logger.logInfo('Creating a new Python main file');
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
            logger.logInfo('Creating a new Python requirements file');
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Python',
                'requirements'
            );
        }
    );

    // Language agnostic commands, files such as json, xml, markdown, csv, etc
    const createJsonFile = vscode.commands.registerCommand(
        `${extensionData.id}.newJsonFile`,
        async (clicker: vscode.Uri) => {
            logger.logInfo('Creating a new JSON file');
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Other',
                'json'
            );
        }
    );
    const createXmlFile = vscode.commands.registerCommand(
        `${extensionData.id}.newXmlFile`,
        async (clicker: vscode.Uri) => {
            logger.logInfo('Creating a new XML file');
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Other',
                'xml'
            );
        }
    );
    const createMdFile = vscode.commands.registerCommand(
        `${extensionData.id}.newMarkdownFile`,
        async (clicker: vscode.Uri) => {
            logger.logInfo('Creating a new Markdown file');
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Other',
                'markdown'
            );
        }
    );
    const createSCVFile = vscode.commands.registerCommand(
        `${extensionData.id}.newCSVFile`,
        async (clicker: vscode.Uri) => {
            logger.logInfo('Creating a new CSV file');
            vscode.commands.executeCommand(
                `${FileCreation.newFile}`,
                clicker,
                'Other',
                'csv'
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
        createPYRequirements,
        // Other files
        createJsonFile,
        createXmlFile,
        createMdFile,
        createSCVFile
    );
}

/**
 * Names for the commands related to `File Creation`
 */
enum FileCreation {
    newFile = `${extensionData.id}.newFile`,
    newCustomFile = `${extensionData.id}.newCustomFile`,
}
