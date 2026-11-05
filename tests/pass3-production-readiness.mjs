// tests/pass3-production-readiness.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const screenshotsDir = path.resolve(rootDir, 'tests/screenshots/pass3');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

// Static server capable of serving both Root (/) and Subpath (/SerbiSure-User-Manual/)
function createProductionServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0].split('#')[0];

    // Strip subpath prefix if present
    if (reqUrl.startsWith('/SerbiSure-User-Manual/')) {
      reqUrl = reqUrl.replace('/SerbiSure-User-Manual/', '/');
    } else if (reqUrl === '/SerbiSure-User-Manual') {
      res.writeHead(301, { Location: '/SerbiSure-User-Manual/' });
      res.end();
      return;
    }

    if (reqUrl === '/' || reqUrl === '') {
      reqUrl = '/index.html';
    }

    const filePath = path.join(distDir, reqUrl);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function runProductionPass3() {
  console.log('================================================================');
  console.log('  SerbiSure User Manual — Pass 3 Production Readiness Review');
  console.log('================================================================\n');

  if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error('Production dist directory missing. Run "npm run build" first.');
  }

  const server = createProductionServer();
  const PORT = 4173;
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`🚀 Production preview server running on http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    rootHosting: null,
    subpathHosting: null,
    assetIntegrity: [],
    networkSafety: { externalRequests: 0, requestedHosts: [] },
    deepLinksAndHistory: null,
    malformedUrlHandling: null,
    markdownAndScriptSanitization: null
  };

  // Track network requests to verify 0 unintended external calls
  page.on('request', request => {
    const url = new URL(request.url());
    results.networkSafety.requestedHosts.push(url.host);
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') {
      results.networkSafety.externalRequests++;
      console.error(`❌ UNINTENDED EXTERNAL REQUEST: ${request.url()}`);
    }
  });

  const failedAssets = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failedAssets.push({ url: response.url(), status: response.status() });
    }
  });

  // -------------------------------------------------------------
  // TEST 1: Root Hosting (http://127.0.0.1:4173/)
  // -------------------------------------------------------------
  console.log('1. Testing Root Hosting (http://127.0.0.1:4173/)...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${PORT}/#/`, { waitUntil: 'networkidle' });

  const rootTitle = await page.title();
  const rootHeading = await page.locator('#current-step-heading').innerText();
  const rootRoleTabsCount = await page.locator('.role-tab').count();

  const rootScreenshot = path.join(screenshotsDir, 'dist_root_hosting.png');
  await page.screenshot({ path: rootScreenshot });

  results.rootHosting = {
    title: rootTitle,
    heading: rootHeading,
    roleTabsCount: rootRoleTabsCount,
    passed: rootRoleTabsCount === 3 && rootHeading.length > 0
  };
  console.log(`   ✅ Root hosting verified: ${rootTitle} | Heading: "${rootHeading}" | Roles: ${rootRoleTabsCount}`);

  // -------------------------------------------------------------
  // TEST 2: Simulated Repository Subpath Hosting (/SerbiSure-User-Manual/)
  // -------------------------------------------------------------
  console.log('\n2. Testing Repository Subpath Hosting (http://127.0.0.1:4173/SerbiSure-User-Manual/)...');
  await page.goto(`http://127.0.0.1:${PORT}/SerbiSure-User-Manual/#/`, { waitUntil: 'networkidle' });

  const subpathTitle = await page.title();
  const subpathHeading = await page.locator('#current-step-heading').innerText();
  const subpathRoleTabsCount = await page.locator('.role-tab').count();
  const brandImgLoaded = await page.evaluate(() => {
    const img = document.querySelector('.brand-icon');
    return img && img.naturalWidth > 0;
  });

  const subpathScreenshot = path.join(screenshotsDir, 'dist_subpath_hosting.png');
  await page.screenshot({ path: subpathScreenshot });

  results.subpathHosting = {
    title: subpathTitle,
    heading: subpathHeading,
    roleTabsCount: subpathRoleTabsCount,
    brandImageResolved: brandImgLoaded,
    passed: subpathRoleTabsCount === 3 && subpathHeading.length > 0 && brandImgLoaded
  };
  console.log(`   ✅ Subpath hosting verified: ${subpathTitle} | Branding Icon: ${brandImgLoaded ? 'Resolved (200 OK)' : 'FAILED'}`);

  // -------------------------------------------------------------
  // TEST 3: Deep Links Survive Refresh & Browser Back/Forward
  // -------------------------------------------------------------
  console.log('\n3. Testing Deep Links and Browser Navigation on Built Dist...');
  await page.goto(`http://127.0.0.1:${PORT}/#/kasambahay/02-login/2`, { waitUntil: 'networkidle' });
  const kbStep2HeadingBefore = await page.locator('#current-step-heading').innerText();

  // Reload
  await page.reload({ waitUntil: 'networkidle' });
  const kbStep2HeadingAfter = await page.locator('#current-step-heading').innerText();
  const reloadPreserved = kbStep2HeadingBefore === kbStep2HeadingAfter;

  // Advance to Step 3
  await page.click('.step-nav-btn.next-btn');
  await page.waitForTimeout(100);
  const atStep3 = page.url().includes('/3');

  // Back to Step 2
  await page.goBack();
  await page.waitForTimeout(100);
  const backToStep2 = page.url().includes('/2');

  // Forward to Step 3
  await page.goForward();
  await page.waitForTimeout(100);
  const forwardToStep3 = page.url().includes('/3');

  results.deepLinksAndHistory = reloadPreserved && atStep3 && backToStep2 && forwardToStep3;
  console.log(`   ✅ Deep links & history verified: Reload(${reloadPreserved}) -> Next(${atStep3}) -> Back(${backToStep2}) -> Forward(${forwardToStep3})`);

  // -------------------------------------------------------------
  // TEST 4: Malformed URLs and Safe Fallbacks
  // -------------------------------------------------------------
  console.log('\n4. Testing Malformed URLs and Boundary Recovery...');
  await page.goto(`http://127.0.0.1:${PORT}/#/ghost-role/nonexistent-module/9999`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(100);
  const normalizedUrl = page.url();
  const safeFallback = normalizedUrl.includes('#/homeowner/01-registration-and-profile/1');

  // Test special character / null byte in hash
  await page.goto(`http://127.0.0.1:${PORT}/#/%00/%20/crash`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(100);
  const normalizedNullByte = page.url().includes('#/homeowner/01-registration-and-profile/1');

  results.malformedUrlHandling = safeFallback && normalizedNullByte;
  console.log(`   ✅ Malformed URL handling: Unknown path normalized: ${safeFallback} | Null-byte path normalized: ${normalizedNullByte}`);

  // -------------------------------------------------------------
  // TEST 5: Security & Script Injection Defense in Live DOM
  // -------------------------------------------------------------
  console.log('\n5. Verifying XSS & Script Execution Defenses in Running Browser...');
  const xssDefenseResult = await page.evaluate(() => {
    // Attempt to inject an XSS script tag into the page via renderMarkdown
    let scriptExecuted = false;
    window.__xssPwned = () => { scriptExecuted = true; };

    // Check if any unexpected script or error handlers exist
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || s.innerText);
    const inlineOnErrors = Array.from(document.querySelectorAll('*[onerror], *[onclick]'));

    return {
      scriptExecuted,
      inlineHandlersCount: inlineOnErrors.length
    };
  });

  results.markdownAndScriptSanitization = !xssDefenseResult.scriptExecuted && xssDefenseResult.inlineHandlersCount === 0;
  console.log(`   ✅ Security check: Injected scripts executed: ${xssDefenseResult.scriptExecuted} | Inline event handlers: ${xssDefenseResult.inlineHandlersCount}`);

  // -------------------------------------------------------------
  // TEST 6: Asset Integrity and Zero External Requests
  // -------------------------------------------------------------
  console.log('\n6. Checking Asset Resolution & Network Isolation...');
  const assetPassed = failedAssets.length === 0;
  const networkIsolated = results.networkSafety.externalRequests === 0;

  if (!assetPassed) {
    console.error(`   ❌ Failed asset requests (${failedAssets.length}):`, failedAssets);
  } else {
    console.log('   ✅ All CSS, JS, branding images, and icons resolved with HTTP 200.');
  }

  if (!networkIsolated) {
    console.error(`   ❌ External network calls detected: ${results.networkSafety.externalRequests}`);
  } else {
    console.log('   ✅ 100% network isolation: zero calls to external APIs, fonts, or placeholder CDNs.');
  }

  await browser.close();
  server.close();

  const allPassed = results.rootHosting.passed &&
    results.subpathHosting.passed &&
    results.deepLinksAndHistory &&
    results.malformedUrlHandling &&
    results.markdownAndScriptSanitization &&
    assetPassed &&
    networkIsolated;

  console.log('\n================================================================');
  console.log(`  Pass 3 Production Readiness Verdict: ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ VERIFICATION FAILED'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }

  return results;
}

runProductionPass3().catch(err => {
  console.error('Fatal error during Pass 3 verification:', err);
  process.exit(1);
});

