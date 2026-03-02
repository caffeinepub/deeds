# Specification

## Summary
**Goal:** Fix broken features and implement missing features on the Deeds platform, including Memory Jars, Profile page, deed categories, Profile Report Card, Deeds Bar, and a lock screen overlay.

**Planned changes:**
- Fix Memory Jars feature: display saved posts as polaroid-style cards in MemoryJarView, allow saving posts from the feed, add public/private toggle, send notifications to original posters when their deed is saved, and enable removal of entries
- Fix Profile page: render avatar, display name, bio, follower/following counts, user posts, profile picture upload, status update button, and Memory Jar section without blank screen
- Fix deed categories on the feed/CreatePostModal: dynamically display randomized category options drawn from a curated pool (Kindness, Community, Family, Health, Environment, Creativity, Education, Support), save selected category with the post and show it as a badge on PostCard
- Implement Profile Report Card: weekly activity summary (posts, deeds completed, likes received, kindness matches) on the profile page with user-selectable grading scale (letter A–F, star 1–5, or percentage 0–100%) and a public/private toggle
- Implement Deeds Bar on the profile page only: a 19-hour daily activity tracker with a light baby blue lightning-bolt background and floating bear, pineapple, and monkey head icons animating inside the bar, progress driven by useDeedsUsage hook
- Implement lock screen overlay: full-screen overlay triggered when daily usage reaches 19 hours, shown on every page/route, containing a message with bold key terms; clicking any bold term dismisses it and stores dismissal in sessionStorage until the next day

**User-visible outcome:** Users can view and manage their Memory Jars, load their Profile page correctly, select deed categories when creating posts, view their weekly Report Card with a chosen grading style, track daily usage via the Deeds Bar on their profile, and encounter a lock screen overlay when the 19-hour daily limit is reached.
