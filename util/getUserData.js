const User = require('../models/users')
const HttpError = require('../models/http-error')
const jwt = require('jsonwebtoken')

const getUserData = async (req, res, next) => {
  let user
  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return next(new HttpError('Hitelesítés sikertelen.', 403))

    const decodedToken = jwt.verify(token, process.env.JWT_KEY)
    user = await User.findOne({ where: { userId: decodedToken.userId } })
    if (!user) return next(new HttpError('A felhasználó nem található.', 404))
    else return user
  } catch (err) {
    return next(new HttpError(err, 500))
  }
}

module.exports = getUserData
