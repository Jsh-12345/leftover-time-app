import { useState } from "react";

const emptyDraft = {
  title: "",
  duration: "",
  value: 5,
  splittable: true,
  deadline: "",
  deadlineTime: "",
  category: "",
};

export function TaskForm({ onAdd }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const title = draft.title.trim();
    const duration = Number(draft.duration);

    if (!title) {
      setError("할 일 이름을 입력하세요.");
      return;
    }
    if (!duration || duration <= 0) {
      setError("소요 시간을 1분 이상으로 입력하세요.");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      title,
      duration: Math.round(duration),
      value: Number(draft.value),
      splittable: draft.splittable,
      deadline: draft.deadline || null,
      deadlineTime: draft.deadline ? draft.deadlineTime || null : null,
      category: draft.category.trim(),
      completed: false,
      createdAt: Date.now(),
    });
    setDraft(emptyDraft);
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm text-ink-soft mb-1">
          할 일
        </label>
        <input
          id="title"
          type="text"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="예: 영어 단어 외우기"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft/60"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="duration" className="block text-sm text-ink-soft mb-1">
            소요 시간(분)
          </label>
          <input
            id="duration"
            type="number"
            min="1"
            inputMode="numeric"
            value={draft.duration}
            onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
            placeholder="15"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-ink"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="value" className="block text-sm text-ink-soft mb-1">
            중요도 ({draft.value})
          </label>
          <input
            id="value"
            type="range"
            min="1"
            max="10"
            value={draft.value}
            onChange={(e) => setDraft({ ...draft, value: e.target.value })}
            className="w-full accent-moss mt-3"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="deadline" className="block text-sm text-ink-soft mb-1">
            마감일 (선택)
          </label>
          <input
            id="deadline"
            type="date"
            value={draft.deadline}
            onChange={(e) =>
              setDraft({
                ...draft,
                deadline: e.target.value,
                deadlineTime: e.target.value ? draft.deadlineTime : "",
              })
            }
            className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-ink"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="deadlineTime" className="block text-sm text-ink-soft mb-1">
            마감 시간 (선택)
          </label>
          <input
            id="deadlineTime"
            type="time"
            value={draft.deadlineTime}
            disabled={!draft.deadline}
            onChange={(e) => setDraft({ ...draft, deadlineTime: e.target.value })}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-ink disabled:opacity-40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm text-ink-soft mb-1">
          카테고리 (선택)
        </label>
        <input
          id="category"
          type="text"
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          placeholder="예: 학교"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft/60"
        />
      </div>

      <div>
        <span className="block text-sm text-ink-soft mb-1">이 할 일은 한번 시작하면</span>
        <div className="inline-flex rounded-md border border-line overflow-hidden">
          <button
            type="button"
            onClick={() => setDraft({ ...draft, splittable: false })}
            className={`px-3 py-1.5 text-sm transition-colors ${
              !draft.splittable
                ? "bg-moss text-surface"
                : "bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            끝까지 해야 해요
          </button>
          <button
            type="button"
            onClick={() => setDraft({ ...draft, splittable: true })}
            className={`px-3 py-1.5 text-sm transition-colors border-l border-line ${
              draft.splittable
                ? "bg-moss text-surface"
                : "bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            끊어도 괜찮아요
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-ink text-paper py-2.5 font-medium hover:bg-moss-dark transition-colors"
      >
        할 일 추가하기
      </button>
    </form>
  );
}
