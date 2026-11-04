// scripts/print-module.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetModule = process.argv[2] || 'homeowner/02-login';
const stepsDir = path.resolve(__dirname, '../docs', targetModule, 'steps');

if (!fs.existsSync(stepsDir)) {
  console.log(`Directory not found: ${stepsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(stepsDir).sort((a, b) => parseInt(a) - parseInt(b));
files.forEach(f => {
  console.log(`\n================== ${f} ==================`);
  console.log(fs.readFileSync(path.join(stepsDir, f), 'utf8'));
});

