const vscode = require('vscode');
function activate(context) {
	let disposable = vscode.languages.registerCodeLensProvider({ language: '*' }, {
		provideCodeLenses: (document) => {
			let codeLenses = [];
			let txt = document.getText();
			let lines = txt.split(/\r\n|\r|\n/);
			let i = 0;
			let allResRegex = txt.matchAll(/[a-zA-Z_][a-zA-Z_0-9]*\((?:[^()]|\((?:[^()]|\((?:[^()]+|\([^()]*\))*\))*\))*\)/g);
			for (let resRegex of allResRegex)
			{
				if (txt[resRegex.index + resRegex[0].length] == '\n' && txt[resRegex.index + resRegex[0].length + 1] == '{')
				{
					let i = resRegex.index + resRegex[0].length + 2;
					let brackets = 1;
					while (brackets != 0 && i < txt.length) {
						if (txt[i] == '{') {
						    brackets += 1;
						} else if (txt[i] == '}') {
						    brackets -= 1;
						}
						i += 1;
					}
					let size = 0;
					let start = resRegex.index + resRegex[0].length + 3;
					let end = i - 1;
					while (start < end) {
					    if (txt[start] == '\n') {
					        size += 1;
					    }
					    start += 1;
					}
					let pose = 0;
					let line_nb = 0;
					while (line_nb < lines.length && !(pose <= end && end <= pose + lines[line_nb].length)) {
					    pose += lines[line_nb].length + 1;
					    line_nb++;
					}
					let text = "";
					if (size > 25) {
					    text =  `⚠⚠ 𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕 𝘓𝘐𝘕𝘌𝘚 : ` + (size)+` ⚠⚠`;
					}else{
					    text =  '—— 𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕 𝘓𝘐𝘕𝘌𝘚 : ' + (size)+' ——';
					}

					let codeLens = new vscode.CodeLens(new vscode.Range(line_nb + 1, 0, line_nb + 1, 0), {
					    title: text,
					    command: '42-ft-count-line.FtCtLn'
					    });
					    codeLenses.push(codeLens);
				}
			}
			return codeLenses;
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('42-ft-count-line.FtCtLn', () => {
        vscode.window.showInformationMessage('42 FT-COUNT-LINE 😎');
    }));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}