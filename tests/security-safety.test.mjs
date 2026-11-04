// tests/security-safety.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, renderMarkdown } from '../src/render.js';

test('escapeHtml neutralizes all dangerous HTML characters', () => {
  const dangerous = '<script>alert("XSS")</script>&\'';
  const escaped = escapeHtml(dangerous);
  assert.equal(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&#39;');
  assert.ok(!escaped.includes('<'));
  assert.ok(!escaped.includes('>'));
  assert.ok(!escaped.includes('"'));
});

test('renderMarkdown strips malicious script tags and event handlers', () => {
  const maliciousMarkdown = `
# Safe Title
Here is some text.
<script>alert("hacked")</script>
<img src="invalid" onerror="alert('xss')" />
<a href="javascript:alert(1)">Click Me</a>
[Click Me](javascript:alert(1))
`;

  const rendered = renderMarkdown(maliciousMarkdown);
  assert.ok(!rendered.includes('<script>'), 'Must strip <script> tag');
  assert.ok(!rendered.includes('onerror'), 'Must strip onerror handler');
  assert.ok(!rendered.includes('href="javascript:'), 'Must strip javascript: URI');
});

test('renderMarkdown preserves and decorates GitHub style callouts', () => {
  const noteMarkdown = `
> [!NOTE]
> Important security instruction here.
`;

  const rendered = renderMarkdown(noteMarkdown);
  assert.ok(rendered.includes('callout callout-note'), 'Must generate callout note div');
  assert.ok(rendered.includes('Important security instruction here.'), 'Must include note content');
});
