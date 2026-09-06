import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

describe('Release Manifest & Platform Detection', () => {
  it('should accurately detect platform, architecture, and file types', () => {
    // Import helper functions
    const { detectPlatformAndArch } = require('../../scripts/generate_release_manifest.js');

    const windowsMsi = detectPlatformAndArch('Openhead-1.0.0-Windows-x64.msi');
    expect(windowsMsi.platform).toBe('windows');
    expect(windowsMsi.arch).toBe('x64');
    expect(windowsMsi.type).toBe('installer-msi');

    const macDmg = detectPlatformAndArch('Openhead-1.0.0-macOS-arm64.dmg');
    expect(macDmg.platform).toBe('macos');
    expect(macDmg.arch).toBe('arm64');
    expect(macDmg.type).toBe('dmg');

    const linuxAppImage = detectPlatformAndArch('Openhead-1.0.0-Linux-x86_64.AppImage');
    expect(linuxAppImage.platform).toBe('linux');
    expect(linuxAppImage.arch).toBe('x86_64');
    expect(linuxAppImage.type).toBe('appimage');

    const linuxDeb = detectPlatformAndArch('Openhead-1.0.0-Linux-amd64.deb');
    expect(linuxDeb.platform).toBe('linux');
    expect(linuxDeb.type).toBe('deb');

    const androidApk = detectPlatformAndArch('Openhead-1.0.0-Android.apk');
    expect(androidApk.platform).toBe('android');
    expect(androidApk.type).toBe('apk');

    const iosIpa = detectPlatformAndArch('Openhead-1.0.0-iOS.ipa');
    expect(iosIpa.platform).toBe('ios');
    expect(iosIpa.type).toBe('ipa');
  });

  it('should compute valid SHA-256 hashes matching standard crypto implementations', () => {
    const { getSha256 } = require('../../scripts/generate_release_manifest.js');
    const tempFile = path.join(__dirname, 'temp_test_artifact.bin');
    const testContent = Buffer.from('Openhead Release Verification Payload 1.0.0');
    fs.writeFileSync(tempFile, testContent);

    try {
      const calculatedHash = getSha256(tempFile);
      const expectedHash = crypto.createHash('sha256').update(testContent).digest('hex');
      expect(calculatedHash).toBe(expectedHash);
      expect(calculatedHash.length).toBe(64);
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  });
});
