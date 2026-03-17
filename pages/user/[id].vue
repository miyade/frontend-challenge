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
        v-for="todo in todos"
        :key="todo.id"
        :completion-status="todo.completed ? 'completed' : 'pending'"
      >
        <h4 :title="todo.title">{{ todo.title }}</h4>
        <p>Status: {{ todo.completed ? 'Completed' : 'Pending' }}</p>
      </li>
    </ul>
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
</script>
