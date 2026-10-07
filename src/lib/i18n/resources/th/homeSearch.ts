export const homeSearch = {
  title: "ค้นหาเที่ยวบิน",
  subtitle: "เลือกเส้นทางและวันเดินทาง แล้วเริ่มค้นหาได้เลย",
  tripType: {
    label: "ประเภทการเดินทาง",
    roundTrip: "ไป-กลับ",
    oneWay: "เที่ยวเดียว",
  },
  field: {
    origin: "ต้นทาง",
    destination: "ปลายทาง",
    departDate: "วันเดินทางไป",
    returnDate: "วันเดินทางกลับ",
    cabin: "ชั้นโดยสาร",
    swap: "สลับต้นทางและปลายทาง",
    selectAirport: "เลือกสนามบิน",
  },
  cabin: { economy: "ชั้นประหยัด" },
  pax: {
    adults: "ผู้ใหญ่",
    adultsHint: "อายุ 12 ปีขึ้นไป",
    children: "เด็ก",
    childrenHint: "อายุ 2-11 ปี",
    infants: "ทารก",
    infantsHint: "ต่ำกว่า 2 ปี",
    limitTotal: "ผู้ใหญ่และเด็กรวมกันได้ไม่เกิน 9 ท่าน",
    limitInfants: "ทารกต้องมีผู้ใหญ่ดูแลท่านละ 1 คน",
  },
  error: {
    required: "กรุณาระบุข้อมูลนี้",
    sameAirport:
      "ต้นทางและปลายทางต้องไม่ใช่สนามบินเดียวกัน กรุณาเลือกปลายทางใหม่",
    pastDate: "เลือกวันที่ตั้งแต่วันนี้เป็นต้นไป",
    returnBeforeDepart: "วันกลับต้องไม่ก่อนวันเดินทางไป",
    invalid: "ข้อมูลนี้ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
  },
  submit: "ค้นหาเที่ยวบิน",
  submitting: "กำลังค้นหา",
  submitError: {
    inventoryUnavailable:
      "ระบบค้นหาเที่ยวบินขัดข้องชั่วคราว ข้อมูลของคุณยังอยู่ ลองอีกครั้งได้เลย",
    network: "เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
    unknown: "ค้นหาไม่สำเร็จ กรุณาลองอีกครั้ง",
  },
  promoLink: "มีโค้ดส่วนลด?",
  recent: {
    title: "ค้นหาล่าสุด",
    pax: "{{count}} ท่าน",
    roundTrip: "ไป-กลับ",
    oneWay: "เที่ยวเดียว",
  },
  popular: {
    title: "เส้นทางยอดนิยม",
    from: "เริ่มต้น {{price}} / ท่าน รวมภาษี",
    noSeats: "ที่นั่งเต็มช่วงนี้",
    error: "โหลดเส้นทางยอดนิยมไม่สำเร็จ",
  },
  promotions: {
    title: "โปรโมชันสำหรับคุณ",
    code: "โค้ด {{code}}",
    validUntil: "ใช้ได้ถึง {{date}}",
    error: "โหลดโปรโมชันไม่สำเร็จ",
  },
  support: {
    title: "ต้องการความช่วยเหลือ?",
  },
} as const;
