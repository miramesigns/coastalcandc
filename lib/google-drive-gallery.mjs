const SUPPORTED_WEB_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

function galleryImageUrl(fileId) {
  return `/api/gallery-image?id=${encodeURIComponent(fileId)}`;
}

function accessibleAlt(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildGalleryPayload({ rootFolderId, projects = [], files = [] }) {
  const approvedProjects = new Map(projects.map((project) => [project.id, project]));
  const photosByProject = new Map();

  for (const file of files) {
    if (!file?.id || !SUPPORTED_WEB_IMAGE_MIME_TYPES.has(file.mimeType)) continue;
    const projectId = file.parents?.find((parentId) => approvedProjects.has(parentId));
    if (!projectId) continue;

    const photos = photosByProject.get(projectId) ?? [];
    photos.push({
      id: file.id,
      alt: accessibleAlt(file.name || 'Project photo'),
      src: galleryImageUrl(file.id),
    });
    photosByProject.set(projectId, photos);
  }

  const recentWorkPhotos = files
    .filter((file) => file?.id && SUPPORTED_WEB_IMAGE_MIME_TYPES.has(file.mimeType) && file.parents?.includes(rootFolderId))
    .map((file) => ({ id: file.id, alt: accessibleAlt(file.name || 'Project photo'), src: galleryImageUrl(file.id) }));

  return {
    projects: [
      ...(recentWorkPhotos.length ? [{ id: 'recent-work', name: 'Recent Work', photos: recentWorkPhotos }] : []),
      ...projects
        .filter((project) => photosByProject.has(project.id))
        .map((project) => ({ id: project.id, name: project.name, photos: photosByProject.get(project.id) })),
    ],
  };
}

export function getGalleryConfiguration(environment = process.env) {
  const folderId = environment.GOOGLE_DRIVE_FOLDER_ID?.trim();
  const serviceAccountJson = environment.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!folderId || !serviceAccountJson) {
    throw new Error('Gallery backend is not configured. Set GOOGLE_DRIVE_FOLDER_ID and GOOGLE_SERVICE_ACCOUNT_JSON.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  }

  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must contain client_email and private_key.');
  }

  return { folderId, serviceAccount };
}
