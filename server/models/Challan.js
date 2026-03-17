const mongoose = require('mongoose')

const ChallanSchema = new mongoose.Schema({
  reportId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  plateNumber:   { type: String, required: true, uppercase: true },
  vehicleType:   { type: String, default: 'Unknown' },
  ownerName:     { type: String, default: 'Vehicle Owner' },
  ownerPhone:    { type: String, default: 'N/A' },
  ownerAddress:  { type: String, default: 'N/A' },
  violationType: { type: String, default: 'Illegal Parking' },
  violationLocation: { type: String, required: true },
  violationDate: { type: Date, default: Date.now },
  imageEvidence: { type: String },
  amount:        { type: Number, default: 500 },
  paymentStatus: { type: String, enum: ['pending','paid','waived'], default: 'pending' },
  paymentDate:   { type: Date },
  issuedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  zone:          { type: String },
  challanNumber: { type: String, unique: true },
  notes:         { type: String }
}, { timestamps: true })

ChallanSchema.pre('save', async function(next) {
  if (!this.challanNumber) {
    const ts  = Date.now().toString().slice(-8)
    const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    this.challanNumber = `SNR-${ts}-${rnd}`
  }
  next()
})

module.exports = mongoose.model('Challan', ChallanSchema)
