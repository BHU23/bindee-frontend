export const priceChanged = {
  title: {
    PRICE_UPDATED: "ราคาเปลี่ยนแปลง",
    FARE_SOLD_OUT: "ที่นั่งราคานี้หมดแล้ว",
  },
  reason: {
    PRICE_UPDATED: "ราคาตั๋วมีการปรับเปลี่ยนระหว่างที่คุณเลือก",
    FARE_SOLD_OUT: "ที่นั่งในราคานี้ถูกจองไปแล้ว กรุณาเลือกเที่ยวบินใหม่",
  },
  oldPrice: "ราคาเดิม",
  newPrice: "ราคาใหม่",
  diff: "ส่วนต่าง",
  alternativesHint: "เที่ยวบินอื่นที่ยังมีที่นั่ง",
  alternativeFrom: "เริ่มต้น {{price}}",
  accept: "ยอมรับราคาใหม่",
  accepting: "กำลังดำเนินการ...",
  back: "กลับไปเลือกเที่ยวบิน",
} as const;
