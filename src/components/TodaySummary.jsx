import { useMemo } from "react";
import { todayStr, minutesUntilNextEvent, formatDateLabel, categoryColor } from "../lib/dateUtils";

export function TodaySummary({ events, tasks, onToggleComplete }) {
  const today = todayStr();

  const todaysEvents = useMemo(
    () => events.filter((e) => e.date === today).sort((a, b) => (a.startTime < b.startTime ? -1 : 1)),
    [events, today]
  );
  const todaysTasks = useMemo(() => tasks.filter((t) => t.deadline === today), [tasks, today]);

  const doneToday = todaysTasks.filter((t) => t.completed).length;
  const progressPct = todaysTasks.length ? Math.round((doneToday / todaysTasks.length) * 100) : 0;

  const nextEventInfo = useMemo(() => minutesUntilNextEvent(events), [events]);

  const totalTasks = tasks.length;
  const totalDone = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-ink-soft mb-1">{formatDateLabel(today)}</p>
        <h3 className="font-display text-lg text-ink">오늘 한눈에 보기</h3>
      </div>

      <div className="rounded-md border border-line bg-surface p-4">
        <p className="text-sm text-ink-soft mb-1">다음 일정까지</p>
        {nextEventInfo ? (
          <p className="text-ink">
            <span className="font-mono text-xl">{nextEventInfo.minutes}</span>
            <span className="text-sm text-ink-soft">분</span>{" "}
            <span className="text-sm">· {nextEventInfo.event.title}</span>
          </p>
        ) : (
          <p className="text-sm text-ink-soft">오늘 남은 일정이 없어요</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-ink-soft">오늘 할 일 진행률</p>
          <p className="text-xs font-mono text-ink-soft">
            {doneToday}/{todaysTasks.length}
          </p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full bg-moss transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {todaysEvents.length > 0 && (
        <div>
          <p className="text-sm text-ink-soft mb-2">오늘 일정</p>
          <ul className="space-y-1.5">
            {todaysEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor(e.category) }}
                />
                <span className="font-mono text-xs text-ink-soft shrink-0">{e.startTime}</span>
                <span className="text-ink truncate">{e.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {todaysTasks.length > 0 && (
        <div>
          <p className="text-sm text-ink-soft mb-2">오늘 마감</p>
          <ul className="space-y-1.5">
            {todaysTasks.map((t) => (
              <li
                key={t.id}
                className={`flex items-center gap-2 text-sm ${t.completed ? "opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => onToggleComplete(t.id)}
                  className="h-3.5 w-3.5 shrink-0 accent-moss"
                  aria-label={`${t.title} 완료 체크`}
                />
                <span className={`text-ink truncate flex-1 ${t.completed ? "line-through" : ""}`}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {todaysEvents.length === 0 && todaysTasks.length === 0 && (
        <p className="text-sm text-ink-soft">오늘 등록된 일정·할 일이 없어요.</p>
      )}

      <div className="pt-4 border-t border-line">
        <p className="text-xs text-ink-soft">
          전체 할 일{" "}
          <span className="font-mono text-ink">
            {totalDone}/{totalTasks}
          </span>{" "}
          완료
        </p>
      </div>
    </div>
  );
}
