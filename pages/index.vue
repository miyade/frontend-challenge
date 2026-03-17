<template>
  <AwesomeSection>
    <details>
      <summary title="Click to view the challenge description">
        <strong>
          <a href="https://github.com/reteach/frontend-challenge/tree/main"
            >README</a
          >
        </strong>
      </summary>
      <ChallengeDescription />
    </details>
    <!-- Removed the fixed height to make this more responsive and get smaller as screen size shrinks -->
    <img src="/img.png" alt="User avatar" />
  </AwesomeSection>
  <UsersList />
</template>
