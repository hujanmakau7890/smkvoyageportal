#!/usr/bin/env python3
"""SMK PDF sink - render HTML form menjadi PDF via Chromium headless,
lalu simpan ke Laporan/Nama_Kapal/Tahun/Bulan/.
"""
import os
import re
import json
import shutil
import subprocess
import threading
import time
import base64
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = "/mnt/data/supabase-storage/Laporan"
NEED_APPROVAL_ROOT = "/mnt/data/supabase-storage/Need Approval"
SIGNATURE_DIR = "/mnt/data/supabase-storage/Signatures"
RENDER_TMP = "/home/fleet/smkvoyageportal/data/render_tmp"
TOKEN = "smk-laporan-2026"
PORT = 20130
ALLOW_ORIGIN = "*"
CHROMIUM = "/snap/bin/chromium"

os.makedirs(SIGNATURE_DIR, exist_ok=True)

_locks = {}

def sanitize(name):
    name = re.sub(r"[^a-zA-Z0-9._-]", "_", name or "").strip("._")
    return name or "file"


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "X-Token, X-Ship, X-Year, X-Month, X-Filename, X-Destination, X-Email, Content-Type, Cache-Control, Pragma")
        self.send_header("Access-Control-Expose-Headers", "Content-Type, Content-Disposition, Content-Length")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/download"):
            token = self.headers.get("X-Token")
            if token != TOKEN:
                self.send_response(403)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "Forbidden"}).encode())
                return
            try:
                from urllib.parse import urlparse, parse_qs
                qs = parse_qs(urlparse(self.path).query)
                rel = qs.get("path", [""])[0]
                if not rel:
                    self.send_error(400, "Missing path")
                    return
                # Upload response uses Laporan/... or Need Approval/...
                # Resolve relative to the storage root (parent of Laporan and Need Approval)
                STORAGE_ROOT = "/mnt/data/supabase-storage"
                rel = rel.replace("\\", "/")
                abs_path = os.path.normpath(os.path.join(STORAGE_ROOT, rel))
                if not abs_path.startswith(os.path.normpath(STORAGE_ROOT)):
                    self.send_error(403, "Forbidden path")
                    return
                if not os.path.isfile(abs_path):
                    self.send_error(404, "Not found")
                    return
                # HTML-only Need Approval: serve dengan Content-Type tepat + anti-cache
                low = abs_path.lower()
                if low.endswith(".html"):
                    ctype = "text/html; charset=utf-8"
                    disp = f"inline; filename=\"{os.path.basename(abs_path)}\""
                else:
                    ctype = "application/pdf"
                    disp = f"inline; filename=\"{os.path.basename(abs_path)}\""
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", ctype)
                self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                self.send_header("Content-Disposition", disp)
                self.send_header("Content-Length", str(os.path.getsize(abs_path)))
                self.end_headers()
                with open(abs_path, "rb") as f:
                    shutil.copyfileobj(f, self.wfile)
                return
            except Exception as e:
                res = {"ok": False, "error": str(e)}
                self.send_response(500)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            return
        if self.path.startswith("/get-signature"):
            token = self.headers.get("X-Token")
            if token != TOKEN:
                self.send_response(403); self._cors()
                self.send_header("Content-Type","application/json"); self.end_headers()
                self.wfile.write(json.dumps({"ok":False,"error":"Forbidden"}).encode())
                return
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            email = qs.get("email",[""])[0]
            if not email:
                self.send_response(400); self._cors()
                self.send_header("Content-Type","application/json"); self.end_headers()
                self.wfile.write(json.dumps({"ok":False,"error":"Missing email"}).encode())
                return
            safe_email = re.sub(r"[^a-zA-Z0-9@._-]","_", email)
            sig_path = os.path.join(SIGNATURE_DIR, safe_email + ".png")
            if os.path.isfile(sig_path):
                with open(sig_path,"rb") as f:
                    b64 = base64.b64encode(f.read()).decode()
                self.send_response(200); self._cors()
                self.send_header("Content-Type","application/json"); self.end_headers()
                self.wfile.write(json.dumps({"ok":True,"signature_b64":b64}).encode())
            else:
                self.send_response(200); self._cors()
                self.send_header("Content-Type","application/json"); self.end_headers()
                self.wfile.write(json.dumps({"ok":True,"signature_b64":None}).encode())
            return
        if self.path.startswith("/approve"):
            token = self.headers.get("X-Token")
            if token != TOKEN:
                self.send_response(403)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "Forbidden"}).encode())
                return
            try:
                from urllib.parse import urlparse, parse_qs
                qs = parse_qs(urlparse(self.path).query)
                rel = qs.get("path", [""])[0]
                approver_email = qs.get("email", [""])[0]
                if not rel:
                    self.send_error(400, "Missing path")
                    return
                STORAGE_ROOT = "/mnt/data/supabase-storage"
                rel = rel.replace("\\", "/")
                src_abs = os.path.normpath(os.path.join(STORAGE_ROOT, rel))
                if not src_abs.startswith(os.path.normpath(os.path.join(STORAGE_ROOT, "Need Approval"))):
                    self.send_error(403, "Source must be in Need Approval")
                    return
                if not os.path.isfile(src_abs):
                    self.send_error(404, "Source file not found")
                    return
                # Build destination: replace "Need Approval" with "Laporan"
                # HTML-only: jika src .html, dst jadi .pdf di Laporan (re-render dengan TTD)
                is_html_src = src_abs.lower().endswith(".html")
                rel_from_na = os.path.relpath(src_abs, os.path.join(STORAGE_ROOT, "Need Approval"))
                if is_html_src:
                    # ganti .html -> .pdf untuk dst
                    rel_from_na = rel_from_na[:-5] + ".pdf"
                dst_abs = os.path.normpath(os.path.join(ROOT, rel_from_na))
                os.makedirs(os.path.dirname(dst_abs), exist_ok=True)
                
                # Prevent overwrite in Laporan folder
                base_dst, ext_dst = os.path.splitext(dst_abs)
                counter_dst = 1
                new_dst = dst_abs
                while os.path.exists(new_dst):
                    new_dst = f"{base_dst} ({counter_dst}){ext_dst}"
                    counter_dst += 1
                dst_abs = new_dst
                rel_from_na = os.path.relpath(dst_abs, ROOT)


                # Form yang memerlukan TTD approver: 059* (SI/FM) dan 010 (DPA/admin) — kecuali 059G/H
                SI_TTD_FORMS = ["010", "059-A", "059-B", "059-C", "059-D", "059-E", "059-F",
                                "010-RISK", "059A",  "059B",  "059C",  "059D",  "059E",  "059F"]
                fname_check = os.path.basename(src_abs).upper()
                needs_si_ttd = any(code.upper() in fname_check for code in SI_TTD_FORMS)

                # HTML-only: html_src adalah src_abs itu sendiri jika .html; untuk .pdf cari backup .html
                if is_html_src:
                    html_src = src_abs
                else:
                    html_src = src_abs.replace(".pdf", ".html")
                    # Handle duplicate counter: pdf may be xxx.pdf but html is xxx (1).html (file lama)
                    if not os.path.isfile(html_src):
                        base_h, ext_h = os.path.splitext(html_src)
                        for i in range(1, 10):
                            cand = f"{base_h} ({i}){ext_h}"
                            if os.path.isfile(cand):
                                html_src = cand
                                break
                sig_injected = False

                # Fallback: jika HTML tidak ada (file lama pre-1c55ad1), inject TTD langsung ke PDF via overlay
                pdf_only_injected = False
                if needs_si_ttd and approver_email and not os.path.isfile(html_src):
                    safe_email_fb = re.sub(r"[^a-zA-Z0-9@._-]","_", approver_email)
                    sig_path_fb = os.path.join(SIGNATURE_DIR, safe_email_fb + ".png")
                    if os.path.isfile(sig_path_fb):
                        try:
                            # Inject TTD langsung ke PDF via overlay: buat PDF TTD transparan lalu merge
                            import tempfile
                            with open(sig_path_fb, "rb") as _sf:
                                sig_bytes = _sf.read()
                            sig_b64_fb = base64.b64encode(sig_bytes).decode()
                            # Render HTML kecil berisi TTD, lalu convert ke PDF overlay dan merge dengan pdf asli
                            # Simpler: gunakan HTML backup rekonstruksi dari pdf? Tidak ada — jadi pakai pypdf jika ada, else abort fallback
                            # Coba import pypdf / PyPDF2 untuk overlay
                            try:
                                from pypdf import PdfReader, PdfWriter
                            except ImportError:
                                try:
                                    from PyPDF2 import PdfReader, PdfWriter
                                except ImportError:
                                    PdfReader = None
                            if PdfReader is not None:
                                # Buat PDF overlay 1 halaman A4 landscape dengan TTD di posisi DPA/SI (kanan bawah)
                                overlay_html = f'''<!doctype html><html><head><style>@page{{size:A4 landscape;margin:0}}body{{margin:0;position:relative;width:297mm;height:210mm}}img{{position:absolute;right:18mm;bottom:14mm;max-width:38mm;max-height:16mm;object-fit:contain}}</style></head><body><img src="data:image/png;base64,{sig_b64_fb}"></body></html>'''
                                ov_html = tempfile.mktemp(suffix=".html")
                                ov_pdf = tempfile.mktemp(suffix=".pdf")
                                with open(ov_html, "w") as _f: _f.write(overlay_html)
                                subprocess.run([CHROMIUM, "--headless", "--disable-gpu", "--no-sandbox", "--print-to-pdf="+ov_pdf, "--print-to-pdf-landscape", "--no-pdf-header-footer", ov_html], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                                reader_main = PdfReader(src_abs)
                                reader_ov = PdfReader(ov_pdf)
                                writer = PdfWriter()
                                for i, page in enumerate(reader_main.pages):
                                    if i == len(reader_main.pages)-1:
                                        page.merge_page(reader_ov.pages[0])
                                    writer.add_page(page)
                                writer.write(dst_abs)
                                for _tmp in [ov_html, ov_pdf]:
                                    try: os.remove(_tmp)
                                    except: pass
                                # hapus file asal Need Approval setelah sukses inject fallback
                                try: os.remove(src_abs)
                                except: pass
                                sig_injected = True
                                pdf_only_injected = True
                            else:
                                print("[InjectTTD] pypdf not available, cannot fallback inject")
                        except Exception as _fb_err:
                            print(f"[InjectTTD fallback] Error: {_fb_err}")

                if needs_si_ttd and approver_email and os.path.isfile(html_src):
                    safe_email = re.sub(r"[^a-zA-Z0-9@._-]","_", approver_email)
                    sig_path = os.path.join(SIGNATURE_DIR, safe_email + ".png")
                    if os.path.isfile(sig_path):
                        try:
                            with open(sig_src := sig_path, "rb") as sf:
                                sig_b64 = "data:image/png;base64," + base64.b64encode(sf.read()).decode()
                            with open(html_src, "r", encoding="utf-8", errors="replace") as hf:
                                html = hf.read()

                            # Inject TTD ke kolom SI/FM:
                            # Pola 1: role berisi "SI" atau "FM" dalam tag .role/.sig-title
                            # Pola 2: slot sig-preview terakhir (posisi SI biasanya paling kanan/terakhir)
                            # Kita inject dengan mengganti img src kosong pada sig-preview terakhir
                            # dan set display:flex agar terlihat saat print
                            import re as _re

                            injected = False
                            # --- Pola A: 059A/B/C style: sig-preview + <img alt=""> (tanpa src) ---
                            preview_pattern = _re.compile(
                                r'(<div[^>]*class="[^"]*sig-preview[^"]*"[^>]*>)\s*<img[^>]*>',
                                _re.IGNORECASE
                            )
                            matches = list(preview_pattern.finditer(html))
                            if matches:
                                m = matches[-1]
                                orig = m.group(0)
                                div_open = m.group(1)
                                # hapus hidden dari div
                                div_open_fixed = div_open.replace(' hidden','').replace('hidden ','').replace('"hidden"','""')
                                if 'style=' not in div_open_fixed:
                                    div_open_fixed = div_open_fixed.replace('>', ' style="display:flex !important;" >')
                                replacement = div_open_fixed + f'<img src="{sig_b64}" style="max-height:60px;max-width:100%;object-fit:contain;display:block;">'
                                html = html[:m.start()] + replacement + html[m.end():]
                                injected = True
                            else:
                                # --- Pola B: 059D style: <div id="pv.*" class="pv"> + <img alt="signature"> ---
                                pv_pattern = _re.compile(
                                    r'(<div[^>]*class="[^"]*\bpv\b[^"]*"[^>]*>)\s*<img[^>]*>',
                                    _re.IGNORECASE
                                )
                                pv_matches = list(pv_pattern.finditer(html))
                                if pv_matches:
                                    m = pv_matches[-1]
                                    orig = m.group(0)
                                    div_open = m.group(1)
                                    if 'style=' not in div_open:
                                        div_open_fixed = div_open.replace('>', ' style="display:flex !important;" >')
                                    else:
                                        div_open_fixed = div_open.replace('display:none', 'display:flex')
                                    replacement = div_open_fixed + f'<img src="{sig_b64}" style="max-height:60px;max-width:100%;object-fit:contain;display:block;">'
                                    html = html[:m.start()] + replacement + html[m.end():]
                                    injected = True

                            # Tulis HTML yang sudah dimodifikasi ke tmp
                            html_inj = html_src + ".injected.html"
                            with open(html_inj, "w", encoding="utf-8") as hf:
                                hf.write(html)

                            pdf_tmp = dst_abs + ".tmp.pdf"
                            cmd = [
                                CHROMIUM, "--headless", "--disable-gpu", "--no-sandbox",
                                "--print-to-pdf=" + pdf_tmp,
                                "--print-to-pdf-landscape",
                                "--no-pdf-header-footer",
                                "--timeout=60000",
                                html_inj,
                            ]
                            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                            shutil.move(pdf_tmp, dst_abs)
                            sig_injected = True
                            # hapus file asal Need Approval setelah sukses re-render dengan TTD
                            try: os.remove(src_abs)
                            except: pass

                            # Hapus file sementara
                            for f in [html_inj]:
                                try: os.remove(f)
                                except: pass
                        except Exception as inj_err:
                            print(f"[InjectTTD] Error: {inj_err}")

                if not sig_injected and not pdf_only_injected:
                    shutil.move(src_abs, dst_abs)

                # Hapus HTML backup setelah approve
                if os.path.isfile(html_src):
                    try: os.remove(html_src)
                    except: pass

                dst_rel = os.path.join("Laporan", rel_from_na)
                res = {"ok": True, "newPath": dst_rel}
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            except Exception as e:
                res = {"ok": False, "error": str(e)}
                self.send_response(500)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            return
        
        if self.path.startswith("/reject"):
            token = self.headers.get("X-Token")
            if token != TOKEN:
                self.send_response(403)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "Forbidden"}).encode())
                return
            try:
                from urllib.parse import urlparse, parse_qs
                qs = parse_qs(urlparse(self.path).query)
                rel = qs.get("path", [""])[0]
                if not rel:
                    self.send_error(400, "Missing path")
                    return
                STORAGE_ROOT = "/mnt/data/supabase-storage"
                rel = rel.replace("\\", "/")
                src_abs = os.path.normpath(os.path.join(STORAGE_ROOT, rel))
                if not src_abs.startswith(os.path.normpath(os.path.join(STORAGE_ROOT, "Need Approval"))):
                    self.send_error(403, "Source must be in Need Approval")
                    return
                if not os.path.isfile(src_abs):
                    self.send_error(404, "Source file not found")
                    return
                
                # HTML-only reject: hapus source apapun (.html atau .pdf) + pair nya
                low = src_abs.lower()
                if low.endswith(".html"):
                    try: os.remove(src_abs)
                    except: pass
                    # jika ada pdf lama dengan nama sama (migrasi hybrid), hapus juga
                    pdf_pair = src_abs[:-5] + ".pdf"
                    if os.path.isfile(pdf_pair):
                        try: os.remove(pdf_pair)
                        except: pass
                elif low.endswith(".pdf"):
                    try: os.remove(src_abs)
                    except: pass
                    html_pair = src_abs[:-4] + ".html"
                    if os.path.isfile(html_pair):
                        try: os.remove(html_pair)
                        except: pass
                    # juga handle (1).html case
                    base_h = src_abs[:-4]
                    for i in range(1, 10):
                        cand = f"{base_h} ({i}).html"
                        if os.path.isfile(cand):
                            try: os.remove(cand)
                            except: pass
                
                res = {"ok": True}
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            except Exception as e:
                res = {"ok": False, "error": str(e)}
                self.send_response(500)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            return

        if self.path.startswith("/list-laporan"):
            token = self.headers.get("X-Token")
            if token != TOKEN:
                self.send_response(403)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "Forbidden"}).encode())
                return
            try:
                from urllib.parse import urlparse, parse_qs
                qs = parse_qs(urlparse(self.path).query)
                vessel = qs.get("vessel", [""])[0]
                year = qs.get("year", [""])[0]
                month = qs.get("month", [""])[0]
                
                results = []
                if os.path.exists(ROOT):
                    for root_dir, dirs, files in os.walk(ROOT):
                        for fn in files:
                            if not fn.endswith(".pdf"):
                                continue
                            full = os.path.join(root_dir, fn)
                            rel = os.path.relpath(full, ROOT)
                            parts = rel.split(os.sep)
                            if len(parts) >= 4:
                                v, y, m = parts[0], parts[1], parts[2]
                                v_norm = v.replace(" ", "").replace("_", "").lower()
                                vessel_norm = vessel.replace(" ", "").replace("_", "").lower()
                                if vessel and vessel_norm != v_norm: continue
                                if year and year != y: continue
                                if month and month.lower() != m.lower(): continue
                                stat = os.stat(full)
                                results.append({
                                    "name": fn,
                                    "path": f"Laporan/{rel}".replace("\\", "/"),
                                    "vessel": v.replace("_", " "),
                                    "year": y,
                                    "month": m,
                                    "size": stat.st_size,
                                    "created_at": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(stat.st_mtime))
                                })
                
                res = {"ok": True, "files": results}
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
                return
            except Exception as e:
                res = {"ok": False, "error": str(e)}
                self.send_response(500)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
                return

        if self.path.startswith("/list-need-approval"):
            token = self.headers.get("X-Token")
            if token != TOKEN:
                self.send_response(403)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "Forbidden"}).encode())
                return
            try:
                grouped = {}
                if os.path.isdir(NEED_APPROVAL_ROOT):
                    for vessel in sorted(os.listdir(NEED_APPROVAL_ROOT)):
                        vessel_path = os.path.join(NEED_APPROVAL_ROOT, vessel)
                        if not os.path.isdir(vessel_path):
                            continue
                        files = []
                        for dirpath, _, filenames in os.walk(vessel_path):
                            for fn in sorted(filenames):
                                if fn.startswith("."):
                                    continue
                                low = fn.lower()
                                # HTML-only Need Approval: tampilkan .html dan tetap support .pdf lama (migrasi)
                                if not (low.endswith(".html") or low.endswith(".pdf")):
                                    continue
                                full = os.path.join(dirpath, fn)
                                rel = os.path.relpath(full, NEED_APPROVAL_ROOT)
                                stat = os.stat(full)
                                files.append({
                                    "name": fn,
                                    "path": f"Need Approval/{rel}",
                                    "size": stat.st_size,
                                    "created_at": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(stat.st_mtime)),
                                })
                        if files:
                            grouped[vessel] = files
                res = {"ok": True, "data": grouped}
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            except Exception as e:
                res = {"ok": False, "error": str(e)}
                self.send_response(500)
                self._cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
            return
        self.send_error(404, "Not found")

    def do_POST(self):
        if self.headers.get("X-Token") != TOKEN:
            self.send_response(403)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "error": "Forbidden"}).encode())
            return

        # Endpoint khusus: simpan TTD user
        if self.path.startswith("/save-signature"):
            try:
                email = self.headers.get("X-Email","").strip()
                if not email:
                    self.send_response(400); self._cors()
                    self.send_header("Content-Type","application/json"); self.end_headers()
                    self.wfile.write(json.dumps({"ok":False,"error":"Missing email"}).encode())
                    return
                length = int(self.headers.get("Content-Length",0))
                body = self.rfile.read(length) if length else b""
                if not body:
                    self.send_response(400); self._cors()
                    self.send_header("Content-Type","application/json"); self.end_headers()
                    self.wfile.write(json.dumps({"ok":False,"error":"Empty body"}).encode())
                    return
                safe_email = re.sub(r"[^a-zA-Z0-9@._-]","_", email)
                sig_path = os.path.join(SIGNATURE_DIR, safe_email + ".png")
                # Body bisa base64 string atau raw binary PNG
                try:
                    # Coba decode base64 (format data:image/png;base64,xxxx)
                    b64_str = body.decode("utf-8").strip()
                    if "," in b64_str:
                        b64_str = b64_str.split(",",1)[1]
                    img_bytes = base64.b64decode(b64_str)
                except Exception:
                    img_bytes = body
                with open(sig_path, "wb") as f:
                    f.write(img_bytes)
                self.send_response(200); self._cors()
                self.send_header("Content-Type","application/json"); self.end_headers()
                self.wfile.write(json.dumps({"ok":True}).encode())
            except Exception as e:
                self.send_response(500); self._cors()
                self.send_header("Content-Type","application/json"); self.end_headers()
                self.wfile.write(json.dumps({"ok":False,"error":str(e)}).encode())
            return

        try:
            ship = sanitize(self.headers.get("X-Ship", "Tanpa_Nama_Kapal"))
            year = sanitize(self.headers.get("X-Year", str(time.gmtime().tm_year)))
            month = sanitize(self.headers.get("X-Month", "Januari"))
            fname = sanitize(self.headers.get("X-Filename", "laporan"))
            if not fname.lower().endswith(".pdf"):
                fname += ".pdf"

            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length) if length else b""
            if not body:
                self.send_error(400, "Empty body")
                return

            content_type = (self.headers.get("Content-Type") or "").lower()
            is_html = (
                "text/html" in content_type
                or body[:100].lstrip().startswith(b"<!doctype html")
                or body[:100].lstrip().lower().startswith(b"<html")
            )

            # Determine destination folder based on X-Destination header
            destination = (self.headers.get("X-Destination") or "").strip()
            if destination == "Need Approval":
                target_root = NEED_APPROVAL_ROOT
                path_prefix = "Need Approval"
            else:
                target_root = ROOT
                path_prefix = "Laporan"

            d = os.path.join(target_root, ship, year, month)
            os.makedirs(d, exist_ok=True)
            
            # Prevent file overwrite by appending (1), (2), etc. if the file exists
            base_fname, ext = os.path.splitext(fname)
            counter = 1
            new_fname = fname
            while os.path.exists(os.path.join(d, new_fname)):
                new_fname = f"{base_fname} ({counter}){ext}"
                counter += 1
            fname = new_fname
            
            p = os.path.join(d, fname)
            tmp = p + ".tmp"

            if is_html:
                # Need Approval HTML-only: simpan .html saja, preview tetap tampil di UI
                # Laporan tetap render PDF seperti biasa
                if destination == "Need Approval":
                    html_name = fname.replace(".pdf", ".html")
                    base_html, ext_html = os.path.splitext(html_name)
                    counter_h = 1
                    new_html = html_name
                    while os.path.exists(os.path.join(d, new_html)):
                        new_html = f"{base_html} ({counter_h}){ext_html}"
                        counter_h += 1
                    html_name = new_html
                    p = os.path.join(d, html_name)
                    with open(p, "wb") as f:
                        f.write(body)
                    rel = os.path.join(path_prefix, ship, year, month, html_name)
                    res = {"ok": True, "path": rel, "size": len(body)}
                    self.send_response(200)
                    self._cors()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(res).encode())
                    return

                os.makedirs(RENDER_TMP, exist_ok=True)
                html_path = os.path.join(RENDER_TMP, fname.replace(".pdf", ".html"))
                # Form 010 dan hasil referensi menggunakan A4 landscape.
                # Paksa orientasi pada print CSS Chromium agar tidak kembali portrait.
                if b"@page" not in body.lower():
                    body = body.replace(b"</head>", b"<style>@page{size:A4 landscape!important;margin:7mm}</style></head>", 1)
                with open(html_path, "wb") as f:
                    f.write(body)

                pdf_tmp = os.path.join(RENDER_TMP, fname)
                cmd = [
                    CHROMIUM,
                    "--headless",
                    "--disable-gpu",
                    "--no-sandbox",
                    "--print-to-pdf=" + pdf_tmp,
                    "--print-to-pdf-landscape",
                    "--no-pdf-header-footer",
                    "--timeout=60000",
                    html_path,
                ]
                try:
                    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                except subprocess.CalledProcessError as e:
                    raise RuntimeError(f"Chromium render failed: {e}")

                shutil.move(pdf_tmp, tmp)

                try:
                    os.remove(html_path)
                except OSError:
                    pass
            else:
                with open(tmp, "wb") as f:
                    f.write(body)

            os.replace(tmp, p)

            rel = os.path.join(path_prefix, ship, year, month, fname)
            res = {"ok": True, "path": rel, "size": len(body)}
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode())
        except Exception as e:
            res = {"ok": False, "error": str(e)}
            self.send_response(500)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode())

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
