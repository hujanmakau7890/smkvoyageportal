import { useEffect, useMemo, useRef, useState } from "react";
import { SMK_CATEGORIES, SMK_FORMS } from "../data/smkForms";

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
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Build full document title: code + title + vessel + month year (from iframe fields)
  const formFile = selectedForm?.file;
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !formFile) return;

    const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const esc = (s) => (s || '').replace(/\s+/g, ' ').trim();

    function findVessel(doc) {
      const q = doc.querySelector('input.vessel, select.vessel, #ship, #shipSelect, select[id*="ship" i], select[id*="vessel" i]');
      if (q) return q;
      const labels = doc.querySelectorAll('label.f, label.field, label');
      for (let i = 0; i < labels.length; i++) {
        const t = (labels[i].textContent || '').toLowerCase();
        if (/vessel|kapal|nama kapal|ship'?s? name|name of vessel|ship name/.test(t)) {
          const inp = labels[i].querySelector('input, select');
          if (inp) return inp;
        }
      }
      return null;
    }

    function findDate(doc) {
      const q = doc.querySelector('input.date, input[type="date"], #date');
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