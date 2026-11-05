// scripts/deep-content-audit.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../docs');

const roles = ['homeowner', 'kasambahay', 'admin'];

const findings = [];

roles.forEach(role => {
  const rolePath = path.join(docsRoot, role);
  if (!fs.existsSync(rolePath)) return;

  const modules = fs.readdirSync(rolePath).filter(m => fs.statSync(path.join(rolePath, m)).isDirectory());

  modules.forEach(mod => {
    const stepsDir = path.join(rolePath, mod, 'steps');
    if (!fs.existsSync(stepsDir)) return;

    const stepFiles = fs.readdirSync(stepsDir).filter(f => f.endsWith('.md'));

    stepFiles.forEach(file => {
      const stepPath = path.join(stepsDir, file);
      const content = fs.readFileSync(stepPath, 'utf8');
      const lines = content.split('\n');
      const title = lines[0].replace(/^#\s*/, '').trim();

      // Check specific known discrepancies
      // 1. Role selection button: Should be "I am a Homeowner" / "I am a Kasambahay", not "Homeowner (Employer)" with a "Continue" button
      if (content.includes('Tap **Continue** to proceed to the registration form') || content.includes('choose **Homeowner (Employer)**')) {
        findings.push({
          role,
          module: mod,
          file,
          title,
          issue: 'Mentions "choose Homeowner (Employer)" and "Tap Continue", but mobile RoleSelectionScreen has cards labeled "I am a Homeowner" / "I am a Kasambahay" that advance immediately upon tap.'
        });
      }

      // 2. Check for retired resume / PDF mentions
      if (content.toLowerCase().includes('.pdf') || content.toLowerCase().includes('upload resume') || content.toLowerCase().includes('upload your cv')) {
        findings.push({
          role,
          module: mod,
          file,
          title,
          issue: 'Mentions PDF or uploading CV/resume, but SerbiSure uses a system-generated digital Worker CV form.'
        });
      }

      // 3. Check for OTP / SMS verification mentions
      if (content.toLowerCase().includes('otp') || content.toLowerCase().includes('one-time password') || content.toLowerCase().includes('verification code sent via sms')) {
        findings.push({
          role,
          module: mod,
          file,
          title,
          issue: 'Mentions OTP / SMS code, which is not part of the active mobile auth flow.'
        });
      }

      // 4. Check for Post a Job vs Post a Service confusion
      if (role === 'homeowner' && (content.toLowerCase().includes('post a service') || content.toLowerCase().includes('post service'))) {
        findings.push({
          role,
          module: mod,
          file,
          title,
          issue: 'Homeowner guide references "Post a Service" instead of "Post a Job".'
        });
      }
      if (role === 'kasambahay' && mod.includes('post') && content.toLowerCase().includes('post a job')) {
        findings.push({
          role,
          module: mod,
          file,
          title,
          issue: 'Kasambahay guide references "Post a Job" instead of "Post a Service".'
        });
      }

      // 5. Check for Gate Pass validity (must be 24-hour HMAC)
      if (mod.includes('village-pass') || mod.includes('gate-pass')) {
        if (!content.includes('24') && (content.toLowerCase().includes('indefinite') || content.toLowerCase().includes('permanent'))) {
          findings.push({
            role,
            module: mod,
            file,
            title,
            issue: 'Digital Village Pass should explicitly specify 24-hour validity.'
          });
        }
      }
    });
  });
});

console.log(`Audited all steps. Found ${findings.length} potential issues:`);
console.table(findings);

