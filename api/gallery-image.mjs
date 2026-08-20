import { getGalleryConfiguration } from '../lib/google-drive-gallery.mjs';
import { downloadImage, getApprovedImage, getDriveAccessToken } from '../netlify/functions/google-drive.mjs';

export default async function handler(req, res) {
  const fileId = String(req.query.id || '');
  if (!/^[A-Za-z0-9_-]{5,}$/.test(fileId)) return res.status(400).send('Invalid image request.');
  try {
    const { folderId, serviceAccount } = getGalleryConfiguration();
    const token = await getDriveAccessToken(serviceAccount);
    const metadata = await getApprovedImage(fileId, folderId, token);
    const image = await downloadImage(fileId, token);
    const bytes = Buffer.from(await image.arrayBuffer());
    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(bytes);
  } catch (error) {
    console.error('Gallery image failed', error);
    return res.status(404).send('Image not available.');
  }
}
