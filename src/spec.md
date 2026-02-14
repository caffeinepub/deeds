# Specification

## Summary
**Goal:** Revert the app UI to the prior experience by restoring the fixed bottom tab navigation and bringing back the Profile and Deeds features that existed before the updated/high-tech navigation.

**Planned changes:**
- Replace the current navigation experience with a fixed bottom tab navigation bar (mobile and desktop) providing access to Home, Discover, Create (opens existing Create Post modal), Messages, Profile, and Hub using existing routes.
- Restore the prior Profile page experience so `/profile` renders correctly and exposes the expected profile sections/actions (header, edit actions, followers/following, notifications, posts) and correctly reflects the active tab in bottom navigation.
- Restore the DeedsBar battery-style session timer and daily usage limit UI (at minimum on Profile), including real-time session updates and client-side per-day usage tracking with daily reset.
- Restore the “Grade Deeds Report Card” UI (at minimum on Profile), including core metrics/overall grade display and a working (dismissible) “Rate Friend” modal/dialog if present.

**User-visible outcome:** Users see the old-style bottom navigation again, can reliably open the Profile page, and can view the Deeds battery usage/timer UI and the Grade Deeds Report Card feature as part of the app experience.
