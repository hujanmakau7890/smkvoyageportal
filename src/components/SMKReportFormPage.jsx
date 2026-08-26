import { useEffect, useMemo, useRef, useState } from "react";
import { SMK_CATEGORIES, SMK_FORMS } from "../data/smkForms";
import { supabase } from "../supabase";
import { markFormCompleted } from "./SMKRekapPreview";

const colors = {
  text: "var(--c-text, #0f172a)",
  muted: "var(--c-muted, #64748b)",
  panel: "var(--c-panel, #ffffff)",
  border: "var(--c-border, #cbd5e1)",
  accent: "var(--c-accent, #0284c7)",
  input: "var(--c-bg3, #f8fafc)",
};

export default function SMKReportFormPage() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [successMessage, setSuccessMessage] = useState("");
  const [userVessel, setUserVessel] = useState(null);
  const [userRolePage, setUserRolePage] = useState("");
  const iframeRef = useRef(null);

  // Load user profile once
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile) return;
      const role = (profile.role || '').toLowerCase();
      setUserRolePage(role);
      if (role === 'kapal' || role === 'ship') {
        const candidates = [profile.ship, profile.name, profile.full_name, user.email?.split('@')[0]];
        for (const c of candidates) {
          if (c && typeof c === 'string' && c.trim()) { setUserVessel(c.trim()); break; }
        }
      }
    });
  }, []);


  useEffect(() => {
    if (!selectedForm) return;
    document.title = `${selectedForm.code} ${selectedForm.title}`;
    return () => {
      document.title = "FLEET- QSS";
    };
  }, [selectedForm]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "FORM_TITLE" && event.data.title) {
        document.title = event.data.title;
      }
      if (event.data && event.data.type === "SMK_SAVE_PDF") {
        handleSavePdf(event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleSavePdf]);

  async function handleSavePdf(payload) {
    try {
      const safeName = (payload.name || `smk_${Date.now()}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
      const safeShip = (payload.ship || "Tanpa_Nama_Kapal")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "") || "Tanpa_Nama_Kapal";
      const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const dateMatch = String(payload.date || "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
      const year = dateMatch ? dateMatch[3] : String(new Date().getFullYear());
      const month = dateMatch ? MONTHS[Number(dateMatch[2]) - 1] : MONTHS[new Date().getMonth()];
      const uploadUrl = (import.meta.env.VITE_UPLOAD_URL || "https://api.voyageportal.my.id").replace(/\/+$/, "");

      const iframe = iframeRef.current;
      const sourceDoc = iframe?.contentDocument;
      let html = "";
      if (sourceDoc) {
        const clone = sourceDoc.documentElement.cloneNode(true);
        // Jangan jalankan ulang script form saat Chromium merender HTML.
        clone.querySelectorAll("script").forEach((node) => node.remove());
        // Salin nilai kontrol form dari property aktif ke atribut HTML.
        const srcFields = sourceDoc.querySelectorAll("input, textarea, select");
        const dstFields = clone.querySelectorAll("input, textarea, select");
        srcFields.forEach((src, i) => {
          const dst = dstFields[i];
          if (!dst) return;
          if (src.tagName === "SELECT") {
            Array.from(dst.options).forEach((opt, j) => {
              opt.selected = Boolean(src.options[j]?.selected);
              if (opt.selected) opt.setAttribute("selected", "selected");
              else opt.removeAttribute("selected");
            });
          } else if (src.type === "checkbox" || src.type === "radio") {
            if (src.checked) dst.setAttribute("checked", "checked");
            else dst.removeAttribute("checked");
          } else {
            dst.setAttribute("value", src.value || "");
            if (dst.tagName === "TEXTAREA") dst.textContent = src.value || "";
          }
        });

        const LANDSCAPE_FORMS = new Set(["010_Risk_Assessment.html", "018_Crew_Certificate_Monitoring.html", "091C_Record_Hours_Of_Rest.html", "091D_Weekly_Accomm_Inspection.html", "092_Loading_Cargo_Stability.html", "093D_Covid_Daily_Monitoring.html", "096B1_Crane_Maintenance_Daily.html"]);
        if (selectedForm?.file && LANDSCAPE_FORMS.has(selectedForm.file)) {
          let styleEl = clone.querySelector("style[data-smk-orientation]");
          if (!styleEl) {
            const ownerDoc = clone.ownerDocument || sourceDoc;
            styleEl = ownerDoc.createElement("style");
            styleEl.setAttribute("data-smk-orientation", "landscape");
            const target = clone.querySelector("head") || clone;
            target.appendChild(styleEl);
          }
          if (styleEl) {
            styleEl.textContent = "@page { size: A4 landscape !important; margin: 7mm !important; }";
          }
        }

        const DEDUP_FORMS = new Set(["010_Risk_Assessment.html", "018_Crew_Certificate_Monitoring.html"]);
        if (selectedForm?.file && DEDUP_FORMS.has(selectedForm.file) && sourceDoc) {
          const tbody = clone.querySelector("tbody#rows");
          if (tbody) {
            const seen = new Set();
            const rows = Array.from(tbody.querySelectorAll("tr"));
            for (let i = rows.length - 1; i >= 0; i--) {
              const firstInput = rows[i].querySelector("td:first-child input");
              const key = firstInput ? firstInput.getAttribute("value") : null;
              if (key && seen.has(key)) {
                rows[i].remove();
              } else if (key) {
                seen.add(key);
              }
            }
          }
        }

        html = `<!doctype html>${clone.outerHTML}`;
      }

      // Determine destination: forms yang butuh approval masuk ke "Need Approval"
      const REQUIRE_APPROVAL_FORMS = ['010', '059A', '059B', '059C', '059D', '059E', '059F'];
      const rawCode = (payload.formCode || selectedForm?.code || '').replace(/[\s-]/g, '').toUpperCase();
      const xDestination = REQUIRE_APPROVAL_FORMS.includes(rawCode) ? 'Need Approval' : 'Laporan';
      if (!xDestination || !safeShip || !safeName) {
        throw new Error(`Missing metadata: destination=${xDestination}, ship=${safeShip}, name=${safeName}`);
      }

      const res = await fetch(`${uploadUrl}/`, {
        method: 'POST',
        headers: {
          'X-Token': 'smk-laporan-2026',
          'X-Ship': safeShip,
          'X-Year': year,
          'X-Month': month,
          'X-Filename': safeName,
          'X-Destination': xDestination,
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: html,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || `HTTP ${res.status}`);

      // Auto-download PDF
      try {
        const dlUrl = `${uploadUrl}/download?path=${encodeURIComponent(result.path)}`;
        const dlRes = await fetch(dlUrl, {
          headers: { "X-Token": "smk-laporan-2026" }
        });
        if (dlRes.ok) {
          const blob = await dlRes.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = safeName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        // ignore download failure
      }

      setSuccessMessage("Download & Upload sukses!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Hanya update rekap ke "C" untuk form yang TIDAK butuh approval.
      // Form yang butuh approval akan di-update ke "C" saat SI meng-approve.
      if (xDestination !== "Need Approval") {
        try {
          await markFormCompleted(supabase, {
            vessel: payload.ship || safeShip,
            formCode: payload.formCode || selectedForm?.code || "",
            dateStr: payload.date || "",
          });
        } catch (e) {
          const msg = e?.message || String(e);
          console.warn("[SMK] Rekap update failed:", msg);
          alert("Download & Upload file sukses, tapi Rekap gagal: " + msg);
          setSuccessMessage("Download & Upload file sukses. Rekap gagal: " + msg);
          setTimeout(() => setSuccessMessage(""), 5000);
        }
      }
    } catch (err) {
      alert("Gagal menyimpan PDF: " + err.message);
    }
  }

  const formFile = selectedForm?.file;
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !formFile) return;

    const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const esc = (s) => (s || '').replace(/\s+/g, ' ').trim();

    function findVessel(doc) {
      const q = doc.querySelector('select#shipSelect, input#shipSelect, select#ship, input#ship, select.vessel, input.vessel, select[name*="ship" i], input[name*="ship" i], select[name*="vessel" i], input[name*="vessel" i]');
      if (q) return q;
      const labels = doc.querySelectorAll('label.f, label.field, label');
      for (let i = 0; i < labels.length; i++) {
        const t = (labels[i].textContent || '').toLowerCase();
        if (/vessel|kapal|nama kapal|ship'?s? name|name of vessel|ship name/.test(t)) {
          const inp = labels[i].querySelector('input, select');
          if (inp) return inp;
        }
      }
      const all = doc.querySelectorAll('select');
      for (let i = 0; i < all.length; i++) {
        const opts = all[i].options || [];
        for (let j = 0; j < opts.length; j++) {
          if (/sahabat|semangat|express|pratama|prakarsa|mavendra|selaras|segoro/.test((opts[j].text || '').toLowerCase())) {
            return all[i];
          }
        }
      }
      return null;
    }

    function findDate(doc) {
      const q = doc.querySelector('input.date, input[type="date"], input#date, input[name*="date" i], input[name*="tanggal" i], input.date-mask, .date-mask');
      if (q) return q;
      const labels = doc.querySelectorAll('label.f, label.field, label');
      for (let i = 0; i < labels.length; i++) {
        const t = (labels[i].textContent || '').toLowerCase();
        if (/date|tanggal|bulan|tahun|month|year/.test(t)) {
          const inp = labels[i].querySelector('input');
          if (inp) return inp;
        }
      }
      return null;
    }

    function injectIframeTitle(doc, form) {
      if (!doc || !doc.head) return;
      const base = `${form.code} ${form.title}`;
      const script = doc.createElement('script');
      script.textContent = `
        (function(){
          const base="${base}";
          function esc(s){return (s||"").replace(/\\s+/g," ").trim();}
          function findVessel(){
            const q=document.querySelector('select#shipSelect, input#shipSelect, select#ship, input#ship, select.vessel, input.vessel, select[name*="ship" i], input[name*="ship" i], select[name*="vessel" i], input[name*="vessel" i]');
            if(q) return q;
            const labels=document.querySelectorAll('label.f,label.field,label');
            for(let i=0;i<labels.length;i++){
              const t=(labels[i].textContent||"").toLowerCase();
              if(/vessel|kapal|nama kapal|ship'?s? name|name of vessel|ship name/.test(t)){
                const inp=labels[i].querySelector('input,select');
                if(inp) return inp;
              }
            }
            const all=document.querySelectorAll('select');
            for(let i=0;i<all.length;i++){
              const opts=all[i].options || [];
              for(let j=0;j<opts.length;j++){
                if(/sahabat|semangat|express|pratama|prakarsa|mavendra|selaras|segoro/.test((opts[j].text||"").toLowerCase())) return all[i];
              }
            }
            return null;
          }
          function findDate(){
            const q=document.querySelector('input.date,input[type="date"],input#date,input[name*="date" i],input[name*="tanggal" i],input.date-mask,.date-mask');
            if(q) return q;
            const labels=document.querySelectorAll('label.f,label.field,label');
            for(let i=0;i<labels.length;i++){
              const t=(labels[i].textContent||"").toLowerCase();
              if(/date|tanggal|bulan|tahun|month|year/.test(t)){
                const inp=labels[i].querySelector('input');
                if(inp) return inp;
              }
            }
            return null;
          }
          function build(){
            const MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            const vs=findVessel()?esc(findVessel().value):'';
            const ds=findDate()?esc(findDate().value):'';
            const catSel=document.getElementById('category-select');
            let t=base;
            if(catSel && catSel.value) t += ' ' + catSel.value;
            if(vs) t+=' - '+vs;
            if(ds){
              const m=ds.match(/^(\\d{2})-(\\d{2})-(\\d{4})$/);
              if(m){
                const mo=parseInt(m[2],10);
                if(mo>=1 && mo<=12) t+=' - '+MONTHS[mo-1]+' '+m[3];
                else t+=' - '+ds;
              } else t+=' - '+ds;
            }
            return t.replace(/[^a-zA-Z0-9_\\-\\s]/g,'').replace(/\\s+/g,'_') + '.pdf';
          }
          function setT(){
            try{ document.title=build().replace(/\\.pdf$/,''); }catch(e){}
          }
          const vessel=findVessel(), dateField=findDate(), catSel=document.getElementById('category-select');
          if(vessel){ vessel.addEventListener('change',setT); vessel.addEventListener('input',setT); }
          if(dateField){ dateField.addEventListener('change',setT); dateField.addEventListener('input',setT); }
          if(catSel){ catSel.addEventListener('change',setT); }
          setT();
          function savePdf(){
            const vessel=findVessel();
            const val=vessel?esc(vessel.value):"";
            if(!val){
              alert('Isi nama kapal sebelum menyimpan/print PDF.');
              return;
            }
            setT();
            const name = build();
            window.parent.postMessage({
              type: 'SMK_SAVE_PDF', name: name,
              ship: findVessel() ? esc(findVessel().value) : '',
              date: findDate() ? esc(findDate().value) : '',
              formCode: '${form.code}',
              formTitle: '${form.title.replace(/'/g, "\\'")}'
            }, '*');
          }
          document.querySelectorAll('button[onclick*="print()"],button[onclick="window.print()"],.print-btn,button[onclick*="savePDF"]').forEach(function(btn){
            const fn=btn.getAttribute('onclick')||'';
            if(/print|savePDF/i.test(fn) || btn.classList.contains('print-btn')){
              btn.removeAttribute('onclick');
              btn.addEventListener('click', function(e){
                e.preventDefault();
                const vessel=findVessel();
                const val=vessel?esc(vessel.value):"";
                if(!val){
                  alert('Isi nama kapal sebelum menyimpan/print PDF.');
                  return;
                }
                savePdf();
              });
            }
          });
        })();
      `;
      try {
        if (!doc || !doc.head) return;
        (doc.head || doc.documentElement).appendChild(script);
      } catch (e) {
        // ignore cross-origin
      }
    }

    function updateTitle() {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const base = `${selectedForm.code} ${selectedForm.title}`;
        const v = findVessel(doc);
        const d = findDate(doc);
        const vs = v ? esc(v.value) : '';
        const ds = d ? esc(d.value) : '';
        let t = base;
        if (vs) t += ' - ' + vs;
        if (ds) {
          const m = ds.match(/^(\d{2})-(\d{2})-(\d{4})$/);
          if (m) {
            const mo = parseInt(m[2], 10);
            if (mo >= 1 && mo <= 12) t += ' - ' + MONTHS[mo - 1] + ' ' + m[3];
            else t += ' - ' + ds;
          } else {
            t += ' - ' + ds;
          }
        }
        document.title = t;
        const titleEl = doc.querySelector('title');
        if (titleEl) titleEl.textContent = t;
        if (doc && doc.title !== t) doc.title = t;
      } catch (e) {
        // cross-origin or missing, keep default title
      }
    }

    function onLoad() {
      try {
        const doc = iframe.contentDocument;
        updateTitle();
        injectIframeTitle(doc, selectedForm);
        const v = findVessel(doc);
        const d = findDate(doc);
        if (v) { v.addEventListener('change', updateTitle); v.addEventListener('input', updateTitle); }
        if (d) { d.addEventListener('change', updateTitle); d.addEventListener('input', updateTitle); }
      } catch (e) {
        // ignore
      }
      // Send config and vessel info to iframe for auto-select & lock
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
      }, 300);
    };

    iframe.addEventListener('load', onLoad);
    try {
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') onLoad();
    } catch (e) { /* ignore */ }
    return () => iframe.removeEventListener('load', onLoad);
  }, [formFile, selectedForm, userVessel]);

  const visibleForms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SMK_FORMS.filter((form) => {
      const matchesCategory = categoryFilter === "Semua" || form.category === "Semua" || form.category === categoryFilter;
      const matchesSearch = !query || `${form.code} ${form.title} ${form.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, categoryFilter]);

  if (selectedForm) {
    return (
      <div style={{ height: "calc(100vh - 92px)", display: "flex", flexDirection: "column", gap: 10 }}>
        {successMessage && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div role="status" style={{ padding: "20px 32px", borderRadius: 12, background: "#dcfce7", border: "2px solid #4ade80", color: "#166534", fontWeight: 800, fontSize: 18, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
              ✓ {successMessage}
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <button
            type="button"
            onClick={() => setSelectedForm(null)}
            style={{ padding: "7px 11px", borderRadius: 7, border: `1px solid ${colors.border}`, background: colors.panel, color: colors.text, cursor: "pointer", fontWeight: 700 }}
          >
            ← Pilih Form Lain
          </button>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, textAlign: "right" }}>
            {selectedForm.code} — {selectedForm.title}
          </div>
        </div>
        <iframe
          ref={iframeRef}
          title={`${selectedForm.code} ${selectedForm.title}`}
          src={`/smk-forms/${selectedForm.file}`}
          style={{ flex: 1, width: "100%", border: `1px solid ${colors.border}`, borderRadius: 10, background: "white" }}
        />
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div role="status" style={{ padding: "20px 32px", borderRadius: 12, background: "#dcfce7", border: "2px solid #4ade80", color: "#166534", fontWeight: 800, fontSize: 18, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            ✓ {successMessage}
          </div>
        </div>
      )}
      <h2 style={{ margin: "0 0 5px", color: colors.text, fontSize: 20 }}>Buat Laporan SMK</h2>
      <p style={{ margin: "0 0 14px", color: colors.muted, fontSize: 12 }}>Pilih form laporan yang akan dibuat.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari kode atau nama form..."
          style={{ flex: "1 1 240px", minWidth: 0, padding: "9px 11px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: "none" }}
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          style={{ flex: "0 1 180px", padding: "9px 11px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: "none" }}
        >
          {SMK_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      <div style={{ color: colors.muted, fontSize: 11, marginBottom: 9 }}>{visibleForms.length} form ditemukan</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {visibleForms.map((form) => (
          <button
            key={form.code}
            type="button"
            onClick={() => setSelectedForm(form)}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 14, border: `1px solid ${colors.border}`, borderRadius: 10, background: colors.panel, color: colors.text, cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ minWidth: 52, padding: "7px 8px", borderRadius: 7, background: "rgba(2, 132, 199, 0.10)", color: colors.accent, fontSize: 12, fontWeight: 800, textAlign: "center" }}>{form.code}</span>
            <span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, lineHeight: 1.35 }}>{form.title}</span>
              <span style={{ display: "block", marginTop: 3, color: colors.muted, fontSize: 10 }}>{form.category}</span>
            </span>
          </button>
        ))}
      </div>

      {!visibleForms.length && <div style={{ padding: 22, color: colors.muted, textAlign: "center" }}>Form tidak ditemukan.</div>}
      <p style={{ marginTop: 14, color: colors.muted, fontSize: 11 }}>Daftar akan ditambah saat form baru tersedia.</p>
    </div>
  );
}
