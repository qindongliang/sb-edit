/**
 * Sprunki Mode Transformations
 * 
 * This module provides specialized transformations for Sprunki/Incredibox-style
 * mods, including grid-based icon layout for character selection.
 * 
 * Usage: Only applied when `--sprunki-mode` CLI flag is enabled.
 */

/**
 * Grid layout configuration for icon positioning
 */
interface GridConfig {
    cols: number;       // Icons per row
    iconWidth: number;  // Horizontal spacing
    iconHeight: number; // Vertical spacing (row height)
    startX: number;     // Left-most X position (centered)
    startY: number;     // Bottom Y position
}

/**
 * Default grid configuration for Sprunki icon layout
 */
const DEFAULT_GRID_CONFIG: GridConfig = {
    cols: 10,       // Reverted to 10 columns as per user request
    iconWidth: 46,  // Increased spacing to fill the container (was 32)
    iconHeight: 45,
    startX: -207,   // Centered: -((9 * 46) / 2) = -207
    startY: -160,   // Bottom of stage
};

/**
 * Standard icon costume names for Sprunki mods (01-a through 27-a)
 */
const SPRUNKI_ICON_NAMES = [
    '01-a', '02-a', '03-a', '04-a', '05-a', '06-a', '07-a', '08-a', '09-a', '10-a',
    '11-a', '12-a', '13-a', '14-a', '15-a', '16-a', '17-a', '18-a', '19-a', '20-a-fake20',
    '21-a', '22-a', '23-a', '24-a', '25-a', '26-a', '27-a'
];

/**
 * Extract costume names (XX-a format) from Icons.js costumes array
 * Parses the this.costumes = [...] section to find all "-a" variant costumes
 */
function extractCostumeNames(content: string): string[] {
    const costumes: string[] = [];

    // Match all costume definitions: new Costume("XX-a", ...)
    // Only extract "-a" variants (default icon state)
    const costumePattern = /new\s+Costume\s*\(\s*["'](\d+-a(?:-[^"']+)?)['"]/g;
    let match;
    while ((match = costumePattern.exec(content)) !== null) {
        costumes.push(match[1]);
    }

    // Unique-ify names to avoid duplication (e.g., if a project repeats definitions or has hidden ones)
    return costumes.filter((name, index) => costumes.indexOf(name) === index);
}

/**
 * Count total clones created by createIcons() function
 * Accounts for for-loop iterations, not just statement count
 */
function countTotalClones(functionBody: string): number {
    let totalClones = 0;

    // Find for loops with createClone inside: "for (let i = 0; i < N; i++) { ... createClone ... }"
    const forLoopPattern = /for\s*\([^)]*<\s*(\d+)[^)]*\)\s*\{[^}]*this\.createClone\(\)[^}]*\}/g;
    let loopMatch;
    while ((loopMatch = forLoopPattern.exec(functionBody)) !== null) {
        totalClones += parseInt(loopMatch[1], 10);
    }

    // Count individual createClone() calls (not inside for loops)
    const withoutLoops = functionBody.replace(/for\s*\([^)]*\)\s*\{[^}]*\}/g, '');
    const individualClones = (withoutLoops.match(/this\.createClone\(\)/g) || []).length;
    totalClones += individualClones;

    return totalClones;
}

/**
 * Generate grid-based createIcons() function body
 */
function generateGridLayoutBody(cloneCount: number, costumeNames: string[], config: GridConfig = DEFAULT_GRID_CONFIG): string {
    const { cols, iconWidth, iconHeight, startX, startY } = config;

    let body = `
    // Grid-based auto-layout (Sprunki Mode)
    const cols = ${cols};
    const iconWidth = ${iconWidth};
    const iconHeight = ${iconHeight};
    const startX = ${startX};
    const startY = ${startY};
    
    const getGridPos = (idx) => ({
      x: startX + (idx % cols) * iconWidth,
      y: startY + Math.floor(idx / cols) * iconHeight
    });
    
    let iconIndex = 0;
`;

    // Generate clone creation with grid positions
    // Use dynamically extracted costume names
    for (let i = 0; i < cloneCount; i++) {
        const costumeName = costumeNames[i] || `${String(i + 1).padStart(2, '0')}-a`;
        body += `
    this.costume = "${costumeName}";
    { const pos = getGridPos(iconIndex++); this.goto(pos.x, pos.y); }
    this.createClone();
`;
    }

    return body;
}

/**
 * Find and extract a generator function body using brace counting
 * Returns null if function not found
 */
function extractFunctionBody(content: string, functionPattern: RegExp): {
    startIdx: number;
    endIdx: number;
    body: string;
} | null {
    const funcMatch = content.match(functionPattern);
    if (!funcMatch) return null;

    const funcStartIdx = content.indexOf(funcMatch[0]);
    const openBraceIdx = content.indexOf('{', funcStartIdx);
    if (openBraceIdx === -1) return null;

    // Count braces to find matching close
    let braceCount = 1;
    let idx = openBraceIdx + 1;
    while (braceCount > 0 && idx < content.length) {
        if (content[idx] === '{') braceCount++;
        if (content[idx] === '}') braceCount--;
        idx++;
    }

    return {
        startIdx: openBraceIdx,
        endIdx: idx,
        body: content.substring(openBraceIdx + 1, idx - 1)
    };
}

/**
 * Apply Sprunki transformations to Icons sprite
 * Rewrites createIcons() function with grid-based positioning
 */
export function transformIconsSprite(content: string): string {
    // Find createIcons() function
    // Generator function format: "* createIcons()" with optional whitespace
    const funcInfo = extractFunctionBody(content, /\*\s*createIcons\s*\(\s*\)/);

    if (!funcInfo) {
        return content; // No createIcons function found, return unchanged
    }

    // Extract costume names from the full content (this.costumes = [...])
    const costumeNames = extractCostumeNames(content);

    const cloneCount = countTotalClones(funcInfo.body);
    console.log(`[SprunkiMode] Icons debug: Found ${cloneCount} clones in original code, and ${costumeNames.length} unique icon costumes.`);

    // Fallback: If clone count seems wrong (mismatch with costumes), use costume count
    // This handles cases where original code uses variable loops or unrolled logic we missed
    const finalCount = Math.max(cloneCount, costumeNames.length);

    const newBody = generateGridLayoutBody(finalCount, costumeNames);

    // Replace the function body
    return content.substring(0, funcInfo.startIdx + 1) + newBody + '\n  ' + content.substring(funcInfo.endIdx - 1);
}

/**
 * Apply layer fix for characters to avoid background occlusion
 * Boosts base layer from 7 to 35
 */
export function transformCharacterLayering(content: string): string {
    // Look for: this.moveAhead(((this.toNumber(this.stage.vars.poloNumber)) + 7))
    // The raw code from sb-edit often has extra parentheses around expressions
    // We want to replace "7" with "35"

    // Pattern matches: .moveAhead( ... + 7 ... )
    // We capture the prefix up to "+ 7" and the suffix
    // Using [\s\(\)]* to handle arbitrary parentheses and whitespace
    const layerPattern = /(\.moveAhead\([\s\(\)]*this\.toNumber\(this\.stage\.vars\.poloNumber\)[\s\(\)]*\+\s*)7([\s\(\)]*\))/g;
    return content.replace(layerPattern, '$135$2');
}

/**
 * Apply all Sprunki mode transformations to the files object
 * This is the main entry point called from toLeopard.ts
 */
export function applySprunkiTransformations(files: { [path: string]: string }): void {
    for (const filepath of Object.keys(files)) {
        console.log("Sprunki Transform scanning:", filepath);
        // Transform Icons sprite
        if (filepath.match(/Icons\/Icons\.js$/i)) {
            files[filepath] = transformIconsSprite(files[filepath]);
        }

        // Global Layer Fix: Apply to all JS files (sprites)
        if (filepath.endsWith('.js')) {
            files[filepath] = transformCharacterLayering(files[filepath]);
        }
    }
}

/**
 * Generate Sprunki-specific CSS additions
 */
export function getSprunkiModeCSS(): string {
    return `
            /* Sprunki Mode: Aligned Grid Layout */
            body {
              --sprunki-icon-size: 60px;
            }
`;
}
