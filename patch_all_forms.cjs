const fs = require('fs');
const path = require('path');

const publicDir = './public/smk-forms/';
const distDir = './dist/smk-forms/';

const oldMediaRegex = /@media screen and \(max-width: 768px\) \{[\s\S]*?\}/;
const newMedia = `@media screen and (max-width: 768px) {
      .top { grid-template-columns: 1fr; text-align: center; gap: 8px; }
      .st { align-items: center; }
      .info-grid { grid-template-columns: 1fr; gap: 12px; }
      .item { flex-direction: column; align-items: flex-start; gap: 4px; }
      .item label { width: 100%; flex-direction: row; justify-content: flex-start; align-items: baseline; gap: 6px; white-space: normal; }
      .item input, .item select { width: 100%; flex: none; }
      .footer-grid { grid-template-columns: 1fr; gap: 30px; }
      .page { padding: 10px; overflow-x: hidden; width: 100%; }
      .tbl-container { width: 100%; max-width: 100vw; overflow-x: auto; }
      .tbl { min-width: 600px; }
    }`;

function processFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    let patched = 0;
    for (const file of files) {
        const filePath = path.join(dir, file);
        let code = fs.readFileSync(filePath, 'utf8');
        
        if (oldMediaRegex.test(code)) {
            code = code.replace(oldMediaRegex, newMedia);
            fs.writeFileSync(filePath, code);
            patched++;
        }
    }
    console.log(`Patched ${patched} files in ${dir}`);
}

processFiles(publicDir);
processFiles(distDir);
