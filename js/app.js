// Main application entry point
import { initAnalytics, trackEvent } from '../googleAnalyticsTracker.js';
import '../renderInteractivePdfListing.js';
import '../fetchAndRenderBlogPosts.js';
import '../contactFormManager.js';
import '../mentoringBookingFlow.js';
import { initSimulationCTA } from '../insertFloatingCtaForm.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('TOEFL Connect application initializing...');
  
  // Initialize navigation
  initNavigation();
  
  // Initialize analytics if GTM ID is available
  const gtmId = import.meta.env?.VITE_GTM_ID || 'GTM-XXXXXXX';
  if (gtmId && gtmId !== 'GTM-XXXXXXX') {
    initAnalytics(gtmId);
    trackEvent('page_view', { page_title: document.title });
  }
  
  // Initialize simulation CTA
  const simulationFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdummy/viewform?embedded=true';
  initSimulationCTA(simulationFormUrl, {
    buttonLabel: 'Take Free TOEFL Test',
    iframeTitle: 'TOEFL Practice Test'
  });
  
  // Initialize smooth scrolling for anchor links
  initSmoothScrolling();
  
  // Initialize intersection observer for animations
  initScrollAnimations();
  
  console.log('TOEFL Connect application initialized successfully');
});

function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-navigation');
  
  if (!navToggle || !primaryNav) return;
  
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    primaryNav.setAttribute('aria-expanded', !isExpanded);
    
    // Animate hamburger menu
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
      if (!isExpanded) {
        if (index === 0) bar.style.transform = 'rotate(45deg) translate(6px, 6px)';
        if (index === 1) bar.style.opacity = '0';
        if (index === 2) bar.style.transform = 'rotate(-45deg) translate(6px, -6px)';
      } else {
        bar.style.transform = '';
        bar.style.opacity = '';
      }
    });
  });
  
  // Close mobile menu when clicking on nav links
  const navLinks = primaryNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.setAttribute('aria-expanded', 'false');
      
      // Reset hamburger menu
      const bars = navToggle.querySelectorAll('.bar');
      bars.forEach(bar => {
        bar.style.transform = '';
        bar.style.opacity = '';
      });
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !primaryNav.contains(e.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.setAttribute('aria-expanded', 'false');
      
      // Reset hamburger menu
      const bars = navToggle.querySelectorAll('.bar');
      bars.forEach(bar => {
        bar.style.transform = '';
        bar.style.opacity = '';
      });
    }
  });
}

function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (!target) return;
      
      e.preventDefault();
      
      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      const targetPosition = target.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Update URL without triggering scroll
      history.pushState(null, null, href);
    });
  });
}

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate on scroll
  const animateElements = document.querySelectorAll('.pdf-card, .blog-card, .section h2');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Export for use in other modules
export { trackEvent };