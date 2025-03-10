import { GlobPattern, Uri, workspace } from 'vscode';
import { logger } from '../extension';
import path from 'path';

/**
 * The `Namespacer` class creates namespaces from paths
 */
export class Namespacer {
    // Include
    static dotnetProjects: GlobPattern = '**/*.{csproj,fsproj}';
    static dotnetFiles: GlobPattern = '**/*.{cs,fs}';

    static invalidChars = /[^\w/\\]+/g;
    static allPathSep = /[\\/]+/g;

    // Exclude
    static excludePattern: GlobPattern =
        '**/{node_modules,bin,obj,dist,out,build,target,CMakeFiles,__pycache__,.venv,venv,.tox,.mypy_cache,.pytest_cache,.vscode,.idea,Debug,Release}/**';

    static async createCSharpNamespace(filePath: Uri): Promise<string> {
        logger.logInfo(`Creating a new namespace for '${filePath.fsPath}'`);
        let Namespace: string = '';
        let dotnetProjectsURIs = await workspace.findFiles(
            this.dotnetProjects,
            this.excludePattern
        );
        let dotnetProjects = dotnetProjectsURIs.map((project): string => {
            return path.normalize(
                path.join(
                    workspace.name ? workspace.name : 'unnamed_workspace',
                    path.dirname(workspace.asRelativePath(project.fsPath))
                )
            );
        });
        dotnetProjects.forEach((x) => {
            logger.logInfo(`\t${x}`);
        });

        // Getting the location of the file
        let fileDir = path.join(
            workspace.name ? workspace.name : 'unnamed_workspace',
            path.dirname(workspace.asRelativePath(filePath))
        );
        fileDir = fileDir.normalize();
        if (fileDir.endsWith(`${path.sep}.`)) {
            fileDir = fileDir.slice(0, -2);
        }
        logger.logInfo(`File path: ${fileDir}`);

        let parent = dotnetProjects.find((project) =>
            fileDir.startsWith(project)
        );
        if (parent === undefined) {
            parent = path.join(
                workspace.name ? workspace.name : 'unnamed_workspace'
            );
        }

        let partToRemove = path.dirname(parent);
        let remCount = partToRemove === '.' ? 0 : partToRemove.length;
        logger.logInfo(
            `Parent: '${parent}' | removing '${partToRemove}':'${remCount}' chars`
        );
        Namespace = fileDir.slice(remCount);
        Namespace = this.validateNamespace(Namespace);
        logger.logInfo(`The namespace is: '${Namespace}'`);
        return Namespace;
    }

    /**
     * Create a namespace from a string, expected a valid path
     * @param prospect A string in a form of a path
     * @returns a namespace with only letters, numbers and . (periods)
     */
    static validateNamespace(prospect: string): string {
        prospect = prospect.replace(this.invalidChars, '');
        prospect = prospect.replace(this.allPathSep, '.');
        if (prospect.startsWith('.')) {
            prospect = prospect.substring(1);
        }
        if (prospect.endsWith('.')) {
            prospect = prospect.slice(0, -1);
        }

        return prospect;
    }
}
