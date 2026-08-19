import { getGalleryConfiguration } from '../../lib/google-drive-gallery.mjs';
import { downloadImage, getApprovedImage, getDriveAccessToken } from './google-drive.mjs';

export default async function handler(request) {
  const fileId = new URL(request.url).searchParams.get('id');
  if (!fileId || !/^[A-Za-z0-9_-]{5,}$/.test(fileId)) {
    return new Response('Invalid image request.', { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  try {
    const { folderId, serviceAccount } = getGalleryConfiguration();
    const token = await getDriveAccessToken(serviceAccount);
    const metadata = await getApprovedImage(fileId, folderId, token);
    const image = await downloadImage(fileId, token);
    return new Response(image.body, {
      status: 200,
      headers: {
        'content-type': metadata.mimeType,
        'cache-control': 'public, max-age=86400, s-maxage=86400',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Gallery image failed', error);
    return new Response('Image not available.', { status: 404, headers: { 'cache-control': 'no-store' } });
  }
}
