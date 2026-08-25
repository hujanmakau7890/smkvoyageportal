import fs from 'node:fs';
import assert from 'node:assert/strict';

const formPath = 'public/smk-forms/088B_Cover_Letter_For_Crew_Treatment.html';
const html = fs.readFileSync(formPath, 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

for (const id of [
  'vessel', 'letter_no', 'report_date', 'crew_name', 'birth_place_date',
  'gender', 'rank', 'passport_seaman_id', 'complaint', 'treatment_facility',
  'master_name', 'medical_inpatient', 'medical_outpatient', 'medical_general',
  'medical_specialist', 'clinic_hospital', 'date_entering', 'date_leaving',
  'incoming_diagnosis', 'inpatient_indication', 'doctor_request', 'own_request',
  'main_additional_complaints', 'complaint_duration', 'outcoming_diagnosis',
  'doctor_name_stamp', 'doctor_address_phone', 'doctor_signature'
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing required field ${id}`);
}

assert.match(html, /const FORM_CODE\s*=\s*['"]088B['"]/, 'Form code must be 088B');
assert.match(html, /type:\s*['"]SMK_SAVE_PDF['"]/, 'must retain portal PDF integration');
assert.match(html, /type\s*===\s*['"]INIT_FORM['"]/, 'must receive portal initialization');
assert.match(html, /smk_form_data/, 'must persist to smk_form_data');
assert.match(html, /@page\s*\{\s*size:\s*A4 portrait/, 'print must be A4 portrait');
assert.match(html, /break-inside:\s*avoid/, 'signature / doctor sections must avoid print splits');
assert.match(html, /type=["']checkbox["']/, 'medical service choices must be checkboxes');
assert.match(registry, /\{ code: "088B", title: "Cover Letter For Crew Treatment", category: "Laporan Deck", file: "088B_Cover_Letter_For_Crew_Treatment\.html" \}/, 'form must appear in Laporan Deck menu');

console.log('088B form contract passed');
