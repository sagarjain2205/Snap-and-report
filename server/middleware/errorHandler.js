const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message)

  if (err.name === 'CastError')
    return res.status(404).json({ success: false, message: 'Resource not found' })

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ success: false, message: `${field} already exists` })
  }

  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ success: false, message: msgs.join(', ') })
  }

  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ success: false, message: 'Invalid token' })

  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ success: false, message: 'Token expired, please login again' })

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
}

module.exports = errorHandler
