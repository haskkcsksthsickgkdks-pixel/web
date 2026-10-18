/**
 * WESTWOOD SYNDICATE — Advanced Gang Systems
 * 1. Classified Personnel Dossier Modal
 * 2. Westwood Cyber Terminal (CLI Hacker Console)
 * 3. Territory & Turf Radar HUD
 * 4. Stash & Black Market Vault Ledger
 */

(() => {
  "use strict";

  // Build Modals Containers on DOM Ready
  function initSystemsDOM() {
    if (document.getElementById("dossierModal")) return;

    const modalMount = document.createElement("div");
    modalMount.id = "systemsModalsMount";
    modalMount.innerHTML = `
      <!-- 1. CLASSIFIED PERSONNEL DOSSIER MODAL -->
      <div class="modal-backdrop" id="dossierModal">
        <div class="modal-card">
          <button class="modal-close-btn" id="dossierCloseBtn" aria-label="ปิด">✕</button>
          <div class="dossier-watermark">// CLASSIFIED DOSSIER — WESTWOOD HIGH COMMAND</div>
          
          <div class="dossier-header">
            <div class="dossier-avatar">
              <img id="dossierImg" src="assets/logo-red.jpg" alt="Dossier Avatar">
            </div>
            <div class="dossier-info">
              <h2 id="dossierName">Kaiser Westwood</h2>
              <div class="dossier-rank" id="dossierRank">GANG FOUNDER</div>
              <div class="dossier-cid" id="dossierCid">CITIZEN ID: #WW-001</div>
            </div>
          </div>

          <div class="dossier-grid">
            <div class="dossier-tile">
              <span>อาวุธประจำกาย</span>
              <strong id="dossierWeapon">Double-Action Revolver</strong>
            </div>
            <div class="dossier-tile">
              <span>KILL / DEATH RATIO</span>
              <strong id="dossierKd" style="color: #4cd137;">5.8 K/D</strong>
            </div>
            <div class="dossier-tile">
              <span>ระดับความชำนาญการรบ</span>
              <strong id="dossierCombat">99% [ELITE]</strong>
            </div>
            <div class="dossier-tile">
              <span>สถานะในเมือง</span>
              <strong id="dossierStatus" style="color: #00d2d3;">ONLINE - IN CITY</strong>
            </div>
          </div>

          <div class="dossier-bio" id="dossierBio">
            ประวัติและข้อมูลลับของสมาชิกในแก๊ง
          </div>

          <div class="dossier-actions">
            <button class="primary-button" id="dossierCopyDiscordBtn" style="min-height: 44px; padding: 0 16px; font-size: 13px;">
              <span>💬</span> <span id="dossierDiscordText">คัดลอก Discord ID</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. CYBER TERMINAL CLI MODAL -->
      <div class="modal-backdrop" id="terminalModal">
        <div class="modal-card terminal-card">
          <div class="terminal-bar">
            <div class="terminal-dots">
              <div class="terminal-dot dot-red"></div>
              <div class="terminal-dot dot-yellow"></div>
              <div class="terminal-dot dot-green"></div>
            </div>
            <div>WESTWOOD_CYBER_TERMINAL_v2.4 [SECURE SHELL]</div>
            <button class="modal-close-btn" id="terminalCloseBtn" style="position: static; width: 28px; height: 28px; font-size: 11px;">✕</button>
          </div>
          <div class="terminal-output" id="terminalOutput">
            <div>[SYSTEM] WESTWOOD SYNDICATE HIGH FREQUENCY MAINFRAME LOADED.</div>
            <div>[SYSTEM] TYPE '<span style="color: #fff; font-weight: bold;">help</span>' FOR LIST OF AUTHORIZED SYNDICATE PROTOCOLS.</div>
            <div>--------------------------------------------------</div>
          </div>
          <div class="terminal-input-row">
            <span class="terminal-prompt">root@westwood:~$</span>
            <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false" placeholder="พิมพ์คำสั่ง เช่น help, turf, vault, anthem...">
          </div>
        </div>
      </div>

      <!-- 3. TERRITORY & TURF RADAR MODAL -->
      <div class="modal-backdrop" id="turfModal">
        <div class="modal-card">
          <button class="modal-close-btn" id="turfCloseBtn" aria-label="ปิด">✕</button>
          <div class="dossier-watermark">// TACTICAL RADAR — LOS SANTOS TURF CONTROL</div>
          
          <h2 style="font-family: 'Cinzel', serif; font-size: 26px; color: #fff; margin-top: 14px; margin-bottom: 6px;">
            เขตอิทธิพล & พื้นที่สงครามแก๊ง
          </h2>
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 24px;">
            ระบบตรวจจับสัญญาณดาวเทียมและการครอบครองจุดยุทธศาสตร์ของ Westwood
          </p>

          <div style="display: grid; gap: 16px; margin-bottom: 24px;">
            <div class="dossier-tile" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; font-size: 16px;">📍 Mirror Park [HQ Safehouse]</strong>
                <span style="margin-top: 4px; color: #4cd137;">ความปลอดภัย: 100% • ฐานทัพบัญชาการสูงสุด</span>
              </div>
              <span style="padding: 4px 10px; border-radius: 999px; background: rgba(76, 209, 55, 0.15); color: #4cd137; font-weight: bold; font-size: 11px;">CONTROLLED</span>
            </div>

            <div class="dossier-tile" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; font-size: 16px;">📍 Legion Square [Main Warzone]</strong>
                <span style="margin-top: 4px; color: #ff9f43;">การคุมพื้นที่: 85% • จุดปะทะชิงค่าหัวประจำสัปดาห์</span>
              </div>
              <span style="padding: 4px 10px; border-radius: 999px; background: rgba(255, 159, 67, 0.15); color: #ff9f43; font-weight: bold; font-size: 11px;">CONTESTED</span>
            </div>

            <div class="dossier-tile" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; font-size: 16px;">📍 Sandy Shores Airfield [Smuggling Route]</strong>
                <span style="margin-top: 4px; color: #4cd137;">ความปลอดภัย: 94% • เส้นทางลำเลียงอาวุธสงครามทางอากาศ</span>
              </div>
              <span style="padding: 4px 10px; border-radius: 999px; background: rgba(76, 209, 55, 0.15); color: #4cd137; font-weight: bold; font-size: 11px;">SECURED</span>
            </div>

            <div class="dossier-tile" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; font-size: 16px;">📍 Port of South LS [Docks Depot]</strong>
                <span style="margin-top: 4px; color: #00d2d3;">การควบคุม: 90% • คลังสินค้าและตู้คอนเทนเนอร์ลับ</span>
              </div>
              <span style="padding: 4px 10px; border-radius: 999px; background: rgba(0, 210, 211, 0.15); color: #00d2d3; font-weight: bold; font-size: 11px;">DOMINATING</span>
            </div>
          </div>

          <div style="padding: 16px; border-radius: 14px; background: rgba(229, 9, 20, 0.08); border: 1px solid var(--border-color); font-size: 12.5px; color: #e0d9cf;">
            ⚡ <strong>สถานะศึกสงครามแก๊ง:</strong> ชนะศึกต่อเนื่อง 48 แมตช์ • สถิติไร้พ่ายในเขตเมืองชั้นใน
          </div>
        </div>
      </div>

      <!-- 4. GANG VAULT & STASH MODAL -->
      <div class="modal-backdrop" id="vaultModal">
        <div class="modal-card">
          <button class="modal-close-btn" id="vaultCloseBtn" aria-label="ปิด">✕</button>
          <div class="dossier-watermark">// BLACK MARKET LEDGER — WESTWOOD VAULT</div>
          
          <h2 style="font-family: 'Cinzel', serif; font-size: 26px; color: #fff; margin-top: 14px; margin-bottom: 6px;">
            ระบบคลังและทรัพย์สินแก๊ง
          </h2>
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 24px;">
            บัญชีงบประมาณ อาวุธหนัก และเสบียงสงครามประจำเซิร์ฟเวอร์
          </p>

          <div class="dossier-grid">
            <div class="dossier-tile">
              <span>เงินดำในคลังลับ (DIRTY CASH)</span>
              <strong style="color: #ff4d52; font-size: 22px; font-family: 'Courier New', monospace;">$14,850,000</strong>
            </div>
            <div class="dossier-tile">
              <span>เงินขาวสำรอง (CLEAN ASSETS)</span>
              <strong style="color: #4cd137; font-size: 22px; font-family: 'Courier New', monospace;">$5,200,000</strong>
            </div>
            <div class="dossier-tile">
              <span>อาวุธสงครามพร้อมรบ (ARSENAL)</span>
              <strong style="color: #fff; font-size: 22px;">342 กระบอก</strong>
            </div>
            <div class="dossier-tile">
              <span>เสื้อเกราะหนาพิเศษ (KEVLAR)</span>
              <strong style="color: #00d2d3; font-size: 22px;">1,280 ตัว</strong>
            </div>
          </div>

          <div class="dossier-tile" style="margin-bottom: 20px;">
            <span style="margin-bottom: 8px;">บันทึกการโจรกรรมล่าสุด (HEIST LOGS)</span>
            <div style="font-family: 'Courier New', monospace; font-size: 11.5px; line-height: 1.8; color: #a9a295;">
              <div>[21:40] สำเร็จ: ปล้นธนาคาร Paleto Bay +$2,400,000 (No Casualties)</div>
              <div>[19:15] สำเร็จ: บุกชิงตู้คอนเทนเนอร์อาวุธท่าเรือ +40 Combat Rifles</div>
              <div>[16:00] อัปเดต: สั่งซื้อกระสุนและเกราะล็อตใหญ่เข้าคลัง Mirror Park</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalMount);
    setupSystemsEvents();
  }

  function setupSystemsEvents() {
    // Close on buttons
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("is-open"));
      });
    });

    // Close on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.remove("is-open");
      });
    });

    // Setup Cyber Terminal CLI
    setupTerminal();
  }

  // Open Dossier Modal with Member data
  window.openMemberDossier = function(memberId) {
    initSystemsDOM();
    const members = window.WestwoodData ? window.WestwoodData.getMembers() : [];
    const member = members.find(m => m.id === memberId) || members[0];
    if (!member) return;

    document.getElementById("dossierImg").src = member.avatar || "assets/logo-red.jpg";
    document.getElementById("dossierName").textContent = member.name;
    document.getElementById("dossierRank").textContent = member.rankTitle || member.role.toUpperCase();
    document.getElementById("dossierCid").textContent = `CITIZEN ID: #${member.citizenId}`;
    document.getElementById("dossierWeapon").textContent = member.weapon || "Combat Pistol";
    document.getElementById("dossierKd").textContent = `${member.kd || '3.5'} K/D`;
    document.getElementById("dossierCombat").textContent = `${member.combatRating || 90}% [COMBAT READY]`;
    document.getElementById("dossierStatus").textContent = member.status || "ONLINE";
    document.getElementById("dossierBio").textContent = member.bio || "สมาชิกแก๊ง Westwood ผู้ภักดี";

    const copyBtn = document.getElementById("dossierCopyDiscordBtn");
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(member.discord || member.name).then(() => {
        window.showToast?.("คัดลอก Discord: " + member.discord);
      });
    };

    document.getElementById("dossierModal").classList.add("is-open");
  };

  // Open Terminal
  window.openTerminal = function() {
    initSystemsDOM();
    document.getElementById("terminalModal").classList.add("is-open");
    setTimeout(() => document.getElementById("terminalInput").focus(), 150);
  };

  // Open Turf
  window.openTurfModal = function() {
    initSystemsDOM();
    document.getElementById("turfModal").classList.add("is-open");
  };

  // Open Vault
  window.openVaultModal = function() {
    initSystemsDOM();
    document.getElementById("vaultModal").classList.add("is-open");
  };

  // CLI Engine
  function setupTerminal() {
    const input = document.getElementById("terminalInput");
    const output = document.getElementById("terminalOutput");
    if (!input || !output) return;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = input.value.trim().toLowerCase();
        input.value = "";
        executeCommand(val);
      }
    });

    function print(text, color = "#a8e6cf") {
      const line = document.createElement("div");
      line.style.color = color;
      line.innerHTML = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    function executeCommand(cmd) {
      print(`<span style="color: #4cd137;">root@westwood:~$</span> ${cmd}`);

      switch (cmd) {
        case "help":
          print("คำสั่งที่สามารถใช้งานได้:", "#fff");
          print("  <b style='color:#ff4d52;'>help</b>        - แสดงรายการคำสั่งทั้งหมด");
          print("  <b style='color:#ff4d52;'>info</b>        - ดูข้อมูลและคำขวัญของแก๊ง Westwood");
          print("  <b style='color:#ff4d52;'>ranks</b>       - ดูสายการบังคับบัญชา (Ranks Hierarchy)");
          print("  <b style='color:#ff4d52;'>anthem</b>      - เปิด/ควบคุมเพลงประจำแก๊ง (Starboy - The Weeknd)");
          print("  <b style='color:#ff4d52;'>turf</b>        - เปิดจอเรดาร์ยึดครองพื้นที่ Los Santos");
          print("  <b style='color:#ff4d52;'>vault</b>       - ตรวจสอบคลังเงินดำและสรรพาวุธแก๊ง");
          print("  <b style='color:#ff4d52;'>theme</b>       - สลับธีม Crimson Metal / Sovereign Gold");
          print("  <b style='color:#ff4d52;'>rules</b>       - ดูกฎเหล็กและข้อห้ามของ Westwood");
          print("  <b style='color:#ff4d52;'>clear</b>       - ล้างหน้าจอเทอร์มินัล");
          print("  <b style='color:#ff4d52;'>exit</b>        - ปิดเทอร์มินัล");
          break;

        case "info":
          print("== WESTWOOD SYNDICATE ==", "#fff");
          print("ฉายา: THE KINGS OF LOS SANTOS");
          print("คำขวัญ: RESPECT ALL • FEAR NONE");
          print("มอตโต: BLOOD IN, BLOOD OUT — DOMINATING LOS SANTOS UNDER ONE SYMBOL");
          print("เพลงประจำแก๊ง: Starboy (feat. Daft Punk) by The Weeknd");
          break;

        case "ranks":
          print("== สายการบังคับบัญชา (RANK HIERARCHY) ==", "#fff");
          print("1. [OWNER]        GANG FOUNDER / DON WESTWOOD");
          print("2. [UNDERBOSS]    CO-LEADER / CHIEF OF WAR & INTEL");
          print("3. [BIGSUPPORT]   CAPTAINS / ARMS & LOGISTICS");
          print("4. [ENFORCERS]    SENIOR OPERATIVES & HEIST SPECIALISTS");
          print("5. [MEMBERS]      VANGUARD SHOOTERS & INITIATES");
          break;

        case "anthem":
        case "starboy":
          print("กำลังสั่งการเครื่องเล่นเพลง Starboy โดย The Weeknd...", "#fff");
          if (window.WestwoodPlayer) {
            window.WestwoodPlayer.play();
            print("▶ กำลังเล่น: The Weeknd - Starboy (ft. Daft Punk)", "#4cd137");
          }
          break;

        case "turf":
          print("กำลังเปิดเรดาร์เขตอิทธิพล Los Santos...", "#fff");
          window.openTurfModal();
          break;

        case "vault":
          print("กำลังเชื่อมต่อคลังลับ Black Market Vault...", "#fff");
          window.openVaultModal();
          break;

        case "theme":
          const current = window.WestwoodData.getTheme();
          const next = current === "crimson" ? "gold" : "crimson";
          window.WestwoodData.setTheme(next);
          print(`เปลี่ยนธีมสำเร็จเป็น: ${next.toUpperCase()}`, "#d4af37");
          break;

        case "rules":
          print("== กฎเหล็กแก๊ง WESTWOOD ==", "#ff4d52");
          print("1. ห้ามทรยศหรือขายข้อมูลพี่น้องในแก๊งเด็ดขาด (โทษขับไล่และขึ้นบัญชีดำ)");
          print("2. ปฏิบัติตามคำสั่งของบอสและหัวหน้าทีมอย่างเคร่งครัดในสมรภูมิรบ");
          print("3. ทุกคนต้องเข้าซ้อมยิงและชิงพื้นที่ตามเวลานัดหมาย");
          print("4. รักษาเกียรติและศักดิ์ศรีของชื่อเสียง Westwood ในทุกเมือง FiveM");
          break;

        case "clear":
          output.innerHTML = "";
          break;

        case "exit":
          document.getElementById("terminalModal").classList.remove("is-open");
          break;

        default:
          if (cmd) {
            print(`คำสั่ง '${cmd}' ไม่ถูกต้อง. พิมพ์ '<span style="color:#fff;">help</span>' เพื่อดูคำสั่งทั้งหมด`, "#ff5252");
          }
          break;
      }
    }
  }

  // Initialize on DOM Ready
  document.addEventListener("DOMContentLoaded", initSystemsDOM);
})();
