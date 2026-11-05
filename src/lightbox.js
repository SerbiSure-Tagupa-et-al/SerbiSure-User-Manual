// src/lightbox.js
import { getIconSvg } from './icons.js';

let dialogEl = null;
let imgEl = null;
let captionEl = null;
let zoomBtn = null;
let lastFocusedElement = null;
let isZoomed = false;

function setZoomState(zoomed) {
  isZoomed = zoomed;
  if (!imgEl) return;
  imgEl.classList.toggle('is-zoomed', isZoomed);
  if (zoomBtn) {
    const zoomText = zoomBtn.querySelector('.btn-text');
    if (zoomText) {
      zoomText.textContent = isZoomed ? 'Fit to View' : 'Zoom 100%';
    }
    zoomBtn.setAttribute('aria-pressed', isZoomed ? 'true' : 'false');
  }
}

export function initLightbox() {
  if (dialogEl) return;

  const existing = document.getElementById('screenshot-lightbox');
  if (existing) {
    dialogEl = existing;
    imgEl = dialogEl.querySelector('#lightbox-img');
    captionEl = dialogEl.querySelector('#lightbox-caption-text');
    zoomBtn = dialogEl.querySelector('#lightbox-zoom-btn');
    return;
  }

  dialogEl = document.createElement('dialog');
  dialogEl.id = 'screenshot-lightbox';
  dialogEl.className = 'lightbox-dialog';
  dialogEl.setAttribute('aria-modal', 'true');
  dialogEl.setAttribute('aria-label', 'Screenshot magnification dialog');

  dialogEl.innerHTML = `
    <div class="lightbox-container">
      <div class="lightbox-toolbar">
        <span class="lightbox-caption" id="lightbox-caption-text"></span>
        <div class="lightbox-toolbar-actions">
          <button type="button" class="lightbox-zoom-btn" id="lightbox-zoom-btn" aria-label="Toggle full size zoom" aria-pressed="false">
            ${getIconSvg('zoom-in')}
            <span class="btn-text">Zoom 100%</span>
          </button>
          <button type="button" class="lightbox-close-btn" id="lightbox-close-btn" aria-label="Close screenshot preview">
            ${getIconSvg('x')}
            <span class="btn-text">Close</span>
          </button>
        </div>
      </div>
      <div class="lightbox-image-viewport">
        <img class="lightbox-img" id="lightbox-img" src="" alt="Enlarged screenshot" />
      </div>
    </div>
  `;

  document.body.appendChild(dialogEl);

  imgEl = dialogEl.querySelector('#lightbox-img');
  captionEl = dialogEl.querySelector('#lightbox-caption-text');
  zoomBtn = dialogEl.querySelector('#lightbox-zoom-btn');
  const closeBtn = dialogEl.querySelector('#lightbox-close-btn');

  closeBtn.addEventListener('click', closeLightbox);
  zoomBtn.addEventListener('click', () => setZoomState(!isZoomed));
  imgEl.addEventListener('click', () => setZoomState(!isZoomed));

  // Close when clicking on dialog backdrop
  dialogEl.addEventListener('click', (e) => {
    // If clicked on backdrop outside container
    if (e.target === dialogEl) {
      closeLightbox();
    }
  });

  // Handle escape key
  dialogEl.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeLightbox();
  });
}

export function openLightbox({ src, alt, caption, triggerElement }) {
  initLightbox();

  lastFocusedElement = triggerElement || document.activeElement;
  setZoomState(false);

  imgEl.src = src;
  imgEl.alt = alt || 'Screenshot preview';
  captionEl.textContent = caption || '';

  document.body.classList.add('lightbox-open');

  if (typeof dialogEl.showModal === 'function') {
    dialogEl.showModal();
  } else {
    dialogEl.setAttribute('open', '');
  }

  // Focus close button
  const closeBtn = dialogEl.querySelector('#lightbox-close-btn');
  if (closeBtn) closeBtn.focus();
}

export function closeLightbox() {
  if (!dialogEl) return;

  setZoomState(false);

  if (typeof dialogEl.close === 'function') {
    dialogEl.close();
  } else {
    dialogEl.removeAttribute('open');
  }

  document.body.classList.remove('lightbox-open');

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

if (typeof window !== 'undefined') {
  window.__serbisureLightbox = { openLightbox, closeLightbox };
}



