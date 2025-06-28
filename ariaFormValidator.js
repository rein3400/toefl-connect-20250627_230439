import * as uiComponents from './uiComponentLibrary.js';

let idCounter = 0;

function generateUniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `auto-id-${Date.now()}-${idCounter}`;
}

function clearErrors(form) {
  form.querySelectorAll('.aria-error').forEach(el => el.remove());
  form.querySelectorAll('[aria-invalid="true"][aria-describedby$="-error"]').forEach(field => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  });
}

function createErrorMessage(field, message) {
  let fieldId = field.id;
  if (!fieldId) {
    fieldId = `field-${generateUniqueId()}`;
    field.id = fieldId;
  }
  const errorId = `${fieldId}-error`;
  const errorEl = document.createElement('div');
  errorEl.className = 'aria-error';
  errorEl.id = errorId;
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'assertive');
  errorEl.textContent = message;
  field.after(errorEl);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorId);
}

export function validate(form) {
  clearErrors(form);
  const fields = form.querySelectorAll('input, textarea, select');
  for (const field of fields) {
    if (!field.checkValidity()) {
      createErrorMessage(field, field.validationMessage);
      if (typeof uiComponents.showAlert === 'function') {
        uiComponents.showAlert('error', field.validationMessage);
      }
      field.focus();
      return false;
    }
  }
  return true;
}