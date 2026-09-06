#!/usr/bin/env node

/**
 * Openhead Release Manifest & Checksum Generator
 * Computes SHA-256 checksums and produces a machine-readable manifest of all release artifacts.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ARTIFACTS_DIR = process.argv[2] || path.join(__dirname, '..', 'release-artifacts');
const VERSION = process.env.RELEASE_VERSION || require('../package.json').version || '1.0.0';

function getSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function detectPlatformAndArch(filename) {
  const lower = filename.toLowerCase();
  let platform = 'unknown';
  let arch = 'unknown';
  let type = 'unknown';

  if (lower.includes('windows') || lower.endsWith('.msi') || lower.endsWith('.exe')) {
    platform = 'windows';
    arch = lower.includes('arm64') ? 'arm64' : 'x64';
    type = lower.endsWith('.msi') ? 'installer-msi' : 'installer-exe';
  } else if (lower.includes('macos') || lower.includes('darwin') || lower.endsWith('.dmg') || lower.endsWith('.app')) {
    platform = 'macos';
    arch = lower.includes('arm64') ? 'arm64' : (lower.includes('universal') ? 'universal' : 'x64');
    type = 'dmg';
  } else if (lower.includes('linux') || lower.endsWith('.appimage') || lower.endsWith('.deb') || lower.endsWith('.rpm')) {
    platform = 'linux';
    arch = lower.includes('arm64') || lower.includes('aarch64') ? 'arm64' : 'x86_64';
    type = lower.endsWith('.appimage') ? 'appimage' : (lower.endsWith('.deb') ? 'deb' : 'rpm');
  } else if (lower.endsWith('.apk') || lower.endsWith('.aab')) {
    platform = 'android';
    arch = 'universal';
    type = lower.endsWith('.apk') ? 'apk' : 'aab';
  } else if (lower.endsWith('.ipa')) {
    platform = 'ios';
    arch = 'arm64';
    type = 'ipa';
  }

  return { platform, arch, type };
}

function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.log(`Directory ${ARTIFACTS_DIR} does not exist. Creating empty directory...`);
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => {
    return !f.startsWith('.') && !f.toLowerCase().includes('checksums') && !f.toLowerCase().includes('manifest');
  });

  console.log(`Scanning ${files.length} release artifacts in ${ARTIFACTS_DIR}...`);

  const manifest = {
    release: `v${VERSION}`,
    version: VERSION,
    timestamp: new Date().toISOString(),
    artifacts: []
  };

  const checksumLines = [];

  for (const filename of files) {
    const fullPath = path.join(ARTIFACTS_DIR, filename);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) continue;

    const sha256 = getSha256(fullPath);
    const { platform, arch, type } = detectPlatformAndArch(filename);

    manifest.artifacts.push({
      filename,
      platform,
      arch,
      type,
      sizeBytes: stats.size,
      sha256
    });

    checksumLines.push(`${sha256}  ${filename}`);
    console.log(`  ✓ ${filename} (${platform}-${arch}) - ${sha256}`);
  }

  const checksumsPath = path.join(ARTIFACTS_DIR, `Openhead-${VERSION}-checksums.txt`);
  fs.writeFileSync(checksumsPath, checksumLines.join('\n') + (checksumLines.length ? '\n' : ''));
  console.log(`\nGenerated Checksums: ${checksumsPath}`);

  const manifestPath = path.join(ARTIFACTS_DIR, `Openhead-${VERSION}-manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Generated Manifest: ${manifestPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { detectPlatformAndArch, getSha256 };
