/**
 * WESTWOOD — Central Data Store & Real-Time Discord Bot Synchronization
 * FiveM Private Community
 */

const DEFAULT_MEMBERS = [
  {
    id: "ww-001",
    name: "Kaiser Westwood",
    role: "owner",
    rankTitle: "FOUNDER",
    avatar: "assets/logo-gold.jpg",
    facebook: "https://facebook.com/kaiser.westwood",
    discord: "kaiser.westwood"
  },
  {
    id: "ww-002",
    name: "Alexander 'Viper' Cross",
    role: "core",
    rankTitle: "LEADER",
    avatar: "assets/logo-red.jpg",
    facebook: "https://facebook.com/viper.cross.ww",
    discord: "viper.cross#168"
  },
  {
    id: "ww-003",
    name: "Dominic 'Ghost' Vance",
    role: "core",
    rankTitle: "LEADER",
    avatar: "assets/logo-gold.jpg",
    facebook: "https://facebook.com/ghost.vance.ww",
    discord: "ghost.vance#777"
  },
  {
    id: "ww-004",
    name: "Marcus 'Phoenix' Blade",
    role: "bigsupport",
    rankTitle: "BIGSUPPORT",
    avatar: "assets/logo-red.jpg",
    facebook: "https://facebook.com/phoenix.blade.ww",
    discord: "phoenix.blade#111"
  },
  {
    id: "ww-005",
    name: "Damian 'Raven' Cole",
    role: "bigsupport",
    rankTitle: "BIGSUPPORT",
    avatar: "assets/logo-gold.jpg",
    facebook: "https://facebook.com/raven.cole.ww",
    discord: "raven.cole#999"
  },
  {
    id: "ww-006",
    name: "Zack 'Zero' Walker",
    role: "member",
    rankTitle: "MEMBER",
    avatar: "assets/logo-red.jpg",
    facebook: "https://facebook.com/zero.walker.ww",
    discord: "zero.ww#404"
  },
  {
    id: "ww-007",
    name: "Leo 'Spectre' Sterling",
    role: "member",
    rankTitle: "MEMBER",
    avatar: "assets/logo-gold.jpg",
    facebook: "https://facebook.com/spectre.sterling.ww",
    discord: "spectre.ww#007"
  },
  {
    id: "ww-008",
    name: "Jax 'Titan' Brooks",
    role: "member",
    rankTitle: "MEMBER",
    avatar: "assets/logo-red.jpg",
    facebook: "https://facebook.com/titan.brooks.ww",
    discord: "titan.brooks#888"
  },
  {
    id: "ww-009",
    name: "Rex 'Kobra' Vance",
    role: "member",
    rankTitle: "MEMBER",
    avatar: "assets/logo-gold.jpg",
    facebook: "https://facebook.com/kobra.rex.ww",
    discord: "kobra.rex#555"
  },
  {
    id: "ww-010",
    name: "Caleb 'Shadow' Thorne",
    role: "member",
    rankTitle: "MEMBER",
    avatar: "assets/logo-red.jpg",
    facebook: "https://facebook.com/shadow.thorne.ww",
    discord: "shadow.thorne#321"
  }
];

const DEFAULT_SETTINGS = {
  gangName: "WESTWOOD",
  tagline: "RESPECT ALL • FEAR NONE",
  primaryTheme: "crimson",
  fivemServer: "connect fam2.net",
  spotifyUrl: "https://open.spotify.com/intl-th/track/7MXVkk9YMctZqd1Srtv4MB?si=d4bdfb0741a94f0c"
};

const STORAGE_KEYS = {
  MEMBERS: "westwood_members_v4",
  SETTINGS: "westwood_settings_v4",
  THEME: "westwood_theme_v4"
};

// Global Store & Bridge
window.WestwoodData = {
  _isLiveBackend: false,
  _eventSource: null,

  init() {
    this.syncFromBackend();
    this.connectLiveStream();
  },

  // 1. Members Access
  getMembers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading members:", e);
    }
    return [...DEFAULT_MEMBERS];
  },

  saveMembers(members) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      window.dispatchEvent(new CustomEvent("westwood:members-updated", { detail: members }));
      return true;
    } catch (e) {
      console.error("Error saving members:", e);
      return false;
    }
  },

  // SetMember (API or Local)
  async setMember(memberData) {
    const members = this.getMembers();
    let idx = -1;

    if (memberData.id) {
      idx = members.findIndex(m => m.id === memberData.id);
    }
    if (idx === -1 && memberData.discord) {
      idx = members.findIndex(m => m.discord && m.discord.toLowerCase() === memberData.discord.toLowerCase());
    }
    if (idx === -1) {
      idx = members.findIndex(m => m.name.toLowerCase() === memberData.name.toLowerCase());
    }

    const payload = {
      id: idx !== -1 ? members[idx].id : (memberData.id || `ww-${Date.now().toString().slice(-4)}`),
      name: memberData.name.trim(),
      role: memberData.role,
      rankTitle: (memberData.rankTitle || memberData.role.toUpperCase()).trim(),
      avatar: memberData.avatar || (idx !== -1 ? members[idx].avatar : "assets/logo-red.jpg"),
      facebook: memberData.facebook || (idx !== -1 ? members[idx].facebook : ""),
      discord: memberData.discord || (idx !== -1 ? members[idx].discord : "")
    };

    if (idx !== -1) {
      members[idx] = payload;
    } else {
      members.push(payload);
    }
    this.saveMembers(members);

    // Call Backend API
    try {
      const res = await fetch("/api/setmember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, member: json.member };
      }
    } catch {}

    return { success: true, member: payload };
  },

  // Delete Member
  async deleteMember(memberId) {
    let members = this.getMembers();
    const target = members.find(m => m.id === memberId);
    members = members.filter(m => m.id !== memberId);
    this.saveMembers(members);

    try {
      await fetch("/api/removemember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId })
      });
    } catch {}

    return target;
  },

  // 2. Settings Access
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Error reading settings:", e);
    }
    return { ...DEFAULT_SETTINGS };
  },

  async saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent("westwood:settings-updated", { detail: settings }));

      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings)
        });
      } catch {}

      return true;
    } catch (e) {
      console.error("Error saving settings:", e);
      return false;
    }
  },

  // 3. Theme Access
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || "crimson";
    } catch {
      return "crimson";
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute("data-theme", theme);
      window.dispatchEvent(new CustomEvent("westwood:theme-changed", { detail: theme }));
    } catch (e) {
      console.warn(e);
    }
  },

  // 4. Real-Time Backend Sync (REST & SSE Stream with static fallback)
  async syncFromBackend() {
    const apiBase = window.WESTWOOD_API_URL || "";
    try {
      const res = await fetch(`${apiBase}/api/members`);
      if (res.ok) {
        const data = await res.json();
        if (data.members && Array.isArray(data.members)) {
          this._isLiveBackend = true;
          this.saveMembers(data.members);
          window.dispatchEvent(new CustomEvent("westwood:backend-status", { detail: { online: true } }));
          return;
        }
      }
    } catch {
      // API unreachable, fallback to static JSON
    }

    // Static Fallback (supports standalone Netlify static hosting)
    try {
      const fallbackRes = await fetch("data/members.json");
      if (fallbackRes.ok) {
        const list = await fallbackRes.json();
        if (Array.isArray(list) && list.length > 0) {
          this.saveMembers(list);
        }
      }
    } catch (err) {}

    this._isLiveBackend = false;
    window.dispatchEvent(new CustomEvent("westwood:backend-status", { detail: { online: false } }));
  },

  // Connect Server-Sent Events (Live instant sync from Discord Bot!)
  connectLiveStream() {
    if (typeof EventSource === "undefined") return;
    if (this._eventSource) return;

    const apiBase = window.WESTWOOD_API_URL || "";
    try {
      this._eventSource = new EventSource(`${apiBase}/api/stream`);

      this._eventSource.addEventListener("setmember", (e) => {
        try {
          const payload = JSON.parse(e.data);
          const members = this.getMembers();
          const member = payload.member;
          const idx = members.findIndex(m => m.id === member.id);

          if (idx !== -1) {
            members[idx] = member;
          } else {
            members.push(member);
          }
          this.saveMembers(members);

          // Dispatch Discord Comm-Link Intel Event
          window.dispatchEvent(new CustomEvent("westwood:discord-intel", {
            detail: {
              type: "setmember",
              action: payload.action,
              member: member
            }
          }));
        } catch (err) {
          console.warn("SSE setmember parse error", err);
        }
      });

      this._eventSource.addEventListener("removemember", (e) => {
        try {
          const payload = JSON.parse(e.data);
          let members = this.getMembers();
          members = members.filter(m => m.id !== payload.member.id);
          this.saveMembers(members);

          window.dispatchEvent(new CustomEvent("westwood:discord-intel", {
            detail: {
              type: "removemember",
              member: payload.member
            }
          }));
        } catch (err) {
          console.warn("SSE removemember parse error", err);
        }
      });

      this._eventSource.onopen = () => {
        this._isLiveBackend = true;
        window.dispatchEvent(new CustomEvent("westwood:backend-status", { detail: { online: true } }));
      };

      this._eventSource.onerror = () => {
        this._isLiveBackend = false;
        window.dispatchEvent(new CustomEvent("westwood:backend-status", { detail: { online: false } }));
      };
    } catch {}
  },

  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.THEME);
    return true;
  }
};

// Auto-run init
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.WestwoodData.init());
  } else {
    window.WestwoodData.init();
  }
}
