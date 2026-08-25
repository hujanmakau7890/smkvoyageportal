import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/088A_Report_of_Injury_or_Death.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');
for (const id of ['vessel', 'person_name', 'accident_datetime', 'body_injured', 'witness_name', 'report_date', 'masterSig', 'witnessSig']) {
  assert.match(html, new RegExp(`['\"]${id}['\"]|id="${id}"`), `missing required field ${id}`);
}
assert.match(html, /const FORM_CODE='088A'/, 'Form code must be 088A');
assert.match(html, /type:'SMK_SAVE_PDF'/, 'must retain portal PDF integration');
assert.match(html, /photoUpload\.addEventListener\('change'/, 'photo upload listener must target file input');
assert.match(html, /@page\{size:A4 portrait/, 'print must be A4 portrait');
assert.match(html, /\.section\s*\+\s*\.notice\s*\+\s*\.row\s*\{border-top:1px solid #111\}/, 'further information row must have a complete top border');
assert.match(registry, /code: "088A"/, 'form must appear in portal menu');
console.log('088A form contract passed');
