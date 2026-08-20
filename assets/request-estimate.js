const form = document.querySelector('[data-estimate-form]');
const status = document.querySelector('[data-form-status]');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  button.disabled = true; status.textContent = 'Sending…';
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/.netlify/functions/request-estimate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    form.reset(); status.textContent = 'Thank you — your request was received. We’ll be in touch soon.';
  } catch (error) { status.textContent = error.message || 'Unable to send your request. Please call us instead.'; }
  finally { button.disabled = false; }
});
