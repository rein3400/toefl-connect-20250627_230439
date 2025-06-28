export function initSimulationCTA(formUrl, options = {}) {
  if (typeof document === 'undefined') return;
  const {
    buttonLabel = 'Take Test Simulation',
    iframeTitle = 'Test Simulation Form',
    closeLabel = 'Close',
    buttonClass = 'floating-cta-button',
    overlayClass = 'floating-cta-overlay',
    contentClass = 'floating-cta-content',
    closeClass = 'floating-cta-close'
  } = options;
  if (typeof formUrl !== 'string' || !formUrl) return;
  if (initSimulationCTA._initialized) return;
  initSimulationCTA._initialized = true;

  let button = document.createElement('button');
  button.type = 'button';
  button.className = buttonClass;
  button.textContent = buttonLabel;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');
  document.body.appendChild(button);

  let overlay = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;
  let lastFocusedElement = null;

  function updateFocusableElements() {
    focusableElements = overlay.querySelectorAll('button, iframe, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements = Array.prototype.slice.call(focusableElements).filter(el => !el.hasAttribute('disabled'));
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  }

  function openModal() {
    if (overlay) return;
    lastFocusedElement = document.activeElement;
    button.setAttribute('aria-expanded', 'true');

    overlay = document.createElement('div');
    overlay.className = overlayClass;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', iframeTitle);

    const content = document.createElement('div');
    content.className = contentClass;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = closeClass;
    closeButton.setAttribute('aria-label', closeLabel);
    closeButton.textContent = '?';

    const iframe = document.createElement('iframe');
    iframe.src = formUrl;
    iframe.title = iframeTitle;
    iframe.setAttribute('aria-label', iframeTitle);
    iframe.tabIndex = 0;

    content.appendChild(closeButton);
    content.appendChild(iframe);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    updateFocusableElements();
    firstFocusable && firstFocusable.focus();

    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', onKeyDown);
  }

  function closeModal() {
    if (!overlay) return;
    button.setAttribute('aria-expanded', 'false');
    document.body.removeChild(overlay);
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);
    overlay = null;
    lastFocusedElement && lastFocusedElement.focus();
  }

  button.addEventListener('click', openModal);

  initSimulationCTA.destroy = function() {
    if (overlay) {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      overlay = null;
    }
    if (button) {
      button.removeEventListener('click', openModal);
      document.body.removeChild(button);
      button = null;
    }
    lastFocusedElement && lastFocusedElement.focus && lastFocusedElement.focus();
    focusableElements = [];
    firstFocusable = null;
    lastFocusable = null;
    lastFocusedElement = null;
    initSimulationCTA._initialized = false;
  };
}

initSimulationCTA._initialized = false;