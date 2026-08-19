const fullGallery = document.querySelector('[data-project-gallery]');
const featuredGallery = document.querySelector('[data-featured-gallery]');
const status = document.querySelector('[data-gallery-status]');

function image(photo) {
  const element = document.createElement('img');
  element.src = photo.src;
  element.alt = photo.alt;
  element.loading = 'lazy';
  element.decoding = 'async';
  return element;
}

function renderProject(project) {
  const section = document.createElement('section');
  section.className = 'project-gallery';
  const title = document.createElement('h3');
  title.textContent = project.name;
  const grid = document.createElement('div');
  grid.className = 'masonry';
  project.photos.forEach((photo, index) => {
    const photoElement = image(photo);
    if (index === 0) photoElement.classList.add('large');
    grid.append(photoElement);
  });
  section.append(title, grid);
  return section;
}

function showEmptyState() {
  if (status) status.textContent = 'Project photos will be added soon.';
}

function renderGallery(projects) {
  if (fullGallery) {
    fullGallery.replaceChildren(...projects.map(renderProject));
    status?.remove();
  }

  if (featuredGallery) {
    const photos = projects.flatMap((project) => project.photos).slice(0, 4);
    featuredGallery.replaceChildren(...photos.map((photo, index) => {
      const photoElement = image(photo);
      if (index === 0) photoElement.classList.add('large');
      return photoElement;
    }));
    document.querySelector('[data-featured-gallery-status]')?.remove();
  }
}

async function loadGallery() {
  try {
    const response = await fetch('/.netlify/functions/gallery-feed');
    if (!response.ok) throw new Error(`Gallery response ${response.status}`);
    const { projects = [] } = await response.json();
    if (!projects.length) return showEmptyState();
    renderGallery(projects);
  } catch (error) {
    console.error('Could not load the project gallery.', error);
    showEmptyState();
  }
}

if (fullGallery || featuredGallery) loadGallery();
