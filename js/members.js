/**
 * WESTWOOD — Clean Members Roster Engine
 * Inspired by Tataros 168 (With Facebook & Discord, No Status)
 */

(() => {
  "use strict";

  let activeFilter = "all";
  let searchQuery = "";

  function getMembers() {
    return window.WestwoodData ? window.WestwoodData.getMembers() : [];
  }

  function initMembers() {
    setupFilterEvents();
    setupSearchEvents();
    setupModalEvents();
    renderAll();

    window.addEventListener("westwood:members-updated", () => {
      renderAll();
    });
  }

  function setupFilterEvents() {
    const filterBtns = document.querySelectorAll(".filter");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-filter") || "all";
        renderAll();
      });
    });
  }

  function setupSearchEvents() {
    const searchInput = document.getElementById("memberSearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderAll();
    });
  }

  function setupModalEvents() {
    const closeBtn = document.getElementById("profileCloseBtn");
    const modal = document.getElementById("memberProfileModal");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("is-open"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("is-open");
      });
    }
  }

  window.openMemberProfile = function(id) {
    if (window.openHologramCard) {
      window.openHologramCard(id);
      return;
    }

    const members = getMembers();
    const m = members.find(item => item.id === id) || members[0];
    if (!m) return;

    const modal = document.getElementById("memberProfileModal");
    if (modal) modal.classList.add("is-open");
  };

  function renderAll() {
    const allMembers = getMembers();

    updateCounters(allMembers);

    const filtered = allMembers.filter(m => {
      const matchRole = activeFilter === "all" || m.role === activeFilter;
      const matchSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery) ||
        (m.rankTitle && m.rankTitle.toLowerCase().includes(searchQuery));
      return matchRole && matchSearch;
    });

    renderOwnerBlock(filtered.filter(m => m.role === "owner"));
    renderCoreBlock(filtered.filter(m => m.role === "core"));
    renderSupportBlock(filtered.filter(m => m.role === "bigsupport"));
    renderMembersBlock(filtered.filter(m => m.role === "member"));
  }

  function updateCounters(members) {
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2, "0");
    };

    setTxt("memberCount", members.length);
    setTxt("ownerCount", members.filter(m => m.role === "owner").length);
    setTxt("coreCount", members.filter(m => m.role === "core").length);
    setTxt("supportCount", members.filter(m => m.role === "bigsupport").length);
    setTxt("memberOnlyCount", members.filter(m => m.role === "member").length);
  }

  function renderOwnerBlock(owners) {
    const block = document.getElementById("ownerBlock");
    const container = document.getElementById("ownerList");
    if (!block || !container) return;

    if (owners.length === 0) {
      block.classList.add("hide-section");
      container.innerHTML = "";
      return;
    }

    block.classList.remove("hide-section");
    container.innerHTML = owners.map(m => `
      <div class="featured-card" data-member-id="${m.id}" onclick="window.openMemberProfile('${m.id}')" title="คลิกเพื่อดูโปรไฟล์">
        <div class="featured-portrait">
          <img src="${m.avatar || 'assets/logo-gold.jpg'}" alt="${m.name}">
        </div>
        <div class="featured-content">
          <div class="card-role-pill">
            <span>${m.rankTitle || 'OWNER'}</span>
          </div>
          <h2>${m.name}</h2>
        </div>
      </div>
    `).join("");
  }

  function renderCoreBlock(cores) {
    const block = document.getElementById("coreBlock");
    const container = document.getElementById("coreList");
    if (!block || !container) return;

    if (cores.length === 0) {
      block.classList.add("hide-section");
      container.innerHTML = "";
      return;
    }

    block.classList.remove("hide-section");
    container.innerHTML = cores.map(m => createCleanCardHTML(m, "rank-core")).join("");
  }

  function renderSupportBlock(supports) {
    const block = document.getElementById("supportBlock");
    const container = document.getElementById("supportList");
    if (!block || !container) return;

    if (supports.length === 0) {
      block.classList.add("hide-section");
      container.innerHTML = "";
      return;
    }

    block.classList.remove("hide-section");
    container.innerHTML = supports.map(m => createCleanCardHTML(m, "rank-support")).join("");
  }

  function renderMembersBlock(members) {
    const block = document.getElementById("memberBlock");
    const container = document.getElementById("memberList");
    if (!block || !container) return;

    if (members.length === 0) {
      block.classList.add("hide-section");
      container.innerHTML = "";
      return;
    }

    block.classList.remove("hide-section");
    container.innerHTML = members.map(m => createCleanCardHTML(m, "rank-members")).join("");
  }

  // Ultra-clean card HTML without any status or extra stats
  function createCleanCardHTML(m, rankClass) {
    return `
      <div class="member-card ${rankClass}" data-member-id="${m.id}" onclick="window.openMemberProfile('${m.id}')" title="คลิกเพื่อดูโปรไฟล์">
        <div class="member-card-top">
          <div class="member-avatar">
            <img src="${m.avatar || 'assets/logo-red.jpg'}" alt="${m.name}">
          </div>
          <div class="member-headings">
            <h3>${m.name}</h3>
            <span>${m.rankTitle || m.role.toUpperCase()}</span>
          </div>
        </div>
      </div>
    `;
  }

  window.initMembersPage = initMembers;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".members-main") || document.getElementById("memberSearch")) {
      initMembers();
    }
  });
})();
