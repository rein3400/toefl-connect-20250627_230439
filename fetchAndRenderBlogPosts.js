import * as apiService from './js/apiservice.js';

let listContainer;
let detailContainer;
let posts = [];

function sanitizeHTML(str) {
  const template = document.createElement('template');
  template.innerHTML = str;
  const allowedTags = ['A','B','I','EM','STRONG','P','BR','UL','OL','LI','BLOCKQUOTE','H1','H2','H3','H4','H5','H6'];
  const allowedAttributes = {
    'A': ['href','title','target','rel']
  };
  function traverse(node) {
    const childNodes = Array.from(node.childNodes);
    childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName;
        if (!allowedTags.includes(tagName)) {
          const frag = document.createDocumentFragment();
          while (child.firstChild) {
            frag.appendChild(child.firstChild);
          }
          node.replaceChild(frag, child);
          traverse(frag);
        } else {
          Array.from(child.attributes).forEach(attr => {
            const name = attr.name;
            const allowedAttrList = allowedAttributes[tagName] || [];
            if (!allowedAttrList.includes(name) || (name === 'href' && /^javascript:/i.test(child.getAttribute('href').trim()))) {
              child.removeAttribute(name);
            }
          });
          traverse(child);
        }
      }
    });
  }
  traverse(template.content);
  return template.innerHTML;
}

async function loadPosts() {
  listContainer = document.querySelector('[data-blog-list]') || document.getElementById('blog-list');
  detailContainer = document.querySelector('[data-blog-detail]') || document.getElementById('blog-detail');
  try {
    const data = await apiService.fetchJSON('data/blogPosts.json');
    posts = Array.isArray(data) ? data : [];
    renderList();
    handleRoute();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    if (listContainer) {
      listContainer.innerHTML = '<p class="error">Unable to load blog posts.</p>';
    }
  }
}

function renderList() {
  if (!listContainer) return;
  listContainer.innerHTML = '';
  if (!posts.length) {
    listContainer.innerHTML = '<p>No blog posts available.</p>';
    return;
  }
  const ul = document.createElement('ul');
  ul.className = 'blog-list';
  posts.forEach(post => {
    const li = document.createElement('li');
    li.className = 'blog-list__item';
    const a = document.createElement('a');
    a.href = `#post-${post.id}`;
    a.textContent = post.title;
    a.setAttribute('aria-label', `Read "${post.title}"`);
    li.appendChild(a);
    ul.appendChild(li);
  });
  listContainer.appendChild(ul);
}

function loadPostDetail(id) {
  if (!detailContainer) return;
  detailContainer.innerHTML = '';
  const post = posts.find(p => String(p.id) === String(id));
  if (!post) {
    detailContainer.innerHTML = '<p class="error">Post not found.</p>';
    return;
  }
  renderDetail(post);
}

function renderDetail(post) {
  const article = document.createElement('article');
  article.className = 'blog-detail';
  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = post.title;
  header.appendChild(title);
  if (post.date) {
    const time = document.createElement('time');
    time.dateTime = post.date;
    time.textContent = new Date(post.date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    header.appendChild(time);
  }
  if (post.author) {
    const author = document.createElement('p');
    author.className = 'blog-detail__author';
    author.textContent = `By ${post.author}`;
    header.appendChild(author);
  }
  article.appendChild(header);
  const content = document.createElement('section');
  content.className = 'blog-detail__content';
  content.innerHTML = sanitizeHTML(post.content || '');
  article.appendChild(content);
  detailContainer.appendChild(article);
}

function handleRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#post-')) {
    const id = hash.slice(6);
    loadPostDetail(id);
  } else if (detailContainer) {
    detailContainer.innerHTML = '';
  }
}

window.addEventListener('hashchange', handleRoute);
document.addEventListener('DOMContentLoaded', loadPosts);

export { loadPosts, loadPostDetail };