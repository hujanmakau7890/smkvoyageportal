import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

bad_css = """      .top { grid-template-columns: 1fr; text-align: center; gap: 8px; }
      .st { align-items: center; }
      .info-grid { grid-template-columns: 1fr; gap: 12px; }
      .item { flex-direction: column; align-items: flex-start; gap: 4px; }
      .item label { width: 100%; flex-direction: row; justify-content: flex-start; align-items: baseline; gap: 6px; white-space: normal; }
      .item input, .item select { width: 100%; flex: none; }
      .footer-grid { grid-template-columns: 1fr; gap: 30px; }
      .page { padding: 10px; overflow-x: hidden; width: 100%; }
      .tbl-container { width: 100%; max-width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }
      .tbl { min-width: 600px; }
    }"""

good_css = """            .table-responsive {
                overflow-x: auto;
                display: block;
                width: 100%;
            }"""

html = html.replace(bad_css, good_css)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
