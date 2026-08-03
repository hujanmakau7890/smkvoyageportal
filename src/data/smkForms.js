export const SMK_FORMS = [
  { code: "001", title: "Checklist Surat Kapal", category: "Checklist", file: "001_Ship_Certificate_Check_List.html" },
  { code: "002", title: "Checklist Klass Status Survey", category: "Checklist", file: "002_Class_Status_Survey_Check_List.html" },
  { code: "003", title: "Jadwal Eksternal & Internal Audit", category: "Audit", file: "003_Internal_Audit_Schedule.html" },
  { code: "005", title: "Catatan Internal Audit", category: "Audit", file: "005_Internal_Audit_Notes.html" },
  { code: "006", title: "Program Management Review, Komite Keselamatan dan Safety Meeting", category: "Rapat", file: "006_Program_Review_Safety_Meeting.html" },
  { code: "007-A", title: "Notulen Rapat Management Review", category: "Rapat", file: "007A_Management_Review_Meeting_Minutes.html" },
  { code: "007-B", title: "Master's Review", category: "Review", file: "007B_Masters_Review.html" },
  { code: "008", title: "Notulen Rapat Komite Manajemen Keselamatan", category: "Rapat", file: "008_Safety_Management_Committee_Meeting_Minutes.html" },
  { code: "009-A", title: "Notulen Rapat Keselamatan Kapal", category: "Rapat", file: "009A_Ship_Safety_Meeting_Minutes.html" },
  { code: "009-B", title: "Shipboard Management Meeting", category: "Rapat", file: "009B_Shipboard_Management_Meeting.html" },
  { code: "010", title: "Form Penilaian Risiko / Risk Assessment", category: "Risiko", file: "010_Risk_Assessment.html" },
];

export const SMK_CATEGORIES = ["Semua", ...new Set(SMK_FORMS.map((form) => form.category))];
