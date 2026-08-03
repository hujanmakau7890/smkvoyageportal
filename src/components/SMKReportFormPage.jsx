import { useMemo, useState } from "react";
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
      <p style={{ marginTop: 14, color: colors.muted, fontSize: 11 }}>Form 004 belum tersedia.</p>
    </div>
  );
}
