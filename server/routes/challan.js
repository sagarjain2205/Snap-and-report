const express = require('express')
const router  = express.Router()
const Challan = require('../models/Challan')
const Report  = require('../models/Report')
const User    = require('../models/User')
const PDFDocument = require('pdfkit')
const { protect, authorize } = require('../middleware/authMiddleware')

const getMockOwner = (plate) => {
  const db = {
    'MH12AB1234': { ownerName:'Rahul Sharma',  ownerPhone:'9876543210', ownerAddress:'Pune, Maharashtra' },
    'DL01CA5678': { ownerName:'Priya Singh',   ownerPhone:'9812345678', ownerAddress:'New Delhi' },
    'KA03MN9012': { ownerName:'Amit Kumar',    ownerPhone:'9988776655', ownerAddress:'Bangalore, Karnataka' },
  }
  return db[plate] || { ownerName:'Vehicle Owner', ownerPhone:'N/A', ownerAddress:'Address not available' }
}

// POST /api/challans
router.post('/', protect, authorize('officer', 'admin'), async (req, res) => {
  const { reportId, plateNumber, violationType, amount, notes, violationLocation } = req.body
  if (!reportId || !plateNumber)
    return res.status(400).json({ success: false, message: 'Report ID and plate number required' })

  const report = await Report.findById(reportId)
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

  const owner = getMockOwner(plateNumber.toUpperCase())

  const challan = await Challan.create({
    reportId,
    plateNumber: plateNumber.toUpperCase(),
    vehicleType: report.vehicleType || 'Unknown',
    ...owner,
    violationType: violationType || 'Illegal Parking',
    violationLocation: violationLocation || report.location.address,
    imageEvidence: report.imageUrl,
    amount: amount || 500,
    issuedBy: req.user.id,
    zone: req.user.zone,
    notes
  })

  await Report.findByIdAndUpdate(reportId, { status: 'challan_issued' })
  await User.findByIdAndUpdate(req.user.id, { $inc: { challansIssued: 1 } })

  const populated = await Challan.findById(challan._id).populate('issuedBy', 'name badgeNumber zone').populate('reportId')
  res.status(201).json({ success: true, message: 'Challan issued!', challan: populated })
})

// GET /api/challans
router.get('/', protect, authorize('officer', 'admin'), async (req, res) => {
  const { paymentStatus, page = 1, limit = 10 } = req.query
  const skip   = (parseInt(page) - 1) * parseInt(limit)
  const filter = {}
  if (req.user.role === 'officer') filter.issuedBy = req.user.id
  if (paymentStatus) filter.paymentStatus = paymentStatus

  const challans = await Challan.find(filter)
    .populate('issuedBy', 'name badgeNumber')
    .populate('reportId', 'imageUrl location')
    .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))

  const total = await Challan.countDocuments(filter)
  res.json({ success: true, challans, pagination: { page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total } })
})

// GET /api/challans/:id
router.get('/:id', protect, authorize('officer', 'admin'), async (req, res) => {
  const challan = await Challan.findById(req.params.id)
    .populate('issuedBy', 'name badgeNumber zone department').populate('reportId')
  if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' })
  res.json({ success: true, challan })
})

// PUT /api/challans/:id/payment
router.put('/:id/payment', protect, authorize('officer', 'admin'), async (req, res) => {
  const { paymentStatus } = req.body
  const challan = await Challan.findByIdAndUpdate(req.params.id, {
    paymentStatus,
    paymentDate: paymentStatus === 'paid' ? new Date() : null
  }, { new: true })
  res.json({ success: true, challan })
})

// GET /api/challans/:id/pdf
router.get('/:id/pdf', protect, authorize('officer', 'admin'), async (req, res) => {
  const challan = await Challan.findById(req.params.id).populate('issuedBy', 'name badgeNumber zone department')
  if (!challan) return res.status(404).json({ success: false, message: 'Not found' })

  const doc = new PDFDocument({ margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=challan-${challan.challanNumber}.pdf`)
  doc.pipe(res)

  doc.fontSize(22).font('Helvetica-Bold').text('SNAP & REPORT', { align: 'center' })
  doc.fontSize(12).font('Helvetica').text('AI-Powered Illegal Parking Reporter', { align: 'center' })
  doc.moveDown()
  doc.fontSize(16).font('Helvetica-Bold').text('PARKING VIOLATION NOTICE', { align: 'center' })
  doc.moveDown()
  doc.fontSize(11).font('Helvetica-Bold').text(`Challan No: ${challan.challanNumber}`)
  doc.text(`Date: ${new Date(challan.createdAt).toLocaleDateString('en-IN')}`)
  doc.moveDown()

  doc.fontSize(13).font('Helvetica-Bold').text('VEHICLE DETAILS')
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
  doc.moveDown(0.3)
  doc.fontSize(10).font('Helvetica')
  doc.text(`Plate Number: ${challan.plateNumber}`)
  doc.text(`Vehicle Type: ${challan.vehicleType}`)
  doc.text(`Owner: ${challan.ownerName}`)
  doc.text(`Address: ${challan.ownerAddress}`)
  doc.moveDown()

  doc.fontSize(13).font('Helvetica-Bold').text('VIOLATION DETAILS')
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
  doc.moveDown(0.3)
  doc.fontSize(10).font('Helvetica')
  doc.text(`Violation: ${challan.violationType}`)
  doc.text(`Location: ${challan.violationLocation}`)
  doc.text(`Date/Time: ${new Date(challan.violationDate).toLocaleString('en-IN')}`)
  doc.moveDown()

  doc.fontSize(13).font('Helvetica-Bold').text('FINE AMOUNT')
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
  doc.moveDown(0.3)
  doc.fontSize(18).font('Helvetica-Bold').fillColor('red').text(`Rs. ${challan.amount}/-`, { align: 'center' })
  doc.fillColor('black').moveDown()

  doc.fontSize(10).font('Helvetica')
  doc.text(`Issued By: ${challan.issuedBy.name} | Badge: ${challan.issuedBy.badgeNumber} | Zone: ${challan.issuedBy.zone}`)
  doc.moveDown()

  doc.fontSize(8).fillColor('gray')
  doc.text('This is a computer generated notice from Snap & Report civic platform.', { align: 'center' })
  doc.text('For official enforcement, contact local traffic authorities.', { align: 'center' })

  doc.end()
})

module.exports = router
