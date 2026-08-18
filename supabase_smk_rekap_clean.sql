-- SMK Rekap Table
CREATE TABLE IF NOT EXISTS smk_rekap (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel       VARCHAR(100) NOT NULL,
  form_code    VARCHAR(20)  NOT NULL,
  year         SMALLINT     NOT NULL DEFAULT 2026,
  month        SMALLINT     NOT NULL CHECK (month BETWEEN 1 AND 12),
  status       CHAR(1)      NOT NULL DEFAULT 'S' CHECK (status IN ('C','S')),
  dept         VARCHAR(20),
  pic          VARCHAR(50),
  ket          VARCHAR(20),
  submitted_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT smk_rekap_unique UNIQUE (vessel, form_code, year, month)
);

ALTER TABLE smk_rekap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "smk_rekap_all" ON smk_rekap FOR ALL USING (true) WITH CHECK (true);

-- Hapus data lama
DELETE FROM smk_rekap;
