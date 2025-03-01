import { window } from 'vscode';

export function ShowError(message: string) {
    window.showErrorMessage(message);
}
