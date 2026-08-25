import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/089A_Notice_of_Liability_Terminal.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');
for (const id of ['vessel','report_no','report_date','status','object_terminal','vessel_name','accident_date','owner_vessel','master_signature_name','terminal_signature_name']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing ${id}`);
}
assert.match(html, /FORM_CODE='089A'/, 'form code 089A');
assert.match(html, /SMK_SAVE_PDF/, 'portal pdf hook');
assert.match(html, /@page\{size:A4 portrait/, 'print a4 portrait');
assert.match(registry, /code: "089A"/, 'menu registry');
console.log('089A contract passed');
