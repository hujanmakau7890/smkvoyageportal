import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/084B_Ballast_Tank_Report_FPT.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

// Required fields (no Choose/Abort/Completed - user instruction)
for (const id of ['vessel', 'date', 'tank_no', 'date_report', 'anode_wastage', 'anode_good', 'anode_broken', 'mud_sel']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing required field ${id}`);
}
assert.doesNotMatch(html, /report_status/, 'Choose/Abort/Completed must NOT exist (user instruction)');
// Conditional formatting = background colors, black font (user preference)
assert.match(html, /#00FF00/, 'grade green #00FF00 (084-B dxf uniform)');
assert.match(html, /#FFFF00/, 'grade yellow');
assert.match(html, /#FF0000/, 'grade red');
assert.match(html, /applyGradeCF/, 'CF logic');
assert.doesNotMatch(html, /sel\.style\.color = (Y|R|GREEN)/, 'font must stay black; background carries color');
// Diagram dropdowns = exact Excel validation ranges (v4 rebuild)
const cnt = (re) => (html.match(re) || []).length;
assert.equal(cnt(/data-cg="bb"/g), 1, 'Bulbows Bow = Excel L11:L12 single grade');
assert.equal(cnt(/data-cg="ud"/g), 4, 'port Upper/Lower + stbd Lower/Upper = Excel G13,I13,N13,P13');
assert.equal(cnt(/data-cg="aft"/g), 2, 'Aft Bulkhead = Excel K19:M19 + K20:M20 = two dropdowns');
assert.equal(cnt(/data-cg="l14"/g), 1, 'fore peak centreline column = Excel L14 dropdown');
assert.equal(cnt(/data-cg="low"/g), 1, 'lower box = Excel L23:L25');
assert.equal(cnt(/data-cg="struct"/g), 9, 'structure grades H31:H39');
assert.equal(cnt(/data-cg="fit"/g), 9, 'fittings grades Q31:R39');
// Diagram content
assert.match(html, /Bulbows Bow/, 'Bulbows Bow caption (Excel spelling)');
assert.match(html, /Port Side Shell/, 'port label');
assert.match(html, /Stbd Side/, 'stbd label');
assert.match(html, /Aft Bulkhead/, 'aft bulkhead');
// Diagram content — v7: diagram is the pixel-exact crop of the real Excel render,
// with the 7 grade dropdowns overlaid at their exact cell positions
assert.match(html, /assets\/084B_diagram\.png/, 'diagram = pixel-exact Excel render image');
// v7: Upper/Lower/Fwd/Aft captions live inside the pixel-exact image,
// so we verify the overlay selects instead
assert.match(html, /assets\/084B_diagram\.png/, 'sheet image present');
assert.equal((html.match(/<select class="cg"/g)||[]).length, 9, '9 floating diagram selects (exact Excel DV ranges)');
// Content parity with exact Excel spellings
assert.match(html, /BALLAST TANK CONDITION REPORT \(F P T\)/i, 'title');
assert.match(html, /PT Mentari Mas Multimoda/i, 'company');
assert.match(html, />CS</, 'CS box');
assert.match(html, />SMT</, 'SMT box');
assert.match(html, /Release :/, 'release line');
assert.match(html, /Rev\.0/, 'rev 0');
assert.match(html, /TANKS STRUCTURE/, 'TANKS STRUCTURE (Excel spelling)');
assert.match(html, /TANK FITTINGS/, 'fittings column');
for (const t of ['Bottom Shell','Rudder Trunk Bulkheads','Stbd Side Shell','Transvere Bulkhead Aft',
                 'Transfer Bulkhead Fwd','Tank Top \\/ Deack Head','Wash Bulkheads','Manhole Cover',
                 'Tank Vent Pipes \\/ Vent Heads','Sound Pipe \\/ Cap \\/ Striker plate','Tank remote gauging system',
                 'Suct \\/ Delivery Pipe\\/ Valve \\/ Mounth','Ladders and Platforms','Other Internal Piping']) {
  assert.match(html, new RegExp(t), `content: ${t}`);
}
// OTHER/VALUE + formulas
assert.match(html, /Anode Wastage \(%\)/, 'anode');
assert.match(html, /Total Good/, 'Total Good (F42)');
assert.match(html, /Total Broken/, 'Total Broken (G42)');
assert.match(html, /G\/\(G\+B\)|G\/ ?\( ?G ?\+ ?B ?\)/, 'H42 formula parity');
assert.match(html, /Mud Accumulation \(cm\)/, 'Mud Accumulation (084-B spelling, no second A)');
assert.match(html, /1,1 - 5/, 'mud threshold option');
assert.match(html, /Fotos have to be attached to this report as evidence/, 'foto note');
assert.match(html, /TANK COATINGS CONDITION GUIDE/, 'guide note (084-B spelling, single space)');
assert.match(html, /Remarks:/, 'remarks');
assert.match(html, /Corrective[\s\n]*Actions:/s, 'corrective actions');
assert.match(html, /Ch Officer/, 'Ch Officer (084-B spelling)');
assert.match(html, /Inspector/, 'inspector sig');
assert.match(html, /Master/, 'master sig');
assert.match(html, /photo-grid/, 'evidence photos');
// Portal integration
assert.match(html, /const FORM_CODE = "084B"/, 'form code');
assert.match(html, /type: 'SMK_SAVE_PDF'/, 'portal PDF integration');
assert.match(html, /INIT_FORM/, 'INIT_FORM handler');
assert.match(html, /FORM_TITLE/, 'title sync');
assert.match(html, /@page \{ size:A4 portrait/, 'A4 portrait print');
assert.doesNotMatch(html, /smk_form_data/, 'no autosave');
assert.match(registry, /code: "084B"/, 'in portal menu');

console.log('084B form contract passed');
