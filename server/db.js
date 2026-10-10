// server/db.js
const Database = require('better-sqlite3')
const path = require('path')
const { evaluateCreditApplication } = require('./creditEngine')

const DB_PATH = path.join(__dirname, '..', 'loan_rangers.db')
const db = new Database(DB_PATH)

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL')

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      masked_account TEXT,
      officer_level TEXT,
      officer_authority_limit INTEGER,
      dealer_id TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      masked_account TEXT NOT NULL,
      citizen_number TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      age INTEGER NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      kyc_status TEXT NOT NULL,
      kyc_verified_date TEXT,
      consent_given INTEGER NOT NULL,
      consent_timestamp TEXT,
      consent_version TEXT,
      salary_monthly_gross INTEGER NOT NULL,
      salary_net_deposit INTEGER NOT NULL,
      salary_history_json TEXT NOT NULL,
      existing_monthly_debt INTEGER NOT NULL,
      credit_history_json TEXT NOT NULL,
      blacklist_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dealers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      active INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      variant TEXT NOT NULL,
      category TEXT NOT NULL,
      eligible_value INTEGER NOT NULL,
      active INTEGER NOT NULL,
      effective_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      dealer_id TEXT NOT NULL,
      dealer_name TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      variant TEXT NOT NULL,
      eligible_price INTEGER NOT NULL,
      quotation_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      status TEXT NOT NULL,
      confirmed_by_customer_id TEXT
    );

    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      min_age INTEGER NOT NULL,
      max_age_final_instalment INTEGER NOT NULL,
      min_term_months INTEGER NOT NULL,
      max_term_months INTEGER NOT NULL,
      max_automated_ltv_percent REAL NOT NULL,
      max_automated_dsr_percent REAL NOT NULL,
      max_automated_loan_amount INTEGER NOT NULL,
      approved_annual_interest_rate REAL NOT NULL,
      approval_validity_days INTEGER NOT NULL,
      effective_date TEXT NOT NULL,
      proposed_changes_json TEXT
    );

    CREATE TABLE IF NOT EXISTS policy_versions (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      proposer_name TEXT NOT NULL,
      approver_name TEXT NOT NULL,
      approved_date TEXT NOT NULL,
      justification TEXT NOT NULL,
      policy_snapshot_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      masked_account TEXT NOT NULL,
      quotation_id TEXT NOT NULL,
      quotation_json TEXT NOT NULL,
      requested_loan_amount INTEGER NOT NULL,
      approved_loan_amount INTEGER,
      loan_term_months INTEGER NOT NULL,
      interest_rate_annual REAL NOT NULL,
      emi_monthly REAL NOT NULL,
      down_payment INTEGER NOT NULL,
      ltv_percent REAL NOT NULL,
      debt_service_ratio_percent REAL NOT NULL,
      verified_monthly_gross_income INTEGER NOT NULL,
      existing_monthly_debt INTEGER NOT NULL,
      status TEXT NOT NULL,
      stage INTEGER NOT NULL,
      decision_reason TEXT,
      decision_date TEXT,
      approval_expiry_date TEXT,
      approval_conditions_json TEXT,
      bureau_status TEXT NOT NULL,
      bureau_retry_count INTEGER NOT NULL,
      assigned_officer_id TEXT,
      assigned_officer_name TEXT,
      documents_json TEXT NOT NULL,
      document_requests_json TEXT NOT NULL,
      officer_notes_json TEXT NOT NULL,
      rule_results_json TEXT NOT NULL,
      timeline_json TEXT NOT NULL,
      version INTEGER NOT NULL,
      previous_versions_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      application_id TEXT,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_role TEXT NOT NULL,
      recipient_customer_id TEXT,
      recipient_dealer_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER NOT NULL,
      application_id TEXT
    );
  `)

  // Check if base master users exist
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count
  if (userCount === 0) {
    seedMasterData()
  }
}

function seedMasterData() {
  const users = [
    { id: 'USR-CUST-001', name: 'Aarav Sharma', role: 'customer', email: 'aarav.sharma@example.com', masked_account: 'ACC-****-4921' },
    { id: 'USR-CUST-002', name: 'Sunita KC', role: 'customer', email: 'sunita.kc@example.com', masked_account: 'ACC-****-7814' },
    { id: 'USR-CUST-003', name: 'Deepak Adhikari', role: 'customer', email: 'deepak.adhikari@example.com', masked_account: 'ACC-****-3312' },
    { id: 'USR-CUST-004', name: 'Pooja Bhattarai', role: 'customer', email: 'pooja.bhattarai@example.com', masked_account: 'ACC-****-5520' },
    { id: 'USR-CUST-005', name: 'Rohan Shrestha', role: 'customer', email: 'rohan.shrestha@example.com', masked_account: 'ACC-****-9104' },
    { id: 'USR-OFFICER-001', name: 'Bikram Thapa', role: 'officer', email: 'bikram.thapa@loanrangers.bank.np', officer_level: 'standard', officer_authority_limit: 2500000 },
    { id: 'USR-OFFICER-002', name: 'Pooja Karki', role: 'officer', email: 'pooja.karki@loanrangers.bank.np', officer_level: 'senior', officer_authority_limit: 5000000 },
    { id: 'USR-ADMIN-001', name: 'Nikita Shrestha', role: 'admin', email: 'nikita.shrestha@loanrangers.bank.np' },
    { id: 'USR-ADMIN-002', name: 'Sanjay Shrestha', role: 'admin', email: 'sanjay.shrestha@loanrangers.bank.np' },
    { id: 'USR-DEALER-001', name: 'Ramesh Bajracharya', role: 'dealer', email: 'dealer@kathmandumotors.com.np', dealer_id: 'DLR-001' }
  ]

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, role, email, masked_account, officer_level, officer_authority_limit, dealer_id)
    VALUES (@id, @name, @role, @email, @masked_account, @officer_level, @officer_authority_limit, @dealer_id)
  `)

  users.forEach((u) => {
    insertUser.run({
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      masked_account: u.masked_account || null,
      officer_level: u.officer_level || null,
      officer_authority_limit: u.officer_authority_limit || null,
      dealer_id: u.dealer_id || null
    })
  })

  // Customers master profiles
  const customers = [
    {
      id: 'USR-CUST-001',
      full_name: 'Aarav Sharma',
      masked_account: 'ACC-****-4921',
      citizen_number: '27-01-78-04921',
      date_of_birth: '1992-05-14',
      age: 34,
      address: 'Naxal, Kathmandu-1, Nepal',
      phone: '+977-9841234567',
      email: 'aarav.sharma@example.com',
      kyc_status: 'verified',
      kyc_verified_date: '2026-03-15',
      consent_given: 1,
      consent_timestamp: '2026-10-05T09:12:00Z',
      consent_version: 'v2.1-2026',
      salary_monthly_gross: 150000,
      salary_net_deposit: 122000,
      salary_history_json: JSON.stringify([122000, 122000, 122000, 122000, 122000, 122000]),
      existing_monthly_debt: 20000,
      credit_history_json: JSON.stringify({
        hasEstablishedHistory: true,
        overdueBalance: 0,
        maxDaysLate12m: 0,
        creditBureauScore: 785
      }),
      blacklist_status: 'clean'
    },
    {
      id: 'USR-CUST-002',
      full_name: 'Sunita KC',
      masked_account: 'ACC-****-7814',
      citizen_number: '27-02-76-11492',
      date_of_birth: '1994-08-20',
      age: 32,
      address: 'Jhamsikhel, Lalitpur, Nepal',
      phone: '+977-9851098765',
      email: 'sunita.kc@example.com',
      kyc_status: 'outdated',
      kyc_verified_date: '2024-01-10',
      consent_given: 1,
      consent_timestamp: '2026-10-06T10:00:00Z',
      consent_version: 'v2.1-2026',
      salary_monthly_gross: 130000,
      salary_net_deposit: 108000,
      salary_history_json: JSON.stringify([108000, 108000, 108000, 108000, 108000, 108000]),
      existing_monthly_debt: 15000,
      credit_history_json: JSON.stringify({
        hasEstablishedHistory: true,
        overdueBalance: 0,
        maxDaysLate12m: 0,
        creditBureauScore: 740
      }),
      blacklist_status: 'clean'
    },
    {
      id: 'USR-CUST-003',
      full_name: 'Deepak Adhikari',
      masked_account: 'ACC-****-3312',
      citizen_number: '27-01-69-99412',
      date_of_birth: '1988-11-03',
      age: 37,
      address: 'Baneshwor, Kathmandu, Nepal',
      phone: '+977-9801239876',
      email: 'deepak.adhikari@example.com',
      kyc_status: 'verified',
      kyc_verified_date: '2026-04-10',
      consent_given: 1,
      consent_timestamp: '2026-10-07T11:20:00Z',
      consent_version: 'v2.1-2026',
      salary_monthly_gross: 160000,
      salary_net_deposit: 130000,
      salary_history_json: JSON.stringify([130000, 130000, 130000, 130000, 130000, 130000]),
      existing_monthly_debt: 25000,
      credit_history_json: JSON.stringify({
        hasEstablishedHistory: true,
        overdueBalance: 85000,
        maxDaysLate12m: 90,
        creditBureauScore: 490
      }),
      blacklist_status: 'confirmed_match'
    },
    {
      id: 'USR-CUST-004',
      full_name: 'Pooja Bhattarai',
      masked_account: 'ACC-****-5520',
      citizen_number: '27-01-79-11029',
      date_of_birth: '1997-02-18',
      age: 29,
      address: 'Lazimpat, Kathmandu, Nepal',
      phone: '+977-9861112233',
      email: 'pooja.bhattarai@example.com',
      kyc_status: 'verified',
      kyc_verified_date: '2026-05-01',
      consent_given: 1,
      consent_timestamp: '2026-10-08T08:00:00Z',
      consent_version: 'v2.1-2026',
      salary_monthly_gross: 180000,
      salary_net_deposit: 145000,
      salary_history_json: JSON.stringify([145000, 145000, 145000, 145000, 145000, 145000]),
      existing_monthly_debt: 18000,
      credit_history_json: JSON.stringify({
        hasEstablishedHistory: true,
        overdueBalance: 0,
        maxDaysLate12m: 0,
        creditBureauScore: 810
      }),
      blacklist_status: 'clean'
    },
    {
      id: 'USR-CUST-005',
      full_name: 'Rohan Shrestha',
      masked_account: 'ACC-****-9104',
      citizen_number: '27-01-73-44120',
      date_of_birth: '1991-09-12',
      age: 35,
      address: 'Kumaripati, Lalitpur, Nepal',
      phone: '+977-9849998877',
      email: 'rohan.shrestha@example.com',
      kyc_status: 'verified',
      kyc_verified_date: '2026-02-20',
      consent_given: 1,
      consent_timestamp: '2026-10-08T09:00:00Z',
      consent_version: 'v2.1-2026',
      salary_monthly_gross: 210000,
      salary_net_deposit: 170000,
      salary_history_json: JSON.stringify([170000, 170000, 170000, 170000, 170000, 170000]),
      existing_monthly_debt: 30000,
      credit_history_json: JSON.stringify({
        hasEstablishedHistory: true,
        overdueBalance: 0,
        maxDaysLate12m: 0,
        creditBureauScore: 760
      }),
      blacklist_status: 'clean'
    }
  ]

  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, full_name, masked_account, citizen_number, date_of_birth, age, address, phone, email, kyc_status, kyc_verified_date, consent_given, consent_timestamp, consent_version, salary_monthly_gross, salary_net_deposit, salary_history_json, existing_monthly_debt, credit_history_json, blacklist_status)
    VALUES (@id, @full_name, @masked_account, @citizen_number, @date_of_birth, @age, @address, @phone, @email, @kyc_status, @kyc_verified_date, @consent_given, @consent_timestamp, @consent_version, @salary_monthly_gross, @salary_net_deposit, @salary_history_json, @existing_monthly_debt, @credit_history_json, @blacklist_status)
  `)

  customers.forEach((c) => insertCustomer.run(c))

  // Dealers
  const dealers = [
    { id: 'DLR-001', name: 'Kathmandu Motors Pvt. Ltd.', code: 'KM-THAPATHALI', contact_person: 'Ramesh Bajracharya', email: 'sales@kathmandumotors.com.np', phone: '+977-1-4245678', address: 'Thapathali Auto Corridor, Kathmandu', active: 1 },
    { id: 'DLR-002', name: 'Himalayan Autoworks Nepal', code: 'HA-TEKU', contact_person: 'Anjali Basnet', email: 'info@himalayanauto.com.np', phone: '+977-1-4231122', address: 'Teku Road, Kathmandu', active: 1 },
    { id: 'DLR-003', name: 'Pokhara Drive Ventures', code: 'PDV-POKHARA', contact_person: 'Subash Gurung', email: 'subash@pokharadrive.com.np', phone: '+977-61-532100', address: 'Nayabazar, Pokhara', active: 1 }
  ]
  const insertDealer = db.prepare(`
    INSERT INTO dealers (id, name, code, contact_person, email, phone, address, active)
    VALUES (@id, @name, @code, @contact_person, @email, @phone, @address, @active)
  `)
  dealers.forEach((d) => insertDealer.run(d))

  // Vehicles
  const vehicles = [
    { id: 'VEH-001', make: 'Hyundai', model: 'Creta', variant: 'EX 1.5 Petrol MT', category: 'Private', eligible_value: 4000000, active: 1, effective_date: '2026-01-01' },
    { id: 'VEH-002', make: 'Kia', model: 'Seltos', variant: 'HTK Plus 1.5 Petrol', category: 'Private', eligible_value: 4500000, active: 1, effective_date: '2026-01-01' },
    { id: 'VEH-003', make: 'Suzuki', model: 'Grand Vitara', variant: 'Zeta Mild Hybrid 1.5', category: 'Private', eligible_value: 4800000, active: 1, effective_date: '2026-01-01' },
    { id: 'VEH-004', make: 'Tata', model: 'Nexon EV', variant: 'Empowered Plus LR', category: 'Private', eligible_value: 4300000, active: 1, effective_date: '2026-01-01' },
    { id: 'VEH-005', make: 'BYD', model: 'Atto 3', variant: 'Superior 60.48 kWh', category: 'Private', eligible_value: 5600000, active: 1, effective_date: '2026-01-01' },
    { id: 'VEH-006', make: 'Toyota', model: 'Urban Cruiser Hyryder', variant: 'G Hybrid e-Drive', category: 'Private', eligible_value: 5200000, active: 1, effective_date: '2026-01-01' }
  ]
  const insertVeh = db.prepare(`
    INSERT INTO vehicles (id, make, model, variant, category, eligible_value, active, effective_date)
    VALUES (@id, @make, @model, @variant, @category, @eligible_value, @active, @effective_date)
  `)
  vehicles.forEach((v) => insertVeh.run(v))

  // Quotations
  const quotations = [
    { id: 'QUO-2026-101', dealer_id: 'DLR-001', dealer_name: 'Kathmandu Motors Pvt. Ltd.', vehicle_id: 'VEH-001', make: 'Hyundai', model: 'Creta', variant: 'EX 1.5 Petrol MT', eligible_price: 4000000, quotation_date: '2026-10-01', expiry_date: '2026-11-30', status: 'active', confirmed_by_customer_id: null },
    { id: 'QUO-2026-102', dealer_id: 'DLR-001', dealer_name: 'Kathmandu Motors Pvt. Ltd.', vehicle_id: 'VEH-002', make: 'Kia', model: 'Seltos', variant: 'HTK Plus 1.5 Petrol', eligible_price: 4500000, quotation_date: '2026-10-02', expiry_date: '2026-11-30', status: 'active', confirmed_by_customer_id: null },
    { id: 'QUO-2026-103', dealer_id: 'DLR-002', dealer_name: 'Himalayan Autoworks Nepal', vehicle_id: 'VEH-004', make: 'Tata', model: 'Nexon EV', variant: 'Empowered Plus LR', eligible_price: 4300000, quotation_date: '2026-10-03', expiry_date: '2026-11-30', status: 'active', confirmed_by_customer_id: null },
    { id: 'QUO-2026-104', dealer_id: 'DLR-003', dealer_name: 'Pokhara Drive Ventures', vehicle_id: 'VEH-005', make: 'BYD', model: 'Atto 3', variant: 'Superior 60.48 kWh', eligible_price: 5600000, quotation_date: '2026-10-04', expiry_date: '2026-11-30', status: 'active', confirmed_by_customer_id: null },
    { id: 'QUO-2026-105', dealer_id: 'DLR-001', dealer_name: 'Kathmandu Motors Pvt. Ltd.', vehicle_id: 'VEH-003', make: 'Suzuki', model: 'Grand Vitara', variant: 'Zeta Mild Hybrid 1.5', eligible_price: 4800000, quotation_date: '2026-08-01', expiry_date: '2026-08-31', status: 'expired', confirmed_by_customer_id: null }
  ]
  const insertQuo = db.prepare(`
    INSERT INTO quotations (id, dealer_id, dealer_name, vehicle_id, make, model, variant, eligible_price, quotation_date, expiry_date, status, confirmed_by_customer_id)
    VALUES (@id, @dealer_id, @dealer_name, @vehicle_id, @make, @model, @variant, @eligible_price, @quotation_date, @expiry_date, @status, @confirmed_by_customer_id)
  `)
  quotations.forEach((q) => insertQuo.run(q))

  // Active Policy
  db.prepare(`
    INSERT INTO policies (id, version, min_age, max_age_final_instalment, min_term_months, max_term_months, max_automated_ltv_percent, max_automated_dsr_percent, max_automated_loan_amount, approved_annual_interest_rate, approval_validity_days, effective_date, proposed_changes_json)
    VALUES ('POL-2026-01', 'v1.4-PROPOSED-DEMO', 21, 65, 12, 84, 60.0, 50.0, 2500000, 10.0, 30, '2026-01-01', NULL)
  `).run()

  // Policy Versions
  const pVersions = [
    {
      id: 'PV-001',
      version: 'v1.3-BASELINE',
      proposer_name: 'Nikita Shrestha (Admin)',
      approver_name: 'Sanjay Shrestha (Risk Head)',
      approved_date: '2025-12-15T14:30:00Z',
      justification: 'Year-end retail auto credit baseline calibration.',
      policy_snapshot_json: JSON.stringify({ version: 'v1.3-BASELINE', max_automated_ltv_percent: 55.0 })
    },
    {
      id: 'PV-002',
      version: 'v1.4-PROPOSED-DEMO',
      proposer_name: 'Nikita Shrestha (Admin)',
      approver_name: 'Sanjay Shrestha (Compliance Officer)',
      approved_date: '2026-01-01T09:00:00Z',
      justification: 'Aligned with NRB retail lending guidelines and proposed auto loan policy.',
      policy_snapshot_json: JSON.stringify({ version: 'v1.4-PROPOSED-DEMO', max_automated_ltv_percent: 60.0 })
    }
  ]
  const insertPv = db.prepare(`
    INSERT INTO policy_versions (id, version, proposer_name, approver_name, approved_date, justification, policy_snapshot_json)
    VALUES (@id, @version, @proposer_name, @approver_name, @approved_date, @justification, @policy_snapshot_json)
  `)
  pVersions.forEach((pv) => insertPv.run(pv))
}

// Reset data in SQLite:
// Wipes all applications, audit logs, notifications, and restores clean master records with ZERO pre-seeded applications.
function resetDb() {
  db.exec(`
    DELETE FROM applications;
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    UPDATE policies SET proposed_changes_json = NULL WHERE id = 'POL-2026-01';
  `)
  // Reset Sunita's KYC to outdated as default for testing
  db.prepare(`UPDATE customers SET kyc_status = 'outdated' WHERE id = 'USR-CUST-002'`).run()
}

// Helper: Remove previous loan processing for a client
function removePreviousLoanProcessing(customerId) {
  const deleted = db.prepare('DELETE FROM applications WHERE customer_id = ?').run(customerId)
  return deleted.changes
}

// Process a single loan application through the credit decision engine and save to SQLite
function processLoanApplication(params) {
  const {
    customerId,
    quotationId,
    requestedLoanAmount,
    termMonths,
    complianceFlagsPresent = false,
    ocrMismatch = false,
    bureauAvailable = true,
    overrideRules
  } = params

  const custRow = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId)
  if (!custRow) throw new Error('Customer not found')

  const cust = {
    id: custRow.id,
    fullName: custRow.full_name,
    maskedAccount: custRow.masked_account,
    citizenNumber: custRow.citizen_number,
    dateOfBirth: custRow.date_of_birth,
    age: custRow.age,
    kycStatus: custRow.kyc_status,
    kycVerifiedDate: custRow.kyc_verified_date,
    consentGiven: custRow.consent_given === 1,
    consentTimestamp: custRow.consent_timestamp,
    consentVersion: custRow.consent_version,
    salaryMonthlyGross: custRow.salary_monthly_gross,
    salaryNetDeposit: custRow.salary_net_deposit,
    salaryHistoryMonths: JSON.parse(custRow.salary_history_json),
    existingMonthlyDebt: custRow.existing_monthly_debt,
    creditHistorySummary: JSON.parse(custRow.credit_history_json),
    blacklistStatus: custRow.blacklist_status
  }

  const quoRow = db.prepare('SELECT * FROM quotations WHERE id = ?').get(quotationId)
  if (!quoRow) throw new Error('Quotation not found')

  const quo = {
    id: quoRow.id,
    dealerId: quoRow.dealer_id,
    dealerName: quoRow.dealer_name,
    vehicleId: quoRow.vehicle_id,
    make: quoRow.make,
    model: quoRow.model,
    variant: quoRow.variant,
    eligiblePrice: quoRow.eligible_price,
    quotationDate: quoRow.quotation_date,
    expiryDate: quoRow.expiry_date,
    status: quoRow.status
  }

  const polRow = db.prepare('SELECT * FROM policies LIMIT 1').get()
  const policy = {
    id: polRow.id,
    version: polRow.version,
    minAge: polRow.min_age,
    maxAgeFinalInstalment: polRow.max_age_final_instalment,
    minTermMonths: polRow.min_term_months,
    maxTermMonths: polRow.max_term_months,
    maxAutomatedLtvPercent: polRow.max_automated_ltv_percent,
    maxAutomatedDsrPercent: polRow.max_automated_dsr_percent,
    maxAutomatedLoanAmount: polRow.max_automated_loan_amount,
    approvedAnnualInterestRate: polRow.approved_annual_interest_rate,
    approvalValidityDays: polRow.approval_validity_days
  }

  // 1. Remove previous loan processing for this client!
  removePreviousLoanProcessing(cust.id)

  // 2. Dynamically evaluate 10-rule credit engine!
  const evalResult = evaluateCreditApplication({
    customer: cust,
    quotation: quo,
    requestedLoanAmount,
    termMonths,
    policy,
    bureauAvailable,
    complianceFlagsPresent,
    ocrMismatch,
    overrideRules
  })

  const appId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const nowIso = new Date().toISOString()

  const docRequests = []
  if (cust.kycStatus === 'outdated') {
    docRequests.push({
      id: `REQ-${Date.now()}-1`,
      documentName: 'Updated KYC & Address Verification Form',
      requestedBy: 'Credit Operations Desk',
      requestDate: nowIso,
      reason: 'Existing KYC verification has expired under regulatory guidelines.',
      resolved: false
    })
  }

  const newApp = {
    id: appId,
    customerId: cust.id,
    customerName: cust.fullName,
    maskedAccount: cust.maskedAccount,
    quotationId: quo.id,
    quotation: {
      vehicleId: quo.vehicleId,
      make: quo.make,
      model: quo.model,
      variant: quo.variant,
      vehiclePrice: quo.eligiblePrice,
      dealerName: quo.dealerName,
      dealerId: quo.dealerId,
      expiryDate: quo.expiryDate
    },
    requestedLoanAmount,
    approvedLoanAmount: evalResult.status === 'approved_in_principle' ? requestedLoanAmount : null,
    loanTermMonths: termMonths,
    interestRateAnnual: policy.approvedAnnualInterestRate,
    emiMonthly: evalResult.calculatedEmi,
    downPayment: evalResult.downPayment,
    ltvPercent: evalResult.calculatedLtv,
    debtServiceRatioPercent: evalResult.calculatedDsr,
    verifiedMonthlyGrossIncome: cust.salaryMonthlyGross,
    existingMonthlyDebt: cust.existingMonthlyDebt,
    status: evalResult.status,
    stage: evalResult.stage,
    decisionReason: evalResult.decisionReason,
    decisionDate: evalResult.status === 'approved_in_principle' || evalResult.status === 'declined' ? nowIso : null,
    approvalExpiryDate: evalResult.approvalExpiryDate || null,
    approvalConditions: evalResult.conditions,
    bureauStatus: !bureauAvailable ? 'outage' : 'available',
    bureauRetryCount: !bureauAvailable ? 1 : 0,
    assignedOfficerId: evalResult.status === 'referred' ? 'USR-OFFICER-001' : null,
    assignedOfficerName: evalResult.status === 'referred' ? 'Bikram Thapa' : null,
    documents: [
      { id: `DOC-${Date.now()}-1`, name: 'Citizenship Certificate', type: 'citizenship_copy', status: 'verified', uploadDate: nowIso },
      { id: `DOC-${Date.now()}-2`, name: 'Salary Account Credits Record', type: 'salary_slip', status: ocrMismatch ? 'ocr_mismatch' : 'verified', uploadDate: nowIso, extractedIncome: cust.salaryMonthlyGross }
    ],
    documentRequests: docRequests,
    officerNotes: [],
    ruleResults: evalResult.ruleResults,
    timeline: [
      {
        timestamp: nowIso,
        actor: cust.fullName,
        role: 'Customer',
        action: 'Consent Recorded',
        details: `Digital consent recorded under ${cust.consentVersion || 'v2.1-2026'}.`
      },
      {
        timestamp: nowIso,
        actor: cust.fullName,
        role: 'Customer',
        action: 'Application Submitted',
        details: `Submitted loan request for Rs. ${requestedLoanAmount.toLocaleString('en-IN')}.`
      },
      {
        timestamp: nowIso,
        actor: 'Automated Decision Engine',
        role: 'System',
        action: evalResult.status === 'approved_in_principle'
          ? 'In-Principle Approved'
          : evalResult.status === 'declined'
          ? 'Declined'
          : evalResult.status === 'pending'
          ? 'Pending Bureau Retry'
          : 'Referred to Review Queue',
        details: evalResult.decisionReason
      }
    ],
    version: 1,
    previousVersions: [],
    createdAt: nowIso,
    updatedAt: nowIso
  }

  // Insert into SQLite
  db.prepare(`
    INSERT INTO applications (
      id, customer_id, customer_name, masked_account, quotation_id, quotation_json,
      requested_loan_amount, approved_loan_amount, loan_term_months, interest_rate_annual,
      emi_monthly, down_payment, ltv_percent, debt_service_ratio_percent,
      verified_monthly_gross_income, existing_monthly_debt, status, stage,
      decision_reason, decision_date, approval_expiry_date, approval_conditions_json,
      bureau_status, bureau_retry_count, assigned_officer_id, assigned_officer_name,
      documents_json, document_requests_json, officer_notes_json, rule_results_json,
      timeline_json, version, previous_versions_json, created_at, updated_at
    ) VALUES (
      @id, @customerId, @customerName, @maskedAccount, @quotationId, @quotationJson,
      @requestedLoanAmount, @approvedLoanAmount, @loanTermMonths, @interestRateAnnual,
      @emiMonthly, @downPayment, @ltvPercent, @debtServiceRatioPercent,
      @verifiedMonthlyGrossIncome, @existingMonthlyDebt, @status, @stage,
      @decisionReason, @decisionDate, @approvalExpiryDate, @approvalConditionsJson,
      @bureauStatus, @bureauRetryCount, @assignedOfficerId, @assignedOfficerName,
      @documentsJson, @documentRequestsJson, @officerNotesJson, @ruleResultsJson,
      @timelineJson, @version, @previousVersionsJson, @createdAt, @updatedAt
    )
  `).run({
    id: newApp.id,
    customerId: newApp.customerId,
    customerName: newApp.customerName,
    maskedAccount: newApp.maskedAccount,
    quotationId: newApp.quotationId,
    quotationJson: JSON.stringify(newApp.quotation),
    requestedLoanAmount: newApp.requestedLoanAmount,
    approvedLoanAmount: newApp.approvedLoanAmount,
    loanTermMonths: newApp.loanTermMonths,
    interestRateAnnual: newApp.interestRateAnnual,
    emiMonthly: newApp.emiMonthly,
    downPayment: newApp.downPayment,
    ltvPercent: newApp.ltvPercent,
    debtServiceRatioPercent: newApp.debtServiceRatioPercent,
    verifiedMonthlyGrossIncome: newApp.verifiedMonthlyGrossIncome,
    existingMonthlyDebt: newApp.existingMonthlyDebt,
    status: newApp.status,
    stage: newApp.stage,
    decisionReason: newApp.decisionReason,
    decisionDate: newApp.decisionDate,
    approvalExpiryDate: newApp.approvalExpiryDate,
    approvalConditionsJson: JSON.stringify(newApp.approvalConditions),
    bureauStatus: newApp.bureauStatus,
    bureauRetryCount: newApp.bureauRetryCount,
    assignedOfficerId: newApp.assignedOfficerId,
    assignedOfficerName: newApp.assignedOfficerName,
    documentsJson: JSON.stringify(newApp.documents),
    documentRequestsJson: JSON.stringify(newApp.documentRequests),
    officerNotesJson: JSON.stringify(newApp.officerNotes),
    ruleResultsJson: JSON.stringify(newApp.ruleResults),
    timelineJson: JSON.stringify(newApp.timeline),
    version: newApp.version,
    previousVersionsJson: JSON.stringify(newApp.previousVersions),
    createdAt: newApp.createdAt,
    updatedAt: newApp.updatedAt
  })

  // Add audit log
  addAuditLog({
    actorName: cust.fullName,
    actorRole: 'Customer',
    action: 'SUBMIT_LOAN_APPLICATION',
    applicationId: newApp.id,
    details: `Application ${newApp.id} submitted for Rs. ${requestedLoanAmount.toLocaleString('en-IN')}. Engine outcome: ${evalResult.status.toUpperCase()}.`
  })

  return newApp
}

// Process multiple demo customer loan applications through the credit engine dynamically!
function processMultipleDemoApplications() {
  const results = []

  // Customer 1: Aarav Sharma -> NPR 2,400,000 on Hyundai Creta (60% LTV) -> Approved In-Principle
  results.push(processLoanApplication({
    customerId: 'USR-CUST-001',
    quotationId: 'QUO-2026-101',
    requestedLoanAmount: 2400000,
    termMonths: 84
  }))

  // Customer 2: Sunita KC -> NPR 2,200,000 on Tata Nexon EV -> Referred (outdated KYC)
  results.push(processLoanApplication({
    customerId: 'USR-CUST-002',
    quotationId: 'QUO-2026-103',
    requestedLoanAmount: 2200000,
    termMonths: 60
  }))

  // Customer 3: Deepak Adhikari -> NPR 2,000,000 on Kia Seltos -> Automatic Decline (CIB blacklist match)
  results.push(processLoanApplication({
    customerId: 'USR-CUST-003',
    quotationId: 'QUO-2026-102',
    requestedLoanAmount: 2000000,
    termMonths: 60
  }))

  // Customer 4: Pooja Bhattarai -> NPR 2,800,000 on Suzuki Grand Vitara -> Referred for Senior Approver Review (exceeds NPR 2.5M authority)
  results.push(processLoanApplication({
    customerId: 'USR-CUST-004',
    quotationId: 'QUO-2026-104',
    requestedLoanAmount: 2800000,
    termMonths: 72
  }))

  return results
}

function addAuditLog(entry) {
  const id = `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const timestamp = new Date().toISOString()
  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, actor_name, actor_role, action, application_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, timestamp, entry.actorName, entry.actorRole, entry.action, entry.applicationId || null, entry.details)
  return { id, timestamp, ...entry }
}

function getApplications() {
  const rows = db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all()
  return rows.map((r) => ({
    id: r.id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    maskedAccount: r.masked_account,
    quotationId: r.quotation_id,
    quotation: JSON.parse(r.quotation_json),
    requestedLoanAmount: r.requested_loan_amount,
    approvedLoanAmount: r.approved_loan_amount,
    loanTermMonths: r.loan_term_months,
    interestRateAnnual: r.interest_rate_annual,
    emiMonthly: r.emi_monthly,
    downPayment: r.down_payment,
    ltvPercent: r.ltv_percent,
    debtServiceRatioPercent: r.debt_service_ratio_percent,
    verifiedMonthlyGrossIncome: r.verified_monthly_gross_income,
    existingMonthlyDebt: r.existing_monthly_debt,
    status: r.status,
    stage: r.stage,
    decisionReason: r.decision_reason,
    decisionDate: r.decision_date,
    approvalExpiryDate: r.approval_expiry_date,
    approvalConditions: JSON.parse(r.approval_conditions_json || '[]'),
    bureauStatus: r.bureau_status,
    bureauRetryCount: r.bureau_retry_count,
    assignedOfficerId: r.assigned_officer_id,
    assignedOfficerName: r.assigned_officer_name,
    documents: JSON.parse(r.documents_json),
    documentRequests: JSON.parse(r.document_requests_json),
    officerNotes: JSON.parse(r.officer_notes_json),
    ruleResults: JSON.parse(r.rule_results_json),
    timeline: JSON.parse(r.timeline_json),
    version: r.version,
    previousVersions: JSON.parse(r.previous_versions_json || '[]'),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }))
}

function updateApplication(app) {
  db.prepare(`
    UPDATE applications SET
      status = @status,
      stage = @stage,
      approved_loan_amount = @approvedLoanAmount,
      requested_loan_amount = @requestedLoanAmount,
      loan_term_months = @loanTermMonths,
      emi_monthly = @emiMonthly,
      ltv_percent = @ltvPercent,
      debt_service_ratio_percent = @debtServiceRatioPercent,
      decision_reason = @decisionReason,
      decision_date = @decisionDate,
      approval_expiry_date = @approvalExpiryDate,
      bureau_status = @bureauStatus,
      bureau_retry_count = @bureauRetryCount,
      assigned_officer_id = @assignedOfficerId,
      assigned_officer_name = @assignedOfficerName,
      documents_json = @documentsJson,
      document_requests_json = @documentRequestsJson,
      officer_notes_json = @officerNotesJson,
      rule_results_json = @ruleResultsJson,
      timeline_json = @timelineJson,
      version = @version,
      previous_versions_json = @previousVersionsJson,
      updated_at = @updatedAt
    WHERE id = @id
  `).run({
    id: app.id,
    status: app.status,
    stage: app.stage,
    approvedLoanAmount: app.approvedLoanAmount || null,
    requestedLoanAmount: app.requestedLoanAmount,
    loanTermMonths: app.loanTermMonths,
    emiMonthly: app.emiMonthly,
    ltvPercent: app.ltvPercent,
    debtServiceRatioPercent: app.debtServiceRatioPercent,
    decisionReason: app.decisionReason || null,
    decisionDate: app.decisionDate || null,
    approvalExpiryDate: app.approvalExpiryDate || null,
    bureauStatus: app.bureauStatus,
    bureauRetryCount: app.bureauRetryCount,
    assignedOfficerId: app.assignedOfficerId || null,
    assignedOfficerName: app.assignedOfficerName || null,
    documentsJson: JSON.stringify(app.documents),
    documentRequestsJson: JSON.stringify(app.documentRequests),
    officerNotesJson: JSON.stringify(app.officerNotes),
    ruleResultsJson: JSON.stringify(app.ruleResults),
    timelineJson: JSON.stringify(app.timeline),
    version: app.version,
    previousVersionsJson: JSON.stringify(app.previousVersions || []),
    updatedAt: new Date().toISOString()
  })
}

function getCustomers() {
  const rows = db.prepare('SELECT * FROM customers').all()
  const map = {}
  rows.forEach((r) => {
    map[r.id] = {
      id: r.id,
      fullName: r.full_name,
      maskedAccount: r.masked_account,
      citizenNumber: r.citizen_number,
      dateOfBirth: r.date_of_birth,
      age: r.age,
      address: r.address,
      phone: r.phone,
      email: r.email,
      kycStatus: r.kyc_status,
      kycVerifiedDate: r.kyc_verified_date,
      consentGiven: r.consent_given === 1,
      consentTimestamp: r.consent_timestamp,
      consentVersion: r.consent_version,
      salaryMonthlyGross: r.salary_monthly_gross,
      salaryNetDeposit: r.salary_net_deposit,
      salaryHistoryMonths: JSON.parse(r.salary_history_json),
      existingMonthlyDebt: r.existing_monthly_debt,
      creditHistorySummary: JSON.parse(r.credit_history_json),
      blacklistStatus: r.blacklist_status
    }
  })
  return map
}

function updateCustomerKyc(id, status, date) {
  db.prepare(`UPDATE customers SET kyc_status = ?, kyc_verified_date = ? WHERE id = ?`).run(status, date, id)
}

function getDealers() {
  const rows = db.prepare('SELECT * FROM dealers').all()
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    contactPerson: r.contact_person,
    email: r.email,
    phone: r.phone,
    address: r.address,
    active: r.active === 1
  }))
}

function addDealer(d) {
  const id = `DLR-${Math.floor(100 + Math.random() * 900)}`
  db.prepare(`
    INSERT INTO dealers (id, name, code, contact_person, email, phone, address, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, d.name, d.code, d.contactPerson, d.email, d.phone, d.address)
  return { id, ...d, active: true }
}

function toggleDealer(id) {
  db.prepare(`UPDATE dealers SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(id)
}

function getVehicles() {
  const rows = db.prepare('SELECT * FROM vehicles').all()
  return rows.map((r) => ({
    id: r.id,
    make: r.make,
    model: r.model,
    variant: r.variant,
    category: r.category,
    eligibleValue: r.eligible_value,
    active: r.active === 1,
    effectiveDate: r.effective_date
  }))
}

function addVehicle(v) {
  const id = `VEH-${Math.floor(100 + Math.random() * 900)}`
  db.prepare(`
    INSERT INTO vehicles (id, make, model, variant, category, eligible_value, active, effective_date)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).run(id, v.make, v.model, v.variant, v.category || 'Private', v.eligibleValue, v.effectiveDate || new Date().toISOString().split('T')[0])
  return { id, ...v, active: true }
}

function toggleVehicle(id) {
  db.prepare(`UPDATE vehicles SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(id)
}

function getQuotations() {
  const rows = db.prepare('SELECT * FROM quotations').all()
  return rows.map((r) => ({
    id: r.id,
    dealerId: r.dealer_id,
    dealerName: r.dealer_name,
    vehicleId: r.vehicle_id,
    make: r.make,
    model: r.model,
    variant: r.variant,
    eligiblePrice: r.eligible_price,
    quotationDate: r.quotation_date,
    expiryDate: r.expiry_date,
    status: r.status,
    confirmedByCustomerId: r.confirmed_by_customer_id
  }))
}

function addQuotation(q) {
  const id = `QUO-2026-${Math.floor(100 + Math.random() * 900)}`
  db.prepare(`
    INSERT INTO quotations (id, dealer_id, dealer_name, vehicle_id, make, model, variant, eligible_price, quotation_date, expiry_date, status, confirmed_by_customer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL)
  `).run(id, q.dealerId, q.dealerName, q.vehicleId, q.make, q.model, q.variant, q.eligiblePrice, q.quotationDate, q.expiryDate)
  return { id, ...q, status: 'active' }
}

function getPolicy() {
  const r = db.prepare('SELECT * FROM policies LIMIT 1').get()
  return {
    id: r.id,
    version: r.version,
    minAge: r.min_age,
    maxAgeFinalInstalment: r.max_age_final_instalment,
    minTermMonths: r.min_term_months,
    maxTermMonths: r.max_term_months,
    maxAutomatedLtvPercent: r.max_automated_ltv_percent,
    maxAutomatedDsrPercent: r.max_automated_dsr_percent,
    maxAutomatedLoanAmount: r.max_automated_loan_amount,
    approvedAnnualInterestRate: r.approved_annual_interest_rate,
    approvalValidityDays: r.approval_validity_days,
    effectiveDate: r.effective_date,
    proposedChanges: r.proposed_changes_json ? JSON.parse(r.proposed_changes_json) : undefined
  }
}

function savePolicy(p) {
  db.prepare(`
    UPDATE policies SET
      version = @version,
      min_age = @minAge,
      max_age_final_instalment = @maxAgeFinalInstalment,
      min_term_months = @minTermMonths,
      max_term_months = @maxTermMonths,
      max_automated_ltv_percent = @maxAutomatedLtvPercent,
      max_automated_dsr_percent = @maxAutomatedDsrPercent,
      max_automated_loan_amount = @maxAutomatedLoanAmount,
      approved_annual_interest_rate = @approvedAnnualInterestRate,
      approval_validity_days = @approvalValidityDays,
      effective_date = @effectiveDate,
      proposed_changes_json = @proposedChangesJson
    WHERE id = @id
  `).run({
    id: p.id,
    version: p.version,
    minAge: p.minAge,
    maxAgeFinalInstalment: p.maxAgeFinalInstalment,
    minTermMonths: p.minTermMonths,
    maxTermMonths: p.maxTermMonths,
    maxAutomatedLtvPercent: p.maxAutomatedLtvPercent,
    maxAutomatedDsrPercent: p.maxAutomatedDsrPercent,
    maxAutomatedLoanAmount: p.maxAutomatedLoanAmount,
    approvedAnnualInterestRate: p.approvedAnnualInterestRate,
    approvalValidityDays: p.approvalValidityDays,
    effectiveDate: p.effectiveDate,
    proposedChangesJson: p.proposedChanges ? JSON.stringify(p.proposedChanges) : null
  })
}

function getPolicyVersions() {
  const rows = db.prepare('SELECT * FROM policy_versions ORDER BY approved_date DESC').all()
  return rows.map((r) => ({
    id: r.id,
    version: r.version,
    proposerName: r.proposer_name,
    approverName: r.approver_name,
    approvedDate: r.approved_date,
    justification: r.justification,
    policySnapshot: JSON.parse(r.policy_snapshot_json)
  }))
}

function addPolicyVersion(pv) {
  const id = `PV-${Date.now()}`
  db.prepare(`
    INSERT INTO policy_versions (id, version, proposer_name, approver_name, approved_date, justification, policy_snapshot_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, pv.version, pv.proposerName, pv.approverName, pv.approvedDate, pv.justification, JSON.stringify(pv.policySnapshot))
}

function getAuditLogs() {
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all().map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    actorName: r.actor_name,
    actorRole: r.actor_role,
    action: r.action,
    applicationId: r.application_id,
    details: r.details
  }))
}

function getNotifications() {
  return db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all().map((r) => ({
    id: r.id,
    recipientRole: r.recipient_role,
    recipientCustomerId: r.recipient_customer_id,
    recipientDealerId: r.recipient_dealer_id,
    title: r.title,
    message: r.message,
    timestamp: r.timestamp,
    read: r.read === 1,
    applicationId: r.application_id
  }))
}

function addNotification(n) {
  const id = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const timestamp = new Date().toISOString()
  db.prepare(`
    INSERT INTO notifications (id, recipient_role, recipient_customer_id, recipient_dealer_id, title, message, timestamp, read, application_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, n.recipientRole, n.recipientCustomerId || null, n.recipientDealerId || null, n.title, n.message, timestamp, n.applicationId || null)
}

function markNotificationRead(id) {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id)
}

module.exports = {
  db,
  initDb,
  resetDb,
  removePreviousLoanProcessing,
  processLoanApplication,
  processMultipleDemoApplications,
  getApplications,
  updateApplication,
  getCustomers,
  updateCustomerKyc,
  getDealers,
  addDealer,
  toggleDealer,
  getVehicles,
  addVehicle,
  toggleVehicle,
  getQuotations,
  addQuotation,
  getPolicy,
  savePolicy,
  getPolicyVersions,
  addPolicyVersion,
  getAuditLogs,
  addAuditLog,
  getNotifications,
  addNotification,
  markNotificationRead
}
