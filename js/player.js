/**
 * WESTWOOD — Spotify Music Widget & Jukebox Engine
 * Supports:
 * 1. Direct Spotify URL embed (Track, Playlist, Album)
 * 2. In-widget Spotify Track Selector / Jukebox modal
 * 3. Dual Engine: Official Spotify Embed + HD Continuous Audio Player
 * 4. Starboy & Blinding Lights by The Weeknd
 */

(() => {
  "use strict";

  // Catalog of Gang & Hip-Hop Tracks
  const SPOTIFY_GANG_TRACKS = [
    {
      id: "7MXVkk9YMctZqd1Srtv4MB",
      type: "track",
      title: "Starboy",
      artist: "The Weeknd, Daft Punk",
      cover: "assets/starboy-cover.jpg",
      localAudio: "audio/starboy.mp3",
      spotifyUrl: "https://open.spotify.com/intl-th/track/7MXVkk9YMctZqd1Srtv4MB?si=d4bdfb0741a94f0c"
    },
    {
      id: "0VjIjW4GlUZAMYd2vXMi3b",
      type: "track",
      title: "Blinding Lights",
      artist: "The Weeknd",
      cover: "assets/blinding-lights-cover.jpg",
      localAudio: "audio/blinding_lights.mp3",
      spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b"
    },
    {
      id: "1DIXPcTDzTj88b049Wjt82",
      type: "track",
      title: "Gangsta's Paradise",
      artist: "Coolio, L.V.",
      cover: "https://i.scdn.co/image/ab67616d0000b273b5df54b5dfa9beab4dcbc96a",
      spotifyUrl: "https://open.spotify.com/track/1DIXPcTDzTj88b049Wjt82"
    },
    {
      id: "0e7ipj03S05BNilyu5bRzt",
      type: "track",
      title: "rockstar",
      artist: "Post Malone, 21 Savage",
      cover: "https://i.scdn.co/image/ab67616d0000b2739478c87599550dd73bfa7e02",
      spotifyUrl: "https://open.spotify.com/intl-th/track/0e7ipj03S05BNilyu5bRzt?si=867c59301ab34fc6"
    },
    {
      id: "5STdMlrBf6pqWiNE7WqxSi",
      type: "track",
      title: "Many Men (Wish Death)",
      artist: "50 Cent",
      cover: "https://i.scdn.co/image/ab67616d0000b273e934fb68d601d0a51ebcf405",
      spotifyUrl: "https://open.spotify.com/intl-th/track/5STdMlrBf6pqWiNE7WqxSi?si=a9352faa672d4d77"
    },
    {
      id: "0FIDCNYYjNvPVimz5icugS",
      type: "track",
      title: "Timeless",
      artist: "The Weeknd, Playboi Carti",
      cover: "https://i.scdn.co/image/ab67616d0000b2730a3fa7a4e69b5e5a593e9a7e",
      spotifyUrl: "https://open.spotify.com/intl-th/track/0FIDCNYYjNvPVimz5icugS?si=cb9924d094a44316"
    },
    { 
      id: "285pBltuF7vW8TeWk8hdRR",
      type: "track",
      title: "Lucid Dreams",
      artist: "Juice WRLD",
      cover: "https://i.scdn.co/image/ab67616d0000b273f7db43292a6a99b21b51d5b4",
      spotifyUrl: "https://open.spotify.com/intl-th/track/285pBltuF7vW8TeWk8hdRR?si=463c2b76bbb1434c"
    },
    {
      id: "68Dni7IE4VyPkTOH9mRWHr",
      type: "track",
      title: "No Role Modelz",
      artist: "J. Cole",
      cover: "https://i.scdn.co/image/ab67616d0000b273ea3b80122261778a80de6101",
      spotifyUrl: "https://open.spotify.com/intl-th/track/68Dni7IE4VyPkTOH9mRWHr?si=bb872d8759d14e1f"
    }
  ];

  // Local HD Audio Playlist
  const LOCAL_PLAYLIST = SPOTIFY_GANG_TRACKS.filter(t => t.localAudio);

  let currentLocalIndex = 0;
  let activeMode = "custom"; // "custom" | "embed"
  let currentEmbedData = {
    type: "track",
    id: "7MXVkk9YMctZqd1Srtv4MB",
    title: "Starboy",
    artist: "The Weeknd, Daft Punk"
  };

  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 1.0;
  audio.muted = false;

  let isPlaying = false;
  let widgetWrap, dockPill, playBtn, prevBtn, nextBtn, progressBar, timeCountdown, miniWave;
  let coverImg, titleEl, artistEl, trackIndicator, saveBtn, volSlider, modeBadge;
  let customCard, embedCard, embedIframe, jukeboxModal;

  function parseSpotifyUrl(url) {
    if (!url || typeof url !== "string") return null;
    const cleanUrl = url.trim();
    const match = cleanUrl.match(/(?:spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album)\/|spotify:(track|playlist|album):)([a-zA-Z0-9]+)/i);
    if (match) {
      return {
        type: match[1] || match[2],
        id: match[3]
      };
    }
    return null;
  }

  function initSpotifyDOM() {
    if (document.querySelector(".spotify-widget-wrap")) return;

    // Check Gang Settings for custom default Spotify URL
    const settings = window.WestwoodData ? window.WestwoodData.getSettings() : null;
    if (settings && settings.spotifyUrl) {
      const parsed = parseSpotifyUrl(settings.spotifyUrl);
      if (parsed) {
        currentEmbedData.type = parsed.type;
        currentEmbedData.id = parsed.id;
      }
    }

    const container = document.createElement("div");
    container.innerHTML = `
      <!-- Collapsible Spotify Player Widget -->
      <div class="spotify-widget-wrap" id="spotifyWidgetWrap">
        <div class="spotify-top-bar">
          <div class="spotify-top-left">
            <button class="spotify-collapse-toggle" id="spotifyCollapseBtn" title="ย่อเครื่องเล่น">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="spotify-badge-pill" id="spotifyOpenDirect" title="เปิดบน Spotify">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.786-.964a.625.625 0 01-.282-1.218c3.807-.87 7.076-.496 9.718 1.118a.624.624 0 01.207.857zm1.224-2.719a.78.78 0 01-1.073.257c-2.687-1.652-6.785-2.131-9.965-1.166a.781.781 0 01-.456-1.493c3.632-1.102 8.147-.568 11.237 1.33a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.948 9.385 8.77 6.305 9.705a.936.936 0 01-.548-1.791c3.538-1.074 9.404-.863 13.238 1.414a.936.936 0 01-1.08 1.542z"/></svg>
            </div>
            <button class="spotify-song-select-btn" id="spotifyOpenJukeboxBtn" title="เลือกเพลงจาก Spotify / วางลิงก์เพลง">
              <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <span>เลือกเพลง</span>
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="spotify-mode-badge" id="spotifyModeBadge" title="คลิกเพื่อสลับโหมดเครื่องเล่น">
              ⚡ HD AUDIO
            </button>
            <span class="spotify-track-indicator" id="spotifyTrackIndicator">TRACK 1 / ${LOCAL_PLAYLIST.length}</span>
          </div>
        </div>

        <!-- Mode 1: Custom Spotify Card (HD Audio) -->
        <div class="spotify-card" id="spotifyCustomCard">
          <div class="spotify-watermark" id="spotifyWatermark" title="Spotify">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.786-.964a.625.625 0 01-.282-1.218c3.807-.87 7.076-.496 9.718 1.118a.624.624 0 01.207.857zm1.224-2.719a.78.78 0 01-1.073.257c-2.687-1.652-6.785-2.131-9.965-1.166a.781.781 0 01-.456-1.493c3.632-1.102 8.147-.568 11.237 1.33a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.948 9.385 8.77 6.305 9.705a.936.936 0 01-.548-1.791c3.538-1.074 9.404-.863 13.238 1.414a.936.936 0 01-1.08 1.542z"/></svg>
          </div>

          <div class="spotify-content-row">
            <div class="spotify-cover-wrap">
              <img id="spotifyCoverImg" src="${LOCAL_PLAYLIST[0].cover}" alt="Album Cover">
            </div>

            <div class="spotify-meta">
              <div class="spotify-title" id="spotifyTrackTitle">${LOCAL_PLAYLIST[0].title}</div>
              <div class="spotify-artist-row">
                <span class="spotify-explicit-badge">E</span>
                <span id="spotifyTrackArtist">${LOCAL_PLAYLIST[0].artist}</span>
              </div>
              <button class="spotify-save-btn" id="spotifySaveBtn">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.5h3.5a.75.75 0 010 1.5H13v3.5a.75.75 0 01-1.5 0V14H8a.75.75 0 010-1.5h3.5V9a.75.75 0 011.5 0v3.5z"/></svg>
                <span>บันทึกไว้บน Spotify</span>
              </button>
            </div>
          </div>

          <div class="spotify-scrubber-row">
            <div class="spotify-progress-wrap">
              <input type="range" class="spotify-progress-bar" id="spotifyProgress" min="0" max="100" value="0" step="0.1">
              <span class="spotify-time-countdown" id="spotifyCountdown">-03:50</span>
            </div>
          </div>

          <div class="spotify-bottom-row">
            <div class="spotify-transport-left">
              <button class="spotify-btn-subtle" id="spotifyPrevBtn" title="เพลงก่อนหน้า">
                <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button class="spotify-play-btn" id="spotifyPlayBtn" title="เล่นเพลง">
                <svg id="spotifyPlayIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <button class="spotify-btn-subtle" id="spotifyNextBtn" title="เพลงถัดไป">
                <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            <div class="spotify-vol-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#a7a7a7"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              <input type="range" class="spotify-vol-slider" id="spotifyVolume" min="0" max="1" step="0.05" value="1.0" title="ปรับระดับเสียง">
            </div>
          </div>
        </div>

        <!-- Mode 2: Official Spotify Embed Card -->
        <div class="spotify-embed-card" id="spotifyEmbedCard" style="display: none;">
          <iframe id="spotifyIframe" src="https://open.spotify.com/embed/track/${currentEmbedData.id}?utm_source=generator&theme=0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
      </div>

      <!-- Dock Pill when collapsed -->
      <button class="spotify-dock-pill is-hidden" id="spotifyDockPill" title="ขยายเครื่องเล่น Spotify">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1db954"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.786-.964a.625.625 0 01-.282-1.218c3.807-.87 7.076-.496 9.718 1.118a.624.624 0 01.207.857zm1.224-2.719a.78.78 0 01-1.073.257c-2.687-1.652-6.785-2.131-9.965-1.166a.781.781 0 01-.456-1.493c3.632-1.102 8.147-.568 11.237 1.33a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.948 9.385 8.77 6.305 9.705a.936.936 0 01-.548-1.791c3.538-1.074 9.404-.863 13.238 1.414a.936.936 0 01-1.08 1.542z"/></svg>
        <span id="dockTrackTitle">Starboy • The Weeknd</span>
        <div class="spotify-mini-wave" id="spotifyMiniWave">
          <span class="spotify-wave-bar"></span>
          <span class="spotify-wave-bar"></span>
          <span class="spotify-wave-bar"></span>
        </div>
      </button>

      <!-- Spotify Jukebox / Song Selector Modal -->
      <div class="spotify-jukebox-modal" id="spotifyJukeboxModal">
        <div class="spotify-jukebox-card">
          <div class="spotify-jukebox-header">
            <div class="spotify-jukebox-brand">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.786-.964a.625.625 0 01-.282-1.218c3.807-.87 7.076-.496 9.718 1.118a.624.624 0 01.207.857zm1.224-2.719a.78.78 0 01-1.073.257c-2.687-1.652-6.785-2.131-9.965-1.166a.781.781 0 01-.456-1.493c3.632-1.102 8.147-.568 11.237 1.33a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.948 9.385 8.77 6.305 9.705a.936.936 0 01-.548-1.791c3.538-1.074 9.404-.863 13.238 1.414a.936.936 0 01-1.08 1.542z"/></svg>
              <div class="spotify-jukebox-title">WESTWOOD SPOTIFY JUKEBOX</div>
            </div>
            <button class="spotify-jukebox-close" id="closeJukeboxModalBtn">✕</button>
          </div>

          <div class="spotify-jukebox-body">
            <!-- Custom Spotify Link Input -->
            <div class="spotify-link-input-box">
              <label>🔗 วางลิงก์เพลง หรือ Playlist จาก Spotify</label>
              <div class="spotify-input-row">
                <input type="text" id="spotifyCustomUrlInput" placeholder="https://open.spotify.com/track/... หรือ playlist/...">
                <button class="spotify-load-btn" id="spotifyLoadUrlBtn">เล่นเพลงนี้</button>
              </div>
              <small style="color: #888; font-size: 11px; margin-top: 6px; display: block;">
                รองรับทุกลิงก์จาก Spotify (ทั้ง Track, Playlist, และ Album)
              </small>
            </div>

            <!-- Mode Switch Row -->
            <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
              <div>
                <strong style="color: #fff; font-size: 12.5px; display: block;">โหมดเครื่องเล่นปัจจุบัน</strong>
                <span id="jukeboxCurrentModeDesc" style="color: #888; font-size: 11px;">⚡ โหมด HD Audio เต็มเพลง (คมชัด 100%)</span>
              </div>
              <button class="spotify-load-btn" id="jukeboxToggleModeBtn" style="background: rgba(255,255,255,0.12); color: #fff;">
                สลับโหมด
              </button>
            </div>

            <!-- Track List -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 11.5px; font-weight: 700; color: #bbb; letter-spacing: 0.05em; text-transform: uppercase;">
                  🎵 เพลงฮิต FiveM & Syndicate
                </span>
                <span style="font-size: 11px; color: #777;">คลิกเพื่อเล่นเพลง</span>
              </div>
              <div class="spotify-tracks-list" id="spotifyTracksList">
                <!-- Populated via JavaScript -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    widgetWrap = document.getElementById("spotifyWidgetWrap");
    dockPill = document.getElementById("spotifyDockPill");
    playBtn = document.getElementById("spotifyPlayBtn");
    prevBtn = document.getElementById("spotifyPrevBtn");
    nextBtn = document.getElementById("spotifyNextBtn");
    progressBar = document.getElementById("spotifyProgress");
    timeCountdown = document.getElementById("spotifyCountdown");
    miniWave = document.getElementById("spotifyMiniWave");
    coverImg = document.getElementById("spotifyCoverImg");
    titleEl = document.getElementById("spotifyTrackTitle");
    artistEl = document.getElementById("spotifyTrackArtist");
    trackIndicator = document.getElementById("spotifyTrackIndicator");
    saveBtn = document.getElementById("spotifySaveBtn");
    volSlider = document.getElementById("spotifyVolume");
    modeBadge = document.getElementById("spotifyModeBadge");
    customCard = document.getElementById("spotifyCustomCard");
    embedCard = document.getElementById("spotifyEmbedCard");
    embedIframe = document.getElementById("spotifyIframe");
    jukeboxModal = document.getElementById("spotifyJukeboxModal");

    // Restore saved audio state if page was refreshed
    const wasPlaying = sessionStorage.getItem("westwood_audio_playing") === "1";
    const savedIdx = parseInt(sessionStorage.getItem("westwood_track_idx"), 10);
    const savedPos = parseFloat(sessionStorage.getItem("westwood_audio_pos") || "0");
    const savedMode = sessionStorage.getItem("westwood_audio_mode");

    if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < LOCAL_PLAYLIST.length) {
      currentLocalIndex = savedIdx;
    }

    renderJukeboxTracks();

    if (savedMode === "embed") {
      setMode("embed");
    } else {
      loadLocalTrack(currentLocalIndex, false);
      if (savedPos > 0) {
        audio.currentTime = savedPos;
      }
      if (wasPlaying) {
        playAudio();
      }
    }

    setupEvents();
  }

  function renderJukeboxTracks() {
    const listEl = document.getElementById("spotifyTracksList");
    if (!listEl) return;

    listEl.innerHTML = SPOTIFY_GANG_TRACKS.map((t, idx) => {
      const isLocal = !!t.localAudio;
      return `
        <div class="spotify-track-item ${idx === 0 ? "is-active" : ""}" data-track-id="${t.id}" data-idx="${idx}">
          <img class="spotify-track-item-cover" src="${t.cover}" alt="${t.title}" onerror="this.src='assets/logo-red.jpg'">
          <div class="spotify-track-item-info">
            <div class="spotify-track-item-title">${t.title}</div>
            <div class="spotify-track-item-artist">${t.artist} ${isLocal ? "• ⚡ HD" : "• 🟢 Spotify"}</div>
          </div>
          <span class="spotify-track-play-badge">▶ เล่นเพลง</span>
        </div>
      `;
    }).join("");

    listEl.querySelectorAll(".spotify-track-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.dataset.idx, 10);
        selectCatalogTrack(idx);
      });
    });
  }

  function selectCatalogTrack(idx) {
    const track = SPOTIFY_GANG_TRACKS[idx];
    if (!track) return;

    // Update active row in jukebox
    document.querySelectorAll(".spotify-track-item").forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
    });

    if (track.localAudio) {
      // Find index in LOCAL_PLAYLIST
      const lIdx = LOCAL_PLAYLIST.findIndex(t => t.id === track.id || t.title === track.title);
      if (lIdx !== -1) {
        currentLocalIndex = lIdx;
      }
      setMode("custom");
      loadLocalTrack(currentLocalIndex, true);
    } else {
      // Load Spotify Embed with parsed ID
      const parsed = parseSpotifyUrl(track.spotifyUrl);
      currentEmbedData = {
        type: (parsed && parsed.type) || track.type || "track",
        id: (parsed && parsed.id) || track.id,
        title: track.title,
        artist: track.artist
      };
      setMode("embed");
    }

    closeJukebox();
    window.showToast?.(`กำลังเล่น: ${track.title} (${track.artist})`);
  }

  function loadLocalTrack(index, autoPlay = true) {
    currentLocalIndex = (index + LOCAL_PLAYLIST.length) % LOCAL_PLAYLIST.length;
    const track = LOCAL_PLAYLIST[currentLocalIndex];

    audio.src = track.localAudio;
    audio.load();
    audio.volume = parseFloat(volSlider ? volSlider.value : 1.0);
    audio.muted = false;

    if (coverImg) coverImg.src = track.cover;
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (trackIndicator) trackIndicator.textContent = `TRACK ${currentLocalIndex + 1} / ${LOCAL_PLAYLIST.length}`;

    const dockTitle = document.getElementById("dockTrackTitle");
    if (dockTitle) dockTitle.textContent = `${track.title} • ${track.artist}`;

    if (progressBar) {
      progressBar.value = 0;
      progressBar.style.background = `rgba(255,255,255,0.2)`;
    }

    if (autoPlay) {
      playAudio();
    }
  }

  function setMode(mode) {
    activeMode = mode;
    const desc = document.getElementById("jukeboxCurrentModeDesc");

    if (mode === "embed") {
      audio.pause();
      isPlaying = false;
      updatePlayIcon();
      miniWave?.classList.remove("is-playing");

      if (customCard) customCard.style.display = "none";
      if (embedCard) embedCard.style.display = "block";
      if (modeBadge) {
        modeBadge.textContent = "🟢 SPOTIFY EMBED";
        modeBadge.classList.add("is-embed");
      }
      if (desc) desc.textContent = "🟢 โหมด Official Spotify Embed (จาก Spotify แท้)";

      // Update embed iframe src
      if (embedIframe) {
        embedIframe.src = `https://open.spotify.com/embed/${currentEmbedData.type}/${currentEmbedData.id}?utm_source=generator&theme=0`;
      }

      const dockTitle = document.getElementById("dockTrackTitle");
      if (dockTitle) dockTitle.textContent = `${currentEmbedData.title || "Spotify"} • ${currentEmbedData.artist || "Westwood"}`;
    } else {
      if (embedCard) embedCard.style.display = "none";
      if (customCard) customCard.style.display = "block";
      if (modeBadge) {
        modeBadge.textContent = "⚡ HD AUDIO";
        modeBadge.classList.remove("is-embed");
      }
      if (desc) desc.textContent = "⚡ โหมด HD Audio เต็มเพลง (คมชัด 100%)";

      const track = LOCAL_PLAYLIST[currentLocalIndex];
      const dockTitle = document.getElementById("dockTrackTitle");
      if (dockTitle && track) dockTitle.textContent = `${track.title} • ${track.artist}`;
    }
  }

  function openJukebox() {
    if (jukeboxModal) jukeboxModal.classList.add("is-open");
  }

  function closeJukebox() {
    if (jukeboxModal) jukeboxModal.classList.remove("is-open");
  }

  function setupEvents() {
    playBtn.addEventListener("click", togglePlay);

    // Prev / Next track buttons
    prevBtn.addEventListener("click", () => {
      loadLocalTrack(currentLocalIndex - 1, true);
    });

    nextBtn.addEventListener("click", () => {
      loadLocalTrack(currentLocalIndex + 1, true);
    });

    // Volume Slider
    if (volSlider) {
      volSlider.addEventListener("input", (e) => {
        audio.volume = parseFloat(e.target.value);
        audio.muted = false;
      });
    }

    // Direct Spotify link
    const openSpotify = () => {
      const activeUrl = activeMode === "embed"
        ? `https://open.spotify.com/${currentEmbedData.type}/${currentEmbedData.id}`
        : LOCAL_PLAYLIST[currentLocalIndex].spotifyUrl;
      window.open(activeUrl, "_blank");
    };
    document.getElementById("spotifyOpenDirect")?.addEventListener("click", openSpotify);
    document.getElementById("spotifyWatermark")?.addEventListener("click", openSpotify);
    saveBtn?.addEventListener("click", () => {
      openSpotify();
      window.showToast?.("กำลังเปิดเพลงบน Spotify...");
    });

    // Jukebox Open / Close
    document.getElementById("spotifyOpenJukeboxBtn")?.addEventListener("click", openJukebox);
    document.getElementById("closeJukeboxModalBtn")?.addEventListener("click", closeJukebox);
    jukeboxModal?.addEventListener("click", (e) => {
      if (e.target === jukeboxModal) closeJukebox();
    });

    // Mode Toggle Badge & Button
    modeBadge?.addEventListener("click", () => {
      setMode(activeMode === "custom" ? "embed" : "custom");
      if (activeMode === "custom") playAudio();
    });
    document.getElementById("jukeboxToggleModeBtn")?.addEventListener("click", () => {
      setMode(activeMode === "custom" ? "embed" : "custom");
      if (activeMode === "custom") playAudio();
    });

    // Custom Spotify URL Input Submit
    const loadUrlBtn = document.getElementById("spotifyLoadUrlBtn");
    const urlInput = document.getElementById("spotifyCustomUrlInput");
    const handleUrlSubmit = () => {
      const url = urlInput ? urlInput.value.trim() : "";
      if (!url) {
        window.showToast?.("กรุณาวางลิงก์เพลงจาก Spotify");
        return;
      }
      const parsed = parseSpotifyUrl(url);
      if (!parsed) {
        window.showToast?.("รูปแบบลิงก์ Spotify ไม่ถูกต้อง");
        return;
      }

      currentEmbedData = {
        type: parsed.type,
        id: parsed.id,
        title: "Spotify Track",
        artist: "Westwood"
      };
      setMode("embed");
      closeJukebox();
      if (urlInput) urlInput.value = "";
      window.showToast?.("โหลดเพลงจาก Spotify เรียบร้อยแล้ว");
    };

    loadUrlBtn?.addEventListener("click", handleUrlSubmit);
    urlInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUrlSubmit();
    });

    // Collapse toggle
    document.getElementById("spotifyCollapseBtn")?.addEventListener("click", () => {
      widgetWrap.classList.add("is-collapsed");
      dockPill.classList.remove("is-hidden");
      sessionStorage.setItem("spotify_widget_collapsed", "1");
    });

    // Expand toggle
    dockPill?.addEventListener("click", () => {
      widgetWrap.classList.remove("is-collapsed");
      dockPill.classList.add("is-hidden");
      sessionStorage.setItem("spotify_widget_collapsed", "0");
    });

    // Scrubber
    progressBar.addEventListener("input", (e) => {
      if (audio.duration) {
        audio.currentTime = (e.target.value / 100) * audio.duration;
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      sessionStorage.setItem("westwood_audio_pos", audio.currentTime.toString());

      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.value = pct;
      progressBar.style.background = `linear-gradient(90deg, #1db954 ${pct}%, rgba(255,255,255,0.2) ${pct}%)`;

      const remaining = Math.max(0, audio.duration - audio.currentTime);
      const m = Math.floor(remaining / 60);
      const s = Math.floor(remaining % 60);
      timeCountdown.textContent = `-${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    });

    audio.addEventListener("play", () => {
      isPlaying = true;
      sessionStorage.setItem("westwood_audio_playing", "1");
      sessionStorage.setItem("westwood_track_idx", currentLocalIndex.toString());
      sessionStorage.setItem("westwood_audio_mode", activeMode);
      updatePlayIcon();
      miniWave?.classList.add("is-playing");
      window.dispatchEvent(new CustomEvent("westwood:music-playing"));
    });

    audio.addEventListener("pause", () => {
      isPlaying = false;
      sessionStorage.setItem("westwood_audio_playing", "0");
      updatePlayIcon();
      miniWave?.classList.remove("is-playing");
      window.dispatchEvent(new CustomEvent("westwood:music-paused"));
    });

    audio.addEventListener("ended", () => {
      loadLocalTrack(currentLocalIndex + 1, true);
    });

    if (sessionStorage.getItem("spotify_widget_collapsed") === "1") {
      widgetWrap.classList.add("is-collapsed");
      dockPill.classList.remove("is-hidden");
    }

    // Explicit user interaction trigger
    const unlockUserPlay = () => {
      audio.volume = 1.0;
      audio.muted = false;
      document.removeEventListener("click", unlockUserPlay);
    };
    document.addEventListener("click", unlockUserPlay, { once: true });
  }

  function playAudio() {
    audio.volume = 1.0;
    audio.muted = false;
    audio.play().then(() => {
      isPlaying = true;
      updatePlayIcon();
    }).catch(err => {
      console.warn("Playback requires user click:", err);
    });
  }

  function togglePlay() {
    if (activeMode === "embed") {
      window.showToast?.("ในโหมด Spotify Embed ให้กดปุ่ม Play บนเครื่องเล่น Spotify ครับ");
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      playAudio();
    }
  }

  function updatePlayIcon() {
    if (!playBtn) return;
    if (isPlaying) {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      playBtn.title = "หยุดเล่น";
    } else {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      playBtn.title = "เล่นเพลง";
    }
  }

  document.addEventListener("DOMContentLoaded", initSpotifyDOM);

  window.WestwoodPlayer = {
    play: playAudio,
    pause: () => audio.pause(),
    toggle: togglePlay,
    next: () => loadLocalTrack(currentLocalIndex + 1, true),
    prev: () => loadLocalTrack(currentLocalIndex - 1, true),
    openJukebox: openJukebox,
    setSpotifyUrl: (url) => {
      const parsed = parseSpotifyUrl(url);
      if (parsed) {
        currentEmbedData = {
          type: parsed.type,
          id: parsed.id,
          title: "Spotify Track",
          artist: "Westwood"
        };
        setMode("embed");
      }
    }
  };
})();
