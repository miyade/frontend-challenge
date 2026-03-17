import { describe, it, expect, vi } from 'vitest';

type Image = {
  id: number;
  userId: number;
  userName: string;
};

type User = {
  id: number;
  albums?: unknown[];
  posts?: unknown[];
  comments?: unknown[];
};

function groupByUser(images: Image[], users: User[]) {
  return images.reduce<Record<number, {
    name: string;
    photos: Image[];
    albums: unknown[];
    posts: unknown[];
    comments: unknown[];
  }>>((acc, img) => {
    const user = users.find((u) => u.id === img.userId);
    if (!user) return acc;

    if (!acc[img.userId]) {
      acc[img.userId] = {
        name: img.userName,
        photos: [],
        albums: user.albums || [],
        posts: user.posts || [],
        comments: user.comments || [],
      };
    }

    acc[img.userId].photos.push(img);
    return acc;
  }, {});
}

describe('gallery grouping', () => {
  it('groups photos by user and carries stats', () => {
    const images: Image[] = [
      { id: 1, userId: 1, userName: 'A' },
      { id: 2, userId: 2, userName: 'B' },
      { id: 3, userId: 1, userName: 'A' },
    ];
    const users: User[] = [
      { id: 1, albums: [1], posts: [1, 2], comments: [] },
      { id: 2, albums: [], posts: [], comments: [1] },
    ];

    const grouped = groupByUser(images, users);

    expect(Object.keys(grouped).sort()).toEqual(['1', '2']);
    expect(grouped[1].photos.map((p) => p.id)).toEqual([1, 3]);
    expect(grouped[1].albums).toHaveLength(1);
    expect(grouped[2].comments).toHaveLength(1);
  });
});
