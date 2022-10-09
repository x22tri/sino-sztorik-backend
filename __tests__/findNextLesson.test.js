import { jest } from '@jest/globals';

import { LAST_TIER, COURSE_FINISHED } from '../util/config.js';
import { NEXT_LESSON_NOT_FOUND_ERROR } from '../util/string-literals.js';

import moquelize from '../util/moquelize.js';

let findNextLesson;

async function setupDatabaseWith(testData) {
  jest.unstable_mockModule('../models/character-orders.js', () => ({
    __esModule: true,
    default: moquelize(testData),
  }));

  const f = await import('../controllers/users/utils/findNextLesson.js');

  findNextLesson = f.findNextLesson;
}

describe('findNextLesson()', function () {
  afterEach(() => {
    jest.resetModules();
  });

  it('finds the next lesson in the same tier when exists, even when database entries are in wrong order', async () => {
    await setupDatabaseWith([
      { tier: 1, lessonNumber: 1 },
      { tier: 1, lessonNumber: 3 },
      { tier: 1, lessonNumber: 2 },
      { tier: 3, lessonNumber: 2 },
      { tier: 2, lessonNumber: 1 },
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual({ tier: 1, lessonNumber: 2 });
  });

  it(`finds the next lesson in the same tier when exists, even when lesson number is not the number directly after user's lesson`, async () => {
    await setupDatabaseWith([
      { tier: 1, lessonNumber: 1 },
      { tier: 1, lessonNumber: 3 },
      { tier: 3, lessonNumber: 2 },
      { tier: 2, lessonNumber: 1 },
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual({ tier: 1, lessonNumber: 3 });
  });

  it(`finds the first lesson in the next tier when no more lessons are found in the current tier`, async () => {
    await setupDatabaseWith([
      { tier: 1, lessonNumber: 1 },
      { tier: 3, lessonNumber: 2 },
      { tier: 2, lessonNumber: 3 },
      { tier: 2, lessonNumber: 4 },
      { tier: 2, lessonNumber: 5 },
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual({ tier: 2, lessonNumber: 3 });
  });

  it(`returns the "course finished" progress state when user is at last tier and there are no more lessons left`, async () => {
    await setupDatabaseWith([
      { tier: 1, lessonNumber: 1 },
      { tier: 3, lessonNumber: 2 },
      { tier: 4, lessonNumber: 1 },
    ]);

    const nextLesson = await findNextLesson(LAST_TIER, 2);

    expect(nextLesson).toEqual(COURSE_FINISHED);
  });

  it(`returns error when user is not at last tier but no more lessons are found`, async () => {
    await setupDatabaseWith([{ tier: 1, lessonNumber: 1 }]);

    await expect(findNextLesson(LAST_TIER - 1, 10)).rejects.toThrow(
      NEXT_LESSON_NOT_FOUND_ERROR
    );
  });

  it(`returns error when no valid lesson objects are found`, async () => {
    await setupDatabaseWith([
      { tier: 1 },
      { tier: 2 },
      { lessonNumber: 3 },
      { testParam: 'test' },
    ]);

    await expect(findNextLesson(1, 1)).rejects.toThrow(
      NEXT_LESSON_NOT_FOUND_ERROR
    );
  });
});
