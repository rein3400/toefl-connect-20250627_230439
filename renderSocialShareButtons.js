export default function renderSocialShareButtons(container, options = {}) {
  const target = typeof container === 'string' ? document.querySelector(container) : container;
  if (!(target instanceof Element)) {
    console.warn('renderSocialShareButtons: target container not found:', container);
    return null;
  }

  const existing = target.querySelector('.social-share-buttons');
  if (existing) {
    existing.remove();
  }

  const {
    url = window.location.href,
    title = document.title,
    text = '',
    networks = ['facebook', 'twitter', 'linkedin', 'email'],
  } = options;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A${encodedUrl}`,
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'social-share-buttons';

  networks.forEach((network) => {
    const shareLink = shareUrls[network];
    if (!shareLink) {
      console.warn(`renderSocialShareButtons: Unsupported network "${network}"`);
      return;
    }

    const link = document.createElement('a');
    link.className = `social-share-buttons__button social-share-buttons__button--${network}`;
    link.href = shareLink;

    if (network !== 'email') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const label = network.charAt(0).toUpperCase() + network.slice(1);
    link.setAttribute('aria-label', `Share on ${label}`);
    link.textContent = label;

    wrapper.appendChild(link);
  });

  target.appendChild(wrapper);
  return wrapper;
}