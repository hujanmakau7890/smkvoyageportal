import re

with open('public/smk-forms/084D_Ballast_Tank_Report_APT.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the absolute grid
new_diagram = """  <!-- ==================== DIAGRAM : EXACT GRID FROM EXCEL ==================== -->
  <style>
      .apt-grid {
          display: grid;
          grid-template-columns: repeat(16, 1fr);
          grid-template-rows: repeat(16, 30px); /* 16 rows, approx 30px height each */
          gap: 0;
          min-width: 800px;
          max-width: 1000px;
          margin: 20px auto;
          font-size: 11px;
          font-weight: bold;
          position: relative;
          background: #fff;
          border: 1px solid #000;
          padding: 20px;
      }
      .apt-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
      }
      .apt-sel {
          width: 100%;
          height: 100%;
          border: 1px solid #000;
          background: transparent;
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          outline: none;
      }
  </style>

  <div class="xd-wrap" style="overflow-x:auto; margin-bottom: 20px;">
    <div class="apt-grid">
        <!-- SVG Drawing for Braces and Lines (Simulating Excel Shapes) -->
        <svg style="position: absolute; top: 20px; left: 20px; width: calc(100% - 40px); height: calc(100% - 40px); pointer-events: none;">
            <!-- Left Brace 16 (Rows 10-12, Col 7) -->
            <path d="M 40% 10% Q 38% 10% 38% 15% T 36% 20% Q 38% 25% 38% 30% T 40% 30%" fill="none" stroke="#000" stroke-width="2"/>
            <!-- Left Brace 15 (Rows 15-17, Col 7) -->
            <path d="M 40% 45% Q 38% 45% 38% 50% T 36% 55% Q 38% 60% 38% 65% T 40% 65%" fill="none" stroke="#000" stroke-width="2"/>
            <!-- Right Brace 6 (Rows 17-22, Col 14) -->
            <path d="M 85% 60% Q 87% 60% 87% 70% T 89% 80% Q 87% 90% 87% 95% T 85% 95%" fill="none" stroke="#000" stroke-width="2"/>
            
            <!-- Lines representing the hull shape -->
            <!-- Top slope -->
            <line x1="55%" y1="5%" x2="62%" y2="40%" stroke="#000" stroke-width="2"/>
            <line x1="45%" y1="10%" x2="52%" y2="45%" stroke="#000" stroke-width="2"/>
            <!-- Bottom slope -->
            <line x1="45%" y1="60%" x2="55%" y2="90%" stroke="#000" stroke-width="2"/>
            <line x1="60%" y1="60%" x2="70%" y2="90%" stroke="#000" stroke-width="2"/>
        </svg>

        <!-- Row 9 (Index 1) -->
        <div class="apt-cell" style="grid-column: 10; grid-row: 1;">Aft</div>

        <!-- Row 10 (Index 2) -->
        <div class="apt-cell" style="grid-column: 7 / 9; grid-row: 2; justify-content: flex-end; padding-right: 10px;">Tank Top /</div>
        <div class="apt-cell" style="grid-column: 10; grid-row: 2 / 5; padding: 5px;">
            <select data-cg="struct" class="apt-sel"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 11 (Index 3) -->
        <div class="apt-cell" style="grid-column: 7 / 9; grid-row: 3; justify-content: flex-end; padding-right: 10px;">Deck head</div>

        <!-- Row 12 (Index 4) -->
        
        <!-- Row 13 (Index 5) -->
        <div class="apt-cell" style="grid-column: 10; grid-row: 5;">Fwd</div>

        <!-- Row 14 (Index 6) -->
        <div class="apt-cell" style="grid-column: 9; grid-row: 6;">Upper</div>

        <!-- Row 15 (Index 7) -->
        <div class="apt-cell" style="grid-column: 7 / 9; grid-row: 7; justify-content: flex-end; padding-right: 10px;">Forward bulkhead</div>
        <div class="apt-cell" style="grid-column: 9 / 12; grid-row: 7 / 9; padding: 5px;">
            <select data-cg="bulk" class="apt-sel"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 16 (Index 8) -->

        <!-- Row 17 (Index 9) -->
        <div class="apt-cell" style="grid-column: 9; grid-row: 9;">Lower</div>

        <!-- Row 18 (Index 10) -->
        <div class="apt-cell" style="grid-column: 6 / 9; grid-row: 10; padding: 5px;">
            <select data-cg="struct" class="apt-sel"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>
        <div class="apt-cell" style="grid-column: 10; grid-row: 10;">Fwd</div>
        <div class="apt-cell" style="grid-column: 12 / 15; grid-row: 10; padding: 5px;">
            <select data-cg="struct" class="apt-sel"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 19 (Index 11) -->
        <div class="apt-cell" style="grid-column: 6; grid-row: 11;">Upper</div>
        <div class="apt-cell" style="grid-column: 8; grid-row: 11;">Lower</div>
        <div class="apt-cell" style="grid-column: 10; grid-row: 11 / 14; padding: 5px;">
            <select data-cg="struct" class="apt-sel"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>
        <div class="apt-cell" style="grid-column: 12; grid-row: 11;">Lower</div>
        <div class="apt-cell" style="grid-column: 13; grid-row: 11;">Upper</div>

        <!-- Row 20 (Index 12) -->
        <div class="apt-cell" style="grid-column: 3 / 6; grid-row: 12; justify-content: flex-end; padding-right: 10px;">Port Side Shell</div>
        <div class="apt-cell" style="grid-column: 14 / 17; grid-row: 12; justify-content: flex-start; padding-left: 10px;">Stbd Side Shell</div>

        <!-- Row 21 (Index 13) -->

        <!-- Row 22 (Index 14) -->
        <div class="apt-cell" style="grid-column: 10; grid-row: 14;">Aft</div>

        <!-- Row 23 (Index 15) -->
        <div class="apt-cell" style="grid-column: 8 / 10; grid-row: 15; justify-content: flex-end; padding-right: 10px;">Aft transom</div>
        <div class="apt-cell" style="grid-column: 10; grid-row: 15 / 17; padding: 5px;">
            <select data-cg="bulk" class="apt-sel"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 24 (Index 16) -->
        <div class="apt-cell" style="grid-column: 8 / 10; grid-row: 16; justify-content: flex-end; padding-right: 10px;">Bulkhead</div>

    </div>
  </div>\n"""

# Replace the diagram area
html = re.sub(r'<!-- ==================== DIAGRAM ==================== -->.*?<!-- ==================== STRUCTURE / FITTINGS', new_diagram + '  <!-- ==================== STRUCTURE / FITTINGS', html, flags=re.DOTALL)

with open('public/smk-forms/084D_Ballast_Tank_Report_APT.html', 'w', encoding='utf-8') as f:
    f.write(html)
