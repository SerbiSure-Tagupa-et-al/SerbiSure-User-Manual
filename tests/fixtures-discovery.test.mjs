// tests/fixtures-discovery.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManualContent } from '../src/content-model.js';

test('automatic module and step discovery without code changes', () => {
  // Step 1: Base state with standard modules
  const initialStepFiles = {
    'docs/homeowner/01-registration/steps/1.md': '# Step 1: Start\nInitial content'
  };

  const initialContent = buildManualContent({ stepFiles: initialStepFiles });
  assert.equal(initialContent.roles.homeowner.modules.length, 1);
  assert.equal(initialContent.roles.homeowner.modules[0].id, '01-registration');

  // Step 2: User adds a brand new module and step text only
  const updatedStepFiles = {
    ...initialStepFiles,
    'docs/homeowner/99-custom-workflow/steps/1.md': '# Custom Step 1\nAutomatically discovered step without code changes.'
  };

  const contentWithNewModule = buildManualContent({ stepFiles: updatedStepFiles });
  assert.equal(contentWithNewModule.roles.homeowner.modules.length, 2, 'New module must appear automatically');
  
  const customMod = contentWithNewModule.roles.homeowner.modules.find(m => m.id === '99-custom-workflow');
  assert.ok(customMod, 'Custom module 99-custom-workflow must exist');
  assert.equal(customMod.title, 'Custom Workflow');
  assert.equal(customMod.steps.length, 1);
  assert.equal(customMod.steps[0].hasText, true);
  assert.equal(customMod.steps[0].hasScreenshot, false, 'Must show placeholder when no image exists');
  assert.equal(customMod.steps[0].screenshotUrl, null);

  // Step 3: User adds matching screenshot 1.png for the new step
  const updatedScreenshotFiles = {
    'docs/homeowner/99-custom-workflow/screenshots/1.png': '/resolved-assets/custom-1.png'
  };

  const contentWithScreenshot = buildManualContent({
    stepFiles: updatedStepFiles,
    screenshotFiles: updatedScreenshotFiles
  });

  const customModWithImg = contentWithScreenshot.roles.homeowner.modules.find(m => m.id === '99-custom-workflow');
  assert.equal(customModWithImg.steps[0].hasScreenshot, true, 'Placeholder is automatically replaced when image is added');
  assert.equal(customModWithImg.steps[0].screenshotUrl, '/resolved-assets/custom-1.png');

  // Step 4: Reverting image keeps text navigable with placeholder
  const contentReverted = buildManualContent({
    stepFiles: updatedStepFiles,
    screenshotFiles: {}
  });

  const customModReverted = contentReverted.roles.homeowner.modules.find(m => m.id === '99-custom-workflow');
  assert.equal(customModReverted.steps[0].hasScreenshot, false);
  assert.equal(customModReverted.steps[0].screenshotUrl, null);
});

