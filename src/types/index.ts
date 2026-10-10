// TypeScript Definitions for Loan Rangers Auto Loan Credit Decisioning System

export type UserRole = 'customer' | 'officer' | 'admin' | 'dealer'

export interface User {
  id: string
  name: string
  role: UserRole
  email: string
  maskedAccount?: string
  officerLevel?: 'standard' | 'senior'
  officerAuthorityLimit?: number // NPR 2,500,000 for standard, NPR 5,000,000 for senior
  dealerId?: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  variant: string
  category: 'Private'
  eligibleValue: number // NPR
  active: boolean
  effectiveDate: string
}

export interface Dealer {
  id: string
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address: string
  active: boolean
}

export interface Quotation {
  id: string
  dealerId: string
  dealerName: string
  vehicleId: string
  make: string
  model: string
  variant: string
  eligiblePrice: number // NPR
  quotationDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'used'
  confirmedByCustomerId?: string
}

export interface CustomerProfile {
  id: string
  fullName: string
  maskedAccount: string
  citizenNumber: string
  dateOfBirth: string // YYYY-MM-DD
  age: number
  address: string
  phone: string
  email: string
  kycStatus: 'verified' | 'pending' | 'outdated'
  kycVerifiedDate: string
  consentGiven: boolean
  consentTimestamp?: string
  consentVersion?: string
  salaryMonthlyGross: number
  salaryNetDeposit: number
  salaryHistoryMonths: number[] // Last 6 months net deposits
  existingMonthlyDebt: number
  creditHistorySummary: {
    hasEstablishedHistory: boolean
    overdueBalance: number
    maxDaysLate12m: number
    creditBureauScore: number
  }
  blacklistStatus: 'clean' | 'confirmed_match' | 'ambiguous_match'
}

export type ApplicationStatus =
  | 'quotation_confirmed'
  | 'pending_verification'
  | 'appraisal_in_progress'
  | 'referred'
  | 'pending'
  | 'approved_in_principle'
  | 'declined'

export type RuleId =
  | 'R1'
  | 'R2'
  | 'R3'
  | 'R4'
  | 'R5'
  | 'R6'
  | 'R7'
  | 'R8'
  | 'R9'
  | 'R10'

export type RuleStatus = 'PASS' | 'FAIL' | 'REFER' | 'PENDING'

export interface RuleResult {
  ruleId: RuleId
  ruleName: string
  status: RuleStatus
  details: string
  actualValue: string | number
  thresholdValue: string | number
  evaluatedAt: string
}

export interface DocumentItem {
  id: string
  name: string
  type: 'salary_slip' | 'tax_clearance' | 'bank_statement' | 'citizenship_copy' | 'vehicle_quotation'
  status: 'verified' | 'pending' | 'ocr_mismatch' | 'unreadable'
  uploadDate: string
  extractedIncome?: number
  notes?: string
}

export interface DocumentRequest {
  id: string
  documentName: string
  requestedBy: string
  requestDate: string
  reason: string
  resolved: boolean
  resolvedDate?: string
}

export interface OfficerNote {
  id: string
  officerName: string
  timestamp: string
  actionType: string
  note: string
}

export interface TimelineEvent {
  timestamp: string
  actor: string
  role: string
  action: string
  details: string
}

export interface Application {
  id: string
  customerId: string
  customerName: string
  maskedAccount: string
  quotationId: string
  quotation: {
    vehicleId: string
    make: string
    model: string
    variant: string
    vehiclePrice: number
    dealerName: string
    dealerId: string
    expiryDate: string
  }
  requestedLoanAmount: number
  approvedLoanAmount?: number
  loanTermMonths: number
  interestRateAnnual: number // e.g. 10.0%
  emiMonthly: number
  downPayment: number
  ltvPercent: number
  debtServiceRatioPercent: number
  verifiedMonthlyGrossIncome: number
  existingMonthlyDebt: number

  status: ApplicationStatus
  stage: 1 | 2 | 3 | 4 | 5
  // Stage 1: Quotation confirmed
  // Stage 2: Consent & verification
  // Stage 3: Credit appraisal
  // Stage 4: Officer review / Automated decision
  // Stage 5: Decision communicated

  decisionReason?: string
  decisionDate?: string
  approvalExpiryDate?: string // 30 calendar days from approval
  approvalConditions?: string[]

  bureauStatus: 'available' | 'outage' | 'retry_pending'
  bureauRetryCount: number
  assignedOfficerId?: string
  assignedOfficerName?: string

  documents: DocumentItem[]
  documentRequests: DocumentRequest[]
  officerNotes: OfficerNote[]
  ruleResults: Record<RuleId, RuleResult>
  timeline: TimelineEvent[]
  version: number
  previousVersions?: Array<{
    version: number
    status: ApplicationStatus
    loanAmount: number
    termMonths: number
    emiMonthly: number
    evaluatedAt: string
    reason: string
  }>
  createdAt: string
  updatedAt: string
}

export interface CreditPolicy {
  id: string
  version: string
  minAge: number // 21
  maxAgeFinalInstalment: number // 65
  minTermMonths: number // 12
  maxTermMonths: number // 84
  maxAutomatedLtvPercent: number // 60.00%
  maxAutomatedDsrPercent: number // 50.00%
  maxAutomatedLoanAmount: number // NPR 2,500,000
  approvedAnnualInterestRate: number // 10.0%
  approvalValidityDays: number // 30 days
  effectiveDate: string
  proposedChanges?: {
    proposerId: string
    proposerName: string
    proposedTimestamp: string
    changes: Partial<CreditPolicy>
    justification: string
  }
}

export interface PolicyVersionRecord {
  id: string
  version: string
  proposerName: string
  approverName: string
  approvedDate: string
  justification: string
  policySnapshot: CreditPolicy
}

export interface AuditLog {
  id: string
  timestamp: string
  actorName: string
  actorRole: string
  action: string
  applicationId?: string
  details: string
}

export interface AppNotification {
  id: string
  recipientRole: UserRole
  recipientCustomerId?: string
  recipientDealerId?: string
  title: string
  message: string
  timestamp: string
  read: boolean
  applicationId?: string
}

export interface DemoScenarioResult {
  scenarioId: number
  title: string
  description: string
  expectedStatus: ApplicationStatus | string
  expectedRuleOutcome: string
  actualStatus?: ApplicationStatus | string
  actualDetails?: string
  matched: boolean
  executedAt?: string
  applicationId?: string
}
