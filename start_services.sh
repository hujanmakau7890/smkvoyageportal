#!/bin/bash

# Tunggu beberapa detik untuk memastikan network sudah up saat booting
sleep 10

cd /home/fleet/smkvoyageportal

# Start Vite Frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /home/fleet/smkvoyageportal/vite.log 2>&1 &

# Start Python PDF Sink
nohup python3 backend/pdf_sink.py > /home/fleet/smkvoyageportal/pdf_sink.log 2>&1 &

# Start Cloudflared Tunnel
nohup /home/fleet/.local/bin/cloudflared tunnel run --token eyJhIjoiMDYwMDQwN2ZkNjEyN2E2MjlkNWRjYWE4YzhkNDJkMmYiLCJ0IjoiNjA0OTA5NzctNmFkNS00MDZjLWIyNjEtOTQ5OTQzOWQzNmNmIiwicyI6Ik0yVXdORFJrWXpndFpXRmhNUzAwT1RFMkxUZzNPVFF0TnpOa01HRm1ObUppTnpsaiJ9 > /home/fleet/smkvoyageportal/cloudflared.log 2>&1 &
