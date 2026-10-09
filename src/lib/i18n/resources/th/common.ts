export const common = {
  close: "ปิด",
  back: "ย้อนกลับ",
  retry: "ลองอีกครั้ง",
  loading: "กำลังโหลด",
  notFound: {
    title: "ไม่พบหน้าที่ต้องการ",
    description: "หน้านี้อาจถูกย้ายหรือลิงก์ไม่ถูกต้อง",
    home: "กลับหน้าแรก",
  },
  error: {
    network: "เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
    unknown: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
  },
  combobox: {
    open: "เปิดรายการ",
    empty: "ไม่พบรายการที่ค้นหา",
  },
  counter: {
    decrease: "ลด {{label}}",
    increase: "เพิ่ม {{label}}",
  },
  priceSummary: {
    includesTaxes: "รวมภาษีและค่าธรรมเนียมแล้ว",
    total: "ยอดรวม",
  },
  countdown: {
    calm: "ที่นั่งถูกกันไว้ให้คุณ เหลือเวลา {{time}} นาที",
    urgent: "เหลือเวลา {{time}} นาที ชำระเงินให้เสร็จเพื่อคงที่นั่งไว้",
    pnr: "รหัสจอง {{pnr}}",
  },
  testMode: {
    default: "โหมดทดสอบ: การชำระเงินเป็นการจำลอง ไม่มีการตัดเงินจริง",
  },
  steps: {
    label: "ขั้นตอนการจอง",
  },
  icon: {
    plane: "เครื่องบิน",
  },
} as const;
