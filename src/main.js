// src/main.js
import { loadManualContent } from './content-loader.js';
import { parseHash, formatHash, resolveNavigation } from './navigation.js';
import { renderRoleTabs, renderModuleList, renderMobileModuleSelect, renderMainContent } from './render.js';
import { initLightbox } from './lightbox.js';

let manualData = null;

function bootstrap() {
  initLightbox();

  try {
    manualData = loadManualContent();
  } catch (err) {
    console.error('Failed to load manual content:', err);
    const contentArea = document.getElementById('content-display-area');
    if (contentArea) {
      contentArea.innerHTML = `
        <div class="manual-welcome-card" style="border-left: 4px solid #B91C1C;">
          <h2>Unable to Load Guides</h2>
          <p>An unexpected error occurred while loading manual files: ${err.message}</p>
          <div style="margin-top: 16px;">
            <button type="button" class="retry-btn" onclick="window.location.reload()" style="padding: 10px 18px; font-weight: 700; border-radius: 8px; border: none; background: #FFA135; cursor: pointer;">
              Retry Loading
            </button>
          </div>
        </div>
      `;
    }
    return;
  }

  const roleTabsContainer = document.getElementById('role-tabs-container');
  const moduleNavContainer = document.getElementById('module-nav-container');
  const mobileModuleSelect = document.getElementById('mobile-module-select');
  const contentDisplayArea = document.getElementById('content-display-area');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const appSidebar = document.getElementById('app-sidebar');

  function isDrawerOpen() {
    return appSidebar && appSidebar.classList.contains('drawer-open');
  }

  function openDrawer() {
    if (!appSidebar) return;
    appSidebar.classList.add('drawer-open');
    if (drawerBackdrop) drawerBackdrop.classList.add('drawer-open');
    document.body.classList.add('drawer-open');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');
    if (sidebarCloseBtn) sidebarCloseBtn.focus();
  }

  function closeDrawer(restoreFocus = true) {
    if (!appSidebar) return;
    appSidebar.classList.remove('drawer-open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('drawer-open');
    document.body.classList.remove('drawer-open');
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus && document.activeElement && appSidebar.contains(document.activeElement)) {
        mobileMenuToggle.focus();
      }
    }
  }

  // Drawer event listeners
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => closeDrawer(true));
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => closeDrawer(false));
  }

  // Global keydown handler for Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen()) {
      e.preventDefault();
      closeDrawer(true);
    }
  });

  // Wire Mobile Module Quick-Select dropdown
  if (mobileModuleSelect) {
    mobileModuleSelect.addEventListener('change', (e) => {
      const selectedModule = e.target.value;
      if (selectedModule && manualData) {
        const { role: currentRole } = parseHash(window.location.hash);
        const resolved = resolveNavigation(manualData.roles, currentRole, selectedModule, 1);
        location.hash = formatHash(resolved.role, selectedModule, 1);
      }
    });
  }

  function renderCurrentView() {
    const { roles } = manualData;
    const { role: reqRole, module: reqModule, step: reqStep } = parseHash(window.location.hash);

    const resolved = resolveNavigation(roles, reqRole, reqModule, reqStep);

    // If URL requested an invalid/missing path, normalize the URL hash cleanly without aborting render
    const canonicalHash = formatHash(resolved.role, resolved.module, resolved.stepNumber);
    if (resolved.isFallback && window.location.hash !== canonicalHash) {
      window.history.replaceState(null, '', canonicalHash);
    }

    // 1. Render Top Role Tabs
    renderRoleTabs(roleTabsContainer, roles, resolved.role);

    // 2. Render Sidebar Module List (pass callback to close drawer when link clicked)
    renderModuleList(
      moduleNavContainer,
      resolved.roleData ? resolved.roleData.modules : [],
      resolved.role,
      resolved.module,
      () => closeDrawer(false)
    );

    // 3. Render Mobile Module Select Dropdown
    renderMobileModuleSelect(
      mobileModuleSelect,
      resolved.roleData ? resolved.roleData.modules : [],
      resolved.role,
      resolved.module
    );

    // 4. Render Main Reading Card
    renderMainContent({
      container: contentDisplayArea,
      roleData: resolved.roleData,
      moduleData: resolved.moduleData,
      step: resolved.step
    });

    // Close mobile drawer on navigation if open
    closeDrawer(false);
  }

  window.addEventListener('hashchange', renderCurrentView);

  // Initial render
  renderCurrentView();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
