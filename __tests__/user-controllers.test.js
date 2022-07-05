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
let mockQueryFunction = async () => Promise.resolve({})
jest.mock('../models/character-orders', () => {
  class MockCharacterOrder {
    static async findAll() {
      return mockQueryFunction()
    }
  }
  return MockCharacterOrder
})

// Tests start here.
describe('Tests for the function "advanceUser" (route /api/users/advance)', () => {
  it("finds the next lesson (via CharacterOrders DB) in the same tier (if it exists) and updates user's currentLesson", async () => {
    currentTier = 1
    currentLesson = 8
    nextLesson = currentLesson + 3 // Even when the next lesson isn't 1 above the current lesson, the code has to find it.

    const res = mockRes()

    // The User and CharacterOrder models have other fields as well. They've been omitted for the sake of brevity.
    mockUser = {
      currentTier,
      currentLesson,
      update() {},
    }

    mockQueryFunction = async () =>
      Promise.resolve([
        {
          tier: currentTier,
          lessonNumber: nextLesson,
        },
      ])

    await advanceUser(
      () => {},
      res,
      () => {}
    )

    expect(res.json).toHaveBeenCalledWith(
      `Sikeres frissítés! Az új állapot: ${currentTier}. kör, ${nextLesson}. lecke.`
    )
  }),
    it('finds the first lesson in the next tier if no more lessons in the current tier exist', async () => {
      currentTier = 1
      currentLesson = 8
      nextTier = 2
      nextTierFirstLessonNumber = 2

      const res = mockRes()

      mockUser = {
        currentTier,
        currentLesson,
        update() {},
      }

      let remainingLessonsInTierChecked = false // This check needs to fail before the currently tested check is run.

      mockQueryFunction = async () => {
        if (!remainingLessonsInTierChecked) {
          remainingLessonsInTierChecked = true
          return Promise.resolve(null)
        } else {
          return Promise.resolve([
            {
              tier: nextTier,
              lessonNumber: nextTierFirstLessonNumber,
            },
          ])
        }
      }

      await advanceUser(
        () => {},
        res,
        () => {}
      )

      expect(res.json).toHaveBeenCalledWith(
        `Sikeres frissítés! Az új állapot: ${nextTier}. kör, ${nextTierFirstLessonNumber}. lecke.`
      )
    }),
    it('unlocks all characters if there are no lessons in the same nor the next tier and tier is 4', async () => {
      currentTier = 4
      currentLesson = 97

      const res = mockRes()

      mockUser = {
        currentTier,
        currentLesson,
        update() {},
      }

      mockQueryFunction = async () => Promise.resolve(null)

      await advanceUser(
        () => {},
        res,
        () => {}
      )

      expect(res.json).toHaveBeenCalledWith(
        `Befejezted a kurzust. Minden karakter feloldva.`
      )
    })
})
