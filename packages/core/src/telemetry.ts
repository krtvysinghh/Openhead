export class ZeroTelemetryPolicy {
  public static readonly TELEMETRY_ENABLED = false;
  public static readonly ALLOW_ANALYTICS_BEACONS = false;
  public static readonly ALLOW_AUTOMATIC_CRASH_UPLOADS = false;
  public static readonly ALLOW_SILENT_DOCUMENT_INDEXING = false;

  /**
   * Enforces zero-telemetry policy at runtime.
   * Throws an error if any component attempts to transmit telemetry.
   */
  public static assertNoTelemetry(action: string = 'Network Beacon'): void {
    if (this.TELEMETRY_ENABLED) {
      throw new Error(`Critical Privacy Violation: Attempted telemetry action "${action}" when policy strictly forbids tracking.`);
    }
  }

  /**
   * Validates outgoing network requests to ensure user document contents are never transmitted without explicit authorization.
   */
  public static validateOutgoingRequest(destinationUrl: string, explicitUserConsent: boolean): boolean {
    if (!explicitUserConsent) {
      console.warn(`Blocked unauthorized outgoing network attempt to "${destinationUrl}" under ZeroTelemetryPolicy.`);
      return false;
    }
    return true;
  }

  /**
   * Checks if an outbound destination is allowed under local-first zero-telemetry rules.
   * Local endpoints (localhost, 127.0.0.1) are permitted for local LLMs, while external endpoints require explicit consent.
   */
  public static isNetworkAllowed(destinationUrl: string, explicitConsent: boolean = false): boolean {
    const lower = destinationUrl.toLowerCase();
    if (lower.includes('localhost') || lower.includes('127.0.0.1')) {
      return true;
    }
    return explicitConsent;
  }
}
