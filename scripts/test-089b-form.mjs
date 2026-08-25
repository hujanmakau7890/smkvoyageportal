import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/089B_Notice_of_Liability_Collision.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');
for (const id of ['vessel','report_date','status','other_vessel','vessel_name','accident_date','owner_vessel','master_signature_name','opponent_signature_name']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing ${id}`);
}
assert.match(html, /FORM_CODE='089B'/, 'form code 089B');
assert.match(html, /SMK_SAVE_PDF/, 'portal pdf hook');
assert.match(html, /@page\{size:A4 portrait/, 'print a4 portrait');
assert.match(registry, /code: "089B"/, 'menu registry');
console.log('089B contract passed');
