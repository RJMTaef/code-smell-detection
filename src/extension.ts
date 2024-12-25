// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";     // The module 'vscode' contains the VS Code extensibility API
import { highlightText, modifyText, addGutterIcons } from "./modifyEditor";
import { PythonRunner } from "./pythonRunner";
import { ApiKeyManager } from "./utils/apiKeyManager";
import { spawn } from "child_process"; // For running python script
import DesigniteJava from "./designiteJava.js";
const fs = require("fs"); // including node file system
const path = require("path");

// initiate python runner class
const pythonRunner = new PythonRunner();

// initiate apiKey variable
let apiKey: string | null = null;

// initiate variable to store path for the LLM result
let refactoredResultPath: string = '';

// initiate variable to store column two editor
let refactoredPanel: vscode.WebviewPanel | undefined;

// This method is called when extension is activated
// The extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "code-smell-detection" is now active!',
  );

  // initiate the api manager class
  const apiKeyManager = new ApiKeyManager(context);

  // check if API key stored on local if not then ask user for API key
  apiKeyManager.getGeminiApiKey().then(async (apiKey) => {
    if (!apiKey) {
      // If no API key found, then ask the user to enter it
      // Prompt the user to enter the API key
      apiKey = await apiKeyManager.setGeminiApiKey();

      if (apiKey) {
        vscode.window.showInformationMessage('Gemini API key saved successfully.');
      } else {
        vscode.window.showInformationMessage('No Gemini API key was saved. Code Smell detector will not be able to run.');
      }
    } else {
      apiKey = await apiKeyManager.resetGeminiApiKey(); // if API key is present in local then ask if user want to reset API key
    }
    
  }).catch((error) => {
      console.error('Error retrieving API key:', error);
      vscode.window.showErrorMessage('Error retrieving Gemini API key.');
  });

  // Create extension icon(coffee icon) on the status bar inside the activate function
  const myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  myStatusBarItem.text = "$(coffee)";
  myStatusBarItem.tooltip = "Click to start refactoring your code!";
  myStatusBarItem.command = "code-smell-detection.runDesigniteLlm"; // when click on gutter icon/codelens 
  myStatusBarItem.show();

  // command attach to coffee icon, run designite java and LLM and place gutter icon
  const runDesigniteLlmCommand = vscode.commands.registerCommand(
    "code-smell-detection.runDesigniteLlm",
    async function () {
      // if there is a folder open on workspace
      if (vscode.workspace.workspaceFolders) {
        // get the editor currently open on the workspace
        const editor = vscode.window.activeTextEditor;
        // if an editor exist
        if (editor) {
          // get the file type of the file open on editor
          let fileType = vscode.window.activeTextEditor?.document.languageId; 

          // if file type is java then trigger the detector
          if (fileType === "java") {
            // disable minimap on editors
            vscode.workspace
              .getConfiguration("editor")
              .update(
                "minimap.enabled",
                false,
                vscode.ConfigurationTarget.Global,
              );

            // get the current folder
					  const targetFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            // initiate designite class
            const detector = new DesigniteJava(apiKeyManager);

            try {
              // Run Designite Java
              const result = await detector.runDetector(targetFolder);
              console.log('Detection result:', result);

              // parse designite java result from json to string
              const designiteResult = JSON.parse(result);

              // if designite java run successfully then send the designite java result to llm and display the gutter icon on the editor
              if (designiteResult.status === "success") {
                // send designite java result to LLM
                try {
                  // get path to python script that runs LLM
                  const llmPath = path.resolve(
                    __dirname,
                    "../src/backend/callllm.py",
                  );
                  // get the path to the promt text filde to send to LLM
                  const promptPath = path.resolve(
                    __dirname,
                    "../src/backend/prompt.txt",
                  );
                  
                  // get the path to the src sub folder
                  const openFilePath = editor.document.uri.fsPath;
                  const openFileDirectoryPath = path.dirname(openFilePath);
                  const relativePath = path.relative(targetFolder, openFileDirectoryPath);
                  const workingPath = path.join(targetFolder, relativePath);

                  // read promp.txt 
                  const promptFile = await pythonRunner.readPromptFile(promptPath);
                  // get the file name of the java file open on the editor  
                  const fileName = path.basename(editor.document.fileName);

                  // get the API key
                  apiKey = await apiKeyManager.getGeminiApiKey();
                  
                  // TO-DO: BUGFIX starts here, LLM returning strange code
                  // run the script that trigger the LLM
                  const resultHtmlPath = await pythonRunner.runLLM({scriptPath:llmPath, apiKey: apiKey as string, prompt:promptFile, workingDirectory:workingPath, codeFileName:fileName});
                  refactoredResultPath = resultHtmlPath;

                  // Once the LLM is succesfully run and is able to obtain a path for the html page for the column two editor, then display the gutter icon on the column one editor
                  if (refactoredResultPath !== '') {
                    const scriptPath = path.join(
                      context.extensionPath,
                      "src",
                      "backend",
                      "json_extractor.py",
                    );
                    const output = await pythonRunner.runPythonScript({ scriptPath, editor });
                    const lines = pythonRunner.parseLinesFromOutput(output);
    
                    // Add gutter icons to the extracted lines
                    addGutterIcons(editor, lines);
    
                    vscode.window.showInformationMessage(
                      `Gutter icons added to lines: ${lines.map((line) => line + 1).join(", ")}`,
                    ); //set index back for message
                  }

                } catch (error) {
                  console.error("LLM Python script failed to run", error);
                }
              }
            } catch (error) {
              console.error('Error:', error);
            }  
          }
        }
      } else {
        vscode.window.showWarningMessage("No folder is open on the editor.");
      }
      
    },
  );

  // Open second "editor" on the right(cloumn two) to display the refactored code produce by LLM
  const showRefactoredEditorCommand = vscode.commands.registerCommand(
    "code-smell-detection.showRefactoredEditor",
    async () => {
      // Make sure the path to the LLM result is not empty
      if (refactoredResultPath !== '') {
        // If a webview is closed, recreate it
        if (!refactoredPanel) {
          //createRefactoredPanel();
          // Get the path for the result file
          const fullPath = path.resolve(__dirname, '..', refactoredResultPath);
          // Get the path for the CSS file
          const cssFilePath = "src/backend/llm.css";
          const cssPath = path.resolve(__dirname, '..', cssFilePath);
          // Get the path for the reject.js file
          const rejectFilePath = "src/backend/reject.js";
          const rejectPath = path.resolve(__dirname, '..', rejectFilePath);
          // Get the path for the reject.js file
          const acceptFilePath = "src/backend/accept.js";
          const acceptPath = path.resolve(__dirname, '..', acceptFilePath);

          let refactoredFilePath = fullPath;

          // convert string path to Uri
          const resultUri = vscode.Uri.file(fullPath); 
        
          // Create a new webview
          refactoredPanel = vscode.window.createWebviewPanel(
            'codeSmellDetectionWebview',
            'Refactored Code',
            vscode.ViewColumn.Two,
            {
              enableScripts: true,
            },
          );
        
          // Reset refactoredPanel when the user closes the webview
          refactoredPanel.onDidDispose(() => {
            refactoredPanel = undefined;
          });
        
          // Create URIs for CSS and JS files
          const cssUri = vscode.Uri.file(cssPath);
          const webviewCssUri = refactoredPanel.webview.asWebviewUri(cssUri);
          const rejectUri = vscode.Uri.file(rejectPath);
          const webviewRejectUri = refactoredPanel.webview.asWebviewUri(rejectUri);
          const acceptUri = vscode.Uri.file(acceptPath);
          const webviewAcceptUri = refactoredPanel.webview.asWebviewUri(acceptUri);
        
          // Read the HTML file content
          const htmlContent = await vscode.workspace.fs.readFile(resultUri);
          let html = Buffer.from(htmlContent).toString('utf-8');

          // embed css uri in the html file so the styling can be applied in webview
          html = html.replace('{CSS_PLACEHOLDER}', webviewCssUri.toString());
          html = html.replace('{REJECT_JS_PLACEHOLDER}', webviewRejectUri.toString());
          html = html.replace('{ACCEPT_JS_PLACEHOLDER}', webviewAcceptUri.toString());

          // Set the HTML content for the webview
          refactoredPanel.webview.html = html;

          // when user click the "reject" botton in the editor that display the refactored code deletes the refactored code html and json files.
          refactoredPanel.webview.onDidReceiveMessage(
            async (message) => {
              if (message.command === 'rejectRefactoringSuggestion') {
                if (refactoredFilePath) {
                  try {
                    const fileUri = vscode.Uri.file(refactoredFilePath);

                    // change the file path to get the json file
                    const jsonFilePath = fileUri.fsPath.replace('/pages/', '/results/').replace(/page\.html$/, 'results.json');
                    const jsonFileUri = vscode.Uri.file(jsonFilePath);

                    // delete the files
                    await vscode.workspace.fs.delete(jsonFileUri, { recursive: false, useTrash: true });
                    await vscode.workspace.fs.delete(fileUri, { recursive: false, useTrash: true });
                    vscode.window.showInformationMessage(`Refactoring suggestion rejected.`);
                    refactoredFilePath = undefined;
                  } catch (error) {
                    if (error instanceof Error) {
                      vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
                    } else {
                      vscode.window.showErrorMessage('An unknown error occurred while deleting the file.');
                    }
                  }
                } else {
                  vscode.window.showErrorMessage('An error has occured. Unable to display refactored code.');
                }
              }
            },
            undefined,
            context.subscriptions
          );
          
        } else {
          refactoredPanel.reveal(vscode.ViewColumn.Two);
        }
      }
    },
  );

  // dispose of features when extension is closed/deactivated
  context.subscriptions.push(myStatusBarItem);
  context.subscriptions.push(runDesigniteLlmCommand);
  context.subscriptions.push(showRefactoredEditorCommand);
}

// This method is called when the extension is deactivated
function deactivate() {}

// are the following actually needed?
module.exports = {
  activate,
  deactivate,
};
