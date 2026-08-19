# Google Drive project gallery setup

The website gallery is designed for a simple phone-to-website workflow:

1. In the customer's Google Drive, create one root folder named `Website Projects`.
2. Inside it, create one folder per project. Start with the four active projects.
3. The customer uploads photos from the Google Drive mobile app into the appropriate project folder.
4. The website reads only those folders and automatically publishes image files. PDFs, documents, and files outside the root folder never appear publicly.

## One-time Google Cloud setup

A Google Cloud project must be created under the business owner’s Workspace account.

1. Enable the **Google Drive API**.
2. Create a **service account** named `coastal-website-gallery`.
3. Create a JSON key for that service account and store it only in the deployment provider’s encrypted environment variables.
4. Share the `Website Projects` root folder with the service account’s email as **Viewer**.
5. Copy the root folder ID from its Google Drive URL.

The service account has read-only access. It cannot send email, edit files, or view any unshared Workspace content.

## Netlify deployment configuration

This repository contains Netlify serverless functions. Connect the repository to a Netlify site and set these encrypted environment variables there:

- `GOOGLE_DRIVE_FOLDER_ID` — the root `Website Projects` folder ID.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — the complete JSON key, entered as a single value.

Then deploy. The gallery endpoint is `/.netlify/functions/gallery-feed` and image proxy endpoint is `/.netlify/functions/gallery-image`.

## Security controls

- Browser users receive proxy URLs only; the service account key and Google Drive links are never sent to the browser.
- The image proxy verifies that every requested image belongs to a direct project subfolder of the approved root.
- The feed exposes image files only.
- The Drive credential is read-only and is excluded from Git.

## Before launch

- Confirm the final public business name and real customer email address.
- Upload at least one real photo to each active project folder.
- Add the custom production domain to Netlify after DNS planning; do not remove the existing GitHub Pages deployment until the Netlify site is verified.
