import { spawn } from "child_process";
import * as vscode from "vscode";
import * as fs from 'fs';
const path = require("path");

/*  The class is a subclass of CodeSmellDector. 
    It contains method to trigger Designite Java to run diagnosis on java file(s) and 
    store output files in folder named "DesigniteOutput" which is located in the same folder as the analysed java file(s).
*/
export class PythonRunner {

    // Function to run a Python script to get line numbers and return its output as a string
    async runPythonScript({
        scriptPath,
        editor,
    }: {
    scriptPath: string;
    editor: vscode.TextEditor;
    }): Promise<string> {
    return new Promise((resolve, reject) => {
      // path to stored Designite Java output
      const targetFolder = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : null;
      const outputPath = path.join(
        targetFolder,
        "DesigniteOutput/ImplementationSmells.json",
      ); 
      // get file name of the file open on the editor
      const fileName = path.basename(editor.document.fileName, path.extname(editor.document.fileName));

      // Spawn a new process to run the json_extractor.py Python script
      const pythonProcess = spawn("python3", [scriptPath, outputPath, fileName]);
      let output = "";

      // Listen for data from the Python script's output
      pythonProcess.stdout.on("data", (data) => {
        // Append data from stdout to the output string
        output += data.toString();
      });

      // Listen for errors from the Python script's standard error
      pythonProcess.stderr.on("data", (data) => {
        // Log the error
        console.error(`Error: ${data}`);
        // Reject the promise with the error message
        reject(data.toString());
      });

      // Listen for the Python script's process close event
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          // If the script exited successfully, resolve the promise with the output
          resolve(output);
        } else {
          // If the script exited with an error code, reject the promise with an error message
          reject(`Process exited with code: ${code}`);
        }
      });
    });
    }

    // Function to parse the output from the Python script and extract line numbers
    parseLinesFromOutput(output: string): number[] {
    try {
      // Parse the JSON output directly
      const lines = JSON.parse(output);

      // Convert each line number to an integer and filter for valid integers
      return lines
        .map((line: string) => parseInt(line, 10) - 1)
        .filter(Number.isInteger); // -1 for 0 based indexing
    } catch (error) {
      console.error("Error parsing output:", error);
      return [];
    }
  }

  async runLLM({
    scriptPath,
    apiKey,
    prompt,
    workingDirectory,
    codeFileName
    }: {
    scriptPath: string;
    apiKey: string;
    prompt: string;
    workingDirectory: string;
    codeFileName: string;
    }): Promise<string> {
    return new Promise((resolve, reject) => {
        // run the llm python script
        const pythonProcess = spawn('python3', [scriptPath, apiKey, prompt, workingDirectory, codeFileName]);
        
        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            vscode.window.showErrorMessage(`Error: ${data}`);
            reject(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                const htmlFilePath = output.trim();
                resolve(htmlFilePath);
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
    }

    // function to read promp.txt for LLM
    async readPromptFile(filePath: string): Promise<string> {
        try {
            const promptContent = await fs.promises.readFile(filePath, 'utf-8');
            return promptContent;
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading prompt file`);
            throw error; 
        }
    }
}

export default PythonRunner;