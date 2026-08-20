const fullGallery = document.querySelector('[data-project-gallery]');
const featuredGallery = document.querySelector('[data-featured-gallery]');
const status = document.querySelector('[data-gallery-status]');
const jumpNav = document.querySelector('[data-gallery-jump]');

let lightbox = null;
let lightboxIndex = 0;
let lightboxPhotos = [];
let lastFocused = null;

function projectAnchorId(project) {
  return `project-${String(project.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function image(photo, { button = false, className = '' } = {}) {
  const element = document.createElement('img');
  element.src = photo.src;
  element.alt = photo.alt;
  element.loading = 'lazy';
  element.decoding = 'async';
  if (className) element.className = className;

  if (!button) return element;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'gallery-shot';
  trigger.setAttribute('aria-label', `View larger: ${photo.alt}`);
  trigger.append(element);
  return trigger;
}

function ensureLightbox() {
  if (lightbox) return lightbox;

  lightbox = document.createElement('div');
  lightbox.className = 'gallery-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Project photo');
  lightbox.innerHTML = `
    <div class="gallery-lightbox-scrim" data-lightbox-close></div>
    <div class="gallery-lightbox-frame">
      <button type="button" class="gallery-lightbox-close" data-lightbox-close aria-label="Close">Close</button>
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-prev" data-lightbox-prev aria-label="Previous photo">‹</button>
      <img class="gallery-lightbox-image" alt="">
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-next" data-lightbox-next aria-label="Next photo">›</button>
      <p class="gallery-lightbox-caption"></p>
    </div>
  `;
  document.body.append(lightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target.closest('[data-lightbox-close]')) closeLightbox();
    if (event.target.closest('[data-lightbox-prev]')) showLightboxPhoto(lightboxIndex - 1);
    if (event.target.closest('[data-lightbox-next]')) showLightboxPhoto(lightboxIndex + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showLightboxPhoto(lightboxIndex - 1);
    if (event.key === 'ArrowRight') showLightboxPhoto(lightboxIndex + 1);
  });

  return lightbox;
}

function showLightboxPhoto(index) {
  if (!lightboxPhotos.length) return;
  lightboxIndex = (index + lightboxPhotos.length) % lightboxPhotos.length;
  const photo = lightboxPhotos[lightboxIndex];
  const dialog = ensureLightbox();
  const img = dialog.querySelector('.gallery-lightbox-image');
  const caption = dialog.querySelector('.gallery-lightbox-caption');
  img.src = photo.src;
  img.alt = photo.alt;
  caption.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length} — ${photo.alt}`;
}

function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lastFocused = document.activeElement;
  const dialog = ensureLightbox();
  dialog.hidden = false;
  document.body.classList.add('gallery-lightbox-open');
  showLightboxPhoto(index);
  dialog.querySelector('.gallery-lightbox-close')?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove('gallery-lightbox-open');
  lastFocused?.focus?.();
}

function renderJumpNav(projects) {
  if (!jumpNav) return;
  if (projects.length < 2) {
    jumpNav.hidden = true;
    jumpNav.replaceChildren();
    return;
  }

  jumpNav.hidden = false;
  jumpNav.replaceChildren(
    ...projects.map((project) => {
      const link = document.createElement('a');
      link.href = `#${projectAnchorId(project)}`;
      link.textContent = project.name;
      return link;
    }),
  );
}

function renderProject(project, index) {
  const section = document.createElement('section');
  section.className = `project-chapter${index % 2 === 1 ? ' project-chapter-alt' : ''}`;
  section.id = projectAnchorId(project);

  const header = document.createElement('div');
  header.className = 'project-chapter-header';

  const title = document.createElement('h2');
  title.textContent = project.name;

  const meta = document.createElement('p');
  meta.className = 'project-chapter-meta';
  const count = project.photos.length;
  meta.textContent = `${count} photo${count === 1 ? '' : 's'}`;

  header.append(title, meta);

  const [lead, ...rest] = project.photos;
  const leadWrap = document.createElement('div');
  leadWrap.className = 'project-chapter-lead';
  const leadButton = image(lead, { button: true, className: 'project-chapter-lead-img' });
  leadButton.addEventListener('click', () => openLightbox(project.photos, 0));
  leadWrap.append(leadButton);

  section.append(header, leadWrap);

  if (rest.length) {
    const grid = document.createElement('div');
    grid.className = 'project-chapter-grid';
    rest.forEach((photo, photoIndex) => {
      const shot = image(photo, { button: true });
      shot.addEventListener('click', () => openLightbox(project.photos, photoIndex + 1));
      grid.append(shot);
    });
    section.append(grid);
  }

  return section;
}

function renderFeatured(projects) {
  const photos = projects.flatMap((project) => project.photos).slice(0, 4);
  featuredGallery.replaceChildren(
    ...photos.map((photo, index) => {
      const photoElement = image(photo);
      if (index === 0) photoElement.classList.add('large');
      return photoElement;
    }),
  );
  document.querySelector('[data-featured-gallery-status]')?.remove();
}

function setStatus(message, { isError = false } = {}) {
  if (!status) return;
  status.hidden = false;
  status.textContent = message;
  status.classList.toggle('gallery-note-error', isError);
}

function showEmptyState() {
  setStatus('Project photos will be added soon.');
  if (jumpNav) {
    jumpNav.hidden = true;
    jumpNav.replaceChildren();
  }
}

function showRetryState(message) {
  if (!status) return;
  setStatus(message, { isError: true });
  if (document.querySelector('[data-gallery-retry]')) return;

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'button button-compact';
  retry.dataset.galleryRetry = '';
  retry.textContent = 'Try again';
  retry.addEventListener('click', () => loadGallery());
  status.insertAdjacentElement('afterend', retry);
}

function clearRetry() {
  document.querySelector('[data-gallery-retry]')?.remove();
}

function renderGallery(projects) {
  if (fullGallery) {
    renderJumpNav(projects);
    fullGallery.replaceChildren(...projects.map(renderProject));
    status?.remove();
    clearRetry();
  }

  if (featuredGallery) renderFeatured(projects);
}

async function loadGallery() {
  clearRetry();
  setStatus('Loading project photos…');

  const slowTimer = window.setTimeout(() => {
    setStatus('Still loading project photos — first load can take a few seconds…');
  }, 2500);

  const controller = new AbortController();
  const hardTimer = window.setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('/.netlify/functions/gallery-feed', { signal: controller.signal });
    if (!response.ok) throw new Error(`Gallery response ${response.status}`);
    const { projects = [] } = await response.json();
    if (!projects.length) return showEmptyState();
    renderGallery(projects);
  } catch (error) {
    console.error('Could not load the project gallery.', error);
    if (fullGallery) {
      showRetryState(
        error?.name === 'AbortError'
          ? 'The gallery is taking too long to respond. Please try again.'
          : 'Could not load project photos right now.',
      );
    } else {
      showEmptyState();
    }
  } finally {
    window.clearTimeout(slowTimer);
    window.clearTimeout(hardTimer);
  }
}

if (fullGallery || featuredGallery) loadGallery();
