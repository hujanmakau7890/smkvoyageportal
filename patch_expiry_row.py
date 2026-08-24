import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change expInput.style.backgroundColor to tr.style.backgroundColor
# and maybe keep expInput as well, or just do the tr (which implies all inputs in it might be transparent).
# Wait, inputs have their own white background? Let's check td input in CSS.
# `td input` doesn't have a background set explicitly, but it has `focus:bg-gray-50`.
# If I set `tr.style.backgroundColor`, the inputs might still be white if they have `bg-white`?
# Actually, the inputs only have class="${inputClass}" which is "w-full focus:bg-gray-50".
# No `bg-white`! So setting `tr.style.backgroundColor` will color the whole row nicely.

html = html.replace("expInput.style.backgroundColor = '#fbcfe8';", "tr.style.backgroundColor = '#fbcfe8';")
html = html.replace("expInput.style.backgroundColor = '';", "tr.style.backgroundColor = '';")

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
