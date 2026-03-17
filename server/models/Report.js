const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  reportedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl:      { type: String, required: true },
  imagePublicId: { type: String },
  location: {
    address: { type: String, default: 'Unknown Location' },
    city:    { type: String },
    lat:     { type: Number },
    lng:     { type: Number }
  },
  detectedPlate:   { type: String, default: 'NOT_DETECTED' },
  confidence:      { type: Number, default: 0 },
  vehicleType:     { type: String, default: 'Unknown' },
  detectionStatus: { type: String, enum: ['pending','success','failed'], default: 'pending' },
  status: {
    type: String,
    enum: ['pending','under_review','verified','rejected','challan_issued'],
    default: 'pending'
  },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedZone: { type: String, default: 'General' },
  reviewNote:   { type: String },
  reviewedAt:   { type: Date },
  description:  { type: String, maxlength: 500 }
}, { timestamps: true })

ReportSchema.index({ status: 1, assignedZone: 1 })
ReportSchema.index({ reportedBy: 1 })
ReportSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Report', ReportSchema)
