import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('const SUPABASE_URL = window.location.origin;', 'const SUPABASE_URL = "http://100.82.80.15:54321";')

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
