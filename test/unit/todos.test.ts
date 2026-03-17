import { describe, it, expect } from 'vitest';

const PAGE_SIZE = 10 as const;

type Todo = { id: number; title?: string; completed: boolean };

function effectiveCompleted(baseCompleted: boolean, override?: boolean) {
  // Important: use ?? not || so `false` is respected as an override value.
  return override ?? baseCompleted;
}

function filterTodos(todos: Todo[], options: {
  showCompleted: boolean;
  showPending: boolean;
}) {
  const { showCompleted, showPending } = options;

  if (!showCompleted && !showPending) {
    return todos;
  }

  return todos.filter((todo) => {
    if (todo.completed) return showCompleted;
    return showPending;
  });
}

function visibleTodos<T>(todos: T[], visibleCount: number) {
  return todos.slice(0, visibleCount);
}

describe('todo filters and pagination', () => {
  const sample = [
    { id: 1, title: 'Completed A', completed: true },
    { id: 2, title: 'Pending B', completed: false },
    { id: 3, title: 'Completed C', completed: true },
  ];

  it('filters completed and pending based on flags', () => {
    expect(
      filterTodos(sample, { showCompleted: true, showPending: false }).map(
        (t) => t.id,
      ),
    ).toEqual([1, 3]);

    expect(
      filterTodos(sample, { showCompleted: false, showPending: true }).map(
        (t) => t.id,
      ),
    ).toEqual([2]);

    expect(
      filterTodos(sample, { showCompleted: false, showPending: false }).map(
        (t) => t.id,
      ),
    ).toEqual([1, 2, 3]);
  });

  it('applies pagination after filtering', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      completed: i % 2 === 0,
    }));

    const filtered = filterTodos(many, {
      showCompleted: true,
      showPending: true,
    });

    const page1 = visibleTodos(filtered, PAGE_SIZE);
    const page2 = visibleTodos(filtered, PAGE_SIZE * 2);

    expect(page1).toHaveLength(PAGE_SIZE);
    expect(page2).toHaveLength(PAGE_SIZE * 2);
  });
}
);

describe('todo optimistic interactions', () => {
  it('merges override with base using ?? semantics', () => {
    expect(effectiveCompleted(true, undefined)).toBe(true);
    expect(effectiveCompleted(false, undefined)).toBe(false);
    expect(effectiveCompleted(false, true)).toBe(true);
    expect(effectiveCompleted(true, false)).toBe(false);
  });

  it('toggles a single todo without mutating base', () => {
    const base: Todo[] = [
      { id: 1, completed: false },
      { id: 2, completed: true },
    ];
    const overrides: Record<number, boolean> = {};

    const toggle = (id: number) => {
      const next = { ...overrides };
      const baseTodo = base.find((t) => t.id === id);
      const current = effectiveCompleted(baseTodo?.completed ?? false, next[id]);
      next[id] = !current;
      return next;
    };

    const overrides1 = toggle(1);
    expect(overrides1[1]).toBe(true);
    expect(base[0].completed).toBe(false);

    const overrides2 = toggle(2);
    expect(overrides2[2]).toBe(false);
    expect(base[1].completed).toBe(true);
  });

  it('toggle all visible sets overrides for only visible ids', () => {
    const base: Todo[] = [
      { id: 1, completed: true },
      { id: 2, completed: false },
      { id: 3, completed: true },
    ];
    const visibleIds = [1, 2];
    const existingOverrides: Record<number, boolean> = { 3: false };

    const allVisibleCompleted = visibleIds.every((id) => {
      const t = base.find((x) => x.id === id)!;
      return effectiveCompleted(t.completed, existingOverrides[id]);
    });
    expect(allVisibleCompleted).toBe(false);

    const target = !allVisibleCompleted;
    const next = { ...existingOverrides };
    for (const id of visibleIds) next[id] = target;

    expect(next[1]).toBe(true);
    expect(next[2]).toBe(true);
    expect(next[3]).toBe(false);
  });
});

