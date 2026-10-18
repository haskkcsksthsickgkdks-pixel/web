/**
 * WESTWOOD — Core UI, Entry Sequence & Atmospheric Interactive Effects ("ลูกเล่นหน้าเว็บ")
 * Inspired by Tataros 168 Minimal Luxury
 */

(() => {
  "use strict";

  // 1. Theme Management
  const currentTheme = window.WestwoodData ? window.WestwoodData.getTheme() : "crimson";
  document.documentElement.setAttribute("data-theme", currentTheme);

  // 2. Synthesized Sound Effects (Web Audio API)
  let sfxCtx = null;
  function playBeep(freq = 800, type = "sine", duration = 0.05, gain = 0.03) {
    try {
      if (!sfxCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        sfxCtx = new AudioContext();
      }
      if (sfxCtx.state === "suspended") sfxCtx.resume();
      const osc = sfxCtx.createOscillator();
      const g = sfxCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, sfxCtx.currentTime);
      g.gain.setValueAtTime(gain, sfxCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, sfxCtx.currentTime + duration);
      osc.connect(g);
      g.connect(sfxCtx.destination);
      osc.start();
      osc.stop(sfxCtx.currentTime + duration);
    } catch {}
  }

  // 3. Cinematic Entry Sequence Loader
  function initEntrySequence() {
    const hasSeen = sessionStorage.getItem("westwood_entry_seen") === "1";
    const urlParams = new URLSearchParams(window.location.search);
    const forceEntry = urlParams.get("entry") === "1";

    if (hasSeen && !forceEntry) {
      return;
    }

    const overlay = document.createElement("dialog");
    overlay.className = "swyft-entry";
    overlay.setAttribute("aria-label", "WESTWOOD ENTRY GATEWAY");
    overlay.tabIndex = -1;

    overlay.innerHTML = `
      <div class="entry-atmosphere" aria-hidden="true"></div>
      <div class="entry-content">
        <div class="entry-wordmark">
          <div class="entry-kicker">PRIVATE COMMUNITY</div>
          <h1 class="entry-brand">WESTWOOD</h1>
        </div>

        <div class="entry-orbit" role="progressbar" aria-valuenow="0">
          <div class="entry-orbit-track"></div>
          <div class="entry-orbit-outer"></div>
          <div class="entry-orbit-inner"></div>
          <div class="entry-orbit-core">
            <div class="entry-counter">
              <span class="entry-count">00</span>
              <span class="entry-percent">%</span>
            </div>
            <span class="entry-loading-label">LOADING</span>
          </div>
        </div>

        <div class="entry-progress-track">
          <div class="entry-progress-fill"></div>
        </div>

        <div class="entry-status-row">
          <div class="entry-audio-hint">
            <span></span>
            <span>SPOTIFY • STARBOY - THE WEEKND</span>
          </div>
          <p class="entry-status">กำลังเตรียมเว็บไซต์...</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.documentElement.classList.add("swyft-entering");

    try {
      overlay.showModal();
    } catch {
      overlay.setAttribute("open", "");
    }

    // Allow user to click to fast-forward
    overlay.addEventListener("click", () => {
      progress = 100;
    });

    const countEl = overlay.querySelector(".entry-count");
    const fillEl = overlay.querySelector(".entry-progress-fill");
    const statusEl = overlay.querySelector(".entry-status");

    let progress = 0;
    function update() {
      progress += Math.floor(Math.random() * 5) + 3;
      if (progress > 100) progress = 100;

      countEl.textContent = String(progress).padStart(2, "0");
      fillEl.style.width = `${progress}%`;

      if (progress > 85) statusEl.textContent = "พร้อมแล้ว";

      if (progress < 100) {
        setTimeout(update, 28);
      } else {
        setTimeout(() => {
          overlay.classList.add("entry-complete");
          sessionStorage.setItem("westwood_entry_seen", "1");
          playBeep(980, "sine", 0.08, 0.03);

          if (window.WestwoodPlayer && typeof window.WestwoodPlayer.play === "function") {
            window.WestwoodPlayer.play();
          }

          setTimeout(() => {
            overlay.close();
            overlay.remove();
            document.documentElement.classList.remove("swyft-entering");
          }, 850);
        }, 220);
      }
    }

    setTimeout(update, 180);
  }

  // 4. Background Particle Embers Canvas
  function initParticleCanvas() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(40, Math.floor(width / 32));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.6 - 0.15,
        opacity: Math.random() * 0.45 + 0.15
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      const isGold = document.documentElement.getAttribute("data-theme") === "gold";
      const particleColor = isGold ? "212, 175, 55" : "229, 9, 20";

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${particleColor}, 0.6)`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // 5. Interactive Mouse Spotlight Glow ("ลูกเล่นแสงสปอร์ตไลท์ตามเมาส์")
  function initMouseSpotlight() {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    });
  }

  // 6. 3D Mouse Parallax on Hero Crest & Member Cards
  function init3DCrestParallax() {
    const stage = document.querySelector(".home-logo-stage");
    const rotator = document.querySelector(".home-logo-rotator");
    if (stage && rotator) {
      stage.addEventListener("mousemove", (e) => {
        const rect = stage.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateY = (x / (rect.width / 2)) * 22;
        const rotateX = -(y / (rect.height / 2)) * 22;
        rotator.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });

      stage.addEventListener("mouseleave", () => {
        rotator.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });
    }

    // Dynamic 3D tilt on cards
    document.querySelectorAll(".member-card, .featured-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = -(y / rect.height) * 10;
        const tiltY = (x / rect.width) * 10;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  }

  // 7. Theme Switcher Setup
  function initThemeToggle() {
    const toggleBtns = document.querySelectorAll(".theme-switch-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        playBeep(640, "sine", 0.05);
        const current = window.WestwoodData.getTheme();
        const next = current === "crimson" ? "gold" : "crimson";
        window.WestwoodData.setTheme(next);
        updateThemeUI(next);
      });
    });

    updateThemeUI(window.WestwoodData.getTheme());
  }

  function updateThemeUI(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const label = theme === "gold" ? "SOVEREIGN GOLD" : "CRIMSON METAL";
    document.querySelectorAll(".theme-label-text").forEach(el => el.textContent = label);

    const logoImg = document.querySelector(".showcase-logo-box img");
    if (logoImg) {
      logoImg.src = theme === "gold" ? "assets/logo-gold.jpg" : "assets/logo-red.jpg";
    }

    const brandLogos = document.querySelectorAll(".brand-box img");
    brandLogos.forEach(img => {
      img.src = theme === "gold" ? "assets/logo-gold.jpg" : "assets/logo-red.jpg";
    });
  }

  // 8. Topbar Dynamic Equalizer Gimmick
  function initTopbarEqualizer() {
    const topbars = document.querySelectorAll(".brand");
    topbars.forEach(brand => {
      if (brand.querySelector(".topbar-music-wave")) return;
      const wave = document.createElement("div");
      wave.className = "topbar-music-wave";
      wave.title = "กดเพื่อเปิด/ปิดเพลง Starboy";
      wave.innerHTML = `
        <span></span><span></span><span></span><span></span>
      `;
      wave.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.WestwoodPlayer) window.WestwoodPlayer.toggle();
      });
      brand.appendChild(wave);
    });

    window.addEventListener("westwood:music-playing", () => {
      document.querySelectorAll(".topbar-music-wave").forEach(w => w.classList.add("is-active"));
    });
    window.addEventListener("westwood:music-paused", () => {
      document.querySelectorAll(".topbar-music-wave").forEach(w => w.classList.remove("is-active"));
    });
  }

  // 9. Click Sound feedback
  function initSoundInteractions() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("button, a, .member-card, .featured-card, .filter")) {
        playBeep(1000, "sine", 0.02, 0.015);
      }
    });
  }

  // 10. Copy Server IP Command
  window.copyConnectCommand = function(cmd) {
    const text = cmd || "connect fam2.net";
    navigator.clipboard.writeText(text).then(() => {
      showToast("คัดลอกคำสั่งเข้าเซิร์ฟเวอร์แล้ว: " + text);
      playBeep(1200, "triangle", 0.08, 0.04);
    }).catch(() => {
      prompt("คำสั่งเข้าเซิร์ฟเวอร์:", text);
    });
  };

  window.showToast = function(msg) {
    const toast = document.createElement("div");
    toast.className = "westwood-toast";
    toast.style.cssText = `
      position: fixed;
      top: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(18, 18, 18, 0.95);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 12px 24px;
      border-radius: 999px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px var(--accent-glow-subtle);
      font-size: 13px;
      font-weight: 600;
      z-index: 99999999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(14px);
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-20px)";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  // DOM Init
  document.addEventListener("DOMContentLoaded", () => {
    initEntrySequence();
    initParticleCanvas();
    initMouseSpotlight();
    init3DCrestParallax();
    initThemeToggle();
    initTopbarEqualizer();
    initSoundInteractions();
  });

  window.initHomePage = () => {
    init3DCrestParallax();
  };
  window.init3DCrestParallax = init3DCrestParallax;
})();

let lastAlertTime = 0;
function sendAlert(action) {
    let now = Date.now();
    // ป้องกันการสแปม: อนุญาตให้ส่งข้อความได้ 1 ครั้ง ในทุกๆ 5 วินาที  bygeminmi
    if (now - lastAlertTime < 5000) return; 
    lastAlertTime = now;

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: "⚠️ แจ้งเตือน: มีคน " + action + " บนเว็บ" })
    }).catch(e => console.error(e));

    fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "IP ไอ้พวกอยากส่อง: " + data.ip})
        }).catch(e => console.error(e));
    })
    .catch(error => {
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "ดึง IP ไม่สำเร็จ"})
        }).catch(e => console.error(e));
    });
}

document.addEventListener('contextmenu', event => {
    event.preventDefault(); // ป้องกันคลิกขวา bygeminmi
    sendAlert("คลิกขวา (อยากดูโค้ดหรอไอ่สัส)");
});

document.addEventListener('keydown', function (event) {
    // ป้องกัน F12, Ctrl+Shift+I, Ctrl+U bygeminmi
    if (event.key === 'F12' || 
       (event.ctrlKey && event.shiftKey && event.key === 'I') || 
       (event.ctrlKey && event.key === 'u')) {
        event.preventDefault();
        sendAlert("กดปุ่มลัดเพื่อดูโค้ดหรอไอ่สัส (F12 / Ctrl+U)");
    }
});



