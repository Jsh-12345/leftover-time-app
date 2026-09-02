import { useState } from "react";
import { todayStr } from "../lib/dateUtils";

const emptyDraft = { title: "", date: todayStr(), startTime: "", endTime: "", category: "" };

export function EventForm({ onAdd }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const title = draft.title.trim();

    if (!title) return setError("일정 제목을 입력하세요.");
    if (!draft.date) return setError("날짜를 입력하세요.");
    if (!draft.startTime || !draft.endTime) return setError("시작·종료 시간을 입력하세요.");
    if (draft.endTime <= draft.startTime) return setError("종료 시간은 시작 시간보다 늦어야 해요.");

    onAdd({
      id: crypto.randomUUID(),
      title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      category: draft.category.trim(),
    });
    setDraft({ ...emptyDraft, date: draft.date });
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ev-title" className="block text-sm text-ink-soft mb-1">
          일정 제목
        </label>
        <input
          id="ev-title"
          type="text"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="예: 알고리즘 스터디"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft/60"
        />
      </div>

      <div>
        <label htmlFor="ev-date" className="block text-sm text-ink-soft mb-1">
          날짜
        </label>
        <input
          id="ev-date"
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-ink"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="ev-start" className="block text-sm text-ink-soft mb-1">
            시작 시간
          </label>
          <input
            id="ev-start"
            type="time"
            value={draft.startTime}
            onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-ink"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="ev-end" className="block text-sm text-ink-soft mb-1">
            종료 시간
          </label>
          <input
            id="ev-end"
            type="time"
            value={draft.endTime}
            onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-ink"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ev-category" className="block text-sm text-ink-soft mb-1">
          카테고리 (선택)
        </label>
        <input
          id="ev-category"
          type="text"
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          placeholder="예: 학교, 개인"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft/60"
        />
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-ink text-paper py-2.5 font-medium hover:bg-moss-dark transition-colors"
      >
        일정 추가하기
      </button>
    </form>
  );
}
