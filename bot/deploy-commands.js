/**
 * WESTWOOD SYNDICATE — Deploy Slash Commands to Discord API
 * Registers /panel, /setmember, /removemember, /roster to Discord
 */

require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  // 1. /panel (แผงควบคุมหลักเหมือนในรูป มีปุ่มกดและฟอร์ม Modal)
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("🛠️ ส่งแผงควบคุมระบบจัดการสมาชิกแก๊ง Westwood (มีปุ่มกดและฟอร์มกรอกข้อมูล)"),

  // 2. /setmember (คำสั่งแบบ Slash Command ตรงๆ)
  new SlashCommandBuilder()
    .setName("setmember")
    .setDescription("🎖️ บรรจุหรืออัปเดตสมาชิกแก๊ง Westwood พร้อมซิงค์เข้าหน้าเว็บทันที")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("เลือกสมาชิกในดิสคอร์ด (@User)")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("role")
        .setDescription("ระดับยศในแก๊ง")
        .setRequired(true)
        .addChoices(
          { name: "👑 OWNER (ผู้ก่อตั้งแก๊ง)", value: "owner" },
          { name: "⚔️ LEADER (หัวหน้า / มือขวา)", value: "core" },
          { name: "🛡️ BIGSUPPORT (ผู้สนับสนุนหลัก)", value: "bigsupport" },
          { name: "💀 MEMBER (สมาชิกทั่วไป)", value: "member" }
        )
    )
    .addStringOption(opt =>
      opt.setName("name")
        .setDescription("ชื่อในเกม FiveM (เช่น Kaiser Westwood, Viper Cross)")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("rank_title")
        .setDescription("ชื่อตำแหน่งย่อย / ฉายา (เช่น FOUNDER, UNDERBOSS)")
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("facebook")
        .setDescription("ลิงก์โปรไฟล์ Facebook หรือชื่อ")
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("avatar_url")
        .setDescription("ลิงก์รูปโปรไฟล์ (ถ้าไม่ใส่ ระบบจะดึงรูปจาก Discord มาให้อัตโนมัติ)")
        .setRequired(false)
    ),

  // 3. /removemember
  new SlashCommandBuilder()
    .setName("removemember")
    .setDescription("❌ ปลดหรือลบสมาชิกออกจากทำเนียบแก๊งและหน้าเว็บ")
    .addStringOption(opt =>
      opt.setName("target")
        .setDescription("ชื่อในเกม หรือ Discord Tag ที่ต้องการลบ")
        .setRequired(true)
    ),

  // 4. /roster
  new SlashCommandBuilder()
    .setName("roster")
    .setDescription("📋 เช็ครายชื่อทำเนียบสมาชิกแก๊ง Westwood ล่าสุดจากระบบ")
].map(cmd => cmd.toJSON());

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error("❌ กรุณาระบุ DISCORD_TOKEN และ CLIENT_ID ในไฟล์ .env ก่อนทำการ Deploy");
  console.log("ตัวอย่างในไฟล์ .env:");
  console.log("DISCORD_TOKEN=your_bot_token_here");
  console.log("CLIENT_ID=your_client_id_here");
  console.log("GUILD_ID=your_guild_id_here (หรือเว้นว่างเพื่อลงแบบ Global)\n");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`[Westwood Bot] กำลังลงทะเบียนคำสั่ง Slash Commands (${commands.length} คำสั่ง)...`);

    let data;
    if (guildId) {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ สำเร็จ! ลงทะเบียน ${data.length} คำสั่งใน Server Guild ID: ${guildId}`);
    } else {
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ สำเร็จ! ลงทะเบียน ${data.length} คำสั่งแบบ Global เรียบร้อย!`);
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการ Deploy คำสั่ง:", error);
  }
})();
