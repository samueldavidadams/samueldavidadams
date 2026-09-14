# samueldavidadams.com

Personal site. Static HTML/CSS/JS, no build step, no framework — each page is a plain `index.html` in its own folder (e.g. `reading/index.html`), sharing the root `style.css` and `script.js`.

## Design language — keep this consistent as the site grows

- **Hexagons, not circles or squares.** The page-navigation cluster (`.hive` / `.app-icon-hex`) uses true tessellating hexagons. Any new interactive/navigational shape added to the site should stay hexagonal rather than introducing a new shape language.
- **Thin outline style, not filled/solid.** Icons and borders use thin lines (`stroke-width: 1.5`, `border: 1.5px solid currentColor`), no drop shadows, no heavy fills. The one exception is the hover state, which solid-fills as a deliberate "active" signal — that contrast only works because everything else stays thin-lined.
- **Minimal, restrained, monochrome-ish.** Everything renders in `currentColor` (near-black) against a warm cream background (`#fffbf1`, with a subtle time-of-day tint). No accent colors have been introduced — keep it that way unless asked.
- **Quiet motion, not busy.** Animations are subtle and occasional (a build-in on load, a random single-hex flip every several seconds) rather than continuous/attention-grabbing. Avoid adding constant motion (e.g. the old bouncing circles were deliberately replaced with this calmer approach).

When adding new pages or UI, favor extending this existing language over introducing new shapes, colors, or heavier visual treatments.
