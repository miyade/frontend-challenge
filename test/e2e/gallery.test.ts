import { describe, it, expect } from 'vitest';
import { $fetch, setup } from '@nuxt/test-utils/e2e';

describe('gallery page', async () => {
  await setup({});

  it('renders gallery shell on SSR', async () => {
    const html = await $fetch('/gallery');
    expect(html).toContain('Gallery</h2>');
  });
});
