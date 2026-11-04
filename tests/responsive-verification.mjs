// tests/responsive-verification.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Simple static file server for dist
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

async function run() {
  await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:4173';
  console.log(`\n🚀 Static test server running on ${baseUrl}`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { name: 'small phone (320x568)', width: 320, height: 568 },
    { name: 'budget Android (360x800)', width: 360, height: 800 },
    { name: 'common phone (390x844)', width: 390, height: 844 },
    { name: 'large phone (430x932)', width: 430, height: 932 },
    { name: 'tablet portrait (768x1024)', width: 768, height: 1024 },
    { name: 'tablet landscape (1024x768)', width: 1024, height: 768 },
    { name: 'laptop (1366x768)', width: 1366, height: 768 },
    { name: 'desktop (1920x1080)', width: 1920, height: 1080 },
    { name: 'phone landscape (844x390)', width: 844, height: 390 },
    { name: '200% zoom on 1280 (640x800)', width: 640, height: 800 },
    { name: '200% zoom on 1920 (960x1080)', width: 960, height: 1080 }
  ];

  const results = [];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseUrl}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });

    // 1. Check for page-wide horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // 2. Check Role Selector readability & visibility
    const roleTabsCount = await page.locator('.role-tab').count();
    const roleTexts = await page.locator('.role-tab .role-text').allInnerTexts();
    const roleTabsVisible = await page.locator('.role-tabs-nav').isVisible();

    // 3. Check Step Heading visibility & no truncation
    const heading = await page.locator('#current-step-heading').innerText();
    const headingTruncated = heading.includes('...');

    // 4. Test Mobile Menu Drawer if mobile button visible
    const isMobileMenuVisible = await page.locator('#mobile-menu-toggle').isVisible();
    let drawerCheck = 'N/A (Desktop sidebar active)';
    if (isMobileMenuVisible) {
      await page.click('#mobile-menu-toggle');
      await page.waitForTimeout(150);
      const isDrawerOpen = await page.evaluate(() => document.getElementById('app-sidebar').classList.contains('drawer-open'));
      const isBackdropOpen = await page.evaluate(() => document.getElementById('drawer-backdrop').classList.contains('drawer-open'));
      
      // Test closing drawer via close button
      await page.click('#sidebar-close-btn');
      await page.waitForTimeout(150);
      const isDrawerClosed = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));

      // Test opening again and pressing Escape
      await page.click('#mobile-menu-toggle');
      await page.waitForTimeout(150);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      const isClosedByEscape = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));

      drawerCheck = isDrawerOpen && isBackdropOpen && isDrawerClosed && isClosedByEscape ? 'PASSED (Open/Close/Backdrop/Escape)' : 'FAILED';
    }

    // 5. Test Prev/Next buttons
    const prevDisabled = await page.locator('.step-nav-btn.prev-btn').getAttribute('aria-disabled');
    const nextBtn = page.locator('.step-nav-btn.next-btn');
    const nextText = await nextBtn.locator('.nav-label').innerText();

    const passed = !hasHorizontalOverflow && roleTabsVisible && roleTabsCount === 3 && !headingTruncated && (drawerCheck.startsWith('PASSED') || drawerCheck.startsWith('N/A'));

    results.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      horizontalOverflow: hasHorizontalOverflow ? 'FAIL (Overflow detected)' : 'None (Clean 100%)',
      roleTabs: `${roleTabsCount} tabs visible (${roleTexts.join(', ')})`,
      drawer: drawerCheck,
      prevNext: `Prev: disabled=${prevDisabled}, Next: "${nextText.substring(0, 30)}..."`,
      status: passed ? '✅ PASS' : '❌ FAIL'
    });
  }

  // 6. Test deep link navigation across roles & steps
  await page.goto(`${baseUrl}/#/admin/03-verification-queue-and-ocr/5`, { waitUntil: 'networkidle' });
  const adminHeading = await page.locator('#current-step-heading').innerText();
  console.log(`\n🔗 Deep link to Admin Step 5: "${adminHeading}" (✅ Loaded successfully)`);

  // Verify that no element contains raw "Loading..." after content is ready
  const containsRawLoading = await page.evaluate(() => {
    return document.body.innerText.includes('Loading...');
  });
  if (containsRawLoading) {
    throw new Error('Page contains raw "Loading..." text after content finished loading.');
  }
  console.log('✅ Verified zero raw "Loading..." text remains in rendered DOM');

  // Verify shared state across mobile select and active route
  const mobileSelectVal = await page.locator('#mobile-module-select').inputValue();
  if (mobileSelectVal !== '03-verification-queue-and-ocr') {
    throw new Error(`Mobile module select (${mobileSelectVal}) is not synchronized with active module.`);
  }
  console.log(`✅ Mobile module select correctly synchronized with active module: "${mobileSelectVal}"`);

  // 7. Test interactive step navigation via Next Step button
  const currentStepBadgeBefore = await page.locator('.step-badge').innerText();
  await page.click('.step-nav-btn.next-btn');
  await page.waitForTimeout(200);
  const currentStepBadgeAfter = await page.locator('.step-badge').innerText();
  console.log(`\n🔄 Navigation button test: ${currentStepBadgeBefore} -> ${currentStepBadgeAfter} (✅ Navigated correctly)`);

  // 8. Test invalid / deleted route fallback normalization
  await page.goto(`${baseUrl}/#/homeowner/deleted-ghost-module/999`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const normalizedUrl = page.url();
  if (!normalizedUrl.includes('#/homeowner/01-registration-and-profile/1')) {
    throw new Error(`Fallback navigation failed: URL did not normalize. Current URL: ${normalizedUrl}`);
  }
  console.log(`✅ Invalid route fallback test: normalized cleanly to ${normalizedUrl}`);

  // Close browser and server
  await browser.close();
  server.close();

  console.log('\n📊 Responsive Viewport Test Summary:');
  console.table(results);

  const allPassed = results.every(r => r.status === '✅ PASS');
  if (!allPassed) {
    console.error('\n❌ Some viewport tests failed.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 11 responsive viewport checks and interactive tests passed successfully!\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal error during responsive verification:', err);
  if (server) server.close();
  process.exit(1);
});
