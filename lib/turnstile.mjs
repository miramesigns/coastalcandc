const expectedHostname = 'www.coastalcarpentrysrq.com';

export async function verifyTurnstile({ token, secret, remoteIp, fetchImpl = fetch }) {
  if (!token || !secret) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);
    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && result.hostname === expectedHostname;
  } catch { return false; }
}
