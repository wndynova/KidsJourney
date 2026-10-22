---
version: alpha
name: Taman Main
description: A garden of English play, stories and art for children learning at home with parents.
colors:
  primary: "#38684e"
  background: "#fcfaf4"
  surface: "#fffef9"
  border: "#e8e9dc"
  accent: "#f6d578"
typography:
  display:
    fontFamily: "Nunito, sans-serif"
  body:
    fontFamily: "DM Sans, sans-serif"
rounded:
  panel: "20px"
  dialog: "26px"
spacing:
  page-max: "1216px"
  section-gap: "28px"
components:
  button:
    owner: "dist/style.css .button"
  card:
    owner: "dist/app.mjs card()"
  dialog:
    owner: "dist/app.mjs modal()"
---

# Taman Main design context

## Overview
English-speaking preschool and kindergarten children play at home with parents. This is a child product surface, not an administrative dashboard. The user approved a child progress garden called My Adventures on 22 October 2026.

## Creative North Star
A small garden tended through play: cream paper, forest green controls, pastel activity beds and rounded illustrations. My Adventures's signature is five planting beds that grow as activities are completed. Numbers explain the child's own activity history, without rankings, streaks, deadlines or rewards for daily attendance.

## Colors and runtime ownership
Existing dist/style.css :root variables are the canonical runtime source; this document records roles rather than generating a second token system. Reuse --green, --cream, --ink, --muted and --line. Existing .mint, .sky, .pink, .yellow and .lavender own activity color variants. New progress components reuse them. Explicit decorative colors may come from these existing surface variants.

## Typography
Keep the established Nunito display and DM Sans body roles; retain existing local sans-serif fallbacks when Google Fonts are unavailable offline. Use readable sentence case and plain English. No new font dependency.

## Layout
Reuse header(), navigate(), .main, .button and activity cards. The garden is five columns on wide screens, three at tablet width and two on phones. Counters form a quiet shared strip. Primary action is Keep playing; category beds open the existing filtered library. Avoid adding a separate navigation shell.

## Shape, elevation and states
Use established 20px panels, soft borders and 26px dialogs. Rounded buttons retain keyboard focus. No hover-only content. Empty progress invites a first activity; completed progress invites replay. Profile changes refresh the page from the newly selected child's stored data.

## Motion and access
Honor the existing reduced-motion override. Garden plants are decorative and have text equivalents. Counters and progress bars are named, touch controls are generous, and category actions remain native buttons. Visible and operable scrollbars use stylesheet tokens and platform high-contrast fallbacks.

## Data visualization
Count distinct completed activities in the selected level. Art is a subset of that count, not an additional total. Stories count once per profile across levels. Changing levels retains prior history but updates the visible denominators. My Artwork separately shows saved artwork from both levels for the active profile; saving an unfinished draft does not count as completing an activity. Daily history is not stored.

## My Artwork
User-approved on 22 October 2026. Use paper-like thumbnails regenerated from validated stroke/fill data. Three columns on wide screens, two on tablet and one on narrow phones. Reuse modal(), the art player and shared SVG download behavior. No copied remote image or raw stored SVG is rendered. Artwork is local, private to a profile, editable and available offline. Show six newest works first with an explicit reveal-more action.

## English edition (22 October 2026)
The user requested a full English edition before publishing. Keep Taman Main as the product name. All runtime UI, accessible names, stories, learning prompts, phonics, feedback, and bundled narration use English. Shared app.mjs components own labels; model.mjs owns the curriculum; games.mjs owns APPLE/BALL/SUN first-letter games and CAT/DOG/SUN onset-rime games. Keep activity IDs, story IDs, localStorage namespaces, profiles, progress, and artwork intact. Display legacy generated Karya N titles as Artwork N through gallery.mjs artworkTitle(); do not rewrite custom titles or stored records. Offline updates must download the complete English app and audio before replacing the previous completed cache.

## Phone controls and number painting (22 October 2026)
The shared responsive stylesheet owns a minimum 44px button touch target up to 950px; Listen again and hint controls use 48px height. The phone header keeps branding and profile tools in two columns with navigation below. Number Paint uses 28-unit SVG digits. Kindergarten wing labels sit outside the decorative spots, while region identities, geometry and stored fill data remain unchanged. The same anchors are used by the player, gallery previews and SVG exports through artContent().

The mobile touch rules also cover the shared `.button.small` variant, including Finish drawing in both tracing activities. Scoped modal selectors preserve the 48px Listen again and hint controls against the general 44px button rule. These overrides stay in the shared responsive block so every game and completion dialog inherits the same target sizes.

Opening a modal clears the previous screen's transient toast and its dismissal timer. New status messages raised inside the modal still appear; noninteractive toasts never intercept pointer input. This prevents a recent level-change message from covering a game's lower controls.

## Offline updates (23 October 2026)
The service worker requests full resources with HTTP cache mode `reload` when staging an offline package. This avoids partial media responses left by playback while preserving the site's deployment subpath. The complete replacement and its marker must exist before the old package is removed. Failure diagnostics identify the download phase and underlying cause in the developer console; the child-facing flow keeps its existing friendly messages.
