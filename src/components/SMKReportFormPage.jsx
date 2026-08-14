import { useEffect, useMemo, useRef, useState } from "react";
import { SMK_CATEGORIES, SMK_FORMS } from "../data/smkForms";
import { supabase } from "../supabase";

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
  const iframeRef = useRef(null);

  // Update browser tab title when form changes (always-declared hook)
  useEffect(() => {
    if (!selectedForm) return;
    document.title = `${selectedForm.code} ${selectedForm.title}`;
    return () => {
      document.title = "FLEET- QSS";
    };
  }, [selectedForm]);

  // Listen for title updates from iframe (always-declared hook)
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
  }, []);

  // Convert data URL to Blob
  function dataUrlToBlob(dataUrl) {
    const [meta, b64] = dataUrl.split(",");
    const mime = (meta.match(/data:(.*?);/) || [])[1] || "application/pdf";
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  // Save PDF from iframe directly to Laporan folder via upload endpoint
  async function handleSavePdf(payload) {
    try {
      const blob = dataUrlToBlob(payload.dataUrl);
      const safeName = (payload.name || `smk_${Date.now()}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
      const safeShip = (payload.ship || "Tanpa_Nama_Kapal")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "") || "Tanpa_Nama_Kapal";
      const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const dateMatch = String(payload.date || "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
      const year = dateMatch ? dateMatch[3] : String(new Date().getFullYear());
      const month = dateMatch ? MONTHS[Number(dateMatch[2]) - 1] : MONTHS[new Date().getMonth()];
      const uploadUrl = (import.meta.env.VITE_UPLOAD_URL || "https://upload.voyageportal.my.id").replace(/\/+$/, "");
      const res = await fetch(`${uploadUrl}/`, {
        method: "POST",
        headers: {
          "X-Token": "smk-laporan-2026",
          "X-Ship": safeShip,
          "X-Year": year,
          "X-Month": month,
          "X-Filename": safeName,
        },
        body: blob,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || `HTTP ${res.status}`);
      alert(`PDF tersimpan ke Laporan:\n${result.path}`);
    } catch (err) {
      alert("Gagal menyimpan PDF: " + err.message);
    }
  }

  // Build full document title: code + title + vessel + month year (from iframe fields)
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
            let t=base;
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
          const vessel=findVessel(), dateField=findDate();
          if(vessel){ vessel.addEventListener('change',setT); vessel.addEventListener('input',setT); }
          if(dateField){ dateField.addEventListener('change',setT); dateField.addEventListener('input',setT); }
          setT();
          function savePdf(){
            setT();
            const name = build();
            const page = document.querySelector('.page') || document.querySelector('.p') || document.body;
            if(!page) return;
            if(window.html2pdf){
              window.html2pdf().set({
                margin: 0,
                filename: name,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              }).from(page).toPdf().get('pdf').then(function(pdf){
                return pdf.output('blob');
              }).then(function(blob){
                var reader = new FileReader();
                reader.onload = function(e){
                  window.parent.postMessage({
                    type: 'SMK_SAVE_PDF', name: name, dataUrl: e.target.result,
                    ship: findVessel() ? esc(findVessel().value) : '',
                    date: findDate() ? esc(findDate().value) : '',
                    formCode: '${form.code}',
                    formTitle: '${form.title.replace(/'/g, "\\'")}'
                  }, '*');
                  setTimeout(function(){ window.print(); }, 800);
                };
                reader.readAsDataURL(blob);
              }).catch(function(){ setTimeout(function(){ window.print(); }, 300); });
              return;
            }
            setTimeout(function(){ window.print(); }, 300);
            /* legacy preview code intentionally removed */
            const parentDoc = window.parent.document;
            const modal = parentDoc.createElement('div'); /* unreachable */
            modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99999;display:flex;flex-direction:column;';
            const toolbar = parentDoc.createElement('div');
            toolbar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #ccc;background:#f5f5f5;flex-shrink:0;flex-wrap:wrap;gap:8px;';
            const titleEl = parentDoc.createElement('strong');
            titleEl.textContent = 'Preview PDF - ' + build().replace(/\.pdf$/, '');
            const btnGroup = parentDoc.createElement('div');
            btnGroup.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
            const saveBtn = parentDoc.createElement('button');
            saveBtn.textContent = 'Simpan ke Supabase';
            saveBtn.style.cssText = 'border:0;background:#15803d;color:#fff;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:bold;';
            const printBtn = parentDoc.createElement('button');
            printBtn.textContent = 'Cetak';
            printBtn.style.cssText = 'border:0;background:#1769d2;color:#fff;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:bold;';
            const closeBtn = parentDoc.createElement('button');
            closeBtn.textContent = 'Tutup';
            closeBtn.style.cssText = 'border:0;background:#dc2626;color:#fff;padding:8px 12px;border-radius:4px;cursor:pointer;';
            btnGroup.append(saveBtn, printBtn, closeBtn);
            toolbar.append(titleEl, btnGroup);
            const bodyEl = parentDoc.createElement('div');
            bodyEl.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;background:#ddd;position:relative;';
            const statusEl = parentDoc.createElement('div');
            statusEl.textContent = 'Menyiapkan PDF...';
            statusEl.style.cssText = 'font:15px sans-serif;color:#333;';
            bodyEl.appendChild(statusEl);
            modal.append(toolbar, bodyEl);
            parentDoc.body.appendChild(modal);
            closeBtn.onclick = function(){ parentDoc.body.removeChild(modal); };
            printBtn.onclick = function(){
              parentDoc.body.removeChild(modal);
              setTimeout(function(){ window.print(); }, 300);
            };
            let pdfBlob = null;
            if(window.html2pdf){
              window.html2pdf().set({
                margin: 0,
                filename: name,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              }).from(page).toPdf().get('pdf').then(function(pdf){
                return pdf.output('blob');
              }).then(function(blob){
                pdfBlob = blob;
                const reader = new FileReader();
                reader.onload = function(e){
                  statusEl.style.display = 'none';
                  const previewIframe = parentDoc.createElement('iframe');
                  previewIframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;background:#fff;';
                  previewIframe.src = e.target.result;
                  bodyEl.appendChild(previewIframe);
                };
                reader.readAsDataURL(blob);
              }).catch(function(){
                statusEl.textContent = 'Gagal generate PDF. Gunakan Cetak.';
              });
            } else {
              statusEl.textContent = 'Library PDF belum siap. Gunakan Cetak.';
            }
            saveBtn.onclick = function(){
              if(!pdfBlob){
                statusEl.textContent = 'PDF belum siap, tunggu sebentar.';
                return;
              }
              saveBtn.disabled = true;
              saveBtn.textContent = 'Menyimpan...';
              const reader = new FileReader();
              reader.onload = function(e){
                try{
                  window.parent.postMessage({
                    type: 'SMK_SAVE_PDF',
                    name: name,
                    dataUrl: e.target.result,
                    ship: findVessel() ? esc(findVessel().value) : '',
                    date: findDate() ? esc(findDate().value) : '',
                    formCode: '${form.code}',
                    formTitle: '${form.title.replace(/'/g, "\\'")}'
                  }, '*');
                  saveBtn.textContent = 'Tersimpan!';
                }catch(err){
                  saveBtn.textContent = 'Gagal';
                  alert('Gagal: ' + err.message);
                }
              };
              reader.readAsDataURL(pdfBlob);
            };
          }
          document.querySelectorAll('button[onclick*="print()"],button[onclick="window.print()"],.print-btn').forEach(function(btn){
            const fn=btn.getAttribute('onclick')||'';
            if(/print/.test(fn)){
              btn.removeAttribute('onclick');
              btn.addEventListener('click', savePdf);
            }
          });
          var lib=document.createElement('script');
          lib.src='/html2pdf.bundle.min.js';
          lib.async=true;
          (document.head||document.documentElement).appendChild(lib);
        })();
      `;
      try {
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
        // Recompute whenever the user types/picks values inside the form
        const v = findVessel(doc);
        const d = findDate(doc);
        if (v) { v.addEventListener('change', updateTitle); v.addEventListener('input', updateTitle); }
        if (d) { d.addEventListener('change', updateTitle); d.addEventListener('input', updateTitle); }
      } catch (e) {
        // ignore
      }
    };

    iframe.addEventListener('load', onLoad);
    // If iframe already loaded (cached), run immediately
    try {
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') onLoad();
    } catch (e) { /* ignore */ }
    return () => iframe.removeEventListener('load', onLoad);
  }, [formFile, selectedForm]);

  const visibleForms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SMK_FORMS.filter((form) => {
      const matchesCategory = categoryFilter === "Semua" || form.category === categoryFilter;
      const matchesSearch = !query || `${form.code} ${form.title} ${form.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, categoryFilter]);

  if (selectedForm) {
    return (
      <div style={{ height: "calc(100vh - 92px)", display: "flex", flexDirection: "column", gap: 10 }}>
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