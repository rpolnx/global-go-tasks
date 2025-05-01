import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';

function getFileLines(filePath: string): string[] {
  try {
    return fs.readFileSync(filePath, 'utf-8').split('\n');
  } catch {
    return [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('globalGoTasks.genGoTestifyTestsFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active file");
      }

      const filePath = editor.document.uri.fsPath;
      const beforeLines = getFileLines(filePath);

      const cmd = `gotests -w -all -template testify "${filePath}"`;

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          return vscode.window.showErrorMessage(`Error: ${stderr}`);
        }

        const afterLines = getFileLines(filePath);
        const start = new vscode.Position(beforeLines.length, 0);
        const end = new vscode.Position(afterLines.length, 0);

        vscode.workspace.openTextDocument(filePath).then((doc) => {
          vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {
            editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
            editor.selection = new vscode.Selection(start, end);
            vscode.window.showInformationMessage(`Testify tests generated and highlighted.`);
          });
        });
      });
    }),

    vscode.commands.registerCommand('globalGoTasks.genGoTestifyTestsFunc', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active file");
      }

      const filePath = editor.document.uri.fsPath;
      const document = editor.document;
      const selection = editor.selection;
      const line = document.lineAt(selection.active.line).text;

	  const funcRegex = /func\s+(?:\(([^)]+)\)\s*)?(\w+)\s*\(/;
	  const match = line.match(funcRegex);
	  
	  let funcName: string | undefined = undefined;
	  
	  if (match) {
		const receiver = match[1];
		const method = match[2];
	  
		if (receiver) {
		  const receiverName = receiver.split(' ')[0].replace(/\*/g, '');
		  funcName = `${receiverName}_${method}`;
		} else {
		  funcName = method;
		}
	  }

      if (!funcName) {
        funcName = await vscode.window.showInputBox({
          placeHolder: "Function name to generate test for",
          prompt: "Cursor was not on a function line. Enter the function name manually.",
        });
        if (!funcName) return;
      }

      const beforeLines = getFileLines(filePath);
      const cmd = `gotests -w -template testify -only ${funcName} "${filePath}"`;

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          return vscode.window.showErrorMessage(`Error: ${stderr}`);
        }

        const afterLines = getFileLines(filePath);
        const start = new vscode.Position(beforeLines.length, 0);
        const end = new vscode.Position(afterLines.length, 0);

        vscode.workspace.openTextDocument(filePath).then((doc) => {
          vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {
            editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
            editor.selection = new vscode.Selection(start, end);
            vscode.window.showInformationMessage(`Testify test for '${funcName}' generated and highlighted.`);
          });
        });
      });
    })
  );
}
