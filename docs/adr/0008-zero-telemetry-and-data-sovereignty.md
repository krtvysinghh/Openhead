# ADR 0008: Zero-Telemetry Invariant & Complete Data Sovereignty

## Status
Accepted

## Context
Mainstream productivity software frequently transmits background analytics, telemetry beacons, crash dumps, and document metadata to centralized corporate servers without granular user consent.

## Decision
1. Implement `ZeroTelemetryPolicy` in `@openhead/core` with runtime invariants:
   - `TELEMETRY_ENABLED = false`
   - `ALLOW_ANALYTICS_BEACONS = false`
   - `ALLOW_AUTOMATIC_CRASH_UPLOADS = false`
2. Block all outbound network requests by default. Only explicit user-configured local endpoints (such as local Ollama instances) are allowed.
3. Store all files, settings, and crash logs exclusively on the local filesystem.
4. Hard denial of all active macro execution (VBA, VBScript, OLE scripts) to eliminate remote command execution vectors.

## Consequences
- Uncompromising privacy guarantee for sensitive legal, financial, and personal data.
- Air-gap compatibility for high-security enterprise and government environments.
