# HD Cares — product planning workspace

Working name: **HD Cares**. Name and branding are provisional.

**Purpose:** Help people respond to threatened or actual non-consensual sharing of intimate images through private device-side fingerprinting, guided reporting, case tracking, and support referrals.

Status: planning documents plus a rebuilt local React frontend in `web/`. The new dark design includes the supplied liquid-particle engine with continuous idle animation and a moving Canvas2D fallback, glass navigation, dimensional animated illustrations, and an interactive concept walkthrough. No platform integration, government integration, or image-processing service has been built or claimed.

## Run the frontend

Open a PowerShell terminal in VS Code and run:

```powershell
cd "C:\Users\HARSH DIXIT\OneDrive\Documents\ChatGPT\hdcares\web"
npm install
npm run dev
```

Open the Local URL printed by Vite (normally `http://127.0.0.1:5173/`). Changes to source files update automatically. Press Ctrl+C to stop the server. For a clean dependency installation matching the lockfile, use `npm ci` in place of `npm install`.

Run `npm run build` to check TypeScript and generate the production bundle. See [frontend notes](web/README.md) for component locations and implementation details.

## Documents

- [Product requirements and workflow](docs/PRD.md)
- [Presentation outline and judges' questions](docs/PRESENTATION-OUTLINE.md)
- [Implementation roadmap and acceptance checks](docs/ROADMAP.md)

Assumptions: India-first pilot; accessible to people of all genders, with particular attention to women; adult image workflow first; separate referral path for images taken when someone was under 18. Validate these assumptions with prospective users and specialist organisations.

The initial demo must use ordinary, non-intimate test images. Do not put private images, identifying case details, credentials, or real survivor reports into this repository.

Research checked: 19 October 2026. Primary sources are linked in the PRD. Recheck service eligibility, reporting routes, and support contacts before launch.
