<template>
  <AwesomeArticle>
    <h1>User Todo's</h1>
    <div class="todo-filters">
      Filters:
      <span>
        <label for="completed">Show completed</label>
        <input type="checkbox" id="completed" />
      </span>
      <span>
        <label for="pending">Show pending</label>
        <input type="checkbox" id="pending" checked />
      </span>
    </div>
    <ul class="todo-list">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        :completion-status="todo.completed ? 'completed' : 'pending'"
      >
        <h4 :title="todo.title">{{ todo.title }}</h4>
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

const { data: todos } = useAsyncData(() =>
  fetch(
    `https://jsonplaceholder.typicode.com/users/${route.params.id}/todos`
  ).then((res) => res.json())
);

const PAGE_SIZE = 10;
const visibleCount = ref(PAGE_SIZE);

const visibleTodos = computed(() => (todos.value ?? []).slice(0, visibleCount.value));
const canLoadMore = computed(
  () => (todos.value?.length ?? 0) > visibleCount.value
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
