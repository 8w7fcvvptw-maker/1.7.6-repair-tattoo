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
    const cleaned = value.replace(/[\s\-\(\)]/g, ''); // убираем пробелы и скобки
    if (!PHONE_REGEX.test(cleaned)) return 'Введите корректный номер телефона';
    return '';
  },
  service: value => {
    if (!value) return 'Выберите услугу';
    return '';
  },
};

const FORM_FIELDS = Object.keys(validators);

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
FORM_FIELDS.forEach(fieldId => {
  document.getElementById(fieldId).addEventListener('input', e => {
    showError(fieldId, validators[fieldId](e.target.value));
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
    service: document.getElementById('service').value,
    date:    dateDisplay.value, // формат дд.мм.гггг из видимого поля
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
   КАСТОМНЫЙ КАЛЕНДАРЬ ДЛЯ ПОЛЯ «ЖЕЛАЕМАЯ ДАТА»
   Открывается по клику на поле, закрывается по
   клику вне или после выбора даты.
   Прошедшие даты недоступны.
   ============================================= */
const dateDisplay = document.getElementById('date-display'); // видимое поле
const dateHidden  = document.getElementById('date');         // скрытое поле для отправки
const calPopup    = document.getElementById('cal-popup');    // контейнер попапа

// Текущий месяц/год в попапе (стартуем с сегодняшнего)
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0–11

// Названия месяцев и дней недели
const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                     'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WEEK_DAYS   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// Рендерим HTML-содержимое попапа для calYear / calMonth
function renderCalendar() {
  const today    = new Date(); today.setHours(0,0,0,0);
  const selected = dateHidden.value; // 'YYYY-MM-DD' или ''

  // Первый день месяца; getDay() → 0=вс..6=сб, переводим в пн=0..вс=6
  const firstDay = new Date(calYear, calMonth, 1);
  let   startDow = firstDay.getDay(); // 0=вс
  startDow = (startDow === 0) ? 6 : startDow - 1; // пн=0 … вс=6

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // Шапка: кнопки навигации + месяц/год
  let html = `
    <div class="cal-header">
      <button class="cal-nav" id="cal-prev" aria-label="Предыдущий месяц">&#8249;</button>
      <span class="cal-header__title">${MONTH_NAMES[calMonth]} ${calYear}</span>
      <button class="cal-nav" id="cal-next" aria-label="Следующий месяц">&#8250;</button>
    </div>
    <div class="cal-weekdays">
      ${WEEK_DAYS.map(d => `<span class="cal-weekday">${d}</span>`).join('')}
    </div>
    <div class="cal-days">
  `;

  // Пустые ячейки до первого числа
  for (let i = 0; i < startDow; i++) {
    html += `<button class="cal-day" disabled></button>`;
  }

  // Ячейки с днями
  for (let d = 1; d <= daysInMonth; d++) {
    const date    = new Date(calYear, calMonth, d);
    const iso     = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isPast = date < today;
    const isTod  = date.getTime() === today.getTime();
    const isSel  = iso === selected;

    html += `<button class="cal-day ${isTod ? 'is-today' : ''} ${isSel ? 'is-selected' : ''}"
               data-date="${iso}" ${isPast ? 'disabled' : ''}>${d}</button>`;
  }

  html += `</div>`;
  calPopup.innerHTML = html;

  // Навигация по месяцам — e.stopPropagation() чтобы не закрыть попап
  document.getElementById('cal-prev').addEventListener('click', e => {
    e.stopPropagation();
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', e => {
    e.stopPropagation();
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // Клик на день — выбираем дату
  calPopup.querySelectorAll('.cal-day[data-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      const iso = btn.dataset.date;                          // YYYY-MM-DD
      const [y, m, day] = iso.split('-');
      dateHidden.value  = iso;                               // скрытое поле
      dateDisplay.value = `${day}.${m}.${y}`;               // формат дд.мм.гггг
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

// Открываем по клику на поле
dateDisplay.addEventListener('click', () => {
  calPopup.classList.contains('is-open') ? closeCalendar() : openCalendar();
});

// Закрываем по клику вне обёртки
document.addEventListener('click', e => {
  if (!document.getElementById('date-wrapper').contains(e.target)) closeCalendar();
});

// Закрываем по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCalendar();
});

/* =============================================
   ВИДЖЕТ ОНЛАЙН-КОНСУЛЬТАНТА
   ============================================= */
const chatWidget = document.getElementById('chat-widget');
const chatBtn    = document.getElementById('chat-btn');
const chatClose  = document.getElementById('chat-close');
const faqItems   = document.querySelectorAll('.chat-faq__item');

// Открыть / закрыть поповер
function toggleChat(forceOpen) {
  const isOpen = chatWidget.classList.contains('is-open');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;
  chatWidget.classList.toggle('is-open', shouldOpen);
  chatBtn.setAttribute('aria-expanded', String(shouldOpen));
}

chatBtn.addEventListener('click', () => toggleChat());
chatClose.addEventListener('click', () => toggleChat(false));

// Закрыть по клику вне виджета
document.addEventListener('click', (e) => {
  if (!chatWidget.contains(e.target)) {
    toggleChat(false);
  }
});

// Закрыть по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleChat(false);
});

// Аккордеон вопросов — открыть/закрыть ответ
faqItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('is-active');
    // Закрываем все остальные
    faqItems.forEach((i) => i.classList.remove('is-active'));
    // Если не было активным — открываем
    if (!isActive) item.classList.add('is-active');
  });

  // Поддержка клавиатуры (Enter / Space)
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

/* =============================================
   ВИДЖЕТ ИНТЕРЕСНЫХ ФАКТОВ
   Управление открытием/закрытием попапа и аккордеоном
   ============================================= */
const factsWidget = document.getElementById('facts-widget');
const factsBtn    = document.getElementById('facts-btn');
const factsClose  = document.getElementById('facts-close');
const factsItems  = document.querySelectorAll('.facts-list__item');

// Открыть / закрыть попап
function toggleFacts(forceOpen) {
  const isOpen = factsWidget.classList.contains('is-open');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;
  factsWidget.classList.toggle('is-open', shouldOpen);
  factsBtn.setAttribute('aria-expanded', String(shouldOpen));
}

factsBtn.addEventListener('click', () => toggleFacts());
factsClose.addEventListener('click', () => toggleFacts(false));

// Закрыть по клику вне виджета
document.addEventListener('click', (e) => {
  if (!factsWidget.contains(e.target)) {
    toggleFacts(false);
  }
});

// Закрыть по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleFacts(false);
});

// Аккордеон фактов — открыть/закрыть описание
factsItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('is-active');
    // Закрываем все остальные
    factsItems.forEach((i) => i.classList.remove('is-active'));
    // Если не было активным — открываем
    if (!isActive) item.classList.add('is-active');
  });

  // Поддержка клавиатуры (Enter / Space)
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});
