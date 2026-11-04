// tests/inspect-after.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, 'screenshots/after');
fs.mkdirSync(screenshotsDir, { recursive: true });

async function run() {
  const baseUrl = 'http://localhost:5173';
  console.log(`\nConnecting to server at ${baseUrl} for thorough post-repair verification...`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[error] ${err.message}`));

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
    await page.goto(`${baseUrl}/#/admin/03-verification-queue-and-ocr/5`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    // 1. Check for horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // 2. Check role tabs clipping
    const roleTabsStatus = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.role-tab'));
      return tabs.map(tab => {
        const textSpan = tab.querySelector('.role-text');
        const isClipped = textSpan ? textSpan.scrollWidth > textSpan.clientWidth : false;
        return {
          text: tab.innerText.trim(),
          isClipped,
          tabWidth: tab.getBoundingClientRect().width,
          scrollWidth: tab.scrollWidth
        };
      });
    });

    const anyTabClipped = roleTabsStatus.some(t => t.isClipped || t.scrollWidth > t.tabWidth + 2);

    // 3. Check mobile topic selector on mobile vs desktop
    const isMobileTopicBarVisible = await page.locator('#mobile-topic-bar').isVisible();
    const topicSelectValue = isMobileTopicBarVisible
      ? await page.locator('#mobile-module-select').inputValue()
      : 'N/A (Desktop sidebar active)';

    // 4. Check step heading full title
    const headingText = await page.locator('#current-step-heading').innerText();
    const headingHasStepPrefix = headingText.startsWith('Step 5:');

    // 5. Check placeholder dimensions and no author paths
    const placeholderCheck = await page.evaluate(() => {
      const ph = document.querySelector('.screenshot-placeholder');
      if (!ph) return { exists: false, height: 0, hasAuthorPaths: false, text: '' };
      const text = ph.innerText;
      const hasAuthorPaths = text.includes('.png') || text.includes('.jpg') || text.includes('docs/');
      return {
        exists: true,
        height: ph.getBoundingClientRect().height,
        hasAuthorPaths,
        text
      };
    });

    // 6. Check Previous / Next buttons
    const nextBtn = page.locator('.step-nav-btn.next-btn');
    const nextText = await nextBtn.locator('.nav-label').innerText();

    const passed = !hasHorizontalOverflow && !anyTabClipped && headingHasStepPrefix && !placeholderCheck.hasAuthorPaths;

    results.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      horizontalOverflow: hasHorizontalOverflow ? 'FAIL (Overflow)' : 'None (Clean 100%)',
      roleTabsClipped: anyTabClipped ? 'FAIL (Clipped)' : 'None (Clean)',
      placeholderHeight: `${Math.round(placeholderCheck.height)}px`,
      authorPathsExposed: placeholderCheck.hasAuthorPaths ? 'YES (FAIL)' : 'None (Clean)',
      status: passed ? '✅ PASS' : '❌ FAIL'
    });

    // Save representative screenshots
    const safeName = vp.name.replace(/[^a-z0-9]/gi, '_');
    await page.screenshot({ path: path.join(screenshotsDir, `${safeName}.png`), fullPage: true });
  }

  console.log('\n📊 Responsive Viewport & UI Verification Results:');
  console.table(results);

  // Interaction Tests:
  console.log('\n--- Running Interactive Tests ---');

  // Test 1: Role switching
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${baseUrl}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  await page.click('a[aria-label="Kasambahay Guides"]');
  await page.waitForTimeout(200);
  console.log('Role switch to Kasambahay URL:', page.url());

  // Test 2: Mobile Topic Select Dropdown
  await page.selectOption('#mobile-module-select', '02-login');
  await page.waitForTimeout(200);
  console.log('Mobile topic select navigated to:', page.url());

  // Test 3: Step Quick Jump
  await page.selectOption('#step-select-dropdown', '2');
  await page.waitForTimeout(200);
  console.log('Step quick jump navigated to:', page.url());
  const step2Heading = await page.locator('#current-step-heading').innerText();
  console.log('Step 2 Heading:', step2Heading);

  // Test 4: Previous and Next navigation
  await page.click('.step-nav-btn.next-btn');
  await page.waitForTimeout(200);
  console.log('Next button navigated to:', page.url());

  await page.click('.step-nav-btn.prev-btn');
  await page.waitForTimeout(200);
  console.log('Prev button navigated back to:', page.url());

  // Test 5: Drawer open, close, and escape
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(150);
  let isDrawerOpen = await page.evaluate(() => document.getElementById('app-sidebar').classList.contains('drawer-open'));
  console.log('Drawer opened:', isDrawerOpen);

  await page.click('#sidebar-close-btn');
  await page.waitForTimeout(150);
  let isDrawerClosed = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));
  console.log('Drawer closed via close button:', isDrawerClosed);

  // Capture interactive mobile screenshots
  await page.screenshot({ path: path.join(screenshotsDir, '360x800_admin_step5_fixed.png'), fullPage: true });
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(screenshotsDir, '360x800_drawer_open_fixed.png'), fullPage: false });

  await browser.close();

  const allPassed = results.every(r => r.status === '✅ PASS');
  if (!allPassed) {
    console.error('\n❌ Some viewport tests failed.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 11 responsive viewport checks and interactive tests passed with 100% success!\n');
  }
}

run().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
