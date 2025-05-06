import * as vscode from "vscode";
import { exec as execCb } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const exec = promisify(execCb);

function getFileLines(filePath: string): string[] {
  try {
    return fs.readFileSync(filePath, "utf-8").split("\n");
  } catch {
    return [];
  }
}

function getTestFilePath(originalPath: string): string {
  const parsed = path.parse(originalPath);
  return path.join(parsed.dir, `${parsed.name}_test${parsed.ext}`);
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("globalGoTasks.genGoTestifyTestsFile", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active file");
      }

      const filePath = editor.document.uri.fsPath;
      const beforeLines = getFileLines(filePath);
      const cmd = `gotests -w -all -template testify "${filePath}"`;

      try {
        await exec(cmd);
        const afterLines = getFileLines(filePath);
        const start = new vscode.Position(beforeLines.length, 0);
        const end = new vscode.Position(afterLines.length, 0);

        const doc = await vscode.workspace.openTextDocument(filePath);
        const shownEditor = await vscode.window.showTextDocument(doc, { preview: false });
        shownEditor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
        shownEditor.selection = new vscode.Selection(start, end);
        vscode.window.showInformationMessage(`Testify tests generated and highlighted.`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error: ${err.stderr || err.message}`);
      }
    }),

    vscode.commands.registerCommand("globalGoTasks.genGoTestifyTestsFunc", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active file");
      }

      const filePath = editor.document.uri.fsPath;
      const document = editor.document;
      const selection = editor.selection;
      const line = document.lineAt(selection.active.line).text;

      const funcRegex = /^\s*func\s+(?:\(\s*(\w+)?\s*\*?\w+\s*\)\s*)?(\w+)\s*\(/;
      const match = line.match(funcRegex);

      let funcName: string | undefined = undefined;
      if (match) {
        const receiverVar = match[1];
        const method = match[2];
        funcName = receiverVar ? `${receiverVar}_${method}` : method;
      }

      if (!funcName) {
        funcName = await vscode.window.showInputBox({
          placeHolder: "Function name to generate test for",
          prompt: "Could not infer function name automatically. Provide it manually.",
        });
        if (!funcName) return;
      }

      const testFilePath = getTestFilePath(filePath);
      const beforeLines = getFileLines(testFilePath);
      const cmd = `gotests -w -template testify -only ${funcName} "${filePath}"`;

      try {
        await exec(cmd);
        const afterLines = getFileLines(testFilePath);
        const start = new vscode.Position(beforeLines.length, 0);
        const end = new vscode.Position(afterLines.length, 0);

        const doc = await vscode.workspace.openTextDocument(testFilePath);
        const shownEditor = await vscode.window.showTextDocument(doc, { preview: false });
        shownEditor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
        shownEditor.selection = new vscode.Selection(start, end);
        vscode.window.showInformationMessage(`Testify test for '${funcName}' generated and highlighted.`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error: ${err.stderr || err.message}`);
      }
    })
  );
}
