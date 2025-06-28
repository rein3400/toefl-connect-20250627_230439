import * as apiService from './js/apiservice.js';
import cartModule from './cartmodule.js';

const containerSelector = '#pdf-listing';
const filterFormSelector = '#pdf-filter-form';

let products = [];
let container;
let filterForm;

function clearContainer() {
  if (!container) return;
  container.innerHTML = '';
}

function sanitizeId(id) {
  const safe = String(id).replace(/[^A-Za-z0-9_-]/g, '');
  return safe || 'unknown';
}

function createProductCard(product, index) {
  const card = document.createElement('article');
  card.className = 'pdf-card';

  const title = document.createElement('h2');
  title.className = 'pdf-card__title';
  const safeId = sanitizeId(product.id);
  const titleId = `pdf-title-${safeId}-${index}`;
  title.id = titleId;
  title.textContent = product.title;
  card.setAttribute('aria-labelledby', titleId);
  card.appendChild(title);

  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'pdf-card__description';
    desc.textContent = product.description;
    card.appendChild(desc);
  }

  const meta = document.createElement('p');
  meta.className = 'pdf-card__meta';
  const topic = product.topic ? `Topic: ${product.topic}` : '';
  const level = product.level ? `Level: ${product.level}` : '';
  meta.textContent = [topic, level].filter(Boolean).join(' | ');
  card.appendChild(meta);

  if (typeof product.price === 'number') {
    const price = document.createElement('p');
    price.className = 'pdf-card__price';
    price.textContent = `Price: $${product.price.toFixed(2)}`;
    card.appendChild(price);
  }

  if (product.pdfUrl) {
    const previewLink = document.createElement('a');
    previewLink.className = 'pdf-card__preview';
    previewLink.href = product.pdfUrl;
    previewLink.target = '_blank';
    previewLink.rel = 'noopener noreferrer';
    previewLink.textContent = 'Preview';
    card.appendChild(previewLink);
  }

  const addButton = document.createElement('button');
  addButton.className = 'pdf-card__add-button';
  addButton.type = 'button';
  addButton.textContent = 'Add to cart';
  addButton.setAttribute('aria-label', `Add ${product.title} to cart`);
  if (cartModule && typeof cartModule.addToCart === 'function') {
    addButton.addEventListener('click', () => cartModule.addToCart(product));
  } else {
    addButton.disabled = true;
    console.error('cartModule.addToCart is not available');
  }
  card.appendChild(addButton);

  return card;
}

function renderProducts(list) {
  if (!container) return;
  clearContainer();
  if (list.length === 0) {
    const message = document.createElement('p');
    message.className = 'pdf-listing__empty';
    message.textContent = 'No products found.';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    container.appendChild(message);
    return;
  }
  const fragment = document.createDocumentFragment();
  list.forEach((product, index) => {
    const card = createProductCard(product, index);
    fragment.appendChild(card);
  });
  container.appendChild(fragment);
}

function getFilterCriteria() {
  const criteria = {};
  if (!filterForm) return criteria;
  const formData = new FormData(filterForm);
  const topic = formData.get('topic');
  if (topic && topic !== 'all') criteria.topic = topic;
  const level = formData.get('level');
  if (level && level !== 'all') criteria.level = level;
  return criteria;
}

function filterProductsByCriteria(items, criteria) {
  return items.filter(product => {
    if (criteria.topic && product.topic !== criteria.topic) return false;
    if (criteria.level && product.level !== criteria.level) return false;
    return true;
  });
}

function handleFilterChange() {
  const criteria = getFilterCriteria();
  const filtered = filterProductsByCriteria(products, criteria);
  renderProducts(filtered);
}

async function init() {
  container = document.querySelector(containerSelector);
  filterForm = document.querySelector(filterFormSelector);
  if (!container) return;
  clearContainer();
  const loading = document.createElement('p');
  loading.className = 'pdf-listing__loading';
  loading.textContent = 'Loading products...';
  loading.setAttribute('role', 'status');
  loading.setAttribute('aria-live', 'polite');
  container.appendChild(loading);
  try {
    products = await apiService.fetchJSON('data/products.json');
    renderProducts(products);
    if (filterForm) {
      filterForm.addEventListener('change', handleFilterChange);
      filterForm.addEventListener('reset', () => {
        setTimeout(handleFilterChange, 0);
      });
    }
  } catch (error) {
    console.error('Error loading products:', error);
    clearContainer();
    const errorMsg = document.createElement('p');
    errorMsg.className = 'pdf-listing__error';
    errorMsg.textContent = 'Failed to load products. Please try again later.';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.setAttribute('aria-live', 'assertive');
    container.appendChild(errorMsg);
  }
}

document.addEventListener('DOMContentLoaded', init);