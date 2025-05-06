import * as vscode from "vscode";
import { goTestifyFile } from "./go_testify_file";
import { goTestifyFunction } from "./go_testify_functions";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "globalGoTasks.genGoTestifyTestsFile",
      goTestifyFile
    ),

    vscode.commands.registerCommand(
      "globalGoTasks.genGoTestifyTestsFunc",
      goTestifyFunction
    )
  );
}
