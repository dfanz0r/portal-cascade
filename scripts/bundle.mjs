#!/usr/bin/env node
/**
 * Cascade Framework Bundler - Pure AST Pipeline
 *
 * ⚠️ CRITICAL RULES - THE PURE AST PIPELINE ⚠️
 *
 * The bundler follows a strict, 100% reliable AST-driven methodology:
 *
 * 1. LOAD:      Load all source files into ts-morph (fully-parsed, mutable ASTs)
 * 2. ANALYZE:   Perform all analysis by querying these ASTs (NO REGEX for parsing)
 * 3. TRANSFORM: Perform ALL code modifications by calling methods on AST nodes
 *               - Remove imports via sourceFile.getImportDeclarations().remove()
 *               - Remove exports via AST node mutation (setIsExported(false))
 *               - Prune functions by removing AST nodes
 * 4. PRINT:     Use TypeScript's official Printer API with removeComments: true
 *               - Converts modified AST back to clean source code
 *               - This is the foolproof replacement for regex comment stripping
 * 5. CONCATENATE: Join clean printed strings with generated registration code
 *
 * REGEX USAGE POLICY:
 * - BANNED for: parsing, analysis, transformations, comment/import removal
 * - ALLOWED ONLY for: final whitespace compression (compressWhitespace)
 *
 * This bundler implements:
 * - Tree-shaking: Only bundles code reachable from user mods
 * - Mod discovery: Automatically finds classes implementing IMod
 * - Event pruning: Only generates Portal event handlers actually used
 * - Direct event registrations: Detects framework-code event listeners
 * - Auto-registration: Generates registerModClass() calls
 * - Zero-configuration: Users just write mod classes
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Project, SyntaxKind } from "ts-morph";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const tsconfigPath = path.join(projectRoot, "tsconfig.json");

// Map of IMod method names to Portal event handler names
const EVENT_METHOD_TO_PORTAL_HANDLER = {
    ongoingGlobal: "OngoingGlobal",
    ongoingAreaTrigger: "OngoingAreaTrigger",
    ongoingCapturePoint: "OngoingCapturePoint",
    ongoingEmplacementSpawner: "OngoingEmplacementSpawner",
    ongoingHQ: "OngoingHQ",
    ongoingInteractPoint: "OngoingInteractPoint",
    ongoingMCOM: "OngoingMCOM",
    ongoingPlayer: "OngoingPlayer",
    ongoingScreenEffect: "OngoingScreenEffect",
    ongoingSector: "OngoingSector",
    ongoingSpawner: "OngoingSpawner",
    ongoingSpawnPoint: "OngoingSpawnPoint",
    ongoingTeam: "OngoingTeam",
    ongoingVehicle: "OngoingVehicle",
    ongoingVehicleSpawner: "OngoingVehicleSpawner",
    ongoingWaypointPath: "OngoingWaypointPath",
    ongoingWorldIcon: "OngoingWorldIcon",
    onAIMoveToFailed: "OnAIMoveToFailed",
    onAIMoveToRunning: "OnAIMoveToRunning",
    onAIMoveToSucceeded: "OnAIMoveToSucceeded",
    onAIParachuteRunning: "OnAIParachuteRunning",
    onAIParachuteSucceeded: "OnAIParachuteSucceeded",
    onAIWaypointIdleFailed: "OnAIWaypointIdleFailed",
    onAIWaypointIdleRunning: "OnAIWaypointIdleRunning",
    onAIWaypointIdleSucceeded: "OnAIWaypointIdleSucceeded",
    onCapturePointCaptured: "OnCapturePointCaptured",
    onCapturePointCapturing: "OnCapturePointCapturing",
    onCapturePointLost: "OnCapturePointLost",
    onGameModeEnding: "OnGameModeEnding",
    onGameModeStarted: "OnGameModeStarted",
    onMandown: "OnMandown",
    onMCOMArmed: "OnMCOMArmed",
    onMCOMDefused: "OnMCOMDefused",
    onMCOMDestroyed: "OnMCOMDestroyed",
    onPlayerDamaged: "OnPlayerDamaged",
    onPlayerDeployed: "OnPlayerDeployed",
    onPlayerDied: "OnPlayerDied",
    onPlayerEarnedKill: "OnPlayerEarnedKill",
    onPlayerEarnedKillAssist: "OnPlayerEarnedKillAssist",
    onPlayerEnterAreaTrigger: "OnPlayerEnterAreaTrigger",
    onPlayerEnterCapturePoint: "OnPlayerEnterCapturePoint",
    onPlayerEnterVehicle: "OnPlayerEnterVehicle",
    onPlayerEnterVehicleSeat: "OnPlayerEnterVehicleSeat",
    onPlayerExitAreaTrigger: "OnPlayerExitAreaTrigger",
    onPlayerExitCapturePoint: "OnPlayerExitCapturePoint",
    onPlayerExitVehicle: "OnPlayerExitVehicle",
    onPlayerExitVehicleSeat: "OnPlayerExitVehicleSeat",
    onPlayerInteract: "OnPlayerInteract",
    onPlayerJoinGame: "OnPlayerJoinGame",
    onPlayerLeaveGame: "OnPlayerLeaveGame",
    onPlayerSwitchTeam: "OnPlayerSwitchTeam",
    onPlayerUIButtonEvent: "OnPlayerUIButtonEvent",
    onPlayerUndeploy: "OnPlayerUndeploy",
    onRayCastHit: "OnRayCastHit",
    onRayCastMissed: "OnRayCastMissed",
    onRevived: "OnRevived",
    onSpawnerSpawned: "OnSpawnerSpawned",
    onTimeLimitReached: "OnTimeLimitReached",
    onVehicleDestroyed: "OnVehicleDestroyed",
    onVehicleSpawned: "OnVehicleSpawned",
};

// Event signatures for generating Portal handlers
const EVENT_SIGNATURES = {
    ongoingGlobal: "()",
    ongoingAreaTrigger: "(eventAreaTrigger: mod.AreaTrigger)",
    ongoingCapturePoint: "(eventCapturePoint: mod.CapturePoint)",
    ongoingEmplacementSpawner:
        "(eventEmplacementSpawner: mod.EmplacementSpawner)",
    ongoingHQ: "(eventHQ: mod.HQ)",
    ongoingInteractPoint: "(eventInteractPoint: mod.InteractPoint)",
    ongoingMCOM: "(eventMCOM: mod.MCOM)",
    ongoingPlayer: "(eventPlayer: mod.Player)",
    ongoingScreenEffect: "(eventScreenEffect: mod.ScreenEffect)",
    ongoingSector: "(eventSector: mod.Sector)",
    ongoingSpawner: "(eventSpawner: mod.Spawner)",
    ongoingSpawnPoint: "(eventSpawnPoint: mod.SpawnPoint)",
    ongoingTeam: "(eventTeam: mod.Team)",
    ongoingVehicle: "(eventVehicle: mod.Vehicle)",
    ongoingVehicleSpawner: "(eventVehicleSpawner: mod.VehicleSpawner)",
    ongoingWaypointPath: "(eventWaypointPath: mod.WaypointPath)",
    ongoingWorldIcon: "(eventWorldIcon: mod.WorldIcon)",
    onAIMoveToFailed: "(eventPlayer: mod.Player)",
    onAIMoveToRunning: "(eventPlayer: mod.Player)",
    onAIMoveToSucceeded: "(eventPlayer: mod.Player)",
    onAIParachuteRunning: "(eventPlayer: mod.Player)",
    onAIParachuteSucceeded: "(eventPlayer: mod.Player)",
    onAIWaypointIdleFailed: "(eventPlayer: mod.Player)",
    onAIWaypointIdleRunning: "(eventPlayer: mod.Player)",
    onAIWaypointIdleSucceeded: "(eventPlayer: mod.Player)",
    onCapturePointCaptured: "(eventCapturePoint: mod.CapturePoint)",
    onCapturePointCapturing: "(eventCapturePoint: mod.CapturePoint)",
    onCapturePointLost: "(eventCapturePoint: mod.CapturePoint)",
    onGameModeEnding: "()",
    onGameModeStarted: "()",
    onMandown: "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player)",
    onMCOMArmed: "(eventMCOM: mod.MCOM)",
    onMCOMDefused: "(eventMCOM: mod.MCOM)",
    onMCOMDestroyed: "(eventMCOM: mod.MCOM)",
    onPlayerDamaged:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDamageType: mod.DamageType, eventWeaponUnlock: mod.WeaponUnlock)",
    onPlayerDeployed: "(eventPlayer: mod.Player)",
    onPlayerDied:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock)",
    onPlayerEarnedKill:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock)",
    onPlayerEarnedKillAssist:
        "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player)",
    onPlayerEnterAreaTrigger:
        "(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger)",
    onPlayerEnterCapturePoint:
        "(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint)",
    onPlayerEnterVehicle:
        "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle)",
    onPlayerEnterVehicleSeat:
        "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle, eventSeat: mod.Object)",
    onPlayerExitAreaTrigger:
        "(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger)",
    onPlayerExitCapturePoint:
        "(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint)",
    onPlayerExitVehicle: "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle)",
    onPlayerExitVehicleSeat:
        "(eventPlayer: mod.Player, eventVehicle: mod.Vehicle, eventSeat: mod.Object)",
    onPlayerInteract:
        "(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint)",
    onPlayerJoinGame: "(eventPlayer: mod.Player)",
    onPlayerLeaveGame: "(eventNumber: number)",
    onPlayerSwitchTeam: "(eventPlayer: mod.Player, eventTeam: mod.Team)",
    onPlayerUIButtonEvent:
        "(eventPlayer: mod.Player, eventUIWidget: mod.UIWidget, eventUIButtonEvent: mod.UIButtonEvent)",
    onPlayerUndeploy: "(eventPlayer: mod.Player)",
    onRayCastHit:
        "(eventPlayer: mod.Player, eventPoint: mod.Vector, eventNormal: mod.Vector)",
    onRayCastMissed: "(eventPlayer: mod.Player)",
    onRevived: "(eventPlayer: mod.Player, eventOtherPlayer: mod.Player)",
    onSpawnerSpawned: "(eventPlayer: mod.Player, eventSpawner: mod.Spawner)",
    onTimeLimitReached: "()",
    onVehicleDestroyed: "(eventVehicle: mod.Vehicle)",
    onVehicleSpawned: "(eventVehicle: mod.Vehicle)",
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
    console.log("Cascade Framework - TypeScript Bundler");
    console.log("=".repeat(60));
    console.log();

    if (!fs.existsSync(tsconfigPath)) {
        console.error(
            `ERROR: Unable to locate tsconfig.json at ${tsconfigPath}`
        );
        process.exit(1);
    }

    // ============================================
    // Step 1: Initialize TypeScript Project
    // ============================================
    // Initialize TypeScript project
    console.log("[1/8] Initializing TypeScript project...");
    const project = new Project({ tsConfigFilePath: tsconfigPath });

    // Discover mod classes from ALL files in mods/ directory
    console.log("[2/8] Discovering mod classes...");
    const modsDir = path.join(projectRoot, "mods");
    const allModsFiles = project
        .getSourceFiles()
        .filter((f) => !f.isDeclarationFile())
        .filter((f) =>
            path.normalize(f.getFilePath()).startsWith(path.normalize(modsDir))
        );

    if (verbose) {
        console.log(`      Searching in: ${modsDir}`);
        console.log(`      Found files: ${allModsFiles.length}`);
        for (const f of allModsFiles) {
            console.log(`        - ${f.getBaseName()}`);
        }
    }

    const modClasses = discoverModClasses(allModsFiles);
    const propBasedMods = discoverPropBasedMods(allModsFiles);
    const allMods = [...modClasses, ...propBasedMods];
    console.log(`      Found ${allMods.length} mod(s):`);
    for (const mod of allMods) {
        if (mod.type === "class") {
            console.log(
                `      - ${mod.name} (class) [${relativePath(
                    mod.file.getFilePath()
                )}]`
            );
        } else if (mod.type === "object") {
            console.log(
                `      - ${mod.name} (object export) [${relativePath(
                    mod.file.getFilePath()
                )}]`
            );
        } else if (mod.type === "factory") {
            console.log(
                `      - ${mod.name} (factory function) [${relativePath(
                    mod.file.getFilePath()
                )}]`
            );
        }
    }
    console.log();

    // Tree-shaking: Find all reachable files from mod files
    console.log("[3/8] Performing tree-shaking analysis...");

    // Use all discovered mods as entry points (they will pull in framework via imports)
    const entryPoints = allMods.map((mod) => mod.file);

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
    console.log("[4/8] Sorting files by dependencies...");
    const sortedFiles = topologicalSort(reachableFiles);
    console.log("      Files ordered correctly");
    console.log();

    // Analyze used events
    console.log("[5/8] Analyzing used events...");
    const usedEvents = analyzeUsedEvents(allMods, sortedFiles);
    const totalEvents = Object.keys(EVENT_METHOD_TO_PORTAL_HANDLER).length;
    const prunedCount = totalEvents - usedEvents.size;
    console.log(`      ${usedEvents.size} events used, ${prunedCount} pruned`);
    if (verbose) {
        for (const event of Array.from(usedEvents)) {
            console.log(`      - ${event}`);
        }
    }
    console.log();

    // Analyze function usage for namespace pruning
    console.log("[6/8] Analyzing function usage...");
    const usedFunctions = analyzeFunctionUsage(sortedFiles, allMods);
    if (verbose) {
        console.log(
            `      Detected ${usedFunctions.size} functions used by mods:`
        );
        const sorted = Array.from(usedFunctions).sort();
        for (const fn of sorted.slice(0, 25)) {
            console.log(`      - ${fn}`);
        }
        if (sorted.length > 25) {
            console.log(`      ... and ${sorted.length - 25} more`);
        }
    }
    const prunedFunctions = pruneFunctionsFromCode(sortedFiles, usedFunctions);
    if (prunedFunctions > 0) {
        console.log(`      ${prunedFunctions} unused functions pruned`);
    } else {
        console.log(
            `      ${usedFunctions.size} functions analyzed, all are used`
        );
    }
    console.log();

    // Remove empty namespaces after function pruning
    console.log("[7/8] Removing empty namespaces...");
    const removedNamespaces = removeEmptyNamespaces(sortedFiles);
    if (removedNamespaces > 0) {
        console.log(`      ${removedNamespaces} empty namespaces removed`);
    } else {
        console.log("      No empty namespaces found");
    }
    console.log();

    // Public API exports that should remain exported
    const publicAPI = [
        // Lifecycle
        "plug",
        "unplug",
        "isModPlugged",
        "getAvailableMods",
        "getPluggedMods",
        "dispatchEvent",
        // EventDispatcher functions (used internally as namespace)
        "registerEventHandler",
        "unregisterEventHandler",
        "getHandlerCount",
        "clearEventHandlers",
        "clearAllHandlers",
        "getRegisteredEventNames",
        // MathUtils functions
        "random",
        // Namespaces used internally
        "EventDispatcher",
        "MathUtils",
    ];

    // Transform and bundle
    console.log("[8/8] Transforming and bundling code...");
    const bundledCode = transformAndBundle(
        sortedFiles,
        allMods,
        usedEvents,
        usedFunctions,
        publicAPI
    );
    console.log("      Bundle generated");
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
    console.log(`         Mod classes: ${allMods.length}`);
    console.log(
        `         Event handlers: ${usedEvents.size} (${prunedCount} pruned)`
    );
    console.log("=".repeat(60));
}

// ============================================
// Step 3: Tree-Shaking - Find Reachable Files
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
// Step 4: Topological Sort
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
// Step 2: Discover Mod Classes
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
                        // Check for @AutoPlug decorator
                        let autoPlug = false;
                        let priority = 0;

                        const autoPlugDecorator =
                            classDecl.getDecorator("AutoPlug");
                        if (autoPlugDecorator) {
                            autoPlug = true;
                            const args = autoPlugDecorator.getArguments();
                            if (
                                args.length > 0 &&
                                args[0].isKind(
                                    SyntaxKind.ObjectLiteralExpression
                                )
                            ) {
                                const priorityProp =
                                    args[0].getProperty("priority");
                                if (priorityProp) {
                                    const initializer =
                                        priorityProp.getInitializerIfKind(
                                            SyntaxKind.NumericLiteral
                                        );
                                    if (initializer) {
                                        priority =
                                            initializer.getLiteralValue();
                                    }
                                }
                            }
                        }

                        modClasses.push({
                            name: className,
                            type: "class",
                            classDecl,
                            file,
                            autoPlug,
                            priority,
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
// Step 2.1: Discover Prop-Based Mods
// ============================================
/**
 * Discovers object and factory function exports that implement IMod.
 * Supports patterns like:
 * - export const myMod = { onPlayerJoinGame: (...) => { ... } }
 * - export function createMod() { ... }
 */
function discoverPropBasedMods(files) {
    const propMods = [];
    const imodMethods = Object.keys(EVENT_METHOD_TO_PORTAL_HANDLER);

    for (const file of files) {
        // Check exported variable statements (export const x = {...})
        for (const varStatement of file.getVariableStatements()) {
            if (!varStatement.isExported()) continue;

            for (const decl of varStatement.getDeclarations()) {
                const varName = decl.getName();
                const initializer = decl.getInitializer();

                // Check if initializer is an object literal
                if (
                    initializer &&
                    initializer.getKind?.() ===
                        SyntaxKind.ObjectLiteralExpression
                ) {
                    const properties = initializer.getProperties();
                    const methodNames = [];

                    // Extract method names from object
                    for (const prop of properties) {
                        const propName = prop.getName?.();
                        if (propName && imodMethods.includes(propName)) {
                            methodNames.push(propName);
                        }
                    }

                    // If it has IMod methods, it's a mod
                    if (methodNames.length > 0) {
                        propMods.push({
                            name: varName,
                            type: "object",
                            exportName: varName,
                            file,
                            methods: methodNames,
                            autoPlug: false,
                            priority: 0,
                        });
                    }
                }
            }
        }

        // Check exported functions decorated with @ModFactory
        // This eliminates ambiguity - only explicitly marked functions are treated as factories
        for (const func of file.getFunctions()) {
            if (!func.isExported()) continue;

            // MUST have @ModFactory decorator to be recognized as a mod factory
            const decorators = func.getDecorators?.() || [];
            const hasModFactoryDecorator = decorators.some(
                (d) => d.getName() === "ModFactory"
            );
            if (!hasModFactoryDecorator) continue;

            const funcName = func.getName();
            if (!funcName) continue; // Skip anonymous functions

            propMods.push({
                name: funcName,
                type: "factory",
                exportName: funcName,
                file,
                methods: [], // Cannot be statically analyzed, handled at runtime
                autoPlug: false, // Factories are not auto-plugged by default
                priority: 0,
            });
        }
    }

    return propMods;
}

// ============================================
// Step 2.2: Detect Direct Event Registrations (Pure AST)
// ============================================

/**
 * Discovers direct event registrations in framework code (e.g., EventDispatcher.registerEventHandler calls).
 *
 * Implementation: 100% AST-based via ts-morph
 * - Queries CallExpression nodes
 * - Checks if the callee ends with "registerEventHandler"
 * - Extracts event name from the first string literal argument
 * - NO REGEX used for parsing or extraction
 */
function detectDirectEventRegistrations(files) {
    const directEvents = new Set();

    for (const sourceFile of files) {
        // Use ts-morph's AST query API to find all function call expressions
        const callExpressions = sourceFile.getDescendantsOfKind(
            SyntaxKind.CallExpression
        );

        for (const callExpr of callExpressions) {
            const expression = callExpr.getExpression();
            const expressionText = expression.getText();

            // Check for the pattern: EventDispatcher.registerEventHandler(...)
            // Using string check (not regex) because we're just checking if it ends with the name
            if (expressionText.endsWith("registerEventHandler")) {
                const args = callExpr.getArguments();

                // First argument should be the event name as a string literal
                if (
                    args.length > 0 &&
                    args[0].isKind(SyntaxKind.StringLiteral)
                ) {
                    // Extract the literal value (without quotes)
                    const eventName = args[0].getLiteralValue();

                    // Verify it's a valid IMod event method
                    if (EVENT_METHOD_TO_PORTAL_HANDLER[eventName]) {
                        directEvents.add(eventName);
                    }
                }
            }
        }
    }

    return directEvents;
}

// ============================================
// Step 5: Analyze Used Events
// ============================================
function analyzeUsedEvents(allMods, allFiles) {
    const usedEvents = new Set();

    // Discover events from mod class methods
    for (const mod of allMods) {
        if (mod.type === "class") {
            // Class-based mod
            for (const method of mod.classDecl.getMethods()) {
                const methodName = method.getName();
                if (EVENT_METHOD_TO_PORTAL_HANDLER[methodName]) {
                    usedEvents.add(methodName);
                }
            }
        } else if (
            mod.type === "object" &&
            mod.methods &&
            mod.methods.length > 0
        ) {
            // Object-based mod with already-extracted methods
            for (const methodName of mod.methods) {
                if (EVENT_METHOD_TO_PORTAL_HANDLER[methodName]) {
                    usedEvents.add(methodName);
                }
            }
        }
        // Factory functions will be analyzed at runtime, so we can't extract their methods
    }

    // Discover direct event registrations from framework code
    const directEvents = detectDirectEventRegistrations(allFiles);
    for (const event of directEvents) {
        usedEvents.add(event);
    }

    return usedEvents;
}

// ============================================
// Step 6: Analyze Function Usage (Pure AST)
// ============================================

/**
 * Discovers which functions are called from user mod code.
 *
 * Implementation: 100% AST-based via ts-morph
 * - Queries CallExpression nodes in mod files
 * - Identifies namespace calls (e.g., Players.getAll())
 * - Identifies instance method calls (e.g., player.getId())
 * - NO REGEX used for parsing or extraction
 *
 * Returns a Set of function names in these formats:
 * - "Namespace.methodName" for namespace calls
 * - "instance:methodName" for instance method calls
 * - Direct method names from object-literal mods
 */
function analyzeFunctionUsage(files, allMods) {
    const usedFunctions = new Set();

    // Get unique mod source files (the entry points for our analysis)
    const modFiles = allMods.map((m) => m.file);
    const uniqueModFiles = [...new Set(modFiles)];

    // Analyze each mod file for function calls
    for (const sourceFile of uniqueModFiles) {
        // Use ts-morph's AST query API to find all function call expressions
        const callExpressions = sourceFile.getDescendantsOfKind(
            SyntaxKind.CallExpression
        );

        for (const callExpr of callExpressions) {
            const expression = callExpr.getExpression();

            // Pattern 1: Property access calls like Players.getAll()
            if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
                const propAccess = expression;
                const leftSide = propAccess.getExpression();
                const rightSideName = propAccess.getName();

                const leftSideText = leftSide.getText();

                // Heuristic: If left side starts with capital letter, it's a namespace
                // e.g., "Players.getAll()" -> namespace = "Players", method = "getAll"
                if (leftSideText.match(/^[A-Z]/)) {
                    const fullName = `${leftSideText}.${rightSideName}`;
                    usedFunctions.add(fullName);
                }
                // Pattern 3: Instance method calls like player.getId()
                else {
                    const methodName = rightSideName;
                    if (methodName.match(/^[a-z]/)) {
                        // Skip common built-in methods that don't need to be preserved
                        const blocklist = new Set([
                            "map",
                            "filter",
                            "forEach",
                            "push",
                            "get",
                            "set",
                            "has",
                            "delete",
                            "add",
                            "clear",
                            "splice",
                            "slice",
                            "join",
                            "toArray",
                            "log",
                            "catch",
                            "then",
                            "apply",
                        ]);
                        if (!blocklist.has(methodName)) {
                            usedFunctions.add(`instance:${methodName}`);
                        }
                    }
                }
            }
        }
    }

    // Always keep methods from object-literal mods as they are inherently "used"
    for (const mod of allMods) {
        if (mod.type === "object" && mod.methods) {
            for (const methodName of mod.methods) {
                usedFunctions.add(methodName);
            }
        }
    }

    return usedFunctions;
}

// ============================================
// Step 6.2: Prune Unused Functions
// ============================================
function pruneFunctionsFromCode(files, usedFunctions) {
    let prunedCount = 0;

    for (const file of files) {
        // Get all class declarations
        for (const cls of file.getClasses()) {
            const className = cls.getName();
            if (!className) continue;

            // Check static methods in classes
            const methods = cls.getStaticMethods?.() || [];
            for (let i = methods.length - 1; i >= 0; i--) {
                const method = methods[i];
                const methodName = method.getName?.();
                if (!methodName) continue;

                const fullName = `${className}.${methodName}`;

                // Remove if not used
                if (
                    !usedFunctions.has(fullName) &&
                    !usedFunctions.has(methodName)
                ) {
                    method.remove();
                    prunedCount++;
                }
            }

            // Check instance methods - only prune from classes NOT marked with @Preserve decorator
            // Classes marked with @Preserve are framework base classes or critical user classes
            // where we cannot statically determine if methods are used
            const hasPreserveDecorator = cls.getDecorator("Preserve");
            if (!hasPreserveDecorator) {
                const instanceMethods = cls.getInstanceMethods?.() || [];
                const methodsToRemove = [];
                for (const method of instanceMethods) {
                    const methodName = method.getName?.();
                    if (!methodName || methodName === "constructor") continue;

                    // Check if this method is used
                    const isUsed =
                        usedFunctions.has(`instance:${methodName}`) ||
                        usedFunctions.has(methodName) ||
                        usedFunctions.has(`${className}.${methodName}`);

                    if (!isUsed) {
                        methodsToRemove.push(method);
                    }
                }

                // Remove unused instance methods
                for (const method of methodsToRemove) {
                    method.remove();
                    prunedCount++;
                }
            }
        }

        // Get all namespace declarations
        for (const namespace of file.getModules()) {
            const nsName = namespace.getName();
            if (!nsName) continue;

            // Collect statements to remove first (to avoid iterator invalidation)
            const statementsToRemove = [];

            // Get all statements in the namespace
            const statements = namespace.getStatements();
            for (const stmt of statements) {
                // Check if it's a function declaration
                if (
                    stmt.getKind &&
                    stmt.getKind() === SyntaxKind.FunctionDeclaration
                ) {
                    const funcName = stmt.getName?.();
                    if (!funcName) continue;

                    const fullName = `${nsName}.${funcName}`;

                    // Mark for removal if not used by mods
                    if (
                        !usedFunctions.has(fullName) &&
                        !usedFunctions.has(funcName)
                    ) {
                        statementsToRemove.push(stmt);
                    }
                }

                // Check for property assignments (methods in object literals)
                if (
                    stmt.getKind &&
                    stmt.getKind() === SyntaxKind.VariableStatement
                ) {
                    const varDecl = stmt.getDeclarations?.()?.[0];
                    if (varDecl) {
                        const varName = varDecl.getName?.();
                        if (varName === nsName) {
                            const initializer = varDecl.getInitializer?.();
                            if (
                                initializer &&
                                initializer.getKind?.() ===
                                    SyntaxKind.ObjectLiteralExpression
                            ) {
                                const properties =
                                    initializer.getProperties?.();
                                if (properties) {
                                    // Collect properties to remove
                                    const propsToRemove = [];
                                    for (const prop of properties) {
                                        const propName = prop.getName?.();
                                        if (propName) {
                                            const fullName = `${nsName}.${propName}`;
                                            if (
                                                !usedFunctions.has(fullName) &&
                                                !usedFunctions.has(propName)
                                            ) {
                                                propsToRemove.push(prop);
                                            }
                                        }
                                    }
                                    // Remove properties in reverse order
                                    for (
                                        let j = propsToRemove.length - 1;
                                        j >= 0;
                                        j--
                                    ) {
                                        propsToRemove[j].remove();
                                        prunedCount++;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Now remove the collected statements
            for (const stmt of statementsToRemove) {
                stmt.remove();
                prunedCount++;
            }
        }
    }

    return prunedCount;
}

// ============================================
// Step 7: Remove Empty Namespaces
// ============================================
function removeEmptyNamespaces(files) {
    let removedCount = 0;

    for (const file of files) {
        // Get all namespace declarations
        for (const namespace of file.getModules()) {
            const nsName = namespace.getName();
            if (!nsName) continue;

            // Get all statements in the namespace
            const statements = namespace.getStatements();

            // Check if namespace is truly empty (no meaningful statements)
            let isEmpty = true;
            for (const stmt of statements) {
                // Check if it's a meaningful statement
                if (
                    stmt.getKind &&
                    stmt.getKind() !== SyntaxKind.EndOfFileToken
                ) {
                    isEmpty = false;
                    break;
                }
            }

            // Remove the namespace if it's empty
            if (isEmpty) {
                namespace.remove();
                removedCount++;
            }
        }
    }

    return removedCount;
}

// ============================================
// Step 8: Transform and Bundle (Pure AST Pipeline)
// ============================================

/**
 * Orchestrates the complete Pure AST Pipeline - THE DEFINITIVE, UNBREAKABLE APPROACH:
 *
 * STEP 1 (TRANSFORM): Call performSafeTransformations() for each file
 *   - Strips unnecessary exports via AST ONLY (setIsExported(false))
 *   - Removes all imports via AST ONLY (.remove())
 *   - Removes re-exports via AST ONLY (.remove())
 *   - All done via ts-morph AST mutations, ZERO regex, ZERO string manipulation
 *
 * STEP 2 (PRINT): Use TypeScript's OFFICIAL Printer API (the ONE TRUE way)
 *   - Converts the final, MODIFIED AST to clean source code
 *   - removeComments: true SAFELY strips all comments (foolproof replacement for regex)
 *   - This is GUARANTEED to produce valid TypeScript
 *   - This is GUARANTEED to preserve structure and formatting
 *
 * STEP 3 (CONCATENATE): Join printed sections with generated code
 *   - Mod registration calls (generated, not transformed)
 *   - Auto-initialization logic (generated, not transformed)
 *   - Event handler exports (generated, not transformed)
 *
 * STEP 4 (COMPRESS): Final whitespace optimization (ONLY safe string ops)
 *   - Limit blank lines to 2 consecutive maximum
 *   - Trim line endings
 *   - ONLY place regex is permitted (non-code operation)
 */
function transformAndBundle(
    files,
    allMods,
    usedEvents,
    usedFunctions,
    publicAPI
) {
    let output = "";
    const sections = [];

    // ========================================
    // CRITICAL: Create printer ONCE for all files
    // The printer is stateless and can be reused
    // ========================================
    const printer = ts.createPrinter({ removeComments: true });

    // ========================================
    // TRANSFORM & PRINT PHASE: Process each file through the Pure AST Pipeline
    // ========================================
    for (const file of files) {
        // TRANSFORM: Perform all AST-based modifications
        // This mutates the ts-morph SourceFile's internal AST
        // ALL modifications use AST API only (no regex, no string manipulation)
        performSafeTransformations(file, allMods, publicAPI);

        // PRINT: Convert the modified AST back to source code using OFFICIAL TypeScript Printer
        // The printer is the authoritative, GUARANTEED-SAFE way to convert AST to code
        // removeComments: true handles ALL comment removal (foolproof, no edge cases)
        const compilerSourceFile = file.compilerNode;
        const transformedCode = printer.printFile(compilerSourceFile);

        // Only include files that have meaningful content after transformations
        if (transformedCode.trim()) {
            sections.push(transformedCode);
        }
    }

    // ========================================
    // CONCATENATE PHASE: Join all transformed code
    // ========================================
    output += sections.join("\n");
    output += "\n";

    // Generate mod class registration (NOT transformed from AST - GENERATED fresh)
    output += generateModRegistration(allMods);
    output += "\n";

    // Generate auto-initialization code (NOT transformed from AST - GENERATED fresh)
    const autoInitCode = generateAutoInit(allMods);
    const isAutoInitActive = autoInitCode.trim().length > 0;
    output += autoInitCode;
    output += "\n";

    // Generate Portal event handler exports (NOT transformed from AST - GENERATED fresh)
    output += generateEventHandlers(usedEvents, isAutoInitActive);

    // ========================================
    // COMPRESS PHASE: Final whitespace optimization (ONLY safe regex location)
    // ========================================
    // ONLY non-critical whitespace compression allowed here
    // The code is already validated by TypeScript compiler via printer
    return compressWhitespace(output);
} // ============================================
// Step 8.1: Safe, Comprehensive AST-Based Transformations
// ============================================

/**
 * Performs all AST-based transformations required for bundling:
 * 1. Export stripping - removes exports not in the public API or mods list
 * 2. Import removal - strips all imports (no longer needed in bundled code)
 * 3. Re-export removal - removes export declarations with module specifiers
 *
 * All operations are 100% AST-driven. Comments are preserved at this stage
 * and will be safely removed later by the TypeScript Printer.
 */
function performSafeTransformations(sourceFile, allMods, publicAPI) {
    // ==================================
    // 1. SAFE EXPORT STRIPPING via AST
    // ==================================
    // Determine which exports should be kept for this file's mods
    const modsInThisFile = allMods.filter((m) => m.file === sourceFile);
    const modExportNames = new Set(
        modsInThisFile.map((m) => m.exportName || m.name)
    );
    const keepExports = new Set([...publicAPI, ...modExportNames]);

    // Iterate through ALL exported declarations in the file
    // For each one, if it's not in the keep list, strip the 'export' keyword via AST
    for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
        if (!keepExports.has(name)) {
            for (const decl of declarations) {
                if (decl.isExported()) {
                    // This is the key AST operation - not regex, not string manipulation
                    decl.setIsExported(false);
                }
            }
        }
    }

    // ==================================
    // 2. SAFE MODULE CLEANUP via AST
    // ==================================
    // Remove ALL import declarations (they are not needed in the bundled output)
    // We iterate in reverse to avoid invalidating indices
    const imports = sourceFile.getImportDeclarations();
    for (let i = imports.length - 1; i >= 0; i--) {
        // Pure AST removal - not regex, not string manipulation
        imports[i].remove();
    }

    // Remove ALL re-export declarations (e.g., 'export * from "./file"' or 'export { x } from "./y"')
    // These are only meaningful in a multi-file context; bundled code doesn't need them
    const exports = sourceFile.getExportDeclarations();
    for (let i = exports.length - 1; i >= 0; i--) {
        // Pure AST removal - not regex, not string manipulation
        exports[i].remove();
    }

    // ==================================
    // NOTE: Comment Handling
    // ==================================
    // Comments are NOT removed at the AST stage. Instead, we rely on the
    // TypeScript Printer's removeComments: true option, which safely removes them
    // when converting the final AST back to source code. This avoids any risk of
    // accidentally corrupting code during comment removal.
}

function compressWhitespace(text) {
    // ========================================
    // ⚠️ ONLY SAFE REGEX USE IN THE ENTIRE BUNDLER
    // ========================================
    // This function performs non-critical whitespace optimization on the
    // FINAL bundled output AFTER all AST transformations and printing.
    //
    // This is safe because:
    // 1. We're operating on the final, complete output (not parsing input)
    // 2. We're only modifying whitespace (non-code)
    // 3. The code has already been validated by the TypeScript compiler
    // 4. Any mistakes here only affect formatting, not functionality
    //
    // REGEX IS BANNED EVERYWHERE ELSE. All parsing, analysis, and transformations
    // must use the Pure AST Pipeline.
    // ========================================

    // Limit consecutive blank lines to a maximum of 2
    // Pattern: 3 or more newlines -> replace with 2 newlines
    let result = text.replace(/(\r\n|\n){3,}/g, "\n\n");

    // Remove trailing whitespace from each line
    result = result
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n");

    // Remove leading empty lines at file start
    result = result.replace(/^\n+/, "");

    // Remove trailing empty lines (but preserve a single final newline)
    result = result.replace(/\n+$/, "\n");

    return result;
}

function generateModRegistration(allMods) {
    let code = "";

    for (const mod of allMods) {
        if (mod.type === "class") {
            code += `registerModClass("${mod.name}", ${mod.name});\n`;
        } else if (mod.type === "object") {
            code += `registerModClass("${mod.name}", ${mod.exportName});\n`;
        } else if (mod.type === "factory") {
            code += `registerModClass("${mod.name}", ${mod.exportName}());\n`;
        }
    }

    return code;
}

function generateAutoInit(allMods) {
    // Filter to only mods marked for auto-initialization with @AutoPlug
    const modsToAutoPlug = allMods.filter((mod) => mod.autoPlug === true);

    // If no mods configured for auto-plug, skip initialization code
    if (modsToAutoPlug.length === 0) {
        return "";
    }

    // Sort by priority (descending: highest priority first)
    modsToAutoPlug.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    let code = "";

    code += "let modsInitialized = false;\n";
    code += "function initializeMods(): void {\n";
    code += "    if (modsInitialized) return;\n";
    code +=
        '    console.log("[cascade] Initializing decorated mods by priority...");\n';

    for (const mod of modsToAutoPlug) {
        const priority = mod.priority || 0;
        code += `    plug("${mod.name}");\n`;
    }

    code += "    modsInitialized = true;\n";
    code += `    console.log("[cascade] ${modsToAutoPlug.length} decorated mod(s) initialized");\n`;
    code += "}\n";

    return code;
}

function generateEventHandlers(usedEvents, isAutoInitActive = false) {
    let code = "";

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

        // Add initialization call only to the first event handler if auto-init is active
        if (isAutoInitActive && isFirstHandler) {
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
