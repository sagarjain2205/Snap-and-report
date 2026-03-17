const express = require('express')
const router = express.Router()
const { upload } = require('../config/cloudinary')
const { detectVehicle } = require('../utils/runPython')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' })
  const result = await detectVehicle(req.file.path)
  res.json({ success: true, imageUrl: req.file.path, detection: result })
})

module.exports = router
