const { advanceUser } = require('../controllers/user-controllers')

let mockUser = {}
jest.mock('../util/getUserData', () => async () => Promise.resolve(mockUser))

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
    mockCurrentTier = 1
    mockCurrentLesson = 8

    const res = mockRes()

    mockUser = {
      currentTier: mockCurrentTier,
      currentLesson: mockCurrentLesson,
      update() {
        console.log('updated')
      },
    }

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
