#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// ---- CONFIG ----
const inputFile = process.argv[2] || path.join(process.cwd(), "input.ts"); // TS file path from CLI or default
const outputFile = process.argv[3] || path.join(process.cwd(), "output.cs"); // output C# file
const enumPrefix = "RuntimeSpawn_";
// ----------------

// Read the TypeScript file
const tsContent = fs.readFileSync(inputFile, "utf-8");

// Match all enums
const enumRegex = /export\s+enum\s+(\w+)\s*{([\s\S]*?)}/g;
let match;
let csOutput = "";

// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
while ((match = enumRegex.exec(tsContent)) !== null) {
    const enumName = match[1];
    const enumBody = match[2];

    // Only convert enums with the prefix
    if (!enumName.startsWith(enumPrefix)) continue;

    // Split enum members and clean up
    const members = enumBody
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

    // Build C# enum
    csOutput += `public enum ${enumName} {\n`;
    members.forEach((member, index) => {
        csOutput += `    ${member} = ${index},\n`;
    });
    csOutput += "}\n\n";
}

// Write the C# output
fs.writeFileSync(outputFile, csOutput, "utf-8");

console.log(`C# enums written to ${outputFile}`);
