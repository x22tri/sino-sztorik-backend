const { advanceUser } = require('../controllers/user-controllers')

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
        console.log('updated')
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
  mockCharacterOrder.$queueResult([
    mockCharacterOrder.build({
      orderId: 2,
      charId: 2,
      tier: 1,
      lessonNumber: 9,
      indexInLesson: 1,
    }),
  ])
  return mockCharacterOrder
})

// afterEach(() => {
//   mockCharacterOrder.$queryInterface.$clearResults()
// })

// Tests start here.
describe('Tests for the function "advanceUser" (route /api/users/advance)', () => {
  it("adds to user's currentLesson if characters exist in current tier in a lesson number higher than currentLesson", async () => {
    mockCurrentTier = 1
    mockCurrentLesson = 8

    const res = mockRes()

    await advanceUser(
      () => {},
      res,
      () => {}
    )

    expect(res.json).toHaveBeenCalledWith(
      `Sikeres frissítés! Az új állapot: ${mockCurrentTier}. kör, ${
        mockCurrentLesson + 1
      }. lecke.`
    )
  })

  // it("adds 1 to user's currentTier and finds the 1st lesson in that tier if there are no characters left in lessons in currentTier", async () => {
  //   mockCurrentTier = 1
  //   mockCurrentLesson = 2
  //   mockNextTierFirstLesson = 9

  //   const res = mockRes()

  //   jest.mock('../models/character-orders', () => {
  //     // const SequelizeMock = require('sequelize-mock')
  //     // const dbMock = new SequelizeMock()
  //     // const CharacterOrder = dbMock.define('characterorder')
  //     mockCharacterOrder.$queueResult([
  //       mockCharacterOrder.build({
  //         orderId: 2,
  //         charId: 2,
  //         tier: mockCurrentTier + 1,
  //         lessonNumber: mockNextTierFirstLesson,
  //         indexInLesson: 1,
  //       }),
  //     ])
  //     return mockCharacterOrder
  //   })

  //   await advanceUser(
  //     () => {},
  //     res,
  //     () => {}
  //   )

  //   expect(res.json).toHaveBeenCalledWith(
  //     `Sikeres frissítés! Az új állapot: ${
  //       mockCurrentTier + 1
  //     }. kör, ${mockNextTierFirstLesson}. lecke.`
  //   )
  // })
})
