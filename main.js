// =============================================
//  ДАННЫЕ — редактировать здесь
// =============================================

const STATS = [
    {num: '1000+', label: 'Live shows'},
    {num: '2016', label: 'Since'},
    {num: 'МГИК', label: 'Education', tooltip: 'Московский государственный институт культуры, "Звукорежиссура культурно-массовых мероприятий и концертных программ"'},
];

const VENUES = [
    {name: 'Клуб Алексея Козлова', sub: 'Москва'},
    {name: 'Jam Club Андрея Макаревича', sub: 'Москва'},
    {name: 'Hard Rock Cafe', sub: 'Москва'},
    {name: '16 Тонн Арбат', sub: 'Москва'},
    {name: 'Зарядье', sub: 'Москва'},
    {name: 'Парк "Лужники"', sub: 'Москва'},
    {name: 'Юсуповский сад', sub: 'Санкт-Петербург'},
    {name: 'Гастроли', sub: 'Краснодар, Сочи, Владивосток, Хабаровск, Воронеж, Суздаль, Бали (а он тут как оказался?)'},
];

const ARTISTS = [
    {name: 'Голос Омерики', sub: 'Белград'},
    {name: 'Coffee Shop Kollektiv', sub: 'Белград'},
    {name: 'Zventa Sventana', sub: 'гастроли'},
    {name: 'Ольга Синяева & AllSee Band', sub: 'гастроли'},
    {name: 'Алексей Козлов и "Арсенал"', sub: 'клуб'},
];

// Недавние концерты — добавляй сюда новые записи.
// Секция не показывается, если массив пустой.
const CONCERTS = [
    // {
    //   date: '2025-04-15',       // YYYY-MM-DD, отображается как «15 апр»
    //   artist: 'Голос Омерики',
    //   city: 'Белград',
    //   venue: '',
    //   link: null,               // опционально: ссылка на Instagram-пост или фото
    // },
];

// Контакты — можно добавить несколько
const CONTACTS = [
    {service: 'Telegram', handle: '@ivan_rychkov', href: 'https://t.me/ivan_rychkov'},
    {service: 'Instagram', handle: '@ivanrychkov', href: 'https://www.instagram.com/ivanrychkov/'},
];

const SKILLS = [
    {name: 'Live Sound', sub: 'FOH / MON'},
    {name: 'Yamaha', sub: "CL, QL"},
    {name: 'Allen&Heath', sub: "dLive, GLD, Q, SQ"},
    {name: 'Behringer', sub: "X32, Wing"},
    {name: 'Поканальная запись концертов'},
    // {name: 'Музыкальные жанры', sub: 'джаз, блюз, рок, фанк'},
];

const FRIENDS = [
    // {name: 'Коллега 1', info: 'Звукорежиссер', link: '#'},
];


// =============================================
//  СЛУЖЕБНЫЕ ФУНКЦИИ — не трогать
// =============================================

/**
 * Обобщенная функция для рендеринга списков
 * @param {Array} data - Массив с данными
 * @param {string} containerId - ID контейнера для элементов
 * @param {string} sectionId - ID всей секции (чтобы скрыть, если пусто)
 * @param {Function} renderFn - Функция, которая возвращает HTML или Element для одного пункта
 */
function renderCollection(data, containerId, sectionId, renderFn) {
    const section = document.getElementById(sectionId);
    if (!data || !data.length) {
        if (section) section.hidden = true;
        return;
    }
    if (section) section.hidden = false;

    const container = document.getElementById(containerId);
    if (!container) return;

    data.forEach(item => {
        const result = renderFn(item);
        if (result instanceof HTMLElement) {
            container.appendChild(result);
        } else {
            const div = document.createElement('div');
            div.innerHTML = result;
            // Если в результате только один корневой элемент, можно было бы извлечь его,
            // но для простоты добавим как есть или через innerHTML.
            // В нашем случае функции будут возвращать строку для innerHTML.
            container.appendChild(div.firstElementChild || div);
        }
    });
}

function renderStats() {
    renderCollection(STATS, 'stats', 'stats-section', s => {
        const numContent = s.tooltip 
            ? `<div class="tooltip-wrap">${s.num}<span class="tooltip-text">${s.tooltip}</span></div>` 
            : s.num;
        return `<div><div class="stat-num">${numContent}</div><div class="stat-lbl">${s.label}</div></div>`;
    });
    updateAge();
    initTooltips(); // Переинициализируем для новых элементов
}

function updateAge() {
    const ageEl = document.getElementById('age-badge');
    if (!ageEl) return;
    
    // Дата рождения: 3 сентября 1993
    const birthYear = 1993;
    const birthMonth = 8; // Сентябрь (0-11)
    const birthDay = 3;

    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const nowDay = now.getDate();

    let age = nowYear - birthYear;
    if (nowMonth < birthMonth || (nowMonth === birthMonth && nowDay < birthDay)) {
        age--;
    }

    const isBirthday = nowMonth === birthMonth && nowDay === birthDay;
    const suffix = isBirthday ? ' y.o. 🎉' : ' y.o.';

    ageEl.textContent = `${age}${suffix}`;
}

function renderVenues() {
    renderCollection(VENUES, 'venues', 'venues-section', v => {
        const subHtml = v.sub ? `<span>${v.sub}</span>` : '';
        return `<div class="acard">${v.name}${subHtml}</div>`;
    });
}

function renderArtists() {
    renderCollection(ARTISTS, 'artists', 'artists-section', a => {
        const subHtml = a.sub ? `<span>${a.sub}</span>` : '';
        return `<div class="acard">${a.name}${subHtml}</div>`;
    });
}

function renderSkills() {
    renderCollection(SKILLS, 'skills', 'skills-section', s => {
        const subHtml = s.sub ? `<span>${s.sub}</span>` : '';
        return `<div class="acard">${s.name}${subHtml}</div>`;
    });
}

function renderContacts() {
    renderCollection(CONTACTS, 'contact', 'contact-section', c => {
        return `<div class="contact-row"><span class="c-lbl">${c.service}</span><a class="c-val" href="${c.href}">${c.handle}</a></div>`;
    });
}

function renderFriends() {
    renderCollection(FRIENDS, 'friends', 'friends-section', f => {
        return `<div class="contact-row"><span class="c-lbl">${f.info}</span><a class="c-val" href="${f.link}">${f.name}</a></div>`;
    });
}

function renderConcerts() {
    if (!CONCERTS.length) return;

    const section = document.getElementById('concerts-section');
    section.hidden = false;

    const list = document.getElementById('concerts');
    const fmt = new Intl.DateTimeFormat('ru', {day: 'numeric', month: 'short'});

    CONCERTS.forEach(c => {
        const dateStr = fmt.format(new Date(c.date));
        const tag = c.link ? 'a' : 'div';
        const el = document.createElement(tag);
        el.className = 'ccard';
        if (c.link) {
            el.href = c.link;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
        }
        el.innerHTML = `
      <div class="ccard-meta">${dateStr} · ${c.city}</div>
      <div class="ccard-body">
        <div class="ccard-artist">${c.artist}</div>
        <div class="ccard-venue">${c.venue}</div>
      </div>
      ${c.link ? '<div class="ccard-link">↗</div>' : ''}
    `;
        list.appendChild(el);
    });
}

renderStats();
renderVenues();
renderArtists();
renderSkills();
renderConcerts();
renderContacts();
renderFriends();
initGallery();
initTooltips();

// =============================================
//  ЛОГИКА ТУЛТИПОВ (корректировка позиции)
// =============================================

function initTooltips() {
    const wraps = document.querySelectorAll('.tooltip-wrap');
    
    wraps.forEach(wrap => {
        if (wrap.dataset.tooltipInitialized) return;
        wrap.dataset.tooltipInitialized = "true";

        const text = wrap.querySelector('.tooltip-text');
        if (!text) return;

        function adjustPosition() {
            text.style.left = '50%';
            text.style.transform = 'translateX(-50%)';

            const rect = text.getBoundingClientRect();
            const padding = 20;

            let offset = 0;
            if (rect.left < padding) {
                offset = padding - rect.left;
            } else if (rect.right > window.innerWidth - padding) {
                offset = window.innerWidth - padding - rect.right;
            }

            if (offset !== 0) {
                text.style.left = `calc(50% + ${offset}px)`;
            }
        }

        wrap.addEventListener('mouseenter', adjustPosition);

        let touchStartY = 0;
        let touchStartX = 0;

        wrap.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, {passive: true});

        // Поддержка клика для мобильных устройств
        wrap.addEventListener('touchend', (e) => {
            const isTouch = window.matchMedia('(pointer: coarse)').matches;
            if (!isTouch) return;

            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;

            // Если палец сместился более чем на 10px — это скролл, а не тап
            if (Math.abs(touchEndY - touchStartY) > 10 || Math.abs(touchEndX - touchStartX) > 10) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            
            const isActive = wrap.classList.contains('active');
            
            // Закрываем все остальные активные тултипы
            document.querySelectorAll('.tooltip-wrap.active').forEach(el => {
                if (el !== wrap) el.classList.remove('active');
            });

            wrap.classList.toggle('active');
            if (wrap.classList.contains('active')) {
                adjustPosition();
            }
        });

        wrap.addEventListener('click', (e) => {
            // На десктопе работает hover, но клик тоже может быть
            const isTouch = window.matchMedia('(pointer: coarse)').matches;
            if (!isTouch) {
                // Обычный клик на десктопе (если нужно)
                // Для десктопа оставляем поведение hover из CSS
            }
        });
    });
}

// Закрытие тултипов при клике мимо
document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-wrap.active').forEach(el => {
        el.classList.remove('active');
    });
});

// =============================================
//  ЛОГИКА ГАЛЕРЕИ
// =============================================

function initGallery() {
    const gallery = document.getElementById('photo-gallery');
    if (!gallery) return;

    const wraps = gallery.querySelectorAll('.photo-wrap');
    const btnPrev = document.getElementById('gallery-prev');
    const btnNext = document.getElementById('gallery-next');

    if (wraps.length <= 1) {
        if (wraps.length === 1) wraps[0].classList.add('active');
        return;
    }

    // Показываем кнопки, если больше одного фото
    if (btnPrev) btnPrev.style.display = 'block';
    if (btnNext) btnNext.style.display = 'block';

    let currentIndex = 0;
    wraps[currentIndex].classList.add('active');

    function showPhoto(index) {
        wraps[currentIndex].classList.remove('active');
        currentIndex = (index + wraps.length) % wraps.length;
        wraps[currentIndex].classList.add('active');
    }

    btnPrev?.addEventListener('click', () => showPhoto(currentIndex - 1));
    btnNext?.addEventListener('click', () => showPhoto(currentIndex + 1));
}

// =============================================
//  ЛОГИКА ТЁМНОЙ ТЕМЫ
// =============================================

const btnLight = document.getElementById('theme-light');
const btnDark = document.getElementById('theme-dark');
const currentTheme = localStorage.getItem('theme');

function setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
        localStorage.setItem('theme', theme);
    }

    if (theme === 'dark') {
        btnDark?.classList.add('active');
        btnLight?.classList.remove('active');
    } else {
        btnLight?.classList.add('active');
        btnDark?.classList.remove('active');
    }
}

// Инициализация при загрузке
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

if (currentTheme) {
    setTheme(currentTheme);
} else {
    // Если в localStorage пусто, просто применяем системную тему БЕЗ сохранения
    setTheme(mediaQuery.matches ? 'dark' : 'light', false);
}

// Слушатель изменения системной темы
mediaQuery.addEventListener('change', (e) => {
    // Если пользователь вручную не выбирал тему (нет записи в localStorage),
    // тогда меняем её вслед за системой
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light', false);
    }
});

btnLight?.addEventListener('click', () => setTheme('light'));
btnDark?.addEventListener('click', () => setTheme('dark'));

// Сброс прокрутки при загрузке страницы с хешем
window.addEventListener('load', () => {
    if (window.location.hash) {
        // Прокручиваем в начало
        window.scrollTo(0, 0);
        // Очищаем хеш из URL без перезагрузки страницы
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }
});
