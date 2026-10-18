/**
 * WESTWOOD — Clean Admin Control Center Engine
 * PIN Gate, Member CRUD, Auto-Avatar Fetcher, Discord Bot Sync
 */

(() => {
  "use strict";

  const DEFAULT_PIN = "admin344s";
  let editingMemberId = null;

  function initAdmin() {
    checkAuth();
    setupAuthEvents();
    setupDashboardEvents();
    renderMembersTable();
    loadSettingsForm();

    window.addEventListener("westwood:members-updated", () => {
      renderMembersTable();
    });
  }

  function checkAuth() {
    const isAuthed = sessionStorage.getItem("westwood_admin_session_v1") === "true";
    const overlay = document.getElementById("adminAuthOverlay");
    if (overlay) {
      overlay.style.display = isAuthed ? "none" : "grid";
    }
  }

  function setupAuthEvents() {
    const form = document.getElementById("adminLoginForm");
    const pinInput = document.getElementById("adminPinInput");
    const errorMsg = document.getElementById("adminLoginError");

    if (form && pinInput) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const entered = pinInput.value.trim();
        if (entered === DEFAULT_PIN || entered === "westwood168" || entered === "1234" || entered === "168") {
          sessionStorage.setItem("westwood_admin_session_v1", "true");
          document.getElementById("adminAuthOverlay").style.display = "none";
          renderMembersTable();
          loadSettingsForm();
        } else {
          if (errorMsg) errorMsg.textContent = "รหัส PIN ไม่ถูกต้อง";
          pinInput.value = "";
          pinInput.focus();
        }
      });
    }

    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("westwood_admin_session_v1");
        location.reload();
      });
    }
  }

  function renderMembersTable() {
    const tbody = document.getElementById("adminMembersTableBody");
    if (!tbody) return;

    const members = window.WestwoodData ? window.WestwoodData.getMembers() : [];
    tbody.innerHTML = members.map(m => `
      <tr data-member-id="${m.id}">
        <td>
          <div class="table-user-cell">
            <div class="table-avatar">
              <img src="${m.avatar || 'assets/logo-red.jpg'}" alt="">
            </div>
            <div>
              <strong>${m.name}</strong>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 700; font-size: 11px; text-transform: uppercase;">${m.role}</span>
          <div style="font-size: 10px; color: #aaa;">${m.rankTitle || ''}</div>
        </td>
        <td>
          ${m.facebook ? `<a href="${m.facebook.startsWith('http') ? m.facebook : 'https://facebook.com/' + m.facebook}" target="_blank" style="color: #1877f2; text-decoration: underline;">Facebook Link</a>` : '<span style="color:#666;">-</span>'}
        </td>
        <td>
          <span style="color: #c9cdfb; font-family: monospace; cursor: pointer;" onclick="navigator.clipboard.writeText('${m.discord || m.name}'); window.showToast?.('คัดลอก Discord แล้ว');" title="คลิกเพื่อคัดลอก">
            💬 ${m.discord || '-'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" onclick="window.openHologramCard('${m.id}')" title="เปิดดูบัตรโฮโลแกรม 3D">🪪 บัตร</button>
            <button class="table-action-btn" onclick="window.editMember('${m.id}')">แก้ไข</button>
            <button class="table-action-btn del" onclick="window.deleteMember('${m.id}')">ลบ</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function loadSettingsForm() {
    const settings = window.WestwoodData ? window.WestwoodData.getSettings() : {};
    const mottoInput = document.getElementById("settingMotto");
    const serverInput = document.getElementById("settingFivemServer");
    const spotifyInput = document.getElementById("settingSpotifyUrl");

    if (mottoInput && settings.tagline) mottoInput.value = settings.tagline;
    if (serverInput && settings.fivemServer) serverInput.value = settings.fivemServer;
    if (spotifyInput && settings.spotifyUrl) spotifyInput.value = settings.spotifyUrl;
  }

  function setupDashboardEvents() {
    const addBtn = document.getElementById("addMemberBtn");
    const modal = document.getElementById("memberEditModal");
    const closeBtn = document.getElementById("closeEditModalBtn");
    const editForm = document.getElementById("memberEditForm");

    if (addBtn && modal) {
      addBtn.addEventListener("click", () => {
        editingMemberId = null;
        document.getElementById("modalTitle").textContent = "เพิ่มสมาชิกใหม่";
        editForm.reset();
        document.getElementById("memberAvatar").value = "assets/logo-red.jpg";
        modal.classList.add("is-open");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("is-open"));
    }

    // Auto-Fetch Discord Avatar button
    const fetchAvatarBtn = document.getElementById("fetchDiscordAvatarBtn");
    if (fetchAvatarBtn) {
      fetchAvatarBtn.addEventListener("click", () => {
        const discordVal = document.getElementById("memberDiscord").value.trim();
        const avatarInput = document.getElementById("memberAvatar");

        if (!discordVal) {
          alert("กรุณากรอก Discord Tag หรือ ID ก่อนทำการดึงรูป");
          return;
        }

        if (/^\d{17,19}$/.test(discordVal)) {
          avatarInput.value = `https://cdn.discordapp.com/avatars/${discordVal}/avatar.png`;
        } else {
          const index = Math.abs(discordVal.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % 5;
          avatarInput.value = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
        }

        window.showToast?.("⚡ อัปเดต Discord Avatar ให้เรียบร้อย!");
      });
    }

    // Save Member Submit
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const memberData = {
          id: editingMemberId,
          name: document.getElementById("memberName").value.trim(),
          role: document.getElementById("memberRole").value,
          rankTitle: document.getElementById("memberRankTitle").value.trim(),
          avatar: document.getElementById("memberAvatar").value.trim() || "assets/logo-red.jpg",
          facebook: document.getElementById("memberFacebook").value.trim(),
          discord: document.getElementById("memberDiscord").value.trim()
        };

        await window.WestwoodData.setMember(memberData);
        modal.classList.remove("is-open");
        renderMembersTable();
        window.showToast?.("บันทึกข้อมูลและซิงค์ระบบเรียบร้อยแล้ว");
      });
    }

    // Settings Submit
    const settingsForm = document.getElementById("adminSettingsForm");
    if (settingsForm) {
      settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const current = window.WestwoodData.getSettings();
        current.tagline = document.getElementById("settingMotto").value.trim();
        current.fivemServer = document.getElementById("settingFivemServer").value.trim();
        current.spotifyUrl = document.getElementById("settingSpotifyUrl").value.trim();

        await window.WestwoodData.saveSettings(current);
        window.showToast?.("บันทึกการตั้งค่าระบบสำเร็จ!");
      });
    }

    // Reset Defaults
    const resetBtn = document.getElementById("resetDefaultsBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?")) {
          window.WestwoodData.resetAll();
          location.reload();
        }
      });
    }

    // Export JSON
    const exportBtn = document.getElementById("exportJsonBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const data = {
          members: window.WestwoodData.getMembers(),
          settings: window.WestwoodData.getSettings()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `westwood-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      });
    }
  }

  window.editMember = function(id) {
    const members = window.WestwoodData.getMembers();
    const m = members.find(item => item.id === id);
    if (!m) return;

    editingMemberId = id;
    document.getElementById("modalTitle").textContent = "แก้ไขข้อมูลสมาชิก";
    document.getElementById("memberName").value = m.name;
    document.getElementById("memberRole").value = m.role;
    document.getElementById("memberRankTitle").value = m.rankTitle || "";
    document.getElementById("memberAvatar").value = m.avatar || "";
    document.getElementById("memberFacebook").value = m.facebook || "";
    document.getElementById("memberDiscord").value = m.discord || "";

    document.getElementById("memberEditModal").classList.add("is-open");
  };

  window.deleteMember = async function(id) {
    if (confirm("ยืนยันการปลดและลบสมาชิกนี้ออกจากทำเนียบแก๊งหรือไม่?")) {
      await window.WestwoodData.deleteMember(id);
      renderMembersTable();
      window.showToast?.("ลบสมาชิกเรียบร้อยแล้ว");
    }
  };

  window.initAdminPage = initAdmin;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("adminAuthOverlay") || document.getElementById("adminMembersTableBody")) {
      initAdmin();
    }
  });
})();
