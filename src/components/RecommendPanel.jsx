import { useMemo, useState } from "react";
import { minutesUntilNextEvent } from "../lib/dateUtils";
import { recommend } from "../lib/knapsack";
import { TimeBar } from "./TimeBar";

export function RecommendPanel({ events, tasks }) {
  const nextEventInfo = useMemo(() => minutesUntilNextEvent(events), [events]);
  const [capacityInput, setCapacityInput] = useState(
    nextEventInfo ? String(nextEventInfo.minutes) : ""
  );
  const [submittedCapacity, setSubmittedCapacity] = useState(null);

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);

  const result = useMemo(() => {
    if (submittedCapacity === null) return null;
    return recommend(pendingTasks, submittedCapacity);
  }, [pendingTasks, submittedCapacity]);

  function handleUseAuto() {
    if (nextEventInfo) setCapacityInput(String(nextEventInfo.minutes));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const minutes = Number(capacityInput);
    if (minutes > 0) setSubmittedCapacity(minutes);
  }

  return (
    <div>
      <p className="text-sm text-ink-soft mb-3">
        {nextEventInfo ? (
          <>
            다음 일정 <span className="text-ink">"{nextEventInfo.event.title}"</span>까지{" "}
            <span className="font-mono text-ink">{nextEventInfo.minutes}분</span> 남았어요.{" "}
            <button
              type="button"
              onClick={handleUseAuto}
              className="underline underline-offset-2 text-moss hover:text-moss-dark"
            >
              이 시간으로 채우기
            </button>
          </>
        ) : (
          "오늘 남은 일정이 없어요. 자투리 시간을 직접 입력해보세요."
        )}
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={capacityInput}
            onChange={(e) => setCapacityInput(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 pr-10 font-mono text-lg text-ink"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">
            분
          </span>
        </div>
        <button
          type="submit"
          className="rounded-md bg-moss text-surface px-5 py-2.5 font-medium hover:bg-moss-dark transition-colors"
        >
          추천받기
        </button>
      </form>

      {pendingTasks.length === 0 && (
        <p className="mt-3 text-xs text-ink-soft">
          완료하지 않은 할 일이 없어요. 할 일을 먼저 등록해보세요.
        </p>
      )}

      {result && (
        <div className="mt-6">
          <TimeBar capacity={submittedCapacity} result={result} />
        </div>
      )}
    </div>
  );
}
