# Openhead Office — Self-Hosting & Deployment Guide

Openhead is designed as an offline-first, zero-telemetry office suite. You can run Openhead completely isolated inside your private infrastructure, home lab, or local network.

## Architecture Overview

Openhead's web studio is a pure client-side SPA (Single-Page Application). All document parsing, formula calculation, presentation rendering, and AI operations occur strictly inside the client runtime (browser or desktop sandbox) with **zero telemetry** and no mandatory cloud dependencies.

---

## 1. Running with Docker

### Quick Start

Run the production container directly:

```bash
docker run -d \
  --name openhead \
  -p 8080:8080 \
  --restart unless-stopped \
  ghcr.io/krtvysinghh/openhead:1.0.0
```

Access the suite at `http://localhost:8080`.

### Using Docker Compose

```yaml
version: "3.8"

services:
  openhead:
    image: ghcr.io/krtvysinghh/openhead:1.0.0
    container_name: openhead-office
    restart: unless-stopped
    ports:
      - "8080:8080"
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
      - /var/run
```

Start the service:
```bash
docker compose up -d
```

---

## 2. Reverse Proxy & TLS Configuration

When deploying behind a reverse proxy (e.g., Caddy, Nginx, Traefik), ensure standard TLS termination and security headers.

### Caddy Example
```caddyfile
office.yourdomain.com {
    reverse_proxy localhost:8080
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
    }
}
```

---

## 3. Local-First Storage & Data Persistence

* **Document Storage**: Documents created in the web studio are stored locally in the browser's IndexedDB / LocalStorage with atomic SHA-256 checksums.
* **Desktop Storage**: Native desktop installations store files directly in standard user filesystem directories (`Documents`, `Desktop`, custom paths) using native file pickers.
* **Backup & Migration**: Use the **Export** menu or `Ctrl+S` to export documents as `.docx`, `.xlsx`, `.pptx`, or raw JSON.

---

## 4. Privacy & Zero-Telemetry Invariants

* **No Tracking**: Openhead contains zero Google Analytics, telemetry beacons, Sentry, or third-party tracking scripts.
* **Local AI**: When configuring local AI assistants (Ollama / LocalAI / LM Studio), connections stay strictly on `http://127.0.0.1` or `http://localhost` unless the user explicitly defines a custom endpoint.
