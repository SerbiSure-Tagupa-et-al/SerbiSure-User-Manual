// src/content-model.js

/**
 * Normalizes a relative or absolute file path to a consistent forward-slash path.
 * Strips leading './' or '/' and handles Windows backslashes.
 */
export function normalizePath(p) {
  return p.replace(/\\/g, '/').replace(/^\.?\//, '');
}

/**
 * Derives a human-readable title from a folder name.
 * e.g., "01-registration-and-profile" -> "Registration And Profile"
 */
export function deriveTitleFromFolder(folderName) {
  const withoutPrefix = folderName.replace(/^\d+[-_]?/, '');
  const words = withoutPrefix.replace(/[-_]/g, ' ').trim();
  if (!words) return folderName;
  return words.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Parses numeric prefix from a module folder for sorting.
 * e.g., "01-login" -> 1, "dashboard" -> Infinity
 */
export function getModuleOrder(folderName) {
  const match = folderName.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

/**
 * Pure function to build and normalize the user manual content structure.
 *
 * @param {Object} sources
 * @param {Object} sources.stepFiles - Map of path -> raw text string
 * @param {Object} sources.screenshotFiles - Map of path -> asset URL or relative path
 * @param {Object} sources.metaFiles - Map of path -> parsed module.json object or raw string
 * @returns {Object} { roles, modules, diagnostics: { errors, warnings, missingScreenshotsCount } }
 */
export function buildManualContent({ stepFiles = {}, screenshotFiles = {}, metaFiles = {} }) {
  const diagnostics = {
    errors: [],
    warnings: [],
    missingScreenshotsCount: 0,
    totalStepsCount: 0
  };

  const rolesMap = {
    homeowner: { id: 'homeowner', label: 'Homeowner', icon: 'home', modules: [] },
    kasambahay: { id: 'kasambahay', label: 'Kasambahay', icon: 'user-check', modules: [] },
    admin: { id: 'admin', label: 'Admin / Barangay', icon: 'shield', modules: [] }
  };

  // Temp storage: role -> moduleFolder -> moduleData
  const moduleMap = new Map();

  function getOrCreateModule(role, moduleFolder) {
    const key = `${role}/${moduleFolder}`;
    if (!moduleMap.has(key)) {
      moduleMap.set(key, {
        id: moduleFolder,
        role,
        folder: moduleFolder,
        title: deriveTitleFromFolder(moduleFolder),
        overview: '',
        icon: 'book-open',
        order: getModuleOrder(moduleFolder),
        stepsMap: new Map(), // num -> stepData
        stepBasenames: new Map(), // num -> originalBasename
        screenshotMap: new Map(), // num -> { url, originalBasename }
      });
    }
    return moduleMap.get(key);
  }

  // 1. Process metadata files (module.json)
  for (const [rawPath, metaContent] of Object.entries(metaFiles)) {
    const p = normalizePath(rawPath);
    // Matches: docs/:role/:module/module.json or :role/:module/module.json
    const match = p.match(/(?:^|\/)docs\/([^/]+)\/([^/]+)\/module\.json$/i) ||
                  p.match(/^([^/]+)\/([^/]+)\/module\.json$/i);
    if (!match) continue;

    const [, role, moduleFolder] = match;
    const mod = getOrCreateModule(role.toLowerCase(), moduleFolder);

    let parsed = metaContent;
    if (typeof metaContent === 'string') {
      try {
        parsed = JSON.parse(metaContent);
      } catch (err) {
        diagnostics.errors.push(`Invalid JSON in metadata file "${p}": ${err.message}`);
        continue;
      }
    }

    if (parsed && typeof parsed === 'object') {
      if (parsed.title) mod.title = String(parsed.title).trim();
      if (parsed.overview) mod.overview = String(parsed.overview).trim();
      if (parsed.icon) mod.icon = String(parsed.icon).trim();
    }
  }

  // 2. Process step explanation files (*.md, *.txt)
  for (const [rawPath, textContent] of Object.entries(stepFiles)) {
    const p = normalizePath(rawPath);
    const match = p.match(/(?:^|\/)docs\/([^/]+)\/([^/]+)\/steps\/([^/]+)$/i) ||
                  p.match(/^([^/]+)\/([^/]+)\/steps\/([^/]+)$/i);
    if (!match) continue;

    const [, role, moduleFolder, filename] = match;

    // Ignore non-step files (.gitkeep, .DS_Store, README, etc.)
    if (filename.startsWith('.') || /^readme/i.test(filename)) {
      continue;
    }

    const fileMatch = filename.match(/^(\d+)\.(md|txt)$/i);
    if (!fileMatch) {
      diagnostics.warnings.push(`Malformed step filename "${filename}" in "${p}". Expected format: "<number>.md" or "<number>.txt".`);
      continue;
    }

    const [, rawNumStr, ext] = fileMatch;
    const num = parseInt(rawNumStr, 10);

    if (num <= 0 || isNaN(num)) {
      diagnostics.errors.push(`Invalid step number "${rawNumStr}" in "${p}". Step numbers must be positive integers.`);
      continue;
    }

    const mod = getOrCreateModule(role.toLowerCase(), moduleFolder);

    // Detect ambiguous duplicate steps (e.g., 1.md and 01.md, or 1.md and 1.txt)
    if (mod.stepBasenames.has(num)) {
      const existing = mod.stepBasenames.get(num);
      diagnostics.errors.push(`Duplicate step number ${num} found in "${role}/${moduleFolder}": "${existing}" and "${filename}".`);
      continue;
    }

    mod.stepBasenames.set(num, filename);

    // Extract title from first non-empty line
    const text = typeof textContent === 'string' ? textContent : '';
    const lines = text.split('\n');
    let title = `Step ${num}`;
    let body = text;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        title = trimmed.replace(/^#+\s*/, '').trim();
        break;
      }
    }

    mod.stepsMap.set(num, {
      number: num,
      rawNumberString: rawNumStr,
      extension: ext.toLowerCase(),
      title,
      rawContent: text,
      filePath: p
    });
  }

  // 3. Process screenshot assets (*.png, *.jpg, *.jpeg, *.webp)
  for (const [rawPath, assetUrl] of Object.entries(screenshotFiles)) {
    const p = normalizePath(rawPath);
    const match = p.match(/(?:^|\/)docs\/([^/]+)\/([^/]+)\/screenshots\/([^/]+)$/i) ||
                  p.match(/^([^/]+)\/([^/]+)\/screenshots\/([^/]+)$/i);
    if (!match) continue;

    const [, role, moduleFolder, filename] = match;

    if (filename.startsWith('.') || /^readme/i.test(filename)) {
      continue;
    }

    const imgMatch = filename.match(/^(\d+)\.(png|jpe?g|webp)$/i);
    if (!imgMatch) {
      diagnostics.warnings.push(`Ignored non-conforming screenshot file "${filename}" in "${p}". Expected "<number>.(png|jpg|jpeg|webp)".`);
      continue;
    }

    const [, rawNumStr] = imgMatch;
    const num = parseInt(rawNumStr, 10);

    const mod = getOrCreateModule(role.toLowerCase(), moduleFolder);

    if (mod.screenshotMap.has(num)) {
      const existing = mod.screenshotMap.get(num).originalBasename;
      diagnostics.errors.push(`Multiple screenshot images found for step ${num} in "${role}/${moduleFolder}": "${existing}" and "${filename}".`);
      continue;
    }

    mod.screenshotMap.set(num, {
      url: assetUrl,
      originalBasename: filename,
      filePath: p
    });
  }

  // 4. Assemble and sort modules and steps
  for (const [key, mod] of moduleMap.entries()) {
    const { role } = mod;
    if (!rolesMap[role]) {
      diagnostics.warnings.push(`Unknown role "${role}" in module path "${key}".`);
      continue;
    }

    // Collect all step numbers present (from stepsMap and screenshotMap)
    const allStepNums = new Set([...mod.stepsMap.keys(), ...mod.screenshotMap.keys()]);
    // Sort numerically: 1, 2, 5, 10
    const sortedNums = Array.from(allStepNums).sort((a, b) => a - b);

    const steps = [];
    for (let i = 0; i < sortedNums.length; i++) {
      const num = sortedNums[i];
      const stepData = mod.stepsMap.get(num);
      const screenshotData = mod.screenshotMap.get(num);

      diagnostics.totalStepsCount++;

      let title = `Step ${num}`;
      let rawContent = '*Instructions coming soon for this step.*';
      let extension = 'md';
      let filePath = null;
      let hasText = false;
      let hasScreenshot = Boolean(screenshotData);

      if (stepData) {
        hasText = true;
        title = stepData.title;
        rawContent = stepData.rawContent;
        extension = stepData.extension;
        filePath = stepData.filePath;
      } else {
        diagnostics.warnings.push(`Screenshot without instructions: step ${num} in "${role}/${mod.folder}".`);
      }

      if (!hasScreenshot) {
        diagnostics.missingScreenshotsCount++;
      }

      steps.push({
        index: i + 1, // 1-based sequential display index
        totalInModule: sortedNums.length,
        number: num, // actual file number (e.g. 10)
        title,
        rawContent,
        extension,
        filePath,
        hasText,
        hasScreenshot,
        screenshotUrl: screenshotData ? screenshotData.url : null,
        screenshotFilename: screenshotData ? screenshotData.originalBasename : null
      });
    }

    rolesMap[role].modules.push({
      id: mod.id,
      folder: mod.folder,
      role: mod.role,
      title: mod.title,
      overview: mod.overview,
      icon: mod.icon,
      order: mod.order,
      steps
    });
  }

  // 5. Sort modules per role
  for (const roleObj of Object.values(rolesMap)) {
    roleObj.modules.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.folder.localeCompare(b.folder, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Update total steps in module count for each step
    for (const mod of roleObj.modules) {
      for (const step of mod.steps) {
        step.totalInModule = mod.steps.length;
      }
    }
  }

  return {
    roles: rolesMap,
    diagnostics
  };
}

