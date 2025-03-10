import * as vscode from 'vscode';
import * as DefaultTemplates from './templates/default_templates.json';
import { Language } from './templates/interface';
import { registerCommands } from './common/commands';
import { Watcher } from './systems/watcher';
import { VsLogger } from 'vs-logger';

/**
 * Important extension data available globally to avoid typos.
 */
export enum extensionData {
    id = 'templator',
    name = 'Templator',
}

/**
 * the `logger` will help to display the user all the important information, in a output channel, directly on vscode.
 */
export const logger = new VsLogger(extensionData.id);
export const watcher = new Watcher();

/**
 * Holds all the default languages information, as an array, it also contains all the snippets.
 */
export let all_languages: Language[];

// Extension activation and initialization
export async function activate(context: vscode.ExtensionContext) {
    readTemplates();
    registerCommands(context);
    logger.logInfo(`Extension '${extensionData.id}' successfully activated!`);

    // Doing post initialization stuff
    setImmediate(postStart);
}

function postStart() {
    watcher.startWatchers();
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
