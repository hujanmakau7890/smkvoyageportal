import re

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_diagram = """
  <!-- ==================== DIAGRAM : UNIFIED GRID ==================== -->
  <style>
      .v-grid { display: grid; grid-template-columns: 120px repeat(5, 1fr) 120px; gap: 0; min-width: 750px; font-size: 12px; margin: 20px auto; max-width: 900px; align-items: stretch; }
      
      .v-tt-drop { grid-column: 4; display: flex; border: 2px solid #000; height: 30px; margin-bottom: 20px; }
      .v-tt-lab  { grid-column: 5 / 7; display: flex; align-items: center; font-weight: bold; padding-left: 10px; margin-bottom: 20px; }
      
      .v-fwd-lab { grid-column: 2 / 4; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-weight: bold; text-align: right; }
      .v-fwd-stk { grid-column: 4; border: 2px solid #000; border-bottom: 0; display: flex; flex-direction: column; }
      
      .v-port-lab { grid-column: 1; display: flex; align-items: flex-end; justify-content: center; font-weight: bold; text-align: center; padding-right:10px; padding-bottom: 5px; }
      .v-stbd-lab { grid-column: 7; display: flex; align-items: flex-end; justify-content: center; font-weight: bold; text-align: center; padding-left:10px; padding-bottom: 5px; }
      
      .v-band-item { border: 2px solid #000; border-right: 0; height: 60px; display: flex; flex-direction: column; }
      .v-band-item.last { border-right: 2px solid #000; }
      
      .v-aft-lab { grid-column: 2 / 4; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-weight: bold; text-align: right; }
      .v-aft-stk { grid-column: 4; border: 2px solid #000; border-top: 0; display: flex; flex-direction: column; }
      
      .v-sel { width: 100%; flex: 1; border: 0; background: transparent; text-align: center; font-size: 13px; font-family: inherit; outline: none; }
      .v-txt { height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border-top: 1px dashed #000; }
      .v-txt-side { width: 50px; display: flex; align-items: center; justify-content: center; font-size: 12px; border-left: 1px dashed #000; }
      
      .v-row-flex { display: flex; flex: 1; border-bottom: 1px dashed #000; }
      .v-row-flex:last-child { border-bottom: 0; }
  </style>

  <div class="xd-wrap" style="background:#fff; padding:20px; overflow-x:auto; margin-bottom: 20px; border: 1px solid #000;">
    <div class="v-grid">
        <!-- Row 1: Tank Top -->
        <div class="v-tt-drop"><select class="v-sel" data-cg="struct" id="tt_drop"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
        <div class="v-tt-lab">Tank Top /<br>Deck Head</div>

        <!-- Row 2: Fwd Bulkhead -->
        <div class="v-fwd-lab">Fwd transfer<br>bulkhead</div>
        <div class="v-fwd-stk">
            <div class="v-row-flex">
                <select class="v-sel" data-cg="bulk" id="fwd_u"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                <div class="v-txt-side">Upper</div>
            </div>
            <div class="v-row-flex">
                <select class="v-sel" data-cg="bulk" id="fwd_l"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                <div class="v-txt-side">Lower</div>
            </div>
        </div>

        <!-- Row 3: Main Band -->
        <div class="v-port-lab">Port Longitudinal<br>bulkhead</div>
        <div class="v-band-item" style="grid-column: 2;">
            <select class="v-sel" data-cg="struct" id="pt_u"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
            <div class="v-txt">Upper</div>
        </div>
        <div class="v-band-item" style="grid-column: 3;">
            <select class="v-sel" data-cg="struct" id="pt_l"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
            <div class="v-txt">Lower</div>
        </div>
        <div class="v-band-item" style="grid-column: 4;">
            <select class="v-sel" data-cg="struct" id="hb"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
            <div class="v-txt">Hold Bottom</div>
        </div>
        <div class="v-band-item" style="grid-column: 5;">
            <select class="v-sel" data-cg="struct" id="sb_l"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
            <div class="v-txt">Lower</div>
        </div>
        <div class="v-band-item last" style="grid-column: 6;">
            <select class="v-sel" data-cg="struct" id="sb_u"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
            <div class="v-txt">Upper</div>
        </div>
        <div class="v-stbd-lab">stbd longitudinal<br>bulkhead</div>

        <!-- Row 4: Aft Bulkhead -->
        <div class="v-aft-lab">Aft transfer<br>bulkhead</div>
        <div class="v-aft-stk">
            <div class="v-row-flex">
                <select class="v-sel" data-cg="bulk" id="aft_l"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                <div class="v-txt-side">Lower</div>
            </div>
            <div class="v-row-flex">
                <select class="v-sel" data-cg="bulk" id="aft_u"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
                <div class="v-txt-side">Upper</div>
            </div>
        </div>
    </div>
  </div>
"""

# Find from <!-- ==================== DIAGRAM : FLEXBOX EXACT ==================== --> to the end of the div
html = re.sub(r'<!-- ==================== DIAGRAM : FLEXBOX EXACT ==================== -->.*?</div>\s*</div>', new_diagram, html, flags=re.DOTALL)

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'w', encoding='utf-8') as f:
    f.write(html)
