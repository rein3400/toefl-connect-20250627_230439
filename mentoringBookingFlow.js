import * as formValidator from './ariaFormValidator.js';
import * as apiService from './apiservice.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#booking-form');
  if (!form) return;
  form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  clearErrors(form);
  if (!formValidator.validate(form)) {
    const errors = formValidator.getErrors();
    displayFieldErrors(form, errors);
    return;
  }
  const submitButton = event.submitter || form.querySelector('button[type="submit"], input[type="submit"]');
  try {
    toggleButtonLoading(submitButton, true);
    const data = collectBookingData(form);
    const response = await apiService.postJSON('/.netlify/functions/processOrder', data);
    if (response && response.paymentUrl) {
      window.location.href = response.paymentUrl;
    } else {
      throw new Error('Missing payment URL in response');
    }
  } catch (error) {
    console.error('Booking error:', error);
    displaySubmissionError(form, 'An error occurred while processing your booking. Please try again.');
    toggleButtonLoading(submitButton, false);
  }
}

function collectBookingData(form) {
  const formData = new FormData(form);
  return {
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    mentorId: formData.get('mentorId'),
    bookingDate: formData.get('date'),
    bookingTime: formData.get('time'),
    notes: formData.get('notes')?.trim(),
    extras: formData.getAll('extras')
  };
}

function clearErrors(form) {
  clearFieldErrors(form);
  clearSubmissionError(form);
}

function clearFieldErrors(form) {
  Array.from(form.elements).forEach(el => {
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
    el.classList.remove('invalid');
  });
  form.querySelectorAll('.error-message.field-error').forEach(el => el.remove());
}

function displayFieldErrors(form, errors) {
  errors.forEach(({ field, message }) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (!input) return;
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    const errorId = `${field}-error`;
    let errorEl = form.querySelector(`#${errorId}`);
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = errorId;
      errorEl.className = 'error-message field-error';
      errorEl.setAttribute('role', 'alert');
      errorEl.setAttribute('aria-live', 'assertive');
      input.insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = message;
    input.setAttribute('aria-describedby', errorId);
  });
  if (errors.length) {
    const first = form.querySelector(`[name="${errors[0].field}"]`);
    if (first) first.focus();
  }
}

function clearSubmissionError(form) {
  const err = form.querySelector('.error-message.submission-error');
  if (err) err.remove();
}

function displaySubmissionError(form, message) {
  let err = form.querySelector('.error-message.submission-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'error-message submission-error';
    err.setAttribute('role', 'alert');
    err.setAttribute('aria-live', 'assertive');
    err.setAttribute('tabindex', '-1');
    form.prepend(err);
  }
  err.textContent = message;
  err.focus();
}

function toggleButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  if (isLoading) {
    if (button.tagName.toLowerCase() === 'button') {
      button.dataset.originalText = button.textContent;
      button.textContent = 'Processing?';
    } else if (button.tagName.toLowerCase() === 'input') {
      button.dataset.originalValue = button.value;
      button.value = 'Processing?';
    } else {
      button.dataset.originalText = button.textContent;
      button.textContent = 'Processing?';
    }
  } else {
    if (button.tagName.toLowerCase() === 'button' && button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    } else if (button.tagName.toLowerCase() === 'input' && button.dataset.originalValue) {
      button.value = button.dataset.originalValue;
      delete button.dataset.originalValue;
    }
  }
}