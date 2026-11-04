// tests/inspect-before.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, 'screenshots/before');
fs.mkdirSync(screenshotsDir, { recursive: true });

async function run() {
  const baseUrl = 'http://localhost:5173';
  console.log(`Connecting to existing dev server at ${baseUrl}...`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[error] ${err.message}`));

  // 1. Initial Load Inspection at 360x800 (budget Android)
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('\n--- Initial Page Load ---');
  console.log('Current URL:', page.url());

  // Check role tab dimensions and text clipping
  const roleTabsInfo = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.role-tab'));
    return tabs.map(tab => {
      const rect = tab.getBoundingClientRect();
      const textSpan = tab.querySelector('.role-text');
      const textRect = textSpan ? textSpan.getBoundingClientRect() : null;
      return {
        text: tab.innerText.trim(),
        tabWidth: rect.width,
        tabHeight: rect.height,
        scrollWidth: tab.scrollWidth,
        textScrollWidth: textSpan ? textSpan.scrollWidth : 0,
        textClientWidth: textSpan ? textSpan.clientWidth : 0,
        isClipped: textSpan ? textSpan.scrollWidth > textSpan.clientWidth : false
      };
    });
  });
  console.log('Role tabs info (360x800):', JSON.stringify(roleTabsInfo, null, 2));

  // Check Guide Bar status
  const guideBarInfo = await page.evaluate(() => {
    const bar = document.getElementById('mobile-guide-bar');
    const title = document.getElementById('mobile-current-guide-title');
    return {
      barDisplay: bar ? window.getComputedStyle(bar).display : 'none',
      barVisible: bar ? bar.offsetParent !== null : false,
      guideTitle: title ? title.innerText : ''
    };
  });
  console.log('Mobile guide bar info:', guideBarInfo);

  // Check Step Quick Jump Dropdown info
  const stepDropdownInfo = await page.evaluate(() => {
    const select = document.getElementById('step-select-dropdown');
    return {
      exists: !!select,
      width: select ? select.getBoundingClientRect().width : 0,
      selectedText: select ? select.options[select.selectedIndex]?.text : '',
      optionsCount: select ? select.options.length : 0
    };
  });
  console.log('Step dropdown info:', stepDropdownInfo);

  // Check Screenshot Placeholder info
  const placeholderInfo = await page.evaluate(() => {
    const ph = document.querySelector('.screenshot-placeholder');
    return {
      exists: !!ph,
      height: ph ? ph.getBoundingClientRect().height : 0,
      text: ph ? ph.innerText : '',
      instructionTop: document.querySelector('.step-instructions-column')?.getBoundingClientRect().top
    };
  });
  console.log('Placeholder info:', placeholderInfo);

  // Capture baseline screenshots across key viewports and roles
  const captures = [
    { name: '360x800_homeowner_step1', vp: { width: 360, height: 800 }, url: `${baseUrl}/#/homeowner/01-registration-and-profile/1` },
    { name: '360x800_admin_step5', vp: { width: 360, height: 800 }, url: `${baseUrl}/#/admin/03-verification-queue-and-ocr/5` },
    { name: '320x568_small_phone', vp: { width: 320, height: 568 }, url: `${baseUrl}/#/admin/03-verification-queue-and-ocr/5` },
    { name: '390x844_kasambahay', vp: { width: 390, height: 844 }, url: `${baseUrl}/#/kasambahay/01-registration/1` },
    { name: '768x1024_tablet', vp: { width: 768, height: 1024 }, url: `${baseUrl}/#/homeowner/01-registration-and-profile/1` },
    { name: '1366x768_laptop', vp: { width: 1366, height: 768 }, url: `${baseUrl}/#/admin/03-verification-queue-and-ocr/5` },
    { name: '1920x1080_desktop', vp: { width: 1920, height: 1080 }, url: `${baseUrl}/#/homeowner/01-registration-and-profile/1` },
    { name: '844x390_phone_landscape', vp: { width: 844, height: 390 }, url: `${baseUrl}/#/homeowner/01-registration-and-profile/1` },
    { name: '640x800_zoom200', vp: { width: 640, height: 800 }, url: `${baseUrl}/#/admin/03-verification-queue-and-ocr/5` }
  ];

  for (const cap of captures) {
    await page.setViewportSize(cap.vp);
    await page.goto(cap.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const filePath = path.join(screenshotsDir, `${cap.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved screenshot: ${cap.name}.png`);
  }

  // Check Drawer behavior
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${baseUrl}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, '360x800_drawer_open.png'), fullPage: false });
  console.log('Saved screenshot: 360x800_drawer_open.png');

  console.log('\nConsole errors/logs during inspection:');
  console.log(consoleLogs.length ? consoleLogs.join('\n') : 'No errors found');

  await browser.close();
}

run().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});

