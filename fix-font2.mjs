import fs from 'fs';
const files = ['024_Safety_Equipment_Demonstration_Drill.html', '026_Oil_Spillage_Drill.html'];

for (const file of files) {
  let content = fs.readFileSync('/tmp/voyage-wt/public/smk-forms/' + file, 'utf-8');
  
  // Just find the specific textarea and replace its style
  content = content.replace(/<textarea style="width:100%;border:0;border-bottom:1px solid;resize:vertical;min-height:30px;font-family:inherit;font-size:inherit;padding-top:4px"><\/textarea>/g, `<textarea style="width:100%;border:1px solid #ccc;resize:vertical;min-height:80px;font-family:inherit;font-size:13px;padding:4px;margin-top:4px"></textarea>`);
  
  fs.writeFileSync('/tmp/voyage-wt/public/smk-forms/' + file, content, 'utf-8');
}
