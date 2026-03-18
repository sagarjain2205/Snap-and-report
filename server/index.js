const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const cors = require('cors')
require('express-async-errors')

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const { autoSeed } = require('./utils/autoSeed')

const authRoutes    = require('./routes/auth')
const reportRoutes  = require('./routes/report')
const challanRoutes = require('./routes/challan')
const detectRoutes  = require('./routes/detect')
const statsRoutes   = require('./routes/stats')

const app = express()

// ✅ Connect DB
connectDB().then(() => autoSeed())

// 🔥 FINAL CORS (NO BUG VERSION)
const allowedOrigins = [
  "http://localhost:5173",
  "https://snap-and-report-fyzscyhcw-jainsagar00003-5829s-projects.vercel.app"
]

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(null, false)
    }
  },
  credentials: true
}))

// 🔥 IMPORTANT: preflight fix
app.options('*', cors())

// ✅ Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Snap & Report API running!'
  })
})

// ✅ Routes
app.use('/api/auth',     authRoutes)
app.use('/api/reports',  reportRoutes)
app.use('/api/challans', challanRoutes)
app.use('/api/detect',   detectRoutes)
app.use('/api/stats',    statsRoutes)

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// ❌ Error handler
app.use(errorHandler)

// 🚀 Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})