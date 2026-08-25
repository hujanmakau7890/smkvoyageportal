import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/092_Loading_Cargo_Stability.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

// Required fields
for (const id of [
  'vessel_name','port_loading','report_date','voy_no',
  'light_ship','constant','op_load','rob_ballast',
  'calc_fore','calc_mean','calc_aft','calc_gom',
  'act_fore','act_mean','act_aft',
  'cw_plan','cw_draft','cw_diff',
  'sig1_name','sig2_name','sig1','sig2'
]) {
  assert.match(html, new RegExp(`id="${id}"`), `missing required field ${id}`);
}

// Excel parity: sizes
for (const s of ['20" MT','40" MT','45" MT','20" ISO MT','20" FULL','40" FULL','45" FULL','20" ISO FULL','Flat Rack','Other Cargo']) {
  assert.ok(html.includes(s), `missing cargo size ${s}`);
}

// Formula contract (mirrors Excel D39/P43 etc.)
assert.match(html, /function recalc\(/, 'recalc() must exist');
assert.match(html, /gqi \+= n\(r\.nondg\.q_ih\)\+n\(r\.dg\.q_ih\)\+n\(r\.ref\.q_ih\)/, 'grand qty I/H formula must match Excel P43=D39+P39+Z39');
assert.match(html, /setVal\('cw_plan', fmt\(gwi \+ gwo\)\)/, 'BY PLAN must auto-sum all weights');
assert.match(html, /draft - plan/, 'DIFFERENCE = BY DRAFT - BY PLAN');

// Portal integration
assert.match(html, /const FORM_CODE = "092"/, 'form code must be 092');
assert.match(html, /type: 'SMK_SAVE_PDF'/, 'must retain portal PDF integration');
assert.match(html, /type === 'INIT_FORM'/, 'must accept INIT_FORM from parent app');
assert.match(html, /smk_form_data/, 'must persist to smk_form_data table');

// Registry
assert.match(registry, /code: "092"/, 'form must appear in portal menu');

console.log('092 form contract passed');
