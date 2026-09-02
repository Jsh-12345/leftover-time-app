const PALETTE = ["#3f6c4e", "#c99a2e", "#a8543f", "#6b8f5a", "#8a6a9a", "#3f7a8c"];

function buildSegments(result) {
  const segments = [];
  result.fixedSelected.forEach((task) => {
    segments.push({ id: task.id, title: task.title, minutes: task.duration, partial: false });
  });
  result.flexibleAllocations.forEach((a) => {
    segments.push({
      id: a.task.id,
      title: a.task.title,
      minutes: a.minutesUsed,
      partial: a.isPartial,
    });
  });
  return segments;
}

export function TimeBar({ capacity, result }) {
  const segments = buildSegments(result);
  const leftover = Math.max(0, capacity - result.usedMinutes);

  if (segments.length === 0) {
    return (
      <p className="text-sm text-ink-soft py-6 text-center border border-dashed border-line rounded-md">
        이 시간에 딱 맞는 조합을 찾지 못했어요. 더 짧은 할 일을 추가해보세요.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-14 w-full overflow-hidden rounded-md border border-line bg-surface">
        {segments.map((seg, i) => {
          const widthPct = (seg.minutes / capacity) * 100;
          const color = PALETTE[i % PALETTE.length];
          return (
            <div
              key={seg.id}
              title={`${seg.title} · ${seg.minutes}분${seg.partial ? " (이어서 계속)" : ""}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: color,
                backgroundImage: seg.partial
                  ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 6px, transparent 6px, transparent 12px)"
                  : "none",
                borderRight: seg.partial ? "2px dashed rgba(255,255,255,0.8)" : "1px solid rgba(255,255,255,0.25)",
              }}
              className="h-full flex items-center justify-center shrink-0"
            >
              {widthPct > 14 && (
                <span className="text-xs text-surface/95 font-medium px-1 truncate">
                  {seg.title}
                </span>
              )}
            </div>
          );
        })}
        {leftover > 0 && (
          <div
            style={{ width: `${(leftover / capacity) * 100}%` }}
            className="h-full shrink-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--color-line)_6px,var(--color-line)_7px)]"
            title={`남는 시간 ${leftover}분`}
          />
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {segments.map((seg, i) => (
          <li key={seg.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              aria-hidden="true"
            />
            <span className="text-ink flex-1 truncate">{seg.title}</span>
            <span className="font-mono text-ink-soft">
              {seg.minutes}분{seg.partial ? " · 이어서" : ""}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-ink-soft">
        총 <span className="font-mono text-ink">{result.usedMinutes}</span>분 사용 ·{" "}
        가치 점수 <span className="font-mono text-ink">{result.totalValue}</span>
      </p>
    </div>
  );
}
