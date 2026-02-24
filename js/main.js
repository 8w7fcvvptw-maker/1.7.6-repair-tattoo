/* =============================================
   CONFIGURATION — replace with your own values
   ============================================= */
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

/* =============================================
   DOM ELEMENTS
   ============================================= */
const header = document.getElementById('header');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav__link');
const bookingForm = document.getElementById('booking-form');
const bookingSuccess = document.getElementById('booking-success');
const submitBtn = document.getElementById('submit-btn');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const portfolioItems = document.querySelectorAll('.portfolio__item');

let currentImageIndex = 0;
const portfolioImages = Array.from(portfolioItems).map(
  item => item.querySelector('img').src
);

/* =============================================
   HEADER SCROLL EFFECT
   ============================================= */
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY > 50);
  lastScroll = scrollY;
}, { passive: true });

/* =============================================
   MOBILE MENU
   ============================================= */
burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* =============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================= */
const sections = document.querySelectorAll('.section');

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  },
  { rootMargin: '-40% 0px -60% 0px' }
);

sections.forEach(section => navObserver.observe(section));

/* =============================================
   FADE-IN ANIMATION ON SCROLL
   ============================================= */
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
  { threshold: 0.15 }
);

fadeElements.forEach(el => fadeObserver.observe(el));

/* =============================================
   LIGHTBOX GALLERY
   ============================================= */
function openLightbox(index) {
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
  currentImageIndex =
    (currentImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
  lightboxImg.src = portfolioImages[currentImageIndex];
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % portfolioImages.length;
  lightboxImg.src = portfolioImages[currentImageIndex];
}

portfolioItems.forEach(item => {
  item.addEventListener('click', () => {
    const index = parseInt(item.dataset.index, 10);
    openLightbox(index);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrevImage();
  if (e.key === 'ArrowRight') showNextImage();
});

/* =============================================
   FORM VALIDATION & SUBMISSION
   ============================================= */
const validators = {
  name: value => {
    if (!value.trim()) return 'Введите ваше имя';
    if (value.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
    return '';
  },
  phone: value => {
    if (!value.trim()) return 'Введите номер телефона';
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d{10,15}$/.test(cleaned))
      return 'Введите корректный номер телефона';
    return '';
  },
  email: value => {
    if (!value.trim()) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return 'Введите корректный email';
    return '';
  },
  service: value => {
    if (!value) return 'Выберите услугу';
    return '';
  },
};

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
  for (const [field, validate] of Object.entries(validators)) {
    const input = document.getElementById(field);
    const error = validate(input.value);
    showError(field, error);
    if (error) isValid = false;
  }
  return isValid;
}

['name', 'phone', 'email', 'service'].forEach(fieldId => {
  const input = document.getElementById(fieldId);
  input.addEventListener('input', () => {
    if (validators[fieldId]) {
      showError(fieldId, validators[fieldId](input.value));
    }
  });
});

const SERVICE_LABELS = {
  tattoo: 'Татуировка',
  coverup: 'Перекрытие',
  correction: 'Коррекция',
  sketch: 'Разработка эскиза',
};

async function sendToTelegram(data) {
  const text = [
    '📋 *Новая заявка на запись*',
    '',
    `👤 *Имя:* ${data.name}`,
    `📞 *Телефон:* ${data.phone}`,
    data.email ? `📧 *Email:* ${data.email}` : '',
    `🔧 *Услуга:* ${SERVICE_LABELS[data.service] || data.service}`,
    data.date ? `📅 *Дата:* ${data.date}` : '',
    data.message ? `💬 *Комментарий:* ${data.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    throw new Error('Telegram API error');
  }

  return response.json();
}

bookingForm.addEventListener('submit', async e => {
  e.preventDefault();

  if (!validateForm()) return;

  const formData = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    service: document.getElementById('service').value,
    date: document.getElementById('date').value,
    message: document.getElementById('message').value.trim(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправка...';

  try {
    await sendToTelegram(formData);
    bookingForm.style.display = 'none';
    bookingSuccess.classList.add('show');
  } catch {
    alert(
      'Не удалось отправить заявку. Пожалуйста, свяжитесь с нами по телефону.'
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку';
  }
});

/* =============================================
   PHONE INPUT MASK (simple)
   ============================================= */
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', () => {
  let val = phoneInput.value.replace(/\D/g, '');

  if (val.startsWith('8')) {
    val = '7' + val.slice(1);
  }

  if (val.length === 0) {
    phoneInput.value = '';
    return;
  }

  let formatted = '+';
  if (val.length > 0) formatted += val.slice(0, 1);
  if (val.length > 1) formatted += ' (' + val.slice(1, 4);
  if (val.length > 4) formatted += ') ' + val.slice(4, 7);
  if (val.length > 7) formatted += '-' + val.slice(7, 9);
  if (val.length > 9) formatted += '-' + val.slice(9, 11);

  phoneInput.value = formatted;
});

/* =============================================
   SET MIN DATE ON DATE INPUT
   ============================================= */
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);
