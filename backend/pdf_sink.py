import time
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
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = "/mnt/data/supabase-storage/Laporan"
NEED_APPROVAL_ROOT = "/mnt/data/supabase-storage/Need Approval"
RENDER_TMP = "/home/fleet/smkvoyageportal/data/render_tmp"
TOKEN = "smk-laporan-2026"
PORT = 20130
ALLOW_ORIGIN = "*"
CHROMIUM = "/snap/bin/chromium"

_locks = {}

def sanitize(name):
    name = re.sub(r"[^a-zA-Z0-9._-]", "_", name or "").strip("._")
    return name or "file"


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "X-Token, X-Ship, X-Year, X-Month, X-Filename, X-Destination, Content-Type")
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
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", "application/pdf")
                self.send_header("Content-Disposition", f"attachment; filename=\"{os.path.basename(abs_path)}\"")
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
                rel_from_na = os.path.relpath(src_abs, os.path.join(STORAGE_ROOT, "Need Approval"))
                dst_abs = os.path.normpath(os.path.join(ROOT, rel_from_na))
                os.makedirs(os.path.dirname(dst_abs), exist_ok=True)
                shutil.move(src_abs, dst_abs)
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
            p = os.path.join(d, fname)
            tmp = p + ".tmp"

            if is_html:
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
