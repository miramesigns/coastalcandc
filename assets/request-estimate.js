const form = document.querySelector('[data-estimate-form]');
const status = document.querySelector('[data-form-status]');
const phone = form?.querySelector('[name=phone]');
const success = document.querySelector('[data-form-success]');
const reset = document.querySelector('[data-form-reset]');

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits ? `(${digits}` : '';
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

phone?.addEventListener('input', () => { phone.value = formatPhone(phone.value); });

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  button.disabled = true; status.textContent = 'Sending…';
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/.netlify/functions/request-estimate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    form.reset();
    form.hidden = true;
    success.hidden = false;
  } catch (error) { status.textContent = error.message || 'Unable to send your request. Please call us instead.'; }
  finally { button.disabled = false; }
});

reset?.addEventListener('click', (event) => {
  event.preventDefault();
  success.hidden = true;
  form.hidden = false;
  form.querySelector('[name=name]').focus();
});
