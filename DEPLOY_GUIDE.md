# 🚀 คู่มือการ Deploy ระบบ Westwood Syndicate (เว็บ + Discord Bot)

---

## 🧪 สรุปผลการทดสอบระบบ (Test Results: 100% ผ่านฉลุย)

- ✅ **Member Schema สะอาด**: มีเฉพาะ `id`, `name`, `role`, `rankTitle`, `avatar`, `facebook`, `discord`
- ✅ **ไม่มี Webhook**: ล้าง Webhook ทุกจุดออกหมดจด ไม่มีการยิงแจ้งเตือนขยะ
- ✅ **บัตร 3D Hologram Syndicate ID Card**: เมื่อคนคลิกดูสมาชิกใน `members.html` จะเด้งเข้าบัตร 3D ทันที โดยมีปุ่ม Facebook และ Discord อยู่ด้านล่าง
- ✅ **Discord Bot Control Panel (`/panel`)**:
  - กดปุ่ม **➕ เพิ่ม / อัปเดตสมาชิก** -> เด้งหน้าต่าง Modal ให้กรอกข้อมูล 5 ช่อง
  - กดปุ่ม **❌ ลบสมาชิก** -> เด้งหน้าต่าง Modal ให้กรอกชื่อสมาชิก
  - บันทึกลง `data/members.json` ทันที และซิงก์ขึ้นหน้าเว็บแบบ Real-Time อัตโนมัติ

---

## 🌐 คำแนะนำเรื่องการ Deploy ไปยัง Netlify

> ⚠️ **ข้อควรรู้สำคัญเกี่ยวกับ Netlify:**
> Netlify เป็นผู้ให้บริการโฮสติ้งหน้าเว็บแบบ **Static Web Hosting** (HTML, CSS, JavaScript)
> - **หน้าเว็บ Westwood** (รวมบัตร 3D, ระบบเสียง, รายชื่อ Roster) สามารถเอาขึ้น Netlify ได้เลย **เปิดได้ทันที สวยงาม 100%**
> - แต่ **Discord Bot** จำเป็นต้องรัน Node.js ตลอด 24 ชั่วโมง (เชื่อมต่อ WebSocket ค้างไว้) ซึ่ง Netlify ไม่รองรับการรัน Background Bot ตลอดเวลา

---

### ทางเลือกที่ 1: แนะนำที่สุด ⭐️⭐️⭐️⭐️⭐️ (จบในที่เดียว เว็บ + บอท รัน 24 ชม. ฟรี)
**ใช้ Render.com หรือ Railway.app**

1. เอาโค้ดโปรเจกต์นี้ขึ้น GitHub Repository ของคุณ
2. สมัครใช้งาน [Render.com](https://render.com) (ฟรี)
3. กด **New +** -> เลือก **Web Service** -> เชื่อมกับ GitHub Repo
4. ตั้งค่า:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. ในแท็บ **Environment Variables** เพิ่มค่าจากไฟล์ `.env`:
   - `DISCORD_TOKEN` = `โทเค็นบอทของคุณ`
   - `CLIENT_ID` = `ไอดีบอทของคุณ`
   - `GUILD_ID` = `ไอดีเซิร์ฟเวอร์ดิสคอร์ดของคุณ`
   - `PORT` = `3000`
6. กด **Deploy Web Service**
   - 🎉 **เสร็จสิ้น!** คุณจะได้ทั้ง URL หน้าเว็บ และ Discord Bot จะออนไลน์พร้อมใช้งานคำสั่ง `/panel` ตลอด 24 ชั่วโมง

---

### ทางเลือกที่ 2: ใช้ Netlify โฮสต์หน้าเว็บ + รันบอทแยก
**กรณีต้องการใช้ Netlify จริงๆ:**

1. **ฝั่งหน้าเว็บ (Netlify)**:
   - ลากโฟลเดอร์โปรเจกต์นี้ไปวางที่ [Netlify Drop](https://app.netlify.com/drop) หรือเชื่อมต่อผ่าน GitHub
   - ระบบได้เตรียมไฟล์ `netlify.toml` ไว้ให้แล้ว หน้าเว็บจะเปิดใช้งานได้ทันที มีข้อมูลสมาชิกตั้งต้นจาก `data/members.json`
2. **ฝั่ง Discord Bot**:
   - รันบอทบนคอมพิวเตอร์ของคุณเอง (`npm run bot`) หรือรันบนโฮสต์ฟรีอย่าง Render / VPS
   - หากต้องการให้เว็บ Netlify ซิงก์ข้อมูลสดกับบอทที่รันบน Render ให้เปิดไฟล์ `netlify.toml` แล้วเปิดใช้งานส่วน Proxy:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend.onrender.com/api/:splat"
     status = 200
     force = true
   ```

---

## 🛠️ คำสั่งสำหรับรันในเครื่อง (Local Run)

```bash
# 1. ติดตั้งแพ็กเกจ
npm install

# 2. ลงทะเบียน Slash Commands เข้าเซิร์ฟเวอร์ดิสคอร์ด
npm run deploy-commands

# 3. รันทั้งเซิร์ฟเวอร์เว็บและบอทพร้อมกัน
npm start

# 4. ทดสอบความถูกต้องของระบบ
npm test
```
