# Taman Main — Grow through play

A small garden of English learning games, stories, and art for preschool and kindergarten children to explore with a grown-up.

- 28 activities across two learning levels, plus two picture storybooks.
- Free Drawing, Color Garden, Number Paint, and Twin Colors with mirrored drawing.
- My Adventures progress dashboard and editable My Artwork gallery for each profile.
- 168 bundled English narration recordings. No runtime API key is needed.
- Offline download for games, stories, artwork tools, and narration.

## Run locally

Use Node.js 24 or newer:

```sh
node server.mjs
```

Open http://127.0.0.1:4173/. Windows users can also run `Start-Taman-Main.cmd`.

```sh
node --test tests/*.test.mjs
```

## GitHub Pages

The workflow in `.github/workflows/pages.yml` verifies the app, uploads `dist`, and publishes it to GitHub Pages after a push to `main`. In repository **Settings → Pages**, select **GitHub Actions** as the source. Relative asset URLs support both a repository subpath and a custom domain.

After the first online visit, open the **Grown-up area → Download for offline** and wait for the English download to finish. Use the same URL and browser to access the saved copy.

## Local data

Profiles, settings, progress, and artwork stay in the current browser on the current device. There is no account or cloud synchronization. A GitHub Pages address has separate storage from localhost; local progress and artwork do not transfer automatically. Export SVG copies of artwork when needed. Clearing browser data removes saved data.

## Narration

The English edition includes prerecorded English speech. It plays the bundled MP3 files without an installed system voice, an API account, or a live text-to-speech service. See `AUDIO-KREDIT.txt` for recording details.

Play together with a grown-up. These activities are early practice, rather than a developmental assessment or an educator-validated curriculum.
