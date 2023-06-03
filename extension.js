const vscode = require('vscode');
const {getHTML, generateMermaidCode, getFileExtension} = require('./src/supportFunctions.js');
const {errorStrings} = require('./src/strings.js');

// vue data extract
const {extractTemplateAndScript} = require('./src/extractTemplateAndScript.js');
const {generateCodeForOptionsScript} = require('./src/extractvuedata/generateCodeForScript_options.js');
const {generateCodeForTemplate} = require('./src/extractvuedata/generateCodeForTemplate.js');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
		let disposable = vscode.commands.
		registerCommand('vue-code-map.showVueMap', () => {
		
		// Get the currently active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
		  // Get the document associated with the active text editor
		  const document = editor.document;
	
		  // Get the file extension
		  const fileExtension = getFileExtension(document.uri);
	
		  // Read the contents of the document
		  const text = document.getText();
			
		  if(fileExtension.toLowerCase() == 'vue' && text !== ''){
			// generate and store id's globally
			const { templateAST, scriptContent,api } = extractTemplateAndScript(text);
			if(api == 'options'){
			// generate this first
			const scriptCode = generateCodeForOptionsScript(scriptContent);
			// generate this second
			const astTemplateFlowChart = generateCodeForTemplate(templateAST);

			const mermaidCode = 'graph TD\n' + scriptCode  + '\n' + astTemplateFlowChart;
			showWebPanel(mermaidCode);
			}else{
				vscode.window.showErrorMessage(errorStrings.CompositionNotSupported);
			}
		  }else{
			vscode.window.showErrorMessage(errorStrings.InvalidFile);
		  }
		} else {
			vscode.window.showErrorMessage(errorStrings.UnableToAccessFile);
		}

		});
		context.subscriptions.push(disposable);
}

function showWebPanel(mermaidCode){
	// Create a new webview panel
	const panel = vscode.window.createWebviewPanel(
		'vueCodeMapWindow', // Unique identifier for the panel
		'Vue Code Map', // Title displayed in the panel
		vscode.ViewColumn.One, // The column in which to show the panel
		{
		  enableScripts:true,
		  enableForms: true
		}
	  );
	  // Set the HTML content in the webview panel
	  panel.webview.html = getHTML(mermaidCode);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
