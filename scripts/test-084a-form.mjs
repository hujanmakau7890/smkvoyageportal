import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/084A_Ballast_Tank_Report.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

// Required fields
for (const id of ['vessel', 'date', 'tank_no', 'date_report', 'report_status']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing required field ${id}`);
}
// Excel content parity
assert.match(html, /BALLAST TANK CONDITION REPORT \(GENERAL\)/, 'title must match Excel');
assert.match(html, /PT MENTARI MAS MULTIMODA/, 'company header');
assert.match(html, />CS</, 'CS box');
assert.match(html, />SMT</, 'SMT box');
assert.match(html, /Release :/, 'release line');
assert.match(html, /Rev\.0/, 'rev 0');
assert.match(html, /Coating Grading/i, 'coating grading legend');
assert.match(html, /#29f72e/, 'green fill for grade 1');
assert.match(html, /#ffff00/, 'yellow fill for grade 2');
assert.match(html, /#ff0000/, 'red fill for grade 3');
assert.match(html, /NOT SEEN/, 'NS = NOT SEEN');
// Cross-section diagram
assert.match(html, /Fwd transfer/, 'fwd transfer bulkhead label');
assert.match(html, /Aft Transfer bulkhead|Aft transfer bulkhead/i, 'aft transfer bulkhead label');
assert.match(html, /Port Longitudinal/i, 'port longitudinal side note');
assert.match(html, /stbd longitudinal/i, 'stbd longitudinal side note');
assert.match(html, /Under Deck/i, 'under deck strips');
assert.match(html, /Bottom Shell/, 'bottom shell zone');
assert.match(html, />Upper</, 'Upper zone');
assert.match(html, />Middle</, 'Middle zone');
assert.match(html, />Lower</, 'Lower zone');
assert.match(html, /data-cg/g, 'coating grade dropdowns present');
// Structure & fittings
assert.match(html, /TANK STRUCTURE/, 'structure column');
assert.match(html, /TANK FITTINGS/, 'fittings column');
assert.match(html, /DB Inb WT Girder/, 'DB Inb WT Girder');
assert.match(html, /Inb Longitudinal Bhd/, 'Inb Longitudinal Bhd');
assert.match(html, /Tranverse Bulkhead Fwd/, 'Transverse Bulkhead Fwd (Excel spelling)');
assert.match(html, /Tranverse Bulkhead Aft/, 'Transverse Bulkhead Aft (Excel spelling)');
assert.match(html, /DB Inner Bottom/, 'DB Inner Bottom');
assert.match(html, /Upper Tank Top \/ Deck Head/, 'Upper Tank Top');
assert.match(html, /Manhole Cover/, 'Manhole Cover');
assert.match(html, /Tank Vent Pipes \/ Vent Heads/, 'Vent Pipes');
assert.match(html, /Sound Pipe \/ Cap \/ Striker plate/, 'Sound Pipe');
assert.match(html, /Tank remote gauging system/, 'remote gauging');
assert.match(html, /Suct \/ Delivery Pipe\/ Valve \/ Mounth/, 'Suct/Delivery (Excel spelling)');
assert.match(html, /Ladders and Platforms/, 'Ladders');
assert.match(html, /Other Internal Piping/, 'Other piping');
// OTHER/VALUE + formulas
assert.match(html, /Anode Wastage \(%\)/, 'anode wastage');
assert.match(html, /Total Good/, 'Total Good (Excel F42)');
assert.match(html, /Total Broken/, 'Total Broken (Excel G42)');
assert.match(html, /G \+ B/, 'anode formula uses good+broken sum');
assert.match(html, /Mud Accumalation \(cm\)/, 'Mud Accumalation (Excel spelling)');
assert.match(html, /1,1 - 5/, 'mud threshold option');
assert.match(html, /Fotos have to be attached to this report as evidence/, 'foto note');
assert.match(html, /TANKS&nbsp; COATINGS CONDITION GUIDE/, 'condition guide note');
assert.match(html, /Remarks:/, 'remarks');
assert.match(html, /Corrective Actions:/, 'corrective actions');
assert.match(html, /Inspector/, 'inspector sig');
assert.match(html, /Ch Off/, 'Ch Off sig');
assert.match(html, /Master/, 'master sig');
assert.match(html, /pdf-content-2/, 'evidence page 2 exists');
// Portal integration
assert.match(html, /const FORM_CODE = "084A"/, 'form code must be 084A');
assert.match(html, /type: 'SMK_SAVE_PDF'/, 'must retain portal PDF integration');
assert.match(html, /INIT_FORM/, 'must accept INIT_FORM from parent');
assert.match(html, /FORM_TITLE/, 'must sync title');
assert.match(html, /@page \{ size:A4 portrait/, 'print must be A4 portrait');
assert.doesNotMatch(html, /smk_form_data/, 'autosave must NOT be present');
assert.match(registry, /code: "084A"/, 'form must appear in portal menu');
console.log('084A form contract passed');
