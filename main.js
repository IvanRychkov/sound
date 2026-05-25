// =============================================
//  ДАННЫЕ (только то, что не переводится)
// =============================================

// Недавние концерты — добавляй сюда новые записи.
// Секция не показывается, если массив пустой.
const CONCERTS = [
    // {
    //   date: '2025-04-15',       // YYYY-MM-DD, отображается как «15 апр» / "Apr 15"
    //   artist: 'Голос Омерики',
    //   city: 'Белград',
    //   venue: '',
    //   link: null,               // опционально: ссылка на Instagram-пост или фото
    // },
];

const FRIENDS = [
    // {name: 'Коллега 1', info: 'Звукорежиссер', link: '#'},
];


// =============================================
//  ИНТЕРНАЦИОНАЛИЗАЦИЯ
// =============================================

const _i18nCache = {};
let _currentLang = 'ru';

function _resolvePath(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
}

async function loadAndApply(lang) {
    if (!_i18nCache[lang]) {
        const res = await fetch(`locales/${lang}.json`);
        _i18nCache[lang] = await res.json();
    }
    _currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLocale(_i18nCache[lang]);
}

function applyLocale(t) {
    document.documentElement.lang = _currentLang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const val = _resolvePath(t, el.dataset.i18n);
        if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const val = _resolvePath(t, el.dataset.i18nAria);
        if (val !== undefined) el.setAttribute('aria-label', val);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const val = _resolvePath(t, el.dataset.i18nAlt);
        if (val !== undefined) el.alt = val;
    });

    const bioContainer = document.getElementById('bio-container');
    if (bioContainer) {
        bioContainer.innerHTML = t.bio.map(p => `<p class="bio">${p}</p>`).join('');
    }

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) langBtn.textContent = t.ui.lang_switch;

    ['stats', 'venues', 'artists', 'skills', 'contact', 'friends', 'concerts'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    renderStats(t.stats);
    renderVenues(t.venues);
    renderArtists(t.artists);
    renderSkills(t.skills);
    renderContacts(t.contacts);
    renderFriends();
    renderConcerts();
    initTooltips();
}


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
            container.appendChild(div.firstElementChild || div);
        }
    });
}

function renderStats(stats) {
    renderCollection(stats, 'stats', 'stats-section', s => {
        const numContent = s.tooltip
            ? `<div class="tooltip-wrap">${s.num}<span class="tooltip-text">${s.tooltip}</span></div>`
            : s.num;
        return `<div><div class="stat-num">${numContent}</div><div class="stat-lbl">${s.label}</div></div>`;
    });
    updateAge();
}

function updateAge() {
    const ageEl = document.getElementById('age-badge');
    if (!ageEl) return;

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

function renderVenues(venues) {
    renderCollection(venues, 'venues', 'venues-section', v => {
        const subHtml = v.sub ? `<span>${v.sub}</span>` : '';
        return `<div class="acard">${v.name}${subHtml}</div>`;
    });
}

function renderArtists(artists) {
    renderCollection(artists, 'artists', 'artists-section', a => {
        const subHtml = a.sub ? `<span>${a.sub}</span>` : '';
        return `<div class="acard">${a.name}${subHtml}</div>`;
    });
}

function renderSkills(skills) {
    renderCollection(skills, 'skills', 'skills-section', s => {
        const subHtml = s.sub ? `<span>${s.sub}</span>` : '';
        return `<div class="acard">${s.name}${subHtml}</div>`;
    });
}

function renderContacts(contacts) {
    renderCollection(contacts, 'contact', 'contact-section', c => {
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
    const fmt = new Intl.DateTimeFormat(_currentLang, {day: 'numeric', month: 'short'});

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

            document.querySelectorAll('.tooltip-wrap.active').forEach(el => {
                if (el !== wrap) el.classList.remove('active');
            });

            wrap.classList.toggle('active');
            if (wrap.classList.contains('active')) {
                adjustPosition();
            }
        });

        wrap.addEventListener('click', () => {
            // На десктопе работает hover из CSS
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
        window.scrollTo(0, 0);
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }
});


// =============================================
//  ИНИЦИАЛИЗАЦИЯ
// =============================================

(async () => {
    const available = await fetch('locales/index.json').then(r => r.json());

    const saved = localStorage.getItem('lang');
    const browser = navigator.language.split('-')[0];
    const initial = (saved && available.includes(saved)) ? saved
                  : available.includes(browser) ? browser
                  : available[0];

    await loadAndApply(initial);
    initGallery();

    document.getElementById('lang-btn')?.addEventListener('click', () => {
        const idx = available.indexOf(_currentLang);
        loadAndApply(available[(idx + 1) % available.length]);
    });
})();
