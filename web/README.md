# HD Cares frontend

Rebuilt local React + TypeScript frontend using Vite, Tailwind CSS 4, Motion for React, Motion Primitives source components, and Lucide icons. Node.js 24 LTS is recommended. The design is now dark charcoal with sage accents, a large liquid sculpture, and layered dimensional illustrations.

## Development

```powershell
cd "C:\Users\HARSH DIXIT\OneDrive\Documents\ChatGPT\hdcares\web"
npm install
npm run dev
```

Use the Local URL printed in the terminal. If another server is using the default port, Vite prints the next available port. Leave the terminal running while reviewing; save source edits to see updates. Ctrl+C stops your server.

For a fresh installation using the checked-in dependency versions:

```powershell
npm ci
npm run dev
```

To verify and preview a production build:

```powershell
npm run build
npm run preview
```

## Where to edit

- `src/App.tsx`: rebuilt page composition, navigation, animated illustration scenes, prevention/reporting walkthrough, resource links, and FAQ.
- `src/styles.css`: new dark design, glass surfaces, responsive layouts, perspective transforms, and continuous scene animations.
- `src/components/ui/liquid-sculpture-hero.tsx`: new renderer lifecycle, explicit motion state, visibility handling, and animated Canvas2D fallback.
- `src/lib/liquid-engine.ts`: GPGPU engine freshly extracted from the latest user attachment, with autonomous idle simulation and initial WebGL error detection. Original author attribution is retained.
- `src/lib/sculpture-motion.ts`: deterministic surface deformation and responsive sizing for the fallback renderer.
- `src/components/motion-primitives/`: upstream AnimatedGroup and TextEffect source. AnimatedGroup was adapted for React 19 types, scroll entry, and reduced-motion handling. The MIT license is retained alongside these files.
- `public/`: locally bundled sculpture artwork from the supplied component plus original shield and orbital-heart SVG illustrations.

The `@/` alias resolves to `src/`. `components.json` configures shadcn-compatible paths; reusable UI belongs in `src/components/ui`, and global styles are in `src/styles.css`. Tailwind runs through its Vite plugin, so no separate legacy Tailwind config is required.

## Implemented interactions

- A large, scrollable hero with continuously moving GPU particles. The idle wake is simulated without requiring cursor input; the user's pointer takes priority.
- If WebGL fails or no first GPU frame arrives, an animated Canvas2D warp bends and stretches adjacent slices of the sculpture. This is a visual depth/liquid effect based on the supplied artwork, not a fully modelled 3D mesh.
- Glass navigation and an expandable mobile menu.
- Motion Primitives text reveals and staggered resource links.
- A dimensional shield, layered case interface, and metallic orbital-heart illustration, with continuous rotation/floating and pointer-responsive perspective.
- A switchable prevention/reporting walkthrough with selectable steps.
- Animated FAQ disclosures and functioning external guidance links.
- Motion starts automatically on every page load, as requested. There is no Play/Pause button and no system-preference gate for the sculpture or section animations.
- The GPU renderer and CPU fallback suspend when hidden; scene loops pause outside the viewport.

The site is an explanatory frontend, not a live safety service: no intimate image uploads, fingerprint registration, complaint submission, accounts, or takedowns. External resources have their own policies and eligibility.

## Review status

TypeScript and production build passed. `npm test` passes four regression tests covering visible idle deformation, independent surface movement, exact pause behaviour, and mobile/desktop layout geometry. These tests do not verify GPU output. Browser/visual review is left to the user as requested; no preview server was started for this rebuild.

For diagnostics, the sculpture container exposes `data-renderer="webgl2"`, `"canvas2d"`, or `"image"`; GPU failure reasons appear in the browser console. Both WebGL2 and Canvas2D start motion automatically. The image-only path is reserved for browsers without either canvas renderer.

UI UX Pro Max was requested but was not present in the installed skills. The design was implemented directly; that skill has not been installed or represented as used.

## Custom cursor-lift headline

`src/components/ui/cursor-lift-headline.tsx` implements an original cursor-proximity letter-lift effect using the existing Motion dependency. Nearby letters rise in perspective, reveal layered sage extrusion, and settle with springs. The original off-white text, serif accent, and responsive word wrapping are preserved.

An introductory wave runs automatically. Clicking, tapping, or pressing Enter/Space while the heading is focused replays the wave. Screen readers receive one complete heading; decorative letter copies are hidden from the accessibility tree. Measurements use stable letter anchors and refresh after font loading and resizing.

The user chose this custom implementation instead of React Bits Pro. No paid component, license key, or registry is required. No React Bits Pro source was copied.

## Scroll-driven second hero

`src/components/ui/perspective-tunnel-hero.tsx` adapts the supplied tunnel into a pinned scroll sequence. The first hero stays behind while the second hero slides over it. Once the second hero fills the viewport, scrolling through its 360svh track drives all nine cards, the title, rings, and progress indicator. The animation completes at 88% of the pinned interval, leaving a short final hold before the next content enters. Scrolling backward reverses the timeline. No snapping, wheel interception, or autonomous tunnel loop is used. Pointer parallax remains spring-smoothed.

The nine decorative images use the supplied CDN URLs in `src/lib/tunnel-artwork.json`; gradient cards remain visible if an image fails. These images require network access. The first hero retains a 640px minimum on short screens, with a negative sticky offset so its bottom remains reachable. The second stage always fills the visible viewport. Verify appearance manually at desktop and mobile sizes; builds do not verify visual rendering.

## Third hero: Courage

`src/components/ui/tiger-tear-reveal.tsx` contains the user-supplied SVG tiger and paper-tear effect. `src/components/ui/courage-hero.tsx` adapts its colors, text, and navigation for HD Cares. It follows the second hero and uses a full-viewport sticky stage with 220svh of additional scroll distance. The tear, tiger rise, and eyes are driven directly by scroll; the last 10% holds the finished reveal before the next section enters. Reverse scrolling closes the paper.

Eye tracking, idle glances, blinking, and pointer-down squinting are preserved. Motion is enabled by default. The animation loop pauses outside the visible stage and when the browser tab is hidden. This component requires no additional dependencies, network artwork, or fonts. Hero scroll prompts and between-section continuation links are intentionally omitted.

## Source credits

- Tiger tear reveal: user-provided React/SVG component, adapted for the third hero.
- Liquid sculpture component and its supplied artwork: user-provided source, credited to [Guglielmo Giannattasio](https://guglielmogiannattasio.it). Attribution is preserved in the source and page footer.
- [Motion Primitives](https://github.com/ibelick/motion-primitives): AnimatedGroup and TextEffect, MIT-licensed.
- [Motion](https://motion.dev/): scroll values, springs, layout transitions, presence transitions, and SVG/object animation.

The page loads Geist and Instrument Serif through Google Fonts. Sculpture artwork is local; tunnel artwork loads from the supplied 21st.dev CDN. No private user media is collected by this frontend.



