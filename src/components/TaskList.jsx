import { useState } from "react";
import { deadlineBadge, deadlineSortKey, categoryColor } from "../lib/dateUtils";

const BADGE_TONE_CLASS = {
  overdue: "bg-clay/15 text-clay",
  today: "bg-clay/15 text-clay",
  soon: "bg-mustard-light text-ink",
  normal: "bg-line/60 text-ink-soft",
};

const SORT_OPTIONS = [
  { id: "deadline", label: "마감임박순" },
  { id: "value", label: "중요도순" },
  { id: "recent", label: "최근 추가순" },
];

function sortTasks(tasks, sortBy) {
  const list = [...tasks];
  if (sortBy === "value") {
    return list.sort((a, b) => b.value - a.value);
  }
  if (sortBy === "recent") {
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }
  // deadline: 마감일(+시간) 있는 것 먼저(빠른 순), 없는 건 뒤로
  return list.sort((a, b) => {
    const keyA = deadlineSortKey(a.deadline, a.deadlineTime);
    const keyB = deadlineSortKey(b.deadline, b.deadlineTime);
    if (keyA && keyB) return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    if (keyA) return -1;
    if (keyB) return 1;
    return b.value - a.value;
  });
}

export function TaskList({ tasks, onRemove, onToggleComplete, onEdit, editingTaskId }) {
  const [sortBy, setSortBy] = useState("deadline");

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-ink-soft py-6 text-center border border-dashed border-line rounded-md">
        아직 등록된 할 일이 없어요. 위에서 하나씩 추가해보세요.
      </p>
    );
  }

  const sorted = sortTasks(tasks, sortBy);

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSortBy(opt.id)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              sortBy === opt.id
                ? "bg-ink text-paper"
                : "bg-surface text-ink-soft border border-line hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-line border border-line rounded-md overflow-hidden bg-surface">
        {sorted.map((task) => {
          const badge = deadlineBadge(task.deadline, task.deadlineTime);
          const isEditing = task.id === editingTaskId;
          return (
            <li
              key={task.id}
              className={`flex items-center gap-3 px-4 py-3 ${task.completed ? "opacity-50" : ""} ${
                isEditing ? "ring-1 ring-inset ring-moss" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                className="h-4 w-4 shrink-0 accent-moss"
                aria-label={`${task.title} 완료 체크`}
              />
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: task.category ? categoryColor(task.category) : "transparent" }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-ink truncate ${task.completed ? "line-through" : ""}`}>
                  {task.title}
                </p>
                <p className="text-xs text-ink-soft flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-0.5">
                  <span className="font-mono">{task.duration}분</span>
                  <span>·</span>
                  <span>중요도 {task.value}</span>
                  <span>·</span>
                  <span>{task.splittable ? "끊어도 됨" : "끝까지"}</span>
                  {task.category && <span>· {task.category}</span>}
                  {badge && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] ${BADGE_TONE_CLASS[badge.tone]}`}>
                      {badge.label}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => onEdit(task.id)}
                className="text-sm text-ink-soft hover:text-moss-dark transition-colors shrink-0"
                aria-label={`${task.title} 수정`}
              >
                수정
              </button>
              <button
                onClick={() => onRemove(task.id)}
                className="text-sm text-ink-soft hover:text-clay transition-colors shrink-0"
                aria-label={`${task.title} 삭제`}
              >
                지우기
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
