import re

with open('src/components/SMKReportFormPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_post = """      // Send vessel info to iframe for auto-select & lock
      setTimeout(() => {
        try {
          if (userVessel) {
            iframe.contentWindow.postMessage({ type: 'SET_VESSEL', vessel: userVessel, locked: true }, '*');
          }
        } catch(e) { /* ignore */ }
      }, 300);"""

new_post = """      // Send config and vessel info to iframe for auto-select & lock
      setTimeout(() => {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://api.voyageportal.my.id";
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
          iframe.contentWindow.postMessage({ 
            type: 'INIT_FORM', 
            vessel: userVessel || null, 
            locked: !!userVessel,
            supabaseUrl,
            supabaseKey
          }, '*');
        } catch(e) { /* ignore */ }
      }, 300);"""

code = code.replace(old_post, new_post)

# Also replace fallback upload URL
code = code.replace('"https://upload.voyageportal.my.id"', '"https://api.voyageportal.my.id"')

with open('src/components/SMKReportFormPage.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
