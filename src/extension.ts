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
	activateCreateImplStub(context);
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

/**
 * If the user has the cursor on a prototype in the class definition in the .h file,
 * open the .cpp file and create an implementation stub at the bottom of the .cpp file.
 */
const activateCreateImplStub = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand('vtn2-c++-stuff.createImplStub', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {

			/**
			 * get the class and check if the cursor is in that class.
			 * get the class name
			 * identify the symbol that is selected -- the name of the method.
			 * find the .cpp file.
			 * at end of file, put
			 *   everything before the selectionRange start
			 *   class name + ::
			 *   everything after the selectionRange start
			 *   open and close curlies.
			 */

			const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', activeEditor.document.uri);
			if (! symbols) {
				return;
			}
			const selection = activeEditor.selection;
			const text = activeEditor.document.getText(selection);
			// console.log('selection = ', text);

			const classes = symbols.filter((symbol: vscode.DocumentSymbol) => symbol.kind === vscode.SymbolKind.Class);
			// console.log('classes = ', classes);
			// Find enclosing class of the selection.
			const enclosingClassSymbol = classes.find((classSym: vscode.DocumentSymbol) =>
				classSym.range.contains(selection)
			);
			if (!enclosingClassSymbol) {
				return;
			}

			const symbolsInClasses = findChildSymbols(classes);
			const methods = symbolsInClasses.filter((symbol: vscode.DocumentSymbol) => symbol.kind === vscode.SymbolKind.Method);
			const methodSymbol = methods.find((methodSym: vscode.DocumentSymbol) =>
				methodSym.range.contains(selection)
			);
			if (!methodSymbol) {
				return;
			}

			const methodRangeText = activeEditor.document.getText(methodSymbol.range);

			// For a prototype written like this:    SomeClass * getItem() const;
			// methodSymbol.name is "getItem() const"
			// methodRangeText is "SomeCLass * getItem() const;"
			// so we need to isolate the return type in a string, which is everything in
			//   methodRangeText up to where the method name starts.
			//

			const returnType = methodRangeText.substring(0, methodRangeText.indexOf(methodSymbol.name));

			// NOTE: a space is left on the end of returnType for some reason, so we don't
			// put any extra space in the output.
			const implStr = `\n${returnType}${enclosingClassSymbol.name}::${methodSymbol.name} {\n}\n`;
			// console.log(implStr);


			const wsPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
			const dotCppfilePath = vscode.Uri.file(wsPath + `/Junk.cpp`);
			const cppFileEditor = await vscode.window.showTextDocument(dotCppfilePath);
			cppFileEditor.edit((editBuilder: vscode.TextEditorEdit) => {
				editBuilder.insert(new vscode.Position(100000, 0), implStr);
			});

		}
	});
	context.subscriptions.push(disposable);
};

function findChildSymbols(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
	const vars = symbols.filter(symbol => true);
	return vars.concat(symbols.map(symbol => findChildSymbols(symbol.children))
		.reduce((a, b) => a.concat(b), []));
}

// this method is called when your extension is deactivated
export function deactivate() {}
