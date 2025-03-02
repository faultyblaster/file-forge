import {
    ExtensionContext,
    GlobPattern,
    QuickPickItem,
    Uri,
    window,
    workspace,
} from 'vscode';
import { logger } from '../extension';
import { ErrorsMessages } from '../logger/logger';
import path from 'path';

/**
 * The `Namespacer` class creates namespaces from paths
 */
export class Namespacer {
    // Include
    static dotnetProjects: GlobPattern = '**/*.{csproj,fsproj}';
    static dotnetFiles: GlobPattern = '**/*.{cs,fs}';

    static validNamespace = '[\\/]';

    // Exclude
    static excludePattern: GlobPattern =
        '**/{node_modules,bin,obj,dist,out,build,target,CMakeFiles,__pycache__,.venv,venv,.tox,.mypy_cache,.pytest_cache,.vscode,.idea,Debug,Release}/**';

    static async createCSharpNamespace(
        filePath: Uri | undefined,
        ctx: ExtensionContext
    ): Promise<string> {
        /**
         * Selects a C# or F# file in case no file was selected
         */
        if (filePath === undefined) {
            const files = await workspace.findFiles(
                this.dotnetFiles,
                this.excludePattern
            );
            if (files.length === 0) {
                throw new Error(ErrorsMessages.noFilesInWorkspace);
            }
            const fileItems = files.map((file) => {
                let fileExtension = path.extname(file.fsPath);
                fileExtension = fileExtension.replace('.', '');
                let fileIcon = Uri.file(
                    path.join(
                        ctx.extensionPath,
                        `/src/icons/langs/${fileExtension}.svg`
                    )
                );
                return {
                    label: path.basename(file.fsPath),
                    description: workspace.asRelativePath(file.fsPath),
                    iconPath: fileIcon,
                    uri: file,
                } as QuickPickItem & { uri: Uri };
            });

            const pickedFile = await window.showQuickPick(fileItems, {
                placeHolder: 'Please select a file',
            });
            if (pickedFile === undefined) {
                logger.logError(ErrorsMessages.cancelledByUser);
                throw new Error(ErrorsMessages.cancelledByUser);
            }
            filePath = pickedFile.uri;
        }

        logger.logInfo(`Creating a new namespace for ${filePath.fsPath}`);
        let Namespace: string = '';

        let dotnetProjects = await workspace.findFiles(
            this.dotnetProjects,
            this.excludePattern
        );

        let projectsAsRelatives = dotnetProjects.map((project): string => {
            return (
                path.sep +
                path.dirname(workspace.asRelativePath(project.fsPath))
            );
        });

        logger.logInfo(`Found ${dotnetProjects.length} dotnet projects`);
        projectsAsRelatives.forEach((x) => {
            logger.logInfo(`\t${x}`);
        });

        let fileBase =
            path.sep + path.dirname(workspace.asRelativePath(filePath));

        logger.logInfo(`Relative file path ${fileBase}`);

        let parent = projectsAsRelatives.find((project) =>
            fileBase.startsWith(project)
        );
        if (parent === undefined) {
            parent = '';
        }
        if (parent !== '') {
            logger.logInfo(`parent: ${parent}`);
            const removeThis = path.dirname(parent);
            Namespace = fileBase.slice(removeThis.length);
        }

        logger.logInfo(`The namespace is: ${Namespace}`);

        return Namespace;
    }
}
