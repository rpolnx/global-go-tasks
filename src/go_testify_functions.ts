import * as vscode from "vscode";
import { getFileLines, getTestFilePath, waitForFile, exec } from "./helpers";

export const goTestifyFunction = async () => {
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
      prompt:
        "Could not infer function name automatically. Provide it manually.",
    });
    if (!funcName) return;
  }

  const testFilePath = getTestFilePath(filePath);
  const beforeLines = getFileLines(testFilePath);
  const cmd = `gotests -w -template testify -only ${funcName} "${filePath}"`;

  try {
    await exec(cmd);
    await waitForFile(testFilePath); 
    const afterLines = getFileLines(testFilePath);
    const start = new vscode.Position(beforeLines.length, 0);
    const end = new vscode.Position(afterLines.length, 0);

    const doc = await vscode.workspace.openTextDocument(testFilePath);
    const shownEditor = await vscode.window.showTextDocument(doc, {
      preview: false,
    });
    shownEditor.revealRange(
      new vscode.Range(start, end),
      vscode.TextEditorRevealType.InCenter
    );
    shownEditor.selection = new vscode.Selection(start, end);
    vscode.window.showInformationMessage(
      `Testify test for '${funcName}' generated and highlighted.`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`Error: ${err.stderr || err.message}`);
  }
};

