import * as vscode from 'vscode';

/*  The class manages all the API keys used in this extension. 
    It contains getter and setter methods to access different API key.
*/
export class ApiKeyManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    // Getter for Gemini API key
    async getGeminiApiKey(): Promise<string | null> {
        // get API key store in secret
        const geminiApiKey = await this.context.secrets.get('geminiApiKey');
        // return Gemini API key if found else return null
        if (geminiApiKey !== undefined) {
            return geminiApiKey;
        } else {
            console.log('Gemini API key not found in secret storage.');
            return null; 
        }
    }

    // Setter for Gemini API key
    async setGeminiApiKey(): Promise<string | null> {
        // prompt user to enter their Gemini API key
        const apiKeyInput = await vscode.window.showInputBox({
            placeHolder: 'Enter your Gemini API key',
            password: true
        });

        // return null if the user did not enter an API key
        if (apiKeyInput === undefined) {
            vscode.window.showErrorMessage('No API key entered.');
            return null;
        }

        // store API key to secert storage
        await this.context.secrets.store('geminiApiKey', apiKeyInput);
        vscode.window.showInformationMessage('API key saved.');
        return apiKeyInput;
    }

    // Reset Gemini API key
    async resetGeminiApiKey(): Promise<string | null> {
        // If Gemini API key already store on local then show a user option to reset API key
        const action = await vscode.window.showQuickPick(['Reset API Key', 'Cancel'], {
            placeHolder: 'Gemini API found. However, do you want to reset your API key?',
        });
    
        if (action === 'Cancel') {
            return null;
        }
    
        if (action === 'Reset API Key') {
            // delete API key stored on local
            await this.context.secrets.delete('geminiApiKey');

            // Prompt user to enter their Gemini API key
            const resetApiKeyInput = await vscode.window.showInputBox({
                placeHolder: 'Enter your new Gemini API key',
                password: true,
            });

            // Return null if the user did not enter an API key
            if (resetApiKeyInput === undefined) {
                vscode.window.showErrorMessage('No API key entered.');
                return null;
            }

            await this.context.secrets.store('geminiApiKey', resetApiKeyInput);
            vscode.window.showInformationMessage('Gemini API key has been reset.');
            return resetApiKeyInput;
        }
        
        return null;
    
    }
    
}
