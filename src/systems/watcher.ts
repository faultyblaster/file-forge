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
    showCppContext: boolean = false;

    // Csproj file watcher
    private csprojWatcher = workspace.createFileSystemWatcher(
        '**/*.{csproj,cs,sln}'
    );
    // typescript file watcher
    private tsWatcher = workspace.createFileSystemWatcher('**/*.ts');
    // python file watcher
    private pyWatcher = workspace.createFileSystemWatcher('**/*.py');
    // cpp file watcher
    private cppWatcher = workspace.createFileSystemWatcher('**/*.cpp');
    // TODO: Implement the following watchers
    // javascript file watcher
    // private jsWatcher = workspace.createFileSystemWatcher('**/*.js');

    // exclude patterns for ts, js, py, cpp, dotnet and rust environments
    private excludePatterns: GlobPattern =
        '**/{node_modules,bin,obj,dist,out,build,target,CMakeFiles,__pycache__,.venv,venv,.tox,.mypy_cache,.pytest_cache,.vscode,.idea,Debug,Release}/**';

    constructor() {
        logger.logInfo('Initializing watcher system');
    }

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
    // TODO: Add CPP commands and context entries
    enableCPPContext() {
        this.showCppContext = true;
        this.cppWatcher.dispose();
        commands.executeCommand(
            'setContext',
            `${extensionData.id}.showCppContext`,
            true
        );
        logger.logInfo('\tcpp context enabled');
    }

    /**
     * Check for initial files in the workspace, if any, enable the context menu
     */
    checkForInitialFiles() {
        this.checkForCSProjFiles();
        this.checkForTSFiles();
        this.checkForPYFiles();
        this.checkForCPPFiles();
        logger.logInfo('\tInitial files checked');
    }
    /**
     * Check for sln, csproj or cs files in the workspace, if any, enable the context menu, disable the watcher and set the `showCSContext` to true
     */
    checkForCSProjFiles(): void {
        workspace
            .findFiles('**/*.{sln,cs,csproj}', this.excludePatterns, 100)
            .then((files: Uri[]) => {
                if (files.length > 0) {
                    logger.logInfo(
                        `Found ${files.length} sln, csproj or cs files`
                    );
                    this.enableCsContext();
                }
            });
    }
    /**
     * Check for ts files in the workspace, if any, enable the context menu, disable the watcher and set the `showTSContext` to true
     */
    checkForTSFiles() {
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
    /**
     * Check for py files in the workspace, if any, enable the context menu, disable the watcher and set the `showPYContext` to true
     */
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
    /**
     * Check for cpp files in the workspace, if any, enable the context menu, disable the watcher and set the `showCppContext` to true
     */
    checkForCPPFiles() {
        // Check for cpp files already in the workspace
        workspace
            .findFiles('**/*.cpp', this.excludePatterns, 100)
            .then((files: Uri[]) => {
                if (files.length > 0) {
                    logger.logInfo(`Found ${files.length} cpp files`);
                    this.showCppContext = true;
                    this.enableCPPContext();
                }
            });
    }

    /**
     * Start the file watchers for csproj, ts, py and cpp files
     */
    startWatchers() {
        logger.logInfo('Starting watchers for all available file types');

        this.csprojWatcher.onDidCreate((uri) => {
            logger.logInfo(`New csproj file created: ${uri.fsPath}`);
            this.showCSContext = true;
            this.enableCsContext();
        });
        logger.logInfo('Starting ts watcher');
        this.tsWatcher.onDidCreate((uri) => {
            logger.logInfo(`New ts file created: ${uri.fsPath}`);
            this.showTSContext = true;
            this.enableTSContext();
        });
        logger.logInfo('Starting py watcher');
        this.pyWatcher.onDidCreate((uri) => {
            logger.logInfo(`New py file created: ${uri.fsPath}`);
            this.showPYContext = true;
            this.enablePYContext();
        });
        logger.logInfo('Starting cpp watcher');
        this.cppWatcher.onDidCreate((uri) => {
            logger.logInfo(`New cpp file created: ${uri.fsPath}`);
            this.showCppContext = true;
            this.enableCPPContext;
        });

        logger.logInfo('Watchers started, checking for initial files');
        this.checkForInitialFiles();
    }
}
