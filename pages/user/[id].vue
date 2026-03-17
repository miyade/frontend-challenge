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
        :completion-status="todo.completed ? 'completed' : 'pending'"
      >
        <h4>{{ todo.title }}</h4>
        <p>Status: {{ todo.completed ? 'Completed' : 'Pending' }}</p>
      </li>
    </ul>
    <div>
      <button v-if="canLoadMore" type="button" @click="loadMore">Load more</button>
      <button
        v-if="canShowLess"
        type="button"
        @click="showLess"
      >
        Show less
      </button>
      <button v-if="showBackToTop" type="button" @click="scrollToTop">
        Back to top
      </button>
    </div>
  </AwesomeArticle>
</template>

<style scoped>
.todo-error {
  color: #b00020;
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

const { data: todos, pending, error } = useAsyncData(
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

watch(userId, () => {
  visibleCount.value = PAGE_SIZE;
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
    if (todo.completed) return showCompleted.value;
    return showPending.value;
  });
});

const visibleTodos = computed(() =>
  filteredTodos.value.slice(0, visibleCount.value)
);
const canLoadMore = computed(
  () => filteredTodos.value.length > visibleCount.value
);
const canShowLess = computed(() => visibleCount.value > PAGE_SIZE);

function loadMore() {
  visibleCount.value += PAGE_SIZE;
}

function showLess() {
  visibleCount.value = PAGE_SIZE;
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
