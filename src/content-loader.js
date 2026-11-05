// src/content-loader.js
import { buildManualContent } from './content-model.js';

/**
 * Loads manual content via Vite's import.meta.glob at build/runtime.
 */
export function loadManualContent() {
  const stepModules = import.meta.glob('../docs/*/*/steps/*.{md,txt}', {
    query: '?raw',
    import: 'default',
    eager: true
  });

  const screenshotModules = import.meta.glob('../docs/*/*/screenshots/*.{png,jpg,jpeg,webp}', {
    import: 'default',
    eager: true
  });

  const metaModules = import.meta.glob('../docs/*/*/module.json', {
    import: 'default',
    eager: true
  });

  return buildManualContent({
    stepFiles: stepModules,
    screenshotFiles: screenshotModules,
    metaFiles: metaModules
  });
}

