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
      const cleanBody = body.replace(/^>\s?/gm, '');
      return `<div class="callout callout-${type}"><span class="callout-tag">${alertType}</span>\n<div class="callout-content">${cleanBody}</div></div>\n`;
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
export function renderModuleList(container, modules = [], activeRoleId, activeModuleFolder, onLinkClick) {
  if (!container) return;
  container.innerHTML = '';

  if (!modules || modules.length === 0) {
    container.innerHTML = `
      <div class="empty-modules-notice">
        <p>No guides available for this role yet.</p>
      </div>
    `;
    return;
  }

  const list = document.createElement('ul');
  list.className = 'module-nav-list';
  list.setAttribute('role', 'list');

  for (const mod of modules) {
    const isActive = mod.folder === activeModuleFolder;
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
    <nav class="module-breadcrumb" aria-label="Breadcrumb">
      <span class="breadcrumb-role">${escapeHtml(roleData.label)}</span>
      <span class="breadcrumb-separator" aria-hidden="true">›</span>
      <span class="breadcrumb-current">${escapeHtml(moduleData.title)}</span>
    </nav>
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
