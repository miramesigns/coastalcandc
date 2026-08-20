import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGalleryPayload, getGalleryConfiguration } from '../lib/google-drive-gallery.mjs';

test('buildGalleryPayload keeps images grouped by their approved project folders', () => {
  const payload = buildGalleryPayload({
    projects: [
      { id: 'project-kitchen', name: 'Kitchen Remodel' },
      { id: 'project-builtins', name: 'Custom Built-ins' },
    ],
    files: [
      { id: 'image-1', name: 'Kitchen island.jpg', mimeType: 'image/jpeg', parents: ['project-kitchen'], createdTime: '2026-08-18T12:00:00Z' },
      { id: 'notes-1', name: 'Customer notes.pdf', mimeType: 'application/pdf', parents: ['project-kitchen'] },
      { id: 'image-2', name: 'Built-in shelves.png', mimeType: 'image/png', parents: ['project-builtins'], createdTime: '2026-08-19T12:00:00Z' },
      { id: 'heic-1', name: 'Phone photo.HEIC', mimeType: 'image/heif', parents: ['project-builtins'] },
    ],
  });

  assert.deepEqual(payload, {
    projects: [
      {
        id: 'project-kitchen',
        name: 'Kitchen Remodel',
        photos: [{ id: 'image-1', alt: 'Kitchen island', src: '/.netlify/functions/gallery-image?id=image-1' }],
      },
      {
        id: 'project-builtins',
        name: 'Custom Built-ins',
        photos: [{ id: 'image-2', alt: 'Built-in shelves', src: '/.netlify/functions/gallery-image?id=image-2' }],
      },
    ],
  });
});

test('buildGalleryPayload omits unapproved files and projects without photos', () => {
  const payload = buildGalleryPayload({
    projects: [{ id: 'project-empty', name: 'Empty project' }],
    files: [{ id: 'doc-1', name: 'estimate.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', parents: ['project-empty'] }],
  });

  assert.deepEqual(payload, { projects: [] });
});

test('buildGalleryPayload publishes direct root images as Recent Work', () => {
  const payload = buildGalleryPayload({
    rootFolderId: 'gallery-root',
    projects: [],
    files: [{ id: 'root-photo', name: 'Finished cabinet.jpg', mimeType: 'image/jpeg', parents: ['gallery-root'] }],
  });

  assert.deepEqual(payload, {
    projects: [{ id: 'recent-work', name: 'Recent Work', photos: [{ id: 'root-photo', alt: 'Finished cabinet', src: '/.netlify/functions/gallery-image?id=root-photo' }] }],
  });
});

test('getGalleryConfiguration accepts a folder and complete service account credentials', () => {
  const serviceAccount = { client_email: 'gallery-bot@example.iam.gserviceaccount.com', private_key: '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n' };

  assert.deepEqual(getGalleryConfiguration({
    GOOGLE_DRIVE_FOLDER_ID: 'root-folder-id',
    GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify(serviceAccount),
  }), { folderId: 'root-folder-id', serviceAccount });
});

test('getGalleryConfiguration rejects missing server credentials', () => {
  assert.throws(
    () => getGalleryConfiguration({ GOOGLE_DRIVE_FOLDER_ID: 'root-folder-id' }),
    /GOOGLE_SERVICE_ACCOUNT_JSON/,
  );
});
