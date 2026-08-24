import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/059D_Monthly_Fuel_Lube_Cons.html', 'utf8');

assert.match(html, /\.footer-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'signature grid must use three equal desktop columns');
assert.match(html, /@media print\s*\{[\s\S]*?\.footer-grid\s*\{\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'printed PDF must keep the three signatures on one row');
assert.match(html, /\.footer-section\s*\{[^}]*break-inside:\s*avoid/s, 'signature footer must not break across PDF pages');
assert.match(html, /html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\)/, 'existing one-file PDF export must remain available');
assert.equal((html.match(/id="sigup[123]"/g) || []).length, 3, 'all three Add TTD upload controls must remain available');

console.log('059D signature layout and single-PDF regression checks passed');
