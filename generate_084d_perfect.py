import re

new_diagram = """
  <!-- ==================== DIAGRAM : ABSOLUTE EXCEL REPLICA ==================== -->
  <style>
      .excel-grid {
          position: relative;
          width: 960px; /* 16 cols * 60px */
          height: 380px; /* 19 rows (8 to 26) * 20px */
          margin: 20px auto;
          background: #fff;
          font-family: Arial, sans-serif;
          font-size: 11px;
          border: 1px solid #ddd;
      }
      .cell {
          position: absolute;
          display: flex;
          align-items: center;
          white-space: nowrap;
      }
      .dropdown-box {
          position: absolute;
          border: 1px solid #000;
          background: #fff;
          z-index: 10;
      }
      .dropdown-box select {
          width: 100%;
          height: 100%;
          border: 0;
          outline: none;
          background: transparent;
          text-align: center;
          font-weight: bold;
          font-size: 12px;
          appearance: none;
      }
      .svg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
      }
  </style>

  <div class="xd-wrap" style="overflow-x:auto; margin-bottom: 20px;">
    <div class="excel-grid">
        
        <!-- SVG DRAWINGS (Matching Excel Shapes) -->
        <svg class="svg-overlay">
            <!-- Left Brace 16 (Col 7, Row 8-12) -->
            <!-- Col 7 is X=420 (7*60). Row 8 is Y=0 (since grid starts at Row 8). Row 12 is Y=80. -->
            <path d="M 430,0 Q 420,0 420,20 T 410,40 Q 420,60 420,80 T 430,80" fill="none" stroke="#000" stroke-width="1.5"/>
            
            <!-- Left Brace 15 (Col 7, Row 13-16) -->
            <!-- Row 13 is Y=100. Row 16 is Y=160. -->
            <path d="M 430,100 Q 420,100 420,115 T 410,130 Q 420,145 420,160 T 430,160" fill="none" stroke="#000" stroke-width="1.5"/>
            
            <!-- Right Brace 6 (Col 14, Row 17-22) -->
            <!-- Col 14 is X=840. Row 17 is Y=180. Row 22 is Y=280. -->
            <!-- Right brace bulges to the right -->
            <path d="M 830,180 Q 840,180 840,205 T 850,230 Q 840,255 840,280 T 830,280" fill="none" stroke="#000" stroke-width="1.5"/>

            <!-- Connector 8 (Col 9 R7 -> Col 10 R13) -->
            <!-- Col 9 is X=540. Row 7 is Y=-20. Col 10 is X=600. Row 13 is Y=100. -->
            <line x1="540" y1="0" x2="600" y2="100" stroke="#000" stroke-width="1.5"/>

            <!-- Connector 9 (Col 8 R8 -> Col 9 R13) -->
            <line x1="480" y1="0" x2="540" y2="100" stroke="#000" stroke-width="1.5"/>

            <!-- Connector 13 (Col 8 R17 -> Col 9 R21) -->
            <line x1="480" y1="180" x2="540" y2="260" stroke="#000" stroke-width="1.5"/>

            <!-- Connector 14 (Col 10 R17 -> Col 11 R21) -->
            <line x1="600" y1="180" x2="660" y2="260" stroke="#000" stroke-width="1.5"/>
        </svg>

        <!-- TEXT LABELS & DROPDOWNS -->
        <!-- Offset calculation: Col N -> left = (N-1)*60px. Row N -> top = (N-8)*20px. -->

        <!-- Row 9 -->
        <div class="cell" style="left: 540px; top: 20px; width: 60px; justify-content: center;">Aft</div>
        
        <!-- Row 10 -->
        <div class="cell" style="left: 360px; top: 40px; width: 120px; justify-content: flex-end; padding-right:5px;">Tank Top /</div>
        
        <!-- Row 11 -->
        <div class="cell" style="left: 360px; top: 60px; width: 120px; justify-content: flex-end; padding-right:5px;">Deck head</div>
        
        <!-- Dropdown J10:J12 (Col 10, Row 10-12) -->
        <div class="dropdown-box" style="left: 550px; top: 40px; width: 60px; height: 50px;">
            <select data-cg="struct"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 13 -->
        <div class="cell" style="left: 540px; top: 100px; width: 60px; justify-content: center;">Fwd</div>
        
        <!-- Row 14 -->
        <div class="cell" style="left: 480px; top: 120px; width: 60px; justify-content: center;">Upper</div>
        
        <!-- Row 15 -->
        <div class="cell" style="left: 300px; top: 140px; width: 120px; justify-content: flex-end; padding-right:5px;">Forward bulkhead</div>
        
        <!-- Dropdown I15:K16 (Col 9-11, Row 15-16) -->
        <div class="dropdown-box" style="left: 490px; top: 140px; width: 160px; height: 35px;">
            <select data-cg="bulk"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 17 -->
        <div class="cell" style="left: 480px; top: 180px; width: 60px; justify-content: center;">Lower</div>

        <!-- Row 18 -->
        <div class="cell" style="left: 540px; top: 200px; width: 60px; justify-content: center;">Fwd</div>

        <!-- Row 19 -->
        <!-- Port Side: Upper (Col 6), Lower (Col 8) -->
        <div class="cell" style="left: 300px; top: 220px; width: 60px; justify-content: center;">Upper</div>
        <div class="cell" style="left: 420px; top: 220px; width: 60px; justify-content: center;">Lower</div>
        
        <!-- Dropdown F18:H18 (Col 6-8, Row 18) -->
        <div class="dropdown-box" style="left: 300px; top: 195px; width: 160px; height: 25px;">
            <select data-cg="struct"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Stbd Side: Lower (Col 12), Upper (Col 13) -->
        <div class="cell" style="left: 660px; top: 220px; width: 60px; justify-content: center;">Lower</div>
        <div class="cell" style="left: 720px; top: 220px; width: 60px; justify-content: center;">Upper</div>
        
        <!-- Dropdown L18:N18 (Col 12-14, Row 18) -->
        <div class="dropdown-box" style="left: 660px; top: 195px; width: 160px; height: 25px;">
            <select data-cg="struct"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 20 -->
        <div class="cell" style="left: 60px; top: 240px; width: 120px; justify-content: flex-end; padding-right:5px;">Port Side Shell</div>
        <div class="cell" style="left: 840px; top: 240px; width: 120px; justify-content: flex-start; padding-left:5px;">Stbd Side Shell</div>

        <!-- Row 22 -->
        <div class="cell" style="left: 540px; top: 280px; width: 60px; justify-content: center;">Aft</div>

        <!-- Row 23 -->
        <div class="cell" style="left: 360px; top: 300px; width: 120px; justify-content: flex-end; padding-right:5px;">Aft transom</div>
        
        <!-- Dropdown J23:J24 (Col 10, Row 23-24) -->
        <div class="dropdown-box" style="left: 550px; top: 300px; width: 60px; height: 35px;">
            <select data-cg="bulk"><option></option><option>1</option><option>2</option><option>3</option><option>NS</option></select>
        </div>

        <!-- Row 24 -->
        <div class="cell" style="left: 360px; top: 320px; width: 120px; justify-content: flex-end; padding-right:5px;">Bulkhead</div>

    </div>
  </div>
"""

with open('public/smk-forms/084D_Ballast_Tank_Report_APT.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the diagram area
html = re.sub(r'<!-- ==================== DIAGRAM : EXACT GRID FROM EXCEL ==================== -->.*?<!-- ==================== STRUCTURE / FITTINGS', new_diagram + '\n  <!-- ==================== STRUCTURE / FITTINGS', html, flags=re.DOTALL)

with open('public/smk-forms/084D_Ballast_Tank_Report_APT.html', 'w', encoding='utf-8') as f:
    f.write(html)
