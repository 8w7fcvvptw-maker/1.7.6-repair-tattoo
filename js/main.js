/* ===== DOM REFERENCES ===== */
const header         = document.getElementById('header');
const burger         = document.getElementById('burger');
const nav            = document.getElementById('nav');
const navLinks       = document.querySelectorAll('.nav__link');
const bookingForm    = document.getElementById('booking-form');
const bookingSuccess = document.getElementById('booking-success');
const submitBtn      = document.getElementById('submit-btn');

const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightbox-img');
const lightboxClose  = document.getElementById('lightbox-close');
const lightboxPrev   = document.getElementById('lightbox-prev');
const lightboxNext   = document.getElementById('lightbox-next');
const portfolioGrid  = document.querySelector('.portfolio__grid');
const portfolioFilters = document.querySelectorAll('.portfolio__filter');

let portfolioItems   = document.querySelectorAll('.portfolio__item:not(.is-hidden)');
let currentImageIndex = 0;
let portfolioImages  = [];

function refreshPortfolioItems() {
  portfolioItems = document.querySelectorAll('.portfolio__item:not(.is-hidden)');
  portfolioImages = Array.from(portfolioItems).map(
    item => item.querySelector('img').src
  );
}

refreshPortfolioItems();

/* ===== HEADER SCROLL ===== */
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ===== MOBILE MENU ===== */
function closeMobileNav() {
  burger.classList.remove('active');
  burger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  burger.classList.toggle('active', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

/* ===== ACTIVE NAV LINK ===== */
const navSections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -60% 0px' }
);

navSections.forEach(section => navObserver.observe(section));

/* ===== SCROLL ANIMATIONS ===== */
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

fadeElements.forEach(el => fadeObserver.observe(el));

/* ===== PORTFOLIO FILTER ===== */
portfolioFilters.forEach(filterBtn => {
  filterBtn.addEventListener('click', () => {
    const filter = filterBtn.dataset.filter;

    portfolioFilters.forEach(btn => {
      const isActive = btn === filterBtn;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    document.querySelectorAll('.portfolio__item').forEach(item => {
      const category = item.dataset.category;
      const show = filter === 'all' || category === filter;
      item.classList.toggle('is-hidden', !show);
    });

    refreshPortfolioItems();
    bindPortfolioClicks();
  });
});

/* ===== LIGHTBOX ===== */
function openLightbox(index) {
  if (!portfolioImages.length) return;
  currentImageIndex = index;
  lightboxImg.src = portfolioImages[index];
  lightboxImg.alt = portfolioItems[index].querySelector('img').alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showPrevImage() {
  if (!portfolioImages.length) return;
  currentImageIndex = (currentImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
  lightboxImg.src = portfolioImages[currentImageIndex];
  lightboxImg.alt = portfolioItems[currentImageIndex].querySelector('img').alt;
}

function showNextImage() {
  if (!portfolioImages.length) return;
  currentImageIndex = (currentImageIndex + 1) % portfolioImages.length;
  lightboxImg.src = portfolioImages[currentImageIndex];
  lightboxImg.alt = portfolioItems[currentImageIndex].querySelector('img').alt;
}

function bindPortfolioClicks() {
  portfolioItems.forEach((item, index) => {
    item.onclick = () => openLightbox(index);
  });
}

bindPortfolioClicks();

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrevImage();
  if (e.key === 'ArrowRight') showNextImage();
});

/* ===== FAQ ACCORDION (single open) ===== */
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    }
  });
});

/* ===== FORM VALIDATION ===== */
const MIN_NAME_LENGTH = 2;
const PHONE_REGEX = /^\+?\d{10,15}$/;

const validators = {
  name: value => {
    const trimmed = value.trim();
    if (!trimmed) return 'Введите ваше имя';
    if (trimmed.length < MIN_NAME_LENGTH) return 'Имя должно содержать минимум 2 символа';
    return '';
  },
  phone: value => {
    if (!value.trim()) return 'Введите номер телефона';
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    if (!PHONE_REGEX.test(cleaned)) return 'Введите корректный номер телефона';
    return '';
  },
  service: value => {
    if (!value) return 'Выберите услугу';
    return '';
  },
  consent: () => {
    const checkbox = document.getElementById('consent');
    return checkbox && checkbox.checked ? '' : 'Необходимо согласие на обработку данных';
  },
};

const FORM_FIELDS = Object.keys(validators).filter(f => f !== 'consent');

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (message) {
    input.classList.add('invalid');
    if (error) error.textContent = message;
  } else {
    input.classList.remove('invalid');
    if (error) error.textContent = '';
  }
}

function validateForm() {
  let isValid = true;

  for (const field of FORM_FIELDS) {
    const error = validators[field](document.getElementById(field).value);
    showError(field, error);
    if (error) isValid = false;
  }

  const consentError = validators.consent();
  showError('consent', consentError);
  if (consentError) isValid = false;

  return isValid;
}

FORM_FIELDS.forEach(fieldId => {
  document.getElementById(fieldId).addEventListener('input', e => {
    showError(fieldId, validators[fieldId](e.target.value));
  });
});

document.getElementById('consent').addEventListener('change', () => {
  showError('consent', validators.consent());
});

/* ===== FORM SUBMISSION ===== */
const SERVICE_LABELS = {
  tattoo: 'Татуировка',
  sketch: 'Разработка эскиза',
  coverup: 'Перекрытие',
  correction: 'Коррекция',
};

const bookingHandoff = document.getElementById('booking-handoff');
const bookingHandoffPreview = document.getElementById('booking-handoff-preview');
const bookingHandoffBtn = document.getElementById('booking-handoff-btn');

function buildBookingMessage(data) {
  const lines = [
    'Здравствуйте! Хочу записаться на тату.',
    '',
    `Имя: ${data.name}`,
    `Телефон / контакт: ${data.phone}`,
    `Услуга: ${SERVICE_LABELS[data.service] || data.service}`,
  ];

  if (data.date) lines.push(`Желаемая дата: ${data.date}`);
  if (data.message) lines.push(`Комментарий: ${data.message}`);

  lines.push('', 'Пришла/пришёл с сайта.');
  return lines.join('\n');
}

async function copyToClipboard(text) {
  const copyStatus = document.getElementById('booking-handoff-copy');
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      if (copyStatus) {
        copyStatus.textContent = 'Текст заявки скопирован — вставьте его в чат VK.';
      }
      return;
    }
  } catch {
    /* fall through to manual hint */
  }

  if (copyStatus) {
    copyStatus.textContent = 'Скопируйте текст заявки выше и отправьте в чат VK.';
  }
}

async function submitBookingForm(data) {
  const response = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }
}

function showBookingHandoff(message) {
  bookingForm.style.display = 'none';
  bookingSuccess.classList.remove('show');

  if (bookingHandoffPreview) bookingHandoffPreview.textContent = message;
  if (bookingHandoff) {
    bookingHandoff.removeAttribute('hidden');
    bookingHandoff.classList.add('show');
    bookingHandoff.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  copyToClipboard(message);
}

bookingHandoffBtn?.addEventListener('click', () => {
  const text = bookingHandoffPreview?.textContent || '';
  if (text) copyToClipboard(text);
});

bookingForm.addEventListener('submit', async e => {
  e.preventDefault();

  if (!validateForm()) return;

  const formData = {
    name:    document.getElementById('name').value.trim(),
    phone:   document.getElementById('phone').value.trim(),
    service: document.getElementById('service').value,
    date:    dateDisplay.value,
    message: document.getElementById('message').value.trim(),
  };

  const preparedMessage = buildBookingMessage(formData);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправка...';

  try {
    await submitBookingForm(formData);
    bookingForm.style.display = 'none';
    if (bookingHandoff) {
      bookingHandoff.classList.remove('show');
      bookingHandoff.setAttribute('hidden', '');
    }
    bookingSuccess.classList.add('show');
    bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    showBookingHandoff(preparedMessage);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку';
  }
});

/* ===== PHONE MASK ===== */
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', () => {
  let val = phoneInput.value.replace(/\D/g, '');

  if (val.startsWith('8')) val = '7' + val.slice(1);
  if (val.length === 0) { phoneInput.value = ''; return; }

  let formatted = '+';
  if (val.length > 0) formatted += val.slice(0, 1);
  if (val.length > 1) formatted += ' (' + val.slice(1, 4);
  if (val.length > 4) formatted += ') ' + val.slice(4, 7);
  if (val.length > 7) formatted += '-' + val.slice(7, 9);
  if (val.length > 9) formatted += '-' + val.slice(9, 11);

  phoneInput.value = formatted;
});

/* ===== CUSTOM CALENDAR ===== */
const dateDisplay = document.getElementById('date-display');
const dateHidden  = document.getElementById('date');
const calPopup    = document.getElementById('cal-popup');

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                     'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WEEK_DAYS   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function renderCalendar() {
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const selected = dateHidden.value;

  const firstDay = new Date(calYear, calMonth, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = `
    <div class="cal-header">
      <button type="button" class="cal-nav" id="cal-prev" aria-label="Предыдущий месяц">&#8249;</button>
      <span class="cal-header__title">${MONTH_NAMES[calMonth]} ${calYear}</span>
      <button type="button" class="cal-nav" id="cal-next" aria-label="Следующий месяц">&#8250;</button>
    </div>
    <div class="cal-weekdays">
      ${WEEK_DAYS.map(d => `<span class="cal-weekday">${d}</span>`).join('')}
    </div>
    <div class="cal-days">
  `;

  for (let i = 0; i < startDow; i++) {
    html += `<button type="button" class="cal-day" disabled></button>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date   = new Date(calYear, calMonth, d);
    const iso    = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isPast = date < today;
    const isTod  = date.getTime() === today.getTime();
    const isSel  = iso === selected;

    html += `<button type="button" class="cal-day ${isTod ? 'is-today' : ''} ${isSel ? 'is-selected' : ''}"
               data-date="${iso}" ${isPast ? 'disabled' : ''}>${d}</button>`;
  }

  html += `</div>`;
  calPopup.innerHTML = html;

  document.getElementById('cal-prev').addEventListener('click', e => {
    e.stopPropagation();
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  document.getElementById('cal-next').addEventListener('click', e => {
    e.stopPropagation();
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  calPopup.querySelectorAll('.cal-day[data-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      const iso = btn.dataset.date;
      const [y, m, day] = iso.split('-');
      dateHidden.value  = iso;
      dateDisplay.value = `${day}.${m}.${y}`;
      closeCalendar();
    });
  });
}

function openCalendar() {
  calPopup.classList.add('is-open');
  calPopup.setAttribute('aria-hidden', 'false');
  renderCalendar();
}

function closeCalendar() {
  calPopup.classList.remove('is-open');
  calPopup.setAttribute('aria-hidden', 'true');
}

dateDisplay.addEventListener('click', () => {
  calPopup.classList.contains('is-open') ? closeCalendar() : openCalendar();
});

document.addEventListener('click', e => {
  if (!document.getElementById('date-wrapper').contains(e.target)) closeCalendar();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCalendar();
});

/* ===== FLOATING MOBILE CTA ===== */
const floatingCta = document.getElementById('floating-cta');
const MOBILE_MQ = window.matchMedia('(max-width: 768px)');

function updateFloatingCta() {
  if (!floatingCta) return;
  const isMobile = MOBILE_MQ.matches;
  document.body.classList.toggle('has-floating-cta', isMobile);
  floatingCta.setAttribute('aria-hidden', String(!isMobile));
}

updateFloatingCta();
MOBILE_MQ.addEventListener('change', updateFloatingCta);

/* ===== ATMOSPHERE VIDEO (lazy load + play) ===== */
const atmosphereVideo = document.getElementById('atmosphere-video');
const atmosphereFrame = document.querySelector('.atmosphere__frame');

if (atmosphereVideo && atmosphereFrame) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playAtmosphereVideo() {
    if (prefersReducedMotion) return;
    atmosphereVideo.preload = 'auto';
    const playPromise = atmosphereVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }

  function pauseAtmosphereVideo() {
    if (!atmosphereVideo.paused) atmosphereVideo.pause();
  }

  const videoObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playAtmosphereVideo();
        } else {
          pauseAtmosphereVideo();
        }
      });
    },
    { threshold: 0.2, rootMargin: '80px 0px' }
  );

  videoObserver.observe(atmosphereFrame);

  const frameObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          atmosphereFrame.classList.add('visible');
          frameObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  frameObserver.observe(atmosphereFrame);
}
