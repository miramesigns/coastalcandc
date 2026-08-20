import { parseEstimateRequest } from '../lib/request-estimate.mjs';

const recipient = 'john@coastalcarpentrysrq.com';
const from = 'Coastal Carpentry & Cabinet <john@coastalcarpentrysrq.com>';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const lead = parseEstimateRequest(req.body || {});
    if (!process.env.RESEND_API_KEY) throw new Error('Email service is not configured.');
    const text = `New estimate request\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'Not provided'}\nProject type: ${lead.projectType || 'Not provided'}\nLocation: ${lead.location || 'Not provided'}\n\nProject details:\n${lead.details}`;
    const response = await fetch('https://api.resend.com/emails/batch', { method: 'POST', headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify([{ from, to: [recipient], reply_to: lead.email, subject: `New estimate request from ${lead.name}`, text }, { from, to: [lead.email], subject: 'We received your Coastal Carpentry request', text: `Hi ${lead.name},\n\nThanks for contacting Coastal Carpentry & Cabinet. We received your request and will be in touch soon.\n\n— Coastal Carpentry & Cabinet` }]) });
    if (!response.ok) throw new Error(`Resend request failed: ${response.status}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Estimate request failed', error);
    return res.status(400).json({ error: error.message || 'Unable to submit your request.' });
  }
}
