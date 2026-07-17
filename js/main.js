/* ============================================
   MY BODY, MY CARE - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ========== Navbar Scroll Effect ==========
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('scrolled')) {
    function handleNavScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();
  }

  // ========== Mobile Menu Toggle ==========
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const menuOverlay = document.getElementById('menuOverlay');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      if (menuOverlay) menuOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    if (menuOverlay) {
      menuOverlay.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ========== Back to Top Button ==========
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== Scroll Animations (Fade Up) ==========
  const fadeElements = document.querySelectorAll('.fade-up');
  if (fadeElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  // ========== Animated Counters ==========
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * (target - start) + start);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  // ========== FAQ Accordion ==========
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        // Close all other FAQ items
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            var answer = otherItem.querySelector('.faq-answer');
            if (answer) answer.style.maxHeight = null;
          }
        });

        // Toggle current item
        item.classList.toggle('active');
        var answer = item.querySelector('.faq-answer');
        if (answer) {
          if (!isActive) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          } else {
            answer.style.maxHeight = null;
          }
        }
      });
    }
  });

  // ========== Gallery Filter ==========
  const galleryTabs = document.querySelectorAll('#galleryTabs .tab-btn');
  const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');

  if (galleryTabs.length > 0 && galleryItems.length > 0) {
    galleryTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = tab.getAttribute('data-filter');

        // Update active tab
        galleryTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        // Filter items
        galleryItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
            setTimeout(function () { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(function () { item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  // ========== Contact Form Handling ==========
  window.handleContactSubmit = function (e) {
    e.preventDefault();

    var form = document.getElementById('contactForm');
    var formData = new FormData(form);

    // Submit to Formspree
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        // Save to localStorage as backup
        var msg = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone') ? document.getElementById('phone').value : '',
          organization: document.getElementById('organization') ? document.getElementById('organization').value : '',
          subject: document.getElementById('subject').value,
          message: document.getElementById('message').value,
          date: new Date().toISOString(),
          read: false
        };
        var messages = JSON.parse(localStorage.getItem('mbmc_messages') || '[]');
        messages.unshift(msg);
        localStorage.setItem('mbmc_messages', JSON.stringify(messages));

        // Show success
        form.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
      } else {
        alert('Something went wrong. Please try again or contact us directly.');
      }
    }).catch(function () {
      alert('Network error. Please check your connection and try again.');
    });
  };

  window.resetForm = function () {
    document.getElementById('contactForm').reset();
    document.getElementById('contactForm').style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';
  };

  // ========== Load Dynamic Content ==========
  loadDynamicContent();

  // ========== Testimonial Carousel ==========
  var track = document.getElementById('testimonialTrack');
  if (track) {
    var slides = track.querySelectorAll('.testimonial-slide');
    var dotsContainer = document.getElementById('testimonialDots');
    var current = 0;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsContainer.querySelectorAll('.testimonial-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    document.getElementById('testimonialPrev').addEventListener('click', function () {
      goTo(current === 0 ? slides.length - 1 : current - 1);
    });

    document.getElementById('testimonialNext').addEventListener('click', function () {
      goTo(current === slides.length - 1 ? 0 : current + 1);
    });

    setInterval(function () {
      goTo(current === slides.length - 1 ? 0 : current + 1);
    }, 5000);
  }

});

// ========== Load Content from localStorage ==========
function loadDynamicContent() {
  // Load statistics
  var stats = JSON.parse(localStorage.getItem('mbmc_stats') || 'null');
  if (stats) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var key = el.closest('.stat-item, .hero-stat') ?
        el.closest('.stat-item, .hero-stat').querySelector('.stat-label') :
        null;
      if (key) {
        var label = key.textContent.trim().toLowerCase();
        if (label.includes('girl') && stats.girlsEducated !== undefined) {
          el.setAttribute('data-count', stats.girlsEducated);
          el.textContent = stats.girlsEducated;
        } else if (label.includes('kit') && stats.kitsDistributed !== undefined) {
          el.setAttribute('data-count', stats.kitsDistributed);
          el.textContent = stats.kitsDistributed;
        } else if (label.includes('school') && stats.schoolsVisited !== undefined) {
          el.setAttribute('data-count', stats.schoolsVisited);
          el.textContent = stats.schoolsVisited;
        } else if (label.includes('health') && stats.healthcarePros !== undefined) {
          el.setAttribute('data-count', stats.healthcarePros);
          el.textContent = stats.healthcarePros;
        }
      }
    });
  }

  // Load news posts
  var posts = JSON.parse(localStorage.getItem('mbmc_news') || '[]');
  var blogGrid = document.getElementById('blogGrid');
  if (blogGrid && posts.length > 0) {
    // Add dynamic posts before existing ones
    posts.forEach(function (post) {
      var article = document.createElement('article');
      article.className = 'blog-card fade-up';
      article.innerHTML =
        '<div class="blog-image"><div class="placeholder-img">&#128240;</div></div>' +
        '<div class="blog-body">' +
        '<div class="blog-meta"><span class="blog-tag">' + escapeHtml(post.category) + '</span><span>' + escapeHtml(post.date) + '</span></div>' +
        '<h3><a href="#">' + escapeHtml(post.title) + '</a></h3>' +
        '<p>' + escapeHtml(post.content.substring(0, 150)) + (post.content.length > 150 ? '...' : '') + '</p>' +
        '</div>' +
        '<div class="blog-footer">' +
        '<div class="blog-author"><span class="blog-author-avatar">MB</span><span>My Body, My Care Team</span></div>' +
        '<a href="#" class="read-more">Read More &#8594;</a>' +
        '</div>';
      blogGrid.insertBefore(article, blogGrid.firstChild);
    });
  }

  // Load gallery photos
  var photos = JSON.parse(localStorage.getItem('mbmc_gallery') || '[]');
  var galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid && photos.length > 0) {
    photos.forEach(function (photo) {
      var item = document.createElement('div');
      item.className = 'gallery-item fade-up';
      item.setAttribute('data-category', photo.category);
      item.innerHTML =
        '<img src="' + photo.data + '" alt="' + escapeHtml(photo.caption) + '" style="width:100%;height:100%;object-fit:cover;">' +
        '<div class="gallery-overlay">' +
        '<h4>' + escapeHtml(photo.caption) + '</h4>' +
        '<p>' + escapeHtml(photo.category) + '</p>' +
        '</div>';
      galleryGrid.insertBefore(item, galleryGrid.firstChild);
    });
  }

  // Load team members
  var team = JSON.parse(localStorage.getItem('mbmc_team') || '[]');
  var teamGrid = document.querySelector('.team-grid');
  if (teamGrid && team.length > 0) {
    team.forEach(function (member) {
      var card = document.createElement('div');
      card.className = 'team-card fade-up';
      var initials = member.name.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      var photoHtml = member.photo ?
        '<img src="' + member.photo + '" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 1.2rem;">' :
        '<div class="team-avatar pink">' + initials + '</div>';
      card.innerHTML =
        photoHtml +
        '<h4>' + escapeHtml(member.name) + '</h4>' +
        '<p class="team-role">' + escapeHtml(member.role) + '</p>' +
        '<p>' + escapeHtml(member.bio || '') + '</p>';
      teamGrid.appendChild(card);
    });
  }
}

// ========== Utility: Escape HTML ==========
function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
