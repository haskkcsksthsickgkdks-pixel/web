/**
 * WESTWOOD SYNDICATE — Official Discord Bot
 * Control Panel with Interactive Buttons & Pop-Up Modal Forms
 * Real-Time Synchronization with FiveM Gang Roster Website
 */

require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Config
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;
const MEMBERS_FILE = path.join(__dirname, "..", "data", "members.json");

// Role Colors Mapping for Discord Embeds
const ROLE_COLORS = {
  owner: 0xff3344,       // Crimson Red / Gold
  core: 0xff884d,        // Bright Orange
  bigsupport: 0x4da6ff,  // Tactical Blue
  member: 0xaaa69d       // Silver Platinum
};

const ROLE_NAMES = {
  owner: "👑 OWNER (ผู้ก่อตั้ง)",
  core: "⚔️ LEADER (หัวหน้า / มือขวา)",
  bigsupport: "🛡️ BIGSUPPORT (ผู้สนับสนุนหลัก)",
  member: "💀 MEMBER (สมาชิกทั่วไป)"
};

// Helper: Make HTTP POST to local API
async function callApi(endpoint, data) {
  return new Promise((resolve) => {
    try {
      const url = new URL(API_URL + endpoint);
      const postData = JSON.stringify(data);

      const options = {
        hostname: url.hostname,
        port: url.port || PORT,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        },
        timeout: 4000
      };

      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, data: JSON.parse(body) });
          } catch {
            resolve({ ok: false, data: null });
          }
        });
      });

      req.on("error", () => resolve({ ok: false, directFallback: true }));
      req.on("timeout", () => { req.destroy(); resolve({ ok: false, directFallback: true }); });
      req.write(postData);
      req.end();
    } catch {
      resolve({ ok: false, directFallback: true });
    }
  });
}

// Fallback: Direct Local File Update
function directFileSetMember(payload) {
  try {
    let members = [];
    if (fs.existsSync(MEMBERS_FILE)) {
      members = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
    }
    const idx = members.findIndex(m => 
      (m.discord && payload.discord && m.discord.toLowerCase() === payload.discord.toLowerCase()) ||
      (m.name && m.name.toLowerCase() === payload.name.toLowerCase())
    );

    const finalId = idx !== -1 ? members[idx].id : `ww-${Date.now().toString().slice(-4)}`;

    const newMember = {
      id: finalId,
      name: payload.name,
      role: payload.role,
      rankTitle: payload.rankTitle || payload.role.toUpperCase(),
      avatar: payload.avatar || "assets/logo-red.jpg",
      facebook: payload.facebook || "",
      discord: payload.discord || ""
    };

    if (idx !== -1) {
      members[idx] = newMember;
    } else {
      members.push(newMember);
    }

    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), "utf8");
    return { ok: true, member: newMember, isUpdate: idx !== -1 };
  } catch (err) {
    console.error("[Bot File Error]", err);
    return { ok: false };
  }
}

// Read members count helper
function getMembersCount() {
  try {
    if (fs.existsSync(MEMBERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
      return Array.isArray(data) ? data.length : 0;
    }
  } catch {}
  return 0;
}

// Build Panel Embed & Buttons
function buildPanelPayload() {
  const count = getMembersCount();
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle("🎖️ WESTWOOD SYNDICATE — HIGH COMMAND ROSTER PANEL")
    .setDescription(
      "**แผงควบคุมระบบสมาชิกแก๊ง WESTWOOD**\n" +
      "กดปุ่มด้านล่างเพื่อทำการ **ตั้งค่ายศ / เพิ่มสมาชิก** หรือ **ปลดสมาชิก**\n" +
      "ระบบจะเปิดฟอร์มขึ้นมาให้กรอกข้อมูลทันที และซิงค์เข้าสู่หน้าเว็บไซต์หลักแบบ Real-Time!"
    )
    .addFields(
      { name: "👥 สมาชิกในทำเนียบ", value: `**${count} นาย**`, inline: true },
      { name: "🟢 สถานะระบบเว็บ", value: "`ONLINE - LIVE SYNC`", inline: true },
      { name: "⚡ การเชื่อมต่อ", value: "`AUTOMATIC SSE LINK`", inline: true }
    )
    .setFooter({ text: "WESTWOOD SYNDICATE • RESPECT ALL • FEAR NONE" })
    .setTimestamp();

  // Action Row 1: Set Member, Remove Member, View Roster
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_panel_setmember")
      .setLabel("➕ ตั้งค่ายศ / เพิ่มสมาชิก")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("btn_panel_removemember")
      .setLabel("❌ ปลดสมาชิก")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("btn_panel_roster")
      .setLabel("📋 ดูสมาชิก")
      .setStyle(ButtonStyle.Secondary)
  );

  // Action Row 2: Refresh, Web Link
  const webUrl = API_URL.replace("https://westwood.up.railway.app/members.html")
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_panel_refresh")
      .setLabel("🔄 รีเฟรชสถานะ")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel("🌐 เปิดดูหน้าเว็บแก๊ง")
      .setStyle(ButtonStyle.Link)
      .setURL(webUrl)
  );

  return { embeds: [embed], components: [row1, row2] };
}

// Client Ready
client.once("ready", () => {
  console.log(`\n======================================================`);
  console.log(`🤖 WESTWOOD DISCORD BOT ONLINE: ${client.user.tag}`);
  console.log(`📡 Linked to Web Roster at: ${API_URL}`);
  console.log(`🛠️ Ready for /panel and interactive modals!`);
  console.log(`======================================================\n`);

  client.user.setPresence({
    activities: [{ name: "WESTWOOD SYNDICATE • /panel", type: ActivityType.Watching }],
    status: "online"
  });
});

// Interaction Create Handler
client.on("interactionCreate", async (interaction) => {

  // ==========================================
  // 1. SLASH COMMANDS
  // ==========================================
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    // A. /panel (สร้างแผงควบคุมเหมือนในรูป)
    if (commandName === "panel") {
      const payload = buildPanelPayload();
      await interaction.reply(payload);
    }

    // B. /setmember (แบบ Slash Command ตรงๆ)
    else if (commandName === "setmember") {
      await interaction.deferReply();

      const targetUser = interaction.options.getUser("user");
      const role = interaction.options.getString("role");
      const ingameName = interaction.options.getString("name");
      const rankTitle = interaction.options.getString("rank_title") || role.toUpperCase();
      const facebook = interaction.options.getString("facebook") || "";
      let avatarUrl = interaction.options.getString("avatar_url");

      if (!avatarUrl && targetUser) {
        avatarUrl = targetUser.displayAvatarURL({ extension: "png", size: 512, forceStatic: false });
      }

      const discordHandle = targetUser ? `${targetUser.username}${targetUser.discriminator && targetUser.discriminator !== '0' ? '#' + targetUser.discriminator : ''}` : "";

      const payload = {
        name: ingameName,
        role: role,
        rankTitle: rankTitle,
        avatar: avatarUrl,
        facebook: facebook,
        discord: discordHandle
      };

      let result = await callApi("/api/setmember", payload);
      let finalMember = null;
      let isUpdate = false;

      if (result.ok && result.data && result.data.member) {
        finalMember = result.data.member;
        isUpdate = result.data.action === "update";
      } else {
        const fallback = directFileSetMember(payload);
        if (fallback.ok) {
          finalMember = fallback.member;
          isUpdate = fallback.isUpdate;
        }
      }

      if (!finalMember) {
        return interaction.editReply({ content: "❌ เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลสมาชิกได้" });
      }

      const embedColor = ROLE_COLORS[role] || 0xe50914;
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(isUpdate ? "⚡ WESTWOOD — อัปเดตข้อมูลสมาชิก" : "🎖️ WESTWOOD — บรรจุสมาชิกใหม่")
        .setDescription(`อนุมัติคำสั่งโดย <@${interaction.user.id}>\nข้อมูลถูก**ซิงค์เข้าสู่หน้าเว็บไซต์หลักทันที**!`)
        .setThumbnail(finalMember.avatar)
        .addFields(
          { name: "👤 ชื่อในเกม", value: `**${finalMember.name}**`, inline: true },
          { name: "🎖️ ยศแก๊ง", value: `${ROLE_NAMES[role] || role.toUpperCase()}`, inline: true },
          { name: "🔖 ตำแหน่ง", value: `\`${finalMember.rankTitle}\``, inline: true },
          { name: "💬 Discord", value: `<@${targetUser.id}> (\`${discordHandle}\`)`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }

    // C. /removemember
    else if (commandName === "removemember") {
      await interaction.deferReply();
      const query = interaction.options.getString("target");

      let payload = {};
      if (query.startsWith("<@") && query.endsWith(">")) {
        const userId = query.replace(/[<@!>]/g, "");
        const userObj = client.users.cache.get(userId);
        payload.discord = userObj ? userObj.username : query;
      } else {
        payload.name = query;
      }

      const result = await callApi("/api/removemember", payload);
      if (result.ok && result.data && result.data.removed) {
        const removed = result.data.removed;
        const embed = new EmbedBuilder()
          .setColor(0x555555)
          .setTitle("⛔ WESTWOOD — ปลดสถานะสมาชิก")
          .setDescription(`สมาชิก **${removed.name}** ได้ถูกปลดออกจากทำเนียบแก๊งและหน้าเว็บเรียบร้อยแล้ว`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({ content: `❌ ไม่พบข้อมูลสมาชิกที่ตรงกับ: \`${query}\` ในระบบ` });
      }
    }

    // D. /roster
    else if (commandName === "roster") {
      await interaction.deferReply();
      let members = [];
      try {
        if (fs.existsSync(MEMBERS_FILE)) {
          members = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
        }
      } catch {}

      const owners = members.filter(m => m.role === "owner");
      const cores = members.filter(m => m.role === "core");
      const supports = members.filter(m => m.role === "bigsupport");
      const regulars = members.filter(m => m.role === "member");

      const formatList = (list) => {
        if (!list.length) return "*(ไม่มีสมาชิกในระดับนี้)*";
        return list.map((m, idx) => `**${idx + 1}.** ${m.name} — *${m.rankTitle || m.role}* (${m.discord ? '@' + m.discord : '-'})`).join("\n");
      };

      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle("📋 ทำเนียบสมาชิก WESTWOOD SYNDICATE")
        .setDescription(`จำนวนสมาชิกทั้งหมด: **${members.length} นาย** | ซิงค์เว็บสด 🟢`)
        .addFields(
          { name: `👑 OWNER (${owners.length})`, value: formatList(owners) },
          { name: `⚔️ LEADER (${cores.length})`, value: formatList(cores) },
          { name: `🛡️ BIGSUPPORT (${supports.length})`, value: formatList(supports) },
          { name: `💀 MEMBERS (${regulars.length})`, value: formatList(regulars) }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  }

  // ==========================================
  // 2. BUTTON CLICKS (เปิด Modal ฟอร์มกรอกข้อมูล)
  // ==========================================
  else if (interaction.isButton()) {
    const { customId } = interaction;

    // A. ปุ่ม: ➕ ตั้งค่ายศ / เพิ่มสมาชิก -> แสดง Modal Pop-Up
    if (customId === "btn_panel_setmember") {
      const modal = new ModalBuilder()
        .setCustomId("modal_setmember_submit")
        .setTitle("➕ ตั้งค่ายศ / เพิ่มสมาชิกแก๊ง");

      const nameInput = new TextInputBuilder()
        .setCustomId("m_name")
        .setLabel("ชื่อสมาชิกในเกม FiveM (In-Game Name)")
        .setPlaceholder("เช่น Kaiser Westwood, Alexander Viper")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const roleInput = new TextInputBuilder()
        .setCustomId("m_role")
        .setLabel("ระดับยศ (owner / core / bigsupport / member)")
        .setPlaceholder("พิมพ์ยศ: owner, core, bigsupport หรือ member")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const titleInput = new TextInputBuilder()
        .setCustomId("m_title")
        .setLabel("ฉายา / ตำแหน่งย่อย (Rank Title)")
        .setPlaceholder("เช่น FOUNDER, UNDERBOSS, HITMAN (เว้นว่างได้)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const discordInput = new TextInputBuilder()
        .setCustomId("m_discord")
        .setLabel("Discord Username หรือ User ID")
        .setPlaceholder("เช่น viper.cross#168 หรือ User ID 18 หลัก")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const fbInput = new TextInputBuilder()
        .setCustomId("m_facebook")
        .setLabel("ลิงก์ Facebook หรือ Avatar URL")
        .setPlaceholder("https://facebook.com/... (เว้นว่างได้)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(roleInput),
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(discordInput),
        new ActionRowBuilder().addComponents(fbInput)
      );

      await interaction.showModal(modal);
    }

    // B. ปุ่ม: ❌ ปลดสมาชิก -> แสดง Modal Pop-Up
    else if (customId === "btn_panel_removemember") {
      const modal = new ModalBuilder()
        .setCustomId("modal_removemember_submit")
        .setTitle("❌ ปลดสมาชิกออกจากแก๊ง");

      const targetInput = new TextInputBuilder()
        .setCustomId("m_remove_target")
        .setLabel("ชื่อในเกม หรือ Discord Tag ที่ต้องการปลด")
        .setPlaceholder("เช่น Alexander Viper หรือ viper.cross#168")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(targetInput));
      await interaction.showModal(modal);
    }

    // C. ปุ่ม: 📋 ดูสมาชิก
    else if (customId === "btn_panel_roster") {
      await interaction.deferReply({ ephemeral: true });

      let members = [];
      try {
        if (fs.existsSync(MEMBERS_FILE)) {
          members = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
        }
      } catch {}

      const owners = members.filter(m => m.role === "owner");
      const cores = members.filter(m => m.role === "core");
      const supports = members.filter(m => m.role === "bigsupport");
      const regulars = members.filter(m => m.role === "member");

      const formatList = (list) => {
        if (!list.length) return "*(ไม่มีสมาชิกในระดับนี้)*";
        return list.map((m, idx) => `**${idx + 1}.** ${m.name} — *${m.rankTitle || m.role}*`).join("\n");
      };

      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle("📋 ทำเนียบสมาชิก WESTWOOD SYNDICATE")
        .setDescription(`จำนวนสมาชิกทั้งหมด: **${members.length} นาย**`)
        .addFields(
          { name: `👑 OWNER (${owners.length})`, value: formatList(owners) },
          { name: `⚔️ LEADER (${cores.length})`, value: formatList(cores) },
          { name: `🛡️ BIGSUPPORT (${supports.length})`, value: formatList(supports) },
          { name: `💀 MEMBERS (${regulars.length})`, value: formatList(regulars) }
        );

      await interaction.editReply({ embeds: [embed] });
    }

    // D. ปุ่ม: 🔄 รีเฟรชสถานะ Panel
    else if (customId === "btn_panel_refresh") {
      const updatedPayload = buildPanelPayload();
      await interaction.update(updatedPayload);
    }
  }

  // ==========================================
  // 3. MODAL SUBMITS (ประมวลผลข้อมูลที่กรอกในฟอร์ม)
  // ==========================================
  else if (interaction.isModalSubmit()) {
    const { customId } = interaction;

    // A. ส่งข้อมูลฟอร์ม: ➕ ตั้งค่ายศ / เพิ่มสมาชิก
    if (customId === "modal_setmember_submit") {
      await interaction.deferReply({ ephemeral: true });

      const name = interaction.fields.getTextInputValue("m_name").trim();
      let roleRaw = interaction.fields.getTextInputValue("m_role").trim().toLowerCase();
      const rankTitle = interaction.fields.getTextInputValue("m_title").trim();
      const discord = interaction.fields.getTextInputValue("m_discord").trim();
      const fbOrAvatar = interaction.fields.getTextInputValue("m_facebook").trim();

      // Normalize role
      const validRoles = ["owner", "core", "bigsupport", "member"];
      let role = validRoles.includes(roleRaw) ? roleRaw : "member";

      // If user typed thai or alias
      if (roleRaw.includes("leader") || roleRaw.includes("หัวหน้า")) role = "core";
      if (roleRaw.includes("owner") || roleRaw.includes("เจ้าของ") || roleRaw.includes("ผู้ก่อตั้ง")) role = "owner";
      if (roleRaw.includes("support") || roleRaw.includes("ซัพ")) role = "bigsupport";

      // Auto-extract Discord Avatar
      let avatarUrl = "assets/logo-red.jpg";
      let facebookUrl = "";

      if (fbOrAvatar.startsWith("http")) {
        if (fbOrAvatar.includes("facebook.com")) {
          facebookUrl = fbOrAvatar;
        } else {
          avatarUrl = fbOrAvatar;
        }
      }

      // Check Discord Avatar from discord input
      if (discord) {
        const cleanId = discord.replace(/[<@!>]/g, "");
        if (/^\d{17,19}$/.test(cleanId)) {
          const foundUser = client.users.cache.get(cleanId);
          if (foundUser) {
            avatarUrl = foundUser.displayAvatarURL({ extension: "png", size: 512 });
          } else {
            avatarUrl = `https://cdn.discordapp.com/avatars/${cleanId}/avatar.png`;
          }
        }
      }

      const payload = {
        name,
        role,
        rankTitle: rankTitle || role.toUpperCase(),
        avatar: avatarUrl,
        facebook: facebookUrl,
        discord: discord.replace("@", "")
      };

      let result = await callApi("/api/setmember", payload);
      let finalMember = null;
      let isUpdate = false;

      if (result.ok && result.data && result.data.member) {
        finalMember = result.data.member;
        isUpdate = result.data.action === "update";
      } else {
        const fallback = directFileSetMember(payload);
        if (fallback.ok) {
          finalMember = fallback.member;
          isUpdate = fallback.isUpdate;
        }
      }

      if (!finalMember) {
        return interaction.editReply({ content: "❌ เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้" });
      }

      const embedColor = ROLE_COLORS[role] || 0xe50914;
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(isUpdate ? "⚡ [PANEL] อัปเดตข้อมูลสมาชิกสำเร็จ" : "🎖️ [PANEL] บรรจุสมาชิกใหม่สำเร็จ")
        .setDescription(`ดำเนินการโดย <@${interaction.user.id}>\nข้อมูลถูก**ซิงค์เข้าสู่หน้าเว็บไซต์หลักทันที**!`)
        .setThumbnail(finalMember.avatar)
        .addFields(
          { name: "👤 ชื่อในเกม", value: `**${finalMember.name}**`, inline: true },
          { name: "🎖️ ยศแก๊ง", value: `${ROLE_NAMES[role] || role.toUpperCase()}`, inline: true },
          { name: "🔖 ฉายา/ตำแหน่ง", value: `\`${finalMember.rankTitle}\``, inline: true },
          { name: "💬 Discord", value: finalMember.discord ? `\`${finalMember.discord}\`` : "-", inline: true }
        )
        .setFooter({ text: "WESTWOOD SYNDICATE • REAL-TIME LIVE SYNC" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }

    // B. ส่งข้อมูลฟอร์ม: ❌ ปลดสมาชิก
    else if (customId === "modal_removemember_submit") {
      await interaction.deferReply({ ephemeral: true });
      const target = interaction.fields.getTextInputValue("m_remove_target").trim();

      const payload = { name: target, discord: target.replace("@", "") };
      const result = await callApi("/api/removemember", payload);

      if (result.ok && result.data && result.data.removed) {
        const removed = result.data.removed;
        const embed = new EmbedBuilder()
          .setColor(0x555555)
          .setTitle("⛔ [PANEL] ปลดสถานะสมาชิกสำเร็จ")
          .setDescription(`สมาชิก **${removed.name}** ได้ถูกปลดออกจากทำเนียบแก๊งและหน้าเว็บเรียบร้อยแล้ว`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({ content: `❌ ไม่พบข้อมูลสมาชิก: \`${target}\` ในระบบ` });
      }
    }
  }
});

// Start Discord Bot
const token = process.env.DISCORD_TOKEN;
if (token && token !== "your_discord_bot_token_here") {
  client.login(token).catch(err => {
    console.error("❌ ล็อคอิน Discord Bot ไม่สำเร็จ:", err.message);
  });
} else {
  console.log("ℹ️ ยังไม่ได้ตั้งค่า DISCORD_TOKEN ในไฟล์ .env — Discord Bot รอการกรอก Token");
}

module.exports = { client };
