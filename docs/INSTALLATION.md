# Openhead Office — Installation Guide

Openhead v1.0.0 is available across Desktop, Mobile, Docker, and Source builds.

---

## 🖥️ Desktop Installation

### Windows (x64)
1. Download `Openhead-1.0.0-Windows-x64.msi` or `Openhead-1.0.0-Windows-x64.exe` from [GitHub Releases](https://github.com/krtvysinghh/Openhead/releases).
2. Run the installer and follow setup instructions.
3. Openhead associates with `.docx`, `.odt`, `.xlsx`, `.ods`, `.csv`, `.pptx`, and `.odp`.

### macOS (Apple Silicon & Intel)
1. Download `Openhead-1.0.0-macOS-universal.dmg` (or `-arm64.dmg` / `-x64.dmg`).
2. Open the `.dmg` and drag `Openhead Office.app` to your `/Applications` folder.
3. Launch Openhead from Launchpad or Spotlight.

### Linux (x86_64 / amd64)
* **AppImage**:
  ```bash
  chmod +x Openhead-1.0.0-Linux-x86_64.AppImage
  ./Openhead-1.0.0-Linux-x86_64.AppImage
  ```
* **Debian / Ubuntu (.deb)**:
  ```bash
  sudo dpkg -i Openhead-1.0.0-Linux-amd64.deb
  sudo apt-get install -f
  ```

---

## 📱 Mobile Installation

### Android
* **Direct Install (.apk)**: Download `Openhead-1.0.0-Android.apk` from GitHub Releases and install on your device.
* **Play Store (.aab)**: Google Play Store distribution bundle for supported regions.

### iOS / iPadOS
* **TestFlight / App Store (.ipa)**: Distributed through Apple TestFlight / App Store.

---

## 🐳 Docker & Self-Hosted
```bash
docker run -d -p 8080:8080 --name openhead ghcr.io/krtvysinghh/openhead:1.0.0
```

---

## 🛠️ Build from Source

```bash
git clone https://github.com/krtvysinghh/Openhead.git
cd Openhead
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm dev
```
