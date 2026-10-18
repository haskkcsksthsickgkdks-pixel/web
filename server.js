/**
 * WESTWOOD SYNDICATE — Integrated Web & Discord Bot API Server
 * FiveM Gang Roster Management Engine
 * Real-time SSE Live Synchronization with Discord Bot
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paths
const DATA_DIR = path.join(__dirname, "data");
const MEMBERS_FILE = path.join(DATA_DIR, "members.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// Ensure Data Directory Exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Read JSON safely
function readJSON(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`[Server Error] Reading ${file}:`, err);
  }
  return fallback;
}

// Helper: Write JSON safely
function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`[Server Error] Writing ${file}:`, err);
    return false;
  }
}

// In-Memory SSE Clients for Real-Time Synchronization
let sseClients = [];

function broadcastSSE(eventType, payload) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(message);
    } catch (e) {
      // client disconnected
    }
  });
}

// ==========================================
// 📡 REAL-TIME SSE STREAM (Syncs Discord Bot -> Web)
// ==========================================
app.get("/api/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  res.write("event: connected\ndata: {\"status\":\"ok\"}\n\n");

  const clientId = Date.now() + Math.random().toString(36).substring(2);
  const clientObj = { id: clientId, res };
  sseClients.push(clientObj);

  req.on("close", () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// ==========================================
// 👥 MEMBERS API (For Discord Bot & Web)
// ==========================================

// GET all members
app.get("/api/members", (req, res) => {
  const members = readJSON(MEMBERS_FILE, []);
  res.json({ success: true, count: members.length, members });
});

// POST Set Member (Called by Discord Bot / Web)
app.post("/api/setmember", (req, res) => {
  const {
    id,
    name,
    role,
    rankTitle,
    avatar,
    facebook,
    discord
  } = req.body;

  if (!name || !role) {
    return res.status(400).json({ success: false, message: "Missing required fields: name, role" });
  }

  let members = readJSON(MEMBERS_FILE, []);

  // Search if member exists by id or discord or exact name
  let existingIndex = -1;
  if (id) {
    existingIndex = members.findIndex(m => m.id === id);
  }
  if (existingIndex === -1 && discord) {
    existingIndex = members.findIndex(m => m.discord && m.discord.toLowerCase() === discord.toLowerCase());
  }
  if (existingIndex === -1) {
    existingIndex = members.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
  }

  const roleNormalized = ["owner", "core", "bigsupport", "member"].includes(role.toLowerCase())
    ? role.toLowerCase()
    : "member";

  const finalId = existingIndex !== -1 ? members[existingIndex].id : (id || `ww-${Date.now().toString().slice(-4)}`);

  // ONLY clean essential fields: id, name, role, rankTitle, avatar, facebook, discord
  const memberPayload = {
    id: finalId,
    name: name.trim(),
    role: roleNormalized,
    rankTitle: (rankTitle || roleNormalized.toUpperCase()).trim(),
    avatar: avatar || (existingIndex !== -1 ? members[existingIndex].avatar : "assets/logo-red.jpg"),
    facebook: facebook || (existingIndex !== -1 ? members[existingIndex].facebook : ""),
    discord: discord || (existingIndex !== -1 ? members[existingIndex].discord : "")
  };

  const isUpdate = existingIndex !== -1;
  if (isUpdate) {
    members[existingIndex] = memberPayload;
  } else {
    members.push(memberPayload);
  }

  writeJSON(MEMBERS_FILE, members);

  // Broadcast to all active browsers via Server-Sent Events!
  broadcastSSE("setmember", {
    action: isUpdate ? "update" : "create",
    member: memberPayload
  });

  res.json({
    success: true,
    action: isUpdate ? "update" : "create",
    member: memberPayload
  });
});

// POST Remove Member
app.post("/api/removemember", (req, res) => {
  const { id, name, discord } = req.body;
  let members = readJSON(MEMBERS_FILE, []);

  const initialLen = members.length;
  let removedMember = null;

  members = members.filter(m => {
    const matchId = id && m.id === id;
    const matchName = name && m.name.toLowerCase() === name.toLowerCase();
    const matchDiscord = discord && m.discord && m.discord.toLowerCase() === discord.toLowerCase();

    if (matchId || matchName || matchDiscord) {
      removedMember = m;
      return false;
    }
    return true;
  });

  if (members.length === initialLen) {
    return res.status(404).json({ success: false, message: "Member not found" });
  }

  writeJSON(MEMBERS_FILE, members);

  // Broadcast deletion to all open browser windows
  broadcastSSE("removemember", {
    member: removedMember
  });

  res.json({ success: true, removed: removedMember });
});

// ==========================================
// ⚙️ SETTINGS API
// ==========================================

app.get("/api/settings", (req, res) => {
  const settings = readJSON(SETTINGS_FILE, {});
  res.json({ success: true, settings });
});

app.post("/api/settings", (req, res) => {
  const current = readJSON(SETTINGS_FILE, {});
  const updated = { ...current, ...req.body };
  writeJSON(SETTINGS_FILE, updated);
  broadcastSSE("settings", updated);
  res.json({ success: true, settings: updated });
});

// Status Endpoint
app.get("/api/status", (req, res) => {
  const members = readJSON(MEMBERS_FILE, []);
  res.json({
    status: "online",
    activeConnections: sseClients.length,
    memberCount: members.length
  });
});

// Serve Static Front-End Files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  WESTWOOD SYNDICATE — FIVE-M ROSTER & DISCORD BOT API  `);
  console.log(`  Web Server running at: http://localhost:${PORT}`);
  console.log(`  Discord Bot API at:    http://localhost:${PORT}/api/setmember`);
  console.log(`======================================================\n`);

  // Auto-start Discord Bot alongside Web Server if token is present
  if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== "your_discord_bot_token_here") {
    try {
      require("./bot/discord-bot.js");
    } catch (err) {
      console.warn("Could not auto-start Discord Bot:", err.message);
    }
  }
});
