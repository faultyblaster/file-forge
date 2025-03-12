import { window } from 'vscode';

export function ShowError(message: string) {
    window.showErrorMessage(message);
}
export function ShowInfo(message: string) {
    window.showInformationMessage(message);
}
export enum ErrorMessages {
    badWorkspace = 'No workspace is open! Please open a folder or workspace first',
    cancelledByUser = 'Process cancelled by the user',
    unexpected = 'An unexpected error has occur',
    fileExist = 'Too many attempts to create a file with the specified name, please select another name',
    noFilesInWorkspace = 'There are no compatibles files in the workspace',
    templateError = 'The template is empty or not valid',
}
