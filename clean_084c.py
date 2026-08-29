import re

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_diagram = """
  <!-- ==================== DIAGRAM ==================== -->
  <div class="xd-wrap">
    <div class="xdiag-c">
      
      <div class="xd-top">Tank Top /<br>Deck Head</div>
      
      <div class="xd-fwd">
        <div class="xd-label">Fwd transfer<br>bulkhead</div>
        <div class="xd-stack">
          <div class="xd-stack-row">
            <div class="xd-select-box"><select id="dg_fwd_u" data-cg="bulk"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
            <div class="xd-stack-text">Upper</div>
          </div>
          <div class="xd-stack-row">
            <div class="xd-select-box"><select id="dg_fwd_l" data-cg="bulk"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
            <div class="xd-stack-text">Lower</div>
          </div>
        </div>
      </div>
      
      <div class="xd-mid">
        <div class="xd-side-label">Port Longitudinal<br>bulkhead</div>
        <div class="xd-band-wrap">
          <div class="xd-band-item">Upper</div>
          <div class="xd-band-item">Lower</div>
          <div class="xd-band-item">Hold Bottom</div>
          <div class="xd-band-item">Lower</div>
          <div class="xd-band-item">Upper</div>
        </div>
        <div class="xd-side-label">stbd longitudinal<br>bulkhead</div>
      </div>
      
      <div class="xd-aft">
        <div class="xd-label">Aft transfer<br>bulkhead</div>
        <div class="xd-stack">
          <div class="xd-stack-row">
            <div class="xd-select-box"><select id="dg_aft_l" data-cg="bulk"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
            <div class="xd-stack-text">Lower</div>
          </div>
          <div class="xd-stack-row">
            <div class="xd-select-box"><select id="dg_aft_u" data-cg="bulk"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select></div>
            <div class="xd-stack-text">Upper</div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
"""

# Replace anything from "<!-- ==================== DIAGRAM" up to the structure wrapping div
html = re.sub(r'<!-- ==================== DIAGRAM.*?<div class="sf-wrap">', new_diagram + '\n  <div class="sf-wrap">', html, flags=re.DOTALL)

with open('public/smk-forms/084C_Ballast_Tank_Report_Void.html', 'w', encoding='utf-8') as f:
    f.write(html)
