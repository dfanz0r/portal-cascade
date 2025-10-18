#!/usr/bin/env node
/**
 * Cascade Framework Bundler
 *
 * This bundler implements:
 * - Tree-shaking: Only bundles code reachable from user mods
 * - Mod discovery: Automatically finds classes extending Mod
 * - Event pruning: Only generates Portal event handlers actually used
 * - Auto-registration: Generates registerModClass() calls
 * - Zero-configuration: Users just write mod classes
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const tsconfigPath = path.join(projectRoot, "tsconfig.json");

// ============================================
// Configuration
// ============================================

const EXTERNAL_MODULES = new Map([
    [
        "modlib",
        {
            runtimeExpression: "modlib",
            keepEntryImport: true,
        },
    ],
]);

// Map of IMod method names to Portal event handler names
const EVENT_METHOD_TO_PORTAL_HANDLER = {
    ongoingGlobal: "OngoingGlobal",
    onGameModeStarted: "OnGameModeStarted",
    onGameModeEnding: "OnGameModeEnding",
    onPlayerJoinGame: "OnPlayerJoinGame",
    onPlayerLeaveGame: "OnPlayerLeaveGame",
    onPlayerDeployed: "OnPlayerDeployed",
    onPlayerUndeploy: "OnPlayerUndeploy",
    onPlayerEarnedKill: "OnPlayerEarnedKill",
    onPlayerEarnedKillAssist: "OnPlayerEarnedKillAssist",
    onPlayerDamaged: "OnPlayerDamaged",
    onPlayerDied: "OnPlayerDied",
    onRevived: "OnRevived",
    onMandown: "OnMandown",
    onPlayerSwitchTeam: "OnPlayerSwitchTeam",
    onVehicleSpawned: "OnVehicleSpawned",
    onVehicleDestroyed: "OnVehicleDestroyed",
    onPlayerEnterVehicle: "OnPlayerEnterVehicle",
    onPlayerExitVehicle: "OnPlayerExitVehicle",
    onPlayerEnterVehicleSeat: "OnPlayerEnterVehicleSeat",
    onPlayerExitVehicleSeat: "OnPlayerExitVehicleSeat",
    onCapturePointCapturing: "OnCapturePointCapturing",
    onCapturePointCaptured: "OnCapturePointCaptured",
    onCapturePointLost: "OnCapturePointLost",
    onPlayerEnterCapturePoint: "OnPlayerEnterCapturePoint",
    onPlayerExitCapturePoint: "OnPlayerExitCapturePoint",
    onMCOMArmed: "OnMCOMArmed",
    onMCOMDefused: "OnMCOMDefused",
    onMCOMDestroyed: "OnMCOMDestroyed",
    onPlayerEnterAreaTrigger: "OnPlayerEnterAreaTrigger",
    onPlayerExitAreaTrigger: "OnPlayerExitAreaTrigger",
    onPlayerInteract: "OnPlayerInteract",
    onSpawnerSpawned: "OnSpawnerSpawned",
    onRayCastHit: "OnRayCastHit",
    onRayCastMissed: "OnRayCastMissed",
    onPlayerUIButtonEvent: "OnPlayerUIButtonEvent",
    onAIMoveToFailed: "OnAIMoveToFailed",
    onAIMoveToRunning: "OnAIMoveToRunning",
    onAIMoveToSucceeded: "OnAIMoveToSucceeded",
    onAIParachuteRunning: "OnAIParachuteRunning",
    onAIParachuteSucceeded: "OnAIParachuteSucceeded",
    onAIWaypointIdleFailed: "OnAIWaypointIdleFailed",
    onAIWaypointIdleRunning: "OnAIWaypointIdleRunning",
    onAIWaypointIdleSucceeded: "OnAIWaypointIdleSucceeded",
    onTimeLimitReached: "OnTimeLimitReached",
};

// Event signatures for generating Portal handlers
const EVENT_SIGNATURES = {
    ongoingGlobal: "()",
    onGameModeStarted: "()",
    onGameModeEnding: "()",
    onPlayerJoinGame: "(eventPlayer: mod.Player)",
    onPlayerLeaveGame: "(eventPlayer: mod.Player)",
    onPlayerDeployed: "(eventPlayer: mod.Player)",
    onPlayerUndeploy: "(eventPlayer: mod.Player)",
    onPlayerEarnedKill:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock)",
    onPlayerEarnedKillAssist:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player)",
    onPlayerDamaged:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDamageType: mod.DamageType, eventWeaponUnlock: mod.WeaponUnlock)",
    onPlayerDied:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock)",
    onRevived: "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player)",
    onMandown: "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player)",
    onPlayerSwitchTeam: "(eventPlayer: mod.Player, eventTeam: mod.Team)",
    onVehicleSpawned: "(eventVehicle: mod.Vehicle)",
    onVehicleDestroyed: "(eventVehicle: mod.Vehicle)",
    onPlayerEnterVehicle:
        "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle)",
    onPlayerExitVehicle: "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle)",
    onPlayerEnterVehicleSeat:
        "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle, eventSeat: mod.Object)",
    onPlayerExitVehicleSeat:
        "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle, eventSeat: mod.Object)",
    onCapturePointCapturing: "(eventCapturePoint: mod.CapturePoint)",
    onCapturePointCaptured: "(eventCapturePoint: mod.CapturePoint)",
    onCapturePointLost: "(eventCapturePoint: mod.CapturePoint)",
    onPlayerEnterCapturePoint:
        "(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint)",
    onPlayerExitCapturePoint:
        "(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint)",
    onMCOMArmed: "(eventMCOM: mod.MCOM)",
    onMCOMDefused: "(eventMCOM: mod.MCOM)",
    onMCOMDestroyed: "(eventMCOM: mod.MCOM)",
    onPlayerEnterAreaTrigger:
        "(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger)",
    onPlayerExitAreaTrigger:
        "(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger)",
    onPlayerInteract:
        "(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint)",
    onSpawnerSpawned: "(eventPlayer: mod.Player, eventSpawner: mod.Spawner)",
    onRayCastHit:
        "(eventPlayer: mod.Player, eventPoint: mod.Vector, eventNormal: mod.Vector)",
    onRayCastMissed: "(eventPlayer: mod.Player)",
    onPlayerUIButtonEvent:
        "(eventPlayer: mod.Player, eventUIWidget: mod.UIWidget, eventUIButtonEvent: mod.UIButtonEvent)",
    onAIMoveToFailed: "(eventPlayer: mod.Player)",
    onAIMoveToRunning: "(eventPlayer: mod.Player)",
    onAIMoveToSucceeded: "(eventPlayer: mod.Player)",
    onAIParachuteRunning: "(eventPlayer: mod.Player)",
    onAIParachuteSucceeded: "(eventPlayer: mod.Player)",
    onAIWaypointIdleFailed: "(eventPlayer: mod.Player)",
    onAIWaypointIdleRunning: "(eventPlayer: mod.Player)",
    onAIWaypointIdleSucceeded: "(eventPlayer: mod.Player)",
    onTimeLimitReached: "()",
};

// ============================================
// Command Line Parsing
// ============================================

const args = process.argv.slice(2);
let outputFile = "dist/portal.ts";
let verbose = false;

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
        case "--output":
        case "-o":
            outputFile = args[++i];
            break;
        case "--verbose":
        case "-v":
            verbose = true;
            break;
        case "--help":
        case "-h":
            printHelp();
            process.exit(0);
            break;
        default:
            if (arg.startsWith("-")) {
                console.error(`Unknown option: ${arg}`);
                printHelp();
                process.exit(1);
            }
    }
}

function printHelp() {
    console.log(`
Cascade Framework Bundler

Usage: node scripts/bundle.mjs [options]

Options:
  -o, --output <file>   Output file (default: dist/portal.ts)
  -v, --verbose         Enable verbose logging
  -h, --help            Show this help

Examples:
  npm run bundle
  npm run bundle -- -o my-mod.ts
  npm run bundle -- --verbose
`);
}

// ============================================
// Main Bundling Logic
// ============================================

async function main() {
    console.log("=".repeat(60));
    console.log("Cascade Framework Bundler");
    console.log("=".repeat(60));
    console.log();

    if (!fs.existsSync(tsconfigPath)) {
        console.error(
            `ERROR: Unable to locate tsconfig.json at ${tsconfigPath}`
        );
        process.exit(1);
    }

    // Initialize ts-morph project
    console.log("[1/6] Initializing TypeScript project...");
    const project = new Project({ tsConfigFilePath: tsconfigPath });

    // Find entry points (user code)
    const entryPoints = findEntryPoints(project);
    console.log(`[2/6] Found ${entryPoints.length} entry point(s):`);
    for (const ep of entryPoints) {
        console.log(`      - ${relativePath(ep.getFilePath())}`);
    }
    console.log();

    // Tree-shaking: Find all reachable files
    console.log("[3/6] Performing tree-shaking analysis...");
    const reachableFiles = findReachableFiles(project, entryPoints);
    console.log(
        `      ${reachableFiles.length} files are reachable (${
            project.getSourceFiles().filter((f) => !f.isDeclarationFile())
                .length - reachableFiles.length
        } pruned)`
    );
    if (verbose) {
        for (const f of reachableFiles) {
            console.log(`      - ${relativePath(f.getFilePath())}`);
        }
    }
    console.log();

    // Topological sort for correct dependency order
    console.log("[4/6] Sorting files by dependencies...");
    const sortedFiles = topologicalSort(reachableFiles);
    console.log("      Files ordered correctly");
    console.log();

    // Discover mod classes from ALL files in src/mods, not just reachable ones
    console.log("[5/6] Discovering mod classes...");
    const modsDir = path.join(projectRoot, "src", "mods");
    const allModsFiles = project
        .getSourceFiles()
        .filter((f) => !f.isDeclarationFile())
        .filter((f) =>
            path.normalize(f.getFilePath()).startsWith(path.normalize(modsDir))
        );

    const modClasses = discoverModClasses(allModsFiles);
    console.log(`      Found ${modClasses.length} mod class(es):`);
    for (const mod of modClasses) {
        console.log(
            `      - ${mod.name} (${relativePath(mod.file.getFilePath())})`
        );
    }

    // Add mod class files to reachable set if not already included
    const reachableSet = new Set(sortedFiles);
    for (const modClass of modClasses) {
        if (!reachableSet.has(modClass.file)) {
            sortedFiles.push(modClass.file);
            if (verbose) {
                console.log(
                    `      + Added ${relativePath(
                        modClass.file.getFilePath()
                    )} for mod: ${modClass.name}`
                );
            }
        }
    }
    console.log();

    // Analyze used events
    console.log("[6/6] Analyzing used events...");
    const usedEvents = analyzeUsedEvents(modClasses);
    const totalEvents = Object.keys(EVENT_METHOD_TO_PORTAL_HANDLER).length;
    const prunedCount = totalEvents - usedEvents.size;
    console.log(`      ${usedEvents.size} events used, ${prunedCount} pruned`);
    if (verbose) {
        for (const event of Array.from(usedEvents)) {
            console.log(`      - ${event}`);
        }
    }
    console.log();

    // Transform and bundle
    console.log("Transforming and bundling code...");
    const bundledCode = transformAndBundle(sortedFiles, modClasses, usedEvents);
    console.log("Bundle generated");
    console.log();

    // Write output
    const outFile = path.isAbsolute(outputFile)
        ? outputFile
        : path.resolve(projectRoot, outputFile);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, bundledCode, "utf8");

    const sizeKB = (bundledCode.length / 1024).toFixed(2);
    console.log("=".repeat(60));
    console.log(`SUCCESS: Bundle written to: ${relativePath(outFile)}`);
    console.log(`         Bundle size: ${sizeKB} KB`);
    console.log(`         Mod classes: ${modClasses.length}`);
    console.log(
        `         Event handlers: ${usedEvents.size} (${prunedCount} pruned)`
    );
    console.log("=".repeat(60));
}

// ============================================
// Step 1: Find Entry Points
// ============================================

function findEntryPoints(project) {
    const modsFiles = project
        .getSourceFiles()
        .filter((f) => !f.isDeclarationFile())
        .filter((f) => f.getFilePath().includes("src/mods/"));
    return modsFiles;
}

// ============================================
// Step 2: Tree-Shaking - Find Reachable Files
// ============================================

function findReachableFiles(project, entryPoints) {
    const reachable = new Set();
    const queue = [...entryPoints];

    while (queue.length > 0) {
        const file = queue.shift();
        const filePath = file.getFilePath();

        if (reachable.has(filePath)) continue;
        if (!isBundlable(file)) continue;

        reachable.add(filePath);

        // Follow import declarations
        for (const importDecl of file.getImportDeclarations()) {
            const target = importDecl.getModuleSpecifierSourceFile();
            if (target && isBundlable(target)) {
                queue.push(target);
            }
        }

        // Follow export declarations with module specifiers (re-exports)
        for (const exportDecl of file.getExportDeclarations()) {
            const target = exportDecl.getModuleSpecifierSourceFile();
            if (target && isBundlable(target)) {
                queue.push(target);
            }
        }
    }

    // Convert Set of paths back to SourceFile array
    return Array.from(reachable)
        .map((path) => project.getSourceFile(path))
        .filter(Boolean);
}

function isBundlable(sourceFile) {
    if (sourceFile.isDeclarationFile()) return false;

    const filePath = path.normalize(sourceFile.getFilePath());
    const normalizedRoot = path.normalize(projectRoot);

    if (!filePath.startsWith(normalizedRoot)) return false;
    if (filePath.includes("node_modules")) return false;

    return true;
}

// ============================================
// Step 3: Topological Sort
// ============================================

function topologicalSort(files) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    const fileMap = new Map(files.map((f) => [f.getFilePath(), f]));

    function visit(file) {
        const filePath = file.getFilePath();
        if (visited.has(filePath)) return;
        if (visiting.has(filePath)) {
            console.warn(
                `      WARNING: Circular dependency detected involving: ${relativePath(
                    filePath
                )}`
            );
            return;
        }
        visiting.add(filePath);

        // Visit dependencies first (imports and re-exports)
        const dependencies = [
            ...file.getImportDeclarations(),
            ...file.getExportDeclarations(),
        ];

        for (const decl of dependencies) {
            const dep = decl.getModuleSpecifierSourceFile();
            if (dep && fileMap.has(dep.getFilePath())) {
                visit(dep);
            }
        }

        visiting.delete(filePath);
        visited.add(filePath);
        sorted.push(file);
    }

    for (const file of files) {
        visit(file);
    }

    return sorted;
}

// ============================================
// Step 4: Discover Mod Classes
// ============================================
function discoverModClasses(files) {
    const modClasses = [];

    for (const file of files) {
        for (const classDecl of file.getClasses()) {
            const className = classDecl.getName();
            if (!className) continue;

            // Check if implements IMod by looking at heritage clauses
            const implementsClause = classDecl.getHeritageClauseByKind(
                SyntaxKind.ImplementsKeyword
            );

            if (implementsClause) {
                const types = implementsClause.getTypeNodes();

                for (const typeNode of types) {
                    const expr = typeNode.getExpression();
                    const typeName = expr?.getText() || typeNode.getText();

                    if (typeName === "IMod") {
                        modClasses.push({
                            name: className,
                            classDecl,
                            file,
                        });
                        break;
                    }
                }
            }
        }
    }

    return modClasses;
}

// ============================================
// Step 5: Analyze Used Events
// ============================================
function analyzeUsedEvents(modClasses) {
    const usedEvents = new Set();

    for (const modClass of modClasses) {
        for (const method of modClass.classDecl.getMethods()) {
            const methodName = method.getName();
            if (EVENT_METHOD_TO_PORTAL_HANDLER[methodName]) {
                usedEvents.add(methodName);
            }
        }
    }

    return usedEvents;
}

// ============================================
// Step 6: Transform and Bundle
// ============================================
function transformAndBundle(files, modClasses, usedEvents) {
    let output = "";

    // Header
    output += "// ============================================\n";
    output += "// Cascade Framework - Bundled Output\n";
    output += `// Generated: ${new Date().toISOString()}\n`;
    output += `// Mod Classes: ${modClasses.length}\n`;
    output += `// Event Handlers: ${usedEvents.size}\n`;
    output += "// ============================================\n\n";

    // Process each file
    const sections = [];
    for (const file of files) {
        const relPath = relativePath(file.getFilePath());
        const transformedCode = transformFile(file);

        if (transformedCode.trim()) {
            sections.push(
                `// ===== Module: ${relPath} =====\n${transformedCode}`
            );
        }
    }

    output += sections.join("\n");
    output += "\n";

    // Generate mod registration
    output += generateModRegistration(modClasses);
    output += "\n";

    // Generate auto-initialization
    output += generateAutoInit(modClasses);
    output += "\n";

    // Generate event handlers
    output += generateEventHandlers(usedEvents);

    return output;
}

function transformFile(file) {
    // Use ts-morph to properly remove import/export declarations
    const sourceFile = file;

    // Get all import declarations and remove them
    const imports = sourceFile.getImportDeclarations();
    for (const importDecl of imports) {
        importDecl.remove();
    }

    // Get all export declarations and remove them
    const exportDecls = sourceFile.getExportDeclarations();
    for (const exportDecl of exportDecls) {
        exportDecl.remove();
    }

    // Remove export keywords from functions, classes, etc. (except public API)
    const publicAPI = [
        "plug",
        "unplug",
        "isModPlugged",
        "getAvailableMods",
        "getPluggedMods",
        "dispatchEvent",
    ];

    // Remove export keyword from functions (except public API)
    for (const func of sourceFile.getFunctions()) {
        if (func.isExported()) {
            const funcName = func.getName();
            if (!publicAPI.includes(funcName)) {
                func.setIsExported(false);
            }
        }
    }

    // Remove export keyword from classes
    for (const classDecl of sourceFile.getClasses()) {
        if (classDecl.isExported()) {
            classDecl.setIsExported(false);
        }
    }

    // Remove export keyword from interfaces
    for (const interfaceDecl of sourceFile.getInterfaces()) {
        if (interfaceDecl.isExported()) {
            interfaceDecl.setIsExported(false);
        }
    }

    // Remove export keyword from type aliases
    for (const typeAlias of sourceFile.getTypeAliases()) {
        if (typeAlias.isExported()) {
            typeAlias.setIsExported(false);
        }
    }

    // Remove export keyword from variable statements
    for (const varStatement of sourceFile.getVariableStatements()) {
        if (varStatement.isExported()) {
            varStatement.setIsExported(false);
        }
    }

    // Remove export keyword from namespaces
    for (const namespace of sourceFile.getModules()) {
        if (namespace.isExported()) {
            namespace.setIsExported(false);
        }
    }

    // Get the transformed text
    let code = sourceFile.getFullText();

    // Remove comments to save space
    code = stripComments(code);

    // Replace namespace imports (e.g., EventDispatcher.functionName -> functionName)
    // This handles the case where a file imports functions as a namespace
    code = code.replace(/EventDispatcher\./g, "");

    // Compress whitespace
    code = compressWhitespace(code);

    return code;
}

function stripComments(text) {
    // Remove multi-line comments
    let result = text.replace(/\/\*[\s\S]*?\*\//g, "");
    // Remove single-line comments
    result = result.replace(/\/\/.*$/gm, "");
    return result;
}

function compressWhitespace(text) {
    // Remove empty lines (lines with only whitespace)
    let result = text.replace(/^\s*[\r\n]/gm, "");

    // Reduce multiple consecutive blank lines to single blank line
    result = result.replace(/\n\n+/g, "\n");

    // Remove trailing whitespace from lines
    result = result.replace(/[ \t]+$/gm, "");

    return result;
}

function generateModRegistration(modClasses) {
    let code = "// ===== Auto-Generated Mod Registration =====\n";
    code += "// All mod classes are automatically registered here.\n";
    code += '// Use plug("ModName") at runtime to activate them.\n\n';

    for (const modClass of modClasses) {
        code += `registerModClass(${modClass.name}, "${modClass.name}");\n`;
    }

    return code;
}

function generateAutoInit(modClasses) {
    let code = "// ===== Auto-Generated Initialization =====\n";
    code += "// Automatically plug all mods on game start.\n";
    code += "// Remove this section if you want manual control.\n\n";

    code += "let modsInitialized = false;\n";
    code += "function initializeMods(): void {\n";
    code += "    if (modsInitialized) return;\n";
    code += '    console.log("[cascade] Initializing mods...");\n';

    for (const modClass of modClasses) {
        code += `    plug("${modClass.name}");\n`;
    }

    code += "    modsInitialized = true;\n";
    code += '    console.log("[cascade] All mods initialized");\n';
    code += "}\n";

    return code;
}

function generateEventHandlers(usedEvents) {
    let code = "// ===== Auto-Generated Portal Event Handlers =====\n";
    code += "// Only events used by your mods are included here.\n";
    code += "// Each handler forwards to the EventDispatcher.\n\n";

    let isFirstHandler = true;
    for (const eventMethod of usedEvents) {
        const portalHandler = EVENT_METHOD_TO_PORTAL_HANDLER[eventMethod];
        const signature = EVENT_SIGNATURES[eventMethod];

        if (!portalHandler || !signature) continue;

        // Extract parameter names for forwarding
        const params = signature.slice(1, -1); // Remove outer parentheses
        const paramNames = params
            .split(",")
            .map((p) => p.trim().split(":")[0].trim())
            .filter(Boolean);

        code += `export function ${portalHandler}${signature}: void {\n`;

        // Add initialization call to the first event handler
        if (isFirstHandler) {
            code += "    initializeMods();\n";
            isFirstHandler = false;
        }
        code += `    dispatchEvent("${eventMethod}"`;
        if (paramNames.length > 0) {
            code += `, ${paramNames.join(", ")}`;
        }
        code += ");\n";
        code += "}\n";
    }

    return code;
}

// ============================================
// Utilities
// ============================================
function relativePath(filePath) {
    return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

// ============================================
// Run
// ============================================
main().catch((error) => {
    console.error("ERROR: Bundle failed:");
    console.error(error);
    process.exit(1);
});
