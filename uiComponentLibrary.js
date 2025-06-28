let alertContainer = null;
let modalCount = 0;

export function createButton({ text = '', classes = [], onClick = null, type = 'button', attrs = {} } = {}) {
    const button = document.createElement('button');
    button.type = type;
    if (Array.isArray(classes)) {
        classes.forEach(cls => button.classList.add(cls));
    } else if (typeof classes === 'string') {
        button.classList.add(classes);
    }
    button.textContent = text;
    if (typeof onClick === 'function') {
        button.addEventListener('click', onClick);
    }
    for (const [attr, value] of Object.entries(attrs)) {
        button.setAttribute(attr, value);
    }
    return button;
}

export function showModal(content, options = {}) {
    const { title = '', ariaLabel = '', classes = [], closeOnOverlayClick = true, onClose = null } = options;
    modalCount++;
    const previousActiveElement = document.activeElement;
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    const modal = document.createElement('div');
    modal.classList.add('modal');
    if (Array.isArray(classes)) {
        classes.forEach(cls => modal.classList.add(cls));
    } else if (typeof classes === 'string') {
        modal.classList.add(classes);
    }
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    let titleId;
    if (title) {
        titleId = `modal-title-${modalCount}`;
        modal.setAttribute('aria-labelledby', titleId);
    } else if (ariaLabel) {
        modal.setAttribute('aria-label', ariaLabel);
    } else {
        console.warn('showModal: Consider providing a title or ariaLabel for accessibility.');
    }
    const header = document.createElement('div');
    header.classList.add('modal-header');
    if (title) {
        const h2 = document.createElement('h2');
        h2.id = titleId;
        h2.classList.add('modal-title');
        h2.textContent = title;
        header.appendChild(h2);
    }
    const closeBtn = createButton({
        text: '?',
        classes: ['modal-close'],
        onClick: close,
        attrs: { 'aria-label': 'Close modal' }
    });
    header.appendChild(closeBtn);
    modal.appendChild(header);
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('modal-content');
    if (typeof content === 'string') {
        contentContainer.textContent = content;
    } else if (content instanceof Node) {
        contentContainer.appendChild(content);
    } else if (Array.isArray(content) || content instanceof NodeList) {
        Array.from(content).forEach(node => {
            if (node instanceof Node) {
                contentContainer.appendChild(node);
            }
        });
    }
    modal.appendChild(contentContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    modal.focus();
    function getFocusableElements(element) {
        const selectors = [
            'a[href]',
            'area[href]',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex="-1"])'
        ];
        return Array.from(element.querySelectorAll(selectors.join(','))).filter(el => el.offsetParent !== null);
    }
    function trapFocus(e) {
        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length === 0) {
            e.preventDefault();
            modal.focus();
            return;
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    }
    function keydownListener(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'Tab') {
            trapFocus(e);
        }
    }
    function overlayClickListener(e) {
        if (closeOnOverlayClick && e.target === overlay) {
            close();
        }
    }
    function close() {
        document.removeEventListener('keydown', keydownListener);
        overlay.removeEventListener('click', overlayClickListener);
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        document.body.classList.remove('modal-open');
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
        }
        if (typeof onClose === 'function') {
            onClose();
        }
    }
    document.addEventListener('keydown', keydownListener);
    overlay.addEventListener('click', overlayClickListener);
    return { close };
}

export function showAlert(type = 'info', message = '', options = {}) {
    const { duration = 3000 } = options;
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.classList.add('alert-container');
        alertContainer.setAttribute('aria-live', 'polite');
        alertContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(alertContainer);
    }
    const alertEl = document.createElement('div');
    alertEl.classList.add('alert', `alert--${type}`);
    alertEl.setAttribute('role', 'alert');
    const messageEl = document.createElement('div');
    messageEl.classList.add('alert-message');
    messageEl.textContent = message;
    const closeBtn = createButton({
        text: '?',
        classes: ['alert-close'],
        onClick: close,
        attrs: { 'aria-label': 'Close alert' }
    });
    alertEl.appendChild(messageEl);
    alertEl.appendChild(closeBtn);
    alertContainer.appendChild(alertEl);
    let timeoutId = setTimeout(close, duration);
    function close() {
        clearTimeout(timeoutId);
        if (!alertEl.classList.contains('alert--closing')) {
            alertEl.classList.add('alert--closing');
            alertEl.addEventListener('transitionend', () => {
                if (alertEl.parentNode) {
                    alertEl.parentNode.removeChild(alertEl);
                }
            }, { once: true });
            setTimeout(() => {
                if (alertEl.parentNode) {
                    alertEl.parentNode.removeChild(alertEl);
                }
            }, 500);
        }
    }
    return { close, element: alertEl };
}

export function showSpinner(target) {
    let parent;
    if (typeof target === 'string') {
        parent = document.querySelector(target);
        if (!parent) {
            throw new Error(`showSpinner: No element found for selector "${target}"`);
        }
    } else if (target instanceof Element) {
        parent = target;
    } else {
        throw new Error('showSpinner: Invalid target. Must be a selector or DOM element.');
    }
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Loading');
    const circle = document.createElement('div');
    circle.classList.add('spinner__circle');
    spinner.appendChild(circle);
    parent.appendChild(spinner);
    function remove() {
        if (spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }
    return { element: spinner, remove };
}