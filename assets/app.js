// Timestamp used by the bottom script to guarantee the assembly +
// welcome sequence gets to play out fully, on every visit.
window.__jjpLoaderStart = Date.now();

// Loader visual: a scattered field of lines flies in and assembles into
// a building under construction with a tower crane (columns with
// exposed rebar, cross-braced bays, a lattice-mast crane with jib,
// counter-jib and hook). Windows then light up in sequence, followed
// by the welcome message glowing on.
(function () {
  var g = document.getElementById('loaderBuildingLines');
  var wg = document.getElementById('loaderBuildingWindows');
  var welcomeEl = document.getElementById('loaderWelcome');
  var brandEl = document.getElementById('loaderBrand');
  if (!g) return;
  var svgNS = 'http://www.w3.org/2000/svg';

  var segs = [
    // Building columns
    [50,195,50,55],[90,195,90,55],[130,195,130,55],[170,195,170,55],
    // Floor slabs
    [50,195,170,195],[50,160,170,160],[50,125,170,125],[50,90,170,90],[50,55,170,55],
    // Cross-bracing, left bay
    [50,195,90,160],[50,160,90,195],
    [50,160,90,125],[50,125,90,160],
    [50,125,90,90],[50,90,90,125],
    [50,90,90,55],[50,55,90,90],
    // Cross-bracing, right bay
    [130,195,170,160],[130,160,170,195],
    [130,160,170,125],[130,125,170,160],
    [130,125,170,90],[130,90,170,125],
    [130,90,170,55],[130,55,170,90],
    // Exposed rebar above the last poured floor
    [48,55,44,30],[52,55,56,30],
    [88,55,84,30],[92,55,96,30],
    [128,55,124,30],[132,55,136,30],
    [168,55,164,30],[172,55,176,30],
    // Tower crane mast (lattice)
    [230,195,230,28],[238,195,238,28],
    [230,165,238,165],[230,135,238,135],[230,105,238,105],[230,75,238,75],
    [230,195,238,165],[238,165,230,135],[230,135,238,105],[238,105,230,75],
    // Slewing cab
    [222,28,246,28],[222,28,228,15],[246,28,240,15],
    // Jib (working arm, reaches over the building)
    [234,8,65,8],[234,18,65,18],
    [210,8,210,18],[185,8,185,18],[160,8,160,18],[135,8,135,18],[110,8,110,18],[85,8,85,18],
    // Counter-jib + counterweight
    [234,8,280,8],[234,18,280,18],
    [250,8,250,18],[265,8,265,18],
    [270,18,290,18],[290,18,290,32],[290,32,270,32],[270,32,270,18],
    // Hook block
    [150,18,150,70],[150,70,146,74],[150,70,154,74],
    // Crane base bracing
    [230,195,238,180],[238,195,230,180]
  ];

  segs.forEach(function (s) {
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', s[0]); line.setAttribute('y1', s[1]);
    line.setAttribute('x2', s[2]); line.setAttribute('y2', s[3]);
    line.setAttribute('class', 'build-line');
    line.style.setProperty('--dx', (Math.random() * 320 - 160).toFixed(0) + 'px');
    line.style.setProperty('--dy', (Math.random() * 260 - 130).toFixed(0) + 'px');
    line.style.setProperty('--dr', (Math.random() * 260 - 130).toFixed(0) + 'deg');
    line.style.transitionDelay = (Math.random() * 0.5).toFixed(2) + 's';
    g.appendChild(line);
  });

  // Windows: a 3-bay x 4-floor grid of small marks on the building face
  if (wg) {
    var bayX = [58, 74, 98, 114, 138, 154];
    var floorY = [62, 97, 132, 167];
    floorY.forEach(function (y) {
      bayX.forEach(function (x) {
        var r = document.createElementNS(svgNS, 'rect');
        r.setAttribute('x', x); r.setAttribute('y', y);
        r.setAttribute('width', 8); r.setAttribute('height', 10);
        r.setAttribute('class', 'build-window');
        wg.appendChild(r);
      });
    });
  }

  try {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(g.children, function (line) {
          line.classList.add('assembled');
        });
        if (wg) {
          Array.prototype.forEach.call(wg.children, function (w) {
            w.classList.add('visible');
          });
        }
        if (brandEl) brandEl.classList.add('visible');
      });
    });

    // Once the structure has largely assembled, windows light up in
    // sequence, like dusk falling over the building...
    setTimeout(function () {
      if (!wg) return;
      Array.prototype.forEach.call(wg.children, function (w, i) {
        setTimeout(function () { w.classList.add('lit'); }, i * 45);
      });
    }, 1300);

    // ...then the welcome message glows on.
    setTimeout(function () {
      if (welcomeEl) welcomeEl.classList.add('lit');
    }, 2150);
  } catch (e) {}
})();

// Media readiness: wait on the ACTUAL elements the page will show
// (canplaythrough for video, not just "the bytes are in a cache
// somewhere") so the loader finishing really means instant playback.
(function () {
  var mediaLoader = document.getElementById('mediaLoader');
  if (!mediaLoader) return;
  var barFill = document.getElementById('loaderBarFill');
  var percentEl = document.getElementById('loaderPercent');
  var statusText = document.getElementById('loaderStatusText');
  // If the real load finishes fast, add a short pause so the welcome
  // moment is actually seen; if it already took a while, don't pile
  // more waiting on top of a wait that already happened.
  var FAST_THRESHOLD_MS = 5000;
  var EXTRA_DELAY_MS = 3000;
  var startedAt = window.__jjpLoaderStart || Date.now();

  function revealNow() {
    try {
      document.body.classList.add('media-ready');
      mediaLoader.classList.add('loader-done');
    } catch (e) {}
    // Belt-and-suspenders: if autoplay didn't engage while a video was
    // hidden behind the loader, nudge it now that the page is visible.
    document.querySelectorAll('.project-media video').forEach(function (v) {
      if (v.paused) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
  }

  function finishLoading() {
    var elapsed = Date.now() - startedAt;
    if (elapsed < FAST_THRESHOLD_MS) { setTimeout(revealNow, EXTRA_DELAY_MS); } else { revealNow(); }
  }

  try {
    var videos = Array.prototype.slice.call(document.querySelectorAll('.project-media video'));
    var posterSrcs = videos.map(function (v) { return v.getAttribute('poster'); }).filter(Boolean);
    var logoImgs = Array.prototype.slice.call(document.querySelectorAll('.tool-badge img'));
    var total = videos.length + posterSrcs.length + logoImgs.length;

    if (total === 0) {
      finishLoading();
    } else {
      var loaded = 0;
      var done = false;

      function tick() {
        loaded++;
        var pct = Math.min(100, Math.round((loaded / total) * 100));
        if (barFill) barFill.style.width = pct + '%';
        if (percentEl) percentEl.textContent = pct;
        if (loaded >= total && !done) {
          done = true;
          if (statusText) statusText.textContent = 'ready';
          setTimeout(function () {
            finishLoading();
            // Quietly warm the cache for the on-demand demo videos
            // too, without making the visitor wait for them up front.
            ['capability/qto.mp4', 'capability/pyrevit.mp4', 'capability/realitycapture.mp4', 'capability/powerbi.mp4']
              .forEach(function (src) { fetch(src, { cache: 'force-cache' }).catch(function () {}); });
          }, 250);
        }
      }

      videos.forEach(function (v) {
        // Deliberately NOT calling v.load() or re-setting preload here:
        // the browser already started fetching this element natively
        // (autoplay + preload="auto" in the markup), and interrupting
        // that in-flight load is what was stopping autoplay from
        // reliably resuming once the page became visible. Just observe.
        if (v.readyState >= 3) { tick(); return; } // already playable
        var settled = false;
        function onReady() {
          if (settled) return;
          settled = true;
          v.removeEventListener('canplaythrough', onReady);
          v.removeEventListener('error', onReady);
          tick();
        }
        v.addEventListener('canplaythrough', onReady, { once: true });
        v.addEventListener('error', onReady, { once: true });
      });

      posterSrcs.concat(logoImgs.map(function (img) { return img.src; })).forEach(function (src) {
        var im = new Image();
        im.onload = tick;
        im.onerror = tick;
        im.src = src;
      });

      // Safety net: never trap a visitor on the loading screen.
      setTimeout(function () {
        if (!done) { done = true; finishLoading(); }
      }, 12000);
    }
  } catch (e) {
    finishLoading();
  }
})();

function closeModal(id) { document.getElementById(id).classList.remove('active'); const v = document.getElementById('workVideo'); if(v) v.pause(); }
window.onclick = function(e) { if(e.target.classList.contains('modal-overlay')) { e.target.classList.remove('active'); const v = document.getElementById('workVideo'); if(v) v.pause(); } }

document.querySelectorAll('.tool-badge').forEach(b => {
  b.onclick = () => {
    document.getElementById('toolTitle').innerText = b.querySelector('.tool-badge-name').innerText;
    document.getElementById('toolDesc').innerHTML = b.dataset.desc;
    
    // Generate Star Rating HTML
    const rating = parseInt(b.dataset.rating) || 0;
    let starsHtml = '';
    for(let i = 1; i <= 5; i++) {
      starsHtml += i <= rating ? '★' : '<span class="empty">★</span>';
    }
    document.getElementById('toolRating').innerHTML = starsHtml;

    const iconEl = (b.querySelector('img') || b.querySelector('svg'));
    if(iconEl) document.getElementById('toolIcon').innerHTML = iconEl.outerHTML;
    document.getElementById('toolModal').classList.add('active');
  }
});

document.querySelectorAll('.capability-feature').forEach(b => {
  b.onclick = () => {
    document.getElementById('workTitle').innerText = b.dataset.workTitle;
    document.getElementById('workDesc').innerText = b.dataset.workDesc;
    
    const v = document.getElementById('workVideo'); 
    const videoSrc = b.dataset.videoSrc || "";
    v.querySelector('source').src = videoSrc; 
    v.load();
    
    if (videoSrc) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log("Autoplay prevented by browser:", error));
      }
    }
    
    document.getElementById('workModal').classList.add('active');
  }
});

document.querySelectorAll('.capability-chip').forEach(chip => {
  chip.onclick = () => {
    document.getElementById('expTitle').innerText = chip.dataset.title;
    document.getElementById('expOrg').innerText = chip.dataset.tag;
    document.getElementById('expDesc').innerText = chip.dataset.desc;
    document.getElementById('expModal').classList.add('active');
  }
});

document.querySelectorAll('.build-card').forEach(card => {
  card.onclick = () => {
    document.getElementById('buildTitle').innerText = card.dataset.tool;
    document.getElementById('buildChallenge').innerText = card.dataset.challenge;
    document.getElementById('buildSolution').innerText = card.dataset.solution;
    document.getElementById('buildModal').classList.add('active');
  }
});

document.querySelectorAll('.project-toggle').forEach(btn => {
  btn.onclick = () => {
    const card = btn.closest('.project-card');
    const expanded = card.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', expanded);
    btn.querySelector('.toggle-label').textContent = expanded ? 'Show less' : 'Read more';
  }
});

document.querySelectorAll('.timeline-content').forEach(c => {
  c.onclick = () => {
    document.getElementById('expTitle').innerText = c.querySelector('.timeline-title').innerText;
    document.getElementById('expOrg').innerText = c.querySelector('.timeline-org').innerText;
    document.getElementById('expDesc').innerText = c.dataset.desc;
    document.getElementById('expModal').classList.add('active');
  }
});

// Nav scroll tracking + active state
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));

// Fix: on some mobile browsers, tapping a nav link jumps straight to
// the section but the scroll-reveal content stays hidden until an
// extra manual scroll (IntersectionObserver lags behind the jump).
// Force that section's content visible the instant it's requested.
function revealSection(section) {
  if (!section) return;
  section.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  if (section.classList.contains('reveal')) section.classList.add('visible');
}
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    revealSection(document.querySelector(link.getAttribute('href')));
  });
});
window.addEventListener('load', () => {
  if (location.hash) revealSection(document.querySelector(location.hash));
});

window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;
  nav.classList.toggle('scrolled', window.scrollY > 60);

  sections.forEach((section, i) => {
    if (section && section.offsetTop <= scrollPos && (section.offsetTop + section.offsetHeight) > scrollPos) {
      navLinks.forEach(link => link.classList.remove('active'));
      navLinks[i].classList.add('active');
    }
  });
});

const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

const starCanvas = document.getElementById('starCanvas'); const sc = starCanvas.getContext('2d');
function resizeStar() { starCanvas.width = window.innerWidth; starCanvas.height = window.innerHeight; }
resizeStar(); window.addEventListener('resize', resizeStar);
const stars = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.5, alpha: Math.random() * 0.6 + 0.1 }));
function drawStars() {
  sc.clearRect(0, 0, starCanvas.width, starCanvas.height); sc.fillStyle = "rgba(232,237,245,0.5)";
  stars.forEach(s => {
    sc.beginPath(); sc.arc(s.x * starCanvas.width, s.y * starCanvas.height, s.r, 0, Math.PI * 2); sc.fill();
    s.y -= 0.0001; if (s.y < 0) s.y = 1;
  });
  requestAnimationFrame(drawStars);
}
drawStars();

const city = document.getElementById('cityCanvas');
const cc = city.getContext('2d');
let cityT = 0;

function resizeCity() {
  city.width = window.innerWidth;
  city.height = city.parentElement.getBoundingClientRect().height * 0.55;
}
resizeCity(); window.addEventListener('resize', resizeCity);

const buildings = [
  [0,.38,.028],[.025,.28,.022],[.044,.42,.032],[.074,.32,.02],[.092,.50,.038],
  [.128,.36,.025],[.151,.60,.042],[.191,.40,.028],[.217,.30,.02],[.235,.48,.035],
  [.268,.35,.022],[.288,.55,.04],[.326,.38,.025],[.349,.70,.05],[.397,.44,.03],
  [.425,.34,.022],[.445,.52,.038],[.481,.38,.026],[.505,.62,.045],[.548,.42,.028],
  [.574,.32,.02],[.592,.50,.036],[.626,.40,.025],[.649,.65,.048],[.695,.38,.028],
  [.721,.28,.02],[.739,.46,.034],[.771,.36,.024],[.793,.55,.04],[.831,.42,.027],
  [.856,.30,.02],[.874,.48,.035],[.907,.38,.024],[.929,.58,.043],[.970,.35,.025],[.993,.25,.018],
];

const antennas = [.155, .352, .510, .655, .795];

function drawCity() {
  cityT += 0.008;
  const W = city.width, H = city.height;
  cc.clearRect(0, 0, W, H);

  buildings.forEach(([bx, bh, bw], idx) => {
    const x = bx * W;
    const w = bw * W;
    const h = bh * H;
    const y = H - h;

    const bGrad = cc.createLinearGradient(x, y, x, H);
    bGrad.addColorStop(0, 'rgba(18, 32, 52, 0.9)');
    bGrad.addColorStop(1, 'rgba(10, 18, 30, 1)');
    cc.fillStyle = bGrad;
    cc.fillRect(x, y, w, h);

    cc.strokeStyle = 'rgba(78, 204, 163, 0.15)';
    cc.lineWidth = 1;
    cc.strokeRect(x, y, w, h);

    const winW = Math.max(2, w * 0.18);
    const winH = Math.max(2, h * 0.04);
    const cols = Math.max(1, Math.floor(w / (winW * 2.5)));
    const rows = Math.max(1, Math.floor(h / (winH * 3)));
    const padX = (w - cols * winW * 2.5 + winW) / 2;
    const padY = winH * 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = x + padX + c * winW * 2.5;
        const wy = y + padY + r * winH * 3;
        const seed = Math.sin(idx * 13 + r * 7 + c * 3);
        if (seed > 0) {
          const flicker = 0.4 + Math.sin(cityT * 1.5 + idx + r) * 0.2;
          cc.fillStyle = seed > 0.7 ? `rgba(78, 204, 163, ${flicker})` : `rgba(200, 220, 255, ${flicker * 0.4})`;
          cc.fillRect(wx, wy, winW, winH);
        }
      }
    }
  });

  antennas.forEach(ax => {
    const bx = ax * W;
    const b = buildings.find(([bx2, ,bw]) => bx >= bx2 * W && bx < (bx2 + bw) * W);
    if (!b) return;
    const top = (1 - b[1]) * H;
    const spireH = H * 0.1;
    cc.strokeStyle = 'rgba(78, 204, 163, 0.4)';
    cc.beginPath(); cc.moveTo(bx, top); cc.lineTo(bx, top - spireH); cc.stroke();
    const blink = 0.5 + Math.sin(cityT * 3 + ax * 10) * 0.5;
    cc.beginPath(); cc.arc(bx, top - spireH, 2, 0, Math.PI * 2);
    cc.fillStyle = `rgba(78, 204, 163, ${Math.max(0, blink)})`;
    cc.fill();
  });

  requestAnimationFrame(drawCity);
}
drawCity();
