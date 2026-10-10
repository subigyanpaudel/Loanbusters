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
  resetAllToDefaultData,
  processDemoApplicationsLocally
} from '../services/storage'
import {
  evaluateCreditApplication,
  calculateReducingBalanceEmi
} from '../services/creditEngine'
import { DEMO_SCENARIOS } from '../services/scenarioRunner'
import { ApiService } from '../services/api'

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
  }) => Promise<{ application: Application; duplicate: boolean }>

  clearClientLoanProcessing: (customerId: string) => Promise<void>
  processDemoApplications: () => Promise<void>

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
  resetSystemData: () => Promise<void>

  // Scenarios Runner State
  scenarioResults: Record<number, DemoScenarioResult>
  runScenario: (scenarioId: number) => void
  runAllScenarios: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Initialize SQLite connection on startup
  useEffect(() => {
    initializeStorageIfEmpty()

    // Fetch initial state from SQLite backend
    const loadFromSqlite = async () => {
      try {
        const [apps, custs, dlrs, vehs, quots, pol, pvers, logs, notifs] = await Promise.all([
          ApiService.getApplications(),
          ApiService.getCustomers(),
          ApiService.getDealers(),
          ApiService.getVehicles(),
          ApiService.getQuotations(),
          ApiService.getPolicy(),
          ApiService.getPolicyVersions(),
          ApiService.getAuditLogs(),
          ApiService.getNotifications()
        ])
        if (apps) setApplications(apps)
        if (custs && Object.keys(custs).length > 0) setCustomers(custs)
        if (dlrs && dlrs.length > 0) setDealers(dlrs)
        if (vehs && vehs.length > 0) setVehicles(vehs)
        if (quots && quots.length > 0) setQuotations(quots)
        if (pol && pol.version) setPolicy(pol)
        if (pvers && pvers.length > 0) setPolicyVersions(pvers)
        if (logs) setAuditLogs(logs)
        if (notifs) setNotifications(notifs)
      } catch (e) {
        console.warn('SQLite backend offline or syncing with localStorage fallback:', e)
      }
    }
    loadFromSqlite()
  }, [])

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
    ApiService.addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      applicationId: appId,
      details
    }).catch(() => {})
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

  // Clear previous loan processing for a specific client
  const clearClientLoanProcessing = async (customerId: string) => {
    try {
      await ApiService.removePreviousLoanProcessing(customerId)
    } catch (e) {}
    const updated = applications.filter((a) => a.customerId !== customerId)
    saveApps(updated)
    logAction('REMOVE_PREVIOUS_LOAN_PROCESSING', `Cleared previous loan processing for customer ${customerId}`)
  }

  // Dynamically process demo loan applications for multiple user names
  const processDemoApplications = async () => {
    try {
      const res = await ApiService.processDemoApplications()
      if (res && res.applications) {
        setApplications(res.applications)
        StorageService.saveApplications(res.applications)
        return
      }
    } catch (e) {
      console.warn('Using local dynamic processing engine:', e)
    }
    const created = processDemoApplicationsLocally()
    setApplications(created)
  }

  // 1. Submit New Application (removes previous loan processing for this client)
  const submitNewApplication = async (data: {
    customerId: string
    quotationId: string
    requestedLoanAmount: number
    termMonths: number
    complianceFlagsPresent?: boolean
    ocrMismatch?: boolean
  }) => {
    // 1. Remove previous loan processing for this client!
    await clearClientLoanProcessing(data.customerId)

    try {
      const serverApp = await ApiService.submitApplication(data)
      if (serverApp && serverApp.id) {
        const updated = [serverApp, ...applications.filter((a) => a.customerId !== data.customerId)]
        saveApps(updated)
        return { application: serverApp, duplicate: false }
      }
    } catch (e) {
      console.warn('SQLite API call failed, falling back to local engine:', e)
    }

    const cust = customers[data.customerId] || customers['USR-CUST-001']
    const quo = quotations.find((q) => q.id === data.quotationId) || quotations[0]

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
          details: `Digital consent recorded under ${cust.consentVersion || 'v2.1-2026'}.`
        },
        {
          timestamp: nowIso,
          actor: cust.fullName,
          role: 'Customer',
          action: 'Application Submitted',
          details: `Submitted loan application for Rs. ${data.requestedLoanAmount.toLocaleString('en-IN')}.`
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

    const updatedApps = [newApp, ...applications.filter((a) => a.customerId !== data.customerId)]
    saveApps(updatedApps)

    logAction(
      'SUBMIT_APPLICATION',
      `Application ${appId} submitted by ${cust.fullName}. Initial automated outcome: ${evalResult.status.toUpperCase()}.`,
      appId
    )

    return { application: newApp, duplicate: false }
  }

  // Officer Review Actions
  const officerApproveApplication = (applicationId: string, notes: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return { success: false, error: 'Application not found' }

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
    ApiService.updateApplication(updatedApp).catch(() => {})

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
    ApiService.updateApplication(updatedApp).catch(() => {})
    logAction('OFFICER_DECLINE', `Application ${applicationId} declined with recorded reason: ${reason}`, applicationId)
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
    ApiService.updateApplication(updatedApp).catch(() => {})
    logAction('REQUEST_INFORMATION', `Requested ${documentName} for ${applicationId}`, applicationId)
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
    ApiService.updateApplication(updatedApp).catch(() => {})
    logAction('ESCALATE_APPLICATION', `Application ${applicationId} escalated to Senior Approver`, applicationId)
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
          note: `Proposed Rs. ${revisedAmount.toLocaleString('en-IN')} for ${revisedTerm}m. ${notes}`
        }
      ],
      timeline: [
        ...app.timeline,
        {
          timestamp: nowIso,
          actor: currentUser.name,
          role: 'Credit Officer',
          action: 'Revised Terms Proposed',
          details: `Proposed loan Rs. ${revisedAmount.toLocaleString('en-IN')} (${revisedTerm}m).`
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    ApiService.updateApplication(updatedApp).catch(() => {})
    logAction('PROPOSE_REVISED_TERMS', `Proposed revised terms for ${applicationId}`, applicationId)
  }

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
    ApiService.updateApplication(updatedApp).catch(() => {})
    logAction('CUSTOMER_UPLOAD_DOCUMENT', `Customer uploaded ${docName} for ${applicationId}`, applicationId)
  }

  const retryBureauCheck = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return
    const nowIso = new Date().toISOString()
    const cust = customers[app.customerId] || customers['USR-CUST-001']
    const quo = quotations.find((q) => q.id === app.quotationId) || quotations[0]

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
          details: 'Simulated bureau query executed successfully.'
        }
      ],
      updatedAt: nowIso
    }

    const updated = applications.map((a) => (a.id === applicationId ? updatedApp : a))
    saveApps(updated)
    ApiService.updateApplication(updatedApp).catch(() => {})
    logAction('BUREAU_RETRY_SUCCESS', `Bureau connection re-established for ${applicationId}`, applicationId)
  }

  const createQuotation = (quotationData: Omit<Quotation, 'id' | 'status'>): Quotation => {
    const newQuotation: Quotation = {
      ...quotationData,
      id: `QUO-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active'
    }
    const updated = [newQuotation, ...quotations]
    setQuotations(updated)
    StorageService.saveQuotations(updated)
    ApiService.addQuotation(quotationData).catch(() => {})
    return newQuotation
  }

  const addVehicle = (v: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...v,
      id: `VEH-${Math.floor(100 + Math.random() * 900)}`
    }
    const updated = [...vehicles, newVeh]
    setVehicles(updated)
    StorageService.saveVehicles(updated)
    ApiService.addVehicle(v).catch(() => {})
  }

  const toggleVehicleStatus = (id: string) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    setVehicles(updated)
    StorageService.saveVehicles(updated)
    ApiService.toggleVehicle(id).catch(() => {})
  }

  const addDealer = (d: Omit<Dealer, 'id'>) => {
    const newDlr: Dealer = {
      ...d,
      id: `DLR-${Math.floor(100 + Math.random() * 900)}`
    }
    const updated = [...dealers, newDlr]
    setDealers(updated)
    StorageService.saveDealers(updated)
    ApiService.addDealer(d).catch(() => {})
  }

  const toggleDealerStatus = (id: string) => {
    const updated = dealers.map((d) => (d.id === id ? { ...d, active: !d.active } : d))
    setDealers(updated)
    StorageService.saveDealers(updated)
    ApiService.toggleDealer(id).catch(() => {})
  }

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
    ApiService.savePolicy(updatedPolicy).catch(() => {})
  }

  const approvePolicyChange = (notes: string) => {
    if (!policy.proposedChanges) {
      return { success: false, error: 'No pending policy changes found.' }
    }
    if (policy.proposedChanges.proposerId === currentUser.id) {
      const err = 'Segregation of Duties Violation: Maker cannot approve their own proposed changes. A second authorised administrator must review.'
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
    ApiService.savePolicy(newPolicy).catch(() => {})
    ApiService.addPolicyVersion(versionRecord).catch(() => {})

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
    ApiService.savePolicy(updatedPolicy).catch(() => {})
  }

  const markNotificationAsRead = (id: string) => {
    StorageService.markNotificationRead(id)
    setNotifications(StorageService.getNotifications())
    ApiService.markNotificationRead(id).catch(() => {})
  }

  // Complete Reset: Wipes SQLite and local state
  const resetSystemData = async () => {
    try {
      await ApiService.resetDb()
    } catch (e) {
      console.warn('SQLite reset failed:', e)
    }
    resetAllToDefaultData()
    setAllUsers(StorageService.getUsers())
    setCurrentUser(StorageService.getCurrentUser())
    setVehicles(StorageService.getVehicles())
    setDealers(StorageService.getDealers())
    setQuotations(StorageService.getQuotations())
    setCustomers(StorageService.getCustomers())
    setApplications([])
    setPolicy(StorageService.getPolicy())
    setPolicyVersions(StorageService.getPolicyVersions())
    setAuditLogs([])
    setNotifications([])
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
        clearClientLoanProcessing,
        processDemoApplications,
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
