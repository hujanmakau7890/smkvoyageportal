import re

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the entire xdiag-wrap with the new flexbox version
new_diagram = """
  <!-- ==================== DIAGRAM : FLEXBOX EXACT ==================== -->
  <div class="xd-wrap" style="background: #fff; padding: 20px; overflow-x: auto; margin-bottom: 20px;">
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%; min-width: 600px; max-width: 800px; margin: 0 auto; gap: 0;">
        
        <!-- Top Row: Tank Top -->
        <div style="display: flex; align-items: center; justify-content: flex-end; width: 100%; margin-bottom: 20px; padding-right: 50px;">
            <!-- Dropdown -->
            <div style="display: flex; border: 2px solid #000; width: 60px; height: 30px;">
                <select id="tt_drop" data-cg="struct" style="width:100%; border:0; outline:none; text-align:center; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
            </div>
            <!-- Label -->
            <div style="margin-left: 10px; font-size: 12px; font-weight: bold; width: 120px; text-align: center;">Tank Top /<br>Deck Head</div>
        </div>

        <!-- Fwd Transfer Bulkhead -->
        <div style="display: flex; align-items: center; width: 100%; justify-content: center; margin-bottom: 0;">
            <div style="font-size: 12px; font-weight: bold; text-align: right; margin-right: 10px;">Fwd transfer<br>bulkhead</div>
            <div style="display: flex; flex-direction: column; border: 2px solid #000; border-bottom: 0; width: 120px;">
                <div style="display: flex; border-bottom: 1px dashed #000;">
                    <div style="flex: 1; border-right: 1px dashed #000;"><select id="fwd_u" data-cg="bulk" style="width:100%; border:0; outline:none; text-align:center; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
                    <div style="width: 55px; text-align: center; font-size: 12px; padding: 4px;">Upper</div>
                </div>
                <div style="display: flex; border-bottom: 0;">
                    <div style="flex: 1; border-right: 1px dashed #000;"><select id="fwd_l" data-cg="bulk" style="width:100%; border:0; outline:none; text-align:center; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
                    <div style="width: 55px; text-align: center; font-size: 12px; padding: 4px;">Lower</div>
                </div>
            </div>
        </div>

        <!-- Main Band (Merapat) -->
        <div style="display: flex; width: 100%; align-items: flex-end; margin: 0;">
            <div style="font-size: 12px; font-weight: bold; text-align: center; width: 120px; margin-right: 10px;">Port Longitudinal<br>bulkhead</div>
            
            <div style="display: flex; flex: 1; border: 2px solid #000; height: 60px;">
                <div style="flex: 1; border-right: 1px dashed #000; display: flex; flex-direction: column;">
                    <select id="pt_u" data-cg="struct" style="flex: 1; border:0; border-bottom: 1px dashed #000; text-align:center; outline:none; background:transparent; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight:bold;">Upper</div>
                </div>
                <div style="flex: 1; border-right: 1px dashed #000; display: flex; flex-direction: column;">
                    <select id="pt_l" data-cg="struct" style="flex: 1; border:0; border-bottom: 1px dashed #000; text-align:center; outline:none; background:transparent; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight:bold;">Lower</div>
                </div>
                <div style="flex: 1; border-right: 1px dashed #000; display: flex; flex-direction: column;">
                    <select id="hb" data-cg="struct" style="flex: 1; border:0; border-bottom: 1px dashed #000; text-align:center; outline:none; background:transparent; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight:bold;">Hold Bottom</div>
                </div>
                <div style="flex: 1; border-right: 1px dashed #000; display: flex; flex-direction: column;">
                    <select id="sb_l" data-cg="struct" style="flex: 1; border:0; border-bottom: 1px dashed #000; text-align:center; outline:none; background:transparent; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight:bold;">Lower</div>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <select id="sb_u" data-cg="struct" style="flex: 1; border:0; border-bottom: 1px dashed #000; text-align:center; outline:none; background:transparent; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight:bold;">Upper</div>
                </div>
            </div>
            
            <div style="font-size: 12px; font-weight: bold; text-align: center; width: 120px; margin-left: 10px;">stbd longitudinal<br>bulkhead</div>
        </div>

        <!-- Aft Transfer Bulkhead -->
        <div style="display: flex; align-items: center; width: 100%; justify-content: center; margin-top: 0;">
            <div style="font-size: 12px; font-weight: bold; text-align: right; margin-right: 10px;">Aft transfer<br>bulkhead</div>
            <div style="display: flex; flex-direction: column; border: 2px solid #000; border-top: 0; width: 120px;">
                <div style="display: flex; border-bottom: 1px dashed #000;">
                    <div style="flex: 1; border-right: 1px dashed #000;"><select id="aft_l" data-cg="bulk" style="width:100%; border:0; outline:none; text-align:center; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
                    <div style="width: 55px; text-align: center; font-size: 12px; padding: 4px;">Lower</div>
                </div>
                <div style="display: flex; border-bottom: 0;">
                    <div style="flex: 1; border-right: 1px dashed #000;"><select id="aft_u" data-cg="bulk" style="width:100%; border:0; outline:none; text-align:center; font-size: 13px;"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
                    <div style="width: 55px; text-align: center; font-size: 12px; padding: 4px;">Upper</div>
                </div>
            </div>
        </div>

    </div>
  </div>
"""

# Find the start of xd-wrap and end of it.
# In the current file, xd-wrap goes from <div class="xd-wrap"> to </div></div>
# Let's just use a robust regex to replace it
html = re.sub(r'<div class="xd-wrap">.*?</div></div>', new_diagram, html, flags=re.DOTALL)

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'w', encoding='utf-8') as f:
    f.write(html)
