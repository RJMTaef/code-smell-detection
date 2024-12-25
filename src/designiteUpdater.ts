import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as https from 'https';

/**
 * Handles downloading and managing Designite Java JAR file.
 * Keeps track of installations and provides access to the JAR file.
 */
export class DesigniteUpdater {
    // Paths for storing Designite Java files
    private designiteHome: string;      // Main directory for Designite files
    private jarPath: string;            // Path to downloaded JAR file
    private bundledPath: string;        // Path to bundled JAR file that comes with extension
    
    // Tracks if we've checked for updates in current VS Code session
    private static hasCheckedThisSession = false;
    
    // URL to download latest Designite Java Professional Edition
    private DESIGNITE_URL = 'https://www.designite-tools.com/assets/DesigniteJava.jar';

    constructor() {
        // Set up file paths - store downloads in user's home directory
        this.designiteHome = path.join(process.env.HOME || process.env.USERPROFILE || "", '.designite-java');
        this.jarPath = path.join(this.designiteHome, 'DesigniteJava.jar');
        this.bundledPath = path.resolve(__dirname, "../resources/DesigniteJava.jar");
    }

    /**
     * Gets path to Designite Java JAR file.
     * Checks downloaded version first, then falls back to bundled version.
     */
    public getDesignitePath(): string | null {
        if (fs.existsSync(this.jarPath)) {
            return this.jarPath;
        }
        if (fs.existsSync(this.bundledPath)) {
            return this.bundledPath;
        }
        return null;
    }

    /**
     * Downloads a file from given URL to specified path.
     * Used to download latest version of Designite Java.
     */
    private async downloadFile(url: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(outputPath);
            https.get(url, (response) => {
                // Check if download was successful
                if (response.statusCode !== 200) {
                    reject(new Error(`Download failed with status ${response.statusCode}`));
                    return;
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                file.on('error', (err) => {
                    fs.unlink(outputPath, () => reject(err));
                });
            }).on('error', (err) => {
                fs.unlink(outputPath, () => reject(err));
            });
        });
    }

    /**
     * Main update function. Checks for and downloads latest version if needed.
     * Shows status messages only on first check of VS Code session.
     */
    public async updateDesignite(): Promise<boolean> {
        const isFirstCheck = !DesigniteUpdater.hasCheckedThisSession;
        DesigniteUpdater.hasCheckedThisSession = true;

        try {
            // Create storage directory if it doesn't exist
            if (!fs.existsSync(this.designiteHome)) {
                fs.mkdirSync(this.designiteHome, { recursive: true });
            }

            // Download new version if no existing installation found
            if (!fs.existsSync(this.jarPath) && !fs.existsSync(this.bundledPath)) {
                if (isFirstCheck) {
                    vscode.window.showInformationMessage('Downloading Designite Java...');
                }
                
                try {
                    await this.downloadFile(this.DESIGNITE_URL, this.jarPath);
                    if (isFirstCheck) {
                        vscode.window.showInformationMessage('Designite Java downloaded successfully!');
                    }
                    return true;
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    vscode.window.showErrorMessage('Failed to download Designite Java. Please check your internet connection.');
                    return false;
                }
            }
            
            // Use existing downloaded version if available
            if (fs.existsSync(this.jarPath)) {
                if (isFirstCheck) {
                    vscode.window.showInformationMessage('Using the latest version of Designite Java.');
                }
                return true;
            }
            
            // Fall back to bundled version if available
            if (fs.existsSync(this.bundledPath)) {
                if (isFirstCheck) {
                    vscode.window.showInformationMessage('Using bundled version of Designite Java.');
                }
                return true;
            }

            vscode.window.showErrorMessage('Could not find or download Designite Java.');
            return false;

        } catch (error) {
            console.error('Update error:', error);
            vscode.window.showErrorMessage('Error managing Designite Java.');
            return false;
        }
    }
}
