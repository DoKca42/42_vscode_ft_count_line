const vscode = require('vscode');

/**
 * normalizeLineEndings(text)
 *
 * Normalize line endings to Unix format (LF).
 * Because Unix uses LF and Windows uses CRLF.
 *
 * @param {String} txt - The text to normalize.
 * @returns {String} The text with normalized line endings in LF format.
 */
function normalizeLineEndings(txt)
{
    return txt.replace(/\r\n/g, '\n');
}

/**
 * RegexFunctions(txt)
 *
 * Identifies functions present in a file.
 *
 * @param {String} txt - The text to analyze.
 * @returns {Array} A list of functions found, each represented as an array 
 *                  with the start index, end index, and the function name.
 */
function RegexFunctions(txt)
{
    const out = [];
    let i = 0;
    while (i < txt.length) 
    {
        let start = 0;
        let temp = 0;
        let parentheses = 0;
        while (i < txt.length && !txt[i].match(/[a-zA-Z0-9_]/)){
            i++;
        }
        start = i;
        while (i < txt.length && txt[i].match(/[a-zA-Z0-9_]/)) {
            i++;
        }
        if (i < txt.length && txt[i] === '(')
        {
            parentheses = 1;
            i++;
            temp = i;
            while (i < txt.length && parentheses > 0 && txt[i] !== ';')
            {
				if (txt[i] === '(') {
					parentheses++;
				}
				if (txt[i] === ')') {
					parentheses--;
				}
				i++;
            }
            if (i < txt.length && parentheses === 0) {
            	out.push([start, i, txt.substring(start, i)]);
            }
            i = temp;
        } 
    }
    return out;
}

function activate(context) {
	let disposable = vscode.languages.registerCodeLensProvider({ language: '*' }, {
		provideCodeLenses: (document) => {
			let codeLenses = [];
			let txt = normalizeLineEndings(document.getText());
			let lines = txt.split(/\r\n|\r|\n/);
			let i = 0;
			let allResRegex = RegexFunctions(txt);
			for (let resRegex of allResRegex)
			{
				if (txt[resRegex[1]] == '\n' && txt[resRegex[1] + 1] == '{')
				{
					let i = resRegex[1] + 2;
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
					let start = resRegex[1] + 3;
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