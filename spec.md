# Specification

## Summary
**Goal:** Add five new social features to the Deeds app: Ripple Effect Stories, Love Notes to Strangers, Deed of the Day Challenges, Kindness Matches, and Memory Jars — each with backend storage/query support and dedicated frontend UI.

**Planned changes:**
- **Ripple Effect Stories:** Add backend support for posts referencing a parent post (inspiration source) and ripple chain queries. Add a "This inspired me ✨" button on each PostCard that opens a pre-linked post creation modal, and display the ripple chain as a visual tree/timeline beneath the original post.
- **Love Notes to Strangers:** Add backend support for anonymous positivity notes with random recipient assignment. Add a Love Notes page with a send form (280-char limit) and a received-notes inbox styled as sealed envelope cards that animate open on click.
- **Deed of the Day Challenges:** Add backend support for a daily challenge prompt and user completion tracking. Add a Deed of the Day page with a celebratory hero card, live countdown timer, "Accept & Complete" button, and a community wall of completions with a progress ring and participant count.
- **Kindness Matches:** Add backend support for compatibility scoring based on overlapping deed categories, storing match pairs with scores and reason text. Add a Kindness Matches page showing up to 5 match cards with compatibility percentage, shared categories, reason, and a "Say Hello 👋" button that opens Messages pre-addressed to that user.
- **Memory Jars:** Add backend support for saving/unsaving posts to a personal Memory Jar collection. Add a jar/bookmark icon on every PostCard with a fill animation on save, and a Memory Jar tab on the Profile page showing saved posts in a warm scrapbook grid layout with a count badge.
- **Navigation & Routing:** Update the Header component to include links to Love Notes, Deed of the Day, and Kindness Matches. Register all new pages as routes in App.tsx.

**User-visible outcome:** Users can chain inspired deeds into ripple stories, send and receive anonymous love notes, participate in a shared daily challenge with the whole community, discover friendship matches based on shared deed categories, and save favourite deeds into a personal Memory Jar scrapbook they can revisit anytime.
