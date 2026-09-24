# ขั้นตอนการ Deploy ผ่าน GitHub Pages (ฟรีและรวดเร็ว)

ระบบได้รับการตั้งค่าไฟล์คอนฟิกและ **GitHub Actions Workflow** อัตโนมัติไว้ให้เรียบร้อยแล้ว (`.github/workflows/deploy.yml` และ `base: './'` ใน `vite.config.ts`)

---

### วิธีที่ 1: ส่งออกโค้ดขึ้น GitHub ผ่าน AI Studio (ง่ายที่สุด)
1. มองหาปุ่ม **"Export"** หรือไอคอน **GitHub** ที่มุมบนขวาของหน้าต่าง Google AI Studio
2. เลือก **"Export to GitHub"** หรือ **"Create repository"**
3. เลือกบัญชี GitHub ของคุณและตั้งชื่อ Repository จากนั้นกดยืนยัน

---

### วิธีที่ 2: ใช้ Git Push จากเครื่องคอมพิวเตอร์ของคุณ
หากคุณดาวน์โหลดโค้ดมาที่เครื่อง ให้รันคำสั่งต่อไปนี้ใน Terminal:

```bash
git init
git add .
git commit -m "Initial commit for Government Loan Register"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

---

### ขั้นตอนสุดท้าย: เปิดใช้งาน GitHub Pages ใน Repository
หลังจากโค้ดขึ้นไปบน GitHub แล้ว:
1. ไปที่ Repository ของคุณบน GitHub
2. คลิกแท็บ **Settings** (การตั้งค่า)
3. เมนูด้านซ้ายเลือก **Pages**
4. ในหัวข้อ **Build and deployment** > **Source** ให้เลือกเป็น:
   👉 **`GitHub Actions`**
5. ระบบจะทำการ Build และ Deploy เว็บไซต์ของคุณให้อัตโนมัติทันที
6. เมื่อเสร็จสิ้น จะได้ URL เว็บไซต์ เช่น: `https://<your-username>.github.io/<repo-name>/`
