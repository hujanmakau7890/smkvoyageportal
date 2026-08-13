-- Migration untuk fitur Simpan ke Supabase
-- 1) Bucket storage untuk PDF laporan
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('smk-pdf','smk-pdf', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- 2) Policy storage: authenticated boleh upload & baca
drop policy if exists smk_pdf_upload on storage.objects;
drop policy if exists smk_pdf_read on storage.objects;
create policy smk_pdf_upload on storage.objects for insert to authenticated with check (bucket_id='smk-pdf');
create policy smk_pdf_read on storage.objects for select to authenticated using (bucket_id='smk-pdf');

-- 3) Kolom di tabel reports untuk menyimpan info PDF
alter table public.reports add column if not exists pdf_url text;
alter table public.reports add column if not exists form_code text;
