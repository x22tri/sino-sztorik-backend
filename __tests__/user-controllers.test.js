const { advanceUser } = require('../controllers/user-controllers')

// Mocking middleware arguments.
const mockRes = (res = {}) => {
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// Mocking database connections.
let mockUser = {}
jest.mock('../util/getUserData', () => async () => Promise.resolve(mockUser))

let mockQueryResult = {}
jest.mock('../models/character-orders', () => {
  class MockCharacterOrder {
    static async findAll() {
      return Promise.resolve(mockQueryResult)
    }
  }
  return MockCharacterOrder
})

// Tests start here.
describe('Tests for the function "advanceUser" (route /api/users/advance)', () => {
  it("finds the next lesson (via CharacterOrders DB) in the same tier (if it exists) and updates user's currentLesson", async () => {
    currentTier = 1
    currentLesson = 8
    gap = 3 // Even when the next lesson isn't 1 above the current lesson, the code has to find it.
    nextLesson = currentLesson + gap

    const res = mockRes()

    // The User and CharacterOrder models have other fields as well. They've been omitted for the sake of brevity.
    mockUser = {
      currentTier,
      currentLesson,
      update() {},
    }

    mockQueryResult = [
      {
        tier: currentTier,
        lessonNumber: nextLesson,
      },
    ]

    await advanceUser(
      () => {},
      res,
      () => {}
    )

    expect(res.json).toHaveBeenCalledWith(
      `Sikeres frissítés! Az új állapot: ${currentTier}. kör, ${nextLesson}. lecke.`
    )
  })
})
