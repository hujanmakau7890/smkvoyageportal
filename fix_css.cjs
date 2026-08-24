const fs = require('fs');
const path = require('path');

const publicDir = './public/smk-forms/';
const distDir = './dist/smk-forms/';

// Kita akan mengganti .tbl-container { width: 100%; max-width: 100vw; overflow-x: auto; }
// menjadi .tbl-container { width: 100%; max-width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }

function fixDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    for (const file of files) {
        const filePath = path.join(dir, file);
        let code = fs.readFileSync(filePath, 'utf8');
        
        let changed = false;
        if (code.includes('max-width: 100vw; overflow-x: auto;')) {
            code = code.replace(/max-width: 100vw; overflow-x: auto;/g, 'max-width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;');
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(filePath, code);
        }
    }
}
fixDir(publicDir);
fixDir(distDir);
console.log("FIX CSS DONE");
