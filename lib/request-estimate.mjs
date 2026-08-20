const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function parseEstimateRequest(input) {
  if (clean(input.company, 100)) throw new Error('Unable to submit this request.');
  const request = {
    name: clean(input.name, 100),
    email: clean(input.email, 254).toLowerCase(),
    phone: clean(input.phone, 50),
    projectType: clean(input.projectType, 100),
    location: clean(input.location, 150),
    details: clean(input.details, 4000),
  };
  if (!request.name || !request.details) throw new Error('Please provide your name and project details.');
  if (!emailPattern.test(request.email)) throw new Error('Please enter a valid email address.');
  return request;
}
