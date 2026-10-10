import React, { useState } from 'react'
import { Application, RuleId } from '../../types'
import { useApp } from '../../context/AppContext'

interface Props {
  application: Application
  onClose: () => void
}

type TabType =
  | 'overview'
  | 'kyc'
  | 'income'
  | 'bureau'
  | 'calculations'
  | 'rules'
  | 'history'
  | 'audit'

export const ApplicationDetailDrawer: React.FC<Props> = ({ application, onClose }) => {
  const { customers } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [maskSensitiveData, setMaskSensitiveData] = useState<boolean>(true)

  const customer = customers[application.customerId]

  const ruleList: RuleId[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10']

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'FAIL':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'REFER':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'PENDING':
        return 'bg-sky-50 text-sky-800 border-sky-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const maskString = (val: string) => {
    if (!maskSensitiveData) return val
    if (val.length <= 4) return '****'
    return val.slice(0, 2) + '****' + val.slice(-2)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/30 flex justify-end z-50">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Application Dossier</span>
              <span className="font-mono text-sm font-bold text-slate-900">{application.id}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded border uppercase bg-slate-100 text-slate-800">
                {application.status.replace(/_/g, ' ')}
              </span>
              {application.version > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                  Version {application.version}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Customer: <strong>{maskSensitiveData ? maskString(application.customerName) : application.customerName}</strong> ({application.maskedAccount}) • Vehicle: {application.quotation.make} {application.quotation.model}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMaskSensitiveData(!maskSensitiveData)}
              className="text-xs px-2.5 py-1 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 font-medium"
            >
              Privacy Masking: {maskSensitiveData ? 'Enabled' : 'Disabled'}
            </button>
            <button
              onClick={onClose}
              className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded hover:bg-slate-800"
            >
              [ Close ]
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'kyc', label: '2. Customer & KYC' },
            { id: 'income', label: '3. Income Evidence' },
            { id: 'bureau', label: '4. Credit Bureau' },
            { id: 'calculations', label: '5. Calculations' },
            { id: 'rules', label: '6. Rule Results' },
            { id: 'history', label: '7. Notes & Versions' },
            { id: 'audit', label: '8. Audit Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900 font-bold bg-slate-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Primary Decision Status
                </span>
                <div className="text-base font-bold text-slate-900 uppercase">
                  {application.status.replace(/_/g, ' ')}
                </div>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {application.decisionReason || 'Underwriting appraisal active.'}
                </p>
                {application.approvalExpiryDate && (
                  <div className="mt-2 text-emerald-800 font-semibold font-mono">
                    Approval valid for 30 calendar days until {application.approvalExpiryDate}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border border-slate-200 rounded bg-white">
                  <span className="text-slate-500 block">Vehicle Quoted Price</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rs. {application.quotation.vehiclePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 border border-slate-200 rounded bg-white">
                  <span className="text-slate-500 block">Requested Loan</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rs. {application.requestedLoanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 border border-slate-200 rounded bg-white">
                  <span className="text-slate-500 block">Monthly EMI</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rs. {application.emiMonthly.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 border border-slate-200 rounded bg-white">
                  <span className="text-slate-500 block">LTV / DSR Ratios</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {application.ltvPercent.toFixed(1)}% / {application.debtServiceRatioPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded p-4 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Vehicle Quotation Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    Make & Model: <strong>{application.quotation.make} {application.quotation.model}</strong>
                  </div>
                  <div>Variant: <strong>{application.quotation.variant}</strong></div>
                  <div>Dealer Name: <strong>{application.quotation.dealerName}</strong></div>
                  <div>Quotation Expiry: <span className="font-mono">{application.quotation.expiryDate}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Customer and KYC */}
          {activeTab === 'kyc' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 border border-slate-200 rounded bg-white space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wide">
                  Customer Master Profile & Identity Records
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Full Name:</span>
                    <strong className="text-slate-900">
                      {maskSensitiveData ? maskString(customer?.fullName || application.customerName) : (customer?.fullName || application.customerName)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Bank Account:</span>
                    <span className="font-mono font-semibold">{application.maskedAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Citizenship ID:</span>
                    <span className="font-mono">
                      {maskSensitiveData ? maskString(customer?.citizenNumber || '27-01-78-04921') : (customer?.citizenNumber || '27-01-78-04921')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Birth & Age:</span>
                    <span>{customer?.dateOfBirth} ({customer?.age} years)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">KYC Status:</span>
                    <span className="uppercase font-semibold text-emerald-800">{customer?.kycStatus || 'verified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">KYC Verification Date:</span>
                    <span className="font-mono">{customer?.kycVerifiedDate || '2026-03-15'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide">
                  Consent Verification Record (Rule R1)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Consent Status: <strong className="text-emerald-700">Recorded & Valid</strong></div>
                  <div>Consent Version: <span className="font-mono">{customer?.consentVersion || 'v2.1-2026'}</span></div>
                  <div>Timestamp: <span className="font-mono">{customer?.consentTimestamp || '2026-10-05T09:12:00Z'}</span></div>
                  <div>Legal Basis: <span>Retail Lending Bureau Inquiries Regulation</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Income Evidence */}
          {activeTab === 'income' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 uppercase tracking-wide">
                  Six-Month Salary Banking Transactions (Rule R4)
                </span>
                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  Verified Salary Credits
                </span>
              </div>

              <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Period</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Net Credit</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(customer?.salaryHistoryMonths || [122000, 122000, 122000, 122000, 122000, 122000]).map((amt, i) => (
                    <tr key={i}>
                      <td className="p-2 text-slate-700 font-sans">Month {6 - i}</td>
                      <td className="p-2 text-slate-600 font-sans">SALARY CR - REGULAR DEPOSIT</td>
                      <td className="p-2 font-bold text-slate-900">Rs. {amt.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-emerald-700 font-sans font-medium">Reconciled CBS</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Verified Monthly Gross Income</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    Rs. {application.verifiedMonthlyGrossIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Existing Monthly Debt Obligations</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    Rs. {application.existingMonthlyDebt.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Credit Bureau */}
          {activeTab === 'bureau' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 border border-slate-200 rounded bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    Credit Information Bureau (CIB) Report
                  </span>
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    Bureau Status: {application.bureauStatus.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Credit Bureau Score:</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {customer?.creditHistorySummary?.creditBureauScore || 785} / 900
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Overdue Balance:</span>
                    <span className="font-mono font-bold text-slate-900">
                      Rs. {(customer?.creditHistorySummary?.overdueBalance || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Max Days Late (12m):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {customer?.creditHistorySummary?.maxDaysLate12m || 0} Days (Limit &le; 30d)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Blacklist Status:</span>
                    <span className="uppercase font-bold text-slate-900">
                      {customer?.blacklistStatus || 'clean'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Identity Match Confidence:</span>
                    <span className="font-mono text-emerald-700 font-bold">100% Match (Exact)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Report Retrieved Timestamp:</span>
                    <span className="font-mono">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Calculations */}
          {activeTab === 'calculations' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 border border-slate-200 rounded bg-slate-50 space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wide block">
                  Reducing-Balance EMI Formula Specification
                </span>
                <div className="p-3 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">
                  EMI = P &times; r &times; (1 + r)^n / ((1 + r)^n &minus; 1)<br />
                  P = {application.requestedLoanAmount} | r = {(application.interestRateAnnual / 12 / 100).toFixed(6)} (10.0% p.a.) | n = {application.loanTermMonths} instalments<br />
                  Computed Monthly EMI = Rs. {application.emiMonthly.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded bg-white space-y-1">
                  <span className="font-bold text-slate-900 uppercase tracking-wide block">
                    Loan-to-Value (LTV) Formula
                  </span>
                  <div className="text-[11px] text-slate-600 font-mono">
                    LTV = (Requested Loan / Vehicle Value) &times; 100<br />
                    LTV = ({application.requestedLoanAmount} / {application.quotation.vehiclePrice}) &times; 100<br />
                    = <strong>{application.ltvPercent.toFixed(2)}%</strong> (Automated Limit: 60.00%)
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded bg-white space-y-1">
                  <span className="font-bold text-slate-900 uppercase tracking-wide block">
                    Debt-Service Ratio (DSR) Formula
                  </span>
                  <div className="text-[11px] text-slate-600 font-mono">
                    DSR = ((Debt + EMI) / Gross Income) &times; 100<br />
                    DSR = (({application.existingMonthlyDebt} + {application.emiMonthly}) / {application.verifiedMonthlyGrossIncome}) &times; 100<br />
                    = <strong>{application.debtServiceRatioPercent.toFixed(2)}%</strong> (Automated Limit: 50.00%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Rule Results (10 Rules) */}
          {activeTab === 'rules' && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wide">
                  Ten-Rule Deterministic Evaluation Results
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Engine Version: v1.4-PROPOSED-DEMO
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden">
                {ruleList.map((ruleId) => {
                  const rule = application.ruleResults[ruleId]
                  if (!rule) return null
                  return (
                    <div key={ruleId} className="p-3 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{rule.ruleId}</span>
                          <span className="text-slate-800 font-semibold">{rule.ruleName}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                            rule.status
                          )}`}
                        >
                          {rule.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{rule.details}</p>
                      <div className="mt-1.5 flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                        <span>Actual: <strong className="text-slate-800">{rule.actualValue}</strong></span>
                        <span>•</span>
                        <span>Threshold: <strong className="text-slate-800">{rule.thresholdValue}</strong></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab 7: Notes & Version History */}
          {activeTab === 'history' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide block">
                  Officer Internal Notes ({application.officerNotes.length})
                </span>
                {application.officerNotes.length === 0 ? (
                  <p className="text-slate-400 p-3 bg-slate-50 border border-slate-200 rounded">
                    No officer internal notes recorded.
                  </p>
                ) : (
                  application.officerNotes.map((note) => (
                    <div key={note.id} className="p-3 border border-slate-200 rounded bg-white">
                      <div className="flex justify-between text-[11px]">
                        <strong>{note.officerName}</strong>
                        <span className="text-slate-400 font-mono">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700">{note.note}</p>
                    </div>
                  ))
                )}
              </div>

              {application.previousVersions && application.previousVersions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 uppercase tracking-wide block">
                    Prior Assessment Version Archive
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded">
                    {application.previousVersions.map((v, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 text-[11px] flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900">Version {v.version}</strong> • Status: {v.status} • Loan: Rs. {v.loanAmount.toLocaleString('en-IN')}
                          <div className="text-slate-500">Reason: {v.reason}</div>
                        </div>
                        <span className="font-mono text-slate-400">{new Date(v.evaluatedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 8: Audit Log */}
          {activeTab === 'audit' && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wide block">
                Chronological Application Audit Log ({application.timeline.length} Events)
              </span>
              <div className="border border-slate-200 rounded divide-y divide-slate-100 font-mono text-[11px]">
                {application.timeline.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between items-start bg-white">
                    <div>
                      <div className="font-bold text-slate-900 font-sans">{item.action}</div>
                      <div className="text-slate-600 font-sans mt-0.5">{item.details}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Actor: {item.actor} ({item.role})
                      </div>
                    </div>
                    <span className="text-slate-400 text-[10px] whitespace-nowrap ml-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
