import { formatDateLabel, isEventPast, categoryColor } from "../lib/dateUtils";

export function EventList({ events, onRemove }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-ink-soft py-6 text-center border border-dashed border-line rounded-md">
        아직 등록된 일정이 없어요.
      </p>
    );
  }

  const sorted = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
  });

  let lastDateLabel = null;

  return (
    <ul className="space-y-1">
      {sorted.map((ev) => {
        const dateLabel = formatDateLabel(ev.date);
        const showHeader = dateLabel !== lastDateLabel;
        lastDateLabel = dateLabel;
        const past = isEventPast(ev);

        return (
          <li key={ev.id}>
            {showHeader && (
              <p className="mt-4 mb-1.5 text-xs font-medium text-ink-soft first:mt-0">
                {dateLabel}
              </p>
            )}
            <div
              className={`flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 ${
                past ? "opacity-45" : ""
              }`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: categoryColor(ev.category) }}
                aria-hidden="true"
              />
              <span className="font-mono text-sm text-ink-soft shrink-0 w-[92px]">
                {ev.startTime}–{ev.endTime}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ink truncate">{ev.title}</p>
                {ev.category && <p className="text-xs text-ink-soft">{ev.category}</p>}
              </div>
              <button
                onClick={() => onRemove(ev.id)}
                className="text-sm text-ink-soft hover:text-clay transition-colors shrink-0"
                aria-label={`${ev.title} 삭제`}
              >
                지우기
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
