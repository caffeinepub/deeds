# Specification

## Summary
**Goal:** Restore missing icons throughout the app and make core actions accessible from a single, scrollable hub, while smoothing video-mode transitions.

**Planned changes:**
- Audit and fix icon rendering across all main screens (Gate, Feed, Discover, Profile, Messages, Live, Blog, Marketplace, Admin) and global UI (Header/Footer), covering both lucide-react and `/assets/generated` image icons.
- Add safe UI fallbacks for any icon image load failures so buttons/controls never appear blank.
- Add a single, vertically scrollable “All-in-one” hub as the default entry route (`/`) with clearly labeled, icon-visible sections linking to: Feed, Discover, Create Post, Messages, Profile, Live, Blog, Marketplace.
- Improve full-screen video-mode transitions so entering/exiting is smooth, avoids state updates during render, reliably enters via the Videos filter, and returns to the prior scroll context with state preserved.

**User-visible outcome:** Icons consistently appear across the app (with non-blank fallbacks if an asset fails), users can access core features from one scrollable hub at `/`, and video-mode transitions feel smooth and return users to where they left off.
