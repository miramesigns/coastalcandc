# Coastal Carpentry & Cabinet — Cursor UI Handoff

## Current live architecture

- Static public site plus Netlify Functions.
- GitHub repo: `miramesigns/coastalcandc`
- Netlify project: `friendly-rugelach-c28998`
- Temporary Netlify URL: `https://friendly-rugelach-c28998.netlify.app`
- Production custom domain still needs a final DNS/domain cutover decision; keep the existing GitHub Pages site intact until the Netlify version is visually verified.

## Gallery backend

The gallery reads from Google Drive through a dedicated **read-only service account**. Do not put credentials in Git, source files, or documentation.

Required Netlify environment variables:

- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (secret; Functions Runtime scope)

The folder ID and service account access were verified through the Drive API. Existing root-level photos publish as **Recent Work**. New photos in first-level project folders publish under each folder name.

### Important behavior

- Browser-safe image types are published: JPEG, PNG, WebP, GIF, AVIF.
- HEIC/HEIF files are intentionally omitted because they appear as broken images in Chrome. Tell iPhone users to set Camera → Formats → Most Compatible for future uploads, or convert older HEIC images to JPEG.
- Current Drive project folders are generic `Folder 1`–`Folder 4`; rename them in Drive to the public project names when known. Folder names become gallery headings.

## Relevant files

- `netlify/functions/gallery-feed.mjs` — Drive gallery feed
- `netlify/functions/gallery-image.mjs` — protected image proxy
- `netlify/functions/google-drive.mjs` — Google service-account auth / Drive helper
- `lib/google-drive-gallery.mjs` — gallery filtering and grouping
- `assets/gallery.js` — client-side gallery renderer
- `gallery.html` — full gallery
- `index.html` — home-page featured gallery
- `GOOGLE_DRIVE_GALLERY_SETUP.md` — non-secret setup details

## Recent commits

- `1fa8d05` Hide unsupported HEIC gallery images
- `d58b8c9` Show root Drive photos as Recent Work
- `1887f77` Add secure Google Drive project gallery backend
- `135c379` Replace Coastal C and C branding in site metadata

## UI work guidelines

- Preserve the existing brand name: **Coastal Carpentry & Cabinet**; do not reintroduce “Coastal C & C.”
- Do not associate Coastal Carpentry & More LLC with this business; it is a separate competitor.
- Keep the current clean, dark/navy, trade-focused visual direction.
- Use real Drive-backed work photos only; do not add stock images as fake project work.
- Run `npm test` before committing changes.
- Push UI changes to `main`; Netlify should redeploy automatically.
