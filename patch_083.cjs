const fs = require('fs');
const file = './public/smk-forms/083_Loss_Damage_Lashing_Gear.html';
let code = fs.readFileSync(file, 'utf8');

const oldMedia = /@media screen and \(max-width: 768px\) \{[\s\S]*?\}/;
const newMedia = `@media screen and (max-width: 768px) {
      .top { grid-template-columns: 1fr; text-align: center; gap: 8px; }
      .st { align-items: center; }
      .info-grid { grid-template-columns: 1fr; gap: 12px; }
      .item { flex-direction: column; align-items: flex-start; gap: 4px; }
      .item label { width: 100%; flex-direction: row; justify-content: flex-start; align-items: baseline; gap: 6px; white-space: normal; }
      .item input, .item select { width: 100%; flex: none; }
      .footer-grid { grid-template-columns: 1fr; gap: 30px; }
      .page { padding: 10px; overflow-x: hidden; }
      .tbl-container { width: 100%; max-width: 100vw; overflow-x: auto; }
      .tbl { min-width: 600px; }
    }`;

code = code.replace(oldMedia, newMedia);
fs.writeFileSync(file, code);

// Also copy to dist/ if it exists, to avoid needing a build
const distFile = './dist/smk-forms/083_Loss_Damage_Lashing_Gear.html';
if(fs.existsSync(distFile)) {
    fs.writeFileSync(distFile, code);
}

console.log("PATCH SUCCESS");
