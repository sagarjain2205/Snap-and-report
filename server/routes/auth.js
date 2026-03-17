const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { sendTokenResponse } = require('../utils/jwt')
const { protect, authorize } = require('../middleware/authMiddleware')

// POST /api/auth/register/citizen
router.post('/register/citizen', async (req, res) => {
  const { name, email, password, phone } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please fill all fields' })

  const exists = await User.findOne({ email })
  if (exists)
    return res.status(400).json({ success: false, message: 'Email already registered' })

  const user = await User.create({ name, email, password, phone, role: 'citizen' })
  sendTokenResponse(user, 201, res)
})

// POST /api/auth/register/officer (admin only)
router.post('/register/officer', protect, authorize('admin'), async (req, res) => {
  const { name, email, password, badgeNumber, zone, department, phone } = req.body
  if (!name || !email || !password || !badgeNumber || !zone)
    return res.status(400).json({ success: false, message: 'Please fill all required fields' })

  const user = await User.create({ name, email, password, phone, role: 'officer', badgeNumber, zone, department })
  sendTokenResponse(user, 201, res)
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please enter email and password' })

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' })

  sendTokenResponse(user, 200, res)
})

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id)
  res.json({ success: true, user })
})

// PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  const { name, phone } = req.body
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true, runValidators: true })
  res.json({ success: true, user })
})

module.exports = router
