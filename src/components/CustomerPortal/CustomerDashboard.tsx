import React from 'react'
import { useApp } from '../../context/AppContext'
import { Application } from '../../types'

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    customers,
    applications,
    setCustomerTab,
    setSelectedApplicationId,
    retryBureauCheck
  } = useApp()

  const customerProfile = customers[currentUser.id] || customers['USR-CUST-001']
  const userApplications = applications.filter((a) => a.customerId === customerProfile.id)
  const activeApp = userApplications.find(
    (a) => !['declined'].includes(a.status)
  ) || userApplications[0]

  const stageLabels = [
    '1. Quotation Confirmed',
    '2. Consent & Verification',
    '3. Credit Appraisal',
    '4. Officer Review / Auto Decision',
    '5. Decision Communicated'
  ]

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'approved_in_principle':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'declined':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'referred':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'pending':
        return 'bg-sky-50 text-sky-800 border-sky-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Customer Header Card */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customer Portal Dashboard
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Welcome back, {customerProfile.fullName}
            </h1>
            <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-600 font-mono">
              <span>Account: {customerProfile.maskedAccount}</span>
              <span className="text-slate-300">•</span>
              <span>KYC Status: <strong className="uppercase">{customerProfile.kycStatus}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Citizenship: {customerProfile.citizenNumber}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCustomerTab('new_application')}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Start New Auto Loan Application
            </button>
            <button
              onClick={() => setCustomerTab('my_applications')}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              My Applications ({userApplications.length})
            </button>
          </div>
        </div>
      </div>

      {/* Active Application Card */}
      {activeApp ? (
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Active Application
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {activeApp.id}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                    activeApp.status
                  )}`}
                >
                  {formatStatus(activeApp.status)}
                </span>
                {activeApp.version > 1 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                    Version {activeApp.version}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Submitted on {new Date(activeApp.createdAt).toLocaleDateString()} • Vehicle:{' '}
                <strong className="text-slate-800">
                  {activeApp.quotation.make} {activeApp.quotation.model} ({activeApp.quotation.variant})
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedApplicationId(activeApp.id)
                setCustomerTab('application_detail')
              }}
              className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 text-slate-800"
            >
              View Application Details
            </button>
          </div>

          {/* 5-Stage Progress Tracker */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Application Progress Tracker
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {stageLabels.map((lbl, idx) => {
                const stageNum = idx + 1
                const isPassed = activeApp.stage > stageNum
                const isCurrent = activeApp.stage === stageNum
                return (
                  <div
                    key={stageNum}
                    className={`p-3 rounded border text-xs ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white font-medium'
                        : isPassed
                        ? 'border-slate-300 bg-slate-50 text-slate-800 font-medium'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      {isCurrent ? 'Current Stage' : isPassed ? 'Completed' : 'Pending'}
                    </div>
                    <div className="mt-1 font-semibold leading-tight">{lbl}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Key Loan Financial Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Vehicle Price</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                Rs. {activeApp.quotation.vehiclePrice.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">Dealer: {activeApp.quotation.dealerName}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Requested Loan</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                Rs. {activeApp.requestedLoanAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">Down Payment: Rs. {activeApp.downPayment.toLocaleString('en-IN')}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Estimated Monthly EMI</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                Rs. {activeApp.emiMonthly.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">
                Term: {activeApp.loanTermMonths} Months @ {activeApp.interestRateAnnual}%
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">LTV & DSR Ratios</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                LTV: {activeApp.ltvPercent.toFixed(1)}% | DSR: {activeApp.debtServiceRatioPercent.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500">Automated Caps: 60% / 50%</div>
            </div>
          </div>

          {/* Outstanding Customer Actions / Bureau Outage Alert */}
          {activeApp.documentRequests.some((r) => !r.resolved) && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 space-y-2">
              <div className="font-semibold uppercase tracking-wider text-[11px] text-amber-800">
                Action Required: Outstanding Document Request
              </div>
              <div className="space-y-1">
                {activeApp.documentRequests
                  .filter((r) => !r.resolved)
                  .map((req) => (
                    <div key={req.id} className="flex items-center justify-between">
                      <div>
                        <strong>{req.documentName}</strong>: {req.reason}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedApplicationId(activeApp.id)
                          setCustomerTab('application_detail')
                        }}
                        className="px-2.5 py-1 bg-amber-800 text-white rounded text-[11px] font-medium hover:bg-amber-900"
                      >
                        Upload Document
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeApp.bureauStatus === 'outage' && (
            <div className="p-4 bg-sky-50 border border-sky-300 rounded text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="uppercase font-semibold text-[11px]">Credit Bureau Service Interruption</strong>
                <p className="mt-0.5 text-slate-600">
                  External Credit Information Bureau is undergoing maintenance. Application is held in PENDING status.
                </p>
              </div>
              <button
                onClick={() => retryBureauCheck(activeApp.id)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 whitespace-nowrap"
              >
                Simulate Bureau Retry Connection
              </button>
            </div>
          )}

          {/* In-Principle Approval Summary */}
          {activeApp.status === 'approved_in_principle' && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-emerald-900">
                  In-Principle Auto Loan Approval Granted
                </span>
                <span className="font-mono text-emerald-800">
                  Valid Until: {activeApp.approvalExpiryDate || '30 Days'}
                </span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Congratulations! Preliminary approval has been granted for Rs.{' '}
                {activeApp.requestedLoanAmount.toLocaleString('en-IN')} for {activeApp.quotation.make}{' '}
                {activeApp.quotation.model}. This preliminary decision is valid for 30 calendar days.
              </p>
              <div className="pt-1 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedApplicationId(activeApp.id)
                    setCustomerTab('application_detail')
                  }}
                  className="px-3 py-1 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
                >
                  View Official Approval Letter & Conditions
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded p-8 text-center space-y-4">
          <h2 className="text-base font-semibold text-slate-900">No Active Loan Applications</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have any active auto loan applications. Start a new digital application to receive an instant preliminary credit appraisal.
          </p>
          <button
            onClick={() => setCustomerTab('new_application')}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
          >
            Start New Auto Loan Application
          </button>
        </div>
      )}

      {/* Demo Guidance Notice */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Demonstration Notice:</span> All calculations, bureau evaluations, and KYC validations are simulated in accordance with the Business Requirements Document. Displayed financial amounts are in Nepalese Rupees (NPR / Rs.).
      </div>
    </div>
  )
}
