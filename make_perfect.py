import re

with open('public/smk-forms/084A_Ballast_Tank_Report.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Title and Form Code
html = html.replace('084A - Ballast Tank Condition Report (General)', '084C - Ballast Tank Condition Report (Void)')
html = html.replace('084-A&ensp;&mdash;&ensp;Ballast Tank Condition Report (General)', '084-C&ensp;&mdash;&ensp;Ballast Tank Condition Report (Void)')
html = html.replace('084A Ballast Tank Condition Report (General)', '084C Ballast Tank Condition Report (Void)')
html = html.replace('const FORM_CODE = "084A";', 'const FORM_CODE = "084C";')

# 2. Update CSS for grid rows
html = html.replace('.stack-fwd { grid-column:8/10; grid-row:2/5; }', '.stack-fwd { grid-column:8/10; grid-row:2/4; }')
html = html.replace('.stack-aft { grid-column:8/10; grid-row:7/10; }', '.stack-aft { grid-column:8/10; grid-row:8/10; }')

# 3. Completely replace xdiag content
new_xdiag = """  <!-- ==================== DIAGRAM : EXACT EXCEL GRID ==================== -->
  <div class="xd-wrap"><div class="xdiag">

    <div class="xd-cap">Tank Top /<br>Deck Head</div>

    <!-- fwd transfer bulkhead label -->
    <div class="fwd-label">Fwd transfer<br>bulkhead</div>

    <!-- fwd grade stack -->
    <div class="stackbox stack-fwd">
      <div class="sc"><div class="dd" style="flex:1;"><select data-cg="bulk"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div></div>
      <div class="sl">Upper</div>
      <div class="sc"><div class="dd" style="flex:1;"><select data-cg="bulk"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div></div>
      <div class="sl">Lower</div>
    </div>

    <!-- main band -->
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
    <div class="side-lab lab-stbd">stbd longitudinal<br>bulkhead</div>

    <!-- aft transfer bulkhead label + grade stack -->
    <div class="aft-label" style="grid-column:4/7; grid-row:8; font-size:12px; align-self:center; padding-left:4px; white-space:nowrap;">Aft transfer<br>bulkhead</div>
    <div class="stackbox stack-aft">
      <div class="sc"><div class="dd" style="flex:1;"><select data-cg="bulk"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div></div>
      <div class="sl">Lower</div>
      <div class="sc"><div class="dd" style="flex:1;"><select data-cg="bulk"><option value=""></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div></div>
      <div class="sl">Upper</div>
    </div>

  </div></div>"""

html = re.sub(r'<!-- ==================== DIAGRAM : EXACT EXCEL GRID.*?</select></div></div>\n      <div class="sl">Upper</div>\n    </div>\n\n  </div></div>', new_xdiag, html, flags=re.DOTALL)

# 4. Completely replace sf-wrap content (Tables)
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
  </div>"""

html = re.sub(r'<!-- ==================== STRUCTURE / FITTINGS \(Excel rows 30-39\) ==================== -->.*?</table>\n  </div>', new_sf_wrap, html, flags=re.DOTALL)

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'w', encoding='utf-8') as f:
    f.write(html)

