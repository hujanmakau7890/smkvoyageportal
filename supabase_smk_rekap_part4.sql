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

-- Seed data dari Excel ISM 2026
('MMM','Perf',2026,2,'S','0.46319018404907975','','0.937888198757764'),
('MMM','Perf',2026,3,'S','0.46319018404907975','','0.937888198757764'),
('MMM','Perf',2026,4,'S','0.46319018404907975','','0.937888198757764'),
('MMM','Perf',2026,5,'S','0.46319018404907975','','0.937888198757764'),
('MMM','Perf',2026,6,'S','0.46319018404907975','','0.937888198757764')
ON CONFLICT (vessel, form_code, year, month)
DO UPDATE SET
  status     = EXCLUDED.status,
  dept       = EXCLUDED.dept,
  pic        = EXCLUDED.pic,
  ket        = EXCLUDED.ket,
  updated_at = NOW();

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_smk_rekap_vessel_year ON smk_rekap (vessel, year);
CREATE INDEX IF NOT EXISTS idx_smk_rekap_form ON smk_rekap (form_code, year);
