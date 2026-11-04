# SerbiSure User Manual — Content Authoring & Screenshot Guide

This guide explains how to add screenshots to existing steps and how to create new modules or steps in the **SerbiSure User Manual**.

---

## 📸 1. How to Add Screenshots to Existing Steps

All 103 guide steps across Homeowner, Kasambahay, and Admin / Barangay roles have complete, verified text instructions. Each step currently displays an accessible, polished **"Screenshot coming soon"** placeholder.

### Step-by-Step Screenshot Workflow:
1. Open [`SCREENSHOT_CHECKLIST.md`](SCREENSHOT_CHECKLIST.md) at the root of the project.
2. Follow the row for the step you are capturing:
   - Review the required starting screen or preparation note.
   - Capture the screen **before** triggering the primary action (or the result screen for final confirmations).
3. **Save and Name the Screenshot**:
   - The image filename must match the step number: `1.png`, `2.png`, `3.png`, etc.
   - Supported extensions: `.png` (recommended), `.jpg`, `.jpeg`, `.webp`.
4. **Place the Image in the Target Directory**:
   - Move the file to that module's `screenshots/` directory (e.g., `docs/homeowner/01-registration-and-profile/screenshots/1.png`).
5. **Preview**:
   - In development (`npm run dev`), simply refresh your browser. The "Screenshot coming soon" placeholder will automatically be replaced with your high-resolution screenshot and interactive "Tap to enlarge" lightbox viewer!
   - You do **NOT** need to edit any HTML, JavaScript, or Markdown files.

---

## 🔒 2. Privacy & Redaction Guidelines
- **Mobile Screenshots (Homeowner & Kasambahay)**:
  - Capture in portrait orientation on your device or emulator (e.g., 1080x2400).
  - Use synthetic sample data (e.g., "Juan Dela Cruz", "0917-000-0000", "Barangay Carmen").
  - **Never include real government ID numbers, genuine home addresses, private selfies, or live QR gate pass codes.**
- **Admin Screenshots**:
  - Capture in landscape orientation on desktop (e.g., 1920x1080).
  - Blur or crop any sensitive database credentials or actual citizen records.

---

## ➕ 3. How to Add a New Step to an Existing Module
To add a new step (e.g., Step 6) to an existing module:
1. Open the module's `steps/` directory (e.g., `docs/homeowner/01-registration-and-profile/steps/`).
2. Create a new markdown file named `6.md`:
   ```markdown
   # Title of Your New Step

   Clear, encouraging explanation of the action.

   1. Tap **Button Name**.
   2. Select your desired option.
   3. Tap **Next**.

   > [!TIP]
   > Helpful advice for the user.
   ```
3. (Optional) Place the matching screenshot in `screenshots/6.png`.
4. Save the file. The website automatically inserts Step 6 in natural numeric sequence (`1, 2, 3, 4, 5, 6`)!

---

## 📁 4. How to Create a Brand New Module
To create an entirely new module for any role:
1. Under `docs/<role>/`, create a new folder with a numeric prefix (e.g., `docs/kasambahay/11-faq-and-help/`).
2. (Optional) Create `module.json` to define a custom title, overview, and icon:
   ```json
   {
     "title": "FAQ & Help Center",
     "overview": "Frequently asked questions and support channels for household workers.",
     "icon": "book-open"
   }
   ```
3. Create `steps/` and `screenshots/` subfolders:
   - Add `steps/1.md`, `steps/2.md`, etc.
   - Add `.gitkeep` inside `screenshots/`.
4. Run validation:
   ```cmd
   npm run validate:docs
   ```
5. The new module will automatically appear in the navigation drawer and sidebar!

---

## 🛠️ 5. Supported Metadata Icons
When configuring `module.json`, you can use any of the built-in SVG icons:
- `home`, `user-check`, `shield`, `user-plus`, `log-in`, `briefcase`, `search`, `message-square`, `message-circle`, `calendar`, `star`, `file-text`, `shield-check`, `refresh-cw`, `plus-circle`, `award`, `bar-chart-2`, `check-square`, `calendar-x`, `users`, `alert-triangle`, `settings`, `book-open`.

