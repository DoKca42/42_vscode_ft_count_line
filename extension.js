const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('42-ft-count-line');

/**
 * normalizeLineEndings(txt)
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
 *					with the start index, end index, and the function name.
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
		while (i < txt.length && !txt[i].match(/[a-zA-Z0-9_]/))
			i++;

		start = i;
		while (i < txt.length && txt[i].match(/[a-zA-Z0-9_]/))
			i++;

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

/**
 * validateColorInput(color)
 *
 * Validates if the input color is a valid hex color code or a standard color name.
 *
 * @param {String} color - The color input to validate.
 * @returns {String|null} The validated color string or null if invalid.
 */
function validateColorInput(color)
{
    // Remove any leading '#' from the color string
    let colorStr = color.replace(/^#/, '').trim();

    // Regular expression to match valid hex color codes
    const hexRegex = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

    // List of valid CSS color names
    const cssColorNames = [
        "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure",
        "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet",
        "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral",
        "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan",
        "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki",
        "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred",
        "darksalmon", "darkseagreen", "darkslateblue", "darkslategray",
        "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue",
        "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite",
        "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
        "gray", "green", "greenyellow", "grey", "honeydew", "hotpink",
        "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush",
        "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
        "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
        "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
        "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
        "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
        "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
        "mediumslateblue", "mediumspringgreen", "mediumturquoise",
        "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
        "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange",
        "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise",
        "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum",
        "powderblue", "purple", "rebeccapurple", "red", "rosybrown",
        "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
        "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray",
        "slategrey", "snow", "springgreen", "steelblue", "tan", "teal",
        "thistle", "tomato", "turquoise", "violet", "wheat", "white",
        "whitesmoke", "yellow", "yellowgreen"
    ];

    // Check if the color matches hex color code
    if (hexRegex.test(colorStr)) {
        return '#' + colorStr;
    }

    // Check if the color is a valid CSS color name
    if (cssColorNames.includes(colorStr.toLowerCase())) {
        return colorStr.toLowerCase();
    }

    // If color is invalid
    return null;
}


function activate(ctx)
{
	// Decoration for more than the limit number of lines (default red)
	const redDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            color: 'red',
            margin: '0 0 0 0',
        }
    });

    // Decoration for less than the limit number of lines (default gray)
    const grayDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            color: 'gray',
            margin: '0 0 0 0',
        }
    });

	// Event registration to activate decorations
    let disposable = vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === event.document) {
            applyDecorations(editor);
        }
    });

    // Apply decorations when the document is modified or opened
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            applyDecorations(editor);
        }
    });

    if (vscode.window.activeTextEditor) {
        applyDecorations(vscode.window.activeTextEditor);
    }

    ctx.subscriptions.push(disposable);
	


	/**
	 * createDecorationOptions(range, contentText, color)
	 *
	 * Creates decoration options for the editor.
	 *
	 * @param {vscode.Range} range - The range in the editor where the decoration will be applied.
	 * @param {String} contentText - The text to display in the decoration.
	 * @param {String} color - The color of the decoration text.
	 * @returns {Object} The decoration options object.
	 */
	function createDecorationOptions(range, contentText, color)
	{
		const hoverMessage = `𝟰𝟮 𝗳𝘁 𝗰𝗼𝘂𝗻𝘁 𝗹𝗶𝗻𝗲 😎`;
	
		return {
			range: range,
			hoverMessage: hoverMessage,
			renderOptions: {
				after: {
					contentText: contentText,
					color: color,
					textDecoration: '; font-size: 12.5px; font-style: oblique 0deg; font-family: Arial',
				}
			}
		};
	}

	/**
	 * handleLiterals(c, ctx, i)
	 *
	 * Handles string and character literals during parsing.
	 *
	 * @param {String} c - The current character being parsed.
	 * @param {Object} ctx - The parsing context, containing states like inString, inChar, etc.
	 * @param {Number} i - The current index in the text.
	 * @returns {Object} An object containing a skip flag and the updated index.
	 */
	function handleLiterals(c, ctx, i)
	{
		let skip = false;
	
		if (!ctx.inComment)
		{
			if (c === '"' && !ctx.inChar)
			{
				ctx.inString = !ctx.inString;
				i++;
				skip = true;
			}
			else if (c === "'" && !ctx.inString)
			{
				ctx.inChar = !ctx.inChar;
				i++;
				skip = true;
			}
		}
		return { skip, i };
	}

	/**
	 * handleEscapeChar(c, ctx, i)
	 *
	 * Handles escape characters in strings or character literals.
	 *
	 * @param {String} c - The current character being parsed.
	 * @param {Object} ctx - The parsing context.
	 * @param {Number} i - The current index in the text.
	 * @returns {Object} An object containing a skip flag and the updated index.
	 */
	function handleEscapeChar(c, ctx, i)
	{
		let skip = false;
		if ((ctx.inString || ctx.inChar) && c === '\\')
		{
			i += 2; // Skip the escaped character
			skip = true;;
		}
		return { skip, i };
	}

	/**
	 * handleComment(c, ctx, txt, i)
	 *
	 * Handles comments (line and block) during parsing.
	 *
	 * @param {String} c - The current character being parsed.
	 * @param {Object} ctx - The parsing context.
	 * @param {String} txt - The entire text being parsed.
	 * @param {Number} i - The current index in the text.
	 * @returns {Object} An object containing a skip flag and the updated index.
	 */
	function handleComment(c, ctx, txt, i)
	{
		let skip = false;
	
		if (!ctx.inString && !ctx.inChar)
		{
			if (!ctx.inComment && txt.substring(i, i + 2) === '//')
			{
				ctx.inLineComment = true;
				i += 2;
				skip = true;
			}
			else if (ctx.inLineComment && c === '\n')
			{
				ctx.inLineComment = false;
				skip = true;
			}
			else if (!ctx.inComment && txt.substring(i, i + 2) === '/*')
			{
				ctx.inBlockComment = true;
				i += 2;
				skip = true;
			}
			else if (ctx.inBlockComment && txt.substring(i - 1, i + 1) === '*/')
			{
				ctx.inBlockComment = false;
				i++;
				skip = true;
			}
		}
	
		return { skip, i };
	}

	/**
	 * checkExclusionContext(c, ctx, txt, i)
	 *
	 * Checks if the parsing is in an excluding context (string, character, or comment).
	 *
	 * @param {String} c - The current character being parsed.
	 * @param {Object} ctx - The parsing context.
	 * @param {String} txt - The entire text being parsed.
	 * @param {Number} i - The current index in the text.
	 * @returns {Object} An object containing a skip flag and the updated index.
	 */
	function checkExclusionContext(c, ctx, txt, i)
	{
		let skip = false;

		// Handle string and character literals
		({ skip, i } = handleLiterals(c, ctx, i));
		if (skip)
			return { skip, i };

		// Handle escape characters
		({ skip, i } = handleEscapeChar(c, ctx, i));
		if (skip)
			return { skip, i };

		// Handle comments
		({ skip, i } = handleComment(c, ctx, txt, i));
		if (skip)
			return { skip, i };
		return { skip, i };
	}

	/**
	 * countBrackets(c, ctx, brackets, i)
	 *
	 * Counts opening and closing braces to track function scopes.
	 *
	 * @param {String} c - The current character being parsed.
	 * @param {Object} ctx - The parsing context.
	 * @param {Number} brackets - The current brace count.
	 * @param {Number} i - The current index in the text.
	 * @returns {Object} An object containing the updated brace count and index.
	 */
	function countBrackets(c, ctx, brackets, i)
	{
		// Count brackets if not in a string or comment
		if (!ctx.inString && !ctx.inChar && !ctx.inComment)
		{
			if (c == '{')
				brackets += 1;
			else if (c == '}')
				brackets -= 1;
		}
		i += 1;
		return { brackets, i };
	}

	/**
	 * countFunctionLines(start, end, txt)
	 *
	 * Counts the number of lines in a function between the start and end indices.
	 *
	 * @param {Number} start - The starting index of the function body.
	 * @param {Number} end - The ending index of the function body.
	 * @param {String} txt - The entire text being parsed.
	 * @returns {Number} The number of lines in the function.
	 */
	function countFunctionLines(start, end, txt)
	{
		let size = 0;

		while (start < end)
		{
			if (txt[start] == '\n')
				size += 1;
			start += 1;
		}
		return (size);
	}

	/**
	 * decorationLine(lines, end)
	 *
	 * Determines the line number in the editor where the decoration should be applied.
	 *
	 * @param {Array} lines - An array containing all the lines of the text.
	 * @param {Number} end - The end index in the text.
	 * @returns {Number} The line number where the decoration should be applied.
	 */
	function decorationLine(lines, end)
	{
		let pose = 0;
		let line_nb = 0;

		while (line_nb < lines.length
			&& !(pose <= end && end <= pose + lines[line_nb].length))
		{
			pose += lines[line_nb].length + 1;
			line_nb++;
		}
		return (line_nb);
	}

	/**
	 * applyDecorations(editor)
	 *
	 * Applies line count decorations to functions in the editor.
	 *
	 * @param {vscode.TextEditor} editor - The active text editor.
	 */
	function applyDecorations(editor)
	{
		const document = editor.document;
		let txt = normalizeLineEndings(document.getText());
		let lines = txt.split(/\r\n|\r|\n/);
		let allResRegex = RegexFunctions(txt);

		let redDecorations = [];
        let grayDecorations = [];

		// context
		let ctx = {
			inString: false,
			inChar: false,
			inComment: false,
			inLineComment: false,
			inBlockComment: false,
		};

		for (let resRegex of allResRegex)
		{
			if (txt[resRegex[1]] == '\n' && txt[resRegex[1] + 1] == '{' && !ctx.inString && !ctx.inChar && !ctx.inComment)
			{
				let i = resRegex[1] + 2;
				let brackets = 1;

				while (brackets != 0 && i < txt.length)
				{
					let c = txt[i];
					let skip;

					({ skip, i } = checkExclusionContext(c, ctx, txt, i));
					if (skip)
						continue;

					ctx.inComment = ctx.inLineComment || ctx.inBlockComment;
					({brackets, i} = countBrackets(c, ctx, brackets, i));
				}
				
				let size = 0;
				let line_nb = 0;
				let start = resRegex[1] + 3;
				let end = i - 1;
				
				size = countFunctionLines(start, end, txt);
				line_nb = decorationLine(lines, end);

				let range = new vscode.Range(line_nb + 1, 0, line_nb + 1, 0);
				const hoverMessage = `𝟰𝟮 𝗳𝘁 𝗰𝗼𝘂𝗻𝘁 𝗹𝗶𝗻𝗲 😎`;
				const maxLines = config.get("maxLines", 25);

				const colorBelowMax = validateColorInput(config.get("colorBelowMax", "gray")) || "gray";
				const colorAboveMax = validateColorInput(config.get("colorAboveMax", "red")) || "red"; 

				if (size <= 25)
					grayDecorations.push(createDecorationOptions(range, `—— 𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕 𝘓𝘐𝘕𝘌𝘚 : ${size} ——`, colorBelowMax));
				else
					redDecorations.push(createDecorationOptions(range, `⚠⚠ 𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕 𝘓𝘐𝘕𝘌𝘚 : ${size} ⚠⚠`, colorAboveMax));

				// Apply decorations in the editor
				editor.setDecorations(redDecorationType, redDecorations);
				editor.setDecorations(grayDecorationType, grayDecorations);
			}
		}
	}



	ctx.subscriptions.push(vscode.commands.registerCommand('42-ft-count-line.FtCtLn', () => {
		vscode.window.showInformationMessage('42 FT-COUNT-LINE 😎');
	}));
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}