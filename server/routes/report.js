const express = require('express')
const router = express.Router()
const Report = require('../models/Report')
const User = require('../models/User')
const { upload } = require('../config/cloudinary')
const { protect, authorize } = require('../middleware/authMiddleware')
const { detectVehicle } = require('../utils/runPython')

// POST /api/reports - citizen submits report
router.post('/', protect, authorize('citizen'), upload.single('image'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'Please upload an image' })

  const { address, city, lat, lng, description } = req.body

  const report = await Report.create({
    reportedBy: req.user.id,
    imageUrl: req.file.path,
    imagePublicId: req.file.filename,
    location: { address: address || 'Unknown Location', city, lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null },
    description,
    assignedZone: 'General',
    detectionStatus: 'pending'
  })

  // Background ML detection
  detectVehicle(req.file.path).then(async (result) => {
    await Report.findByIdAndUpdate(report._id, {
      detectedPlate: result.plate || 'NOT_DETECTED',
      confidence: result.confidence || 0,
      vehicleType: result.vehicle_type || 'Unknown',
      detectionStatus: result.success ? 'success' : 'failed'
    })
  }).catch(console.error)

  await User.findByIdAndUpdate(req.user.id, { $inc: { reportsCount: 1 } })

  res.status(201).json({ success: true, message: 'Report submitted! AI is processing...', report })
})

// GET /api/reports/my - citizen's own reports
router.get('/my', protect, authorize('citizen'), async (req, res) => {
  const page  = parseInt(req.query.page)  || 1
  const limit = parseInt(req.query.limit) || 10
  const skip  = (page - 1) * limit

  const reports = await Report.find({ reportedBy: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit)
  const total   = await Report.countDocuments({ reportedBy: req.user.id })

  res.json({ success: true, reports, pagination: { page, totalPages: Math.ceil(total / limit), total } })
})

// GET /api/reports - officer/admin sees all reports
router.get('/', protect, authorize('officer', 'admin'), async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)
  const filter = {}
  if (status) filter.status = status

  const reports = await Report.find(filter)
    .populate('reportedBy', 'name email phone')
    .populate('assignedTo', 'name badgeNumber')
    .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))

  const total = await Report.countDocuments(filter)
  res.json({ success: true, reports, pagination: { page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total } })
})

// GET /api/reports/:id
router.get('/:id', protect, async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reportedBy', 'name email phone')
    .populate('assignedTo', 'name badgeNumber zone')

  if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

  if (req.user.role === 'citizen' && report.reportedBy._id.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Access denied' })

  res.json({ success: true, report })
})

// PUT /api/reports/:id/review - officer reviews
router.put('/:id/review', protect, authorize('officer', 'admin'), async (req, res) => {
  const { status, reviewNote } = req.body
  if (!['verified', 'rejected', 'under_review'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' })

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote, assignedTo: req.user.id, reviewedAt: new Date() },
    { new: true }
  )
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' })
  res.json({ success: true, message: `Report ${status}`, report })
})

module.exports = router
