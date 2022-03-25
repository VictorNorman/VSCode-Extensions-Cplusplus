// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { constantCase } from 'change-case';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	activateNewClass(context);
	activateNewHeaderFile(context);
	console.log('extension helloworld activated');
}

function activateNewClass(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vtn2-c++-stuff.newClass', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello VS Code');
		const newClassName = await vscode.window.showInputBox({
			prompt: "Enter class name",
		});
		if (!newClassName) {
			// operation was canceled.
			return;
		}
		vscode.window.showWarningMessage('Code to create new C++ class file with name ' + newClassName);

		makeNewHeaderFile(newClassName);
		makeNewCppFile(newClassName);
	});

	context.subscriptions.push(disposable);
}

function makeNewCppFile(newClassName: string) {
	const wsedit = new vscode.WorkspaceEdit();
	const wsPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
	const dotCppfilePath = vscode.Uri.file(wsPath + `/${newClassName}.cpp`);
	wsedit.createFile(dotCppfilePath);

	let dotCppFileContent =
		`/*
  * ${newClassName}.cpp
  */

#include "${newClassName}.h"

${newClassName}::${newClassName}() \{
    // TODO Auto-generated constructor stub

\}

${newClassName}::~${newClassName}() \{
    // TODO Auto-generated destructor stub

\}
`;
	wsedit.insert(dotCppfilePath, new vscode.Position(0, 0), dotCppFileContent);
	vscode.workspace.applyEdit(wsedit);
}

function activateNewHeaderFile(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vtn2-c++-stuff.newHeaderFile', async () => {

		const newHeaderFileName = await vscode.window.showInputBox({
			prompt: "Enter class name",
		});
		if (!newHeaderFileName) {
			// operation was canceled.
			return;
		}
		vscode.window.showWarningMessage('Code to create new C++ header file with name ' + newHeaderFileName);
		makeNewHeaderFile(newHeaderFileName);
	});
	context.subscriptions.push(disposable);
}

function makeNewHeaderFile(newHeaderFileName: string) {
	const wsedit = new vscode.WorkspaceEdit();
	const wsPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
	const dotHfilePath = vscode.Uri.file(wsPath + `/${newHeaderFileName}.h`);
	wsedit.createFile(dotHfilePath);

	// const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
	// make a can't-load-me-twice unique string...
	const protectStr = constantCase(newHeaderFileName).toUpperCase();
	let dotHFileContent =
		`/*
 * ${newHeaderFileName}.h
 */

#ifndef _${protectStr}_H_
#define _${protectStr}_H_

class ${newHeaderFileName} \{
public:
    ${newHeaderFileName}();
	virtual ~${newHeaderFileName}();
\};

#endif /* _${protectStr}_H_ */
`;
	wsedit.insert(dotHfilePath, new vscode.Position(0, 0), dotHFileContent);
	vscode.workspace.applyEdit(wsedit);
}


// this method is called when your extension is deactivated
export function deactivate() {}
