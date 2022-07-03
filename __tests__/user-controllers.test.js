const { advanceUser } = require('../controllers/user-controllers')

// Mocking variables. Note: this should be done on a test-by-test basis but I'm having trouble getting sequelize-mock
// to work inside doMock calls (which are the only ones that can run inside a test, but for some reason they yield the live DB).

let mockCurrentTier = 1
let mockCurrentLesson = 8

jest.mock(
  '../util/getUserData',
  () => async () =>
    Promise.resolve({
      userId: 900,
      displayName: 'Test User',
      email: 'test@test.com',
      password: 'hashedpw',
      currentTier: mockCurrentTier,
      currentLesson: mockCurrentLesson,
      update() {
        // console.log('updated')
      },
    })
)

// Mocking middleware arguments.
const mockRes = (res = {}) => {
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

jest.mock('../models/character-orders', () => {
  const SequelizeMock = require('sequelize-mock')
  const mockDB = new SequelizeMock()
  const mockCharacterOrder = mockDB.define('characterorder')
  let currentTier = 1
  let currentLessonPlusThree = 11 // To-Do: remove these vars, put this mock inside test, have tests govern these values.

  mockCharacterOrder.$queueResult([
    mockCharacterOrder.build({
      orderId: 2,
      charId: 2,
      tier: currentTier,
      lessonNumber: currentLessonPlusThree,
      indexInLesson: 1,
    }),
  ])
  return mockCharacterOrder
})

// Tests start here.
describe('Tests for the function "advanceUser" (route /api/users/advance)', () => {
  it("adds to user's currentLesson if characters exist in current tier in a lesson number higher than currentLesson", async () => {
    // mockCurrentTier = 1
    // mockCurrentLesson = 8 // To-Do: make these vars govern the current user state instead of "global" vars.

    const res = mockRes()

    await advanceUser(
      () => {},
      res,
      () => {}
    )

    expect(res.json).toHaveBeenCalledWith(
      `Sikeres frissítés! Az új állapot: ${mockCurrentTier}. kör, ${
        mockCurrentLesson + 3
      }. lecke.`
    )
  })
})
