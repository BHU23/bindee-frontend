export const reviewHold = {
  title: "ตรวจสอบและยืนยัน",
  steps: {
    flight: "เที่ยวบิน",
    passengers: "ผู้โดยสาร",
    extras: "บริการเสริม",
    review: "ตรวจสอบ",
    pay: "ชำระเงิน",
  },
  edit: "แก้ไข",
  itinerary: {
    title: "เที่ยวบิน",
    outbound: "เที่ยวบินขาไป",
    inbound: "เที่ยวบินขากลับ",
    editLabel: "แก้ไขเที่ยวบิน",
    fare: {
      LITE: "Lite",
      VALUE: "Value",
      FLEX: "Flex",
    },
    fareLabel: "ตั๋ว {{family}}",
  },
  passengers: {
    title: "ผู้โดยสาร",
    editLabel: "แก้ไขผู้โดยสาร",
    type: {
      adult: "ผู้ใหญ่",
      child: "เด็ก",
      infant: "ทารก",
    },
  },
  price: {
    title: "รายละเอียดราคา",
    outbound: "เที่ยวบินขาไป",
    inbound: "เที่ยวบินขากลับ",
  },
  terms: {
    label:
      "ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขการเดินทางและเงื่อนไขการให้บริการของ Bin Dee",
    error: "กรุณายอมรับเงื่อนไขเพื่อไปชำระเงิน",
  },
  confirm: "ไปชำระเงิน",
  confirming: "กำลังยืนยันการจอง",
  booked: "สร้างการจองแล้ว ขั้นตอนเลือกวิธีชำระเงินจะเปิดให้ใช้งานในเร็ว ๆ นี้",
  error: {
    expired: "ผลการค้นหาหมดอายุแล้ว กรุณาค้นหาเที่ยวบินใหม่",
    failed: "ยืนยันการจองไม่สำเร็จ กรุณาลองอีกครั้ง",
  },
} as const;
