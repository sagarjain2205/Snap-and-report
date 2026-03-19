const express = require('express')
const router = express.Router()
const axios = require('axios')

const { upload } = require('../config/cloudinary')
const { protect } = require('../middleware/authMiddleware')

// 🔥 ML URL from ENV
const ML_URL = process.env.ML_SERVICE_URL

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      })
    }

    // 👉 Cloudinary image URL
    const imageUrl = req.file.path

    // 🔥 CALL ML API (HuggingFace)
    const mlResponse = await axios.post(`${ML_URL}/detect`, {
      image_url: imageUrl
    })

    const result = mlResponse.data

    res.json({
      success: true,
      imageUrl,
      detection: result
    })

  } catch (error) {
    console.error("ML ERROR:", error.message)

    res.status(500).json({
      success: false,
      message: 'ML detection failed'
    })
  }
})

module.exports = router