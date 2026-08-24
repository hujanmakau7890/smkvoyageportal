import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_logic = """                const allInputs = tr.querySelectorAll('input');
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

new_logic = """                const allInputs = tr.querySelectorAll('input');
                const allTds = tr.querySelectorAll('td');
                if (expDate) {
                    if (expDate <= nextMonth) {
                        tr.style.backgroundColor = '#fbcfe8';
                        allTds.forEach(td => td.style.backgroundColor = '#fbcfe8');
                        allInputs.forEach(inp => { inp.style.backgroundColor = '#fbcfe8'; inp.classList.remove('focus:bg-gray-50'); });
                    } else {
                        tr.style.backgroundColor = '';
                        allTds.forEach(td => td.style.backgroundColor = '');
                        allInputs.forEach(inp => { inp.style.backgroundColor = ''; inp.classList.add('focus:bg-gray-50'); });
                    }
                } else {
                    tr.style.backgroundColor = '';
                    allTds.forEach(td => td.style.backgroundColor = '');
                    allInputs.forEach(inp => { inp.style.backgroundColor = ''; inp.classList.add('focus:bg-gray-50'); });
                }"""

html = html.replace(old_logic, new_logic)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
