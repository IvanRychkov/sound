// =============================================
//  ДАННЫЕ — редактировать здесь
// =============================================

const STATS = [
  { num: '1000+', label: 'Live shows' },
  { num: '2016',  label: 'Since' },
  { num: 'МГИК',  label: 'Education' },
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
  { name: 'Голос Омерики',               sub: 'Белград' },
  { name: 'Coffee Shop Kollektive',      sub: 'Белград' },
  { name: 'Zventa Sventana',             sub: 'гастроли' },
  { name: 'Ольга Синяева',               sub: 'гастроли' },
  { name: 'Алексей Козлов и "Арсенал"',  sub: 'клуб' },
  { name: 'Андрей Макаревич',            sub: 'клуб' },
];

// Недавние концерты — добавляй сюда новые записи.
// Секция не показывается, если массив пустой.
const CONCERTS = [
  // {
  //   date: '2025-04-15',       // YYYY-MM-DD, отображается как «15 апр»
  //   artist: 'Голос Омерики',
  //   city: 'Белград',
  //   venue: 'Ben Akiba',
  //   link: null,               // опционально: ссылка на Instagram-пост или фото
  // },
];

// Контакты — можно добавить несколько
const CONTACTS = [
  { service: 'Telegram', handle: '@ivan_rychkov', href: 'https://t.me/ivan_rychkov' },
];


// =============================================
//  РЕНДЕРИНГ — не трогать
// =============================================

function renderStats() {
  const el = document.getElementById('stats');
  STATS.forEach(s => {
    const div = document.createElement('div');
    div.innerHTML = `<div class="stat-num">${s.num}</div><div class="stat-lbl">${s.label}</div>`;
    el.appendChild(div);
  });
}

function renderVenues() {
  const el = document.getElementById('venues');
  VENUES.forEach(v => {
    const div = document.createElement('div');
    div.className = 'tag';
    div.textContent = v;
    el.appendChild(div);
  });
}

function renderArtists() {
  const el = document.getElementById('artists');
  ARTISTS.forEach(a => {
    const div = document.createElement('div');
    div.className = 'acard';
    div.innerHTML = `${a.name}<span>${a.sub}</span>`;
    el.appendChild(div);
  });
}

function renderConcerts() {
  if (!CONCERTS.length) return;

  const section = document.getElementById('concerts-section');
  section.hidden = false;

  const list = document.getElementById('concerts');
  const fmt = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });

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

function renderContacts() {
  const el = document.getElementById('contact');
  CONTACTS.forEach(c => {
    const row = document.createElement('div');
    row.className = 'contact-row';
    row.innerHTML = `<span class="c-lbl">${c.service}</span><a class="c-val" href="${c.href}">${c.handle}</a>`;
    el.appendChild(row);
  });
}

renderStats();
renderVenues();
renderArtists();
renderConcerts();
renderContacts();
