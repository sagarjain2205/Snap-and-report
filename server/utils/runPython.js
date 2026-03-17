const axios = require('axios')

const detectVehicle = async (imageUrl) => {
  try {
    const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
    const response = await axios.post(`${ML_URL}/detect`, {
      image_url: imageUrl
    }, { timeout: 30000 })
    return response.data
  } catch (err) {
    console.error('ML Service error:', err.message)
    return {
      plate: 'NOT_DETECTED',
      confidence: 0,
      vehicle_type: 'Unknown',
      success: false
    }
  }
}

module.exports = { detectVehicle }
