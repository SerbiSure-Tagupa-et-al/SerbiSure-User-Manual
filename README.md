# SerbiSure User Manual & Guide

Written for SerbiSure app v2.1.5

The official interactive, static user manual and operational guide for **SerbiSure**, serving three primary user roles:
1. **🏠 Homeowner** — People seeking trusted household help.
2. **🧹 Kasambahay** — Domestic household workers offering services or applying for jobs.
3. **🏛️ Admin / Barangay** — Reviewers and staff managing local jurisdiction, verifications, and safety passes.

---

## 🚀 Quick Start (Windows CMD)

Open **Command Prompt (`cmd.exe`)** and navigate to the project directory:

```cmd
cd C:\VS_CODE_FILE\SerbisureLastest\SerbiSure-User-Manual
```

### 1. Install Dependencies
```cmd
npm install
```

### 2. Run Local Development Server
```cmd
npm run dev
```
Open your browser to the displayed local server URL (typically `http://localhost:5173/`).

### 3. Run Validation & Tests
```cmd
npm run validate:docs
npm test
```

### 4. Build Production Static Bundle
```cmd
npm run build
```
Generates a self-contained static site in `dist/` ready to host anywhere.

### 5. Preview the Production Build
```cmd
npm run preview
```

---

## 📂 Project Architecture

```text
SerbiSure-User-Manual/
├── docs/                      # Data-driven manual guides
│   ├── homeowner/             # 8 modules (35 steps)
│   ├── kasambahay/            # 10 modules (40 steps)
│   └── admin/                 # 7 modules (28 steps)
├── public/
│   └── branding/              # Official SerbiSure logo assets
├── src/
│   ├── content-loader.js      # Vite import.meta.glob loader
│   ├── content-model.js       # Pure numeric pairing & validation logic
│   ├── icons.js               # Lightweight inline SVG icon collection
│   ├── lightbox.js            # Accessible zoom modal dialog
│   ├── main.js                # App bootstrap & routing orchestration
│   ├── navigation.js          # Hash routing & fallback resolver
│   ├── render.js              # DOM rendering & sanitized Markdown
│   └── styles.css             # Responsive CSS & SerbiSure brand styling
├── scripts/
│   └── validate-docs.mjs      # Content & screenshot checklist validator
├── tests/
│   ├── content-model.test.mjs # Sorting, pairing & duplicate tests
│   ├── navigation.test.mjs    # Hash routing & fallback tests
│   └── fixtures-discovery.test.mjs # Automatic file addition tests
├── index.html                 # Semantic HTML shell
├── package.json
├── vite.config.js             # Assets inline limit: 0, relative base
├── SCREENSHOT_CHECKLIST.md    # Master capture checklist (107 entries)
├── CONTENT_REVIEW.md          # Source grounding & verification mapping
└── CONTENT_AUTHORING.md       # Guide for adding screenshots & modules
```

---

## 📸 Adding Screenshots

All 107 guide steps have been reviewed against the locally available app `origin/main` source. See [CONTENT_AUDIT.md](CONTENT_AUDIT.md) for the source snapshots and verification limits. Each step currently displays a polished **"Screenshot coming soon"** placeholder.

To add screenshots:
1. Consult [`SCREENSHOT_CHECKLIST.md`](SCREENSHOT_CHECKLIST.md) for the exact screen and preparation instructions.
2. Capture the screen and name the image `[step-number].png` (e.g. `1.png`, `2.png`).
3. Place the image in that module's `screenshots/` directory (e.g. `docs/homeowner/01-registration-and-profile/screenshots/1.png`).
4. Refresh your browser or rebuild. The placeholder is replaced automatically without touching any code!

See [`CONTENT_AUTHORING.md`](CONTENT_AUTHORING.md) for full authoring details.

---

## 🌐 Static Deployment

The site compiles into a 100% static `dist/` folder requiring zero backend or server configuration.

- **GitHub Pages**:
  - Deploy the contents of `dist/` to the `gh-pages` branch.
  - Because `base: './'` is configured in `vite.config.js`, assets and deep links work flawlessly under any subpath (e.g., `https://<org>.github.io/SerbiSure-User-Manual/`).
- **Vercel / Netlify**:
  - Root directory: `.`
  - Build command: `npm run build`
  - Output directory: `dist`
