// src/config/features.ts
import { FeatureFlags } from '../types';

/**
 * Centralized Feature Flags (Section AF)
 * Designed for strict zero-budget operations.
 * Any expensive, unavailable, or quota-limited service can be toggled without breaking HelpNest.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // STRICT ZERO-COST SAFEGUARD: False by default to prevent SMS carrier charges
  PHONE_OTP_ENABLED: false,

  // Transactional notifications gracefully degrade to In-App Notification Center when quota exhausts
  EMAIL_NOTIFICATIONS_ENABLED: true,

  // Free OpenStreetMap + Leaflet + Nominatim (zero Google Maps API fees)
  MAPS_ENABLED: true,

  // Client-side canvas image compression with fallback if cloud storage is full
  IMAGE_UPLOADS_ENABLED: true,

  // Organization and college bulk provisioning
  ORGANIZATIONS_ENABLED: true,

  // Automated mutual aid milestone & badge evaluation engine
  ACHIEVEMENTS_ENABLED: true,
};

// Retrieve flags from localStorage or default
export function getFeatureFlags(): FeatureFlags {
  try {
    const saved = localStorage.getItem('helpnest_feature_flags');
    if (saved) {
      return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to parse feature flags, using defaults', e);
  }
  return DEFAULT_FEATURE_FLAGS;
}

export function saveFeatureFlags(flags: FeatureFlags): void {
  try {
    localStorage.setItem('helpnest_feature_flags', JSON.stringify(flags));
  } catch (e) {
    console.error('Failed to save feature flags', e);
  }
}
