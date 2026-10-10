// server/index.js
const express = require('express')
const cors = require('cors')
const db = require('./db.cjs')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize SQLite database
db.initDb()

// System Endpoints
app.post('/api/reset', (req, res) => {
  try {
    db.resetDb()
    res.json({ success: true, message: 'SQLite database reset. All previous loan processing removed.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Process multiple demo loan applications dynamically
app.post('/api/process-demo', (req, res) => {
  try {
    const apps = db.processMultipleDemoApplications()
    res.json({ success: true, count: apps.length, applications: apps })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Applications
app.get('/api/applications', (req, res) => {
  try {
    res.json(db.getApplications())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/applications', (req, res) => {
  try {
    const newApp = db.processLoanApplication(req.body)
    res.json(newApp)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/applications/:id', (req, res) => {
  try {
    db.updateApplication(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/applications/customer/:customerId', (req, res) => {
  try {
    res.json(db.getApplicationsByCustomer(req.params.customerId))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/applications/customer/:customerId', (req, res) => {
  try {
    const deletedCount = db.removePreviousLoanProcessing(req.params.customerId)
    res.json({ success: true, deletedCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Customers
app.get('/api/customers', (req, res) => {
  try {
    res.json(db.getCustomers())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/customers/:id/kyc', (req, res) => {
  try {
    const { status, verifiedDate } = req.body
    db.updateCustomerKyc(req.params.id, status, verifiedDate || new Date().toISOString().split('T')[0])
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Dealers
app.get('/api/dealers', (req, res) => {
  try {
    res.json(db.getDealers())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/dealers', (req, res) => {
  try {
    res.json(db.addDealer(req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/dealers/:id/toggle', (req, res) => {
  try {
    db.toggleDealer(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Vehicles
app.get('/api/vehicles', (req, res) => {
  try {
    res.json(db.getVehicles())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/vehicles', (req, res) => {
  try {
    res.json(db.addVehicle(req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/vehicles/:id/toggle', (req, res) => {
  try {
    db.toggleVehicle(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Quotations
app.get('/api/quotations', (req, res) => {
  try {
    res.json(db.getQuotations())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/quotations', (req, res) => {
  try {
    res.json(db.addQuotation(req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Policies
app.get('/api/policy', (req, res) => {
  try {
    res.json(db.getPolicy())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/policy', (req, res) => {
  try {
    db.savePolicy(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/policy-versions', (req, res) => {
  try {
    res.json(db.getPolicyVersions())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/policy-versions', (req, res) => {
  try {
    db.addPolicyVersion(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  try {
    res.json(db.getAuditLogs())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/audit-logs', (req, res) => {
  try {
    res.json(db.addAuditLog(req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Notifications
app.get('/api/notifications', (req, res) => {
  try {
    res.json(db.getNotifications())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/notifications/:id/read', (req, res) => {
  try {
    db.markNotificationRead(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Loan Rangers SQLite Backend listening on http://127.0.0.1:${PORT}`)
})
