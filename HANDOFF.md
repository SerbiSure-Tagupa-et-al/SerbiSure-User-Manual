# SerbiSure User Manual — Final Verification & Delivery Handoff

## 1. Executive Summary & Delivery Status

The **SerbiSure User Manual** is delivered as an interactive, fully responsive, and maintainable static website. It serves all three SerbiSure roles (**Homeowner**, **Kasambahay**, and **Admin / Barangay**) across 25 operational modules and 103 numbered steps.

The project has passed all three verification passes:
1. **Pass 1 (Content Accuracy & Logic)**: Complete audit and correction of guide instructions directly against read-only mobile, backend, and admin source code.
2. **Pass 2 (Visual Coverage & Responsive UI)**: Real browser testing (Headless Chrome via Playwright) across 11 viewports with zero horizontal overflow, $\ge 44\text{px}$ touch targets, WCAG AA `:focus-visible` rings, tactile `:active` feedback, and lightbox 100% zoom.
3. **Pass 3 (Production Readiness & Regression Review)**: Production `dist/` compilation, root and subpath hosting verification, XSS script sanitization, isomorphic fallback sanitization, zero external network requests, and security hygiene audit.

---

## 2. What Is Finished and Working

1. **Complete Guide Text (103 Numbered Steps across 25 Modules)**:
   - **Homeowner (8 modules, 35 steps)**: Registration & profile creation, login, posting a job listing, reviewing worker applicants & chat, contract agreements, village pass QR generation & guard verification, safety & reporting, and managing posts.
   - **Kasambahay (10 modules, 40 steps)**: Registration, login, identity & liveness verification, police/NBI/barangay clearances, profile setup & skills, browsing jobs & applications, posting a service listing, chat & offer negotiation (including passed schedule rules), booking schedules & village pass QR, and reviews & ratings.
   - **Admin / Barangay (7 modules, 28 steps)**: Overview & staff login, dashboard metrics, verification queue & AI/OCR review (with audit logging and human review authority), staff accounts & RBAC permissions, audit trail inspection, incident dispute arbitration, and emergency broadcast dispatch.

2. **Data-Driven Automatic Discovery**:
   - Dropping any `<number>.md` or `<number>.txt` into `docs/<role>/<module>/steps/` automatically registers and renders the step in strict natural numeric sequence (`1, 2, 5, 10`).
   - Dropping `<number>.png` into `docs/<role>/<module>/screenshots/` pairs the screenshot automatically.
   - Gaps (e.g. steps 1 and 7) and missing screenshots remain non-blocking without generating phantom cards.

3. **Responsive UI Across 11 Viewports**:
   - Balanced 2-row mobile role grid on small phones ($< 640\text{px}$): Homeowner & Kasambahay on row 1, Admin / Barangay on row 2 (zero clipping).
   - Active native topic selector (`#mobile-module-select`) on mobile screens ($< 860\text{px}$) with full touch targets ($\ge 44\text{px}$).
   - Persistent sidebar module list on desktop screens ($\ge 860\text{px}$).
   - Single-window smooth scrolling with sticky header and zero competing nested scrollbars.

4. **Security, Sanitization & Static Hosting**:
   - All markdown content is sanitized with `DOMPurify` plus an isomorphic fallback regex sanitizer; external links automatically receive `rel="noopener noreferrer"` and `target="_blank"`.
   - Dynamic titles, headings, and metadata are escaped via `escapeHtml()`.
   - Plain-text `.txt` files render safely as text via `textContent` without executing HTML.
   - Zero external requests: 100% self-contained static site requiring no backend or API runtime in production.
   - Works under both root hosting (`/`) and repository subpaths (`/SerbiSure-User-Manual/`).

---

## 3. How to Start and Preview (Windows CMD Commands)

All commands are run from `C:\VS_CODE_FILE\SerbisureLastest\SerbiSure-User-Manual`:

```cmd
cd /d C:\VS_CODE_FILE\SerbisureLastest\SerbiSure-User-Manual

:: 1. Validate All Manual Files & Checklist Synchronization
npm run validate:docs

:: 2. Run Complete Unit Test Suite (19 tests)
npm test

:: 3. Start Development Server (Hot Module Replacement)
npm run dev
:: URL: http://localhost:5173

:: 4. Build Optimized Production Static Bundle
npm run build
:: Emits production-ready HTML, CSS, JS, and assets to dist/

:: 5. Preview Production Build
npm run preview
:: URL: http://localhost:4173

:: 6. Run Responsive E2E Multi-Viewport Test
npm run test:e2e

:: 7. Run Full Pass 2 Real-Browser Verification Audit
npm run test:audit

:: 8. Run Pass 3 Production Readiness & Subpath Hosting Review
npm run test:prod
```

---

## 4. Screenshot Capture Checklist & Image Instructions

- **Checklist Location**: `C:\VS_CODE_FILE\SerbisureLastest\SerbiSure-User-Manual\SCREENSHOT_CHECKLIST.md`
- **Total Steps in Checklist**: Exactly 103 entries (100% matched with all 25 modules).
- **Current Display Behavior**: All steps currently render an understated, quiet placeholder:
  *"Screenshot coming soon — Illustrated screen capture will appear here. Please follow the written instructions below."*
  This ensures readers can use the manual immediately without seeing author paths, broken images, or code tags.

### How to Add Real Screenshots (Whenever Ready)
You do **not** need to touch HTML, CSS, or JavaScript files:
1. Open `SCREENSHOT_CHECKLIST.md` and find the step you wish to capture.
2. Note the screen preparation details (forms filled, buttons highlighted, etc.).
3. Save the captured screenshot image directly into the specified destination:
   `docs/<role>/<module-folder>/screenshots/<number>.png`
   *(Supported formats: `.png`, `.jpg`, `.jpeg`, `.webp`)*
4. Run `npm run build` (or keep `npm run dev` running).
5. The website automatically pairs the image with its step, displays the full screenshot figure, and enables the magnification lightbox with 100% zoom toggle.

---

## 5. Verification Test Artifacts

- **Detailed QA Report**: [QA_REPORT.md](file:///C:/VS_CODE_FILE/SerbisureLastest/SerbiSure-User-Manual/QA_REPORT.md)
- **Playwright Test Screenshots**:
  - `tests/screenshots/pass2/`: 22 screenshots covering all 11 viewports, mobile drawer open, lightbox normal/zoomed, and full role walkthroughs.
  - `tests/screenshots/pass3/`: Production static root and subpath deployment captures.
  - Mirrored to brain directory: `C:\Users\admin\.gemini\antigravity\brain\228da562-232a-44ed-8cd6-7afc50fe0957\screenshots\`

---

## 6. Remaining Actions Required from User

1. **Capture Real App Screenshots**:
   - Capture the 103 screens from the live SerbiSure mobile app and admin dashboard using `SCREENSHOT_CHECKLIST.md` as your guide, and place them into the respective `screenshots/` folders.
2. **Optional Physical Handset Review**:
   - Test on physical Android/iOS handsets with vendor-specific system fonts for final user acceptance.

---

## 7. Evidence-Based Verdict

**STATUS: READY FOR USER REVIEW**

All 25 modules and 103 steps across Homeowner, Kasambahay, and Admin / Barangay are fully written, validated, and navigable. The static site compiles cleanly in $< 400\text{ms}$, runs without any backend or external CDN dependencies, and is ready for production hosting.

