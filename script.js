document.addEventListener('DOMContentLoaded', () => {

  // ── Seasonal map (index.html) ──────────────────────────────────────────
  // Winter: Dec–Mar · Spring: Apr–May · Summer: Jun–Aug · Fall: Sep–Nov
  const SEASONS = [
    { name: 'Winter', src: 'images/map-winter.png', months: [12, 1, 2, 3] },
    { name: 'Spring', src: 'images/map-spring.png', months: [4, 5]        },
    { name: 'Summer', src: 'images/map-summer.png', months: [6, 7, 8]     },
    { name: 'Fall',   src: 'images/map-fall.png',   months: [9, 10, 11]   },
  ];

  const mapImg = document.getElementById('mapImg');

  if (mapImg) {
    const month = new Date().getMonth() + 1; // 1–12
    const season = SEASONS.find(s => s.months.includes(month)) || SEASONS[2];
    mapImg.src = season.src;
  }

  // ── Hotspot alignment for object-fit: contain ─────────────────────────
  // Hotspots are stored as % of the full image. After contain-scaling the
  // image may have letterbox bars, so recompute each spot against the
  // actually-rendered image rect.
  const hotspots = document.querySelectorAll('.hotspot');

  function repositionHotspots() {
    if (!mapImg || !hotspots.length) return;

    const wrapper = mapImg.parentElement;
    const wW = wrapper.clientWidth;
    const wH = wrapper.clientHeight;
    const natW = mapImg.naturalWidth  || 1;
    const natH = mapImg.naturalHeight || 1;

    const scale = Math.min(wW / natW, wH / natH);
    const rW = natW * scale;
    const rH = natH * scale;
    const offX = (wW - rW) / 2;
    const offY = (wH - rH) / 2;

    hotspots.forEach(h => {
      if (!h.dataset.origLeft) {
        h.dataset.origLeft   = parseFloat(h.style.left)   || 0;
        h.dataset.origTop    = parseFloat(h.style.top)    || 0;
        h.dataset.origWidth  = parseFloat(h.style.width)  || 0;
        h.dataset.origHeight = parseFloat(h.style.height) || 0;
      }
      const pL = parseFloat(h.dataset.origLeft)   / 100;
      const pT = parseFloat(h.dataset.origTop)    / 100;
      const pW = parseFloat(h.dataset.origWidth)  / 100;
      const pH = parseFloat(h.dataset.origHeight) / 100;

      h.style.left   = (offX + pL * rW) + 'px';
      h.style.top    = (offY + pT * rH) + 'px';
      h.style.width  = (pW * rW) + 'px';
      h.style.height = (pH * rH) + 'px';
    });
  }

  if (mapImg) {
    mapImg.addEventListener('load', repositionHotspots);
    window.addEventListener('resize', repositionHotspots);
    if (mapImg.complete && mapImg.naturalWidth) repositionHotspots();
  }

  // ── Hotspot hover labels + navigation (both pages) ────────────────────
  const label = document.getElementById('labelTag');
  const spots = document.querySelectorAll('.hotspot, .sign');

  spots.forEach(spot => {
    spot.addEventListener('mouseenter', () => {
      if (!label) return;
      label.textContent = spot.dataset.name || '';
      label.classList.add('visible');
    });
    spot.addEventListener('mousemove', (e) => {
      if (!label) return;
      label.style.left = e.clientX + 'px';
      label.style.top  = e.clientY + 'px';
    });
    spot.addEventListener('mouseleave', () => {
      if (!label) return;
      label.classList.remove('visible');
    });
    spot.addEventListener('click', (e) => {
      const href = spot.getAttribute('href');
      if (href && href !== '#') return; // real link → let it navigate
      e.preventDefault();
      console.log('Clicked (no link yet):', spot.dataset.name);
    });
  });

  // ── Time-based trail scene + sunrise/sunset cycle (explore.html) ──────
  // Night 0–6 · Sunrise 6–7 · Day 7–19 · Sunset 19–20 · Night 20–24
  const SCENES = [
    { src: 'images/trail-night.png',   label: 'Night',   start:  0, end:  6 },
    { src: 'images/trail-sunrise.png', label: 'Sunrise', start:  6, end:  7 },
    { src: 'images/trail-day.png',     label: 'Day',     start:  7, end: 19 },
    { src: 'images/trail-sunset.png',  label: 'Sunset',  start: 19, end: 20 },
    { src: 'images/trail-night.png',   label: 'Night',   start: 20, end: 24 },
  ];

  const CYCLE = [
    { src: 'images/trail-night.png',   label: 'Night'   },
    { src: 'images/trail-sunrise.png', label: 'Sunrise' },
    { src: 'images/trail-day.png',     label: 'Day'     },
    { src: 'images/trail-sunset.png',  label: 'Sunset'  },
  ];

  function getAutoScene() {
    const h = new Date().getHours();
    return SCENES.find(s => h >= s.start && h < s.end) || SCENES[0];
  }

  const trailImg = document.getElementById('trailImg');
  const toggle   = document.getElementById('dnToggle');
  const labelEl  = document.getElementById('dnLabel');

  if (trailImg) {
    let currentSrc = null;
    let cycleIdx   = null;

    function applyScene(scene, fade) {
      if (scene.src === currentSrc) return;
      currentSrc = scene.src;
      if (fade) {
        trailImg.style.opacity = 0;
        setTimeout(() => { trailImg.src = scene.src; trailImg.style.opacity = 1; }, 400);
      } else {
        trailImg.src = scene.src;
      }
      if (labelEl) labelEl.textContent = scene.label;
    }

    applyScene(getAutoScene(), false);

    // keep auto-updating with time, until the user takes manual control
    setInterval(() => {
      if (cycleIdx === null) applyScene(getAutoScene(), true);
    }, 60 * 1000);

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (cycleIdx === null) {
          cycleIdx = CYCLE.findIndex(s => s.src === currentSrc);
          if (cycleIdx === -1) cycleIdx = 0;
        }
        cycleIdx = (cycleIdx + 1) % CYCLE.length;
        applyScene(CYCLE[cycleIdx], true);
      });
    }
  }
});
