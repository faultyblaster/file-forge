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

        let dotnetProjects = await workspace.findFiles(
            this.dotnetProjects,
            this.excludePattern
        );

        let projectsAsRelatives = dotnetProjects.map((project): string => {
            return path.normalize(
                path.sep +
                    path.dirname(workspace.asRelativePath(project.fsPath))
            );
        });

        logger.logInfo(`Found ${dotnetProjects.length} dotnet projects`);
        projectsAsRelatives.forEach((x) => {
            logger.logInfo(`\t${x}`);
        });

        let fileBase = path.normalize(
            path.sep + path.dirname(workspace.asRelativePath(filePath))
        );

        logger.logInfo(`Relative file path '${fileBase}'`);

        let parent = projectsAsRelatives.find((project) =>
            fileBase.startsWith(project)
        );
        if (parent === undefined) {
            parent = path.sep;
        }
        if (parent !== '') {
            logger.logInfo(`parent: ${parent}`);
            const removeThis = path.dirname(parent);
            Namespace = fileBase.slice(removeThis.length);
        }
        logger.logInfo(`The namespace is: '${Namespace}' (un-validated)`);
        Namespace = this.validateNamespace(Namespace);
        logger.logInfo(`The namespace is: '${Namespace}' (validated)`);
        return Namespace;
    }
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
