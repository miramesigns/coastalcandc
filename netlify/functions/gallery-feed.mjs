import { buildGalleryPayload, getGalleryConfiguration } from '../../lib/google-drive-gallery.mjs';
import { getDriveAccessToken, listFolderChildren } from './google-drive.mjs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? 'public, max-age=300, s-maxage=300' : 'no-store',
    },
  });
}

export default async function handler() {
  try {
    const { folderId, serviceAccount } = getGalleryConfiguration();
    const token = await getDriveAccessToken(serviceAccount);
    const rootItems = await listFolderChildren(folderId, token);
    const projects = rootItems.filter((item) => item.mimeType === 'application/vnd.google-apps.folder');
    const fileGroups = await Promise.all(projects.map((project) => listFolderChildren(project.id, token)));
    return json(buildGalleryPayload({ projects, files: fileGroups.flat() }));
  } catch (error) {
    console.error('Gallery feed failed', error);
    return json({ error: 'The project gallery is temporarily unavailable.' }, 503);
  }
}
