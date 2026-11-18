// scripts/generate-docx.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { buildManualContent } from '../src/content-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsRoot = path.join(rootDir, 'docs');

function scanDirectory(dir, filterRegex) {
  const results = {};
  if (!fs.existsSync(dir)) return results;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        if (filterRegex.test(entry.name)) {
          results[relPath] = fullPath;
        }
      }
    }
  }

  walk(dir);
  return results;
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Read PNG / JPEG pixel dimensions from binary buffer to preserve natural aspect ratio in Word
function getImageDimensions(buf) {
  if (!buf || buf.length < 24) return { width: 600, height: 800 };

  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width > 0 && height > 0) return { width, height };
  }

  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xFF) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      if (
        (marker >= 0xC0 && marker <= 0xC3) ||
        (marker >= 0xC5 && marker <= 0xC7) ||
        (marker >= 0xC9 && marker <= 0xCB) ||
        (marker >= 0xCD && marker <= 0xCF)
      ) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        if (width > 0 && height > 0) return { width, height };
        break;
      }
      if (marker === 0xD8 || marker === 0xD9 || (marker >= 0xD0 && marker <= 0xD7)) {
        offset += 2;
      } else {
        const segLen = buf.readUInt16BE(offset + 2);
        if (segLen < 2) break;
        offset += 2 + segLen;
      }
    }
  }

  return { width: 600, height: 800 };
}

// Professional manual figure sizing:
// Portrait mobile screens: 2.25 in wide (max 3.85 in tall) so step text + figure fit comfortably on page
// Landscape desktop screens: 5.0 in wide (max 3.15 in tall)
function computeWordImageEmu(widthPx, heightPx) {
  const aspect = widthPx / heightPx;
  const maxWidthInches = aspect >= 1.15 ? 5.0 : 2.25;
  const maxHeightInches = aspect >= 1.15 ? 3.15 : 3.85;

  let wInches = maxWidthInches;
  let hInches = wInches / aspect;

  if (hInches > maxHeightInches) {
    hInches = maxHeightInches;
    wInches = hInches * aspect;
  }

  return {
    cx: Math.round(wInches * 914400),
    cy: Math.round(hInches * 914400)
  };
}

function createDrawingParagraphXml({ rId, docPrId, name, cx, cy, caption }) {
  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:keepNext/>
        <w:spacing w:before="100" w:after="40" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0"
                     xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="${cx}" cy="${cy}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="${docPrId}" name="${escapeXml(name)}" descr="${escapeXml(caption)}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${docPrId}" name="${escapeXml(name)}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${rId}"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${cx}" cy="${cy}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    <a:ln w="9525">
                      <a:solidFill><a:srgbClr val="D1D5DB"/></a:solidFill>
                    </a:ln>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="20" w:after="140" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:i/><w:color w:val="4B5563"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
        <w:t>${escapeXml(caption)}</w:t>
      </w:r>
    </w:p>
  `;
}

// Parse inline markdown (**bold**, *italic*, `code`) into WordprocessingML <w:r> elements
// Default body size: 10.5pt (21 half-points)
function renderInlineRuns(text = '', defaultColor = '1A1A1A', defaultSizeHalfPt = 21) {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;
  const parts = String(text).split(tokenRegex);
  let xml = '';

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      xml += `<w:r><w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="${defaultSizeHalfPt}"/><w:szCs w:val="${defaultSizeHalfPt}"/></w:rPr><w:t xml:space="preserve">${escapeXml(inner)}</w:t></w:r>`;
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      xml += `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:b/><w:color w:val="1F2937"/><w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/><w:sz w:val="${defaultSizeHalfPt - 2}"/><w:szCs w:val="${defaultSizeHalfPt - 2}"/></w:rPr><w:t xml:space="preserve">${escapeXml(inner)}</w:t></w:r>`;
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const inner = part.slice(1, -1);
      xml += `<w:r><w:rPr><w:i/><w:color w:val="${defaultColor}"/><w:sz w:val="${defaultSizeHalfPt}"/><w:szCs w:val="${defaultSizeHalfPt}"/></w:rPr><w:t xml:space="preserve">${escapeXml(inner)}</w:t></w:r>`;
    } else {
      xml += `<w:r><w:rPr><w:color w:val="${defaultColor}"/><w:sz w:val="${defaultSizeHalfPt}"/><w:szCs w:val="${defaultSizeHalfPt}"/></w:rPr><w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`;
    }
  }
  return xml;
}

// Convert step markdown body into WordprocessingML paragraphs with professional manual spacing
function renderStepMarkdownToWordXml(rawMarkdown = '') {
  if (!rawMarkdown) return '';
  const lines = rawMarkdown.replace(/\r\n/g, '\n').split('\n');

  if (lines.length > 0 && lines[0].trim().startsWith('#')) {
    lines.shift();
  }

  let xml = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    const alertMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
    if (alertMatch) {
      const alertType = alertMatch[1].toUpperCase();
      i++;
      const alertLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        alertLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const alertBody = alertLines.join(' ').trim();
      const borderColors = {
        NOTE: '365F91',
        TIP: '2E7D32',
        IMPORTANT: '5E35B1',
        WARNING: 'D97706',
        CAUTION: 'C62828'
      };
      const fillColors = {
        NOTE: 'F4F7FA',
        TIP: 'F1F8F5',
        IMPORTANT: 'F6F4FB',
        WARNING: 'FFFBEB',
        CAUTION: 'FEF2F2'
      };
      const borderColor = borderColors[alertType] || '365F91';
      const fillColor = fillColors[alertType] || 'F4F7FA';

      xml += `
        <w:p>
          <w:pPr>
            <w:spacing w:before="80" w:after="100" w:line="252" w:lineRule="auto"/>
            <w:ind w:left="288" w:right="288"/>
            <w:pBdr>
              <w:left w:val="single" w:sz="18" w:space="10" w:color="${borderColor}"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="${fillColor}"/>
          </w:pPr>
          <w:r>
            <w:rPr><w:b/><w:color w:val="${borderColor}"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr>
            <w:t xml:space="preserve">${escapeXml(alertType)}: </w:t>
          </w:r>
          ${renderInlineRuns(alertBody, '222222', 19)}
        </w:p>
      `;
      continue;
    }

    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const quoteBody = quoteLines.join(' ').trim();
      xml += `
        <w:p>
          <w:pPr>
            <w:spacing w:before="60" w:after="80" w:line="252" w:lineRule="auto"/>
            <w:ind w:left="360"/>
            <w:pBdr><w:left w:val="single" w:sz="12" w:space="10" w:color="CBD5E1"/></w:pBdr>
          </w:pPr>
          ${renderInlineRuns(quoteBody, '333333', 20)}
        </w:p>
      `;
      continue;
    }

    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[2].trim();
      xml += `
        <w:p>
          <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="140" w:after="60" w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r>
            <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
            <w:t>${escapeXml(headingText)}</w:t>
          </w:r>
        </w:p>
      `;
      i++;
      continue;
    }

    // Ordered list item (0.25in hanging indent, 10.5pt text)
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      const numStr = olMatch[1];
      const itemText = olMatch[2].trim();
      xml += `
        <w:p>
          <w:pPr>
            <w:spacing w:before="40" w:after="50" w:line="260" w:lineRule="auto"/>
            <w:ind w:left="360" w:hanging="260"/>
          </w:pPr>
          <w:r>
            <w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
            <w:t xml:space="preserve">${escapeXml(numStr)}. </w:t>
          </w:r>
          ${renderInlineRuns(itemText, '1A1A1A', 21)}
        </w:p>
      `;
      i++;
      continue;
    }

    // Unordered bullet list item
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      const itemText = ulMatch[1].trim();
      xml += `
        <w:p>
          <w:pPr>
            <w:spacing w:before="40" w:after="50" w:line="260" w:lineRule="auto"/>
            <w:ind w:left="360" w:hanging="220"/>
          </w:pPr>
          <w:r>
            <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
            <w:t xml:space="preserve">• </w:t>
          </w:r>
          ${renderInlineRuns(itemText, '1A1A1A', 21)}
        </w:p>
      `;
      i++;
      continue;
    }

    // Standard body paragraph (10.5pt = 21 half-pt, 1.15 line height = 276)
    xml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="40" w:after="90" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        ${renderInlineRuns(line, '1A1A1A', 21)}
      </w:p>
    `;
    i++;
  }

  return xml;
}

// Create a dotted-leader Table of Contents row matching professional Word User Manuals:
// Level 1: Bold, 10.5pt (21), 0in indent, 10pt before, 3pt after
// Level 2: Regular, 10pt (20), 0.25in (360 twips) indent, 1.5pt before, 1.5pt after
// Level 3: Regular, 9.5pt (19), 0.50in (720 twips) indent, 1pt before, 1pt after
function createTocEntryXml({ label, pageNum, level = 1, bookmarkTarget = '' }) {
  const leftIndent = level === 1 ? 0 : level === 2 ? 360 : 720;
  const isBold = level === 1;
  const fontSize = level === 1 ? 21 : level === 2 ? 20 : 19;
  const textColor = '111111';
  const spacingBefore = level === 1 ? 180 : level === 2 ? 30 : 16;
  const spacingAfter = level === 1 ? 50 : level === 2 ? 24 : 16;

  const runProps = `
    <w:rPr>
      ${isBold ? '<w:b/>' : ''}
      <w:color w:val="${textColor}"/>
      <w:sz w:val="${fontSize}"/>
      <w:szCs w:val="${fontSize}"/>
    </w:rPr>
  `;

  const innerContent = `
    <w:r>${runProps}<w:t>${escapeXml(label)}</w:t></w:r>
    <w:r>${runProps}<w:tab/></w:r>
    <w:r>${runProps}<w:t>${escapeXml(String(pageNum))}</w:t></w:r>
  `;

  return `
    <w:p>
      <w:pPr>
        <w:tabs>
          <w:tab w:val="right" w:leader="dot" w:pos="9360"/>
        </w:tabs>
        <w:spacing w:before="${spacingBefore}" w:after="${spacingAfter}" w:line="240" w:lineRule="auto"/>
        ${leftIndent > 0 ? `<w:ind w:left="${leftIndent}"/>` : ''}
      </w:pPr>
      ${bookmarkTarget
        ? `<w:hyperlink w:anchor="${escapeXml(bookmarkTarget)}" w:history="1">${innerContent}</w:hyperlink>`
        : innerContent}
    </w:p>
  `;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZipArchive(files) {
  const localFileHeaders = [];
  const centralDirHeaders = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf-8');
    const uncompressedData = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf-8');
    const crc = crc32(uncompressedData);
    const compressedData = zlib.deflateRawSync(uncompressedData, { level: 6 });

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034B50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0x5771, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(uncompressedData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localFileHeaders.push(localHeader, nameBuf, compressedData);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014B50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0x5771, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedData.length, 20);
    centralHeader.writeUInt32LE(uncompressedData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralDirHeaders.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressedData.length;
  }

  const centralDirBuffer = Buffer.concat(centralDirHeaders);
  const endOfCentralDir = Buffer.alloc(22);
  endOfCentralDir.writeUInt32LE(0x06054B50, 0);
  endOfCentralDir.writeUInt16LE(0, 4);
  endOfCentralDir.writeUInt16LE(0, 6);
  endOfCentralDir.writeUInt16LE(files.length, 8);
  endOfCentralDir.writeUInt16LE(files.length, 10);
  endOfCentralDir.writeUInt32LE(centralDirBuffer.length, 12);
  endOfCentralDir.writeUInt32LE(offset, 16);
  endOfCentralDir.writeUInt16LE(0, 20);

  return Buffer.concat([...localFileHeaders, centralDirBuffer, endOfCentralDir]);
}

export function generateManualDocx() {
  const rawStepFiles = scanDirectory(docsRoot, /\.(md|txt)$/i);
  const rawScreenshotFiles = scanDirectory(docsRoot, /\.(png|jpe?g|webp)$/i);
  const rawMetaFiles = scanDirectory(docsRoot, /^module\.json$/i);

  const stepFiles = {};
  for (const [relPath, absPath] of Object.entries(rawStepFiles)) {
    stepFiles[relPath] = fs.readFileSync(absPath, 'utf-8');
  }

  const screenshotFiles = {};
  for (const [relPath, absPath] of Object.entries(rawScreenshotFiles)) {
    screenshotFiles[relPath] = absPath;
  }

  const metaFiles = {};
  for (const [relPath, absPath] of Object.entries(rawMetaFiles)) {
    metaFiles[relPath] = fs.readFileSync(absPath, 'utf-8');
  }

  const { roles } = buildManualContent({
    stepFiles,
    screenshotFiles,
    metaFiles
  });

  const partsConfig = [
    {
      roleId: 'homeowner',
      roman: 'I',
      partNumber: 1,
      partTitle: 'Homeowner Application Guide',
      partSubtitle: 'Step-by-step procedures for Homeowners registering an account, posting household job listings, reviewing worker applicants, issuing Digital Village Passes, managing bookings, using the Explore & Saved swipe deck, configuring notifications, language (English/Tagalog/Bisaya), privacy & App Tutorial settings, and complying with DOLE contract & booking limits.'
    },
    {
      roleId: 'kasambahay',
      roman: 'II',
      partNumber: 2,
      partTitle: 'Kasambahay (Worker) Application Guide',
      partSubtitle: 'Step-by-step procedures for Household Workers registering, completing identity & liveness verification, uploading clearances, generating a profile CV, applying for jobs, presenting Digital Village Passes, using the Explore & Saved swipe deck, configuring notifications, language (English/Tagalog/Bisaya), privacy & App Tutorial settings, and reviewing DOLE contract & minimum wage rules.'
    },
    {
      roleId: 'admin',
      roman: 'III',
      partNumber: 3,
      partTitle: 'Admin & Barangay Control Panel',
      partSubtitle: 'Step-by-step operational procedures for Barangay Reviewers and Super Administrators managing verification queues, AI/OCR review, user access controls, penalty points, and emergency broadcasts.'
    }
  ];

  let estimatedPage = 1;
  let bookmarkCounter = 1;
  let imageCounter = 1;

  let tocXml = '';
  let bodyContentXml = '';
  const mediaArchiveEntries = [];
  const imageRelationshipsXml = [];

  for (const part of partsConfig) {
    const roleData = roles[part.roleId];
    if (!roleData) continue;

    const partBookmark = `part_${part.roleId}`;
    const partBmId = bookmarkCounter++;

    // Level 1 TOC Entry (Bold, 0in indent, e.g. "Homeowner Application Guide ................ 1")
    tocXml += createTocEntryXml({
      label: part.partTitle,
      pageNum: estimatedPage,
      level: 1,
      bookmarkTarget: partBookmark
    });

    // Part Heading in Document Body (15pt Bold #365F91 with bottom border)
    bodyContentXml += `
      <w:p>
        <w:pPr>
          <w:pageBreakBefore/>
          <w:keepNext/>
          <w:spacing w:before="120" w:after="100" w:line="240" w:lineRule="auto"/>
          <w:pBdr>
            <w:bottom w:val="single" w:sz="12" w:space="6" w:color="365F91"/>
          </w:pBdr>
        </w:pPr>
        <w:bookmarkStart w:id="${partBmId}" w:name="${partBookmark}"/>
        <w:r>
          <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>
          <w:t>${escapeXml(part.partTitle)}</w:t>
        </w:r>
        <w:bookmarkEnd w:id="${partBmId}"/>
      </w:p>
      <w:p>
        <w:pPr><w:spacing w:before="40" w:after="200" w:line="260" w:lineRule="auto"/></w:pPr>
        <w:r>
          <w:rPr><w:i/><w:color w:val="4B5563"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
          <w:t>${escapeXml(part.partSubtitle)}</w:t>
        </w:r>
      </w:p>
    `;

    for (let mIdx = 0; mIdx < roleData.modules.length; mIdx++) {
      const mod = roleData.modules[mIdx];
      const modSectionNum = `${part.partNumber}.${mIdx + 1}`;
      const modBookmark = `mod_${part.roleId}_${mIdx + 1}`;
      const modBmId = bookmarkCounter++;

      // Level 2 TOC Entry (Regular 10pt, 0.25in indent, matching "First-time Access to the Classroom ....... 1")
      tocXml += createTocEntryXml({
        label: mod.title,
        pageNum: estimatedPage,
        level: 2,
        bookmarkTarget: modBookmark
      });

      // Module Heading in Document Body (13pt Bold #365F91)
      bodyContentXml += `
        <w:p>
          <w:pPr>
            ${mIdx > 0 ? '<w:pageBreakBefore/>' : ''}
            <w:keepNext/>
            <w:spacing w:before="200" w:after="80" w:line="240" w:lineRule="auto"/>
            <w:pBdr>
              <w:bottom w:val="single" w:sz="6" w:space="4" w:color="D1D5DB"/>
            </w:pBdr>
          </w:pPr>
          <w:bookmarkStart w:id="${modBmId}" w:name="${modBookmark}"/>
          <w:r>
            <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
            <w:t>${escapeXml(`${modSectionNum}  ${mod.title}`)}</w:t>
          </w:r>
          <w:bookmarkEnd w:id="${modBmId}"/>
        </w:p>
      `;

      if (mod.overview) {
        bodyContentXml += `
          <w:p>
            <w:pPr><w:spacing w:before="40" w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
            <w:r>
              <w:rPr><w:color w:val="333333"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
              <w:t>${escapeXml(mod.overview)}</w:t>
            </w:r>
          </w:p>
        `;
      }

      for (let sIdx = 0; sIdx < mod.steps.length; sIdx++) {
        const step = mod.steps[sIdx];
        const stepNumberLabel = `${modSectionNum}.${step.index}`;
        const stepBookmark = `step_${part.roleId}_${mIdx + 1}_${step.index}`;
        const stepBmId = bookmarkCounter++;

        // Level 3 TOC Entry (Regular 9.5pt, 0.50in indent, matching sub-items under sections)
        tocXml += createTocEntryXml({
          label: step.title,
          pageNum: estimatedPage,
          level: 3,
          bookmarkTarget: stepBookmark
        });

        // Step Subheading in Document Body (11pt Bold #111111)
        bodyContentXml += `
          <w:p>
            <w:pPr>
              <w:keepNext/>
              <w:spacing w:before="180" w:after="60" w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:bookmarkStart w:id="${stepBmId}" w:name="${stepBookmark}"/>
            <w:r>
              <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>
              <w:t xml:space="preserve">${escapeXml(`${stepNumberLabel}  `)}</w:t>
            </w:r>
            <w:r>
              <w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>
              <w:t>${escapeXml(step.title)}</w:t>
            </w:r>
            <w:bookmarkEnd w:id="${stepBmId}"/>
          </w:p>
        `;

        // Step Markdown Instructions
        bodyContentXml += renderStepMarkdownToWordXml(step.rawContent);

        // Embed actual screenshot image if available on disk
        if (step.hasScreenshot && step.screenshotUrl && fs.existsSync(step.screenshotUrl)) {
          const imgBuf = fs.readFileSync(step.screenshotUrl);
          const ext = path.extname(step.screenshotUrl).toLowerCase().replace('.', '') || 'png';
          const normalizedExt = ext === 'jpeg' ? 'jpg' : ext;
          const mediaFilename = `image_${imageCounter}.${normalizedExt}`;
          const rId = `rIdImg${imageCounter}`;
          const docPrId = imageCounter;
          imageCounter++;

          const { width, height } = getImageDimensions(imgBuf);
          const { cx, cy } = computeWordImageEmu(width, height);

          mediaArchiveEntries.push({
            name: `word/media/${mediaFilename}`,
            data: imgBuf
          });

          imageRelationshipsXml.push(
            `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaFilename}"/>`
          );

          bodyContentXml += createDrawingParagraphXml({
            rId,
            docPrId,
            name: mediaFilename,
            cx,
            cy,
            caption: `Figure ${stepNumberLabel}: ${step.title}`
          });
        }

        estimatedPage++;
      }
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- Table of Contents Title (15pt Bold #365F91, Centered) -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="200" w:after="360" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>
        <w:t>Table of Contents</w:t>
      </w:r>
    </w:p>

    <!-- Intro Prompt (10pt Bold Italic) -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="80" w:after="200" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:i/><w:color w:val="111111"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
        <w:t>Below is the complete table of contents for the manual:</w:t>
      </w:r>
    </w:p>

    ${tocXml}

    <!-- Outro Prompt (10pt Bold Italic) -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="320" w:after="120" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:i/><w:color w:val="111111"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
        <w:t>The following pages are detailed sections from the manual.</w:t>
      </w:r>
    </w:p>

    ${bodyContentXml}

    <!-- Standard US Letter (8.5in x 11in) with 1-inch (1440 twips) margins -->
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const header1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:after="120"/>
    </w:pPr>
    <w:r>
      <w:rPr><w:b/><w:color w:val="365F91"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
      <w:t>SerbiSure User Manual</w:t>
    </w:r>
  </w:p>
</w:hdr>`;

  const footer1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:tabs>
        <w:tab w:val="right" w:pos="9360"/>
      </w:tabs>
    </w:pPr>
    <w:r>
      <w:rPr><w:color w:val="222222"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr>
      <w:t>SerbiSure-User-Manual.doc</w:t>
    </w:r>
    <w:r>
      <w:rPr><w:color w:val="222222"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr>
      <w:tab/>
    </w:r>
    <w:r>
      <w:rPr><w:color w:val="222222"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr>
      <w:t xml:space="preserve">© 2026 SerbiSure  |  Page </w:t>
    </w:r>
    <w:fldSimple w:instr="PAGE">
      <w:r>
        <w:rPr><w:color w:val="222222"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr>
        <w:t>1</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>
</w:ftr>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>
        <w:sz w:val="21"/>
        <w:szCs w:val="21"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="100" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="webp" ContentType="image/webp"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
  ${imageRelationshipsXml.join('\n  ')}
</Relationships>`;

  const zipBuffer = buildZipArchive([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'word/_rels/document.xml.rels', data: documentRelsXml },
    { name: 'word/styles.xml', data: stylesXml },
    { name: 'word/header1.xml', data: header1Xml },
    { name: 'word/footer1.xml', data: footer1Xml },
    { name: 'word/document.xml', data: documentXml },
    ...mediaArchiveEntries
  ]);

  const rootOutPath = path.join(rootDir, 'SerbiSure-User-Manual.docx');
  const publicOutPath = path.join(rootDir, 'public', 'SerbiSure-User-Manual.docx');

  fs.writeFileSync(rootOutPath, zipBuffer);
  if (fs.existsSync(path.join(rootDir, 'public'))) {
    fs.writeFileSync(publicOutPath, zipBuffer);
  }

  console.log(`✅ Generated Word User Manual (.docx) with ${mediaArchiveEntries.length} embedded screenshots:`);
  console.log(`   - Root file:   ${rootOutPath} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   - Public file: ${publicOutPath} (bundled for website download)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateManualDocx();
}
