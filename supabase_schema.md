# การออกแบบฐานข้อมูล (Supabase Table Design)

## ชื่อตาราง (Table Name)
`reservation`

---

## โครงสร้างคอลัมน์ (Columns & Data Types)

| ชื่อคอลัมน์ (Column Name) | ประเภทข้อมูล (Data Type) | ข้อจำกัด (Constraints / Default) | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` | รหัสอ้างอิงของแถวข้อมูล (ไม่ซ้ำกัน) |
| `created_at` | `timestamptz` | Not Null, Default: `now()` | วันและเวลาที่มีการทำรายการจองเข้าระบบ |
| `booking_ref` | `text` | Unique, Not Null | รหัสการจองสำหรับให้ลูกค้าใช้อ้างอิง (เช่น BB-10293) |
| `customer_name` | `text` | Not Null | ชื่อ-นามสกุล ของลูกค้าที่ทำการจอง |
| `phone_number` | `text` | Not Null | เบอร์โทรศัพท์ลูกค้า |
| `booking_date` | `date` | Not Null | วันที่จองโต๊ะเข้ามารับบริการ |
| `time_slot` | `text` | Not Null | รอบเวลาที่เลือก เช่น "10:00 - 11:30 น." |
| `guests_count` | `int2` (smallint) | Not Null | จำนวนแขกที่มาใช้บริการ |
| `special_requests`| `text` | Nullable | หมายเหตุหรือความต้องการพิเศษ (ถ้ามี) |
| `status` | `text` | Not Null, Default: `'Booked'` | สถานะการจอง (Booked, Arrived, No-show, Cancelled) |

---

## ข้อมูลตัวอย่าง (Sample Data 5 แถว)

| id | created_at | booking_ref | customer_name | phone_number | booking_date | time_slot | guests_count | special_requests | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `123e...` | 2026-06-21 08:30:00 | BB-59302 | สมชาย ใจดี | 0812345678 | 2026-06-22 | 10:00 - 11:30 น. | 2 | ขอโต๊ะริมหน้าต่าง | Booked |
| `456f...` | 2026-06-21 09:15:22 | BB-10495 | สมหญิง รักสวย | 0898765432 | 2026-06-22 | 13:00 - 14:30 น. | 4 | มีเด็กเล็กมาด้วย 1 คน | Booked |
| `789a...` | 2026-06-21 11:00:45 | BB-88432 | ธนาธร ก้าวไกล | 0845556666 | 2026-06-21 | 14:30 - 16:00 น. | 1 | - | Arrived |
| `012b...` | 2026-06-21 13:40:10 | BB-22941 | มาลี สีสด | 0821112222 | 2026-06-21 | 16:00 - 17:30 น. | 3 | แพ้นมวัว | Cancelled|
| `345c...` | 2026-06-21 14:05:00 | BB-77390 | วิชาญ สายชิล | 0869998888 | 2026-06-23 | 11:30 - 13:00 น. | 2 | - | Booked |

---

## คำสั่ง SQL สำหรับสร้างตาราง (SQL Create Table)

```sql
CREATE TABLE reservation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    booking_ref TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    guests_count SMALLINT NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'Booked'
);

-- เพิ่ม Comment เพื่ออธิบายตาราง
COMMENT ON TABLE reservation IS 'ตารางบันทึกการจองโต๊ะร้านกาแฟ';
COMMENT ON COLUMN reservation.booking_ref IS 'รหัสการจองใช้อ้างอิงกับลูกค้า';
```
