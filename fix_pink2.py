import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_event = """        document.addEventListener('input', function(e) {
            if (e.target && e.target.tagName === 'INPUT') {
                checkExpiryDates();
            }
        });"""

new_event = """        ['input', 'change', 'keyup'].forEach(evt => {
            document.addEventListener(evt, function(e) {
                if (e.target && e.target.tagName === 'INPUT') {
                    checkExpiryDates();
                }
            });
        });"""

html = html.replace(old_event, new_event)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
