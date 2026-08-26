import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/084A_Ballast_Tank_Report.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

// Required fields
for (const id of ['vessel', 'date']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing required field ${id}`);
}
// Excel content parity
assert.match(html, /BALLAST TANK CONDITION REPORT/i, 'title must match Excel');
assert.match(html, /Coating Grading/i, 'coating grading section must exist');
assert.match(html, /Fwd Transfer Bulkhead|Fwd transfer/i, 'fwd transfer bulkhead row');
assert.match(html, /Aft Transfer bulkhead|Aft Transfer Bulkhead/i, 'aft transfer bulkhead row');
assert.match(html, /Port Longitudinal/i, 'port longitudinal row');
assert.match(html, /stbd longitudinal|Stbd Longitudinal/i, 'stbd longitudinal row');
assert.match(html, /Under Deck/i, 'under deck row');
assert.match(html, /Bottom Shell/i, 'bottom shell row');
assert.match(html, /TANK STRUCTURE/i, 'tank structure column');
assert.match(html, /Manhole Cover/i, 'manhole cover fitting');
assert.match(html, /Tank Vent Pipes/i, 'vent pipes fitting');
assert.match(html, /Anode Wastage/i, 'anode wastage');
assert.match(html, /anode_good/, 'anode total good input (Excel F43)');
assert.match(html, /anode_broken/, 'anode total broken input (Excel G43)');
assert.match(html, /G \+ B/, 'anode wastage formula must compute from good+broken');
assert.match(html, /Mud Accum/i, 'mud accumulation');
assert.match(html, /Corrective/i, 'corrective actions');
assert.match(html, /Inspector/i, 'inspector signature');
assert.match(html, /Ch Off|Chief Officer/i, 'chief officer signature');
assert.match(html, /Master/i, 'master signature');
// Portal integration
assert.match(html, /const FORM_CODE = "084A"/, 'form code must be 084A');
assert.match(html, /type: 'SMK_SAVE_PDF'/, 'must retain portal PDF integration');
assert.match(html, /INIT_FORM/, 'must accept INIT_FORM from parent');
assert.match(html, /@page \{ size: A4 portrait/, 'print must be A4 portrait');
assert.doesNotMatch(html, /smk_form_data/, 'autosave must NOT be present (removed feature)');
assert.match(registry, /code: "084A"/, 'form must appear in portal menu');
console.log('084A form contract passed');
