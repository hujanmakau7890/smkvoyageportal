import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change tr.style.backgroundColor to applying to all inputs in the row
old_logic = """                if (expDate) {
                    if (expDate <= nextMonth) {
                        tr.style.backgroundColor = '#fbcfe8'; // Merah muda / Pink
                    } else {
                        tr.style.backgroundColor = '';
                    }
                } else {
                    tr.style.backgroundColor = '';
                }"""

new_logic = """                const allInputs = tr.querySelectorAll('input');
                if (expDate) {
                    if (expDate <= nextMonth) {
                        tr.style.backgroundColor = '#fbcfe8';
                        allInputs.forEach(inp => inp.style.backgroundColor = '#fbcfe8');
                    } else {
                        tr.style.backgroundColor = '';
                        allInputs.forEach(inp => inp.style.backgroundColor = '');
                    }
                } else {
                    tr.style.backgroundColor = '';
                    allInputs.forEach(inp => inp.style.backgroundColor = '');
                }"""

html = html.replace(old_logic, new_logic)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
