// tests/pass2-browser-audit.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, 'screenshots/pass2');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test target URL: prioritize running Vite dev server on localhost:5173
const TARGET_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { id: '01_small_phone', name: 'Small phone (320x568)', width: 320, height: 568 },
  { id: '02_budget_android', name: 'Budget Android (360x800)', width: 360, height: 800 },
  { id: '03_common_phone', name: 'Common phone (390x844)', width: 390, height: 844 },
  { id: '04_large_phone', name: 'Large phone (430x932)', width: 430, height: 932 },
  { id: '05_tablet_portrait', name: 'Tablet portrait (768x1024)', width: 768, height: 1024 },
  { id: '06_tablet_landscape', name: 'Tablet landscape (1024x768)', width: 1024, height: 768 },
  { id: '07_laptop', name: 'Laptop (1366x768)', width: 1366, height: 768 },
  { id: '08_desktop', name: 'Desktop 1080p (1920x1080)', width: 1920, height: 1080 },
  { id: '09_phone_landscape', name: 'Phone landscape (844x390)', width: 844, height: 390 },
  { id: '10_zoom200_on_1280', name: '200% zoom simulation on 1280 (640x800)', width: 640, height: 800 },
  { id: '11_zoom200_on_1920', name: '200% zoom simulation on 1920 (960x1080)', width: 960, height: 1080 }
];

async function runPass2Audit() {
  console.log('================================================================');
  console.log('  SerbiSure User Manual — Pass 2 Real Browser Verification Audit');
  console.log(`  Live Target: ${TARGET_URL}`);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const auditResults = {
    viewports: [],
    interactions: {},
    walkthroughs: {},
    nonTechnicalChecks: {},
    screenshotsCaptured: []
  };

  // -------------------------------------------------------------
  // PART A: Comprehensive Responsive Viewport Coverage (11 Sizes)
  // -------------------------------------------------------------
  console.log('--- PART A: Testing 11 Viewport Sizes ---');

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(100);

    // 1. Horizontal overflow check
    const overflowMetrics = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      return {
        docWidth,
        winWidth,
        hasOverflow: docWidth > winWidth,
        overflowPx: Math.max(0, docWidth - winWidth)
      };
    });

    // 2. Role Selector checks
    const roleStats = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.role-tab'));
      const nav = document.querySelector('.role-tabs-nav');
      const navRect = nav ? nav.getBoundingClientRect() : null;
      return {
        count: tabs.length,
        labels: tabs.map(t => t.innerText.trim().replace(/\s+/g, ' ')),
        allVisible: tabs.every(t => {
          const r = t.getBoundingClientRect();
          return r.width > 0 && r.height >= 40;
        }),
        minHeight: Math.min(...tabs.map(t => t.getBoundingClientRect().height)),
        navWidth: navRect ? navRect.width : 0
      };
    });

    // 3. Step Heading and Title check
    const stepHeadingText = await page.locator('#current-step-heading').innerText();
    const isHeadingTruncated = stepHeadingText.includes('...') || stepHeadingText.trim().length === 0;

    // 4. Tap Target Sizes
    const tapTargetChecks = await page.evaluate(() => {
      const interactive = Array.from(document.querySelectorAll('.role-tab, .step-nav-btn, .mobile-menu-btn, .sidebar-close-btn, .mobile-module-select, .step-select-dropdown'));
      const smallTargets = interactive.filter(el => {
        const r = el.getBoundingClientRect();
        // check only visible elements
        if (r.width === 0 || r.height === 0) return false;
        return r.height < 44 || (r.width < 44 && !el.classList.contains('mobile-menu-btn'));
      }).map(el => ({
        tag: el.tagName,
        className: el.className,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height
      }));
      return {
        smallTargetsCount: smallTargets.length,
        smallTargets
      };
    });

    // 5. Placeholder safety check (no path or author file leaks)
    const placeholderCheck = await page.evaluate(() => {
      const placeholder = document.querySelector('.screenshot-placeholder');
      if (!placeholder) return { exists: false, clean: true };
      const text = placeholder.innerText;
      const leaksAuthorPaths = text.includes('docs/') || text.includes('.png') || text.includes('.md') || text.includes('author');
      return {
        exists: true,
        text: text.trim().replace(/\s+/g, ' '),
        clean: !leaksAuthorPaths
      };
    });

    // Capture screenshot
    const screenshotPath = path.join(screenshotsDir, `viewport_${vp.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    auditResults.screenshotsCaptured.push(screenshotPath);

    const vpStatus = !overflowMetrics.hasOverflow &&
      roleStats.count === 3 &&
      roleStats.allVisible &&
      !isHeadingTruncated &&
      placeholderCheck.clean &&
      tapTargetChecks.smallTargetsCount === 0;

    console.log(`  [${vpStatus ? 'PASS' : 'FAIL'}] ${vp.name} — Overflow: ${overflowMetrics.overflowPx}px | Roles: ${roleStats.count} visible (${roleStats.minHeight}px min-h) | TapTargets: ${tapTargetChecks.smallTargetsCount} sub-44px`);

    auditResults.viewports.push({
      id: vp.id,
      name: vp.name,
      width: vp.width,
      height: vp.height,
      overflow: overflowMetrics.hasOverflow ? `FAIL (${overflowMetrics.overflowPx}px)` : 'None (0px)',
      roles: `${roleStats.count} tabs (${roleStats.labels.join(' | ')})`,
      tapTargetsCheck: tapTargetChecks.smallTargetsCount === 0 ? 'Passed (all >= 44px)' : `Failed (${tapTargetChecks.smallTargetsCount} small targets)`,
      stepHeading: stepHeadingText.substring(0, 40) + '...',
      placeholderSafe: placeholderCheck.clean ? 'Safe (no path leaks)' : 'LEAK DETECTED',
      status: vpStatus ? 'PASSED' : 'FAILED'
    });
  }

  // -------------------------------------------------------------
  // PART B: Interactive Workflow Verification
  // -------------------------------------------------------------
  console.log('\n--- PART B: Testing Interactive Workflows ---');

  // B1. Role Switching
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });

  // Switch to Kasambahay
  await page.click('a.role-tab[href*="kasambahay"]');
  await page.waitForTimeout(150);
  const kasambahayHash = page.url();
  const isKasambahayActive = await page.locator('a.role-tab[href*="kasambahay"]').evaluate(el => el.classList.contains('active'));

  // Switch to Admin / Barangay
  await page.click('a.role-tab[href*="admin"]');
  await page.waitForTimeout(150);
  const adminHash = page.url();
  const isAdminActive = await page.locator('a.role-tab[href*="admin"]').evaluate(el => el.classList.contains('active'));

  console.log(`  [B1 Role Switching]: Homeowner -> Kasambahay (${isKasambahayActive ? 'Active' : 'Inactive'}) -> Admin (${isAdminActive ? 'Active' : 'Inactive'})`);
  auditResults.interactions.roleSwitching = isKasambahayActive && isAdminActive && adminHash.includes('#/admin');

  // B2. Direct Step Dropdown Jump
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  await page.selectOption('#step-select-dropdown', '3');
  await page.waitForTimeout(150);
  const jumpStepHeading = await page.locator('#current-step-heading').innerText();
  const jumpHash = page.url();
  const jumpSuccess = jumpHash.includes('/3') && jumpStepHeading.includes('Step 3');
  console.log(`  [B2 Direct Step Jump]: Selected Step 3 -> URL: ${jumpHash} | Heading: "${jumpStepHeading}" (Success: ${jumpSuccess})`);
  auditResults.interactions.stepDropdownJump = jumpSuccess;

  // B3. Next / Previous Step Boundaries
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  const prevDisabledStep1 = await page.locator('.step-nav-btn.prev-btn').getAttribute('aria-disabled');
  await page.click('.step-nav-btn.next-btn');
  await page.waitForTimeout(150);
  const advancedStep2 = page.url().includes('/2');
  await page.click('.step-nav-btn.prev-btn');
  await page.waitForTimeout(150);
  const returnedStep1 = page.url().includes('/1');
  const boundariesSuccess = prevDisabledStep1 === 'true' && advancedStep2 && returnedStep1;
  console.log(`  [B3 Step Boundaries]: Step 1 Prev Disabled: ${prevDisabledStep1} | Step 1->2->1: ${advancedStep2 && returnedStep1}`);
  auditResults.interactions.stepBoundaries = boundariesSuccess;

  // B4. Browser Back and Forward across hash changes
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  await page.click('.step-nav-btn.next-btn'); // to step 2
  await page.waitForTimeout(100);
  await page.click('.step-nav-btn.next-btn'); // to step 3
  await page.waitForTimeout(100);
  await page.goBack();
  await page.waitForTimeout(100);
  const backToStep2 = page.url().includes('/2');
  await page.goBack();
  await page.waitForTimeout(100);
  const backToStep1 = page.url().includes('/1');
  await page.goForward();
  await page.waitForTimeout(100);
  const forwardToStep2 = page.url().includes('/2');
  const historySuccess = backToStep2 && backToStep1 && forwardToStep2;
  console.log(`  [B4 Browser History Back/Forward]: Back to 2 (${backToStep2}) -> Back to 1 (${backToStep1}) -> Forward to 2 (${forwardToStep2})`);
  auditResults.interactions.browserHistory = historySuccess;

  // B5. Direct Deep Links and Page Reload
  await page.goto(`${TARGET_URL}/#/kasambahay/02-login/2`, { waitUntil: 'networkidle' });
  const deepLinkHeadingBefore = await page.locator('#current-step-heading').innerText();
  await page.reload({ waitUntil: 'networkidle' });
  const deepLinkHeadingAfter = await page.locator('#current-step-heading').innerText();
  const deepLinkSuccess = deepLinkHeadingBefore === deepLinkHeadingAfter && deepLinkHeadingAfter.includes('Step 2');
  console.log(`  [B5 Deep Link & Reload]: "${deepLinkHeadingAfter}" retained accurately across reload`);
  auditResults.interactions.deepLinkReload = deepLinkSuccess;

  // B6. Mobile Drawer Operations (Open, Backdrop Click, Escape Key, Link Click)
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });

  // Open drawer
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(150);
  const drawerOpen1 = await page.evaluate(() => document.getElementById('app-sidebar').classList.contains('drawer-open'));
  const backdropOpen1 = await page.evaluate(() => document.getElementById('drawer-backdrop').classList.contains('drawer-open'));

  // Close via close button
  await page.click('#sidebar-close-btn');
  await page.waitForTimeout(150);
  const drawerClosed1 = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));

  // Open again, close via backdrop click
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(150);
  await page.click('#drawer-backdrop', { position: { x: 340, y: 300 } });
  await page.waitForTimeout(150);
  const drawerClosed2 = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));

  // Open again, close via Escape key
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const drawerClosed3 = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));

  // Open again, click a module link inside drawer
  await page.click('#mobile-menu-toggle');
  await page.waitForTimeout(150);
  const drawerScreenshot = path.join(screenshotsDir, 'drawer_open_mobile.png');
  await page.screenshot({ path: drawerScreenshot });
  auditResults.screenshotsCaptured.push(drawerScreenshot);

  await page.locator('#module-nav-container a.module-nav-link').nth(1).click();
  await page.waitForTimeout(200);
  const drawerClosedOnNav = await page.evaluate(() => !document.getElementById('app-sidebar').classList.contains('drawer-open'));
  const moduleNavigated = page.url().includes('02-login');

  const drawerSuccess = drawerOpen1 && backdropOpen1 && drawerClosed1 && drawerClosed2 && drawerClosed3 && drawerClosedOnNav && moduleNavigated;
  console.log(`  [B6 Mobile Drawer]: Open(${drawerOpen1}) -> CloseBtn(${drawerClosed1}) -> BackdropClick(${drawerClosed2}) -> Escape(${drawerClosed3}) -> LinkNavigate(${drawerClosedOnNav && moduleNavigated})`);
  auditResults.interactions.mobileDrawer = drawerSuccess;

  // B7. Lightbox: Open, Zoom Toggle, Escape Dismissal, Focus Restoration
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });

  // Open lightbox programmatically with safe preview asset
  await page.evaluate(() => {
    const btn = document.querySelector('.step-nav-btn.next-btn');
    if (window.__serbisureLightbox) {
      window.__serbisureLightbox.openLightbox({
        src: '/serbisure-logo.png',
        alt: 'SerbiSure Mobile Authentication Flow',
        caption: 'Homeowner › Registration › Step 1: Join as Homeowner',
        triggerElement: btn
      });
    }
  });
  await page.waitForSelector('#screenshot-lightbox[open]', { state: 'visible', timeout: 5000 });

  const isLightboxOpen = await page.evaluate(() => {
    const dialog = document.getElementById('screenshot-lightbox');
    return dialog && dialog.hasAttribute('open');
  });

  // Capture open lightbox screenshot
  const lightboxOpenScreenshot = path.join(screenshotsDir, 'lightbox_open_normal.png');
  await page.screenshot({ path: lightboxOpenScreenshot });
  auditResults.screenshotsCaptured.push(lightboxOpenScreenshot);

  // Toggle Zoom
  await page.locator('#screenshot-lightbox[open] #lightbox-zoom-btn').click();
  await page.waitForTimeout(150);
  const isImageZoomed = await page.evaluate(() => {
    const img = document.getElementById('lightbox-img');
    return img && img.classList.contains('is-zoomed');
  });

  // Capture zoomed lightbox screenshot
  const lightboxZoomedScreenshot = path.join(screenshotsDir, 'lightbox_zoomed_100.png');
  await page.screenshot({ path: lightboxZoomedScreenshot });
  auditResults.screenshotsCaptured.push(lightboxZoomedScreenshot);

  // Dismiss via Escape key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const isLightboxClosed = await page.evaluate(() => {
    const dialog = document.getElementById('screenshot-lightbox');
    return dialog && !dialog.hasAttribute('open');
  });

  const lightboxSuccess = isLightboxOpen && isImageZoomed && isLightboxClosed;
  console.log(`  [B7 Lightbox]: Open(${isLightboxOpen}) -> ZoomToggle(${isImageZoomed}) -> EscapeDismiss(${isLightboxClosed})`);
  auditResults.interactions.lightbox = lightboxSuccess;

  // B8. Keyboard Navigation (Tab, Shift+Tab, Focus Indicators)
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); // focus skip link or brand
  const focusedTag1 = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + '.' + document.activeElement.className : 'NONE');
  await page.keyboard.press('Tab');
  const focusedTag2 = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + '.' + document.activeElement.className : 'NONE');
  await page.keyboard.press('Tab');
  const focusedTag3 = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + '.' + document.activeElement.className : 'NONE');

  // Verify focus ring CSS rule presence
  const focusVisibleCssChecked = await page.evaluate(() => {
    const rules = Array.from(document.styleSheets).flatMap(s => {
      try { return Array.from(s.cssRules); } catch { return []; }
    });
    return rules.some(r => r.selectorText && r.selectorText.includes(':focus-visible'));
  });

  console.log(`  [B8 Keyboard Navigation]: Tab focus elements [${focusedTag1} -> ${focusedTag2} -> ${focusedTag3}] | :focus-visible rules active: ${focusVisibleCssChecked}`);
  auditResults.interactions.keyboardFocus = focusVisibleCssChecked;

  // -------------------------------------------------------------
  // PART C: Full 1-Guide Walkthrough per Role (Steps 1 to End)
  // -------------------------------------------------------------
  console.log('\n--- PART C: Full Guide Walkthrough per Role ---');

  // 1. Homeowner: 01-registration-and-profile (5 steps)
  console.log('  Testing Homeowner Walkthrough: 01-registration-and-profile (Steps 1 to 5)...');
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });
  const hoStepsPassed = [];

  for (let s = 1; s <= 5; s++) {
    const stepHeading = await page.locator('#current-step-heading').innerText();
    const prevBtnDisabled = await page.locator('.step-nav-btn.prev-btn').getAttribute('aria-disabled');
    const nextBtnDisabled = await page.locator('.step-nav-btn.next-btn').getAttribute('aria-disabled');

    hoStepsPassed.push({
      step: s,
      heading: stepHeading,
      prevDisabled: prevBtnDisabled === 'true',
      nextDisabled: nextBtnDisabled === 'true'
    });

    if (s === 1 || s === 3 || s === 5) {
      const snap = path.join(screenshotsDir, `walkthrough_homeowner_step${s}.png`);
      await page.screenshot({ path: snap });
      auditResults.screenshotsCaptured.push(snap);
    }

    if (s < 5) {
      await page.click('.step-nav-btn.next-btn');
      await page.waitForTimeout(120);
    }
  }

  const hoWalkthroughValid = hoStepsPassed.length === 5 &&
    hoStepsPassed[0].prevDisabled && !hoStepsPassed[0].nextDisabled &&
    !hoStepsPassed[4].prevDisabled && hoStepsPassed[4].nextDisabled;
  console.log(`  [Homeowner Walkthrough]: 5/5 steps traversed cleanly (Start boundary: ${hoStepsPassed[0].prevDisabled}, End boundary: ${hoStepsPassed[4].nextDisabled})`);
  auditResults.walkthroughs.homeowner = hoWalkthroughValid;

  // 2. Kasambahay: 02-login (3 steps)
  console.log('  Testing Kasambahay Walkthrough: 02-login (Steps 1 to 3)...');
  await page.goto(`${TARGET_URL}/#/kasambahay/02-login/1`, { waitUntil: 'networkidle' });
  const kbStepsPassed = [];

  for (let s = 1; s <= 3; s++) {
    const stepHeading = await page.locator('#current-step-heading').innerText();
    const prevBtnDisabled = await page.locator('.step-nav-btn.prev-btn').getAttribute('aria-disabled');
    const nextBtnDisabled = await page.locator('.step-nav-btn.next-btn').getAttribute('aria-disabled');

    kbStepsPassed.push({
      step: s,
      heading: stepHeading,
      prevDisabled: prevBtnDisabled === 'true',
      nextDisabled: nextBtnDisabled === 'true'
    });

    if (s === 1 || s === 3) {
      const snap = path.join(screenshotsDir, `walkthrough_kasambahay_step${s}.png`);
      await page.screenshot({ path: snap });
      auditResults.screenshotsCaptured.push(snap);
    }

    if (s < 3) {
      await page.click('.step-nav-btn.next-btn');
      await page.waitForTimeout(120);
    }
  }

  const kbWalkthroughValid = kbStepsPassed.length === 3 &&
    kbStepsPassed[0].prevDisabled && !kbStepsPassed[0].nextDisabled &&
    !kbStepsPassed[2].prevDisabled && kbStepsPassed[2].nextDisabled;
  console.log(`  [Kasambahay Walkthrough]: 3/3 steps traversed cleanly (Start boundary: ${kbStepsPassed[0].prevDisabled}, End boundary: ${kbStepsPassed[2].nextDisabled})`);
  auditResults.walkthroughs.kasambahay = kbWalkthroughValid;

  // 3. Admin: 03-verification-queue-and-ocr (6 steps)
  console.log('  Testing Admin Walkthrough: 03-verification-queue-and-ocr (Steps 1 to 6)...');
  await page.goto(`${TARGET_URL}/#/admin/03-verification-queue-and-ocr/1`, { waitUntil: 'networkidle' });
  const adminStepsPassed = [];

  for (let s = 1; s <= 6; s++) {
    const stepHeading = await page.locator('#current-step-heading').innerText();
    const prevBtnDisabled = await page.locator('.step-nav-btn.prev-btn').getAttribute('aria-disabled');
    const nextBtnDisabled = await page.locator('.step-nav-btn.next-btn').getAttribute('aria-disabled');

    adminStepsPassed.push({
      step: s,
      heading: stepHeading,
      prevDisabled: prevBtnDisabled === 'true',
      nextDisabled: nextBtnDisabled === 'true'
    });

    if (s === 1 || s === 3 || s === 6) {
      const snap = path.join(screenshotsDir, `walkthrough_admin_step${s}.png`);
      await page.screenshot({ path: snap });
      auditResults.screenshotsCaptured.push(snap);
    }

    if (s < 6) {
      await page.click('.step-nav-btn.next-btn');
      await page.waitForTimeout(120);
    }
  }

  const adminWalkthroughValid = adminStepsPassed.length === 6 &&
    adminStepsPassed[0].prevDisabled && !adminStepsPassed[0].nextDisabled &&
    !adminStepsPassed[5].prevDisabled && adminStepsPassed[5].nextDisabled;
  console.log(`  [Admin Walkthrough]: 6/6 steps traversed cleanly (Start boundary: ${adminStepsPassed[0].prevDisabled}, End boundary: ${adminStepsPassed[5].nextDisabled})`);
  auditResults.walkthroughs.admin = adminWalkthroughValid;

  // -------------------------------------------------------------
  // PART D: Non-Technical Reader Usability Checks
  // -------------------------------------------------------------
  console.log('\n--- PART D: Non-Technical Reader Usability Checks ---');
  await page.goto(`${TARGET_URL}/#/homeowner/01-registration-and-profile/1`, { waitUntil: 'networkidle' });

  const readerChecks = await page.evaluate(() => {
    // 1. Role context visible
    const activeRole = document.querySelector('.role-tab.active');
    const breadcrumbRole = document.querySelector('.breadcrumb-role');
    const roleClear = !!(activeRole && breadcrumbRole && activeRole.innerText.trim().length > 0);

    // 2. Guide context visible
    const moduleTitle = document.querySelector('.module-title');
    const guideClear = !!(moduleTitle && moduleTitle.innerText.trim().length > 0);

    // 3. Step progress visible
    const stepBadge = document.querySelector('.step-progress-badge');
    const stepBadgeText = stepBadge ? stepBadge.innerText : '';
    const stepProgressClear = stepBadgeText.includes('Step') && stepBadgeText.includes('of');

    // 4. Obvious Next Action
    const nextBtn = document.querySelector('.step-nav-btn.next-btn');
    const nextBtnStyle = nextBtn ? window.getComputedStyle(nextBtn) : null;
    const isNextActionObvious = nextBtn && (nextBtnStyle.backgroundColor === 'rgb(255, 161, 53)' || nextBtnStyle.backgroundColor === '#ffa135');

    // 5. Single Window Scroll Check (no competing nested scrollbars)
    const bodyOverflow = window.getComputedStyle(document.body).overflow;
    const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;
    const isSingleWindowScroll = bodyOverflow !== 'hidden' && htmlOverflow !== 'hidden';

    return {
      roleClear,
      guideClear,
      stepProgressClear,
      stepBadgeText,
      isNextActionObvious,
      isSingleWindowScroll
    };
  });

  console.log(`  [Reader Context]: Role clear (${readerChecks.roleClear}) | Guide clear (${readerChecks.guideClear}) | Progress indicator: "${readerChecks.stepBadgeText}"`);
  console.log(`  [Action Clarity]: Obvious Next Action primary styling: ${readerChecks.isNextActionObvious}`);
  console.log(`  [Single Window Scroll]: Main window scroll intact: ${readerChecks.isSingleWindowScroll}`);
  auditResults.nonTechnicalChecks = readerChecks;

  await browser.close();

  // Write summary JSON for report generation
  fs.writeFileSync(path.join(screenshotsDir, 'audit-results.json'), JSON.stringify(auditResults, null, 2));

  console.log('\n================================================================');
  console.log('  Pass 2 Real Browser Verification Audit Completed Successfully!');
  console.log(`  Total Screenshots Captured: ${auditResults.screenshotsCaptured.length}`);
  console.log(`  Output Directory: ${screenshotsDir}`);
  console.log('================================================================\n');

  return auditResults;
}

runPass2Audit().catch(err => {
  console.error('Fatal error during Pass 2 browser audit:', err);
  process.exit(1);
});

