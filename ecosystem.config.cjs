module.exports = {
  apps: [
    {
      name: "frontend-vite",
      script: "npm",
      args: "run dev -- --host 0.0.0.0 --port 5173",
      cwd: "/home/fleet/smkvoyageportal",
      watch: false
    },
    {
      name: "backend-pdf",
      script: "python3",
      args: "backend/pdf_sink.py",
      cwd: "/home/fleet/smkvoyageportal",
      watch: false
    },
    {
      name: "cloudflared-tunnel",
      script: "/home/fleet/.local/bin/cloudflared",
      args: "tunnel run --token eyJhIjoiMDYwMDQwN2ZkNjEyN2E2MjlkNWRjYWE4YzhkNDJkMmYiLCJ0IjoiNjA0OTA5NzctNmFkNS00MDZjLWIyNjEtOTQ5OTQzOWQzNmNmIiwicyI6Ik0yVXdORFJrWXpndFpXRmhNUzAwT1RFMkxUZzNPVFF0TnpOa01HRm1ObUppTnpsaiJ9",
      cwd: "/home/fleet/smkvoyageportal",
      watch: false
    }
  ]
};
