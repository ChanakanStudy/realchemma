# CHEMMA: System Flow & Developer Guide (คู่มือการต่อยอดระบบ)

คู่มือนี้สรุปการทำงานของระบบทั้งหมดตั้งแต่หน้าแรก (Main Menu) จนถึงระบบสุดท้าย (Battle & AI Backend) เพื่อให้นักพัฒนาสามารถนำไปพัฒนาต่อยอดได้ง่ายขึ้น

---

## 1. การเริ่มต้นของระบบ (System Entry Point)
ทุกอย่างเริ่มต้นที่ **`frontend/src/App.jsx`** ซึ่งทำหน้าที่เป็น **Global State Manager**

### ไฟล์สำคัญ:
- **`App.jsx`**: ควบคุม `gameState` (`MENU`, `GAME`, `BATTLE`) และจัดการ UI Overlay (Chat, HUD)
- **`index.css`**: จัดการดีไซน์และแอนิเมชันทั้งหมดของหน้าหลัก

### การทำงาน:
1. เมื่อเปิดแอป `gameState` จะถูกเซ็ตเป็น `'MENU'` แสดงหน้า Title Screen
2. เมื่อคลิก "ENTER ACADEMY" ฟังก์ชัน `enterGame()` จะถูกเรียกเพื่อเปลี่ยนสถานะเป็น `'GAME'` และแสดงผล Phaser Canvas

---

## 2. โลกของเกมและการสำรวจ (Game World & Exploration)
ระบบการเดินในแผนที่ใช้ **Phaser 3 Engine**

### ไฟล์สำคัญ:
- **`src/game/phaserGame.js`**: ตัวเริ่มต้น (Initializer) ของ Phaser
- **`src/scenes/WorldScene.js`**: บรรจุ Logic การเดิน, การชน (Collisions), และการโต้ตอบกับ NPC

### การต่อยอด:
- หากต้องการเพิ่มแผนที่ใหม่: แก้ไข `WorldScene.js` ในส่วนของการโหลด Tilemap JSON
- หากต้องการเพิ่ม NPC: เพิ่ม Object ใน Tiled Map และดักจับการชนใน `WorldScene.js`

---

## 3. ระบบสื่อสารระหว่าง Phaser และ React (Cross-Engine Bridge)
เนื่องจาก Phaser ทำงานบน Canvas และ UI ส่วนใหย่ทำงานบน React จึงต้องมี "สะพาน" เชื่อมต่อผ่าน **`window` object**

### ตัวอย่าง Bridge ใน `App.jsx`:
- `window.openChat()`: เรียกจาก Phaser เพื่อเปิดหน้าต่างแชทใน React
- `window.startBattle()`: เรียกจาก Phaser เพื่อเข้าสู่โหมดต่อสู้ใน React

> **[TIP]** หากต้องการเพิ่มระบบใหม่ (เช่น กระเป๋าเป้หรือ Inventory) ให้สร้างฟังก์ชันใน `window` เพื่อให้ Phaser เรียกใช้ได้

---

## 4. ระบบ AI Lab Assistant (NPC Chat)
ระบบแชทใช้การสื่อสารแบบ Client-Server กับ AI

### ลำดับการทำงาน (Flow):
1. **Frontend (`App.jsx`)**: รับ Input จากผู้ใช้
2. **API Client (`src/api/client.js`)**: ส่งค่าไปยัง Backend `/api/npc-chat`
3. **Backend (`backend/app/routes/npc.py`)**: รับ Request และส่งต่อให้ `npc_service.py`
4. **AI Processing**: `npc_service` เรียกใช้ **Gemini API** พร้อมระบุ Persona (Lab Assistant)
5. **Response**: ส่งคำตอบกลับมาแสดงผลในหน้าจอแชทแบบ Real-time

---

## 5. ระบบการต่อสู้ (Battle System)
ระบบต่อสู้เป็น Component แยกต่างหากที่เขียนด้วย React ทั้งหมดเพื่อความยืดหยุ่นในการทำ UI ที่ซับซ้อน

### ไฟล์สำคัญ:
- **`src/components/battle/BattleScene.jsx`**: หน้าจอหลักของการต่อสู้
- **`src/systems/battle/battleLogic.js`**: คำนวณความเสียหายและการแพ้ทางธาตุเคมี

### การต่อยอด:
- แก้ไขพลังโจมตีหรือสูตรการคำนวณใน `battleLogic.js`
- เพิ่มเอฟเฟกต์การแสดงผลใน `BattleScene.jsx`

---

## 6. โครงสร้าง Backend (FastAPI Architecture)
Backend ถูกออกแบบมาให้เป็น Service-Oriented เพื่อให้ขยายระบบได้ง่าย

### โครงสร้างโฟลเดอร์:
- **`routes/`**: สำหรับเพิ่ม API Endpoints ใหม่ (เช่น ระบบ Save เกม, ระบบสุ่มไอเทม)
- **`services/`**: สำหรับเก็บ Logic ธุรกิจ (เช่น การติดต่อ AI, การคำนวณเคมีระดับสูง)
- **`models/`**: สำหรับกำหนดโครงสร้างข้อมูล (Schemas)

---

---

## 7. ระบบ RPG ขั้นสูง (Advanced RPG Systems)
เราได้เพิ่มระบบเหล่านี้เพื่อความสมบูรณ์ของเกม:
- **Quest System**: จัดการผ่าน `userData.quests` แสดงผลใน Quest Log
- **Leveling System**: มีการสะสม XP และการ Level Up อัตโนมัติพร้อมการแจ้งเตือน
- **Inventory & Lab**: ระบบกระเป๋าเก็บธาตุเคมีและห้องแล็บสำหรับผสมสาร
- **Story Overlay**: ระบบแสดงเนื้อเรื่องแบบ Pop-up เพื่อขับเคลื่อน Narrative

## วิธีการนำไปต่อยอด (Next Steps)
1. **เพิ่มเควส**: สร้าง API Endpoint ใหม่ใน Backend เพื่อเก็บสถานะเควส และเชื่อมต่อกับ `WorldScene.js`
2. **เพิ่มระบบธาตุ**: ขยาย `battleLogic.js` ให้รองรับการผสมสารเคมีที่ซับซ้อนขึ้น
3. **เปลี่ยนธีม**: แก้ไขตัวแปร CSS ใน `:root` ของ `index.css` เพื่อเปลี่ยน Mood & Tone ของ UI ทั้งระบบ

---
*เอกสารนี้จัดทำขึ้นเพื่อให้เห็นภาพรวมของระบบ CHEMMA ทั้งหมด (อัปเดตระบบ RPG 2026-03-24)*
