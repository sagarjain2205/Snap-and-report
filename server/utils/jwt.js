const jwt = require('jsonwebtoken')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      zone: user.zone,
      badgeNumber: user.badgeNumber,
      reportsCount: user.reportsCount,
      challansIssued: user.challansIssued
    }
  })
}

module.exports = { generateToken, sendTokenResponse }
