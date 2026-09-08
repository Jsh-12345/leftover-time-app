import { useState } from "react";
import { EventForm } from "./components/EventForm";
import { EventList } from "./components/EventList";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { RecommendPanel } from "./components/RecommendPanel";
import { CalendarView } from "./components/CalendarView";
import { TodaySummary } from "./components/TodaySummary";
import { useLocalStorage } from "./lib/useLocalStorage";

export default function App() {
  const [events, setEvents] = useLocalStorage("teumsae:events", []);
  const [rawTasks, setTasks] = useLocalStorage("teumsae:tasks", []);
  const [addType, setAddType] = useState("task"); // "event" | "task"
  const [viewMode, setViewMode] = useState("list"); // "list" | "calendar"
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // 예전 데이터 형식(마감일/카테고리/완료 필드 없음)과 호환되도록 기본값을 채워준다.
  const tasks = rawTasks.map((t) => ({
    completed: false,
    deadline: null,
    deadlineTime: null,
    category: "",
    createdAt: 0,
    ...t,
  }));

  const editingEvent = events.find((e) => e.id === editingEventId) || null;
  const editingTask = tasks.find((t) => t.id === editingTaskId) || null;

  function handleAddEvent(event) {
    setEvents([...events, event]);
  }

  function handleUpdateEvent(updated) {
    setEvents(events.map((e) => (e.id === updated.id ? updated : e)));
    setEditingEventId(null);
  }

  function handleRemoveEvent(id) {
    setEvents(events.filter((e) => e.id !== id));
    if (editingEventId === id) setEditingEventId(null);
  }

  function handleAddTask(task) {
    setTasks([...tasks, task]);
  }

  function handleApplyRecommendation(result) {
    const removeIds = new Set(result.fixedSelected.map((t) => t.id));
    const durationUpdates = new Map();

    result.flexibleAllocations.forEach((a) => {
      if (a.isPartial) {
        durationUpdates.set(a.task.id, Math.max(0, a.task.duration - a.minutesUsed));
      } else {
        removeIds.add(a.task.id);
      }
    });

    setTasks(
      tasks
        .filter((t) => !removeIds.has(t.id))
        .map((t) => (durationUpdates.has(t.id) ? { ...t, duration: durationUpdates.get(t.id) } : t))
    );
  }

  function handleUpdateTask(updated) {
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTaskId(null);
  }

  function handleRemoveTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
    if (editingTaskId === id) setEditingTaskId(null);
  }

  function handleToggleComplete(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function handleStartEditEvent(id) {
    setEditingTaskId(null);
    setEditingEventId(id);
    setAddType("event");
  }

  function handleStartEditTask(id) {
    setEditingEventId(null);
    setEditingTaskId(id);
    setAddType("task");
  }

  function selectAddType(type) {
    setAddType(type);
    setEditingEventId(null);
    setEditingTaskId(null);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 2xl:max-w-[1440px]">
        <header className="mb-10">
          <h1 className="font-display text-3xl text-ink">틈새</h1>
          <p className="mt-1.5 text-ink-soft">
            일정과 할 일을 정리하고, 자투리 시간엔 배낭 알고리즘이 뭘 할지 골라줘요.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:items-start lg:gap-8 xl:grid-cols-[340px_1fr_300px]">
          <section aria-labelledby="add-heading" className="lg:sticky lg:top-10">
            <h2 id="add-heading" className="font-display text-xl text-ink mb-3">
              {editingEvent || editingTask ? "수정하기" : "추가하기"}
            </h2>
            <div className="mb-4 inline-flex rounded-md border border-line overflow-hidden">
              <button
                type="button"
                onClick={() => selectAddType("event")}
                className={`px-4 py-1.5 text-sm transition-colors ${
                  addType === "event"
                    ? "bg-ink text-paper"
                    : "bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                일정
              </button>
              <button
                type="button"
                onClick={() => selectAddType("task")}
                className={`px-4 py-1.5 text-sm transition-colors border-l border-line ${
                  addType === "task"
                    ? "bg-ink text-paper"
                    : "bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                할 일
              </button>
            </div>

            {addType === "event" ? (
              <EventForm
                onAdd={handleAddEvent}
                onUpdate={handleUpdateEvent}
                editingEvent={editingEvent}
                onCancelEdit={() => setEditingEventId(null)}
              />
            ) : (
              <TaskForm
                onAdd={handleAddTask}
                onUpdate={handleUpdateTask}
                editingTask={editingTask}
                onCancelEdit={() => setEditingTaskId(null)}
              />
            )}
          </section>

          <div className="space-y-10 min-w-0 lg:border-l lg:border-line lg:pl-14">
            <div className="inline-flex rounded-md border border-line overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-4 py-1.5 text-sm transition-colors ${
                  viewMode === "list"
                    ? "bg-ink text-paper"
                    : "bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                목록 보기
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-1.5 text-sm transition-colors border-l border-line ${
                  viewMode === "calendar"
                    ? "bg-ink text-paper"
                    : "bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                달력 보기
              </button>
            </div>

            {viewMode === "calendar" ? (
              <section aria-labelledby="calendar-heading" className="rounded-lg border border-line bg-surface/60 p-5 lg:p-6">
                <h2 id="calendar-heading" className="font-display text-xl text-ink mb-4">
                  달력
                </h2>
                <CalendarView
                  events={events}
                  tasks={tasks}
                  onRemoveEvent={handleRemoveEvent}
                  onRemoveTask={handleRemoveTask}
                  onToggleComplete={handleToggleComplete}
                  onEditEvent={handleStartEditEvent}
                  onEditTask={handleStartEditTask}
                />
              </section>
            ) : (
              <>
                <section aria-labelledby="recommend-heading" className="rounded-lg border border-line bg-surface/60 p-5 lg:p-6">
                  <h2 id="recommend-heading" className="font-display text-xl text-ink mb-3">
                    자투리 시간에 뭐 할까?
                  </h2>
                  <RecommendPanel events={events} tasks={tasks} onApply={handleApplyRecommendation} />
                </section>

                <div className="grid gap-10 md:grid-cols-2 md:gap-8">
                  <section aria-labelledby="events-heading">
                    <h2 id="events-heading" className="font-display text-xl text-ink mb-3">
                      일정 ({events.length})
                    </h2>
                    <EventList
                      events={events}
                      onRemove={handleRemoveEvent}
                      onEdit={handleStartEditEvent}
                      editingEventId={editingEventId}
                    />
                  </section>

                  <section aria-labelledby="tasks-heading">
                    <h2 id="tasks-heading" className="font-display text-xl text-ink mb-3">
                      할 일 목록 ({tasks.filter((t) => !t.completed).length})
                    </h2>
                    <TaskList
                      tasks={tasks}
                      onRemove={handleRemoveTask}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleStartEditTask}
                      editingTaskId={editingTaskId}
                    />
                  </section>
                </div>
              </>
            )}
          </div>

          <section
            aria-labelledby="summary-heading"
            className="lg:col-span-2 xl:col-span-1 xl:sticky xl:top-10 lg:border-t lg:border-line lg:pt-10 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10"
          >
            <h2 id="summary-heading" className="sr-only">
              오늘 요약
            </h2>
            <TodaySummary events={events} tasks={tasks} onToggleComplete={handleToggleComplete} />
          </section>
        </div>

        <footer className="mt-14 pt-6 border-t border-line text-xs text-ink-soft">
          모든 데이터는 이 브라우저에만 저장돼요. 다른 기기와는 동기화되지 않아요.
        </footer>
      </div>
    </div>
  );
}
