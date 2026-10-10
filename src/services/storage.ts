import {
  User,
  Vehicle,
  Dealer,
  Quotation,
  CustomerProfile,
  Application,
  CreditPolicy,
  PolicyVersionRecord,
  AuditLog,
  AppNotification
} from '../types'
import { evaluateCreditApplication } from './creditEngine'

const STORAGE_KEYS = {
  USERS: 'loan_rangers_users_v2',
  CURRENT_USER: 'loan_rangers_current_user_v2',
  VEHICLES: 'loan_rangers_vehicles_v2',
  DEALERS: 'loan_rangers_dealers_v2',
  QUOTATIONS: 'loan_rangers_quotations_v2',
  CUSTOMERS: 'loan_rangers_customers_v2',
  APPLICATIONS: 'loan_rangers_applications_v2',
  POLICY: 'loan_rangers_policy_v2',
  POLICY_VERSIONS: 'loan_rangers_policy_versions_v2',
  AUDIT_LOGS: 'loan_rangers_audit_logs_v2',
  NOTIFICATIONS: 'loan_rangers_notifications_v2',
  INITIALIZED: 'loan_rangers_initialized_v2'
}

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-CUST-001',
    name: 'Aarav Sharma',
    role: 'customer',
    email: 'aarav.sharma@example.com',
    maskedAccount: 'ACC-****-4921'
  },
  {
    id: 'USR-CUST-002',
    name: 'Sunita KC',
    role: 'customer',
    email: 'sunita.kc@example.com',
    maskedAccount: 'ACC-****-7814'
  },
  {
    id: 'USR-CUST-003',
    name: 'Deepak Adhikari',
    role: 'customer',
    email: 'deepak.adhikari@example.com',
    maskedAccount: 'ACC-****-3312'
  },
  {
    id: 'USR-CUST-004',
    name: 'Pooja Bhattarai',
    role: 'customer',
    email: 'pooja.bhattarai@example.com',
    maskedAccount: 'ACC-****-5520'
  },
  {
    id: 'USR-CUST-005',
    name: 'Rohan Shrestha',
    role: 'customer',
    email: 'rohan.shrestha@example.com',
    maskedAccount: 'ACC-****-9104'
  },
  {
    id: 'USR-OFFICER-001',
    name: 'Bikram Thapa',
    role: 'officer',
    email: 'bikram.thapa@loanrangers.bank.np',
    officerLevel: 'standard',
    officerAuthorityLimit: 2500000
  },
  {
    id: 'USR-OFFICER-002',
    name: 'Pooja Karki',
    role: 'officer',
    email: 'pooja.karki@loanrangers.bank.np',
    officerLevel: 'senior',
    officerAuthorityLimit: 5000000
  },
  {
    id: 'USR-ADMIN-001',
    name: 'Nikita Shrestha',
    role: 'admin',
    email: 'nikita.shrestha@loanrangers.bank.np'
  },
  {
    id: 'USR-ADMIN-002',
    name: 'Sanjay Shrestha',
    role: 'admin',
    email: 'sanjay.shrestha@loanrangers.bank.np'
  },
  {
    id: 'USR-DEALER-001',
    name: 'Ramesh Bajracharya',
    role: 'dealer',
    email: 'dealer@kathmandumotors.com.np',
    dealerId: 'DLR-001'
  }
]

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-001',
    make: 'Hyundai',
    model: 'Creta',
    variant: 'EX 1.5 Petrol MT',
    category: 'Private',
    eligibleValue: 4000000,
    active: true,
    effectiveDate: '2026-01-01'
  },
  {
    id: 'VEH-002',
    make: 'Kia',
    model: 'Seltos',
    variant: 'HTK Plus 1.5 Petrol',
    category: 'Private',
    eligibleValue: 4500000,
    active: true,
    effectiveDate: '2026-01-01'
  },
  {
    id: 'VEH-003',
    make: 'Suzuki',
    model: 'Grand Vitara',
    variant: 'Zeta Mild Hybrid 1.5',
    category: 'Private',
    eligibleValue: 4800000,
    active: true,
    effectiveDate: '2026-01-01'
  },
  {
    id: 'VEH-004',
    make: 'Tata',
    model: 'Nexon EV',
    variant: 'Empowered Plus LR',
    category: 'Private',
    eligibleValue: 4300000,
    active: true,
    effectiveDate: '2026-01-01'
  },
  {
    id: 'VEH-005',
    make: 'BYD',
    model: 'Atto 3',
    variant: 'Superior 60.48 kWh',
    category: 'Private',
    eligibleValue: 5600000,
    active: true,
    effectiveDate: '2026-01-01'
  },
  {
    id: 'VEH-006',
    make: 'Toyota',
    model: 'Urban Cruiser Hyryder',
    variant: 'G Hybrid e-Drive',
    category: 'Private',
    eligibleValue: 5200000,
    active: true,
    effectiveDate: '2026-01-01'
  }
]

export const INITIAL_DEALERS: Dealer[] = [
  {
    id: 'DLR-001',
    name: 'Kathmandu Motors Pvt. Ltd.',
    code: 'KM-THAPATHALI',
    contactPerson: 'Ramesh Bajracharya',
    email: 'sales@kathmandumotors.com.np',
    phone: '+977-1-4245678',
    address: 'Thapathali Auto Corridor, Kathmandu',
    active: true
  },
  {
    id: 'DLR-002',
    name: 'Himalayan Autoworks Nepal',
    code: 'HA-TEKU',
    contactPerson: 'Anjali Basnet',
    email: 'info@himalayanauto.com.np',
    phone: '+977-1-4231122',
    address: 'Teku Road, Kathmandu',
    active: true
  },
  {
    id: 'DLR-003',
    name: 'Pokhara Drive Ventures',
    code: 'PDV-POKHARA',
    contactPerson: 'Subash Gurung',
    email: 'subash@pokharadrive.com.np',
    phone: '+977-61-532100',
    address: 'Nayabazar, Pokhara',
    active: true
  }
]

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-2026-101',
    dealerId: 'DLR-001',
    dealerName: 'Kathmandu Motors Pvt. Ltd.',
    vehicleId: 'VEH-001',
    make: 'Hyundai',
    model: 'Creta',
    variant: 'EX 1.5 Petrol MT',
    eligiblePrice: 4000000,
    quotationDate: '2026-10-01',
    expiryDate: '2026-11-30',
    status: 'active'
  },
  {
    id: 'QUO-2026-102',
    dealerId: 'DLR-001',
    dealerName: 'Kathmandu Motors Pvt. Ltd.',
    vehicleId: 'VEH-002',
    make: 'Kia',
    model: 'Seltos',
    variant: 'HTK Plus 1.5 Petrol',
    eligiblePrice: 4500000,
    quotationDate: '2026-10-02',
    expiryDate: '2026-11-30',
    status: 'active'
  },
  {
    id: 'QUO-2026-103',
    dealerId: 'DLR-002',
    dealerName: 'Himalayan Autoworks Nepal',
    vehicleId: 'VEH-004',
    make: 'Tata',
    model: 'Nexon EV',
    variant: 'Empowered Plus LR',
    eligiblePrice: 4300000,
    quotationDate: '2026-10-03',
    expiryDate: '2026-11-30',
    status: 'active'
  },
  {
    id: 'QUO-2026-104',
    dealerId: 'DLR-003',
    dealerName: 'Pokhara Drive Ventures',
    vehicleId: 'VEH-005',
    make: 'BYD',
    model: 'Atto 3',
    variant: 'Superior 60.48 kWh',
    eligiblePrice: 5600000,
    quotationDate: '2026-10-04',
    expiryDate: '2026-11-30',
    status: 'active'
  },
  {
    id: 'QUO-2026-105',
    dealerId: 'DLR-001',
    dealerName: 'Kathmandu Motors Pvt. Ltd.',
    vehicleId: 'VEH-003',
    make: 'Suzuki',
    model: 'Grand Vitara',
    variant: 'Zeta Mild Hybrid 1.5',
    eligiblePrice: 4800000,
    quotationDate: '2026-08-01',
    expiryDate: '2026-08-31',
    status: 'expired'
  }
]

export const INITIAL_CUSTOMERS: Record<string, CustomerProfile> = {
  'USR-CUST-001': {
    id: 'USR-CUST-001',
    fullName: 'Aarav Sharma',
    maskedAccount: 'ACC-****-4921',
    citizenNumber: '27-01-78-04921',
    dateOfBirth: '1992-05-14',
    age: 34,
    address: 'Naxal, Kathmandu-1, Nepal',
    phone: '+977-9841234567',
    email: 'aarav.sharma@example.com',
    kycStatus: 'verified',
    kycVerifiedDate: '2026-03-15',
    consentGiven: true,
    consentTimestamp: '2026-10-05T09:12:00Z',
    consentVersion: 'v2.1-2026',
    salaryMonthlyGross: 150000,
    salaryNetDeposit: 122000,
    salaryHistoryMonths: [122000, 122000, 122000, 122000, 122000, 122000],
    existingMonthlyDebt: 20000,
    creditHistorySummary: {
      hasEstablishedHistory: true,
      overdueBalance: 0,
      maxDaysLate12m: 0,
      creditBureauScore: 785
    },
    blacklistStatus: 'clean'
  },
  'USR-CUST-002': {
    id: 'USR-CUST-002',
    fullName: 'Sunita KC',
    maskedAccount: 'ACC-****-7814',
    citizenNumber: '27-02-76-11492',
    dateOfBirth: '1994-08-20',
    age: 32,
    address: 'Jhamsikhel, Lalitpur, Nepal',
    phone: '+977-9851098765',
    email: 'sunita.kc@example.com',
    kycStatus: 'outdated',
    kycVerifiedDate: '2024-01-10',
    consentGiven: true,
    consentTimestamp: '2026-10-06T10:00:00Z',
    consentVersion: 'v2.1-2026',
    salaryMonthlyGross: 130000,
    salaryNetDeposit: 108000,
    salaryHistoryMonths: [108000, 108000, 108000, 108000, 108000, 108000],
    existingMonthlyDebt: 15000,
    creditHistorySummary: {
      hasEstablishedHistory: true,
      overdueBalance: 0,
      maxDaysLate12m: 0,
      creditBureauScore: 740
    },
    blacklistStatus: 'clean'
  },
  'USR-CUST-003': {
    id: 'USR-CUST-003',
    fullName: 'Deepak Adhikari',
    maskedAccount: 'ACC-****-3312',
    citizenNumber: '27-01-69-99412',
    dateOfBirth: '1988-11-03',
    age: 37,
    address: 'Baneshwor, Kathmandu, Nepal',
    phone: '+977-9801239876',
    email: 'deepak.adhikari@example.com',
    kycStatus: 'verified',
    kycVerifiedDate: '2026-04-10',
    consentGiven: true,
    consentTimestamp: '2026-10-07T11:20:00Z',
    consentVersion: 'v2.1-2026',
    salaryMonthlyGross: 160000,
    salaryNetDeposit: 130000,
    salaryHistoryMonths: [130000, 130000, 130000, 130000, 130000, 130000],
    existingMonthlyDebt: 25000,
    creditHistorySummary: {
      hasEstablishedHistory: true,
      overdueBalance: 85000,
      maxDaysLate12m: 90,
      creditBureauScore: 490
    },
    blacklistStatus: 'confirmed_match'
  },
  'USR-CUST-004': {
    id: 'USR-CUST-004',
    fullName: 'Pooja Bhattarai',
    maskedAccount: 'ACC-****-5520',
    citizenNumber: '27-01-79-11029',
    dateOfBirth: '1997-02-18',
    age: 29,
    address: 'Lazimpat, Kathmandu, Nepal',
    phone: '+977-9861112233',
    email: 'pooja.bhattarai@example.com',
    kycStatus: 'verified',
    kycVerifiedDate: '2026-05-01',
    consentGiven: true,
    consentTimestamp: '2026-10-08T08:00:00Z',
    consentVersion: 'v2.1-2026',
    salaryMonthlyGross: 180000,
    salaryNetDeposit: 145000,
    salaryHistoryMonths: [145000, 145000, 145000, 145000, 145000, 145000],
    existingMonthlyDebt: 18000,
    creditHistorySummary: {
      hasEstablishedHistory: true,
      overdueBalance: 0,
      maxDaysLate12m: 0,
      creditBureauScore: 810
    },
    blacklistStatus: 'clean'
  },
  'USR-CUST-005': {
    id: 'USR-CUST-005',
    fullName: 'Rohan Shrestha',
    maskedAccount: 'ACC-****-9104',
    citizenNumber: '27-01-73-44120',
    dateOfBirth: '1991-09-12',
    age: 35,
    address: 'Kumaripati, Lalitpur, Nepal',
    phone: '+977-9849998877',
    email: 'rohan.shrestha@example.com',
    kycStatus: 'verified',
    kycVerifiedDate: '2026-02-20',
    consentGiven: true,
    consentTimestamp: '2026-10-08T09:00:00Z',
    consentVersion: 'v2.1-2026',
    salaryMonthlyGross: 210000,
    salaryNetDeposit: 170000,
    salaryHistoryMonths: [170000, 170000, 170000, 170000, 170000, 170000],
    existingMonthlyDebt: 30000,
    creditHistorySummary: {
      hasEstablishedHistory: true,
      overdueBalance: 0,
      maxDaysLate12m: 0,
      creditBureauScore: 760
    },
    blacklistStatus: 'clean'
  }
}

export const INITIAL_POLICY: CreditPolicy = {
  id: 'POL-2026-01',
  version: 'v1.4-PROPOSED-DEMO',
  minAge: 21,
  maxAgeFinalInstalment: 65,
  minTermMonths: 12,
  maxTermMonths: 84,
  maxAutomatedLtvPercent: 60.0,
  maxAutomatedDsrPercent: 50.0,
  maxAutomatedLoanAmount: 2500000,
  approvedAnnualInterestRate: 10.0,
  approvalValidityDays: 30,
  effectiveDate: '2026-01-01',
  proposedChanges: undefined
}

export const INITIAL_POLICY_VERSIONS: PolicyVersionRecord[] = [
  {
    id: 'PV-001',
    version: 'v1.3-BASELINE',
    proposerName: 'Nikita Shrestha (Admin)',
    approverName: 'Sanjay Shrestha (Risk Head)',
    approvedDate: '2025-12-15T14:30:00Z',
    justification: 'Year-end retail auto credit baseline calibration.',
    policySnapshot: { ...INITIAL_POLICY, version: 'v1.3-BASELINE', maxAutomatedLtvPercent: 55.0 }
  },
  {
    id: 'PV-002',
    version: 'v1.4-PROPOSED-DEMO',
    proposerName: 'Nikita Shrestha (Admin)',
    approverName: 'Sanjay Shrestha (Compliance Officer)',
    approvedDate: '2026-01-01T09:00:00Z',
    justification: 'Aligned with NRB retail lending guidelines and proposed auto loan policy.',
    policySnapshot: INITIAL_POLICY
  }
]

// Zero initial applications by default: applications must be processed dynamically!
export const INITIAL_APPLICATIONS: Application[] = []

export const INITIAL_AUDIT_LOGS: AuditLog[] = []
export const INITIAL_NOTIFICATIONS: AppNotification[] = []

// Storage Access & Mutation Helpers

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item) as T
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e)
    return defaultValue
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e)
  }
}

export function initializeStorageIfEmpty(): void {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)
  if (!initialized) {
    resetAllToDefaultData()
  }
}

export function resetAllToDefaultData(): void {
  saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS)
  saveToStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0])
  saveToStorage(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES)
  saveToStorage(STORAGE_KEYS.DEALERS, INITIAL_DEALERS)
  saveToStorage(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS)
  saveToStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  saveToStorage(STORAGE_KEYS.APPLICATIONS, [])
  saveToStorage(STORAGE_KEYS.POLICY, INITIAL_POLICY)
  saveToStorage(STORAGE_KEYS.POLICY_VERSIONS, INITIAL_POLICY_VERSIONS)
  saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [])
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, [])
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
}

// Dynamically process multiple demo customers through the 10-rule credit engine!
export function processDemoApplicationsLocally(): Application[] {
  const customers = getFromStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  const quotations = getFromStorage<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS)
  const policy = getFromStorage<CreditPolicy>(STORAGE_KEYS.POLICY, INITIAL_POLICY)

  const scenariosToRun = [
    { custId: 'USR-CUST-001', quoId: 'QUO-2026-101', amount: 2400000, term: 84 },
    { custId: 'USR-CUST-002', quoId: 'QUO-2026-103', amount: 2200000, term: 60 },
    { custId: 'USR-CUST-003', quoId: 'QUO-2026-102', amount: 2000000, term: 60 },
    { custId: 'USR-CUST-004', quoId: 'QUO-2026-104', amount: 2800000, term: 72 },
    { custId: 'USR-CUST-005', quoId: 'QUO-2026-103', amount: 2100000, term: 60 }
  ]

  const createdApps: Application[] = []

  scenariosToRun.forEach((sc) => {
    const cust = customers[sc.custId]
    const quo = quotations.find((q) => q.id === sc.quoId) || quotations[0]
    const evalResult = evaluateCreditApplication({
      customer: cust,
      quotation: quo,
      requestedLoanAmount: sc.amount,
      termMonths: sc.term,
      policy
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

    const app: Application = {
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
      requestedLoanAmount: sc.amount,
      approvedLoanAmount: evalResult.status === 'approved_in_principle' ? sc.amount : undefined,
      loanTermMonths: sc.term,
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
      decisionDate: evalResult.status === 'approved_in_principle' || evalResult.status === 'declined' ? nowIso : undefined,
      approvalExpiryDate: evalResult.approvalExpiryDate,
      approvalConditions: evalResult.conditions,
      bureauStatus: 'available',
      bureauRetryCount: 0,
      assignedOfficerId: evalResult.status === 'referred' ? 'USR-OFFICER-001' : undefined,
      assignedOfficerName: evalResult.status === 'referred' ? 'Bikram Thapa' : undefined,
      documents: [
        { id: `DOC-${Date.now()}-1`, name: 'Citizenship Certificate', type: 'citizenship_copy', status: 'verified', uploadDate: nowIso },
        { id: `DOC-${Date.now()}-2`, name: 'Salary Account Credits Record', type: 'salary_slip', status: 'verified', uploadDate: nowIso, extractedIncome: cust.salaryMonthlyGross }
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
          details: `Submitted loan request for Rs. ${sc.amount.toLocaleString('en-IN')}.`
        },
        {
          timestamp: nowIso,
          actor: 'Automated Decision Engine',
          role: 'System',
          action: evalResult.status === 'approved_in_principle'
            ? 'In-Principle Approved'
            : evalResult.status === 'declined'
            ? 'Declined'
            : 'Referred to Review Queue',
          details: evalResult.decisionReason
        }
      ],
      version: 1,
      createdAt: nowIso,
      updatedAt: nowIso
    }

    createdApps.push(app)
  })

  saveToStorage(STORAGE_KEYS.APPLICATIONS, createdApps)
  return createdApps
}

export const StorageService = {
  getUsers: () => getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  getCurrentUser: () => getFromStorage<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]),
  setCurrentUser: (u: User) => saveToStorage(STORAGE_KEYS.CURRENT_USER, u),

  getVehicles: () => getFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES),
  saveVehicles: (v: Vehicle[]) => saveToStorage(STORAGE_KEYS.VEHICLES, v),

  getDealers: () => getFromStorage<Dealer[]>(STORAGE_KEYS.DEALERS, INITIAL_DEALERS),
  saveDealers: (d: Dealer[]) => saveToStorage(STORAGE_KEYS.DEALERS, d),

  getQuotations: () => getFromStorage<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS),
  saveQuotations: (q: Quotation[]) => saveToStorage(STORAGE_KEYS.QUOTATIONS, q),

  getCustomers: () => getFromStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomers: (c: Record<string, CustomerProfile>) => saveToStorage(STORAGE_KEYS.CUSTOMERS, c),

  getApplications: () => getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []),
  saveApplications: (a: Application[]) => saveToStorage(STORAGE_KEYS.APPLICATIONS, a),
  removeCustomerApplications: (customerId: string) => {
    const apps = getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const filtered = apps.filter((a) => a.customerId !== customerId)
    saveToStorage(STORAGE_KEYS.APPLICATIONS, filtered)
    return filtered
  },

  getPolicy: () => getFromStorage<CreditPolicy>(STORAGE_KEYS.POLICY, INITIAL_POLICY),
  savePolicy: (p: CreditPolicy) => saveToStorage(STORAGE_KEYS.POLICY, p),

  getPolicyVersions: () => getFromStorage<PolicyVersionRecord[]>(STORAGE_KEYS.POLICY_VERSIONS, INITIAL_POLICY_VERSIONS),
  savePolicyVersions: (pv: PolicyVersionRecord[]) => saveToStorage(STORAGE_KEYS.POLICY_VERSIONS, pv),

  getAuditLogs: () => getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [])
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    }
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs])
    return newLog
  },

  getNotifications: () => getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []),
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, [])
    const newNotif: AppNotification = {
      ...n,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false
    }
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...list])
    return newNotif
  },
  markNotificationRead: (id: string) => {
    const list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, [])
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n))
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated)
  }
}
