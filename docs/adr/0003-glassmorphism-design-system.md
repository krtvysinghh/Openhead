# ADR 0003: Restrained Glassmorphism Design System

## Status
Accepted

## Context
Modern productivity suites often look utilitarian or excessively decorated. We require a distinct, modern, premium aesthetic that enhances focus and usability.

## Decision
We implement a restrained glassmorphism design system in `@openhead/ui`:
- Layered backdrop blurs (`backdrop-blur-md` / `backdrop-blur-xl`).
- High-contrast typography adhering to WCAG AAA accessibility guidelines.
- Subtle translucent borders (`rgba(255, 255, 255, 0.12)`) and multi-layer depth shadows.
- Atmospheric dark and frost light modes.
- Keyboard-first command palette (`Cmd+K`).

## Consequences
- Premium visual identity while maintaining strict readability.
- Performance-conscious CSS effects that degrade gracefully on lower-end hardware.
