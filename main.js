// =============================================
//  ДАННЫЕ (только то, что не переводится)
// =============================================

const FRIENDS = [
    // {name: 'Коллега 1', info: 'Звукорежиссер', link: '#'},
];


// =============================================
//  ИНТЕРНАЦИОНАЛИЗАЦИЯ
// =============================================

const _i18nCache = {};
let _currentLang = 'en';

/** Возвращает значение по точечному пути, например 'ui.eyebrow' → t.ui.eyebrow */
function _resolvePath(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
}

/**
 * Загружает локаль (если ещё не в кэше) и применяет её к странице.
 * Сохраняет выбор в localStorage.
 * @param {string} lang - Код языка, например 'ru' или 'en'
 */
async function loadAndApply(lang, {save = true} = {}) {
    if (!_i18nCache[lang]) {
        const res = await fetch(`locales/${lang}.json`);
        _i18nCache[lang] = await res.json();
    }
    _currentLang = lang;
    if (save) {
        localStorage.setItem('lang', lang);
        localStorage.setItem('langManual', 'true');
    }
    applyLocale(_i18nCache[lang]);
}

/**
 * Обновляет весь DOM под переданные переводы:
 * - текстовые узлы через [data-i18n]
 * - aria-label через [data-i18n-aria]
 * - alt картинок через [data-i18n-alt]
 * - биографию и динамические секции через innerHTML / renderXxx()
 * @param {Object} t - Объект переводов из локального JSON
 */
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

    ['stats', 'specialization', 'venues', 'artists', 'skills', 'contact', 'friends'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    renderStats(t.stats);
    renderSpecialization(t.specialization);
    renderVenues(t.venues);
    renderArtists(t.artists);
    renderSkills(t.skills);
    renderContacts(t.contacts);
    renderFriends();
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

function renderSpecialization(data) {
    const section = document.getElementById('specialization-section');
    const container = document.getElementById('specialization');

    if (!section || !container || !data?.items?.length) {
        if (section) section.hidden = true;
        return;
    }

    section.hidden = false;
    container.innerHTML = '';

    const width = 640;
    const height = 520;
    const centerX = 320;
    const centerY = 260;
    const radius = 170;
    const labels = [
        {x: 50, y: 7},
        {x: 82, y: 35},
        {x: 70, y: 88},
        {x: 30, y: 88},
        {x: 18, y: 35}
    ];
    const namespace = 'http://www.w3.org/2000/svg';

    const chart = document.createElement('div');
    chart.className = 'radar-chart';
    chart.setAttribute('aria-label', data.ariaLabel);

    const svg = document.createElementNS(namespace, 'svg');
    svg.classList.add('radar-svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('aria-hidden', 'true');

    const point = (index, factor = 1) => {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / data.items.length;
        return [
            centerX + Math.cos(angle) * radius * factor,
            centerY + Math.sin(angle) * radius * factor
        ];
    };

    const points = factors => factors
        .map((factor, index) => point(index, factor).join(','))
        .join(' ');

    for (let level = 1; level <= 5; level++) {
        const ring = document.createElementNS(namespace, 'polygon');
        ring.classList.add('radar-grid');
        ring.setAttribute('points', points(data.items.map(() => level / 5)));
        svg.appendChild(ring);
    }

    data.items.forEach((item, index) => {
        const [x, y] = point(index);
        const axis = document.createElementNS(namespace, 'line');
        axis.classList.add('radar-axis');
        axis.setAttribute('x1', centerX);
        axis.setAttribute('y1', centerY);
        axis.setAttribute('x2', x);
        axis.setAttribute('y2', y);
        svg.appendChild(axis);
    });

    const area = document.createElementNS(namespace, 'polygon');
    area.classList.add('radar-area');
    area.setAttribute('points', points(data.items.map(item => item.value / 5)));
    svg.appendChild(area);

    data.items.forEach((item, index) => {
        const [x, y] = point(index, item.value / 5);
        const marker = document.createElementNS(namespace, 'circle');
        marker.classList.add('radar-point');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', 4);
        svg.appendChild(marker);

        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'radar-label tooltip-wrap';
        label.style.left = `${labels[index].x}%`;
        label.style.top = `${labels[index].y}%`;
        label.setAttribute('aria-label', `${item.name}: ${item.value}/5. ${item.description}`);

        const name = document.createElement('span');
        name.textContent = item.name;
        const score = document.createElement('span');
        score.className = 'radar-label-score';
        score.textContent = ` · ${item.value}/5`;
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.textContent = item.description;

        label.append(name, score, tooltip);
        chart.appendChild(label);
    });

    chart.prepend(svg);
    container.appendChild(chart);
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

    const saved = localStorage.getItem('langManual') === 'true'
        ? localStorage.getItem('lang')
        : null;
    const browserLanguages = Array.from(navigator.languages ?? [navigator.language])
        .filter(Boolean);
    const hasRussianLocale = browserLanguages.some(l => /^ru(?:-|$)/i.test(l));
    const browser = hasRussianLocale && available.includes('ru') ? 'ru' : 'en';
    const initial = (saved && available.includes(saved)) ? saved
                  : available.includes(browser) ? browser
                  : available[0];

    await loadAndApply(initial, {save: false});
    initGallery();

    document.getElementById('lang-btn')?.addEventListener('click', () => {
        const idx = available.indexOf(_currentLang);
        loadAndApply(available[(idx + 1) % available.length]);
    });
})();
