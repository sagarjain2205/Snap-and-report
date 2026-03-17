const express = require('express')
const router  = express.Router()
const Report  = require('../models/Report')
const Challan = require('../models/Challan')
const { protect, authorize } = require('../middleware/authMiddleware')

// GET /api/stats/dashboard - police
router.get('/dashboard', protect, authorize('officer', 'admin'), async (req, res) => {
  const reportFilter  = {}
  const challanFilter = {}
  if (req.user.role === 'officer') challanFilter.issuedBy = req.user.id

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [totalReports, pendingReports, verifiedReports, rejectedReports, challanIssued, revenueData, recentReports, monthlyReports] = await Promise.all([
    Report.countDocuments(reportFilter),
    Report.countDocuments({ ...reportFilter, status: 'pending' }),
    Report.countDocuments({ ...reportFilter, status: 'verified' }),
    Report.countDocuments({ ...reportFilter, status: 'rejected' }),
    Challan.countDocuments(challanFilter),
    Challan.aggregate([{ $match: { ...challanFilter, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Report.find(reportFilter).populate('reportedBy', 'name').sort({ createdAt: -1 }).limit(5),
    Report.aggregate([
      { $match: { ...reportFilter, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ])

  res.json({
    success: true,
    stats: {
      totalReports, pendingReports, verifiedReports, rejectedReports,
      challanIssued, totalRevenue: revenueData[0]?.total || 0,
      recentReports, monthlyReports
    }
  })
})

// GET /api/stats/citizen
router.get('/citizen', protect, authorize('citizen'), async (req, res) => {
  const filter = { reportedBy: req.user.id }
  const [total, pending, verified, rejected, challanIssued] = await Promise.all([
    Report.countDocuments(filter),
    Report.countDocuments({ ...filter, status: 'pending' }),
    Report.countDocuments({ ...filter, status: 'verified' }),
    Report.countDocuments({ ...filter, status: 'rejected' }),
    Report.countDocuments({ ...filter, status: 'challan_issued' })
  ])
  res.json({ success: true, stats: { total, pending, verified, rejected, challanIssued } })
})

module.exports = router
