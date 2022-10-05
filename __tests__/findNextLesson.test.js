const { LAST_TIER, COURSE_FINISHED } = require('../util/config');
const { NEXT_LESSON_NOT_FOUND_ERROR } = require('../util/string-literals');

const moquelize = require('../util/moquelize');
let findNextLesson;

// mockData type: Partial<CharacterOrder>[]
function setupWith(mockData) {
  jest.doMock('../models/character-orders', () => moquelize(mockData));

  findNextLesson =
    require('../controllers/users/utils/findNextLesson').findNextLesson;
}

fdescribe('findNextLesson()', function () {
  afterEach(() => {
    jest.resetModules();
  });

  it('finds the next lesson in the same tier when exists, even when database entries are in wrong order', async () => {
    setupWith([
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
    setupWith([
      { tier: 1, lessonNumber: 1 },
      { tier: 1, lessonNumber: 3 },
      { tier: 3, lessonNumber: 2 },
      { tier: 2, lessonNumber: 1 },
    ]);

    const nextLesson = await findNextLesson(1, 1);

    expect(nextLesson).toEqual({ tier: 1, lessonNumber: 3 });
  });

  it(`finds the first lesson in the next tier when no more lessons are found in the current tier`, async () => {
    setupWith([
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
    setupWith([
      { tier: 1, lessonNumber: 1 },
      { tier: 3, lessonNumber: 2 },
      { tier: 4, lessonNumber: 1 },
    ]);

    const nextLesson = await findNextLesson(LAST_TIER, 2);

    expect(nextLesson).toEqual(COURSE_FINISHED);
  });

  it(`returns error when user is not at last tier but no more lessons are found`, async () => {
    setupWith([{ tier: 1, lessonNumber: 1 }]);

    await expect(findNextLesson(LAST_TIER - 1, 10)).rejects.toThrow(
      NEXT_LESSON_NOT_FOUND_ERROR
    );
  });

  it(`returns error when no valid lesson objects are found`, async () => {
    setupWith([
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
