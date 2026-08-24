import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add Save button
btn_html = """        <div class="flex justify-end mb-6 no-print gap-4">
            <button onclick="saveToSupabase()" id="btn-save" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded flex items-center shadow transition-colors">
                💾 Simpan Data
            </button>
            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded flex items-center shadow transition-colors">"""

html = re.sub(r'<div class="flex justify-end mb-6 no-print">\s*<button onclick="window\.print\(\)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded flex items-center shadow">', btn_html, html)

# Add Supabase logic
script_html = """
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
        const SUPABASE_URL = window.location.origin;
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const FORM_CODE = "001";

        async function loadFromSupabase() {
            const vesselSelect = document.querySelector('.ship-select');
            const vesselName = vesselSelect.value;
            if (!vesselName) return;

            try {
                const { data, error } = await supabase
                    .from('smk_form_data')
                    .select('form_data')
                    .eq('vessel_name', vesselName)
                    .eq('form_code', FORM_CODE)
                    .single();
                
                if (data && data.form_data) {
                    const fd = data.form_data;
                    
                    // Fill header
                    const dateInput = document.querySelector('input[placeholder="DD-MM-YYYY"]');
                    if (dateInput && fd.report_date) dateInput.value = fd.report_date;
                    
                    const masterInput = document.querySelectorAll('input.border-b.border-black.text-center')[0];
                    if (masterInput && fd.master_name) masterInput.value = fd.master_name;

                    // Fill table rows
                    if (fd.rows && fd.rows.length > 0) {
                        const trs = document.querySelectorAll('#cert-tbody tr');
                        trs.forEach((tr, index) => {
                            const rowData = fd.rows[index];
                            if (!rowData) return;
                            const inputs = tr.querySelectorAll('input');
                            if (inputs[0]) inputs[0].value = rowData.issued_place || "";
                            if (inputs[1]) inputs[1].value = rowData.date_of_issued || "";
                            if (inputs[2]) inputs[2].value = rowData.expired_date || "";
                            if (inputs[3]) inputs[3].value = rowData.last_survey || "";
                            if (inputs[4]) inputs[4].value = rowData.next_survey || "";
                            if (inputs[5]) inputs[5].value = rowData.remarks || "";
                        });
                    }
                    
                    // Trigger input event to update title if needed
                    dateInput.dispatchEvent(new Event('input'));
                }
            } catch (err) {
                console.error("Gagal memuat data", err);
            }
        }

        async function saveToSupabase() {
            const vesselSelect = document.querySelector('.ship-select');
            const vesselName = vesselSelect.value;
            if (!vesselName) {
                alert("Pilih Kapal terlebih dahulu sebelum menyimpan!");
                return;
            }

            const btnSave = document.getElementById('btn-save');
            btnSave.innerText = "⏳ Menyimpan...";
            btnSave.disabled = true;

            const dateInput = document.querySelector('input[placeholder="DD-MM-YYYY"]');
            const masterInput = document.querySelectorAll('input.border-b.border-black.text-center')[0];
            
            const rowsData = [];
            const trs = document.querySelectorAll('#cert-tbody tr');
            trs.forEach(tr => {
                const inputs = tr.querySelectorAll('input');
                rowsData.push({
                    issued_place: inputs[0] ? inputs[0].value : "",
                    date_of_issued: inputs[1] ? inputs[1].value : "",
                    expired_date: inputs[2] ? inputs[2].value : "",
                    last_survey: inputs[3] ? inputs[3].value : "",
                    next_survey: inputs[4] ? inputs[4].value : "",
                    remarks: inputs[5] ? inputs[5].value : ""
                });
            });

            const formData = {
                report_date: dateInput ? dateInput.value : "",
                master_name: masterInput ? masterInput.value : "",
                rows: rowsData
            };

            try {
                const { error } = await supabase
                    .from('smk_form_data')
                    .upsert({
                        vessel_name: vesselName,
                        form_code: FORM_CODE,
                        form_data: formData,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'vessel_name, form_code' });
                
                if (error) throw error;
                
                btnSave.innerText = "✅ Tersimpan!";
                setTimeout(() => {
                    btnSave.innerHTML = "💾 Simpan Data";
                    btnSave.disabled = false;
                }, 2000);
            } catch (err) {
                console.error(err);
                alert("Gagal menyimpan data: " + err.message);
                btnSave.innerHTML = "💾 Simpan Data";
                btnSave.disabled = false;
            }
        }

        // Attach listener to load data when vessel changes
        document.querySelector('.ship-select').addEventListener('change', loadFromSupabase);
    </script>
</body>
"""

html = re.sub(r'</body>', script_html, html)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
