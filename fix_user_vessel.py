import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

script_to_add = """
        async function initAuthAndData() {
            try {
                // Get user from parent Supabase client (React App)
                const { data: { user } } = await window.parent.supabaseClient.auth.getUser();
                if (user) {
                    const { data: profile } = await window.parent.supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (profile && (profile.role === 'kapal' || profile.role === 'ship')) {
                        const candidates = [profile.ship, profile.name, profile.full_name, user.email?.split("@")[0]];
                        let userVessel = null;
                        for (const c of candidates) {
                            if (c && typeof c === "string" && c.trim()) {
                                userVessel = c.trim();
                                break;
                            }
                        }
                        
                        if (userVessel) {
                            const vesselSelect = document.querySelector('.ship-select');
                            // Find the option that matches closely
                            const vLower = userVessel.toLowerCase().replace(/_/g, " ");
                            Array.from(vesselSelect.options).forEach(opt => {
                                if (opt.value.toLowerCase().replace(/_/g, " ") === vLower) {
                                    vesselSelect.value = opt.value;
                                }
                            });
                            // Lock the dropdown
                            vesselSelect.disabled = true;
                            // Add a hidden input to submit the value since disabled select doesn't always trigger events? No, we read it directly.
                        }
                    }
                }
            } catch(e) {
                console.error("Gagal load profil:", e);
            }
            
            // Trigger load data automatically
            loadFromSupabase();
        }

        // Run initialization
        initAuthAndData();
"""

html = html.replace('document.querySelector(\'.ship-select\').addEventListener(\'change\', loadFromSupabase);', 
                    'document.querySelector(\'.ship-select\').addEventListener(\'change\', loadFromSupabase);\n' + script_to_add)

# Also fix the supabaseClient reference
html = html.replace('const SUPABASE_URL = "http://100.82.80.15:54321";', '')
html = html.replace('const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";', '')
html = html.replace('const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);', 'const supabase = window.parent.supabaseClient;')

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
