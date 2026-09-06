import { describe, it, expect } from 'vitest';
import { ThemeEngine } from '../themes';
import { ZeroTelemetryPolicy } from '../telemetry';

describe('ThemeEngine & ZeroTelemetryPolicy Guardrails', () => {
  it('should provide comprehensive theme tokens with high contrast ratio validation', () => {
    const darkTheme = ThemeEngine.getTheme('dark');
    expect(darkTheme.isDark).toBe(true);
    expect(darkTheme.accent).toBe('#6366f1');

    const highContrast = ThemeEngine.getTheme('high-contrast');
    expect(highContrast.background).toBe('#000000');
    expect(highContrast.textPrimary).toBe('#ffffff');

    // Calculate contrast ratio: white text on black background should be 21:1
    const contrastRatio = ThemeEngine.calculateContrastRatio('#ffffff', '#000000');
    expect(contrastRatio).toBeCloseTo(21, 0);
  });

  it('should enforce zero telemetry invariants and block unauthorized network requests', () => {
    expect(ZeroTelemetryPolicy.TELEMETRY_ENABLED).toBe(false);
    expect(ZeroTelemetryPolicy.ALLOW_ANALYTICS_BEACONS).toBe(false);
    expect(ZeroTelemetryPolicy.ALLOW_AUTOMATIC_CRASH_UPLOADS).toBe(false);

    // Explicit consent false -> blocked
    const allowedWithoutConsent = ZeroTelemetryPolicy.validateOutgoingRequest('https://telemetry.evil.com', false);
    expect(allowedWithoutConsent).toBe(false);

    // Explicit consent true -> allowed
    const allowedWithConsent = ZeroTelemetryPolicy.validateOutgoingRequest('http://localhost:11434/api/generate', true);
    expect(allowedWithConsent).toBe(true);
  });
});
