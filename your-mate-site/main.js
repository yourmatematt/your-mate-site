const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');

function toggleMobileMenu() {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open');
}

function closeMobileMenu() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
  document.body.classList.remove('menu-open');
}

hamburger.addEventListener('click', toggleMobileMenu);

mobileMenuLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

const workHeading = document.querySelector('.work-heading');
const workCards = document.querySelectorAll('.work-card');

const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

if (workHeading) {
  observer.observe(workHeading);
}

workCards.forEach(card => {
  const delay = card.getAttribute('data-delay') || 0;

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
      }
    });
  }, observerOptions);

  cardObserver.observe(card);
});

const footerLocations = [
  'MALLACOOTA',
  'BAIRNSDALE',
  'SALE',
  'TRARALGON',
  'MERIMBULA',
  'BEGA',
  'EAST GIPPSLAND'
];

let footerLocationIndex = 0;
const footerLocationElement = document.getElementById('footer-location');

function rotateFooterLocation() {
  if (!footerLocationElement) return;

  footerLocationElement.style.opacity = '0';

  setTimeout(() => {
    footerLocationIndex = (footerLocationIndex + 1) % footerLocations.length;
    footerLocationElement.textContent = footerLocations[footerLocationIndex];

    footerLocationElement.style.opacity = '1';
  }, 500);
}

if (footerLocationElement) {
  footerLocationElement.style.transition = 'opacity 500ms ease-in-out';

  // Respect prefers-reduced-motion: don't animate location rotation
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(rotateFooterLocation, 3000);
  }
}

const servicesObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
});

const servicesHeading = document.querySelector('.services-heading');
if (servicesHeading) {
  servicesObserver.observe(servicesHeading);
}

const introParagraphs = document.querySelectorAll('.services-intro p');
introParagraphs.forEach((p, index) => {
  p.style.transitionDelay = `${index * 150}ms`;
  servicesObserver.observe(p);
});

const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
  step.style.transitionDelay = `${index * 150}ms`;
  servicesObserver.observe(step);
});

const servicesCTA = document.querySelector('.services-cta');
if (servicesCTA) {
  servicesCTA.style.transitionDelay = '600ms';
  servicesObserver.observe(servicesCTA);
}

// ==========================================
// BLOG PREVIEW SECTION (Homepage)
// ==========================================

var blogHeading = document.querySelector('.blog-preview-heading');
if (blogHeading) servicesObserver.observe(blogHeading);

var blogSubheading = document.querySelector('.blog-preview-subheading');
if (blogSubheading) servicesObserver.observe(blogSubheading);

var blogCards = document.querySelectorAll('.blog-preview-card');
blogCards.forEach(function(card, index) {
  card.style.transitionDelay = (200 + index * 150) + 'ms';
  servicesObserver.observe(card);
});

var blogCta = document.querySelector('.blog-preview-cta');
if (blogCta) {
  blogCta.style.transitionDelay = '600ms';
  servicesObserver.observe(blogCta);
}

// ==========================================
// ABOUT SECTION (Homepage)
// ==========================================

var aboutHeading = document.querySelector('.about-section-heading');
if (aboutHeading) servicesObserver.observe(aboutHeading);

var aboutSubheading = document.querySelector('.about-section-subheading');
if (aboutSubheading) servicesObserver.observe(aboutSubheading);

var aboutPhoto = document.querySelector('.about-section-photo-wrap');
if (aboutPhoto) servicesObserver.observe(aboutPhoto);

var aboutTexts = document.querySelectorAll('.about-section-text');
aboutTexts.forEach(function(p, index) {
  p.style.transitionDelay = (300 + index * 150) + 'ms';
  servicesObserver.observe(p);
});

var aboutCta = document.querySelector('.about-section-cta');
if (aboutCta) {
  aboutCta.style.transitionDelay = '600ms';
  servicesObserver.observe(aboutCta);
}

// ==========================================
// REVIEWS SECTION
// ==========================================

(async function loadReviews() {
  try {
    var [reviewsRes, projectsRes] = await Promise.all([
      fetch('/api/reviews'),
      fetch('/api/projects')
    ]);
    if (!reviewsRes.ok) throw new Error('Failed to fetch reviews');
    var reviews = await reviewsRes.json();
    if (!reviews || reviews.length === 0) return;

    var projects = [];
    if (projectsRes.ok) {
      projects = await projectsRes.json();
    }

    // Build lookup: lowercase name -> slug
    var projectMap = {};
    (projects || []).forEach(function(p) {
      projectMap[p.name.toLowerCase()] = p.slug;
    });

    function findProjectSlug(review) {
      var biz = review.business_name.toLowerCase();
      var client = review.client_name.toLowerCase();
      if (projectMap[biz]) return projectMap[biz];
      if (projectMap[client]) return projectMap[client];
      // Partial match: check if project name is contained in business/client name or vice versa
      for (var name in projectMap) {
        if (biz.indexOf(name) !== -1 || name.indexOf(biz) !== -1) return projectMap[name];
        if (client.indexOf(name) !== -1 || name.indexOf(client) !== -1) return projectMap[name];
      }
      return null;
    }

    var section = document.getElementById('reviews');
    var grid = document.getElementById('reviews-grid');
    if (!section || !grid) return;

    var sourceIcons = {
      google: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#1877F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };

    reviews.forEach(function(review, index) {
      var card = document.createElement('div');
      card.className = 'review-card';
      card.style.transitionDelay = (index * 150) + 'ms';

      var sourceLabel = review.source.charAt(0).toUpperCase() + review.source.slice(1);
      var icon = sourceIcons[review.source] || '';

      var slug = findProjectSlug(review);
      var businessHtml = slug
        ? '<a href="/project/' + escapeHtml(slug) + '" class="review-business-link">' + escapeHtml(review.business_name) + '</a>'
        : '<div class="review-business">' + escapeHtml(review.business_name) + '</div>';

      card.innerHTML =
        '<blockquote>' + escapeHtml(review.review_text) + '</blockquote>' +
        '<div class="review-attribution">' +
          '<div>' +
            '<div class="review-name">' + escapeHtml(review.client_name) + '</div>' +
            businessHtml +
          '</div>' +
        '</div>' +
        (review.source !== 'direct' && review.source !== 'other'
          ? '<div class="review-source-badge">' + icon + ' ' + sourceLabel + '</div>'
          : '');

      grid.appendChild(card);
      servicesObserver.observe(card);
    });

    // Show the section and observe its heading/subheading
    section.style.display = '';
    var reviewsHeading = document.querySelector('.reviews-heading');
    var reviewsSubheading = document.querySelector('.reviews-subheading');
    if (reviewsHeading) servicesObserver.observe(reviewsHeading);
    if (reviewsSubheading) servicesObserver.observe(reviewsSubheading);

  } catch (e) {
    // If fetch fails, section stays hidden
  }
})();

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
