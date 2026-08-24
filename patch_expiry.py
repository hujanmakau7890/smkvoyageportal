import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to add the checkExpiryDates logic inside the script tag.
# I will append it before the loadFromSupabase function.

script_to_add = """
        function parseDateDDMMYYYY(dateStr) {
            if (!dateStr) return null;
            const parts = dateStr.split('-');
            if (parts.length !== 3) return null;
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
            return new Date(y, m, d);
        }

        function checkExpiryDates() {
            const today = new Date();
            today.setHours(0,0,0,0);
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);

            const trs = document.querySelectorAll('#cert-tbody tr');
            trs.forEach(tr => {
                const inputs = tr.querySelectorAll('input');
                if (inputs.length < 3) return;
                const expInput = inputs[2]; // Expired Date is the 3rd input in the row

                const dateVal = expInput.value;
                const expDate = parseDateDDMMYYYY(dateVal);

                if (expDate) {
                    if (expDate <= nextMonth) {
                        expInput.style.backgroundColor = '#fbcfe8'; // Merah muda / Pink
                    } else {
                        expInput.style.backgroundColor = '';
                    }
                } else {
                    expInput.style.backgroundColor = '';
                }
            });
        }

        // Attach event listeners to all inputs to check live typing
        document.addEventListener('input', function(e) {
            if (e.target && e.target.tagName === 'INPUT') {
                checkExpiryDates();
            }
        });
"""

html = html.replace('async function loadFromSupabase() {', script_to_add + '\n        async function loadFromSupabase() {')

# Also add checkExpiryDates() at the end of loadFromSupabase() success block
html = html.replace("dateInput.dispatchEvent(new Event('input'));", "dateInput.dispatchEvent(new Event('input'));\n                    checkExpiryDates();")

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
