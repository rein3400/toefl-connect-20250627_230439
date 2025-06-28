import { validate } from './ariaFormValidator.js';
import apiService from './js/apiservice.js';
import * as uiComponents from './uiComponentLibrary.js';

const CONTACT_FORM_SELECTOR = '#contact-form';
const DEFAULT_CONTACT_API_ENDPOINT = '/.netlify/functions/sendConfirmationEmail';
const API_ENDPOINT =
  import.meta.env?.VITE_CONTACT_API_ENDPOINT ||
  (typeof process !== 'undefined' && process.env.CONTACT_API_ENDPOINT) ||
  DEFAULT_CONTACT_API_ENDPOINT;
const LOADING_CLASS = 'is-loading';

function collectContactData(form) {
  const formData = new FormData(form);
  return {
    name: formData.get('name')?.trim() || '',
    email: formData.get('email')?.trim() || '',
    subject: formData.get('subject')?.trim() || '',
    message: formData.get('message')?.trim() || ''
  };
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validate(form)) return;
  const inquiry = collectContactData(form);
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add(LOADING_CLASS);
  }
  try {
    await apiService.postJSON(API_ENDPOINT, inquiry);
    uiComponents.showAlert('success', 'Message sent');
    form.reset();
  } catch (error) {
    console.error('Error sending contact form:', error);
    uiComponents.showAlert('error', 'Failed to send message. Please try again later.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove(LOADING_CLASS);
    }
  }
}

function init() {
  const form = document.querySelector(CONTACT_FORM_SELECTOR);
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

export default { init };