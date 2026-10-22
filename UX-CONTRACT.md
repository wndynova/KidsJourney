# Taman Main UI contract

Business evidence: explicit user decisions in this chat, docs/plan.md, PETUNJUK.txt and verified dist/model.mjs schema. No account, server synchronization, payment or remote progress API exists.

| Capability | Canonical owner | Source of truth | Variants | Verification |
|---|---|---|---|---|
| Navigation | app.mjs navigate(), header(), data-go handlers | user-approved screens | home, games, books, progress, parents | browser route and category actions |
| Progress | progress.mjs progressSummary() | active profile, selected level | empty / partial / complete | tests/progress.test.mjs |
| Artwork | gallery.mjs makeGalleryStore(), makeArtAutosaver(); art.mjs player and downloadArt() | user-approved local gallery | new / saved / resumed / blocked storage | tests/gallery.test.mjs and browser gallery workflows |
| Scrollbar | style.css global baseline | DESIGN.md / runtime CSS tokens | platform forced colors | computed style and narrow browser |
| Toast | app.mjs toast(), #toast live region | existing shared feedback | transient notice | existing UI browser checks |
| Modal | app.mjs modal()/closeModal() | shared player and profile flow | wide / normal | focus, Escape, inert background |
| Offline download | sw.js fullRequests(), DOWNLOAD handler; app.mjs downloadOffline() | complete staged English app and audio before replacement | first download / redownload / failed update | tests/offline.test.mjs; browser redownload after audio playback |
| Select/Listbox | existing native selects | existing family and art settings | native, platform-owned popup | existing browser checks; no new select here |

My Adventures reads existing local state and performs no write when viewed. Repeated play counts once in completed-activity totals. Category bars contain only the selected level's activities. A story counts once per profile. Art completions are a subset of games. The Keep playing button uses the existing three-step journey, while recommendation cards open individual activities.

Profile changes must use the existing picker and update every visible number. No other profile's data appears. The profile picker returns to home as before; the progress tab then reads the selected child. No schema migration or new personal information is required.

Empty state: encourage a first game and show real zero counters. Missing profile uses the existing create-profile flow. Blocked localStorage uses the shared storage warning; do not promise persistence when unavailable. Offline relies on the explicit staged service worker download; preserve the previous completed cache after a failed update. Changing category reuses the existing library and its filter state.

My Artwork is a separate localStorage namespace, taman-main-art-v1:<profile id>, so quota failure does not rewrite game progress. Compact versioned records contain only profile/activity identity, revision, timestamps, generated title and validated point/fill data. Canonical geometry is regenerated; undo history and arbitrary SVG/HTML are not stored. No new personal information or external service is needed.

Committed strokes and fills are saved after a short debounce and flushed when closing, leaving the page, manually saving or finishing. Empty paper creates no new record. Resuming updates the same id with revision checking; stale edits are not silently overwritten. New paper first flushes the current work and starts a separate work, preserving the previous saved image. Saving a draft never awards completion. Finishing is blocked on failed artwork save, with an enduring inline error and retry/download actions.

Read failure or malformed records must not trigger automatic deletion or overwrite. Quota failure preserves every prior record and permits SVG backup of the current work. There is no automatic eviction. Saved works remain available across level changes and open at their original level. Viewing or downloading does not modify a work. A profile can access only its own gallery. Deleting a profile through the existing parent gate explicitly includes all its works; if the gallery cannot be removed, do not remove the profile.

Gallery empty state invites a first work; errors remain visible. Thumbnails reserve their aspect ratio, use named native buttons, and open the existing shared modal. Resume opens the existing art player; export uses the same downloadArt helper as that player. Native selects elsewhere are unchanged. Parent-only operations retain the established gate; no artwork sharing, account, legal agreement or external side effect is introduced.

## English edition (22 October 2026)
The user requested a full English edition before publishing. Keep Taman Main as the product name. All runtime UI, accessible names, stories, learning prompts, phonics, feedback, and bundled narration use English. Shared app.mjs components own labels; model.mjs owns the curriculum; games.mjs owns APPLE/BALL/SUN first-letter games and CAT/DOG/SUN onset-rime games. Keep activity IDs, story IDs, localStorage namespaces, profiles, progress, and artwork intact. Display legacy generated Karya N titles as Artwork N through gallery.mjs artworkTitle(); do not rewrite custom titles or stored records. Offline updates must download the complete English app and audio before replacing the previous completed cache.
