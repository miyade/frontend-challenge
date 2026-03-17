import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { mount, flushPromises } from '@vue/test-utils';

import UserTodosPage from '~/pages/user/[id].vue';

vi.mock('nuxt/app', async () => {
  const actual = await vi.importActual<any>('nuxt/app');
  return { ...actual, useRoute: () => ({ params: { id: '1' } }) };
});

describe('/user/[id] UI states', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state', async () => {
    // @ts-expect-error override global for test
    global.fetch = vi.fn(() => new Promise(() => {}));

    const wrapper = mount(UserTodosPage);
    expect(wrapper.text()).toContain('Loading');
    wrapper.unmount();
  });

  it('shows error state', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('boom')));

    const wrapper = await mountSuspended(UserTodosPage);
    expect(wrapper.text()).toContain('Failed to load todos');
  });

  it('shows empty state', async () => {
    // @ts-expect-error override global for test
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      }),
    );

    const wrapper = mount(UserTodosPage);
    await flushPromises();
    expect(wrapper.text()).toContain('No todos to display');
    wrapper.unmount();
  });
});

