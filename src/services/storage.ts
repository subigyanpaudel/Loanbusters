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
  USERS: 'loan_rangers_users_v1',
  CURRENT_USER: 'loan_rangers_current_user_v1',
  VEHICLES: 'loan_rangers_vehicles_v1',
  DEALERS: 'loan_rangers_dealers_v1',
  QUOTATIONS: 'loan_rangers_quotations_v1',
  CUSTOMERS: 'loan_rangers_customers_v1',
  APPLICATIONS: 'loan_rangers_applications_v1',
  POLICY: 'loan_rangers_policy_v1',
  POLICY_VERSIONS: 'loan_rangers_policy_versions_v1',
  AUDIT_LOGS: 'loan_rangers_audit_logs_v1',
  NOTIFICATIONS: 'loan_rangers_notifications_v1',
  INITIALIZED: 'loan_rangers_initialized_v1'
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
    expiryDate: '2026-10-31',
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
    expiryDate: '2026-10-31',
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
    expiryDate: '2026-11-02',
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
    expiryDate: '2026-11-03',
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
  'CUST-SUNITA': {
    id: 'CUST-SUNITA',
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
  'CUST-DEEPAK': {
    id: 'CUST-DEEPAK',
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

export const INITIAL_APPLICATIONS: Application[] = [
  // Application 1: Approved In-Principle Benchmark Case
  // Vehicle: NPR 4,000,000, Loan: NPR 2,400,000, 84 months, Rate: 10.0%, EMI: Rs. 40,035.19, LTV: 60.00%, DSR: 40.02%
  (() => {
    const cust = INITIAL_CUSTOMERS['USR-CUST-001']
    const quo = INITIAL_QUOTATIONS[0]
    const evalResult = evaluateCreditApplication({
      customer: cust,
      quotation: quo,
      requestedLoanAmount: 2400000,
      termMonths: 84,
      policy: INITIAL_POLICY
    })
    return {
      id: 'APP-2026-8810',
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
      requestedLoanAmount: 2400000,
      approvedLoanAmount: 2400000,
      loanTermMonths: 84,
      interestRateAnnual: 10.0,
      emiMonthly: evalResult.calculatedEmi,
      downPayment: 1600000,
      ltvPercent: evalResult.calculatedLtv,
      debtServiceRatioPercent: evalResult.calculatedDsr,
      verifiedMonthlyGrossIncome: cust.salaryMonthlyGross,
      existingMonthlyDebt: cust.existingMonthlyDebt,
      status: 'approved_in_principle',
      stage: 5,
      decisionReason: evalResult.decisionReason,
      decisionDate: '2026-10-08T10:15:00Z',
      approvalExpiryDate: evalResult.approvalExpiryDate,
      approvalConditions: evalResult.conditions,
      bureauStatus: 'available',
      bureauRetryCount: 0,
      documents: [
        {
          id: 'DOC-001',
          name: 'Citizenship Certificate Copy',
          type: 'citizenship_copy',
          status: 'verified',
          uploadDate: '2026-10-08T09:40:00Z'
        },
        {
          id: 'DOC-002',
          name: 'Salary Certificate & Tax Statement',
          type: 'salary_slip',
          status: 'verified',
          uploadDate: '2026-10-08T09:41:00Z',
          extractedIncome: 150000
        }
      ],
      documentRequests: [],
      officerNotes: [],
      ruleResults: evalResult.ruleResults,
      timeline: [
        {
          timestamp: '2026-10-08T09:30:00Z',
          actor: 'Aarav Sharma',
          role: 'Customer',
          action: 'Quotation Confirmed',
          details: 'Confirmed quotation QUO-2026-101 for Hyundai Creta EX.'
        },
        {
          timestamp: '2026-10-08T09:35:00Z',
          actor: 'Aarav Sharma',
          role: 'Customer',
          action: 'Consent Recorded',
          details: 'Granted digital consent v2.1-2026 for credit appraisal and bureau query.'
        },
        {
          timestamp: '2026-10-08T09:45:00Z',
          actor: 'Aarav Sharma',
          role: 'Customer',
          action: 'Application Submitted',
          details: 'Submitted auto loan application for Rs. 2,400,000.'
        },
        {
          timestamp: '2026-10-08T10:15:00Z',
          actor: 'Automated Credit Engine',
          role: 'System',
          action: 'In-Principle Approved',
          details: 'All 10 rules passed automatically. Preliminary approval valid for 30 calendar days.'
        }
      ],
      version: 1,
      createdAt: '2026-10-08T09:45:00Z',
      updatedAt: '2026-10-08T10:15:00Z'
    } as Application
  })(),

  // Application 2: Referred to Officer Queue (Loan exceeds auto limit: Rs. 2,800,000 on Rs. 4,800,000 Vitara)
  (() => {
    const cust = INITIAL_CUSTOMERS['USR-CUST-001']
    const quo = INITIAL_QUOTATIONS[1] // Kia Seltos 4.5M
    const evalResult = evaluateCreditApplication({
      customer: cust,
      quotation: quo,
      requestedLoanAmount: 2600000, // exceeds 2.5M
      termMonths: 72,
      policy: INITIAL_POLICY
    })
    return {
      id: 'APP-2026-8811',
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
      requestedLoanAmount: 2600000,
      loanTermMonths: 72,
      interestRateAnnual: 10.0,
      emiMonthly: evalResult.calculatedEmi,
      downPayment: 1900000,
      ltvPercent: evalResult.calculatedLtv,
      debtServiceRatioPercent: evalResult.calculatedDsr,
      verifiedMonthlyGrossIncome: cust.salaryMonthlyGross,
      existingMonthlyDebt: cust.existingMonthlyDebt,
      status: 'referred',
      stage: 4,
      decisionReason: 'Referred to Credit Officer: Requested amount exceeds automated limit (Rs. 2,500,000).',
      bureauStatus: 'available',
      bureauRetryCount: 0,
      assignedOfficerId: 'USR-OFFICER-001',
      assignedOfficerName: 'Bikram Thapa',
      documents: [
        {
          id: 'DOC-101',
          name: 'Citizenship Copy',
          type: 'citizenship_copy',
          status: 'verified',
          uploadDate: '2026-10-09T08:00:00Z'
        }
      ],
      documentRequests: [
        {
          id: 'REQ-001',
          documentName: 'Tax Clearance Certificate FY 2081/82',
          requestedBy: 'Bikram Thapa (Credit Officer)',
          requestDate: '2026-10-09T11:00:00Z',
          reason: 'Required for high-value loan review exceeding Rs. 2,500,000.',
          resolved: false
        }
      ],
      officerNotes: [
        {
          id: 'NOTE-001',
          officerName: 'Bikram Thapa',
          timestamp: '2026-10-09T11:05:00Z',
          actionType: 'Request Information',
          note: 'Applicant income track record is strong. Requesting official tax clearance prior to discretionary approval.'
        }
      ],
      ruleResults: evalResult.ruleResults,
      timeline: [
        {
          timestamp: '2026-10-09T07:50:00Z',
          actor: 'Aarav Sharma',
          role: 'Customer',
          action: 'Application Submitted',
          details: 'Submitted loan request for Rs. 2,600,000 for Kia Seltos.'
        },
        {
          timestamp: '2026-10-09T08:15:00Z',
          actor: 'Automated Credit Engine',
          role: 'System',
          action: 'Referred to Review',
          details: 'Rule R10 triggered: amount above automated ceiling of Rs. 2,500,000.'
        },
        {
          timestamp: '2026-10-09T11:00:00Z',
          actor: 'Bikram Thapa',
          role: 'Credit Officer',
          action: 'Document Requested',
          details: 'Requested Tax Clearance Certificate FY 2081/82.'
        }
      ],
      version: 1,
      createdAt: '2026-10-09T07:50:00Z',
      updatedAt: '2026-10-09T11:05:00Z'
    } as Application
  })(),

  // Application 3: Bureau Outage Pending Simulation
  (() => {
    const cust = INITIAL_CUSTOMERS['CUST-SUNITA']
    const quo = INITIAL_QUOTATIONS[2] // Nexon EV 4.3M
    const evalResult = evaluateCreditApplication({
      customer: cust,
      quotation: quo,
      requestedLoanAmount: 2200000,
      termMonths: 60,
      policy: INITIAL_POLICY,
      bureauAvailable: false
    })
    return {
      id: 'APP-2026-8812',
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
      requestedLoanAmount: 2200000,
      loanTermMonths: 60,
      interestRateAnnual: 10.0,
      emiMonthly: evalResult.calculatedEmi,
      downPayment: 2100000,
      ltvPercent: evalResult.calculatedLtv,
      debtServiceRatioPercent: evalResult.calculatedDsr,
      verifiedMonthlyGrossIncome: cust.salaryMonthlyGross,
      existingMonthlyDebt: cust.existingMonthlyDebt,
      status: 'pending',
      stage: 3,
      decisionReason: 'Credit Information Bureau connection timeout. Retrying scheduled check.',
      bureauStatus: 'outage',
      bureauRetryCount: 1,
      documents: [],
      documentRequests: [],
      officerNotes: [],
      ruleResults: evalResult.ruleResults,
      timeline: [
        {
          timestamp: '2026-10-09T14:10:00Z',
          actor: 'Sunita KC',
          role: 'Customer',
          action: 'Application Submitted',
          details: 'Submitted loan request for Tata Nexon EV.'
        },
        {
          timestamp: '2026-10-09T14:11:00Z',
          actor: 'Automated Credit Engine',
          role: 'System',
          action: 'Bureau Outage Detected',
          details: 'External Credit Bureau service unresponsive. Application held in PENDING status.'
        }
      ],
      version: 1,
      createdAt: '2026-10-09T14:10:00Z',
      updatedAt: '2026-10-09T14:11:00Z'
    } as Application
  })()
]

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-08T09:35:00Z',
    actorName: 'Aarav Sharma',
    actorRole: 'Customer',
    action: 'RECORD_CONSENT',
    applicationId: 'APP-2026-8810',
    details: 'Digital consent recorded under Terms Version v2.1-2026. IP hash logged.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-08T10:15:00Z',
    actorName: 'Automated Credit Engine',
    actorRole: 'System',
    action: 'CREDIT_DECISION_ISSUED',
    applicationId: 'APP-2026-8810',
    details: 'In-Principle Approval granted. All 10 credit criteria satisfied.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-09T08:15:00Z',
    actorName: 'Automated Credit Engine',
    actorRole: 'System',
    action: 'APPLICATION_REFERRED',
    applicationId: 'APP-2026-8811',
    details: 'Referred to Credit Officer review. Reason: R10 Authority Limit Exceeded.'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-10-09T11:00:00Z',
    actorName: 'Bikram Thapa',
    actorRole: 'Bank Officer',
    action: 'REQUEST_DOCUMENT',
    applicationId: 'APP-2026-8811',
    details: 'Requested Tax Clearance Certificate FY 2081/82 from applicant.'
  }
]

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-001',
    recipientRole: 'customer',
    recipientCustomerId: 'USR-CUST-001',
    title: 'In-Principle Auto Loan Approval Granted',
    message: 'Your loan application APP-2026-8810 for Hyundai Creta EX has received preliminary In-Principle Approval.',
    timestamp: '2026-10-08T10:15:00Z',
    read: false,
    applicationId: 'APP-2026-8810'
  },
  {
    id: 'NOTIF-002',
    recipientRole: 'customer',
    recipientCustomerId: 'USR-CUST-001',
    title: 'Action Required: Additional Document Requested',
    message: 'Credit Officer Bikram Thapa has requested Tax Clearance Certificate FY 2081/82 for application APP-2026-8811.',
    timestamp: '2026-10-09T11:00:00Z',
    read: false,
    applicationId: 'APP-2026-8811'
  },
  {
    id: 'NOTIF-003',
    recipientRole: 'officer',
    title: 'New Application in Review Queue',
    message: 'Application APP-2026-8811 requires manual review (Loan amount exceeds NPR 2,500,000).',
    timestamp: '2026-10-09T08:15:00Z',
    read: true,
    applicationId: 'APP-2026-8811'
  }
]

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
  saveToStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS)
  saveToStorage(STORAGE_KEYS.POLICY, INITIAL_POLICY)
  saveToStorage(STORAGE_KEYS.POLICY_VERSIONS, INITIAL_POLICY_VERSIONS)
  saveToStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
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

  getApplications: () => getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS),
  saveApplications: (a: Application[]) => saveToStorage(STORAGE_KEYS.APPLICATIONS, a),

  getPolicy: () => getFromStorage<CreditPolicy>(STORAGE_KEYS.POLICY, INITIAL_POLICY),
  savePolicy: (p: CreditPolicy) => saveToStorage(STORAGE_KEYS.POLICY, p),

  getPolicyVersions: () => getFromStorage<PolicyVersionRecord[]>(STORAGE_KEYS.POLICY_VERSIONS, INITIAL_POLICY_VERSIONS),
  savePolicyVersions: (pv: PolicyVersionRecord[]) => saveToStorage(STORAGE_KEYS.POLICY_VERSIONS, pv),

  getAuditLogs: () => getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    }
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs])
    return newLog
  },

  getNotifications: () => getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
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
    const list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n))
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated)
  }
}
