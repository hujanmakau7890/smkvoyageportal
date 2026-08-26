import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/084A_Ballast_Tank_Report.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

// Required fields (report_status intentionally omitted - user: abaikan Choose dll)
for (const id of ['vessel', 'date', 'tank_no', 'date_report', 'anode_wastage', 'anode_good', 'anode_broken', 'mud_sel']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing required field ${id}`);
}
assert.doesNotMatch(html, /report_status/, 'Choose/Abort/Completed must NOT exist (user instruction)');
// Conditional formatting (exact dxf colors from Excel)
assert.match(html, /#05FB11/, 'under deck grade 1 green (dxf 30)');
assert.match(html, /#13FF01/, 'structure/fittings grade 1 green (dxf 29/3)');
assert.match(html, /#66FF33/, 'bulkhead grade 1 green (dxf 13/10)');
assert.match(html, /#27FC04/, 'anode >=0.7 green (dxf 24)');
assert.match(html, /#00FF00/, 'mud <=1 green (dxf 19)');
assert.match(html, /#FFFF00/, 'grade 2 yellow');
assert.match(html, /#FF0000|#ff0000/, 'grade 3 red');
assert.match(html, /applyGradeCF/, 'conditional formatting logic');
assert.match(html, /cfAnode/, 'anode CF');
assert.match(html, /cfMud/, 'mud CF');
assert.match(html, /#002060/, 'blue font mud dropdown + signature names');
assert.match(html, /color:#FF0000/, 'red notes K41-K43');
// Diagram structure = exact Excel validation ranges
const cnt = (re) => (html.match(re) || []).length;
assert.equal(cnt(/data-cg="bulk"/g), 6, 'fwd(3)+aft(3) bulkhead grades = Excel J13:J15+J21:J23');
assert.equal(cnt(/data-cg="ud"/g), 7, 'under deck 4+3 strips = Excel F16:J16+L16:O16 (+J9:K9)');
assert.equal(cnt(/data-cg="struct"/g), 9, 'structure grades = Excel H31:H39');
assert.equal(cnt(/data-cg="fit"/g), 9, 'fittings grades = Excel Q31:Q39');
assert.match(html, /stack-fwd/, 'fwd stack box');
assert.match(html, /stack-aft/, 'aft stack box');
assert.match(html, /strip-l/, 'left under-deck strip');
assert.match(html, /strip-r/, 'right under-deck strip');
assert.match(html, /band-bs/, 'bottom shell zone');
// Excel content parity
assert.match(html, /BALLAST TANK CONDITION REPORT \(GENERAL\)/i, 'title');
assert.match(html, /PT Mentari Mas Multimoda/i, 'company header');
assert.match(html, />CS</, 'CS box');
assert.match(html, />SMT</, 'SMT box');
assert.match(html, /Release :/, 'release line');
assert.match(html, /Rev\.0/, 'rev 0');
assert.match(html, /#29f72e/, 'legend green fill');
assert.match(html, /#ffff00/, 'legend yellow fill');
assert.match(html, /NOT SEEN/, 'NS legend');
assert.match(html, /Fwd transfer/, 'fwd label');
assert.match(html, /Aft Transfer bulkhead/, 'aft label');
assert.match(html, /Port Longitudinal/, 'port note');
assert.match(html, /stbd longitudinal/, 'stbd note');
assert.match(html, /Under Deck/, 'under deck caption');
assert.match(html, /TANK STRUCTURE/, 'structure column');
assert.match(html, /TANK FITTINGS/, 'fittings column');
for (const t of ['DB Inb WT Girder','Inb Longitudinal Bhd','Tranverse Bulkhead Fwd','Tranverse Bulkhead Aft',
                 'DB Inner Bottom','Upper Tank Top \\/ Deck Head','Manhole Cover','Tank Vent Pipes \\/ Vent Heads',
                 'Sound Pipe \\/ Cap \\/ Striker plate','Tank remote gauging system','Suct \\/ Delivery Pipe\\/ Valve \\/ Mounth',
                 'Ladders and Platforms','Other Internal Piping']) {
  assert.match(html, new RegExp(t), `content: ${t}`);
}
assert.match(html, /Anode Wastage \(%\)/, 'anode');
assert.match(html, /Total Good/, 'Total Good (F42)');
assert.match(html, /Total Broken/, 'Total Broken (G42)');
assert.match(html, /G\/\(G\+B\)|G\/ ?\( ?G ?\+ ?B ?\)/, 'H42 formula parity');
assert.match(html, /Mud Accumalation \(cm\)/, 'mud (Excel spelling)');
assert.match(html, /1,1 - 5/, 'mud threshold option');
assert.match(html, /Fotos have to be attached to this report as evidence/, 'foto note');
assert.match(html, /TANKS&nbsp; COATINGS CONDITION GUIDE/, 'guide note');
assert.match(html, /Remarks:/, 'remarks');
assert.match(html, /Corrective[\s\n]*Actions:/s, 'corrective actions');
assert.match(html, /Inspector/, 'inspector sig');
assert.match(html, /Ch Off/, 'ch off sig');
assert.match(html, /Master/, 'master sig');
assert.match(html, /photo-grid/, 'evidence photos');
// Portal integration
assert.match(html, /const FORM_CODE = "084A"/, 'form code');
assert.match(html, /type: 'SMK_SAVE_PDF'/, 'portal PDF integration');
assert.match(html, /INIT_FORM/, 'INIT_FORM handler');
assert.match(html, /FORM_TITLE/, 'title sync');
assert.match(html, /@page \{ size:A4 portrait/, 'A4 portrait print');
assert.doesNotMatch(html, /smk_form_data/, 'no autosave');
assert.match(registry, /code: "084A"/, 'in portal menu');

console.log('084A form contract passed');
