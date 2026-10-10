import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  User,
  UserRole,
  Vehicle,
  Dealer,
  Quotation,
  CustomerProfile,
  Application,
  CreditPolicy,
  PolicyVersionRecord,
  AuditLog,
  AppNotification,
  DemoScenarioResult
} from '../types'
import {
  StorageService,
  initializeStorageIfEmpty,
  resetAllToDefaultData
} from '../services/storage'
import {
  evaluateCreditApplication,
  calculateReducingBalanceEmi
} from '../services/creditEngine'
import { DEMO_SCENARIOS } from '../services/scenarioRunner'

export type ActivePortal = 'customer' | 'admin' | 'dealer' | 'scenarios'
export type AdminTab =
  | 'overview'
  | 'all_apps'
  | 'review_queue'
  | 'auto_decisions'
  | 'pending_apps'
  | 'kyc_records'
  | 'dealers'
  | 'vehicles'
  | 'policy_settings'
  | 'reports'
  | 'audit_trail'

export type CustomerTab = 'dashboard' | 'new_application' | 'my_applications' | 'application_detail'

interface AppContextType {
  currentUser: User
  allUsers: User[]
  setCurrentUserRole: (role: UserRole, userId?: string) => void

  activePortal: ActivePortal
  setActivePortal: (portal: ActivePortal) => void
  adminTab: AdminTab
  setAdminTab: (tab: AdminTab) => void
  customerTab: CustomerTab
  setCustomerTab: (tab: CustomerTab) => void

  selectedApplicationId: string | null
  setSelectedApplicationId: (id: string | null) => void

  vehicles: Vehicle[]
  dealers: Dealer[]
  quotations: Quotation[]
  customers: Record<string, CustomerProfile>
  applications: Application[]
  policy: CreditPolicy
  policyVersions: PolicyVersionRecord[]
  auditLogs: AuditLog[]
  notifications: AppNotification[]

  // Actions
  submitNewApplication: (data: {
    customerId: string
    quotationId: string
    requestedLoanAmount: number
    termMonths: number
    complianceFlagsPresent?: boolean
    ocrMismatch?: boolean
  }) => { application: Application; duplicate: boolean }

  officerApproveApplication: (applicationId: string, notes: string) => { success: boolean; error?: string }
  officerDeclineApplication: (applicationId: string, reason: string) => void
  officerRequestInformation: (applicationId: string, documentName: string, reason: string) => void
  officerEscalateApplication: (applicationId: string, notes: string) => void
  officerProposeRevisedTerms: (applicationId: string, revisedAmount: number, revisedTerm: number, notes: string) => void
  customerUploadDocument: (applicationId: string, docName: string, type: any, notes?: string) => void
  retryBureauCheck: (applicationId: string) => void

  // Dealer Actions
  createQuotation: (quotationData: Omit<Quotation, 'id' | 'status'>) => Quotation

  // Admin Actions
  addVehicle: (v: Omit<Vehicle, 'id'>) => void
  toggleVehicleStatus: (id: string) => void
  addDealer: (d: Omit<Dealer, 'id'>) => void
  toggleDealerStatus: (id: string) => void

  // Policy Dual-Approval (Maker-Checker)
  proposePolicyChange: (changes: Partial<CreditPolicy>, justification: string) => void
  approvePolicyChange: (notes: string) => { success: boolean; error?: string }
  rejectPolicyChange: (reason: string) => void

  // Notifications & Audit
  markNotificationAsRead: (id: string) => void
  resetSystemData: () => void

  // Scenarios Runner State
  scenarioResults: Record<number, DemoScenarioResult>
  runScenario: (scenarioId: number) => void
  runAllScenarios: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    initializeStorageIfEmpty()
  }, [])

  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers())
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser())
  const [activePortal, setActivePortal] = useState<ActivePortal>('customer')
  const [adminTab, setAdminTab] = useState<AdminTab>('overview')
  const [customerTab, setCustomerTab] = useState<CustomerTab>('dashboard')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => StorageService.getVehicles())
  const [dealers, setDealers] = useState<Dealer[]>(() => StorageService.getDealers())
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations())
  const [customers, setCustomers] = useState<Record<string, CustomerProfile>>(() => StorageService.getCustomers())
  const [applications, setApplications] = useState<Application[]>(() => StorageService.getApplications())
  const [policy, setPolicy] = useState<CreditPolicy>(() => StorageService.getPolicy())
  const [policyVersions, setPolicyVersions] = useState<PolicyVersionRecord[]>(() => StorageService.getPolicyVersions())
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs())
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications())

  const [scenarioResults, setScenarioResults] = useState<Record<number, DemoScenarioResult>>({})

  // Update storage whenever states change
  const saveApps = (newApps: Application[]) => {
    setApplications(newApps)
    StorageService.saveApplications(newApps)
  }

  const setCurrentUserRole = (role: UserRole, userId?: string) => {
    let targetUser: User | undefined
    if (userId) {
      targetUser = allUsers.find((u) => u.id === userId)
    }
    if (!targetUser) {
      targetUser = allUsers.find((u) => u.role === role) || allUsers[0]
    }
    setCurrentUser(targetUser)
    StorageService.setCurrentUser(targetUser)

    // Route user to appropriate portal
    if (role === 'customer') {
      setActivePortal('customer')
      setCustomerTab('dashboard')
    } else if (role === 'officer' || role === 'admin') {
      setActivePortal('admin')
      setAdminTab(role === 'officer' ? 'review_queue' : 'overview')
    } else if (role === 'dealer') {
      setActivePortal('dealer')
    }
  }

  const logAction = (action: string, details: string, appId?: string) => {
    const newLog = StorageService.addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      applicationId: appId,
      details
    })
    setAuditLogs(StorageService.getAuditLogs())
  }

  const sendNotification = (
    recipientRole: UserRole,
    title: string,
    message: string,
    appId?: string,
    recipientCustomerId?: string,
    recipientDealerId?: string
  ) => {
    StorageService.addNotification({
      recipientRole,
      title,
      message,
      applicationId: appId,
      recipientCustomerId,
      recipientDealerId
    })
    setNotifications(StorageService.getNotifications())
  }

  // 1. Submit New Application
  const submitNewApplication = (data: {
    customerId: string
    quotationId: string
    requestedLoanAmount: number
    termMonths: number
    complianceFlagsPresent?: boolean
    ocrMismatch?: boolean
  }) => {
    const cust = customers[data.customerId] || customers['USR-CUST-001']
    const quo = quotations.find((q) => q.id === data.quotationId) || quotations[0]

    // Rule 13: Check duplicate active applications
    const existingActive = applications.find(
      (a) =>
        a.customerId === cust.id &&
        ['quotation_confirmed', 'pending_verification', 'appraisal_in_progress', 'referred', 'pending', 'approved_in_principle'].includes(a.status)
    )

    if (existingActive) {
      logAction(
        'DUPLICATE_APPLICATION_BLOCKED',
        `Duplicate submission blocked for ${cust.fullName}. Active application ${existingActive.id} maintained.`,
        existingActive.id
      )
      return { application: existingActive, duplicate: true }
    }

    const evalResult = evaluateCreditApplication({
      customer: cust,
      quotation: quo,
      requestedLoanAmount: data.requestedLoanAmount,
      termMonths: data.termMonths,
      policy,
      complianceFlagsPresent: data.complianceFlagsPresent,
      ocrMismatch: data.ocrMismatch
    })

    const appId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const nowIso = new Date().toISOString()

    const newApp: Application = {
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
      requestedLoanAmount: data.requestedLoanAmount,
      approvedLoanAmount: evalResult.status === 'approved_in_principle' ? data.requestedLoanAmount : undefined,
      loanTermMonths: data.termMonths,
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
      bureauStatus: evalResult.status === 'pending' ? 'outage' : 'available',
      bureauRetryCount: 0,
      documents: [
        {
          id: `DOC-${Date.now()}-1`,
          name: 'Citizenship Certificate',
          type: 'citizenship_copy',
          status: 'verified',
          uploadDate: nowIso
        },
        {
          id: `DOC-${Date.now()}-2`,
          name: 'Verified Salary Transactions Record',
          type: 'salary_slip',
          status: data.ocrMismatch ? 'ocr_mismatch' : 'verified',
          uploadDate: nowIso,
          extractedIncome: cust.salaryMonthlyGross
        }
      ],
      documentRequests: [],
      officerNotes: [],
      ruleResults: evalResult.ruleResults,
      timeline: [
        {
          timestamp: nowIso,
          actor: cust.fullName,
          role: 'Customer',
          action: 'Consent Recorded',
          details: `Digital consent recorded under ${cust.consentVersion || 'v2.1-2026'}. Bureau query authorised.`
        },
        {
          timestamp: nowIso,
          actor: cust.fullName,
          role: 'Customer',
          action: 'Application Submitted',
          details: `Submitted loan application for Rs. ${data.requestedLoanAmount.toLocaleString('en-IN')} for ${quo.make} ${quo.model}.`
        },
        {
          timestamp: nowIso,
          actor: 'Automated Credit Engine',
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
      createdAt: nowIso,
      updatedAt: nowIso
    }

    const updatedApps = [newApp, ...applications]
    saveApps(updatedApps)

    logAction(
      'SUBMIT_APPLICATION',
      `Application ${appId} submitted by ${cust.fullName}. Initial automated outcome: ${evalResult.status.toUpperCase()}.`,
      appId
    )

    if (evalResult.status === 'approved_in_principle') {
      sendNotification(
        'customer',
        'Preliminary Auto Loan Approved',
        `Application ${appId} has received In-Principle Approval for Rs. ${data.requestedLoanAmount.toLocaleString('en-IN')}.`,
        appId,
        cust.id
      )
    } else if (evalResult.status === 'referred') {
      sendNotification(
        'officer',
        'New Referral in Review Queue',
        `Application ${appId} referred to Credit Officer for manual assessment.`,
        appId
      )
    }

    return { application: newApp, duplicate: false }
  }

  // Officer Review Actions
  const officerApproveApplication = (applicationId: string, notes: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return { success: false, error: 'Application not found' }

    // Enforce delegated authority: standard officer <= NPR 2,500,000; senior <= NPR 5,000,000
    const officerLimit = currentUser.officerAuthorityLimit || 2500000
    if (app.requestedLoanAmount > officerLimit) {
      const err = `Approval denied: Requested loan Rs. ${app.requestedLoanAmount.toLocaleString('en-IN')} exceeds your delegated authority limit (Rs. ${officerLimit.toLocaleString('en-IN')}). Escalate to Senior Approver.`
      logAction('APPROVAL_DENIED_EXCEEDS_AUTHORITY', err, applicationId)
      return { success: false, error: err }
    }

    const nowIso = new Date().toISOString()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + policy.approvalValidityDays)

    const updatedApp: Application = {
      ...app,
      status: 'approved_in_principle',
      stage: 5,
      approvedLoanAmount: app.requestedLoanAmount,
      decisionReason: `Approved within delegated authority by ${currentUser.name}. ${notes}`,
      decisionDate: nowIso,
      approvalExpiryDate: expiry.toISOString().split('T')[0],
      assignedOfficerId: currentUser.id,
      assignedOfficerName: currentUser.name,
      officerNotes: [
        ...app.officerNotes,
        {
          id: `NOTE-${Date.now()}`,
          officerName: currentUser.name,
          timestamp: nowIso,
          actionType: 'Officer Approval',
          note: notes
        }
      ],
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Credit Officer',
          action: 'Approved Within Authority',
          details: `Manual in-principle approval issued under delegated authority (Limit: Rs. ${officerLimit.toLocaleString('en-IN')}).`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)

    logAction('OFFICER_APPROVAL', `Application ${applicationId} approved by ${currentUser.name}.`, applicationId)
    sendNotification(
      'customer',
      'In-Principle Approval Issued',
      `Your loan application ${applicationId} has been approved by Credit Officer ${currentUser.name}.`,
      applicationId,
      app.customerId
    )

    return { success: true }
  }

  const officerDeclineApplication = (applicationId: string, reason: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()

    const updatedApp: Application = {
      ...app,
      status: 'declined',
      stage: 5,
      decisionReason: reason,
      decisionDate: nowIso,
      assignedOfficerId: currentUser.id,
      assignedOfficerName: currentUser.name,
      officerNotes: [
        ...app.officerNotes,
        {
          id: `NOTE-${Date.now()}`,
          officerName: currentUser.name,
          timestamp: nowIso,
          actionType: 'Officer Decline',
          note: reason
        }
      ],
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Credit Officer',
          action: 'Application Declined',
          details: `Declined with recorded reason: ${reason}`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    logAction('OFFICER_DECLINE', `Application ${applicationId} declined with recorded reason: ${reason}`, applicationId)
    sendNotification(
      'customer',
      'Loan Application Declined',
      `Your application ${applicationId} has been reviewed and declined. Reason: ${reason}`,
      applicationId,
      app.customerId
    )
  }

  const officerRequestInformation = (applicationId: string, documentName: string, reason: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()

    const newRequest = {
      id: `REQ-${Date.now()}`,
      documentName,
      requestedBy: `${currentUser.name} (${currentUser.role})`,
      requestDate: nowIso,
      reason,
      resolved: false
    }

    const updatedApp: Application = {
      ...app,
      stage: 4,
      documentRequests: [...app.documentRequests, newRequest],
      officerNotes: [
        ...app.officerNotes,
        {
          id: `NOTE-${Date.now()}`,
          officerName: currentUser.name,
          timestamp: nowIso,
          actionType: 'Request Information',
          note: `Requested: ${documentName}. Justification: ${reason}`
        }
      ],
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Credit Officer',
          action: 'Information Requested',
          details: `Customer requested to upload ${documentName}.`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    logAction('REQUEST_INFORMATION', `Requested ${documentName} for ${applicationId}`, applicationId)
    sendNotification(
      'customer',
      'Action Required: Document Requested',
      `Credit Officer requested ${documentName} for application ${applicationId}.`,
      applicationId,
      app.customerId
    )
  }

  const officerEscalateApplication = (applicationId: string, notes: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()

    const updatedApp: Application = {
      ...app,
      assignedOfficerId: 'USR-OFFICER-002',
      assignedOfficerName: 'Pooja Karki (Senior Approver)',
      officerNotes: [
        ...app.officerNotes,
        {
          id: `NOTE-${Date.now()}`,
          officerName: currentUser.name,
          timestamp: nowIso,
          actionType: 'Escalation',
          note: `Escalated to Senior Approver. ${notes}`
        }
      ],
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Credit Officer',
          action: 'Escalated to Senior Approver',
          details: `Escalated to Pooja Karki. Notes: ${notes}`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    logAction('ESCALATE_APPLICATION', `Application ${applicationId} escalated to Senior Approver`, applicationId)
    sendNotification(
      'officer',
      'High-Priority Escalated Application',
      `Application ${applicationId} escalated by ${currentUser.name}. Requires Senior Authority review.`,
      applicationId
    )
  }

  const officerProposeRevisedTerms = (
    applicationId: string,
    revisedAmount: number,
    revisedTerm: number,
    notes: string
  ) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()
    const revisedEmi = calculateReducingBalanceEmi(revisedAmount, app.interestRateAnnual, revisedTerm)
    const revisedLtv = Math.round((revisedAmount / app.quotation.vehiclePrice) * 10000) / 100
    const revisedDsr = Math.round(((app.existingMonthlyDebt + revisedEmi) / app.verifiedMonthlyGrossIncome) * 10000) / 100

    const updatedApp: Application = {
      ...app,
      version: app.version + 1,
      previousVersions: [
        ...(app.previousVersions || []),
        {
          version: app.version,
          status: app.status,
          loanAmount: app.requestedLoanAmount,
          termMonths: app.loanTermMonths,
          emiMonthly: app.emiMonthly,
          evaluatedAt: app.updatedAt,
          reason: 'Officer proposed revised terms for compliance'
        }
      ],
      requestedLoanAmount: revisedAmount,
      loanTermMonths: revisedTerm,
      emiMonthly: revisedEmi,
      ltvPercent: revisedLtv,
      debtServiceRatioPercent: revisedDsr,
      officerNotes: [
        ...app.officerNotes,
        {
          id: `NOTE-${Date.now()}`,
          officerName: currentUser.name,
          timestamp: nowIso,
          actionType: 'Propose Revised Terms',
          note: `Proposed Rs. ${revisedAmount.toLocaleString('en-IN')} for ${revisedTerm}m to satisfy LTV/DSR policy limits. ${notes}`
        }
      ],
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Credit Officer',
          action: 'Revised Terms Proposed',
          details: `Proposed loan Rs. ${revisedAmount.toLocaleString('en-IN')} (${revisedTerm}m, EMI Rs. ${revisedEmi.toLocaleString('en-IN')}). Customer consent required.`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    logAction('PROPOSE_REVISED_TERMS', `Proposed revised terms for ${applicationId}`, applicationId)
    sendNotification(
      'customer',
      'Revised Loan Terms Proposed',
      `Credit Officer has proposed adjusted loan terms for application ${applicationId} to meet banking policy guidelines.`,
      applicationId,
      app.customerId
    )
  }

  // Customer Upload Document (Resolves request & triggers revalidation)
  const customerUploadDocument = (
    applicationId: string,
    docName: string,
    type: any,
    notes?: string
  ) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()

    const newDoc = {
      id: `DOC-${Date.now()}`,
      name: docName,
      type,
      status: 'verified' as const,
      uploadDate: nowIso,
      notes
    }

    const updatedRequests = app.documentRequests.map((r) =>
      !r.resolved ? { ...r, resolved: true, resolvedDate: nowIso } : r
    )

    const updatedApp: Application = {
      ...app,
      documents: [...app.documents, newDoc],
      documentRequests: updatedRequests,
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Customer',
          action: 'Document Uploaded',
          details: `Uploaded ${docName}. Case submitted for revalidation.`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    logAction('CUSTOMER_UPLOAD_DOCUMENT', `Customer uploaded ${docName} for ${applicationId}`, applicationId)
    sendNotification(
      'officer',
      'Documents Received for Review',
      `Customer uploaded requested documents for application ${applicationId}. Ready for revalidation.`,
      applicationId
    )
  }

  // Retry Bureau Check
  const retryBureauCheck = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()
    const cust = customers[app.customerId] || customers['USR-CUST-001']
    const quo = quotations.find((q) => q.id === app.quotationId) || quotations[0]

    // Simulate successful bureau connection on manual retry
    const evalResult = evaluateCreditApplication({
      customer: cust,
      quotation: quo,
      requestedLoanAmount: app.requestedLoanAmount,
      termMonths: app.loanTermMonths,
      policy,
      bureauAvailable: true
    })

    const updatedApp: Application = {
      ...app,
      status: evalResult.status,
      stage: evalResult.stage,
      bureauStatus: 'available',
      bureauRetryCount: app.bureauRetryCount + 1,
      decisionReason: evalResult.decisionReason,
      decisionDate: evalResult.status === 'approved_in_principle' ? nowIso : undefined,
      approvalExpiryDate: evalResult.approvalExpiryDate,
      ruleResults: evalResult.ruleResults,
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: 'Credit Bureau Integration',
          role: 'System',
          action: 'Bureau Connection Restored',
          details: 'Simulated bureau query executed successfully. Credit checks rerun.'
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    logAction('BUREAU_RETRY_SUCCESS', `Bureau connection re-established for ${applicationId}`, applicationId)
  }

  // Dealer Action: Create Quotation
  const createQuotation = (quotationData: Omit<Quotation, 'id' | 'status'>): Quotation => {
    const newQuotation: Quotation = {
      ...quotationData,
      id: `QUO-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active'
    }
    const updated = [newQuotation, ...quotations]
    setQuotations(updated)
    StorageService.saveQuotations(updated)
    logAction(
      'CREATE_QUOTATION',
      `Quotation ${newQuotation.id} created by ${newQuotation.dealerName} for ${newQuotation.make} ${newQuotation.model} (Rs. ${newQuotation.eligiblePrice.toLocaleString('en-IN')})`
    )
    return newQuotation
  }

  // Admin Actions: Vehicle Catalogue & Dealers
  const addVehicle = (v: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...v,
      id: `VEH-${Math.floor(100 + Math.random() * 900)}`
    }
    const updated = [...vehicles, newVeh]
    setVehicles(updated)
    StorageService.saveVehicles(updated)
    logAction('ADD_CATALOGUE_VEHICLE', `Added vehicle ${newVeh.make} ${newVeh.model} ${newVeh.variant} to catalogue`)
  }

  const toggleVehicleStatus = (id: string) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    setVehicles(updated)
    StorageService.saveVehicles(updated)
    logAction('TOGGLE_VEHICLE_STATUS', `Toggled vehicle ${id} active status`)
  }

  const addDealer = (d: Omit<Dealer, 'id'>) => {
    const newDlr: Dealer = {
      ...d,
      id: `DLR-${Math.floor(100 + Math.random() * 900)}`
    }
    const updated = [...dealers, newDlr]
    setDealers(updated)
    StorageService.saveDealers(updated)
    logAction('ADD_APPROVED_DEALER', `Added approved dealer ${newDlr.name}`)
  }

  const toggleDealerStatus = (id: string) => {
    const updated = dealers.map((d) => (d.id === id ? { ...d, active: !d.active } : d))
    setDealers(updated)
    StorageService.saveDealers(updated)
    logAction('TOGGLE_DEALER_STATUS', `Toggled dealer ${id} active status`)
  }

  // Maker-Checker Dual Approval Workflow
  const proposePolicyChange = (changes: Partial<CreditPolicy>, justification: string) => {
    const updatedPolicy: CreditPolicy = {
      ...policy,
      proposedChanges: {
        proposerId: currentUser.id,
        proposerName: currentUser.name,
        proposedTimestamp: new Date().toISOString(),
        changes,
        justification
      }
    }
    setPolicy(updatedPolicy)
    StorageService.savePolicy(updatedPolicy)
    logAction(
      'POLICY_CHANGE_PROPOSED',
      `Maker (${currentUser.name}) proposed policy modifications: ${justification}`
    )
    sendNotification(
      'admin',
      'Dual Authorisation Required: Policy Proposal',
      `${currentUser.name} has submitted a credit policy modification proposal requiring Checker approval.`
    )
  }

  const approvePolicyChange = (notes: string) => {
    if (!policy.proposedChanges) {
      return { success: false, error: 'No pending policy changes found.' }
    }
    // Maker cannot approve own changes
    if (policy.proposedChanges.proposerId === currentUser.id) {
      const err = 'Segregation of Duties Violation: Maker cannot approve their own proposed changes. A second authorised administrator must review.'
      logAction('DUAL_APPROVAL_VIOLATION_BLOCKED', err)
      return { success: false, error: err }
    }

    const newVersionTag = `v1.${policyVersions.length + 4}-APPROVED`
    const newPolicy: CreditPolicy = {
      ...policy,
      ...policy.proposedChanges.changes,
      version: newVersionTag,
      effectiveDate: new Date().toISOString().split('T')[0],
      proposedChanges: undefined
    }

    const versionRecord: PolicyVersionRecord = {
      id: `PV-${Date.now()}`,
      version: newVersionTag,
      proposerName: policy.proposedChanges.proposerName,
      approverName: `${currentUser.name} (Checker)`,
      approvedDate: new Date().toISOString(),
      justification: `${policy.proposedChanges.justification} | Approval notes: ${notes}`,
      policySnapshot: newPolicy
    }

    const updatedVersions = [versionRecord, ...policyVersions]
    setPolicy(newPolicy)
    setPolicyVersions(updatedVersions)
    StorageService.savePolicy(newPolicy)
    StorageService.savePolicyVersions(updatedVersions)

    logAction(
      'POLICY_CHANGE_APPROVED',
      `Policy ${newVersionTag} approved by Checker (${currentUser.name}). Maker: ${policy.proposedChanges.proposerName}.`
    )
    return { success: true }
  }

  const rejectPolicyChange = (reason: string) => {
    if (!policy.proposedChanges) return
    const updatedPolicy: CreditPolicy = {
      ...policy,
      proposedChanges: undefined
    }
    setPolicy(updatedPolicy)
    StorageService.savePolicy(updatedPolicy)
    logAction(
      'POLICY_CHANGE_REJECTED',
      `Policy proposal rejected by ${currentUser.name}. Reason: ${reason}`
    )
  }

  const markNotificationAsRead = (id: string) => {
    StorageService.markNotificationRead(id)
    setNotifications(StorageService.getNotifications())
  }

  const resetSystemData = () => {
    resetAllToDefaultData()
    setAllUsers(StorageService.getUsers())
    setCurrentUser(StorageService.getCurrentUser())
    setVehicles(StorageService.getVehicles())
    setDealers(StorageService.getDealers())
    setQuotations(StorageService.getQuotations())
    setCustomers(StorageService.getCustomers())
    setApplications(StorageService.getApplications())
    setPolicy(StorageService.getPolicy())
    setPolicyVersions(StorageService.getPolicyVersions())
    setAuditLogs(StorageService.getAuditLogs())
    setNotifications(StorageService.getNotifications())
    setScenarioResults({})
  }

  // Scenarios Execution
  const runScenario = (scenarioId: number) => {
    const sc = DEMO_SCENARIOS.find((s) => s.id === scenarioId)
    if (!sc) return
    const result = sc.run({
      policy,
      saveApp: (app) => {
        const updated = [app, ...applications.filter((a) => a.id !== app.id)]
        saveApps(updated)
      },
      notify: (title, msg) => sendNotification('customer', title, msg)
    })
    setScenarioResults((prev) => ({ ...prev, [scenarioId]: result }))
  }

  const runAllScenarios = () => {
    const results: Record<number, DemoScenarioResult> = {}
    DEMO_SCENARIOS.forEach((sc) => {
      const res = sc.run({
        policy,
        saveApp: (app) => {
          const updated = [app, ...applications.filter((a) => a.id !== app.id)]
          saveApps(updated)
        },
        notify: (title, msg) => sendNotification('customer', title, msg)
      })
      results[sc.id] = res
    })
    setScenarioResults(results)
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUserRole,
        activePortal,
        setActivePortal,
        adminTab,
        setAdminTab,
        customerTab,
        setCustomerTab,
        selectedApplicationId,
        setSelectedApplicationId,
        vehicles,
        dealers,
        quotations,
        customers,
        applications,
        policy,
        policyVersions,
        auditLogs,
        notifications,
        submitNewApplication,
        officerApproveApplication,
        officerDeclineApplication,
        officerRequestInformation,
        officerEscalateApplication,
        officerProposeRevisedTerms,
        customerUploadDocument,
        retryBureauCheck,
        createQuotation,
        addVehicle,
        toggleVehicleStatus,
        addDealer,
        toggleDealerStatus,
        proposePolicyChange,
        approvePolicyChange,
        rejectPolicyChange,
        markNotificationAsRead,
        resetSystemData,
        scenarioResults,
        runScenario,
        runAllScenarios
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
