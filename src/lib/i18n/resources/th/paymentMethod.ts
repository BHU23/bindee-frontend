export const paymentMethod = {
  title: "เลือกวิธีชำระเงิน",
  steps: {
    flight: "เที่ยวบิน",
    passengers: "ผู้โดยสาร",
    extras: "บริการเสริม",
    review: "ตรวจสอบ",
    pay: "ชำระเงิน",
  },
  legend: "วิธีชำระเงิน",
  comingSoon: "เร็ว ๆ นี้",
  method: {
    CARD: { label: "บัตรเครดิต / เดบิต", hint: "ใช้บัตรทดสอบเท่านั้น" },
    PROMPTPAY_QR: { label: "PromptPay QR", hint: "สแกน QR เพื่อชำระเงิน" },
    MOBILE_BANKING: {
      label: "Mobile banking",
      hint: "KB, SCB, KS, BBL, ttb",
    },
  },
  pay: "ชำระเงิน {{amount}}",
  paying: "กำลังเริ่มการชำระเงิน",
  error: {
    expired: "หมดเวลาการจองแล้ว กรุณาค้นหาเที่ยวบินใหม่",
    invalidState: "การจองนี้ไม่สามารถชำระเงินได้แล้ว",
    failed: "เริ่มการชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง",
  },
} as const;
