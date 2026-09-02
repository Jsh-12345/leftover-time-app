// 날짜/시간 관련 순수 함수 모음 (일정·할 일 공통으로 사용)

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nowTimeStr() {
  const d = new Date();
  return d.toTimeString().slice(0, 5); // "HH:MM"
}

export function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * 오늘 남은 일정 중 가장 빠른 일정까지 몇 분 남았는지 계산한다.
 * 오늘 남은 일정이 없으면 null을 반환한다.
 */
export function minutesUntilNextEvent(events) {
  const today = todayStr();
  const nowMin = toMinutes(nowTimeStr());

  const upcoming = events
    .filter((e) => e.date === today && toMinutes(e.startTime) > nowMin)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  if (upcoming.length === 0) return null;
  return { minutes: toMinutes(upcoming[0].startTime) - nowMin, event: upcoming[0] };
}

/** 할 일의 마감일(+마감 시간, 선택) 임박도를 뱃지 정보로 변환한다. */
export function deadlineBadge(deadline, deadlineTime) {
  if (!deadline) return null;
  const diffDays = Math.round(
    (new Date(deadline) - new Date(todayStr())) / 86400000
  );
  const timeSuffix = deadlineTime ? ` ${deadlineTime}` : "";
  if (diffDays < 0) return { label: "마감 지남", tone: "overdue" };
  if (diffDays === 0) return { label: `오늘${timeSuffix} 마감`, tone: "today" };
  if (diffDays === 1) return { label: `내일${timeSuffix} 마감`, tone: "soon" };
  if (diffDays <= 3) return { label: `${diffDays}일 남음${timeSuffix}`, tone: "soon" };
  return { label: `${diffDays}일 남음`, tone: "normal" };
}

/** 정렬 등에 쓸 수 있도록 마감일+시간을 하나의 비교 가능한 문자열로 합친다. */
export function deadlineSortKey(deadline, deadlineTime) {
  if (!deadline) return null;
  return `${deadline}T${deadlineTime || "23:59"}`;
}

/** 일정 목록에서 날짜 구분 헤더로 쓸 라벨 ("오늘 · 9월 2일(수)" 형태) */
export function formatDateLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date(`${todayStr()}T00:00:00`);
  const diffDays = Math.round((d - today) / 86400000);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const md = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  if (diffDays === 0) return `오늘 · ${md}(${weekday})`;
  if (diffDays === 1) return `내일 · ${md}(${weekday})`;
  if (diffDays === -1) return `어제 · ${md}(${weekday})`;
  return `${md}(${weekday})`;
}

/** 일정이 이미 끝났는지(오늘 이전 날짜, 또는 오늘이면서 종료 시각이 지났는지) 판단 */
export function isEventPast(event) {
  const today = todayStr();
  if (event.date < today) return true;
  if (event.date > today) return false;
  return toMinutes(event.endTime) < toMinutes(nowTimeStr());
}

const CATEGORY_PALETTE = [
  "#3f6c4e",
  "#c99a2e",
  "#a8543f",
  "#3f7a8c",
  "#8a6a9a",
  "#6b8f5a",
];

/** 같은 카테고리 이름이면 항상 같은 색이 나오도록 해시 기반으로 색을 배정 */
export function categoryColor(name) {
  if (!name) return "#a39d8c";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length];
}
