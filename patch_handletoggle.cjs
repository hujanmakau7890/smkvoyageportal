const fs = require('fs');

let code = fs.readFileSync('src/components/SMKRekapPreview.jsx', 'utf8');

const oldToggle = /const handleToggle=useCallback\(async \(\{vessel,code,month\}\)=>\{[\s\S]*?\}\n  \},\[data, year\]\);/;

const newToggle = `const handleToggle=useCallback(async ({vessel,code,month})=>{
    const row = data.find(r=>r.vessel===vessel && r.form_code===code && r.month===month);
    const next = (row && row.status==="C") ? "S" : "C";
    
    // Optimistic UI Update (Langsung ubah state biar cepat di layar HP)
    if(row) {
      setData(prev=>prev.map(r=>r.vessel===vessel && r.form_code===code && r.month===month ? {...r,status:next} : r));
    } else {
      // Pastikan property 'code' dan 'form_code' dua-duanya ada
      setData(prev=>[...prev, { vessel, form_code: code, code: code, month, year, status: next }]);
    }

    // Panggil database di background (Tidak usah ditunggu UI-nya)
    supabase.from("smk_rekap")
      .upsert({ vessel, form_code: code, month, year, status: next, updated_at: new Date().toISOString() }, { onConflict: "vessel,form_code,year,month" })
      .then(({error}) => {
        if(error) {
          console.error("Gagal update toggle:", error);
          // Opsi: Jika gagal banget, kita bisa kembalikan state. 
          // Tapi untuk log SMK, biarkan saja atau set error banner.
          setError("Gagal menyimpan perubahan " + code + " ke database.");
        }
      });
  },[data, year]);`;

code = code.replace(oldToggle, newToggle);

fs.writeFileSync('src/components/SMKRekapPreview.jsx', code);
console.log("PATCH SUCCESS");
