// tests/content-model.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManualContent, deriveTitleFromFolder, getModuleOrder } from '../src/content-model.js';

test('deriveTitleFromFolder handles prefixes and hyphens', () => {
  assert.equal(deriveTitleFromFolder('01-registration-and-profile'), 'Registration And Profile');
  assert.equal(deriveTitleFromFolder('02_login_flow'), 'Login Flow');
  assert.equal(deriveTitleFromFolder('custom-module'), 'Custom Module');
});

test('getModuleOrder extracts leading numbers', () => {
  assert.equal(getModuleOrder('01-registration'), 1);
  assert.equal(getModuleOrder('10-settings'), 10);
  assert.equal(getModuleOrder('general-info'), Infinity);
});

test('natural numeric sorting orders 1, 2, 5, 10 correctly', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/10.md': '# Step Ten\nContent ten',
    'docs/homeowner/01-test/steps/1.md': '# Step One\nContent one',
    'docs/homeowner/01-test/steps/2.md': '# Step Two\nContent two',
    'docs/homeowner/01-test/steps/5.md': '# Step Five\nContent five'
  };

  const { roles, diagnostics } = buildManualContent({ stepFiles });
  assert.equal(diagnostics.errors.length, 0);

  const mod = roles.homeowner.modules.find(m => m.id === '01-test');
  assert.ok(mod, 'Module should exist');
  assert.equal(mod.steps.length, 4);

  const stepNumbers = mod.steps.map(s => s.number);
  assert.deepEqual(stepNumbers, [1, 2, 5, 10], 'Steps must sort strictly numerically (1, 2, 5, 10)');

  assert.equal(mod.steps[0].index, 1);
  assert.equal(mod.steps[1].index, 2);
  assert.equal(mod.steps[2].index, 3);
  assert.equal(mod.steps[3].index, 4);
});

test('handles gaps without creating phantom steps', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Step 1',
    'docs/homeowner/01-test/steps/7.md': '# Step 7'
  };

  const { roles, diagnostics } = buildManualContent({ stepFiles });
  assert.equal(diagnostics.errors.length, 0);

  const mod = roles.homeowner.modules.find(m => m.id === '01-test');
  assert.equal(mod.steps.length, 2);
  assert.equal(mod.steps[0].number, 1);
  assert.equal(mod.steps[1].number, 7);
});

test('detects ambiguous duplicate steps with leading zeros', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Step 1',
    'docs/homeowner/01-test/steps/01.md': '# Step 01'
  };

  const { diagnostics } = buildManualContent({ stepFiles });
  assert.ok(diagnostics.errors.length > 0, 'Must record error for 1.md and 01.md');
  assert.match(diagnostics.errors[0], /Duplicate step number 1/);
});

test('detects duplicate extensions (1.md and 1.txt)', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Step 1',
    'docs/homeowner/01-test/steps/1.txt': 'Step 1 text'
  };

  const { diagnostics } = buildManualContent({ stepFiles });
  assert.ok(diagnostics.errors.length > 0, 'Must record error for 1.md and 1.txt');
  assert.match(diagnostics.errors[0], /Duplicate step number 1/);
});

test('detects multiple images for one step (1.png and 1.jpg)', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Step 1'
  };
  const screenshotFiles = {
    'docs/homeowner/01-test/screenshots/1.png': '/assets/1.png',
    'docs/homeowner/01-test/screenshots/1.jpg': '/assets/1.jpg'
  };

  const { diagnostics } = buildManualContent({ stepFiles, screenshotFiles });
  assert.ok(diagnostics.errors.length > 0, 'Must report multiple screenshots for step 1');
  assert.match(diagnostics.errors[0], /Multiple screenshot images found for step 1/);
});

test('pairs screenshot with step and uses placeholder when missing', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Step 1\nHas image',
    'docs/homeowner/01-test/steps/2.md': '# Step 2\nMissing image'
  };
  const screenshotFiles = {
    'docs/homeowner/01-test/screenshots/1.png': '/resolved/1.png'
  };

  const { roles, diagnostics } = buildManualContent({ stepFiles, screenshotFiles });
  assert.equal(diagnostics.errors.length, 0);
  assert.equal(diagnostics.missingScreenshotsCount, 1);

  const mod = roles.homeowner.modules[0];
  assert.equal(mod.steps[0].hasScreenshot, true);
  assert.equal(mod.steps[0].screenshotUrl, '/resolved/1.png');

  assert.equal(mod.steps[1].hasScreenshot, false);
  assert.equal(mod.steps[1].screenshotUrl, null);
});

test('handles invalid JSON in module.json with useful author error', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Step 1'
  };
  const metaFiles = {
    'docs/homeowner/01-test/module.json': 'INVALID JSON CONTENT {{'
  };

  const { diagnostics } = buildManualContent({ stepFiles, metaFiles });
  assert.ok(diagnostics.errors.length > 0, 'Must record fatal diagnostic for malformed module.json');
  assert.match(diagnostics.errors[0], /Invalid JSON in metadata file/);
});

test('processes plain-text .txt files alongside .md files', () => {
  const stepFiles = {
    'docs/homeowner/01-test/steps/1.md': '# Markdown Step\nMarkdown content',
    'docs/homeowner/01-test/steps/2.txt': 'Plain text title\nRaw text line 2'
  };

  const { roles, diagnostics } = buildManualContent({ stepFiles });
  assert.equal(diagnostics.errors.length, 0);

  const mod = roles.homeowner.modules[0];
  assert.equal(mod.steps.length, 2);
  assert.equal(mod.steps[0].extension, 'md');
  assert.equal(mod.steps[1].extension, 'txt');
  assert.equal(mod.steps[1].title, 'Plain text title');
});


