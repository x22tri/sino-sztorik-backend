import { jest } from '@jest/globals';

import { LAST_TIER, COURSE_FINISHED } from '../util/config.js';
import { NEXT_LESSON_NOT_FOUND_ERROR } from '../util/string-literals.js';

import moquelize from '../util/moquelize.js';
import CharacterOrder from '../models/character-orders.js';
import { Progress } from '../util/interfaces.js';

describe('findNextLesson()', function () {
  let findNextLesson: (
    currentTier: number,
    currentLesson: number
  ) => Promise<Progress>;

  async function mockCharacterOrderDatabase(testData: [number, number][]) {
    const databaseInstances = testData.map(([tier, lessonNumber]) =>
      mockCharacterOrderInstance(tier, lessonNumber)
    );

    jest.unstable_mockModule('../models/character-orders.ts', () => ({
      __esModule: true,
      default: moquelize(databaseInstances),
    }));

    const imported = await import(
      '../controllers/users/utils/findNextLesson.js'
    );

    findNextLesson = imported.default;
  }

  function mockCharacterOrderInstance(tier: number, lessonNumber: number) {
    return CharacterOrder.build({
      tier,
      lessonNumber,
      // The following properties are obligatory for a CharacterOrder instance but are not tested by findNextLesson.
      indexInLesson: 1,
      orderId: 99,
      charId: 'test',
    });
  }

  function mockProgressInstance(tier: number, lessonNumber: number): Progress {
    return { tier, lessonNumber };
  }

  afterEach(() => {
    jest.resetModules();
  });

  // Tests start here.

  it('finds the next lesson in the same tier if it exists, even if database entries are in wrong order', async () => {
    await mockCharacterOrderDatabase([
      [1, 1],
      [1, 3],
      [1, 2],
      [3, 2],
      [2, 1],
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual(mockProgressInstance(1, 2));
  });

  it(`finds the next lesson in the same tier if it exists, even if lesson number is not the number directly after user's lesson`, async () => {
    await mockCharacterOrderDatabase([
      [1, 1],
      [1, 3],
      [3, 2],
      [2, 1],
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual(mockProgressInstance(1, 3));
  });

  it(`finds the first lesson in the next tier if no more lessons are found in the current tier`, async () => {
    await mockCharacterOrderDatabase([
      [1, 1],
      [3, 2],
      [2, 3],
      [2, 4],
      [2, 5],
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual(mockProgressInstance(2, 3));
  });

  it(`returns the "course finished" progress state if user is at last tier and there are no more lessons left`, async () => {
    await mockCharacterOrderDatabase([
      [1, 1],
      [3, 2],
      [LAST_TIER, 1],
    ]);

    const nextLesson = await findNextLesson(LAST_TIER, 2);

    expect(nextLesson).toMatchObject(COURSE_FINISHED);
  });

  it(`returns error if user is not at last tier but no more lessons are found`, async () => {
    await mockCharacterOrderDatabase([[1, 1]]);

    await expect(findNextLesson(LAST_TIER - 1, 10)).rejects.toThrow(
      NEXT_LESSON_NOT_FOUND_ERROR
    );
  });

  it(`returns error if no valid lesson objects are found`, async () => {
    await mockCharacterOrderDatabase([]);

    await expect(findNextLesson(1, 1)).rejects.toThrow(
      NEXT_LESSON_NOT_FOUND_ERROR
    );
  });
});
