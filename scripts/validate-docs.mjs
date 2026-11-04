// scripts/validate-docs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManualContent } from '../src/content-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsRoot = path.join(rootDir, 'docs');

function scanDirectory(dir, filterRegex) {
  const results = {};
  if (!fs.existsSync(dir)) return results;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        if (filterRegex.test(entry.name)) {
          results[relPath] = fullPath;
        }
      }
    }
  }

  walk(dir);
  return results;
}

// 1. Gather files from filesystem
const rawStepFiles = scanDirectory(docsRoot, /\.(md|txt)$/i);
const rawScreenshotFiles = scanDirectory(docsRoot, /\.(png|jpe?g|webp)$/i);
const rawMetaFiles = scanDirectory(docsRoot, /^module\.json$/i);

const stepFiles = {};
for (const [relPath, absPath] of Object.entries(rawStepFiles)) {
  stepFiles[relPath] = fs.readFileSync(absPath, 'utf-8');
}

const screenshotFiles = {};
for (const [relPath, absPath] of Object.entries(rawScreenshotFiles)) {
  screenshotFiles[relPath] = relPath;
}

const metaFiles = {};
for (const [relPath, absPath] of Object.entries(rawMetaFiles)) {
  metaFiles[relPath] = fs.readFileSync(absPath, 'utf-8');
}

// 2. Run content model builder & validator
const { roles, diagnostics } = buildManualContent({
  stepFiles,
  screenshotFiles,
  metaFiles
});

console.log('--- SerbiSure User Manual Content Validation ---');

if (diagnostics.errors.length > 0) {
  console.error('\n❌ Content validation failed with fatal errors:');
  for (const err of diagnostics.errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

if (diagnostics.warnings.length > 0) {
  console.log(`\n⚠️  Notices / Warnings (${diagnostics.warnings.length}):`);
  for (const warn of diagnostics.warnings) {
    console.log(`  - ${warn}`);
  }
}

// 3. Print breakdown by role
console.log('\n📊 Manual Summary:');
for (const [roleId, roleData] of Object.entries(roles)) {
  const stepCount = roleData.modules.reduce((acc, m) => acc + m.steps.length, 0);
  console.log(`  - ${roleData.label} (${roleId}): ${roleData.modules.length} modules, ${stepCount} steps`);
}
console.log(`  Total Steps: ${diagnostics.totalStepsCount}`);
console.log(`  Steps with Placeholder (Pending User Screenshots): ${diagnostics.missingScreenshotsCount} of ${diagnostics.totalStepsCount}`);

// 4. Validate SCREENSHOT_CHECKLIST.md sync
const checklistPath = path.join(rootDir, 'SCREENSHOT_CHECKLIST.md');
if (fs.existsSync(checklistPath)) {
  const checklistContent = fs.readFileSync(checklistPath, 'utf-8');
  let checklistMatchedCount = 0;
  let checklistMissingSteps = [];

  for (const roleData of Object.values(roles)) {
    for (const mod of roleData.modules) {
      for (const step of mod.steps) {
        const expectedTarget = `docs/${roleData.id}/${mod.folder}/screenshots/${step.number}.png`;
        if (checklistContent.includes(expectedTarget)) {
          checklistMatchedCount++;
        } else {
          checklistMissingSteps.push(expectedTarget);
        }
      }
    }
  }

  if (checklistMissingSteps.length > 0) {
    console.error(`\n❌ Screenshot checklist mismatch! ${checklistMissingSteps.length} step(s) missing from SCREENSHOT_CHECKLIST.md:`);
    for (const missing of checklistMissingSteps) {
      console.error(`  - Missing: ${missing}`);
    }
    process.exit(1);
  } else {
    console.log(`  Checklist Sync: 100% matched (${checklistMatchedCount}/${diagnostics.totalStepsCount} steps in SCREENSHOT_CHECKLIST.md)`);
  }
} else {
  console.warn('  ⚠️  SCREENSHOT_CHECKLIST.md not found.');
}

console.log('\n✅ Validation passed! Ready for preview and static build.\n');
process.exit(0);

