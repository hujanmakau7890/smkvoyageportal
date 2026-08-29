import re

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Title and Form Code
html = html.replace('084A - Ballast Tank Condition Report (General)', '084C - Ballast Tank Condition Report (Void)')
html = html.replace('084-A&ensp;&mdash;&ensp;Ballast Tank Condition Report (General)', '084-C&ensp;&mdash;&ensp;Ballast Tank Condition Report (Void)')
html = html.replace('084A Ballast Tank Condition Report (General)', '084C Ballast Tank Condition Report (Void)')
html = html.replace('const FORM_CODE = "084A";', 'const FORM_CODE = "084C";')

# 2. Unified Grid Diagram
new_diagram = """  <!-- ==================== DIAGRAM ==================== -->
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
  </div>\n"""

# Replace exact chunk
html = re.sub(r'<!-- ==================== DIAGRAM : EXACT EXCEL GRID.*?<!-- ==================== STRUCTURE / FITTINGS', new_diagram + '  <!-- ==================== STRUCTURE / FITTINGS', html, flags=re.DOTALL)


# 3. Completely replace sf-wrap content (Tables)
new_sf_wrap = """  <!-- ==================== STRUCTURE / FITTINGS ==================== -->
  <div class="sf-wrap">
    <table class="tbl">
      <tr><th>TANK STRUCTURE</th><th style="width:56px;">GRADE</th></tr>
      <tr><td>Tank Bottom</td><td class="g"><select data-cg="struct"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Port Longitudinals Bulkhead</td><td class="g"><select data-cg="struct"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Stbd Longitudinal Bulkhead</td><td class="g"><select data-cg="struct"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Fwd Transverse Bulkhead</td><td class="g"><select data-cg="struct"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Aft Transverse Bulkhead</td><td class="g"><select data-cg="struct"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Tank Top</td><td class="g"><select data-cg="struct"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td style="height:27px;"></td><td class="g"></td></tr>
      <tr><td style="height:27px;"></td><td class="g"></td></tr>
      <tr><td style="height:27px;"></td><td class="g"></td></tr>
    </table>
    <table class="tbl">
      <tr><th>TANK FITTINGS</th><th style="width:56px;">GRADE</th></tr>
      <tr><td>Manhole Cover</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Tank Vent Pipes / Vent Heads</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Sound Pipe / Cap / Striker plate</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Tank remote gauging system</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Suct / Delivery Pipe/ Valve / Mounth</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Ladders and Platforms</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td>Other Internal Piping</td><td class="g"><select data-cg="fit"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></td></tr>
      <tr><td style="height:27px;"></td><td class="g"></td></tr>
      <tr><td style="height:27px;"></td><td class="g"></td></tr>
    </table>
  </div>\n"""

html = re.sub(r'<!-- ==================== STRUCTURE / FITTINGS \(Excel rows 30-39\) ==================== -->.*?</table>\n  </div>', new_sf_wrap, html, flags=re.DOTALL)


with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'w', encoding='utf-8') as f:
    f.write(html)

