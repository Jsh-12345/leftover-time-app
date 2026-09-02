// 달력 뷰에서 쓰는 순수 함수 모음

/** year, month(0-indexed 기준)의 달력 그리드를 6주(42칸)로 만든다. 앞뒤 달의 날짜도 채워진다. */
export function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0(일) ~ 6(토)
  const gridStart = new Date(year, month, 1 - startDay);

  const cells = [];
  const cursor = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks = [];
  for (let w = 0; w < 6; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }
  return weeks;
}

/** Date 객체를 로컬 기준 "YYYY-MM-DD" 문자열로 바꾼다. */
export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
