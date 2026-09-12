import { useMemo, useState } from "react";
import { buildMonthGrid, toDateStr } from "../lib/calendarUtils";
import { todayStr, categoryColor } from "../lib/dateUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatSelectedLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const weekday = WEEKDAYS[d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

export function CalendarView({
  events,
  tasks,
  onRemoveEvent,
  onRemoveTask,
  onToggleComplete,
  onEditEvent,
  onEditTask,
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(toDateStr(now));

  const weeks = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);

  const itemsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      (map[e.date] ??= []).push({
        type: "event",
        id: e.id,
        sortKey: e.startTime,
        label: `${e.startTime} ${e.title}`,
        color: categoryColor(e.category),
      });
    });
    tasks
      .filter((t) => t.deadline && !t.completed)
      .forEach((t) => {
        (map[t.deadline] ??= []).push({
          type: "task",
          id: t.id,
          sortKey: t.deadlineTime || "24:00",
          label: t.title,
          color: categoryColor(t.category),
        });
      });
    Object.values(map).forEach((list) => list.sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1)));
    return map;
  }, [events, tasks]);

  function goMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    const t = new Date();
    setCursor({ year: t.getFullYear(), month: t.getMonth() });
    setSelectedDate(toDateStr(t));
  }

  const selectedEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
  const selectedTasks = tasks.filter((t) => t.deadline === selectedDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goMonth(-1)}
            className="rounded-md border border-line px-2.5 py-1.5 text-ink-soft hover:text-ink"
            aria-label="이전 달"
          >
            ‹
          </button>
          <h3 className="font-display text-lg text-ink w-28 text-center">
            {cursor.year}년 {cursor.month + 1}월
          </h3>
          <button
            onClick={() => goMonth(1)}
            className="rounded-md border border-line px-2.5 py-1.5 text-ink-soft hover:text-ink"
            aria-label="다음 달"
          >
            ›
          </button>
        </div>
        <button
          onClick={goToday}
          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
        >
          오늘
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-ink-soft mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const dateStr = toDateStr(date);
          const inMonth = date.getMonth() === cursor.month;
          const isToday = dateStr === todayStr();
          const isSelected = dateStr === selectedDate;
          const items = itemsByDate[dateStr] || [];
          const visible = items.slice(0, 3);
          const hiddenCount = items.length - visible.length;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDate(dateStr)}
              className={`min-h-[76px] rounded-md border p-1.5 text-left align-top transition-colors ${
                isSelected ? "border-moss ring-1 ring-moss" : "border-line"
              } ${inMonth ? "bg-surface" : "bg-surface/40"}`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday ? "bg-moss text-surface" : inMonth ? "text-ink" : "text-ink-soft/50"
                }`}
              >
                {date.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {visible.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-1 text-[10px] leading-tight text-ink-soft"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <p className="text-[10px] text-ink-soft/70">+{hiddenCount}개 더</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-line bg-surface p-4">
        <h4 className="font-display text-base text-ink mb-3">{formatSelectedLabel(selectedDate)}</h4>
        {selectedEvents.length === 0 && selectedTasks.length === 0 ? (
          <p className="text-sm text-ink-soft">이 날엔 등록된 일정·할 일이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-1.5 text-sm">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor(e.category) }}
                />
                <span className="font-mono text-ink-soft shrink-0 w-12">
                  {e.startTime}–{e.endTime}
                </span>
                <span className="text-ink flex-1 truncate">{e.title}</span>
                <button
                  onClick={() => onEditEvent(e.id)}
                  className="shrink-0 text-xs text-ink-soft hover:text-moss-dark"
                >
                  수정
                </button>
                <button
                  onClick={() => onRemoveEvent(e.id)}
                  className="shrink-0 text-xs text-ink-soft hover:text-clay"
                >
                  지우기
                </button>
              </li>
            ))}
            {selectedTasks.map((t) => (
              <li
                key={t.id}
                className={`flex items-center gap-2 text-sm ${t.completed ? "opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => onToggleComplete(t.id)}
                  className="h-3.5 w-3.5 accent-moss"
                  aria-label={`${t.title} 완료 체크`}
                />
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor(t.category) }}
                />
                <span className={`text-ink flex-1 truncate ${t.completed ? "line-through" : ""}`}>
                  {t.title}
                  {t.deadlineTime ? ` · ${t.deadlineTime}` : ""}
                </span>
                <button
                  onClick={() => onEditTask(t.id)}
                  className="text-xs text-ink-soft hover:text-moss-dark"
                >
                  수정
                </button>
                <button
                  onClick={() => onRemoveTask(t.id)}
                  className="text-xs text-ink-soft hover:text-clay"
                >
                  지우기
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
