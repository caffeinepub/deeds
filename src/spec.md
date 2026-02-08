# Specification

## Summary
**Goal:** Remove the wheel-based reel navigation and replace it with a simpler, modern navigation mechanic that works well on mobile and desktop.

**Planned changes:**
- Remove all wheel navigation code from the reel experience (UI components, hooks, event listeners, and wheel-specific styling/classes) so it is no longer imported, rendered, or referenced anywhere.
- Implement a new simple navigation UI on the main reel route (`/`) that provides one-tap access to core sections (Home/Reel, Discover, Create Post, Messages, Profile, Hub).
- Update `ReelHome` (including empty-feed state) and related layout logic to use only the new navigation (no duplicate/confusing navigation patterns), and ensure all targets route correctly (`/`, `/discover`, `/messages`, `/profile`, `/hub`).
- Apply a coherent, distinct visual theme to the new navigation and reel experience (simple, modern; avoid blue/purple as the primary identity unless already present) with clear, accessible active states and English labels/aria-labels.

**User-visible outcome:** The reel-first experience no longer shows the wheel scroller; users get a simple, consistent navigation control on `/` that lets them quickly switch between core sections and open Create Post without interfering with the reel feed’s vertical scrolling.
