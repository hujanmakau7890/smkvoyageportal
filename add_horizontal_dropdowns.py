import re

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the old band HTML with one containing selects
old_band = """    <!-- main band -->
    <div class="side-lab lab-port">Port Longitudinal<br>bulkhead</div>
    <div class="band band-port">
      <div>Upper</div><div>Lower</div>
    </div>
    <div class="band band-bs">
      <div>Hold Bottom</div>
    </div>
    <div class="band band-stbd">
      <div>Lower</div><div>Upper</div>
    </div>
    <div class="side-lab lab-stbd">stbd longitudinal<br>bulkhead</div>"""

new_band = """    <!-- main band -->
    <div class="side-lab lab-port">Port Longitudinal<br>bulkhead</div>
    <div class="band band-port">
      <div style="flex-direction:column; padding:0;"><select data-cg="struct" style="width:100%; border:0; border-bottom:1px dashed #000; text-align:center; appearance:none; font-size:13px; outline:none; background:transparent;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select><div style="flex:1; display:flex; align-items:center; justify-content:center;">Upper</div></div>
      <div style="flex-direction:column; padding:0;"><select data-cg="struct" style="width:100%; border:0; border-bottom:1px dashed #000; text-align:center; appearance:none; font-size:13px; outline:none; background:transparent;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select><div style="flex:1; display:flex; align-items:center; justify-content:center;">Lower</div></div>
    </div>
    <div class="band band-bs">
      <div style="flex-direction:column; padding:0;"><select data-cg="struct" style="width:100%; border:0; border-bottom:1px dashed #000; text-align:center; appearance:none; font-size:13px; outline:none; background:transparent;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select><div style="flex:1; display:flex; align-items:center; justify-content:center;">Hold Bottom</div></div>
    </div>
    <div class="band band-stbd">
      <div style="flex-direction:column; padding:0;"><select data-cg="struct" style="width:100%; border:0; border-bottom:1px dashed #000; text-align:center; appearance:none; font-size:13px; outline:none; background:transparent;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select><div style="flex:1; display:flex; align-items:center; justify-content:center;">Lower</div></div>
      <div style="flex-direction:column; padding:0;"><select data-cg="struct" style="width:100%; border:0; border-bottom:1px dashed #000; text-align:center; appearance:none; font-size:13px; outline:none; background:transparent;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select><div style="flex:1; display:flex; align-items:center; justify-content:center;">Upper</div></div>
    </div>
    <div class="side-lab lab-stbd">stbd longitudinal<br>bulkhead</div>"""

if old_band in html:
    html = html.replace(old_band, new_band)
else:
    print("Warning: old_band not found exactly!")

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'w', encoding='utf-8') as f:
    f.write(html)
