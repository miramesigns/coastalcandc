import { createPrivateKey, createSign } from 'node:crypto';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function escapeDriveQuery(value) {
  return value.replace(/'/g, "\\'");
}

function signServiceAccountJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const input = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(input);
  signer.end();
  return `${input}.${signer.sign(createPrivateKey(serviceAccount.private_key)).toString('base64url')}`;
}

export async function getDriveAccessToken(serviceAccount, fetchImpl = fetch) {
  const assertion = signServiceAccountJwt(serviceAccount);
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error(`Google OAuth failed: ${body.error_description || body.error || response.status}`);
  return body.access_token;
}

async function driveRequest(path, token, fetchImpl = fetch) {
  const response = await fetchImpl(`${DRIVE_API}${path}`, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Google Drive request failed: ${response.status}`);
  return response;
}

export async function listFolderChildren(folderId, token, fetchImpl = fetch) {
  const query = new URLSearchParams({
    q: `'${escapeDriveQuery(folderId)}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,parents,createdTime)',
    orderBy: 'createdTime desc',
    pageSize: '100',
  });
  const response = await driveRequest(`/files?${query}`, token, fetchImpl);
  const body = await response.json();
  return body.files || [];
}

export async function getApprovedImage(fileId, rootFolderId, token, fetchImpl = fetch) {
  const metadataQuery = new URLSearchParams({ fields: 'id,name,mimeType,parents' });
  const metadataResponse = await driveRequest(`/files/${encodeURIComponent(fileId)}?${metadataQuery}`, token, fetchImpl);
  const metadata = await metadataResponse.json();
  if (!metadata.mimeType?.startsWith('image/')) throw new Error('Requested file is not an image.');

  const projects = await listFolderChildren(rootFolderId, token, fetchImpl);
  const projectIds = new Set(projects.filter((file) => file.mimeType === 'application/vnd.google-apps.folder').map((file) => file.id));
  const allowedParents = new Set([rootFolderId, ...projectIds]);
  if (!metadata.parents?.some((parentId) => allowedParents.has(parentId))) throw new Error('Requested image is not in an approved gallery folder.');
  return metadata;
}

export async function downloadImage(fileId, token, fetchImpl = fetch) {
  return driveRequest(`/files/${encodeURIComponent(fileId)}?alt=media`, token, fetchImpl);
}
