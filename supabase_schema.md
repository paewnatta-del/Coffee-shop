# การออกแบบฐานข้อมูล (Supabase Table Design)
**อ้างอิงจาก SRS ระบบรับจองโต๊ะร้านกาแฟ (Coffee Shop Table Reservation System)**

---

## 1. ชื่อตาราง (Table Name)
`bookings`

---

## 2. โครงสร้างคอลัมน์ (Columns & Data Types)

| ชื่อคอลัมน์ (Column Name) | ประเภทข้อมูล (Data Type) | ข้อจำกัด (Constraints / Default) | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` | รหัสอ้างอิงของแถวข้อมูล (ไม่ซ้ำกัน) |
| `created_at` | `timestamptz` | Not Null, Default: `now()` | วันและเวลาที่มีการทำรายการจองเข้าระบบ |
| `booking_ref` | `text` | Unique, Not Null | รหัสการจองสำหรับให้ลูกค้าใช้อ้างอิง (เช่น BB-10293) |
| `customer_name` | `text` | Not Null | ชื่อ-นามสกุล ของลูกค้าที่ทำการจอง |
| `phone_number` | `text` | Not Null | เบอร์โทรศัพท์ลูกค้า (เอาไว้ติดต่อกรณีมีปัญหา) |
| `booking_date` | `date` | Not Null | วันที่จองโต๊ะเข้ามารับบริการ |
| `time_slot` | `text` | Not Null | รอบเวลาที่เลือก เช่น "10:00 - 11:30 น." |
| `guests_count` | `int2` (smallint) | Not Null | จำนวนแขกที่มาใช้บริการ |
| `special_requests`| `text` | Nullable | หมายเหตุหรือความต้องการพิเศษ (ถ้ามี) |
| `status` | `text` (หรือ `enum`) | Not Null, Default: `'Booked'` | สถานะการจอง (Booked, Arrived, No-show, Cancelled) |

*หมายเหตุ: สามารถตั้งค่า `status` เป็น Custom Enum Type ใน Supabase หรือใช้ Text ธรรมดาพร้อมทำ Validation ก็ได้*

---

## 3. ข้อมูลตัวอย่าง (Sample Data 5 แถว)

| id | created_at | booking_ref | customer_name | phone_number | booking_date | time_slot | guests_count | special_requests | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `123e...` | 2026-06-21 08:30:00 | BB-59302 | สมชาย ใจดี | 0812345678 | 2026-06-22 | 10:00 - 11:30 น. | 2 | ขอโต๊ะริมหน้าต่าง | Booked |
| `456f...` | 2026-06-21 09:15:22 | BB-10495 | สมหญิง รักสวย | 0898765432 | 2026-06-22 | 13:00 - 14:30 น. | 4 | มีเด็กเล็กมาด้วย 1 คน | Booked |
| `789a...` | 2026-06-21 11:00:45 | BB-88432 | ธนาธร ก้าวไกล | 0845556666 | 2026-06-21 | 14:30 - 16:00 น. | 1 | - | Arrived |
| `012b...` | 2026-06-21 13:40:10 | BB-22941 | มาลี สีสด | 0821112222 | 2026-06-21 | 16:00 - 17:30 น. | 3 | แพ้นมวัว | Cancelled|
| `345c...` | 2026-06-21 14:05:00 | BB-77390 | วิชาญ สายชิล | 0869998888 | 2026-06-23 | 11:30 - 13:00 น. | 2 | - | Booked |

---

## 4. คำแนะนำสำหรับหน้าเว็บ (Frontend Read/Write Strategy)

เพื่อให้การทำงานกับ Supabase ปลอดภัยและมีประสิทธิภาพ ควรจัดการข้อมูลดังนี้:

### การเขียนข้อมูล (Write / Insert) - ฝั่งลูกค้า (Customer)
1. **Insert Booking:** เมื่อลูกค้ากดส่งฟอร์ม หน้าเว็บจะใช้คำสั่ง `.insert()` ของ Supabase SDK ส่งข้อมูลเข้าไปในตาราง `bookings` (หน้าเว็บจะต้อง Generate `booking_ref` 5-6 หลักก่อนบันทึก)
2. **Row Level Security (RLS):** เนื่องจากลูกค้าไม่ต้อง Login (Guest Checkout) ควรตั้งค่า RLS ให้ **"อนุญาตให้ Insert ข้อมูลได้แบบ Anonymous (public)"** แต่ **"ไม่อนุญาตให้ Select ข้อมูลทั้งหมด (เพื่อป้องกันคนดึงข้อมูลลูกค้าคนอื่น)"**

### การอ่านข้อมูล (Read / Fetch) - ฝั่งลูกค้า (เช็คคิวเต็ม)
1. **Availability Check:** ในหน้าจอจองคิว เมื่อลูกค้าเลือก "วันที่" ระบบควรใช้ `.select('time_slot, guests_count').eq('booking_date', selectedDate)` เพื่อดึงว่าในวันนั้นมีคนจองรอบไหนไปแล้วบ้าง 
2. หน้าเว็บคำนวณว่ารอบเวลาไหนเต็มแล้ว และทำการ Disabled ปุ่ม/Dropdown ของรอบนั้นๆ

### การอ่าน/เขียนข้อมูล (Read/Update) - ฝั่งพนักงาน (Admin)
1. **Real-time Updates:** หน้า Admin Dashboard ควรใช้ **Supabase Realtime** (`.on('postgres_changes', ...)`) เพื่อให้ตารางคิวจองเด้งขึ้นมาบนหน้าจอของพนักงานทันทีที่มีลูกค้าจองสำเร็จ (ไม่ต้องกด Refresh)
2. **Status Update:** เมื่อพนักงานกดเช็คอิน หรือลูกค้ายกเลิกคิว หน้าเว็บจะใช้คำสั่ง `.update({ status: 'Arrived' }).eq('id', booking_id)` 
3. **RLS สำหรับ Admin:** ควรป้องกันตารางให้เฉพาะผู้ที่ Login ผ่าน Supabase Auth (Role: Authenticated) เท่านั้นถึงจะอ่านและอัปเดตข้อมูลทั้งหมดได้
