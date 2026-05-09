// =============================================
//  ДАННЫЕ — редактировать здесь
// =============================================

const STATS = [
    {num: '1000+', label: 'Live shows'},
    {num: '2016', label: 'Since'},
    {num: 'МГИК', label: 'Education'},
];

const VENUES = [
    'Клуб Алексея Козлова',
    'Jam Club Андрея Макаревича',
    'Hard Rock Cafe, МСК',
    '16 Тонн Арбат, МСК',
    'Зарядье, МСК',
    'Лужники, МСК',
    'Юсуповский сад, СПб',
];

const ARTISTS = [
    {name: 'Голос Омерики', sub: 'Белград'},
    {name: 'Coffee Shop Kollektiv', sub: 'Белград'},
    {name: 'Zventa Sventana', sub: 'гастроли'},
    {name: 'Ольга Синяева', sub: 'гастроли'},
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
];

const SKILLS = [
    {name: 'Live Sound', sub: 'FOH / Monitor'},
    {name: 'Yamaha CL'},
    {name: 'Музыкальные жанры', sub: 'джаз, блюз, рок, фанк'},
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
        return `<div><div class="stat-num">${s.num}</div><div class="stat-lbl">${s.label}</div></div>`;
    });
}

function renderVenues() {
    renderCollection(VENUES, 'venues', 'venues-section', v => {
        return `<div class="tag">${v}</div>`;
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
