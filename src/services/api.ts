// src/services/api.ts
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

const API_BASE = '/api'

export const ApiService = {
  // System Reset
  resetDb: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' })
    return res.json()
  },

  // Process multiple demo customer applications dynamically through 10-rule engine
  processDemoApplications: async (): Promise<{ success: boolean; applications: Application[] }> => {
    const res = await fetch(`${API_BASE}/process-demo`, { method: 'POST' })
    return res.json()
  },

  // Applications
  getApplications: async (): Promise<Application[]> => {
    const res = await fetch(`${API_BASE}/applications`)
    return res.json()
  },

  submitApplication: async (data: {
    customerId: string
    quotationId: string
    requestedLoanAmount: number
    termMonths: number
    complianceFlagsPresent?: boolean
    ocrMismatch?: boolean
  }): Promise<Application> => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  updateApplication: async (app: Application): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/applications/${app.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    })
    return res.json()
  },

  removePreviousLoanProcessing: async (customerId: string): Promise<{ success: boolean; deletedCount: number }> => {
    const res = await fetch(`${API_BASE}/applications/customer/${customerId}`, { method: 'DELETE' })
    return res.json()
  },

  // Customers
  getCustomers: async (): Promise<Record<string, CustomerProfile>> => {
    const res = await fetch(`${API_BASE}/customers`)
    return res.json()
  },

  updateCustomerKyc: async (id: string, status: string, verifiedDate?: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/customers/${id}/kyc`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, verifiedDate })
    })
    return res.json()
  },

  // Dealers
  getDealers: async (): Promise<Dealer[]> => {
    const res = await fetch(`${API_BASE}/dealers`)
    return res.json()
  },

  addDealer: async (d: Omit<Dealer, 'id'>): Promise<Dealer> => {
    const res = await fetch(`${API_BASE}/dealers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    })
    return res.json()
  },

  toggleDealer: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/dealers/${id}/toggle`, { method: 'PUT' })
    return res.json()
  },

  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    const res = await fetch(`${API_BASE}/vehicles`)
    return res.json()
  },

  addVehicle: async (v: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    })
    return res.json()
  },

  toggleVehicle: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/vehicles/${id}/toggle`, { method: 'PUT' })
    return res.json()
  },

  // Quotations
  getQuotations: async (): Promise<Quotation[]> => {
    const res = await fetch(`${API_BASE}/quotations`)
    return res.json()
  },

  addQuotation: async (q: Omit<Quotation, 'id' | 'status'>): Promise<Quotation> => {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q)
    })
    return res.json()
  },

  // Policy
  getPolicy: async (): Promise<CreditPolicy> => {
    const res = await fetch(`${API_BASE}/policy`)
    return res.json()
  },

  savePolicy: async (p: CreditPolicy): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/policy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    })
    return res.json()
  },

  getPolicyVersions: async (): Promise<PolicyVersionRecord[]> => {
    const res = await fetch(`${API_BASE}/policy-versions`)
    return res.json()
  },

  addPolicyVersion: async (pv: PolicyVersionRecord): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/policy-versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pv)
    })
    return res.json()
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/audit-logs`)
    return res.json()
  },

  addAuditLog: async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    })
    return res.json()
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await fetch(`${API_BASE}/notifications`)
    return res.json()
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' })
    return res.json()
  }
}
