import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace hardcoded SUPA_URL and SUPA_KEY
old_config = """        // === SUPABASE CONFIG ===
        const SUPA_URL  = "http://100.82.80.15:54321";
        const SUPA_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
        const FORM_CODE = "001";"""

new_config = """        // === SUPABASE CONFIG ===
        let SUPA_URL  = "";
        let SUPA_KEY  = "";
        const FORM_CODE = "001";"""

html = html.replace(old_config, new_config)

# Update postMessage listener
old_msg = """        // === VESSEL LOCK (terima dari React via postMessage) ===
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'SET_VESSEL') {
                const sel = document.querySelector('.ship-select');
                const vLower = (e.data.vessel || '').toLowerCase().replace(/_/g,' ');
                Array.from(sel.options).forEach(opt => {
                    if (opt.value.toLowerCase().replace(/_/g,' ') === vLower) sel.value = opt.value;
                });
                if (e.data.locked) sel.disabled = true;
                loadFromSupabase();
            }
        });

        // Trigger load when vessel manually changed
        document.querySelector('.ship-select').addEventListener('change', loadFromSupabase);

        // Auto-load on start (for admin/SI who pick manually)
        window.addEventListener('load', () => {
            if (document.querySelector('.ship-select').value) loadFromSupabase();
        });"""

new_msg = """        // === INIT DATA FROM REACT (terima dari React via postMessage) ===
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'INIT_FORM') {
                SUPA_URL = e.data.supabaseUrl;
                SUPA_KEY = e.data.supabaseKey;
                
                const sel = document.querySelector('.ship-select');
                if (e.data.vessel) {
                    const vLower = (e.data.vessel || '').toLowerCase().replace(/_/g,' ');
                    Array.from(sel.options).forEach(opt => {
                        if (opt.value.toLowerCase().replace(/_/g,' ') === vLower) sel.value = opt.value;
                    });
                }
                if (e.data.locked) sel.disabled = true;
                
                if (sel.value) loadFromSupabase();
            }
        });

        // Trigger load when vessel manually changed
        document.querySelector('.ship-select').addEventListener('change', loadFromSupabase);"""

html = html.replace(old_msg, new_msg)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
