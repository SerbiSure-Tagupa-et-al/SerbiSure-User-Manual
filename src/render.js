// src/render.js
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getIconSvg } from './icons.js';
import { formatHash, getAdjacentSteps } from './navigation.js';
import { openLightbox } from './lightbox.js';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true
});

let purifyInstance = DOMPurify;
if (typeof DOMPurify === 'function' && typeof DOMPurify.sanitize !== 'function') {
  if (typeof window !== 'undefined') {
    purifyInstance = DOMPurify(window);
  }
}

/**
 * Escapes unsafe characters to prevent HTML/XSS injection in dynamic text contexts.
 */
export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes and formats markdown content safely into HTML.
 */
export function renderMarkdown(rawMarkdown = '') {
  if (!rawMarkdown) return '';

  // Transform markdown alerts (GitHub style: > [!NOTE], etc.)
  let processed = rawMarkdown.replace(
    />\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*\n?)*)/gi,
    (match, alertType, body) => {
      const type = alertType.toLowerCase();
      const cleanBody = body.replace(/^>\s?/gm, '').trim();
      const renderedBody = marked.parseInline(cleanBody);
      return `<div class="callout callout-${type}"><span class="callout-tag">${alertType}</span>\n<div class="callout-content">${renderedBody}</div></div>\n`;
    }
  );

  const rawHtml = marked.parse(processed);

  let cleanHtml = rawHtml;
  if (purifyInstance && typeof purifyInstance.sanitize === 'function') {
    cleanHtml = purifyInstance.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'code', 'pre',
        'blockquote', 'a', 'span', 'div', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
  } else {
    // Robust fallback sanitizer for non-DOM environments (Node unit tests / SSR)
    cleanHtml = cleanHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, 'href="#"');
  }

  // Ensure external links have safe rel and target attributes
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    const links = tempDiv.querySelectorAll('a');
    for (const link of links) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    return tempDiv.innerHTML;
  }

  return cleanHtml;
}

/**
 * Renders the top role selector tabs.
 */
export function renderRoleTabs(container, rolesMap, activeRoleId) {
  if (!container) return;
  container.innerHTML = '';

  for (const [roleId, roleData] of Object.entries(rolesMap)) {
    const isActive = roleId === activeRoleId;
    const firstModule = roleData.modules[0];
    const targetHash = firstModule && firstModule.steps[0]
      ? formatHash(roleId, firstModule.folder, firstModule.steps[0].number)
      : formatHash(roleId, null, null);

    const btn = document.createElement('a');
    btn.href = targetHash;
    btn.className = `role-tab ${isActive ? 'active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('aria-label', `${roleData.label} Guides`);
    btn.innerHTML = `
      <span class="role-icon" aria-hidden="true">${getIconSvg(roleData.icon)}</span>
      <span class="role-text">${roleData.label}</span>
    `;

    container.appendChild(btn);
  }
}

/**
 * Renders the mobile topic select dropdown.
 */
export function renderMobileModuleSelect(selectElement, modules = [], activeRoleId, activeModuleFolder) {
  if (!selectElement) return;
  selectElement.innerHTML = '';

  if (!modules || modules.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No topics available';
    selectElement.appendChild(opt);
    selectElement.disabled = true;
    return;
  }

  selectElement.disabled = false;
  modules.forEach((mod, idx) => {
    const opt = document.createElement('option');
    opt.value = mod.folder;
    opt.textContent = `${idx + 1}. ${mod.title}`;
    if (mod.folder === activeModuleFolder) {
      opt.selected = true;
    }
    selectElement.appendChild(opt);
  });
}

/**
 * Renders the module navigation list in sidebar/drawer.
 */
export function renderModuleList(container, modules = [], activeRoleId, activeModuleFolder, onLinkClick, isFullManualActive = false) {
  if (!container) return;
  container.innerHTML = '';

  // Full Manual & Table of Contents Quick Entry at top of Sidebar
  const fullManualBox = document.createElement('div');
  fullManualBox.className = 'sidebar-full-manual-box';
  const fullManualLink = document.createElement('a');
  fullManualLink.href = '#/full-manual';
  fullManualLink.className = `full-manual-sidebar-btn ${isFullManualActive ? 'active' : ''}`;
  fullManualLink.setAttribute('aria-current', isFullManualActive ? 'page' : 'false');
  fullManualLink.innerHTML = `
    <span class="mod-icon" aria-hidden="true">${getIconSvg('list')}</span>
    <span class="mod-title">Full Manual &amp; Table of Contents</span>
    <span class="mod-step-badge">All Docs</span>
  `;
  if (typeof onLinkClick === 'function') {
    fullManualLink.addEventListener('click', onLinkClick);
  }
  fullManualBox.appendChild(fullManualLink);
  container.appendChild(fullManualBox);

  if (!modules || modules.length === 0) {
    const notice = document.createElement('div');
    notice.className = 'empty-modules-notice';
    notice.innerHTML = `<p>No guides available for this role yet.</p>`;
    container.appendChild(notice);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'module-nav-list';
  list.setAttribute('role', 'list');

  for (const mod of modules) {
    const isActive = !isFullManualActive && mod.folder === activeModuleFolder;
    const firstStep = mod.steps[0];
    const stepNum = firstStep ? firstStep.number : 1;
    const targetHash = formatHash(activeRoleId, mod.folder, stepNum);

    const li = document.createElement('li');
    li.className = 'module-nav-item';

    const a = document.createElement('a');
    a.href = targetHash;
    a.className = `module-nav-link ${isActive ? 'active' : ''}`;
    a.setAttribute('aria-current', isActive ? 'page' : 'false');
    a.innerHTML = `
      <span class="mod-icon" aria-hidden="true">${getIconSvg(mod.icon)}</span>
      <span class="mod-title">${escapeHtml(mod.title)}</span>
      <span class="mod-step-badge">${mod.steps.length} ${mod.steps.length === 1 ? 'step' : 'steps'}</span>
    `;

    if (typeof onLinkClick === 'function') {
      a.addEventListener('click', onLinkClick);
    }

    li.appendChild(a);
    list.appendChild(li);
  }

  container.appendChild(list);
}

/**
 * Renders the main content area (active module header + synchronized active step card).
 */
export function renderMainContent({
  container,
  roleData,
  moduleData,
  step
}) {
  if (!container) return;
  container.innerHTML = '';

  if (!moduleData) {
    container.innerHTML = `
      <div class="manual-welcome-card">
        <h2>Welcome to SerbiSure User Guide</h2>
        <p>Select a guide topic from the menu to start reading.</p>
      </div>
    `;
    return;
  }

  // 1. Module Header
  const headerCard = document.createElement('header');
  headerCard.className = 'module-header-card';
  headerCard.innerHTML = `
    <div class="module-header-top-row">
      <nav class="module-breadcrumb" aria-label="Breadcrumb">
        <span class="breadcrumb-role">${escapeHtml(roleData.label)}</span>
        <span class="breadcrumb-separator" aria-hidden="true">›</span>
        <span class="breadcrumb-current">${escapeHtml(moduleData.title)}</span>
      </nav>
      <div class="module-doc-actions">
        <a href="#/full-manual" class="doc-action-pill" title="Open Full User Manual with Table of Contents">
          ${getIconSvg('list')}
          <span>Full Manual &amp; TOC</span>
        </a>
        <a href="./SerbiSure-User-Manual.docx" download="SerbiSure-User-Manual.docx" class="doc-action-pill secondary" title="Download Complete User Manual as Word (.docx)">
          ${getIconSvg('download')}
          <span>Download .docx</span>
        </a>
      </div>
    </div>
    <h1 class="module-title">${escapeHtml(moduleData.title)}</h1>
    ${moduleData.overview ? `<p class="module-overview">${escapeHtml(moduleData.overview)}</p>` : ''}
  `;
  container.appendChild(headerCard);

  // 2. Active Step Card
  if (!step) {
    const emptyStepNotice = document.createElement('div');
    emptyStepNotice.className = 'empty-steps-card';
    emptyStepNotice.innerHTML = `
      <div class="empty-icon">${getIconSvg('file-text')}</div>
      <h3>Guide coming soon</h3>
      <p>Instructions for this topic are currently being prepared.</p>
    `;
    container.appendChild(emptyStepNotice);
    return;
  }

  const { prev, next } = getAdjacentSteps(moduleData.steps, step.number);

  const stepCard = document.createElement('article');
  stepCard.className = 'step-card';
  stepCard.setAttribute('aria-labelledby', 'current-step-heading');

  // Step Top Meta Bar
  const metaBar = document.createElement('div');
  metaBar.className = 'step-meta-bar';
  metaBar.innerHTML = `
    <div class="step-progress-indicator">
      <span class="step-badge step-progress-badge">Step ${step.index} of ${step.totalInModule}</span>
    </div>
    <div class="step-quick-jump">
      <label for="step-select-dropdown" class="step-select-label">Jump to step:</label>
      <select id="step-select-dropdown" class="step-select-dropdown" title="Step ${step.index}: ${escapeHtml(step.title)}" aria-label="Jump to a specific step in this guide">
        ${moduleData.steps.map(s => `
          <option value="${s.number}" title="Step ${s.index}: ${escapeHtml(s.title)}" ${s.number === step.number ? 'selected' : ''}>
            Step ${s.index}: ${escapeHtml(s.title)}
          </option>
        `).join('')}
      </select>
    </div>
  `;
  stepCard.appendChild(metaBar);

  // Wire step selector dropdown
  const dropdown = metaBar.querySelector('#step-select-dropdown');
  dropdown.addEventListener('change', (e) => {
    const selectedNum = parseInt(e.target.value, 10);
    if (!isNaN(selectedNum)) {
      location.hash = formatHash(roleData.id, moduleData.folder, selectedNum);
    }
  });

  // Step Heading (Displays full step number and complete title prominently)
  const heading = document.createElement('h2');
  heading.id = 'current-step-heading';
  heading.className = 'step-heading';
  heading.tabIndex = -1; // Allows programmatic focus on navigation
  heading.innerHTML = `<span class="step-num-prefix">Step ${step.index}:</span> <span class="step-title-text">${escapeHtml(step.title)}</span>`;
  stepCard.appendChild(heading);

  // Main Synchronized Step Viewer Grid
  const viewerGrid = document.createElement('div');
  viewerGrid.className = 'step-viewer-grid';

  // Screenshot Column
  const screenshotCol = document.createElement('div');
  screenshotCol.className = 'step-screenshot-column';

  if (step.hasScreenshot && step.screenshotUrl) {
    screenshotCol.innerHTML = `
      <div class="screenshot-figure-wrapper">
        <figure class="screenshot-figure">
          <div class="screenshot-img-container">
            <img
              class="screenshot-img"
              src="${step.screenshotUrl}"
              alt="${escapeHtml(roleData.label)} — ${escapeHtml(moduleData.title)} — Step ${step.index}: ${escapeHtml(step.title)}"
              loading="lazy"
            />
          </div>
          <figcaption class="screenshot-caption">
            <button type="button" class="enlarge-btn" aria-label="Enlarge screenshot for step ${step.index}">
              ${getIconSvg('zoom-in')}
              <span>Tap to enlarge</span>
            </button>
          </figcaption>
        </figure>
      </div>
    `;

    const img = screenshotCol.querySelector('.screenshot-img');
    const enlargeBtn = screenshotCol.querySelector('.enlarge-btn');

    enlargeBtn.addEventListener('click', () => {
      openLightbox({
        src: step.screenshotUrl,
        alt: `Step ${step.index}: ${step.title}`,
        caption: `${roleData.label} › ${moduleData.title} › Step ${step.index}: ${step.title}`,
        triggerElement: enlargeBtn
      });
    });

    img.addEventListener('click', () => {
      enlargeBtn.click();
    });

    img.addEventListener('error', () => {
      screenshotCol.innerHTML = `
        <div class="screenshot-placeholder error">
          <div class="placeholder-icon">${getIconSvg('image')}</div>
          <div class="placeholder-content">
            <p class="placeholder-title">Image could not be loaded</p>
            <p class="placeholder-desc">The screenshot file is currently unavailable.</p>
          </div>
        </div>
      `;
    });
  } else {
    // Understated, quiet placeholder that does not dominate the page and exposes zero author paths
    screenshotCol.innerHTML = `
      <div class="screenshot-placeholder">
        <div class="placeholder-icon" aria-hidden="true">${getIconSvg('image')}</div>
        <div class="placeholder-content">
          <p class="placeholder-title">Screenshot coming soon</p>
          <p class="placeholder-desc">Illustrated screen capture will appear here. Please follow the written instructions below.</p>
        </div>
      </div>
    `;
  }
  viewerGrid.appendChild(screenshotCol);

  // Instructions Column
  const instructionsCol = document.createElement('div');
  instructionsCol.className = 'step-instructions-column';

  const instructionsBody = document.createElement('div');
  instructionsBody.className = 'instructions-body markdown-body';

  if (step.extension === 'txt') {
    // Plain-text files render as text, preserving line breaks safely without interpreting markdown or executing HTML
    const textWrapper = document.createElement('div');
    textWrapper.className = 'plain-text-body';
    textWrapper.style.whiteSpace = 'pre-wrap';
    textWrapper.style.fontFamily = 'inherit';
    textWrapper.style.lineHeight = '1.6';
    textWrapper.textContent = step.rawContent;
    instructionsBody.appendChild(textWrapper);
  } else {
    // Remove first line from raw markdown if it was the title we already rendered as h2
    let instructionsMarkdown = step.rawContent;
    const lines = instructionsMarkdown.split('\n');
    if (lines.length > 0 && lines[0].trim().startsWith('#')) {
      lines.shift();
      instructionsMarkdown = lines.join('\n').trim();
    }
    instructionsBody.innerHTML = renderMarkdown(instructionsMarkdown);
  }

  instructionsCol.appendChild(instructionsBody);
  viewerGrid.appendChild(instructionsCol);
  stepCard.appendChild(viewerGrid);

  // Step Navigation Controls Footer (Previous / Next)
  const navFooter = document.createElement('footer');
  navFooter.className = 'step-nav-footer';

  // Previous Button (Secondary)
  const prevBtn = document.createElement('a');
  if (prev) {
    prevBtn.href = formatHash(roleData.id, moduleData.folder, prev.number);
    prevBtn.className = 'step-nav-btn prev-btn';
    prevBtn.innerHTML = `
      <span class="nav-icon" aria-hidden="true">${getIconSvg('chevron-left')}</span>
      <span class="nav-text">
        <span class="nav-sub nav-direction">Previous Step</span>
        <span class="nav-label nav-step-title">Step ${prev.index}: ${escapeHtml(prev.title)}</span>
      </span>
    `;
  } else {
    prevBtn.className = 'step-nav-btn prev-btn disabled';
    prevBtn.setAttribute('aria-disabled', 'true');
    prevBtn.innerHTML = `
      <span class="nav-icon" aria-hidden="true">${getIconSvg('chevron-left')}</span>
      <span class="nav-text">
        <span class="nav-sub nav-direction">Previous Step</span>
        <span class="nav-label nav-step-title">Start of Guide</span>
      </span>
    `;
  }

  // Next Button (Primary Action)
  const nextBtn = document.createElement('a');
  if (next) {
    nextBtn.href = formatHash(roleData.id, moduleData.folder, next.number);
    nextBtn.className = 'step-nav-btn next-btn';
    nextBtn.innerHTML = `
      <span class="nav-text">
        <span class="nav-sub nav-direction">Next Step</span>
        <span class="nav-label nav-step-title">Step ${next.index}: ${escapeHtml(next.title)}</span>
      </span>
      <span class="nav-icon" aria-hidden="true">${getIconSvg('chevron-right')}</span>
    `;
  } else {
    nextBtn.className = 'step-nav-btn next-btn disabled';
    nextBtn.setAttribute('aria-disabled', 'true');
    nextBtn.innerHTML = `
      <span class="nav-text">
        <span class="nav-sub nav-direction">Next Step</span>
        <span class="nav-label nav-step-title">End of Guide</span>
      </span>
      <span class="nav-icon" aria-hidden="true">${getIconSvg('chevron-right')}</span>
    `;
  }

  navFooter.appendChild(prevBtn);
  navFooter.appendChild(nextBtn);
  stepCard.appendChild(navFooter);

  container.appendChild(stepCard);

  // Smooth scroll into view respecting sticky header
  setTimeout(() => {
    heading.focus({ preventScroll: true });
    stepCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 10);
}

/**
 * Renders the Full User Manual (Table of Contents + Continuous Document View)
 * covering the complete Application to Admin flow across all three roles.
 */
export function renderFullManual({
  container,
  rolesMap,
  activePartFilter = 'all',
  scrollTargetId = null
}) {
  if (!container) return;
  container.innerHTML = '';

  const partsConfig = [
    {
      roleId: 'homeowner',
      partNum: 1,
      roman: 'I',
      title: 'Homeowner Application Guide',
      subtitle: 'Step-by-step procedures for Homeowners registering an account, posting household job listings, reviewing worker applicants, issuing Digital Village Passes, and managing bookings.'
    },
    {
      roleId: 'kasambahay',
      partNum: 2,
      roman: 'II',
      title: 'Kasambahay (Worker) Application Guide',
      subtitle: 'Step-by-step procedures for Household Workers registering, completing identity & liveness verification, uploading clearances, generating a profile CV, applying for jobs, and presenting Digital Village Passes.'
    },
    {
      roleId: 'admin',
      partNum: 3,
      roman: 'III',
      title: 'Admin & Barangay Control Panel',
      subtitle: 'Step-by-step operational procedures for Barangay Reviewers and Super Administrators managing verification queues, AI/OCR review, user access controls, penalty points, and emergency broadcasts.'
    }
  ];

  const visibleParts = activePartFilter === 'all'
    ? partsConfig
    : partsConfig.filter(p => p.roleId === activePartFilter);

  const wrapper = document.createElement('div');
  wrapper.className = 'full-manual-wrapper';

  // 1. Top Control Toolbar (Non-Print)
  const toolbar = document.createElement('div');
  toolbar.className = 'full-manual-toolbar no-print';
  toolbar.innerHTML = `
    <div class="full-manual-toolbar-left">
      <a href="#/homeowner/01-registration-and-profile/1" class="doc-action-pill back-to-interactive">
        ${getIconSvg('chevron-left')}
        <span>Step-by-Step Viewer</span>
      </a>
      <div class="part-filter-group" role="group" aria-label="Filter manual parts">
        <a href="#/full-manual" class="part-filter-btn ${activePartFilter === 'all' ? 'active' : ''}">All Flows (Complete Manual)</a>
        <a href="#/full-manual/homeowner" class="part-filter-btn ${activePartFilter === 'homeowner' ? 'active' : ''}">Homeowner</a>
        <a href="#/full-manual/kasambahay" class="part-filter-btn ${activePartFilter === 'kasambahay' ? 'active' : ''}">Kasambahay</a>
        <a href="#/full-manual/admin" class="part-filter-btn ${activePartFilter === 'admin' ? 'active' : ''}">Admin</a>
      </div>
    </div>
    <div class="full-manual-toolbar-right">
      <a href="./SerbiSure-User-Manual.docx" download="SerbiSure-User-Manual.docx" class="doc-action-pill primary-download">
        ${getIconSvg('download')}
        <span>Download Word (.docx)</span>
      </a>
      <button type="button" class="doc-action-pill print-manual-btn" id="print-full-manual-btn">
        ${getIconSvg('printer')}
        <span>Print / Save PDF</span>
      </button>
    </div>
  `;
  wrapper.appendChild(toolbar);

  const printBtn = toolbar.querySelector('#print-full-manual-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Calculate deterministic page numbers for each module & step in the Table of Contents
  let logicalPage = 1;
  const pageNumberMap = new Map();

  for (const part of visibleParts) {
    const roleData = rolesMap[part.roleId];
    if (!roleData) continue;
    pageNumberMap.set(`part-${part.roleId}`, logicalPage);
    for (let mIdx = 0; mIdx < roleData.modules.length; mIdx++) {
      const mod = roleData.modules[mIdx];
      pageNumberMap.set(`mod-${part.roleId}-${mod.folder}`, logicalPage);
      for (let sIdx = 0; sIdx < mod.steps.length; sIdx++) {
        const step = mod.steps[sIdx];
        pageNumberMap.set(`step-${part.roleId}-${mod.folder}-${step.number}`, logicalPage);
        logicalPage++;
      }
    }
  }

  // 2. Classic Document Sheet: Table of Contents (Exact match to professional User Manual layout)
  const tocSheet = document.createElement('section');
  tocSheet.className = 'manual-doc-sheet toc-sheet';
  tocSheet.id = 'manual-toc-top';
  tocSheet.setAttribute('aria-labelledby', 'current-step-heading');

  let tocEntriesHtml = '';
  for (const part of visibleParts) {
    const roleData = rolesMap[part.roleId];
    if (!roleData) continue;
    const partPage = pageNumberMap.get(`part-${part.roleId}`) || 1;
    const partAnchor = `doc-part-${part.roleId}`;

    tocEntriesHtml += `
      <div class="toc-part-block">
        <div class="toc-row toc-level-part">
          <a href="#/full-manual/${activePartFilter}/${partAnchor}" data-scroll-target="${partAnchor}" class="toc-link">
            <span class="toc-title">${escapeHtml(part.title)}</span>
            <span class="toc-dots" aria-hidden="true"></span>
            <span class="toc-page">${partPage}</span>
          </a>
        </div>
    `;

    roleData.modules.forEach((mod) => {
      const modAnchor = `doc-mod-${part.roleId}-${mod.folder}`;
      const modPage = pageNumberMap.get(`mod-${part.roleId}-${mod.folder}`) || 1;

      tocEntriesHtml += `
        <div class="toc-row toc-level-module">
          <a href="#/full-manual/${activePartFilter}/${modAnchor}" data-scroll-target="${modAnchor}" class="toc-link">
            <span class="toc-title">${escapeHtml(mod.title)}</span>
            <span class="toc-dots" aria-hidden="true"></span>
            <span class="toc-page">${modPage}</span>
          </a>
        </div>
      `;

      mod.steps.forEach((step) => {
        const stepAnchor = `doc-step-${part.roleId}-${mod.folder}-${step.number}`;
        const stepPage = pageNumberMap.get(`step-${part.roleId}-${mod.folder}-${step.number}`) || modPage;

        tocEntriesHtml += `
          <div class="toc-row toc-level-step">
            <a href="#/full-manual/${activePartFilter}/${stepAnchor}" data-scroll-target="${stepAnchor}" class="toc-link">
              <span class="toc-title">${escapeHtml(step.title)}</span>
              <span class="toc-dots" aria-hidden="true"></span>
              <span class="toc-page">${stepPage}</span>
            </a>
          </div>
        `;
      });
    });

    tocEntriesHtml += `</div>`;
  }

  tocSheet.innerHTML = `
    <div class="doc-sheet-running-header">
      <span class="running-header-title">SerbiSure User Manual</span>
    </div>
    <h1 class="doc-sheet-main-title" id="current-step-heading" tabindex="-1">Table of Contents</h1>
    <p class="doc-sheet-intro">Below is the complete table of contents for the manual:</p>
    <nav class="toc-entries-container" aria-label="Manual Table of Contents">
      ${tocEntriesHtml}
    </nav>
    <p class="doc-sheet-outro">The following pages are detailed sections from the manual.</p>
    <div class="doc-sheet-running-footer">
      <span>SerbiSure-User-Manual.doc</span>
      <span>© 2026 SerbiSure</span>
    </div>
  `;
  wrapper.appendChild(tocSheet);

  // 3. Detailed Step-by-Step Sections (Printed Paper Document Sheets)
  for (const part of visibleParts) {
    const roleData = rolesMap[part.roleId];
    if (!roleData) continue;

    const partSection = document.createElement('section');
    partSection.className = 'manual-part-section';
    partSection.id = `doc-part-${part.roleId}`;

    roleData.modules.forEach((mod, mIdx) => {
      const modNum = `${part.partNum}.${mIdx + 1}`;
      const modPage = pageNumberMap.get(`mod-${part.roleId}-${mod.folder}`) || 1;

      const modSheet = document.createElement('article');
      modSheet.className = 'manual-doc-sheet module-doc-sheet';
      modSheet.id = `doc-mod-${part.roleId}-${mod.folder}`;

      const partIntroHtml = mIdx === 0 ? `
        <div class="doc-part-inline-header">
          <h2 class="doc-part-heading">${escapeHtml(part.title)}</h2>
          <p class="doc-part-desc">${escapeHtml(part.subtitle)}</p>
        </div>
      ` : '';

      const modHeader = document.createElement('header');
      modHeader.className = 'doc-module-header';
      modHeader.innerHTML = `
        <div class="doc-sheet-running-header">
          <span class="running-header-spacer no-print"></span>
          <span class="running-header-title">SerbiSure User Manual</span>
          <a href="#/full-manual/${activePartFilter}/manual-toc-top" data-scroll-target="manual-toc-top" class="toc-back-link no-print">↑ Table of Contents</a>
        </div>
        ${partIntroHtml}
        <div class="doc-module-title-row">
          <h3 class="doc-module-heading">${modNum}  ${escapeHtml(mod.title)}</h3>
          <a href="${formatHash(roleData.id, mod.folder, mod.steps[0] ? mod.steps[0].number : 1)}" class="open-interactive-link no-print">
            Interactive View ›
          </a>
        </div>
        ${mod.overview ? `<p class="doc-module-overview">${escapeHtml(mod.overview)}</p>` : ''}
      `;
      modSheet.appendChild(modHeader);

      const stepsList = document.createElement('div');
      stepsList.className = 'doc-steps-list';

      mod.steps.forEach((step) => {
        const stepCode = `${modNum}.${step.index}`;
        const stepBlock = document.createElement('div');
        stepBlock.className = 'doc-step-block';
        stepBlock.id = `doc-step-${part.roleId}-${mod.folder}-${step.number}`;

        let stepHtml = '';
        if (step.extension === 'txt') {
          stepHtml = `<div class="plain-text-body" style="white-space:pre-wrap;">${escapeHtml(step.rawContent)}</div>`;
        } else {
          let md = step.rawContent;
          const lines = md.split('\n');
          if (lines.length > 0 && lines[0].trim().startsWith('#')) {
            lines.shift();
            md = lines.join('\n').trim();
          }
          stepHtml = renderMarkdown(md);
        }

        const expectedScreenshotPath = `docs/${roleData.id}/${mod.folder}/screenshots/${step.number}.png`;
        const isAdminRole = roleData.id === 'admin';

        stepBlock.innerHTML = `
          <div class="doc-step-header">
            <h4 class="doc-step-title">
              <span class="doc-step-num">${stepCode}</span>
              <span>${escapeHtml(step.title)}</span>
            </h4>
            <a href="${formatHash(roleData.id, mod.folder, step.number)}" class="doc-step-jump-link no-print" title="View Step ${step.index} in Interactive Viewer">
              Step ${step.index} ›
            </a>
          </div>
          <div class="doc-step-body-flow">
            <div class="doc-step-instructions markdown-body">
              ${stepHtml}
            </div>
            <div class="doc-step-figure-wrap ${isAdminRole ? 'landscape-fig' : 'portrait-fig'}">
              ${step.hasScreenshot && step.screenshotUrl ? `
                <figure class="doc-screenshot-figure">
                  <div class="doc-screenshot-frame">
                    <img
                      class="doc-screenshot-img"
                      src="${step.screenshotUrl}"
                      alt="${escapeHtml(roleData.label)} — ${escapeHtml(mod.title)} — Step ${step.index}: ${escapeHtml(step.title)}"
                    />
                  </div>
                  <figcaption class="doc-screenshot-caption">
                    Figure ${stepCode}: ${escapeHtml(step.title)}
                  </figcaption>
                </figure>
              ` : `
                <div class="doc-screenshot-placeholder">
                  <div class="doc-placeholder-header">
                    ${getIconSvg('image')}
                    <span>Figure ${stepCode} — Screen Capture</span>
                  </div>
                  <p class="doc-placeholder-sub">Screenshot coming soon (<code>${escapeHtml(expectedScreenshotPath)}</code>).</p>
                </div>
              `}
            </div>
          </div>
        `;

        if (step.hasScreenshot && step.screenshotUrl) {
          const imgEl = stepBlock.querySelector('.doc-screenshot-img');
          if (imgEl) {
            imgEl.addEventListener('click', () => {
              openLightbox({
                src: step.screenshotUrl,
                alt: `Step ${step.index}: ${step.title}`,
                caption: `${roleData.label} › ${mod.title} › Step ${step.index}: ${step.title}`,
                triggerElement: imgEl
              });
            });
          }
        }

        stepsList.appendChild(stepBlock);
      });

      modSheet.appendChild(stepsList);

      const sheetFooter = document.createElement('footer');
      sheetFooter.className = 'doc-sheet-running-footer';
      sheetFooter.innerHTML = `
        <span>SerbiSure-User-Manual.doc</span>
        <span>© 2026 SerbiSure  |  Page ${modPage}</span>
      `;
      modSheet.appendChild(sheetFooter);

      partSection.appendChild(modSheet);
    });

    wrapper.appendChild(partSection);
  }

  // Wire smooth internal TOC scrolling links
  wrapper.querySelectorAll('[data-scroll-target]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-scroll-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        history.replaceState(null, '', link.getAttribute('href'));
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  container.appendChild(wrapper);

  // If a specific target section anchor was requested in URL, scroll to it
  if (scrollTargetId) {
    setTimeout(() => {
      const targetEl = document.getElementById(scrollTargetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  } else {
    setTimeout(() => {
      const mainHeading = document.getElementById('current-step-heading');
      if (mainHeading) mainHeading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  }
}

