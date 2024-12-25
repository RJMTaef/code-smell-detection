import * as vscode from "vscode";
import * as path from "path";

// Function to highlight code on editor
export function highlightText(
  editor: vscode.TextEditor,
  lineNumbers: number[],
) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255,255,0,0.3)", // Yellow highlight
  });

  if (editor) {
    const ranges: vscode.Range[] = lineNumbers.map((lineNumber) => {
      const line = editor.document.lineAt(lineNumber); // Get the line at the specified line number
      return new vscode.Range(line.range.start, line.range.end); // Create a Range for that line
    });

    // Apply decoration lines
    editor.setDecorations(decorationType, ranges);
  }
}

// Function to delete code with code smell and replace with refactored code
export function modifyText(
  editor: vscode.TextEditor,
  lineNumbers: number[],
  refactoredCode: string,
) {
  if (editor) {
    editor.edit((editBuilder) => {
      // Replace smelly code
      for (let i = 0; i < lineNumbers.length; i++) {
        const deleteLine = editor.document.lineAt(lineNumbers[i]);
        editBuilder.delete(deleteLine.range);
      }

      const replaceLine = editor.document.lineAt(lineNumbers[0] - 1);
      //editBuilder.replace(replaceLine.range, '\tpublic Expense(String realDate, String realItem, double realAmount)\n\t{\n\t\tthis.date = realDate;\n\t\tthis.item = realItem;\n\t\tthis.amount = realAmount;\n\t}');
      editBuilder.replace(replaceLine.range, refactoredCode);
    });
  }
}

// Modified addGutterIcons function to include CodeLens functionality
export function addGutterIcons(
  editor: vscode.TextEditor,
  lineNumbers: number[],
) {
  // Construct the path to the gutter icon
  const iconPath = path.join(__dirname, "..", "media", "hot-tea-icon.png");

  // Define the gutter icon decoration type
  const gutterIconType = vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.file(iconPath),
    gutterIconSize: "16px", // Adjust size as needed (contain, cover, auto)
  });

  if (editor) {
    const ranges: vscode.Range[] = lineNumbers.map((lineNumber) => {
      const line = editor.document.lineAt(lineNumber); // Get the line at the specified line number
      return new vscode.Range(line.range.start, line.range.start); // Create a Range for the gutter icon
    });

    // Apply gutter icons to specified lines
    editor.setDecorations(gutterIconType, ranges);
  }

  // Register CodeLens on each line with a gutter icon
  const codeLensProvider = {
    provideCodeLenses(document: vscode.TextDocument) {
      return lineNumbers.map((lineNumber) => {
        const range = new vscode.Range(lineNumber, 0, lineNumber, 0);
        // Open the side Java editor from the CodeLens
        return new vscode.CodeLens(range, {
          title: "Code Smell Detected",
          command: "code-smell-detection.showRefactoredEditor",
        });
      });
    },
  };

  vscode.languages.registerCodeLensProvider("java", codeLensProvider);
}
