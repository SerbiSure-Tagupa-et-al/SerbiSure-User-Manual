// scripts/generate-screenshot-checklist.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsRoot = path.join(rootDir, 'docs');

const roles = ['homeowner', 'kasambahay', 'admin'];

let markdown = `# SerbiSure User Manual — Screenshot Capture Checklist

This checklist contains every screen to capture for the **SerbiSure User Manual**.

## 📸 Capture Conventions & Guidelines
1. **Before-Action Rule**: Capture the screen/state being described **before** triggering the primary tap, click, or typing action. For example, for a step describing "Tap Register", capture the screen with the form filled and the Register button visible.
2. **Result-Only Screens**: For final success screens, confirmation dialogs, or generated passes, capture the resulting screen after completion.
3. **Orientation**:
   - **Mobile (Homeowner & Kasambahay)**: Capture in **Portrait** orientation on a mobile device or emulator (e.g. 1080x2400 or 1170x2532).
   - **Admin / Barangay**: Capture in **Landscape / Desktop** orientation (e.g. 1920x1080) on a desktop web browser.
4. **Privacy & Redaction**: Use realistic synthetic sample data (e.g., test names, sample addresses, test contact numbers). **Never capture real IDs, real personal addresses, real phone numbers, or genuine live QR pass URLs.**
5. **Image Format & Naming**:
   - Supported extensions: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.webp\`.
   - Filenames match the step number exactly (e.g. \`1.png\`, \`2.png\`, \`3.png\`).
   - Store images in the exact destination directory listed for each step.
   - When you place an image in its folder, the website automatically replaces the "Screenshot coming soon" placeholder on the next page refresh or build!

---

`;

let grandTotalSteps = 0;

for (const role of roles) {
  const roleDir = path.join(docsRoot, role);
  if (!fs.existsSync(roleDir)) continue;

  const roleTitle = role === 'homeowner' ? '🏠 Homeowner Guides' : role === 'kasambahay' ? '🧹 Kasambahay Guides' : '🏛️ Admin / Barangay Guides';
  markdown += `\n# ${roleTitle}\n\n`;

  const moduleFolders = fs.readdirSync(roleDir).filter(f => fs.statSync(path.join(roleDir, f)).isDirectory()).sort();

  for (const modFolder of moduleFolders) {
    const modDir = path.join(roleDir, modFolder);
    let modMeta = { title: modFolder };
    const metaPath = path.join(modDir, 'module.json');
    if (fs.existsSync(metaPath)) {
      try {
        modMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {}
    }

    markdown += `### Module: ${modMeta.title} (\`${role}/${modFolder}\`)\n\n`;
    markdown += `| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |\n`;
    markdown += `| :---: | :---: | :--- | :--- | :--- |\n`;

    const stepsDir = path.join(modDir, 'steps');
    if (!fs.existsSync(stepsDir)) continue;

    const stepFiles = fs.readdirSync(stepsDir)
      .filter(f => /^\d+\.(md|txt)$/.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.split('.')[0], 10);
        const numB = parseInt(b.split('.')[0], 10);
        return numA - numB;
      });

    for (const stepFile of stepFiles) {
      grandTotalSteps++;
      const num = parseInt(stepFile.split('.')[0], 10);
      const filePath = path.join(stepsDir, stepFile);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const firstLine = fileContent.split('\n').find(l => l.trim().length > 0) || '';
      const stepTitle = firstLine.replace(/^#+\s*/, '').trim();

      const targetPath = `docs/${role}/${modFolder}/screenshots/${num}.png`;
      let prepNote = `Screen showing "${stepTitle}" state`;
      if (role === 'admin') {
        prepNote = `Admin desktop browser view showing ${stepTitle.toLowerCase()}`;
      } else {
        prepNote = `Mobile app screen showing ${stepTitle.toLowerCase()}`;
      }

      markdown += `| - [ ] | **${num}** | ${stepTitle} | ${prepNote} | \`${targetPath}\` |\n`;
    }

    markdown += `\n`;
  }
}

markdown += `\n---\n**Total Steps in Manual**: ${grandTotalSteps} steps across all modules.\n`;

fs.writeFileSync(path.join(rootDir, 'SCREENSHOT_CHECKLIST.md'), markdown, 'utf-8');
console.log(`Generated SCREENSHOT_CHECKLIST.md with ${grandTotalSteps} steps.`);

