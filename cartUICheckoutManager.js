import uiComponents from './uiComponentLibrary.js';
import apiService from './js/apiservice.js';

const CART_STORAGE_KEY = 'toeConnectCart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading cart from localStorage', e);
    uiComponents.showToast('Could not load cart from storage.', { type: 'error' });
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
    uiComponents.showToast('Could not save cart to storage.', { type: 'error' });
  }
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(itemId) {
  const idStr = itemId != null ? itemId.toString() : '';
  cart = cart.filter(i => i.id.toString() !== idStr);
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function getCart() {
  return cart.slice();
}

function calculateTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function renderCart() {
  const container = document.createElement('div');
  container.className = 'cart-modal';

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Your cart is empty.';
    container.appendChild(empty);
    return container;
  }

  const list = document.createElement('ul');
  list.className = 'cart-items';

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.textContent = item.name;
    li.appendChild(nameSpan);

    const qtySpan = document.createElement('span');
    qtySpan.className = 'item-quantity';
    qtySpan.textContent = 'Qty: ' + item.quantity;
    li.appendChild(qtySpan);

    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.textContent = '$' + (item.price * item.quantity).toFixed(2);
    li.appendChild(priceSpan);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-item-button';
    removeBtn.dataset.id = item.id.toString();
    removeBtn.setAttribute('aria-label', 'Remove ' + item.name);
    removeBtn.textContent = '?';
    li.appendChild(removeBtn);

    list.appendChild(li);
  });

  container.appendChild(list);

  const total = document.createElement('p');
  total.className = 'cart-total';
  total.textContent = 'Total: $' + calculateTotal().toFixed(2);
  container.appendChild(total);

  const form = document.createElement('form');
  form.className = 'checkout-form';

  const heading = document.createElement('h2');
  heading.textContent = 'Checkout';
  form.appendChild(heading);

  const fields = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Phone', name: 'phone', type: 'tel' }
  ];

  fields.forEach(field => {
    const labelEl = document.createElement('label');
    labelEl.textContent = field.label;
    const input = document.createElement('input');
    input.type = field.type;
    input.name = field.name;
    input.required = true;
    labelEl.appendChild(input);
    form.appendChild(labelEl);
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'checkout-button';
  submitBtn.textContent = 'Pay Now';
  form.appendChild(submitBtn);

  container.appendChild(form);

  container.addEventListener('click', e => {
    if (e.target.matches('.remove-item-button')) {
      const id = e.target.dataset.id;
      removeFromCart(id);
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    const userInfo = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim()
    };
    checkout(userInfo);
  });

  return container;
}

function updateCartUI() {
  uiComponents.showModal(renderCart());
}

function checkout(userInfo) {
  if (cart.length === 0) {
    uiComponents.showToast('Cart is empty', { type: 'error' });
    return;
  }
  const checkoutBtn = document.querySelector('.checkout-button');
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';
  }
  uiComponents.showLoading();
  apiService.postJSON('/.netlify/functions/processOrder', { cart, userInfo })
    .then(res => {
      if (res && res.paymentUrl) {
        clearCart();
        window.location.href = res.paymentUrl;
      } else {
        throw new Error('Invalid response from server');
      }
    })
    .catch(err => {
      console.error('Checkout error', err);
      uiComponents.showToast('Checkout failed. Please try again.', { type: 'error' });
    })
    .finally(() => {
      uiComponents.hideLoading();
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Pay Now';
      }
    });
}

const cartUICheckoutManager = {
  addToCart,
  removeFromCart,
  clearCart,
  getCart,
  updateCartUI,
  checkout
};

export default cartUICheckoutManager;