<template>
  <AwesomeArticle>
    <h1>User Todo's</h1>
    <div class="todo-filters">
      Filters:
      <span>
        <label for="completed">Show completed</label>
        <input type="checkbox" id="completed" v-model="showCompleted" />
      </span>
      <span>
        <label for="pending">Show pending</label>
        <input type="checkbox" id="pending" v-model="showPending" />
      </span>
    </div>
    <p v-if="pending">Loading…</p>
    <p v-else-if="error" class="todo-error">
      Failed to load todos: {{ error.message }}
    </p>
    <p v-else-if="filteredTodos.length === 0">No todos to display.</p>
    <ul v-else class="todo-list">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        :completion-status="todo.effectiveCompleted ? 'completed' : 'pending'"
        @click="toggleTodo(todo.id)"
      >
        <h4>{{ todo.title }}</h4>
        <p>Status: {{ todo.effectiveCompleted ? 'Completed' : 'Pending' }}</p>
      </li>
    </ul>
    <div class="todo-actions">
      <button v-if="canLoadMore" type="button" @click="loadMore">Load more</button>
      <button
        v-if="canShowLess"
        type="button"
        @click="showLess"
      >
        Show less
      </button>
      <button
        v-if="filteredTodos.length > 0"
        type="button"
        @click="toggleAllVisible"
      >
        {{ allVisibleCompleted ? 'Mark all visible pending' : 'Mark all visible completed' }}
      </button>
      <button
        v-if="showBackToTop"
        type="button"
        class="back-to-top"
        @click="scrollToTop"
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  </AwesomeArticle>
</template>

<style scoped>
.todo-error {
  color: #b00020;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.todo-list h4 {
  cursor: pointer;
}

.todo-list li[completion-status='completed'] h4 {
  text-decoration: line-through;
}

/* legacy CSS-only filtering kept for reference.
/*
.todo-filters:has(#completed:not(:checked)) + .todo-list li[completion-status='completed'] {
  display: none;
}

.todo-filters:has(#pending:not(:checked)) + .todo-list li[completion-status='pending'] {
  display: none;
}
*/

.back-to-top {
  margin-left: auto;
}

/* when show completed is unchecked we hide completed todos. */
.todo-filters:has(#completed:not(:checked)) + .todo-list li[completion-status='completed'] {
  display: none;
}

/* when show pending is unchecked we hide pending todos. */
.todo-filters:has(#pending:not(:checked)) + .todo-list li[completion-status='pending'] {
  display: none;
}
</style>

<script setup>
const route = useRoute();

const userId = computed(() => String(route.params.id ?? ''));

const { data: todos, pending, error, refresh } = useAsyncData(
  () => `user:${userId.value}:todos`,
  () =>
    fetch(
      `https://jsonplaceholder.typicode.com/users/${userId.value}/todos`
    ).then((res) => res.json()),
  { watch: [userId] }
);

const showCompleted = ref(true);
const showPending = ref(true);

const PAGE_SIZE = 10;
const visibleCount = ref(PAGE_SIZE);

const completionOverrides = ref({});

watch(userId, () => {
  visibleCount.value = PAGE_SIZE;
  completionOverrides.value = {};
});

watch([showCompleted, showPending], () => {
  visibleCount.value = PAGE_SIZE;
});

const filteredTodos = computed(() => {
  const list = todos.value ?? [];

  // little UX decision here: if both are off we show all
  if (!showCompleted.value && !showPending.value) {
    return list;
  }

  return list.filter((todo) => {
    const override = completionOverrides.value[todo.id];
    const effectiveCompleted =
      override ?? todo.completed;

    if (effectiveCompleted) return showCompleted.value;
    return showPending.value;
  });
});

const visibleTodos = computed(() =>
  filteredTodos.value
    .slice(0, visibleCount.value)
    .map((todo) => ({
      ...todo,
      effectiveCompleted:
        completionOverrides.value[todo.id] ?? todo.completed,
    }))
);
const canLoadMore = computed(
  () => filteredTodos.value.length > visibleCount.value
);
const canShowLess = computed(() => visibleCount.value > PAGE_SIZE);

const allVisibleCompleted = computed(() =>
  visibleTodos.value.length > 0 &&
  visibleTodos.value.every((todo) => todo.effectiveCompleted)
);

function loadMore() {
  visibleCount.value += PAGE_SIZE;
}

function showLess() {
  visibleCount.value = PAGE_SIZE;
}

function toggleTodo(id) {
  const overrides = { ...completionOverrides.value };
  const list = todos.value ?? [];
  const baseTodo = list.find((todo) => todo.id === id);
  const current =
    overrides[id] ?? (baseTodo ? baseTodo.completed : false);
  overrides[id] = !current;
  completionOverrides.value = overrides;
}

function toggleAllVisible() {
  const target = !allVisibleCompleted.value;
  const overrides = { ...completionOverrides.value };
  for (const todo of visibleTodos.value) {
    overrides[todo.id] = target;
  }
  completionOverrides.value = overrides;
}

const showBackToTop = ref(false);

function onScroll() {
  showBackToTop.value = window.scrollY > 400;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>
