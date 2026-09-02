import fs from 'fs';
const files = ['023_Abandon_Ship_Drill_Report.html', '024_Safety_Equipment_Demonstration_Drill.html', '025_Entry_Enclosed_Space_and_Rescue_Drill.html', '026_Oil_Spillage_Drill.html', '027_Emergency_Steering_Drill.html', '028_Man_Overboard_and_Recovery_Drill.html'];

for (const file of files) {
  let content = fs.readFileSync('/tmp/voyage-wt/public/smk-forms/' + file, 'utf-8');
  
  if (file === '023_Abandon_Ship_Drill_Report.html') {
    content = content.replace(/<label style="display:block;font-size:9px;font-weight:bold;margin-bottom:4px">ABK tidak mengikuti latihan.*?<\/textarea>/s, `<label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px">ABK tidak mengikuti latihan (nama &amp; jabatan) / Crew unable to follow drill (name &amp; rank) <b>:</b></label><textarea style="width:100%;border:1px solid #000;padding:6px;font-size:13px;min-height:80px;resize:vertical"></textarea>`);
  } else if (file === '024_Safety_Equipment_Demonstration_Drill.html') {
    content = content.replace(/<label class="field wide" style="flex-direction:column;align-items:flex-start;">Crew can't follow the drill for a reason[^>]*>.*?<\/textarea><\/label>/s, `<label class="field wide" style="flex-direction:column;align-items:flex-start;font-size:12px;">Crew can't follow the drill for a reason (name &amp; rank) / ABK yang tidak mengikuti latihan karena suatu alasan (nama &amp; jabatan) <b>:</b><textarea style="width:100%;border:1px solid #ccc;resize:vertical;min-height:80px;font-family:inherit;font-size:13px;padding:4px;margin-top:4px"></textarea></label>`);
  } else if (file === '025_Entry_Enclosed_Space_and_Rescue_Drill.html') {
    content = content.replace(/<label class="f wide">Crew unable to follow drill and reason \/ Personel yang tidak mengikuti latihan dan alasannya:<input><\/label>/s, `<label class="f wide" style="flex-direction:column;align-items:flex-start;font-size:12px;">Crew can't follow the drill for a reason (name &amp; rank) / ABK yang tidak mengikuti latihan karena suatu alasan (nama &amp; jabatan) <b>:</b><textarea style="width:100%;border:1px solid #ccc;resize:vertical;min-height:80px;font-family:inherit;font-size:13px;padding:4px;margin-top:4px"></textarea></label>`);
  } else if (file === '026_Oil_Spillage_Drill.html') {
    content = content.replace(/<label class="field wide" style="flex-direction:column;align-items:flex-start">Crew can't follow the drill for a reason[^>]*>.*?<\/textarea><\/label>/s, `<label class="field wide" style="flex-direction:column;align-items:flex-start;font-size:12px;">Crew can't follow the drill for a reason (name &amp; rank) / ABK yang tidak mengikuti latihan karena suatu alasan (nama &amp; jabatan) <b>:</b><textarea style="width:100%;border:1px solid #ccc;resize:vertical;min-height:80px;font-family:inherit;font-size:13px;padding:4px;margin-top:4px"></textarea></label>`);
  } else if (file === '027_Emergency_Steering_Drill.html' || file === '028_Man_Overboard_and_Recovery_Drill.html') {
    // I already used sed, let's just make sure the label font size is updated too
    content = content.replace(/<label class="f?i?e?l?d? wide" style="flex-direction:column;align-items:flex-start;">Crew can't follow the drill/s, `<label class="field wide" style="flex-direction:column;align-items:flex-start;font-size:12px;">Crew can't follow the drill`);
    // And for 028 it was <label class="f wide" style="flex-direction:column;align-items:flex-start;">
    content = content.replace(/<label class="f wide" style="flex-direction:column;align-items:flex-start;">Crew can't follow the drill/s, `<label class="f wide" style="flex-direction:column;align-items:flex-start;font-size:12px;">Crew can't follow the drill`);
  }

  fs.writeFileSync('/tmp/voyage-wt/public/smk-forms/' + file, content, 'utf-8');
}
