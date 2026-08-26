import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('public/smk-forms/010_Risk_Assessment.html', 'utf8');
const registry = fs.readFileSync('src/data/smkForms.js', 'utf8');

// ===== Excel content parity (sharedStrings.xml) =====
assert.match(html, /PT Mentari Mas Multimoda/, 'company header');
assert.match(html, /010(\s|&nbsp;|\u00a0)+FORM OF RISK ASSESSMENT/, 'Excel title D4');
assert.match(html, /FORM PENILAIAN RESIKO/, 'Excel subtitle (spelling RESIKO)');
assert.match(html, />CS<\/span><span>SET</, 'CS | SET box');
assert.match(html, /Release:/, 'release line K5');
assert.match(html, /Ship Name \/ Nama kapal :/, 'B7 label');
assert.match(html, /Section \/ Bagian:/, 'E7 label');
assert.match(html, /\*\*\*Pls choose one/, 'E7 note');
assert.match(html, /Work area assessed \/ Area kerja yang dinilai :/, 'B8 label');
assert.match(html, /Assessment Date \/ Tanggal Penilaian:/, 'I7 label');
assert.match(html, /Perform a Risk Assessment every time doing a job/, 'instruction EN 1');
assert.match(html, /The Master appoints one of his officers/, 'instruction EN 2');
assert.match(html, /Archieve the completed files on the SHIP ACTIVITY FILE/, 'instruction EN 3 (Excel spelling Archieve)');
assert.match(html, /Lakukan Penilaian Resiko setiap kali melakukan/, 'instruction ID 1');
assert.match(html, /Nahkoda menunjuk salah satu perwiranya/, 'instruction ID 2');
assert.match(html, /Arsipkan file yang telah diisi dan dilengkapi pada FILE KEGIATAN KAPAL/, 'instruction ID 3');
assert.match(html, /Work processes \/ actions performed in the work area/, 'header C15');
assert.match(html, /Deskripsi potensi bahaya yang berhubungan dengan kegiatan/, 'header D16');
assert.match(html, /Pihak\/orang yang berpotensi terkena dampak bahaya/, 'header E16');
assert.match(html, /Pengendalian bahaya yang telah dilakukan/, 'header G16');
assert.match(html, /Tingkat Kegawatan\*\*\)/, 'header I16');
assert.match(html, /Kecenderungan terjadi\*\*\)/, 'header J16');
assert.match(html, /Faktor Resiko\*\*\)/, 'header K16');
assert.match(html, /The Crew conducting the assessment,/, 'signature 1 title B32');
assert.match(html, /Checked by \/ Diperiksa oleh,/, 'signature 2 title D32');
assert.match(html, /Reported to \/ Dilaporkan kepada/, 'signature 3 title E32');
assert.match(html, /Master \/ Nahkoda/, 'D35 role');
assert.match(html, /DPA/, 'E35 role');
assert.match(html, /\( &#8230;/, 'dotted signature line B35');
assert.match(html, /\*\) Scratch that is not appropriate \/ Coret yang tidak perlu/, 'footnote *');
assert.match(html, /refer to Table Risk Factors/, 'footnote **');

// ===== Risk matrix parity (I34:L38) =====
for (const t of ['Not Dangeorus', 'Dangerous', 'Very Dangerous',   // Excel spelling row I34:K34
                 'Tidak Gawat', 'Gawat', 'Sangat Gawat',
                 'Rarely \/ Jarang', 'Often \/ Sering', 'Very often']) {
  assert.match(html, new RegExp(t), 'matrix term: ' + t);
}
assert.equal((html.match(/Can be tolerated/g) || []).length >= 3, true, 'Can be tolerated x3 in matrix');
assert.equal((html.match(/Medium<br>Sedang/g) || []).length === 3, true, 'Medium x3 in matrix (like Excel K36/J37/I38)');
assert.equal((html.match(/Big<br>Besar/g) || []).length === 2, true, 'Big/Besar x2 in matrix');
assert.match(html, /Can't be Tolerated<br>Tidak dapat ditoleransi/, 'matrix corner K38');

// ===== Data validations parity =====
assert.match(html, /<option>Choose<\/option>\s*<option>Abort<\/option>\s*<option>Completed<\/option>/s, 'DV K6 list Choose/Abort/Completed');
assert.match(html, /<option>Proggress<\/option>/, 'DV M6 list Proggress/Completed (Excel spelling)');
assert.match(html, /<option>Express Mas<\/option>/, 'vessel list DV D7');
assert.match(html, /<option>Mavendra Mas<\/option>/, 'vessel list 2');
assert.match(html, /id="chk-deck"/, 'Deck checkbox select F7');
assert.match(html, /id="chk-mesin"/, 'Mesin checkbox select F8/G8');

// ===== Conditional formatting parity (dxfs 7-12) =====
assert.match(html, /cf-yellow\{background:#ffff00!important\}/, 'CF dxf11 yellow #FFFF00');
assert.match(html, /cf-green\{background:#92d050!important\}/, 'CF dxf10/8 green #92D050');
assert.match(html, /cf-red\{background:#ff0000!important/, 'CF dxf9/7 red #FF0000');
assert.match(html, /select\.chk\.blank\{background:#f2f2f2\}/, 'CF dxf12 containsBlanks -> F2F2F2');
assert.match(html, /if \(k\.value\.indexOf\('Choose'\) !== -1\) k\.classList\.add\('cf-yellow'\);/, 'CF rule Choose->yellow');
assert.match(html, /if \(k\.value\.indexOf\('Completed'\) !== -1\) k\.classList\.add\('cf-green'\);/, 'CF rule Completed->green (K6)');
assert.match(html, /if \(k\.value\.indexOf\('Abort'\) !== -1\) k\.classList\.add\('cf-red'\);/, 'CF rule Abort->red');
assert.match(html, /if \(m\.value\.indexOf\('Completed'\) !== -1\) m\.classList\.add\('cf-green'\);/, 'CF rule Completed->green (M6)');
assert.match(html, /if \(m\.value\.indexOf\('Proggress'\) !== -1\) m\.classList\.add\('cf-red'\);/, 'CF rule Proggress->red');

// ===== Excel formulas mirror (C2:F3 helper) =====
assert.match(html, /id="m-nama"/, 'mirror C3 =D7');
assert.match(html, /id="m-tanggal"/, 'mirror D3 =I8');
assert.match(html, /id="m-status"/, 'mirror E3 =K6');
assert.match(html, /id="m-status2"/, 'mirror F3 =F1');
assert.match(html, /\/\* =D7 \*\//, 'formula comment =D7');
assert.match(html, /\/\* =I8 \*\//, 'formula comment =I8');
assert.match(html, /\/\* =K6 \*\//, 'formula comment =K6');
assert.match(html, /\/\* =F1 -> =D7 \*\//, 'formula chain F1=D7=F3');

// ===== Main table structure =====
assert.match(html, /tbody id="rows"/, 'rows tbody');
assert.match(html, /for \(var i = 0; i < 15; i\+\+\)/, 'exactly 15 data rows like Excel 17-31');
assert.doesNotMatch(html, /Tambah Baris/, 'no add-row button (fixed grid like Excel)');
assert.doesNotMatch(html, /Hapus Baris/, 'no delete-row button');
assert.match(html, /<tbody id="rows"><!-- 15 rows injected by script --><\/tbody>/, 'textareas injected by script, tbody empty in static HTML');

// ===== Dropdown options in rows match DV ranges =====
assert.match(html, /'Not Dangeorus','Dangerous','Very Dangerous'/, 'level options from $I$34:$L$34');
assert.match(html, /'Rarely \/ Jarang','Often \/ Sering','Very often Sangat sering'/, 'trend options from $H$36:$H$38');
assert.match(html, /'Not Important','Can be tolerated',"Can't be Tolerated"/, 'factor options from DV K17:L31');

// ===== Portal integration =====
assert.match(html, /const FORM_CODE = "010"/, 'form code must be 010');
assert.match(html, /type: 'SMK_SAVE_PDF'/, 'must retain portal PDF integration');
assert.match(html, /INIT_FORM/, 'must accept INIT_FORM from parent');
assert.match(html, /type:'FORM_TITLE'/, 'title sync to parent');
assert.match(html, /aksiSimpanDanCetak/, 'save handler present');
assert.match(html, /Pilih Kapal terlebih dahulu/, 'vessel required before print');
assert.match(html, /@page\{size:A4 landscape;margin:7mm\}/, 'print must be A4 landscape like pageSetup scale=71 landscape');
assert.doesNotMatch(html, /smk_form_data/, 'autosave must NOT be present');
assert.doesNotMatch(html, /localStorage/, 'no localStorage usage');

assert.match(registry, /code: "010"/, 'form must appear in portal menu');

console.log('010 form contract passed');
