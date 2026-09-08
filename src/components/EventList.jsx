import { formatDateLabel, isEventPast, categoryColor } from "../lib/dateUtils";

export function EventList({ events, onRemove, onEdit, editingEventId }) {
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
        const isEditing = ev.id === editingEventId;

        return (
          <li key={ev.id}>
            {showHeader && (
              <p className="mt-4 mb-1.5 text-xs font-medium text-ink-soft first:mt-0">
                {dateLabel}
              </p>
            )}
            <div
              className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
                isEditing ? "border-moss ring-1 ring-moss bg-surface" : "border-line bg-surface"
              } ${past ? "opacity-45" : ""}`}
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
                onClick={() => onEdit(ev.id)}
                className="text-sm text-ink-soft hover:text-moss-dark transition-colors shrink-0"
                aria-label={`${ev.title} 수정`}
              >
                수정
              </button>
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
