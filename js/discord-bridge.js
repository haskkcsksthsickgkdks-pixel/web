/**
 * WESTWOOD SYNDICATE — Discord Bridge Engine & 3D Holographic Card
 * Real-Time Telemetry Toast, 3D Gyro Card, and Discord Bot Live Sync Listener
 */

(() => {
  "use strict";

  // 1. Synthesized Futuristic Audio FX (Web Audio API)
  let audioCtx = null;
  function playCommChirp() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();

      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {}
  }

  // 2. DOM Mount & Setup (Toast + 3D Hologram Card Only)
  function initDiscordBridgeDOM() {
    if (document.getElementById("discordBridgeMount")) return;

    const mount = document.createElement("div");
    mount.id = "discordBridgeMount";
    mount.innerHTML = `
      <!-- A. SATELLITE COMM TOAST NOTIFICATION (When Discord Bot updates member) -->
      <div class="discord-comm-toast" id="discordCommToast" aria-live="polite">
        <div class="toast-header">
          <div class="toast-badge">
            <span class="pulse-dot"></span>
            <span>DISCORD BOT COMM-LINK</span>
          </div>
          <span id="toastTime">NOW</span>
        </div>
        <div class="toast-body">
          <div class="toast-avatar">
            <img id="toastAvatarImg" src="assets/logo-red.jpg" alt="Avatar">
          </div>
          <div class="toast-details">
            <h4 id="toastTitle">MEMBER DATA RECEIVED</h4>
            <p id="toastMessage">อัปเดตข้อมูลสมาชิกผ่านบอทดิสคอร์ด</p>
          </div>
        </div>
        <div class="toast-footer">
          <span>SOURCE: DISCORD-BOT</span>
          <span style="color: #00d2d3;">SYNCED 100%</span>
        </div>
      </div>

      <!-- B. 3D GYROSCOPIC HOLOGRAPHIC SYNDICATE ID CARD MODAL -->
      <div class="modal-backdrop" id="hologramCardModal">
        <div class="modal-card" style="width: min(500px, 94vw); background: transparent; border: none; box-shadow: none;">
          <button class="modal-close-btn" id="holoCloseBtn" style="top: 0; right: 0; z-index: 10;">✕</button>

          <div class="holo-stage">
            <div class="holo-card" id="holoCardElement">
              <div class="holo-sheen" id="holoSheen"></div>
              <div class="holo-inner">
                <div class="holo-top">
                  <div class="holo-brand">
                    <span>WESTWOOD</span>
                    <span style="font-size: 10px; color: var(--accent); font-family: monospace;">SYNDICATE</span>
                  </div>
                  <div class="holo-chip"></div>
                </div>

                <div class="holo-middle">
                  <div class="holo-avatar-frame">
                    <img id="holoAvatar" src="assets/logo-red.jpg" alt="Agent">
                  </div>
                  <div class="holo-info">
                    <div class="holo-role-badge" id="holoRole">LEADER</div>
                    <h3 id="holoName">Alexander 'Viper' Cross</h3>
                    <div style="font-size: 13px; color: #ddd; font-weight: 600; margin-top: 2px;" id="holoRankSubtitle">UNDERBOSS</div>
                    <div style="font-size: 10px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">HOUSE OF WESTWOOD</div>
                  </div>
                </div>

                <div class="holo-bottom">
                  <!-- Facebook Inside Card -->
                  <a class="holo-facebook-tag" id="holoCardFbBtn" href="javascript:void(0)" target="_blank" title="เปิด Facebook Profile">
                    <span>🌐</span>
                    <span id="holoCardFbText">Facebook</span>
                  </a>

                  <!-- Discord Inside Card -->
                  <div class="holo-discord-tag" id="holoDiscordBtn" title="คลิกเพื่อคัดลอก Discord">
                    <span>💬</span>
                    <span id="holoDiscordTag">viper.cross#168</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons Row -->
          <div class="holo-modal-actions">
            <button class="holo-action-btn fb" id="holoModalFbBtn" type="button">
              <span style="color: #4da6ff;">🌐</span> <span id="holoModalFbText">เปิดดู Facebook Profile</span>
            </button>
            <button class="holo-action-btn dc" id="holoModalDcBtn" type="button">
              <span style="color: #c9cdfb;">💬</span> <span id="holoModalDcText">คัดลอก Discord</span>
            </button>
          </div>

          <div style="text-align: center; margin-top: 14px; color: #777; font-size: 11px;">
            💡 เลื่อนเมาส์ไปมาเพื่อสัมผัสเอฟเฟกต์โฮโลแกรม 3 มิติ (3D Holographic Tilt Sheen)
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(mount);
    setupDiscordBridgeEvents();
  }

  // 3. Toast Notification Trigger
  let toastTimer = null;
  window.showDiscordCommToast = function(title, message, avatarUrl = "assets/logo-red.jpg") {
    const toast = document.getElementById("discordCommToast");
    if (!toast) return;

    playCommChirp();

    document.getElementById("toastTitle").textContent = title;
    document.getElementById("toastMessage").textContent = message;
    document.getElementById("toastAvatarImg").src = avatarUrl || "assets/logo-red.jpg";
    document.getElementById("toastTime").textContent = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    toast.classList.add("is-active");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-active");
    }, 6000);
  };

  // 4. Open 3D Tilt Hologram Card
  window.openHologramCard = function(memberId) {
    const members = window.WestwoodData ? window.WestwoodData.getMembers() : [];
    const m = members.find(item => item.id === memberId) || members[0];
    if (!m) return;

    const modal = document.getElementById("hologramCardModal");
    if (!modal) return;

    document.getElementById("holoAvatar").src = m.avatar || "assets/logo-red.jpg";
    document.getElementById("holoName").textContent = m.name;
    document.getElementById("holoRole").textContent = m.role.toUpperCase();
    document.getElementById("holoRankSubtitle").textContent = m.rankTitle || m.role.toUpperCase();
    document.getElementById("holoDiscordTag").textContent = m.discord || m.name;

    const roleColors = {
      owner: "#ff3344",
      core: "#ff884d",
      bigsupport: "#4da6ff",
      member: "#aaa69d"
    };
    const accent = roleColors[m.role] || "#e50914";
    document.getElementById("holoRole").style.background = accent;

    // Facebook Link setup (inside card & bottom button)
    const cardFbBtn = document.getElementById("holoCardFbBtn");
    const modalFbBtn = document.getElementById("holoModalFbBtn");
    const fbAction = (e) => {
      e?.preventDefault?.();
      if (m.facebook && m.facebook.startsWith("http")) {
        window.open(m.facebook, "_blank");
      } else if (m.facebook) {
        window.open(`https://facebook.com/${m.facebook}`, "_blank");
      } else {
        window.showToast?.("สมาชิกคนนี้ไม่มีข้อมูล Facebook");
      }
    };
    if (cardFbBtn) cardFbBtn.onclick = fbAction;
    if (modalFbBtn) modalFbBtn.onclick = fbAction;

    // Discord Copy setup (inside card & bottom button)
    const cardDcBtn = document.getElementById("holoDiscordBtn");
    const modalDcBtn = document.getElementById("holoModalDcBtn");
    const modalDcText = document.getElementById("holoModalDcText");
    if (modalDcText) {
      modalDcText.textContent = m.discord ? `Discord: ${m.discord}` : "Discord";
    }

    const dcAction = () => {
      navigator.clipboard.writeText(m.discord || m.name).then(() => {
        window.showToast?.(`คัดลอก Discord: ${m.discord || m.name}`);
      });
    };
    if (cardDcBtn) cardDcBtn.onclick = dcAction;
    if (modalDcBtn) modalDcBtn.onclick = dcAction;

    modal.classList.add("is-open");
  };

  // 5. 3D Tilt Card Gyro Interaction
  function setupHoloTilt() {
    const card = document.getElementById("holoCardElement");
    const sheen = document.getElementById("holoSheen");
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -16;
      const rotateY = ((x - centerX) / centerX) * 16;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`;

      const sheenX = ((x / rect.width) * 100) - 50;
      const sheenY = ((y / rect.height) * 100) - 50;
      if (sheen) {
        sheen.style.transform = `translate(${sheenX}%, ${sheenY}%)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (sheen) {
        sheen.style.transform = "translate(-30%, -30%)";
      }
    });
  }

  // 6. Event Listeners Setup
  function setupDiscordBridgeEvents() {
    setupHoloTilt();

    const holoCloseBtn = document.getElementById("holoCloseBtn");
    const holoModal = document.getElementById("hologramCardModal");
    if (holoCloseBtn && holoModal) {
      holoCloseBtn.onclick = () => holoModal.classList.remove("is-open");
      holoModal.onclick = (e) => { if (e.target === holoModal) holoModal.classList.remove("is-open"); };
    }

    // Listen to real-time events from Discord Bot via SSE
    window.addEventListener("westwood:discord-intel", (e) => {
      const data = e.detail;
      const m = data.member;
      if (!m) return;

      const title = data.type === "setmember" ? "DISCORD BOT SYNC" : "DISCORD BOT REMOVE";
      const actionText = data.type === "setmember" ? "อัปเดตสมาชิกผ่านบอท Discord" : "ปลดสมาชิกผ่านบอท Discord";

      window.showDiscordCommToast(
        title,
        `${m.name} [${m.rankTitle || m.role.toUpperCase()}] ${actionText}`,
        m.avatar
      );

      const memberCard = document.querySelector(`[data-member-id="${m.id}"]`);
      if (memberCard) {
        memberCard.classList.add("member-just-updated");
        setTimeout(() => memberCard.classList.remove("member-just-updated"), 3000);
      }
    });
  }

  // Init on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiscordBridgeDOM);
  } else {
    initDiscordBridgeDOM();
  }
})();
