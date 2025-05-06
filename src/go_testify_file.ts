import * as vscode from "vscode";
import { getFileLines, exec } from "./helpers";

export const goTestifyFile = async () => {
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
    const shownEditor = await vscode.window.showTextDocument(doc, {
      preview: false,
    });
    shownEditor.revealRange(
      new vscode.Range(start, end),
      vscode.TextEditorRevealType.InCenter
    );
    shownEditor.selection = new vscode.Selection(start, end);
    vscode.window.showInformationMessage(
      `Testify tests generated and highlighted.`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`Error: ${err.stderr || err.message}`);
  }
};

