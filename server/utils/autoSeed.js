const User = require('../models/User')

const DEMO_USERS = [
  {
    name: 'Demo Citizen',
    email: 'citizen@demo.com',
    password: 'demo123',
    role: 'citizen',
    phone: '9876543210'
  },
  {
    name: 'Officer Rajesh Kumar',
    email: 'officer@demo.com',
    password: 'demo123',
    role: 'officer',
    badgeNumber: 'DL-001',
    zone: 'General',
    department: 'Delhi Traffic Police'
  }
]

const autoSeed = async () => {
  try {
    for (const userData of DEMO_USERS) {
      const exists = await User.findOne({ email: userData.email })
      if (!exists) {
        const user = new User(userData)
        await user.save()
        console.log(`Demo user created: ${userData.email}`)
      }
    }
    console.log('Auto seed complete!')
  } catch (err) {
    console.error('Auto seed error:', err.message)
  }
}

module.exports = { autoSeed }
