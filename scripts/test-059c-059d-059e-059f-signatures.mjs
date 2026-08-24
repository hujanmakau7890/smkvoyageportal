import fs from 'node:fs';
import assert from 'node:assert/strict';

const files = [
  'public/smk-forms/059C_Running_Store_List.html',
  'public/smk-forms/059D_Monthly_Fuel_Lube_Cons.html',
  'public/smk-forms/059E_Monthly_Chemical_Cons.html',
  'public/smk-forms/059F_Monthly_Fresh_Water_Cons.html',
];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');

  assert.match(html, /\.footer-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, `desktop signature must stay three columns: ${file}`);
  assert.match(html, /@media print\s*\{[\s\S]*?\.footer-grid\s*\{\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, `print signature must stay three columns: ${file}`);
  assert.match(html, /\.footer-section\s*\{[^}]*break-inside:\s*avoid/s, `footer must avoid page breaks: ${file}`);
  assert.match(html, /html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\)/, `single PDF export must remain: ${file}`);
  assert.equal((html.match(/id="sigup[123]"/g) || []).length, 3, `all signature uploads must remain: ${file}`);
}

console.log('059C/059D/059E/059F signature and print regression checks passed');
