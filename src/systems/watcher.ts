import { commands, GlobPattern, Uri, workspace } from 'vscode';
import { extensionData, logger } from '../extension';

export class Watcher {
    // show ctx menu for csharp files
    showCSContext: boolean = false;
    // show ctx menu for typescript files
    showTSContext: boolean = false;
    // show ctx menu for javascript files
    showJSContext: boolean = false;
    // show ctx menu for python files
    showPYContext: boolean = false;
    // show ctx menu for cpp files
    showCPPContext: boolean = false;

    // Csproj file watcher
    private csprojWatcher = workspace.createFileSystemWatcher('**/*.csproj');

    // typescript file watcher
    private tsWatcher = workspace.createFileSystemWatcher('**/*.ts');

    // javascript file watcher
    // private jsWatcher = workspace.createFileSystemWatcher('**/*.js');

    // python file watcher
    private pyWatcher = workspace.createFileSystemWatcher('**/*.py');

    // cpp file watcher
    private cppWatcher = workspace.createFileSystemWatcher('**/*.cpp');

    // exclude patterns for ts, js, py, cpp, dotnet and rust environments
    private excludePatterns: GlobPattern =
        '**/{node_modules,bin,obj,dist,out,build,target,CMakeFiles,__pycache__,.venv,venv,.tox,.mypy_cache,.pytest_cache,.vscode,.idea,Debug,Release}/**';

    constructor() {
        logger.logInfo('Initializing watcher system');
    }
    // Once at least one file is created, show the context menu, disable the watcher
    /**
     * Enable the context menu for csharp files
     */
    enableCsContext() {
        this.showCSContext = true;
        this.csprojWatcher.dispose();
        commands.executeCommand(
            'setContext',
            `${extensionData.id}.showCSharpContext`,
            true
        );
        logger.logInfo('\tcs context enabled');
    }

    /**
     * Enable the context menu for typescript files
     */
    enableTSContext() {
        this.showTSContext = true;
        this.tsWatcher.dispose();
        commands.executeCommand(
            'setContext',
            `${extensionData.id}.showTSContext`,
            true
        );
        logger.logInfo('\tts context enabled');
    }

    /**
     * Enable the context menu for python files
     */
    enablePYContext() {
        this.showPYContext = true;
        this.pyWatcher.dispose();
        commands.executeCommand(
            'setContext',
            `${extensionData.id}.showPYContext`,
            true
        );
        logger.logInfo('\tpy context enabled');
    }

    /**
     * Enable the context menu for cpp files
     */
    enableCPPContext() {
        this.showCPPContext = true;
        this.cppWatcher.dispose();
        commands.executeCommand(
            'setContext',
            `${extensionData.id}.showCPPContext`,
            true
        );
        logger.logInfo('\tcpp context enabled');
    }

    // Check for initial files
    async checkForInitialFiles() {
        this.checkForCSProjFiles();
        this.checkForTSFiles();
        this.checkForPYFiles();
        this.checkForCPPFiles();
    }
    checkForCSProjFiles() {
        // Check for csproj files already in the workspace
        workspace
            .findFiles('**/*.csproj', this.excludePatterns, 100)
            .then((files: Uri[]) => {
                if (files.length > 0) {
                    logger.logInfo(`Found ${files.length} csproj files`);
                    this.enableCsContext();
                }
            });
    }
    checkForTSFiles() {
        // Check for ts files already in the workspace
        workspace
            .findFiles('**/*.ts', this.excludePatterns, 100)
            .then((files: Uri[]) => {
                if (files.length > 0) {
                    logger.logInfo(`Found ${files.length} ts files`);
                    this.showTSContext = true;
                    this.enableTSContext();
                }
            });
    }
    checkForPYFiles() {
        // Check for py files already in the workspace
        workspace
            .findFiles('**/*.py', this.excludePatterns, 100)
            .then((files: Uri[]) => {
                if (files.length > 0) {
                    logger.logInfo(`Found ${files.length} py files`);
                    this.showPYContext = true;
                    this.enablePYContext();
                }
            });
    }
    checkForCPPFiles() {
        // Check for cpp files already in the workspace
        workspace
            .findFiles('**/*.cpp', this.excludePatterns, 100)
            .then((files: Uri[]) => {
                if (files.length > 0) {
                    logger.logInfo(`Found ${files.length} cpp files`);
                    this.showCPPContext = true;
                    this.enableCPPContext();
                }
            });
    }

    /**
     * Start the file watchers for csproj, ts, py and cpp files
     */
    startWatchers() {
        logger.logInfo('Starting watchers');
        logger.logInfo('Checking for initial files');
        this.checkForInitialFiles();
        logger.logInfo('Checking for initial files done');

        if (this.showCSContext) {
            logger.logInfo('Enabling cs context');
            this.enableCsContext();
        } else {
            logger.logInfo('Starting csproj watcher');
            this.csprojWatcher.onDidCreate((uri) => {
                logger.logInfo(`New csproj file created: ${uri.fsPath}`);
                this.showCSContext = true;
                this.enableCsContext();
            });
        }
        if (this.showTSContext) {
            logger.logInfo('Enabling ts context');
            this.enableTSContext();
        } else {
            logger.logInfo('Starting ts watcher');
            this.tsWatcher.onDidCreate((uri) => {
                logger.logInfo(`New ts file created: ${uri.fsPath}`);
                this.showTSContext = true;
                this.enableTSContext();
            });
        }
        if (this.showPYContext) {
            logger.logInfo('Enabling py context');
            this.enablePYContext();
        } else {
            logger.logInfo('Starting py watcher');
            this.pyWatcher.onDidCreate((uri) => {
                logger.logInfo(`New py file created: ${uri.fsPath}`);
                this.showPYContext = true;
                this.enablePYContext();
            });
        }
        if (this.showCPPContext) {
            logger.logInfo('Enabling cpp context');
            this.enableCPPContext();
        } else {
            logger.logInfo('Starting cpp watcher');
            this.cppWatcher.onDidCreate((uri) => {
                logger.logInfo(`New cpp file created: ${uri.fsPath}`);
                this.showCPPContext = true;
                this.enableCPPContext;
            });
        }
    }
}
