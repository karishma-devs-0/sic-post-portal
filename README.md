# SIC Post Portal · #MySICStory

Student-facing hub for the TSSC × Samsung Innovation Campus 2026 social media campaign.
Students scan a QR → enter their SIC roll number → get this week's post prompt + template + caption → submit their post URL.

- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS 3 + framer-motion + lucide-react.
- **No backend** — static JSON in `/public/data/`. Submissions POST to a Google Apps Script Web App.
- **Deploy**: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

---

## Local dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # emits ./dist
npm run preview    # serves ./dist locally to sanity-check
```

---

## Weekly workflow — update `tasks.json`

Every week, edit **`public/data/tasks.json`** and bump `week`. Structure:

```json
{
  "week": 8,
  "tasks": {
    "AI":                    { "title": "...", "prompt": "...", "caption": "...", "templateUrl": "..." },
    "Coding & Programming":  { "title": "...", "prompt": "...", "caption": "...", "templateUrl": "..." },
    "IoT":                   { "title": "...", "prompt": "...", "caption": "...", "templateUrl": "..." },
    "Big Data":              { "title": "...", "prompt": "...", "caption": "...", "templateUrl": "..." }
  }
}
```

Rules:
- `caption` should already contain `#MySICStory #SamsungInnovationCampus` at the end.
- `templateUrl` is a Canva "view" link students can duplicate.
- Course keys must match values used in `students.json` exactly.

Commit + push → GitHub Actions redeploys automatically.

---

## Regenerating `students.json` from the master sheet

The frontend never sees names — only `roll → { course, university }`. Regenerate from the TSSC master roster:

1. Get the latest master sheet from the TSSC programme team (usually `.xlsx`).
2. Run a small strip-and-emit script (example — write to `scripts/build_students_json.py`):

   ```python
   import openpyxl, json
   wb = openpyxl.load_workbook("master.xlsx", data_only=True)
   ws = wb["Student list with SML"]  # or whichever sheet
   out = {}
   for r in ws.iter_rows(min_row=2, values_only=True):
       cid, course, college = r[2], r[7], r[6]   # column indices vary per sheet — inspect first
       if not cid or not str(cid).startswith("SIC"): continue
       out[str(cid).strip()] = {"course": str(course or "").strip(), "university": str(college or "").strip()}
   with open("public/data/students.json", "w", encoding="utf-8") as f:
       json.dump(out, f, indent=2, ensure_ascii=False)
   ```

3. Verify: `public/data/students.json` contains **no names, emails, or phone numbers**.
4. Commit + push.

`students.sample.json` documents the expected shape.

---

## Submissions — `SUBMIT_ENDPOINT`

Portal submissions POST to a Google Apps Script Web App because GitHub Pages is static.

1. **Create a tracker sheet** (Google Sheets) with columns: `timestamp, roll, week, postUrl`.
2. **Extensions → Apps Script** → paste:

   ```js
   function doPost(e) {
     const data = JSON.parse(e.postData.contents)
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
     sheet.appendRow([new Date(), data.roll, data.week, data.postUrl])
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
   }
   ```

3. **Deploy → New deployment → Web app**:
   - "Execute as": Me
   - "Who has access": Anyone
4. Copy the `/exec` URL and paste it into `SUBMIT_ENDPOINT` in `src/components/Portal.tsx`.

The frontend uses `mode: 'no-cors'` (Apps Script CORS is finicky) — response is opaque, so we optimistically show success. Failed submissions show as success too — cross-check against the tracker sheet daily during the campaign.

**Fallback** (commented in `Portal.tsx`): a prefilled Google Form URL:

```
https://docs.google.com/forms/d/e/FORM_ID/formResponse?entry.<rollFieldId>=SIC26-TSSC-0421&entry.<urlFieldId>=<encoded>&entry.<weekFieldId>=7
```

Get the field IDs from the Form's "Get pre-filled link" export.

---

## Deploying to GitHub Pages

1. Create a new GitHub repo and push this folder as the root.
2. **Settings → Pages → Source: GitHub Actions** (not the older "Deploy from branch").
3. `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
4. **URL routing**:
   - For a **user/org page** (`<username>.github.io`), leave `base: './'` in `vite.config.ts` (already set).
   - For a **project page** (`<username>.github.io/<repo>`), change to `base: '/<repo>/'` and rebuild.

Custom domain: add a `public/CNAME` file with the domain, and set the CNAME in DNS + Pages settings.

---

## Design tokens (see `tailwind.config.js`)

| Token         | Value      | Where              |
| ------------- | ---------- | ------------------ |
| `primary`     | `#DEDBC8`  | primary text, CTA fill |
| `sic`         | `#1428A0`  | course badge, focus rings, brand accent |
| `siccyan`     | `#00A9E0`  | task-complete confirmation |
| `font-serif`  | Instrument Serif | italic accent text |
| default font  | Almarai    | everything else |

---

## One-Tap Posting Lab (`/lab.html`)

Standalone diagnostic page — **zero build step, zero deps** except a CDN QR library. Lives at [`public/lab.html`](public/lab.html) and gets copied verbatim into the build; accessible at:

- Local dev: `http://localhost:5173/lab.html`
- Production: `https://<username>.github.io/<repo>/lab.html`

**What it proves on real phones** (the only reliable way to demo Web Share behavior):
- Level 1 · pre-filled composer intents for LinkedIn / X / Threads / WhatsApp (URL generation is live from the editable caption; nothing hard-coded)
- Level 2 · Smart Share — canvas-generated PNG "certificate" card sent via `navigator.share({ files, text })`; Instagram mode (image-only + caption in clipboard)
- Diagnostics panel (secure context · `navigator.share` · `canShare({files})` · Clipboard API · UA)
- Event log — every click is timestamped and appended; screenshot after each device test
- Self-QR of `location.href` so the room can scan and join

### Phone test checklist

Fill this during device testing. First two rows are the expected baseline — verify against them.

| Device / OS / Browser | L1 LinkedIn | L1 X | L1 Threads | L1 WhatsApp | L2 image+caption | L2 Instagram | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Android · Chrome (expected)** | App opens · composer pre-filled | App opens · composer pre-filled | App opens · composer pre-filled | App opens · composer pre-filled | Share sheet lists LinkedIn / X / WhatsApp; those receive image + text | IG receives image; text arrives via clipboard paste | baseline |
| **iOS · Safari (expected)** | LinkedIn app opens · composer pre-filled | Twitter/X app opens · pre-filled | Threads app opens · pre-filled | WhatsApp opens · pre-filled | Sheet lists apps; most keep both image + text | IG receives image; long-press paste for caption | baseline |
| Android · … · Chrome | | | | | | | |
| Android · … · Samsung Internet | | | | | | | |
| iOS · … · Safari | | | | | | | |
| iOS · … · Chrome | | | | | | | |

Screenshot the event log after each device to attach to the row.

### Deploying the lab alone

The lab is bundled with the main site — no separate deployment step. If you need a fully isolated version to open as a file:// URL or send by email, just copy `public/lab.html` — it's self-contained (only external dep is the CDN QR script).

---

## File map

```
website/
├── public/
│   ├── 404.html                      # SPA-friendly Pages fallback
│   ├── lab.html                      # standalone One-Tap Posting Lab (no build)
│   └── data/
│       ├── students.json             # roll → {course, university}   (no names)
│       ├── students.sample.json      # shape doc
│       └── tasks.json                # week + per-course task
├── src/
│   ├── App.tsx                       # renders all 4 sections
│   ├── main.tsx
│   ├── index.css                     # Tailwind + custom noise/hero utilities
│   └── components/
│       ├── Hero.tsx                  # section 1
│       ├── Portal.tsx                # section 2 — the functional core
│       ├── HowItWorks.tsx            # section 3
│       ├── Recognition.tsx           # section 4
│       ├── WordsPullUp.tsx           # animation primitive
│       ├── WordsPullUpMultiStyle.tsx # animation primitive
│       └── AnimatedLetter.tsx        # scroll-linked per-char opacity
├── .github/workflows/deploy.yml
├── index.html                        # loads Almarai + Instrument Serif
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
