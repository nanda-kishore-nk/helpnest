# HelpNest — Zero-Budget Architecture & Free Services Evaluation

> **Zero-Budget Rule**: Platform development budget is ₹0 / $0.
> No paid dependencies, no automatic overages, no mandatory credit cards.
> If any external service quota is reached, core HelpNest functionality MUST degrade gracefully without breaking or incurring cost.

---

## Free Service Decision Matrix

| SERVICE | PURPOSE | PROVIDER | FREE LIMIT | CARD REQUIRED? | WHAT HAPPENS AT LIMIT? | FALLBACK | REPLACEMENT DIFFICULTY |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Static & Edge Hosting** | Web application hosting, static asset delivery, client router | Vercel (Hobby Tier) / Cloudflare Pages / Netlify | 100 GB bandwidth / mo, unlimited static requests | No | HTTP 402 or site paused; no automatic bill | Deploy to GitHub Pages or Cloudflare Pages instantly | Low (Single-command deployment to any static host) |
| **Relational Database** | User profiles, requests, offers, interactions, achievements, audit logs | PostgreSQL via Supabase / Neon (Free Tier) / LocalStorage & IndexedDB Engine | Supabase: 500 MB DB, 50,000 MAU; Neon: 0.5 GB storage; Local: Unlimited client-side | No | Free instances halt new writes or throttle; no auto-charging | Autonomous LocalStorage & IndexedDB offline-first repository with export/import | Low (Repository Pattern abstracts all queries) |
| **Authentication & Identity** | User registration, login, session management, RBAC | Free-first hierarchy: Google OAuth + Email Magic Link + Session Storage | Supabase Auth: 50,000 MAU free / Self-contained PBKDF2/WebCrypto session engine | No | Auth requests rejected; zero charges | In-app secure tokenized links, temporary onboarding passwords with mandatory change | Low |
| **OTP / Phone Verification** | User phone verification (optional) | Optional provider abstraction (`PHONE_OTP_ENABLED: false` by default) | 0 free carrier SMS (Carrier SMS has unavoidable cost) | N/A | Feature disabled by default to prevent charges | Verified Email, Google OAuth, and In-App verification flags. UI accurately labels method. | Low (Provider interface ready for Twilio/MSG91 if funded later) |
| **Transactional Email** | Password setup invitations, account notifications, urgent alerts | Resend / Brevo (Sendinblue) / In-App Notifications fallback | Resend: 3,000 emails/mo (100/day); Brevo: 300 emails/day | No | Sends drop / return 429 quota error | Graceful degradation to In-App Notification Center and copyable invitation links | Low (Standard SMTP / REST email client abstraction) |
| **Interactive Maps & Geocoding** | Nearby help lookup, approximate distance calculation, locality discovery | OpenStreetMap (OSM) Tiles + Leaflet + Nominatim API | OSM: Fair use policy (1 req/sec Nominatim); Leaflet: Free & Open Source (BSD-2) | No | Nominatim throttles with HTTP 429 | Manual locality text selection, client-side Haversine distance calculator | Very Low (Open standard GeoJSON & Leaflet) |
| **Media & Evidence Storage** | Profile pictures, proof of return, request photos, report attachments | Client-side Canvas image compression (WebP/JPEG, max 2MB) + Supabase Storage / Local Base64 | Supabase: 1 GB free bucket / Client-side local persistence cache | No | Upload errors with quota exceeded notice | Graceful warning: "Image upload temporarily unavailable. Post created without image." Posts function without images. | Low (Standard S3-compatible or local blob interface) |
| **UI Components & Icons** | Design system, responsive layouts, accessible controls, iconography | Tailwind CSS + Lucide Icons + Native HTML5/Web APIs | 100% Free Open Source (MIT) | No | Never expires, run entirely locally | Completely self-contained within project repository | None |
| **Interactive Charts & Analytics** | Platform metrics, help distribution, category trends, user growth | Custom SVG/Canvas Vector Charting Engine (Line, Bar, Donut, Area) | 100% Free Open Source, Zero Bundle Cost | No | Unlimited, runs on real database calculations in browser/server | Completely self-contained, no external API calls | None |
| **CSV Export & Audit Reporting** | Data export for admins, reports, CSV bulk user creation | RFC-4180 Native TypeScript Parser and Stream Generator | 100% Free Open Source, Zero Cost | No | Unlimited | Browser Blob download API | None |

---

## Central Feature Flags (`src/config/features.ts`)

HelpNest controls external dependencies and potential cost vectors via central feature flags:

```typescript
export const FEATURE_FLAGS = {
  // STRICT ZERO-BUDGET SAFETY: Disabled by default to prevent paid SMS costs
  PHONE_OTP_ENABLED: false,

  // Gracefully falls back to In-App notifications if email provider hits quota
  EMAIL_NOTIFICATIONS_ENABLED: true,

  // Uses OpenStreetMap and standard Web Geolocation API (zero Google Maps API billing)
  MAPS_ENABLED: true,

  // Compresses images client-side before upload; degrades gracefully if storage is full
  IMAGE_UPLOADS_ENABLED: true,

  // Organization and college bulk provisioning
  ORGANIZATIONS_ENABLED: true,

  // Database-driven community achievement and badge evaluation engine
  ACHIEVEMENTS_ENABLED: true,
};
```

---

## Graceful Quota Exhaustion Guarantees

1. **Email Unavailable**:
   - In-app notification center continues to deliver all updates in real-time.
   - For user provisioning, Admin can copy the secure invitation link directly from the UI to share via WhatsApp, Slack, or direct message.
2. **Map Geocoding Unavailable**:
   - Users can manually type or select their neighborhood, city, or district name.
   - Distance estimation falls back to district/postal code centroid matching.
3. **SMS Unavailable**:
   - UI never pretends to send SMS. Accurately labels accounts as "Email Verified" or "Google Verified".
4. **Image Storage Full**:
   - Post creation proceeds without requiring images.
   - Friendly toast explains that file upload is temporarily unavailable while the request is still successfully published.
5. **No Billing Disclosures**:
   - Zero billing credentials configured in repository or runtime. Automatic overages are impossible.
