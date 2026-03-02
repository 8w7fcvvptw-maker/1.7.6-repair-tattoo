/* =============================================
   НАСТРОЙКА — замените на свои значения
   Как получить токен и chat_id — читай README.md
   ============================================= */
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN'; // токен от @BotFather
const TELEGRAM_CHAT_ID   = 'YOUR_CHAT_ID';   // ваш числовой id в Telegram

/* =============================================
   ПОЛУЧАЕМ ЭЛЕМЕНТЫ СО СТРАНИЦЫ
   Мы обращаемся к HTML-элементам по их id,
   чтобы потом управлять ими из JavaScript.
   ============================================= */
const header       = document.getElementById('header');
const burger       = document.getElementById('burger');        // кнопка-гамбургер (мобилка)
const nav          = document.getElementById('nav');           // мобильное меню
const navLinks     = document.querySelectorAll('.nav__link');  // все ссылки в меню
const bookingForm  = document.getElementById('booking-form'); // форма записи
const bookingSuccess = document.getElementById('booking-success'); // сообщение об успехе
const submitBtn    = document.getElementById('submit-btn');   // кнопка «Отправить»

// Элементы лайтбокса (увеличенный просмотр фото портфолио)
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');
const portfolioItems = document.querySelectorAll('.portfolio__item');

// Собираем пути к картинкам портфолио в массив для переключения в лайтбоксе
let currentImageIndex = 0;
const portfolioImages = Array.from(portfolioItems).map(
  item => item.querySelector('img').src
);

/* =============================================
   ШАПКА: подсветка при прокрутке
   Когда пользователь листает страницу вниз,
   добавляем класс .scrolled — шапка становится
   чуть темнее (см. стили .header.scrolled).
   ============================================= */
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true }); // passive: true — подсказка браузеру для плавности

/* =============================================
   МОБИЛЬНОЕ МЕНЮ (гамбургер)
   По клику на иконку — открываем/закрываем меню.
   Блокируем скролл страницы, пока меню открыто.
   ============================================= */
burger.addEventListener('click', () => {
  burger.classList.toggle('active'); // анимация X на кнопке
  nav.classList.toggle('open');      // выезжает меню справа
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

// По клику на любую ссылку в меню — закрываем его
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* =============================================
   АКТИВНАЯ ССЫЛКА В МЕНЮ
   IntersectionObserver следит, какая секция
   сейчас в центре экрана, и подсвечивает
   соответствующую ссылку в навигации.
   ============================================= */
const sections = document.querySelectorAll('.section');

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          // Добавляем .active той ссылке, чей href совпадает с id секции
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -60% 0px' } // секция считается «активной» в средней части экрана
);

sections.forEach(section => navObserver.observe(section));

/* =============================================
   АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ
   Все элементы с классом .fade-in изначально
   прозрачны (opacity: 0 в CSS). Когда они
   появляются в поле зрения — добавляем .visible
   и они плавно проявляются.
   ============================================= */
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target); // больше не следим — анимация одноразовая
      }
    });
  },
  { threshold: 0.15 } // элемент должен быть виден хотя бы на 15%
);

fadeElements.forEach(el => fadeObserver.observe(el));

/* =============================================
   ЛАЙТБОКС — увеличенный просмотр портфолио
   openLightbox(index) — открывает фото по номеру
   closeLightbox()     — закрывает
   showPrevImage()     — предыдущее фото
   showNextImage()     — следующее фото
   ============================================= */
function openLightbox(index) {
  currentImageIndex = index;
  lightboxImg.src = portfolioImages[index];
  lightboxImg.alt = portfolioItems[index].querySelector('img').alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // запрещаем скролл фона
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showPrevImage() {
  // % (остаток от деления) — чтобы зациклить: после первого — последнее
  currentImageIndex = (currentImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
  lightboxImg.src = portfolioImages[currentImageIndex];
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % portfolioImages.length;
  lightboxImg.src = portfolioImages[currentImageIndex];
}

// Клик на карточку портфолио
portfolioItems.forEach(item => {
  item.addEventListener('click', () => {
    openLightbox(parseInt(item.dataset.index, 10));
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

// Клик на затемнённый фон — закрываем
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Клавиатурное управление лайтбоксом
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrevImage();
  if (e.key === 'ArrowRight') showNextImage();
});

/* =============================================
   ВАЛИДАЦИЯ ФОРМЫ
   Функции проверки каждого поля.
   Возвращают строку с ошибкой или '' (пусто = ок).
   ============================================= */
const validators = {
  name: value => {
    if (!value.trim()) return 'Введите ваше имя';
    if (value.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
    return '';
  },
  phone: value => {
    if (!value.trim()) return 'Введите номер телефона';
    const cleaned = value.replace(/[\s\-\(\)]/g, ''); // убираем пробелы и скобки
    if (!/^\+?\d{10,15}$/.test(cleaned)) return 'Введите корректный номер телефона';
    return '';
  },
  email: value => {
    if (!value.trim()) return ''; // email необязателен
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Введите корректный email';
    return '';
  },
  service: value => {
    if (!value) return 'Выберите услугу';
    return '';
  },
};

// Показываем или убираем ошибку под полем
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

// Проверяем всю форму, возвращаем true если всё ок
function validateForm() {
  let isValid = true;
  for (const [field, validate] of Object.entries(validators)) {
    const error = validate(document.getElementById(field).value);
    showError(field, error);
    if (error) isValid = false;
  }
  return isValid;
}

// Проверка поля в реальном времени (при вводе)
['name', 'phone', 'email', 'service'].forEach(fieldId => {
  document.getElementById(fieldId).addEventListener('input', () => {
    const input = document.getElementById(fieldId);
    showError(fieldId, validators[fieldId](input.value));
  });
});

/* =============================================
   ОТПРАВКА ЗАЯВКИ В TELEGRAM
   Формируем текст сообщения и отправляем через
   Telegram Bot API. Токен и chat_id — вверху файла.
   ============================================= */
const SERVICE_LABELS = {
  tattoo:     'Татуировка',
  coverup:    'Перекрытие',
  correction: 'Коррекция',
  sketch:     'Разработка эскиза',
};

async function sendToTelegram(data) {
  // Собираем текст сообщения (пустые поля пропускаем через .filter(Boolean))
  const text = [
    '📋 *Новая заявка на запись*',
    '',
    `👤 *Имя:* ${data.name}`,
    `📞 *Телефон:* ${data.phone}`,
    data.email   ? `📧 *Email:* ${data.email}` : '',
    `🔧 *Услуга:* ${SERVICE_LABELS[data.service] || data.service}`,
    data.date    ? `📅 *Дата:* ${data.date}` : '',
    data.message ? `💬 *Комментарий:* ${data.message}` : '',
  ].filter(Boolean).join('\n');

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    }
  );

  if (!response.ok) throw new Error('Telegram API error');
  return response.json();
}

// Обработка отправки формы
bookingForm.addEventListener('submit', async e => {
  e.preventDefault(); // не перезагружаем страницу

  if (!validateForm()) return; // стоп, если есть ошибки

  const formData = {
    name:    document.getElementById('name').value.trim(),
    phone:   document.getElementById('phone').value.trim(),
    email:   document.getElementById('email').value.trim(),
    service: document.getElementById('service').value,
    date:    document.getElementById('date').value,
    message: document.getElementById('message').value.trim(),
  };

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Отправка...';

  try {
    await sendToTelegram(formData);
    bookingForm.style.display = 'none';
    bookingSuccess.classList.add('show'); // показываем сообщение «Заявка отправлена!»
  } catch {
    alert('Не удалось отправить заявку. Пожалуйста, свяжитесь с нами по телефону.');
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Отправить заявку';
  }
});

/* =============================================
   МАСКА НОМЕРА ТЕЛЕФОНА
   Автоматически форматирует ввод в вид:
   +7 (999) 123-45-67
   ============================================= */
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', () => {
  let val = phoneInput.value.replace(/\D/g, ''); // оставляем только цифры

  if (val.startsWith('8')) val = '7' + val.slice(1); // 8 → +7

  if (val.length === 0) { phoneInput.value = ''; return; }

  // Собираем форматированную строку по частям
  let formatted = '+';
  if (val.length > 0) formatted += val.slice(0, 1);
  if (val.length > 1) formatted += ' (' + val.slice(1, 4);
  if (val.length > 4) formatted += ') ' + val.slice(4, 7);
  if (val.length > 7) formatted += '-' + val.slice(7, 9);
  if (val.length > 9) formatted += '-' + val.slice(9, 11);

  phoneInput.value = formatted;
});

/* =============================================
   МИНИМАЛЬНАЯ ДАТА В ПОЛЕ «ЖЕЛАЕМАЯ ДАТА»
   Запрещаем выбирать прошедшие даты.
   ============================================= */
document.getElementById('date').setAttribute(
  'min',
  new Date().toISOString().split('T')[0] // формат YYYY-MM-DD
);
