// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	
    let disposable = vscode.languages.registerCodeLensProvider({ language: '*' }, {
        provideCodeLenses: (document) => {
            let codeLenses = [];
              //console.log(event);
              let text = document.getText();
              let lines = text.split("\n");
              let i = 0;
              while (i < lines.length) {
              let line = lines[i];
              let res = line.match(/[a-zA-Z_][a-zA-Z_0-9]*\(.*\)/);
              if (res) 
              {
                  if (res.index + res[0].length == line.length) {
                    i++;
                    line = lines[i];
                    if (line == "{") 
                    {
                        let bracket = 1;
                        let size = 0;
                        i++;
                        while (bracket != 0 && i < lines.length) 
                        {
                            line = lines[i];
                            bracket += (line.match(/{/g) || []).length;
                            bracket -= (line.match(/}/g) || []).length;
                            size++;
                            i++;
                        }

                        let text = ""
                        if (size - 1 > 25){
                            text =  `⚠⚠ 𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕 𝘓𝘐𝘕𝘌𝘚 : ` + (size - 1)+` ⚠⚠`;
                        }else{
                            text =  '—— 𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕 𝘓𝘐𝘕𝘌𝘚 : ' + (size - 1)+' ——';
                        }

                        let codeLens = new vscode.CodeLens(new vscode.Range(i, 0, i, 0), {
                            title: text,
                            command: '42-ft-count-line.sayHello'
                            });
                            codeLenses.push(codeLens);
                    }
                  }
              }
              i++;
              }
            return codeLenses;
        }
      });




    vscode.workspace.onDidChangeTextDocument(event => {
          context.subscriptions.push(disposable);
    })
      


    //context.subscriptions.push(vscode.commands.registerCommand('42-ft-count-line.sayHello', () => {}));
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
