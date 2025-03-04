import { window } from 'vscode';

export function ShowError(message: string) {
    window.showErrorMessage(message);
}
export function ShowInfo(message: string) {
    window.showInformationMessage(message);
}
