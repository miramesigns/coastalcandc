import { buildGalleryPayload, getGalleryConfiguration } from '../lib/google-drive-gallery.mjs';
import { getDriveAccessToken, listFolderChildren } from '../netlify/functions/google-drive.mjs';

export default async function handler(_req, res) {
  try {
    const { folderId, serviceAccount } = getGalleryConfiguration();
    const token = await getDriveAccessToken(serviceAccount);
    const rootItems = await listFolderChildren(folderId, token);
    const projects = rootItems.filter((item) => item.mimeType === 'application/vnd.google-apps.folder');
    const groups = await Promise.all(projects.map((project) => listFolderChildren(project.id, token)));
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.status(200).json(buildGalleryPayload({ rootFolderId: folderId, projects, files: [...rootItems, ...groups.flat()] }));
  } catch (error) {
    console.error('Gallery feed failed', error);
    return res.status(503).json({ error: 'The project gallery is temporarily unavailable.' });
  }
}
