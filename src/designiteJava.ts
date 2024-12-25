import CodeSmellDetector from "./codeSmellDetectorInterface";
import { ApiKeyManager } from "./utils/apiKeyManager";
import { exec } from "child_process";
import * as path from "path";
import { DesigniteUpdater } from "./designiteUpdater";


/*  The class is a subclass of CodeSmellDector. 
    It contains method to trigger Designite Java to run diagnosis on java file(s) and 
    store output files in folder named "DesigniteOutput" which is located in the same folder as the analysed java file(s).
*/
class DesigniteJava extends CodeSmellDetector {
  // intiate API key variable
  private apiKeyManager: ApiKeyManager;

  private updater: DesigniteUpdater;

  // constructor of designite java class and assign the API key
  constructor(apiKeyManager: ApiKeyManager) {
    super();
    this.apiKeyManager = apiKeyManager;
    this.updater = new DesigniteUpdater();
  }

  /**
   * This function triggers Designite Java through designite_java.py.
   *
   * @param {string} folderPath
   * @returns {Promise<string>}
   */
  async runDetector(folderPath: string): Promise<string> {
    try {
      // retrieve the API key
      const apiKey = await this.apiKeyManager.getGeminiApiKey();

      // tf no API key, try set it
      if (!apiKey) {
        const newApiKey = await this.apiKeyManager.setGeminiApiKey();
        if (!newApiKey) {
          throw new Error("API key is required to run the detector.");
        }
      }

      // Make sure we have working Designite Java installation
      await this.updater.updateDesignite();

      const designitePath = path.resolve(
        __dirname,
        "../src/backend/designite_java.py",
      ); // path to python file that triggers Designite Java
      const outputPath = path.join(folderPath, "DesigniteOutput"); // path to store Designite Java output
      const djPath = this.updater.getDesignitePath(); // path to Designite Java JAR file

      // Make sure we found Designite Java
      if (!djPath) {
        throw new Error('Designite Java path not found');
      }

      const command = `python3 ${designitePath} ${folderPath} ${outputPath} ${djPath}`; // command to run designite_java.py

      // run 'command'
      return await new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            reject(`stderr: ${stderr}`);
            return;
          }
          resolve(stdout);
        });
      });
    } catch (error) {
      throw error;
    }
  }
}

export default DesigniteJava;
