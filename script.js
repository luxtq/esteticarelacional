// ── AUDIO ENGINE ──────────────────────────────────────────────
    // El elemento <audio id="player"> vive fuera de las ventanas,
    // así que no se interrumpe al abrir/cerrar/mover ventanas.
    const player = document.getElementById('player');
    let tracks = [{ name: "Amigas - Claudio Montana", url: "audio/Amigas.mp3" },
    { name: "Para hacerlo con amor - Dodo", url: "audio/La ultima vez.mp3" },
    { name: "Cupido - Dodo", url: "audio/Cupido.mp3" },
    { name: "Fantasía - Dodo", url: "audio/Fantasia.mp3" },
    { name: "Knock Knock - Mac Miller", url: "audio/Mac Miller - Knock Knock - macmillervevo.mp3" },
    { name: "Nunca Estoy - C.Tangana", url: "audio/C. Tangana - Nunca Estoy (Letra) [K6mSW-lhEG0].mp3" },
    { name: "Vida nueva - Pablopablo", url: "audio/pablopablo - Vida Nueva (Lyric video) - pablopablo.mp3" },
    { name: "Boxeo - Jime", url: "audio/Boxeo - Jime.mp3" },
    { name: "Cuarto movimiento - Extremoduro", url: "audio/Extremoduro_ Cuarto Movimiento_ La Realidad (Audio Oficial) [WUIuGSARrzI].mp3" },
    { name: "Sailor song - Gigi Perez", url: "audio/Gigi Perez - Sailor Song (Official Music Video).mp3" },

    ];      // {name, url (blob URL)}
    let curTrack = 0;
    let ipodScreen = 'menu'; // 'menu' | 'now' | 'songs'
    let ipodMenuSel = 0;
    let progressTimer = null;

    player.addEventListener('ended', () => {
      curTrack = (curTrack + 1) % (tracks.length || 1);
      if (tracks.length) playTrack(curTrack);
    });

    function loadAudioFiles(input) {
      // Revoca URLs anteriores para liberar memoria
      tracks.forEach(t => URL.revokeObjectURL(t.url));
      tracks = [];
      Array.from(input.files).forEach(f => {
        tracks.push({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) });
      });
      curTrack = 0;
      if (tracks.length) {
        playTrack(0);
        ipodScreen = 'now';
      }
      ipodRender();
    }

    function setIpodMessage(msg) {
      const sc = document.getElementById('ipod-screen-content');
      if (!sc) return;
      sc.innerHTML = `<div class="ipod-menu-screen" style="padding:6px;font-size:.6rem;color:#0a2a0a">${msg}</div>`;
    }

    function playTrack(i) {
      if (!tracks.length) return;
      curTrack = i;

      // Si todavía no había ninguna canción cargada en el <audio>,
      // o si cambiamos de canción, cargamos la ruta antes de darle a play.
      if (!player.src || !player.src.endsWith(tracks[i].url.replace(/^\.\//, ''))) {
        player.src = tracks[i].url;
      }

      player.play().catch(() => {
        setIpodMessage('No se pudo reproducir. Revisa que el archivo exista en la carpeta audio/ y que el nombre coincida exactamente.');
      });
      ipodRender();
    }

    player.addEventListener('error', () => {
      setIpodMessage('No encuentro esta canción. Revisa mayúsculas, espacios y acentos en la carpeta audio/.');
    });

    function ipodAction(a) {
      if (a === 'menu') {
        ipodScreen = ipodScreen === 'now' ? 'menu' : 'now';
      } else if (a === 'play') {
        if (!tracks.length) { ipodScreen = 'now'; ipodRender(); return; }
        ipodScreen = 'now';

        // Si es la primera vez que pulsas play, player.src está vacío.
        // Cargamos la canción actual antes de intentar reproducirla.
        if (!player.src) {
          playTrack(curTrack);
          return;
        }

        if (player.paused) {
          player.play().catch(() => {
            setIpodMessage('No se pudo reproducir. Revisa que el archivo exista en la carpeta audio/.');
          });
        } else {
          player.pause();
        }
      } else if (a === 'next') {
        if (ipodScreen === 'menu') { ipodMenuSel = (ipodMenuSel + 1) % 3; }
        else { curTrack = (curTrack + 1) % Math.max(tracks.length, 1); if (tracks.length) playTrack(curTrack); }
      } else if (a === 'prev') {
        if (ipodScreen === 'menu') { ipodMenuSel = (ipodMenuSel - 1 + 3) % 3; }
        else { curTrack = (curTrack - 1 + Math.max(tracks.length, 1)) % Math.max(tracks.length, 1); if (tracks.length) playTrack(curTrack); }
      } else if (a === 'select') {
        if (ipodScreen === 'menu') {
          const map = ['now', 'songs', 'now'];
          ipodScreen = map[ipodMenuSel];
        }
      }
      ipodRender();
    }

    function ipodPickTrack(i) {
      curTrack = i; playTrack(i); ipodScreen = 'now'; ipodRender();
    }

    function fmtSec(s) {
      s = Math.floor(s || 0);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }

    function ipodRender() {
      const sc = document.getElementById('ipod-screen-content');
      if (!sc) return;
      if (ipodScreen === 'menu') {
        const items = ['Now Playing', 'Songs', 'Sobre el diario'];
        sc.innerHTML = `<div class="ipod-menu-screen">${items.map((x, i) =>
          `<div class="ipod-menu-item${i === ipodMenuSel ? ' sel' : ''}"><span>${x}</span><span>›</span></div>`
        ).join('')}</div>`;
      } else if (ipodScreen === 'songs') {
        if (!tracks.length) { sc.innerHTML = `<div class="ipod-menu-screen" style="padding:6px;font-size:.6rem;color:#0a2a0a">Sube canciones arriba ♪</div>`; return; }
        sc.innerHTML = `<div class="ipod-menu-screen">${tracks.map((t, i) =>
          `<div class="ipod-track ipod-menu-item${i === curTrack ? ' sel playing' : ''}" onclick="ipodPickTrack(${i})">${t.name}</div>`
        ).join('')}</div>`;
      } else {
        const isPlaying = !player.paused && tracks.length > 0;
        const dur = player.duration || 0;
        const cur = player.currentTime || 0;
        const pct = dur ? (cur / dur) * 100 : 0;
        const name = tracks.length ? tracks[curTrack].name : '— sin canción —';
        sc.innerHTML = `<div class="ipod-now">
      <div class="ipod-song">${name}</div>
      <div class="ipod-artist">${isPlaying ? '♪ reproduciendo' : '⏸ pausado'}</div>
      <div class="ipod-progress"><div class="ipod-bar" style="width:${pct.toFixed(1)}%"></div></div>
      <div class="ipod-time"><span>${fmtSec(cur)}</span><span>-${fmtSec(dur - cur)}</span></div>
    </div>`;
      }
    }

    // refresca la pantalla del iPod mientras hay audio
    setInterval(() => { if (ipodScreen === 'now') ipodRender(); }, 500);

    // ── STORAGE ───────────────────────────────────────────────────
    // Compatible con GitHub Pages:
    // - Si existe window.storage, lo usa.
    // - Si no existe, usa localStorage del navegador.
    const localStore = {
      async get(key) {
        const value = localStorage.getItem(key);
        return value === null ? null : { value };
      },
      async set(key, value) {
        localStorage.setItem(key, value);
      }
    };

    const S = window.storage || localStore;
    let entries = [], wallPosts = [], galleryItems = [];

    async function loadEntriesFromNotas() {
      // Las notas se editan en un archivo externo llamado notas.html.
      // Debe estar en la misma carpeta que index.html en GitHub Pages.
      const response = await fetch('notas.html', { cache: 'no-cache' });
      if (!response.ok) throw new Error('No se pudo cargar notas.html');

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const notas = Array.from(doc.querySelectorAll('article.nota'));

      if (!notas.length) throw new Error('notas.html no contiene artículos con class="nota"');

      return notas.map((nota, i) => {
        const titleEl = nota.querySelector('h1, h2, h3, .titulo');
        const timeEl = nota.querySelector('time');
        const bodyEl = nota.querySelector('.contenido') || nota.querySelector('.body') || nota;

        const title = (nota.dataset.title || (titleEl ? titleEl.textContent : '') || `Nota ${i + 1}`).trim();
        const date = (nota.dataset.date || (timeEl ? timeEl.getAttribute('datetime') || timeEl.textContent : '') || new Date().toISOString().slice(0, 10)).trim();
        const id = Number(nota.dataset.id) || i + 1;
        const bodyText = bodyEl.textContent.trim();
        const bodyHTML = bodyEl.innerHTML.trim();

        return { id, title, date, body: bodyText, html: bodyHTML };
      });
    }

    async function loadEntries() {
      try {
        return await loadEntriesFromNotas();
      } catch (e) {
        console.warn('Usando notas de reserva porque no se pudo leer notas.html:', e);
      }

      try {
        const r = await S.get('diary:entries');
        return r ? JSON.parse(r.value) : samples();
      } catch {
        return samples();
      }
    }

    async function saveEntries() {
      try {
        await S.set('diary:entries', JSON.stringify(entries));
      } catch (e) { }
    }

    async function loadWall() {
      try {
        const r = await S.get('diary:wall');
        return r ? JSON.parse(r.value) : [];
      } catch {
        return [];
      }
    }

    async function saveWall() {
      try {
        await S.set('diary:wall', JSON.stringify(wallPosts));
      } catch (e) { }
    }

    function samples() {
      return [
        { id: 1, title: "Prueba prueba", date: "2024-01-15", body: "lorem ipsum" },
        { id: 2, title: "Prueba 2", date: "2024-02-03", body: "bdjsjds" },
        { id: 3, title: "Prueba 3", date: "2024-03-22", body: "sjakaj." },
        { id: 4, title: "Prueba 1", date: "2024-04-10", body: "Ljsjs" },
      ];
    }


    // ── GALLERY ───────────────────────────────────────────────────
    async function loadGallery() {
      try {
        const response = await fetch('galeria.html', { cache: 'no-cache' });
        if (!response.ok) throw new Error('No se pudo cargar galeria.html');

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const items = Array.from(doc.querySelectorAll('figure.foto, article.foto, .gallery-item'));

        return items.map((item, i) => {
          const img = item.querySelector('img');
          const caption = item.querySelector('figcaption, .caption, .descripcion');
          const titleEl = item.querySelector('h1, h2, h3, .titulo');

          const src = (item.dataset.src || (img ? img.getAttribute('src') : '') || '').trim();
          const title = (item.dataset.title || (titleEl ? titleEl.textContent : '') || (img ? img.getAttribute('alt') : '') || `Foto ${i + 1}`).trim();
          const desc = (item.dataset.desc || item.dataset.description || (caption ? caption.textContent : '') || '').trim();
          const date = (item.dataset.date || '').trim();
          const alt = (img ? img.getAttribute('alt') : '') || title;

          return { src, title, desc, date, alt };
        }).filter(item => item.src);
      } catch (e) {
        console.warn('No se pudo leer galeria.html:', e);
        return [];
      }
    }

    function renderGallery() {
      const el = document.getElementById('wbody-gallery');
      if (!el) return;

      if (!galleryItems.length) {
        el.innerHTML = `<div class="gallery-help">
          Todavía no hay fotos en la galería.<br><br>
          Edita <strong>galeria.html</strong> y añade bloques como este:<br><br>
          &lt;figure class="foto"&gt;<br>
          &nbsp;&nbsp;&lt;img src="img/galeria/foto1.jpg" alt="Foto 1"&gt;<br>
          &nbsp;&nbsp;&lt;figcaption&gt;Texto de la foto&lt;/figcaption&gt;<br>
          &lt;/figure&gt;
        </div>`;
        return;
      }

      el.innerHTML = `<div class="gallery-grid">${galleryItems.map((item, i) => `
        <div class="gallery-card" onclick="openGalleryItem(${i})">
          <img class="gallery-thumb" src="${escAttr(item.src)}" alt="${escAttr(item.alt)}" loading="lazy">
          <div class="gallery-meta">
            <div class="gallery-title">${esc(item.title)}</div>
            ${item.desc ? `<div class="gallery-desc">${esc(item.desc)}</div>` : ''}
            ${item.date ? `<div class="gallery-date">${esc(item.date)}</div>` : ''}
          </div>
        </div>`).join('')}</div>`;
    }

    function openGalleryItem(i) {
      const item = galleryItems[i];
      if (!item) return;

      const lightbox = document.getElementById('gallery-lightbox');
      const img = document.getElementById('gallery-lightbox-img');
      const title = document.getElementById('gallery-lightbox-title');
      const desc = document.getElementById('gallery-lightbox-desc');

      img.src = item.src;
      img.alt = item.alt || item.title;
      title.textContent = item.title || '';
      desc.textContent = item.desc || item.date || '';
      lightbox.classList.add('open');
    }

    function closeGalleryLightbox(event) {
      if (event) event.stopPropagation();
      const isBackdrop = !event || event.target.id === 'gallery-lightbox';
      const isButton = event && event.target.classList.contains('gallery-close');
      if (!isBackdrop && !isButton) return;

      const lightbox = document.getElementById('gallery-lightbox');
      const img = document.getElementById('gallery-lightbox-img');
      if (lightbox) lightbox.classList.remove('open');
      if (img) img.src = '';
    }

    function escAttr(s) {
      return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── BOOT ──────────────────────────────────────────────────────
    window.addEventListener('DOMContentLoaded', async () => {
      entries = await loadEntries();
      wallPosts = await loadWall();
      galleryItems = await loadGallery();
      renderEntries(entries);
      renderWall();
      renderGallery();
      calRender();
      ipodRender();
      clockTick(); setInterval(clockTick, 1000);
      setTimeout(() => {
        const b = document.getElementById('boot');
        b.style.opacity = '0'; setTimeout(() => b.remove(), 700);
      }, 2400);
    });

    function clockTick() {
      const n = new Date();
      document.getElementById('clock').textContent =
        n.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) +
        '   ' + n.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // ── WINDOWS ───────────────────────────────────────────────────
    let zTop = 200;
    function openWin(id) {
      const w = document.getElementById(id);
      w.classList.add('open');
      w.style.display = 'flex';
      w.style.zIndex = ++zTop;

      if (id === 'win-ipod') {
        ipodScreen = 'menu';
        ipodMenuSel = 0;
        ipodRender();
      }
    }
    function closeWin(id) { const w = document.getElementById(id); w.classList.remove('open'); w.style.display = 'none'; }

    document.querySelectorAll('.wbar').forEach(bar => {
      let ox, oy, drag = false;
      bar.addEventListener('mousedown', e => {
        if (e.target.classList.contains('wdot') || e.target.classList.contains('cwheel-btn') || e.target.classList.contains('cwheel-center')) return;
        drag = true;
        const w = bar.parentElement, r = w.getBoundingClientRect();
        ox = e.clientX - r.left; oy = e.clientY - r.top; w.style.zIndex = ++zTop;
      });
      document.addEventListener('mousemove', e => {
        if (!drag) return;
        const w = bar.parentElement;
        let nx = e.clientX - ox, ny = e.clientY - oy;
        nx = Math.max(0, Math.min(nx, innerWidth - w.offsetWidth));
        ny = Math.max(24, Math.min(ny, innerHeight - w.offsetHeight - 60));
        w.style.left = nx + 'px'; w.style.top = ny + 'px';
      });
      document.addEventListener('mouseup', () => drag = false);
    });

    document.querySelectorAll('.wresize').forEach(h => {
      let res = false, sx, sy, sw, sh;
      h.addEventListener('mousedown', e => { res = true; sx = e.clientX; sy = e.clientY; const w = h.parentElement; sw = w.offsetWidth; sh = w.offsetHeight; e.stopPropagation(); });
      document.addEventListener('mousemove', e => { if (!res) return; const w = h.parentElement; w.style.width = Math.max(260, sw + (e.clientX - sx)) + 'px'; w.style.height = Math.max(200, sh + (e.clientY - sy)) + 'px'; });
      document.addEventListener('mouseup', () => res = false);
    });

    // ── ENTRIES ───────────────────────────────────────────────────
    function fmtDate(d) { return new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    function fmtShort(d) { return new Date(d + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); }

    function groupByMonth(arr) {
      const g = {};
      arr.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(e => {
        const k = new Date(e.date + 'T12:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        if (!g[k]) g[k] = []; g[k].push(e);
      });
      return g;
    }
    function renderEntries(list) {
      const el = document.getElementById('wbody-entries');
      if (!list.length) { el.innerHTML = '<div class="empty-msg">Aún no hay escritos.</div>'; return; }
      const g = groupByMonth(list);
      el.innerHTML = Object.entries(g).map(([m, es]) =>
        `<div class="month-hdr">${m}</div>${es.map(e =>
          `<div class="ecard" onclick="openReader(${e.id})">
        <div class="ecard-date">${fmtDate(e.date)}</div>
        <div class="ecard-title">${e.title}</div>
        <div class="ecard-prev">${e.body.slice(0, 85)}${e.body.length > 85 ? '…' : ''}</div>
      </div>`).join('')}`).join('');
    }
    function openReader(id) {
      const e = entries.find(x => x.id === id); if (!e) return;
      const content = e.html || esc(e.body);
      document.getElementById('wbody-reader').innerHTML =
        `<div class="r-title">${esc(e.title)}</div><div class="r-date">${fmtDate(e.date)}</div><div class="r-body">${content}</div>`;
      openWin('win-reader');
    }

    // ── SEARCH ────────────────────────────────────────────────────
    function doSearch() {
      const q = document.getElementById('sinput').value.toLowerCase().trim();
      const el = document.getElementById('search-res');
      if (!q) { el.innerHTML = ''; return; }
      const r = entries.filter(e => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q));
      el.innerHTML = r.length
        ? r.map(e => `<div class="ecard" onclick="openReader(${e.id})"><div class="ecard-date">${fmtDate(e.date)}</div><div class="ecard-title">${e.title}</div><div class="ecard-prev">${e.body.slice(0, 75)}…</div></div>`).join('')
        : '<div class="empty-msg">Sin resultados.</div>';
    }

    // ── CALENDAR ──────────────────────────────────────────────────
    let calY = new Date().getFullYear(), calM = new Date().getMonth();
    const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    function calMove(d) { calM += d; if (calM > 11) { calM = 0; calY++; } if (calM < 0) { calM = 11; calY--; } calRender(); }
    function calRender() {
      document.getElementById('cal-month-lbl').textContent = `${MONTHS[calM]} ${calY}`;
      const grid = document.getElementById('cal-grid');
      let html = DAYS.map(d => `<div class="cal-dow">${d}</div>`).join('');
      const first = new Date(calY, calM, 1).getDay();
      const offset = first === 0 ? 6 : first - 1;
      const dim = new Date(calY, calM + 1, 0).getDate();
      const today = new Date();
      const edates = new Set(entries.map(e => e.date));
      for (let i = 0; i < offset; i++) html += `<div class="cal-day empty-day"></div>`;
      for (let d = 1; d <= dim; d++) {
        const ds = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const iT = today.getFullYear() === calY && today.getMonth() === calM && today.getDate() === d;
        const hE = edates.has(ds);
        html += `<div class="cal-day${iT ? ' today' : ''}${hE ? ' has-entry' : ''}" onclick="calSelect('${ds}', this)">${d}</div>`;
      }
      grid.innerHTML = html;
      document.getElementById('cal-res').innerHTML = '';
    }
    function calSelect(ds, targetEl) {
      document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
      if (targetEl) targetEl.classList.add('selected');
      const res = entries.filter(e => e.date === ds);
      const el = document.getElementById('cal-res');
      el.innerHTML = res.length
        ? res.map(e => `<div class="ecard" onclick="openReader(${e.id})"><div class="ecard-title">${e.title}</div><div class="ecard-prev">${e.body.slice(0, 70)}…</div></div>`).join('')
        : `<div class="empty-msg">Sin escritos el ${fmtShort(ds)}.</div>`;
    }

    // ── WALL ──────────────────────────────────────────────────────
    const AVS = ['🌸', '🦋', '⭐', '🌙', '🎵', '💫', '🔮', '🌈', '🦄', '🌺', '🎀', '💎'];
    function av(n) { return AVS[n.charCodeAt(0) % AVS.length]; }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function renderWall() {
      const el = document.getElementById('wall-posts');
      if (!wallPosts.length) { el.innerHTML = `<div class="empty-msg" style="font-family:'Comic Sans MS',cursive">¡Sé el primero! (◕‿◕✿)</div>`; return; }
      el.innerHTML = wallPosts.slice().reverse().map(p =>
        `<div class="wall-note">
      <div style="display:flex;align-items:center;margin-bottom:4px">
        <span style="font-size:1.4rem;margin-right:6px">${av(p.name)}</span>
        <div><div class="wall-name">${esc(p.name)}</div><div class="wall-date">${p.date}</div></div>
      </div>
      <div class="wall-text">${esc(p.msg)}</div>
    </div>`).join('');
    }
    async function postWall() {
      const name = document.getElementById('wall-name').value.trim();
      const msg = document.getElementById('wall-msg').value.trim();
      if (!name || !msg) return;
      wallPosts.push({ name, msg, date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) });
      await saveWall(); renderWall();
      document.getElementById('wall-name').value = ''; document.getElementById('wall-msg').value = '';
    }


document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeGalleryLightbox();
});
