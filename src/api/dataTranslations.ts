// English renderings of *data* stored in Thai in the database (order titles, resources, cash events, etc.).
// The TH/EN switch translates UI text via src/i18n; API data goes through this file in English mode.
//
// Rules:
//   - Only text listed here is translated; unknown text is shown unchanged (no guessed translations).
//   - Numbers always come from the record itself (the regex rules below only move them into the English sentence).
//   - IDs, order_ref, and values without Thai characters are never touched.
// New records entered later stay in Thai; full coverage would need both languages stored in the database.

const exact: Record<string, string> = {
  // Order
  "ศูนย์กระจายสินค้า ลาดกระบัง": "Lat Krabang Distribution Center",
  "มัดจำ 20% ชำระส่วนที่เหลือเครดิต 30 วันหลังส่งมอบ": "20% deposit, balance on 30-day credit after delivery",
  // Shops in the group
  "ครัวกลางอาหารพร้อมทาน": "Ready-meal central kitchen",
  "โรงงานแปรรูปขนาดเล็ก": "Small processing plant",
  "บรรจุภัณฑ์และแพ็กกิ้ง": "Packaging and packing",
  "เงินสดเพียงพอ": "enough cash",
  "ต้นทุนต่อหน่วยต่ำสุดในกลุ่ม": "lowest unit cost in the group",
  "กำลังผลิตว่างเต็ม 400 กล่อง/วัน แต่เงินสดเหนือเงินสำรองเพียง 30,000 บาท": "Full 400 boxes/day capacity free, but cash is only ฿30,000 above the reserve",
  "นนทบุรี": "Nonthaburi",
  "ปทุมธานี": "Pathum Thani",
  "สมุทรปราการ": "Samut Prakan",
  "ครัวมาตรฐาน GMP": "GMP-certified kitchen",
  "ห้องเย็น": "Cold room",
  "รับงานด่วน": "Takes rush jobs",
  "แปรรูป": "Processing",
  "ต้องการเงินทุนหมุนเวียน": "Needs working capital",
  "บรรจุภัณฑ์รักษ์โลก": "Eco-friendly packaging",
  "ซีลสูญญากาศ": "Vacuum sealing",
  // Funding sources
  "สินเชื่อระยะยาว": "Long-term loan",
  "สินเชื่อตามใบสั่งซื้อ": "Purchase-order financing",
  "ขายลดลูกหนี้การค้า": "Invoice factoring",
  "เงินให้เปล่า/ทุนสนับสนุน": "Grant / support fund",
  // UNLOCK resources
  "ครัวกลางมาตรฐาน GMP พร้อมห้องเย็น": "GMP central kitchen with cold room",
  "ครัวกลาง": "Central kitchen",
  "เครื่องซีลสูญญากาศกำลังสูง": "High-capacity vacuum sealer",
  "เครื่องจักร": "Machinery",
  "รถห้องเย็น 4 ล้อ ควบคุมอุณหภูมิ": "4-wheel temperature-controlled refrigerated truck",
  "ขนส่งห้องเย็น": "Cold-chain transport",
  "ว่างทุกวันจันทร์–ศุกร์": "Available Monday–Friday",
  "ถ้าถอนครัวกลางออก ต้องเช่าครัวภายนอกที่ค่าเช่าสูงกว่าและเสียเวลาขนย้าย": "Without the central kitchen, an outside kitchen must be rented at a higher cost, with extra transfer time",
  "ถ้าไม่มีเครื่องซีล ต้องแพ็กมือซึ่งช้าลงและอายุสินค้าสั้นลง": "Without the sealer, packing is done by hand, which is slower and shortens shelf life",
  "ถ้าไม่มีรถห้องเย็น ต้องใช้ขนส่งภายนอกและเสี่ยงของเสียระหว่างทาง": "Without the refrigerated truck, outside transport is needed and goods risk spoiling on the way",
  "ครัวกลางของตัวเอง ใช้ผลิตส่วนแบ่งหลัก": "Own central kitchen, used for the main share",
  "ต้องใช้รถห้องเย็นส่งของทุกวัน": "Needs the refrigerated truck for daily deliveries",
  "ไม่มีครัวมาตรฐานของตัวเอง ต้องเช่าใช้": "Has no certified kitchen of its own and must rent one",
  "ต้องใช้รถห้องเย็นร่วมกัน": "Shares the refrigerated truck",
  "ถ้ามีเครื่องซีลจะเร็วขึ้น แต่แพ็กมือได้": "Faster with the sealer, but can pack by hand",
  // Cash events
  "รับเงินมัดจำ 20% จากผู้ซื้อ": "Receive 20% deposit from buyer",
  "มัดจำตามสัญญา PO-STP-2026-091": "Deposit under contract PO-STP-2026-091",
  "ซื้อวัตถุดิบล็อตแรก": "Buy first batch of ingredients",
  "ผู้จำหน่ายวัตถุดิบ": "Ingredient supplier",
  "ต้องจ่ายสดก่อนเริ่มผลิต": "Must be paid in cash before production starts",
  "ค่าแรงและค่าสาธารณูปโภคช่วงผลิต": "Labor and utilities during production",
  "ค่าแรงรายงวดระหว่างการผลิต": "Periodic wages during production",
  "ซื้อวัตถุดิบล็อตสอง": "Buy second batch of ingredients",
  "เติมวัตถุดิบครึ่งหลังของออเดอร์": "Restock ingredients for the second half of the order",
  "ชำระค่างวดสินเชื่อและดอกเบี้ย": "Loan installment and interest",
  "ค่างวดตามตารางชำระหนี้": "Installment per the repayment schedule",
  "ส่งมอบงวดสุดท้าย": "Final delivery",
  "ครบกำหนดส่งมอบตามสัญญา": "Delivery due under the contract",
  "รับชำระส่วนที่เหลือ 80%": "Receive remaining 80% payment",
  "เครดิต 30 วันหลังส่งมอบ": "30-day credit after delivery",
  // Costs
  "ต้นทุนขาย (COGS)": "Cost of goods sold (COGS)",
  "ค่าใช้จ่ายดำเนินงาน": "Operating expenses",
  "ดอกเบี้ยจ่าย": "Interest expense",
  "ภาษี": "Tax",
  "ค่าแรง": "Labor",
  "วัตถุดิบ": "Ingredients",
  "สาธารณูปโภค": "Utilities",
  // Products and sales channels
  "ข้าวกล่องแกงเขียวหวานไก่": "Green curry chicken rice box",
  "ข้าวกล่องผัดกะเพราหมู": "Stir-fried basil pork rice box",
  "ชุดอาหารเช้าพร้อมทาน": "Ready-to-eat breakfast set",
  "น้ำพริกแกงบรรจุถุง": "Packaged curry paste",
  "อาหารพร้อมทาน": "Ready meals",
  "เครื่องปรุง": "Seasonings",
  "แพลตฟอร์มเดลิเวอรี": "Delivery platforms",
  "ขายตรงหน้าร้าน": "In-store sales",
  "ขายส่งให้ร้านค้า": "Wholesale to retailers",
  // Funders / projects
  "เงินทุนหมุนเวียนซื้อวัตถุดิบและค่าแรงช่วงผลิต": "Working capital for ingredients and wages during production",
  "ยังไม่ครบ": "Incomplete",
  "ใบสั่งซื้อจากผู้ซื้อ (PO)": "Buyer purchase order (PO)",
  "ใบรับรอง GMP ของครัวกลาง": "Central kitchen GMP certificate",
  "สัญญาขนส่งควบคุมอุณหภูมิ": "Temperature-controlled transport contract",
  "ตรวจแล้ว 2 จาก 3 ฉบับ พิจารณาวงเงินบางส่วนได้": "2 of 3 documents verified; a partial credit line can be considered",
  "พร้อมเริ่มงาน": "Ready to start",
  // Chaos scenarios
  "ผู้ซื้อเลื่อนชำระออกไป 30 วัน": "Buyer delays payment by 30 days",
  "ผู้ซื้อขอขยายเครดิตจาก 30 วันเป็น 60 วัน ทำให้เงินเข้าช้ากว่ากำหนดหนึ่งงวดเต็ม": "The buyer extends credit from 30 to 60 days, so cash arrives one full cycle late",
  "จับคู่สินเชื่อ invoice financing": "Match invoice financing",
  "ได้เงินเร็วขึ้นประมาณ 30 วัน แลกกับดอกเบี้ย 18% ต่อปี": "Cash arrives about 30 days sooner, at 18% interest per year",
  "ต่อรองขอมัดจำเพิ่ม": "Negotiate a larger deposit",
  "เสนอเพิ่มมัดจำเป็น 40%": "Propose raising the deposit to 40%",
  "ลดเงินทุนหมุนเวียนที่ต้องหาเองลงครึ่งหนึ่ง": "Halves the working capital the team must raise",
  "ร้านร่วมผลิตถอนตัวกลางทาง": "A partner shop drops out mid-order",
  "ร้านที่รับกำลังผลิตส่วนหนึ่งถอนตัว ทำให้กำลังผลิตรวมไม่ถึงเป้าของออเดอร์": "A shop carrying part of the capacity withdraws, so total capacity falls short of the order target",
  "ชวนร้านสำรองเข้าแทน": "Bring in a backup shop",
  "เปิดหารือร้านในกลุ่ม SWARM": "Open talks with shops in the SWARM group",
  "ปิดส่วนที่ขาดได้ถ้ามีร้านว่างพอ": "Closes the gap if enough shops are free",
  "ลดปริมาณส่งมอบตามที่ทำได้": "Reduce delivery volume to what is feasible",
  "ขอปรับสัญญากับผู้ซื้อ": "Ask the buyer to amend the contract",
  "เลี่ยงค่าปรับส่งมอบไม่ครบ แต่รายได้ลดลงตามสัดส่วน": "Avoids short-delivery penalties, but revenue falls proportionally",
  "ราคาวัตถุดิบขึ้น 15% กลางออเดอร์": "Ingredient prices rise 15% mid-order",
  "ราคาวัตถุดิบหลักปรับขึ้นก่อนสั่งล็อตสอง ทำให้ต้นทุนรวมสูงกว่าที่ตั้งไว้": "Key ingredient prices rise before the second batch, pushing total cost above plan",
  "เปลี่ยนผู้จำหน่ายบางรายการ": "Switch suppliers for some items",
  "เทียบราคาผู้จำหน่ายสำรอง": "Compare prices from backup suppliers",
  "ลดผลกระทบได้ประมาณ 40% ของส่วนต่างราคา": "Offsets about 40% of the price increase",
};

// Text whose numbers vary by record: capture the numbers and place them in the English sentence
const patterns: [RegExp, (...groups: string[]) => string][] = [
  [/^ออเดอร์อาหารพร้อมทาน ([\d,]+) กล่อง\/วัน (\d+) วัน$/, (n, d) => `Ready-meal order: ${n} boxes/day for ${d} days`],
  [/^ผ่อนเดือนละ ([\d,.]+) บาท เป็นเวลา (\d+) เดือน เงินเข้าบัญชีภายใน (\d+) วัน$/, (m, n, d) => `Pay ฿${m} a month for ${n} months · funds arrive within ${d} days`],
  [/^ไม่มีภาระผ่อนชำระ เงินเข้าบัญชีภายใน (\d+) วัน$/, (d) => `No repayments · funds arrive within ${d} days`],
  [/^กำลังผลิตเหลือ ([\d,]+) กล่อง\/วัน (.+)$/, (n, rest) => `${n} boxes/day capacity left, ${translateText(rest)}`],
  [/^รองรับ ([\d,]+) กล่อง\/วัน$/, (n) => `Handles ${n} boxes/day`],
  [/^บรรทุก ([\d,]+) กล่อง\/เที่ยว$/, (n) => `Carries ${n} boxes/trip`],
  [/^ซีลได้ ([\d,]+) ชิ้น\/ชั่วโมง$/, (n) => `Seals ${n} pieces/hour`],
  [/^([\d,]+) บาท\/วัน$/, (n) => `฿${n}/day`],
  [/^([\d,]+) บาท\/เที่ยว$/, (n) => `฿${n}/trip`],
  [/^ว่าง (\d+)–(\d+) พ\.ย\. (\d{4})$/, (a, b, y) => `Available ${a}–${b} Nov ${y}`],
];

// Names that can appear inside English system messages, e.g. "Required resource unavailable: ... (<Thai resource name>)"
const fragments = Object.keys(exact).sort((a, b) => b.length - a.length);
const HAS_THAI = /[\u0E01-\u0E3A\u0E40-\u0E5B]/;

export function translateText(text: string): string {
  if (!HAS_THAI.test(text)) return text;
  const trimmed = text.trim();
  if (exact[trimmed]) return exact[trimmed];
  for (const [pattern, build] of patterns) {
    const match = trimmed.match(pattern);
    if (match) return build(...match.slice(1));
  }
  // Replace pieces only inside English system messages that embed Thai names; unknown all-Thai text is left as is
  if (!/[A-Za-z]{3,}/.test(text)) return text;
  let result = text;
  for (const piece of fragments) {
    if (result.includes(piece)) result = result.split(piece).join(exact[piece]);
  }
  return result;
}

// Deep-copy and translate strings only (never mutate the original, because the cache is shared by both languages)
export function translateData<T>(value: T): T {
  if (typeof value === "string") return translateText(value) as T;
  if (Array.isArray(value)) return value.map((item) => translateData(item)) as T;
  if (value && typeof value === "object") {
    const copy: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) copy[key] = translateData(item);
    return copy as T;
  }
  return value;
}
