const fs = require('node:fs');
const path = require('node:path');

function removeComments(code) {
    // Remove single-line comments
    let result = code.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    return result;
}

function normalizeWhitespace(code) {
    // Remove trailing commas before closing braces/brackets
    const result = code.replace(/,(\s*[}\]])/g, '$1');

    // Normalize to single line first
    let normalized = result
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(' ');

    // Normalize union types - remove extra spaces around pipes
    normalized = normalized.replace(/\s*\|\s*/g, ' | ');

    // Remove leading pipe in unions (from multi-line formatting)
    normalized = normalized.replace(/=\s*\|\s*/g, '= ');
    normalized = normalized.replace(/:\s*\|\s*/g, ': ');

    return normalized;
}

function normalizeParameterNames(code) {
    // For functions, replace parameter names with generic arg0, arg1, etc.
    // This regex finds function parameters and replaces them
    return code.replace(/\(([^)]*)\)/g, (match, params) => {
        if (!params.trim()) return '()';

        // Split parameters by comma (accounting for nested types)
        const paramList = [];
        let depth = 0;
        let current = '';

        for (let i = 0; i < params.length; i++) {
            const char = params[i];
            if (char === '<' || char === '{' || char === '[') depth++;
            if (char === '>' || char === '}' || char === ']') depth--;

            if (char === ',' && depth === 0) {
                paramList.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        if (current.trim()) paramList.push(current.trim());

        // Normalize each parameter
        const normalized = paramList.map(param => {
            // Match: paramName: Type or paramName?: Type
            const match = param.match(/^([^:]+)(:\s*.+)$/);
            if (match) {
                const optional = match[1].trim().endsWith('?') ? '?' : '';
                return `arg${optional}${match[2]}`;
            }
            return param;
        });

        return `(${normalized.join(', ')})`;
    });
}

function extractDeclarations(content) {
    const declarations = new Map();

    // Remove comments first
    const cleanedContent = removeComments(content);

    const lines = cleanedContent
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Check for declaration start
        const match = line.match(
            /^(?:export\s+)?(?:declare\s+)?(interface|type|class|function|const|let|var|enum)\s+([^\s<{=(:]+)/
        );

        if (match) {
            const declarationType = match[1];
            const declarationName = match[2];
            let declarationContent = line;
            let braceCount =
                (line.match(/{/g) || []).length -
                (line.match(/}/g) || []).length;
            let parenCount =
                (line.match(/\(/g) || []).length -
                (line.match(/\)/g) || []).length;

            // For functions, we need to capture until we find the closing paren and semicolon
            if (declarationType === 'function') {
                i++;
                while (i < lines.length && parenCount > 0) {
                    declarationContent += ` ${lines[i]}`;
                    parenCount += (lines[i].match(/\(/g) || []).length;
                    parenCount -= (lines[i].match(/\)/g) || []).length;
                    i++;
                }

                // Now find the semicolon on the current or next line
                if (!declarationContent.includes(';')) {
                    const currentLine = lines[i - 1] || '';
                    if (currentLine.includes(';')) {
                        // Already have it
                    } else if (i < lines.length && lines[i].includes(';')) {
                        const semicolonLine = `${lines[i].split(';')[0]};`;
                        declarationContent += ` ${semicolonLine}`;
                        i++;
                    }
                }

                const normalized = normalizeWhitespace(declarationContent);
                const withNormalizedParams =
                    normalizeParameterNames(normalized);
                // Use full signature as key to handle function overloads
                const key = `${declarationType}:${declarationName}:${withNormalizedParams}`;
                declarations.set(key, {
                    name: declarationName,
                    type: declarationType,
                    content: withNormalizedParams,
                });
                continue;
            }

            // For type aliases, capture until semicolon
            if (declarationType === 'type' && !line.includes('{')) {
                i++;
                while (i < lines.length && !declarationContent.includes(';')) {
                    declarationContent += ` ${lines[i]}`;
                    i++;
                }

                const key = `${declarationType}:${declarationName}`;
                const normalized = normalizeWhitespace(declarationContent);
                declarations.set(key, {
                    name: declarationName,
                    type: declarationType,
                    content: normalized,
                });
                continue;
            }

            // Single line declaration (type alias, const, etc.)
            if (braceCount === 0 && line.endsWith(';') && !line.includes('{')) {
                const key = `${declarationType}:${declarationName}`;
                const normalized = normalizeWhitespace(declarationContent);
                declarations.set(key, {
                    name: declarationName,
                    type: declarationType,
                    content: normalized,
                });
                i++;
                continue;
            }

            // Multi-line declaration - if brace not on same line, look ahead
            i++;
            if (braceCount === 0 && i < lines.length) {
                const nextLine = lines[i].trim();
                if (nextLine === '{' || nextLine.startsWith('{')) {
                    declarationContent += ' {';
                    braceCount = 1;
                    // If there's more after the brace on the same line
                    if (nextLine.length > 1) {
                        const afterBrace = nextLine.substring(1).trim();
                        if (afterBrace) {
                            declarationContent += `\n${afterBrace}`;
                            braceCount += (afterBrace.match(/{/g) || []).length;
                            braceCount -= (afterBrace.match(/}/g) || []).length;
                        }
                    }
                    i++;
                }
            }

            while (i < lines.length && braceCount > 0) {
                declarationContent += `\n${lines[i]}`;
                braceCount += (lines[i].match(/{/g) || []).length;
                braceCount -= (lines[i].match(/}/g) || []).length;
                i++;
            }

            // If ended, save it
            if (braceCount === 0) {
                const key = `${declarationType}:${declarationName}`;
                const normalized = normalizeWhitespace(declarationContent);
                declarations.set(key, {
                    name: declarationName,
                    type: declarationType,
                    content: normalized,
                });
            }
        } else {
            i++;
        }
    }

    return declarations;
}

function compareFiles(file1Path, file2Path) {
    // Read files
    const content1 = fs.readFileSync(file1Path, 'utf-8');
    const content2 = fs.readFileSync(file2Path, 'utf-8');

    // Parse declarations
    const decls1 = extractDeclarations(content1);
    const decls2 = extractDeclarations(content2);

    const result = {
        added: [],
        removed: [],
        modified: [],
        unchanged: 0,
    };

    // Find removed and modified declarations
    for (const [key, decl1] of decls1.entries()) {
        if (!decls2.has(key)) {
            result.removed.push({ key, ...decl1 });
        } else {
            const decl2 = decls2.get(key);
            if (decl1.content !== decl2.content) {
                result.modified.push({
                    key,
                    name: decl1.name,
                    type: decl1.type,
                    oldContent: decl1.content,
                    newContent: decl2.content,
                });
            } else {
                result.unchanged++;
            }
        }
    }

    // Find added declarations
    for (const [key, decl2] of decls2.entries()) {
        if (!decls1.has(key)) {
            result.added.push({ key, ...decl2 });
        }
    }

    // Sort results by name for better readability
    result.added.sort((a, b) => a.name.localeCompare(b.name));
    result.removed.sort((a, b) => a.name.localeCompare(b.name));
    result.modified.sort((a, b) => a.name.localeCompare(b.name));

    return result;
}

function printDifferences(file1Path, file2Path, result) {
    console.log('\n========================================');
    console.log('Comparing TypeScript Declaration Files');
    console.log('========================================');
    console.log(`File 1: ${file1Path}`);
    console.log(`File 2: ${file2Path}`);
    console.log('\n');

    console.log('Summary:');
    console.log(`  Added:     ${result.added.length}`);
    console.log(`  Removed:   ${result.removed.length}`);
    console.log(`  Modified:  ${result.modified.length}`);
    console.log(`  Unchanged: ${result.unchanged}`);
    console.log('\n');

    // Group declarations by name for better display
    function groupByName(items) {
        const grouped = new Map();
        for (const item of items) {
            if (!grouped.has(item.name)) {
                grouped.set(item.name, []);
            }
            grouped.get(item.name).push(item);
        }
        return grouped;
    }

    if (result.added.length > 0) {
        console.log('========================================');
        console.log(`✅ Added Declarations (${result.added.length})`);
        console.log('========================================\n');

        const grouped = groupByName(result.added);
        for (const [name, items] of grouped) {
            console.log(`+ [${items[0].type}] ${name}`);
            for (const decl of items) {
                console.log(`  ${decl.content}`);
            }
            console.log('');
        }
    }

    if (result.removed.length > 0) {
        console.log('========================================');
        console.log(`❌ Removed Declarations (${result.removed.length})`);
        console.log('========================================\n');

        const grouped = groupByName(result.removed);
        for (const [name, items] of grouped) {
            console.log(`- [${items[0].type}] ${name}`);
            for (const decl of items) {
                console.log(`  ${decl.content}`);
            }
            console.log('');
        }
    }

    if (result.modified.length > 0) {
        console.log('========================================');
        console.log(`📝 Modified Declarations (${result.modified.length})`);
        console.log('========================================\n');

        const grouped = groupByName(result.modified);
        for (const [name, items] of grouped) {
            for (const decl of items) {
                console.log(`~ [${decl.type}] ${name}`);
                console.log('\n  OLD:');
                console.log(`  ${decl.oldContent}`);
                console.log('\n  NEW:');
                console.log(`  ${decl.newContent}`);
                console.log(`\n${'─'.repeat(60)}\n`);
            }
        }
    }

    if (
        result.added.length === 0 &&
        result.removed.length === 0 &&
        result.modified.length === 0
    ) {
        console.log(
            '✨ No differences found! The files are functionally identical.'
        );
    }
}

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node compare-dts.js <file1.d.ts> <file2.d.ts>');
        console.error('');
        console.error(
            'This tool compares TypeScript declaration files and shows:'
        );
        console.error('  - Added declarations');
        console.error('  - Removed declarations');
        console.error('  - Modified declarations (with before/after content)');
        console.error('');
        console.error('Comments and declaration order are ignored.');
        process.exit(1);
    }

    const file1Path = args[0];
    const file2Path = args[1];

    // Check if files exist
    if (!fs.existsSync(file1Path)) {
        console.error(`Error: File not found: ${file1Path}`);
        process.exit(1);
    }

    if (!fs.existsSync(file2Path)) {
        console.error(`Error: File not found: ${file2Path}`);
        process.exit(1);
    }

    // Compare files
    const result = compareFiles(file1Path, file2Path);

    // Print results
    printDifferences(file1Path, file2Path, result);
}

main();
