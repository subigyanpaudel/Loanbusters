import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export const AdminOverview: React.FC = () => {
  const { applications, setAdminTab } = useApp()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const totalApps = applications.length
  const autoApprovals = applications.filter((a) => a.status === 'approved_in_principle').length
  const autoDeclines = applications.filter((a) => a.status === 'declined').length
  const referrals = applications.filter((a) => a.status === 'referred').length
  const pendingMissingInfo = applications.filter(
    (a) => a.documentRequests.some((r) => !r.resolved)
  ).length
  const pendingServiceOutage = applications.filter((a) => a.bureauStatus === 'outage').length

  const completeDecided = autoApprovals + autoDeclines
  const autoDecisionRate =
    totalApps > 0 ? Math.round((completeDecided / totalApps) * 100) : 0

  // Referral reasons breakdown
  const referralReasonsCount = {
    'R10 Authority Limit (> NPR 2.5M)': applications.filter(
      (a) => a.ruleResults?.R10?.status === 'REFER'
    ).length,
    'R8 Loan-to-Value (> 60%)': applications.filter(
      (a) => a.ruleResults?.R8?.status === 'REFER'
    ).length,
    'R9 Debt-Service Ratio (> 50%)': applications.filter(
      (a) => a.ruleResults?.R9?.status === 'REFER'
    ).length,
    'R1 Outdated / Pending KYC': applications.filter(
      (a) => a.ruleResults?.R1?.status === 'REFER'
    ).length,
    'R4 Incomplete Income Evidence': applications.filter(
      (a) => a.ruleResults?.R4?.status === 'REFER'
    ).length,
    'R2 Ambiguous Identity Match': applications.filter(
      (a) => a.ruleResults?.R2?.status === 'REFER'
    ).length
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Management Dashboard
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Automated Credit Decisioning Operations Overview
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Filter View:</span>
            <select
              aria-label="Filter Applications by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 bg-slate-50 text-slate-800"
            >
              <option value="ALL">All Application Outcomes</option>
              <option value="approved_in_principle">Approved In-Principle</option>
              <option value="referred">Referred for Review</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          All 10 underwriting rules operate deterministically in light mode. Metrics reflect live synchronized application repository.
        </p>
      </div>

      {/* 8 Primary KPI Cards (Explicitly separated per requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Applications */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Applications</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalApps}</div>
          <div className="text-[10px] text-slate-400 mt-1">Live synchronized database</div>
        </div>

        {/* KPI 2: Automated Approvals */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase">Automated Approvals</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{autoApprovals}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {totalApps > 0 ? ((autoApprovals / totalApps) * 100).toFixed(1) : 0}% of total volume
          </div>
        </div>

        {/* KPI 3: Automatic Declines */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-rose-800 uppercase">Automatic Declines</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">{autoDeclines}</div>
          <div className="text-[10px] text-slate-400 mt-1">Confirmed blacklist registry</div>
        </div>

        {/* KPI 4: Referred for Manual Review */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-amber-800 uppercase">Officer Referrals</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{referrals}</div>
          <div className="text-[10px] text-slate-400 mt-1">In officer review work queue</div>
        </div>

        {/* KPI 5: Pending - Missing Info */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-slate-600 uppercase">Pending: Missing Info</div>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-1">{pendingMissingInfo}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting customer document upload</div>
        </div>

        {/* KPI 6: Pending - Service Outage */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-sky-800 uppercase">Pending: Bureau Outage</div>
          <div className="text-2xl font-bold font-mono text-sky-700 mt-1">{pendingServiceOutage}</div>
          <div className="text-[10px] text-slate-400 mt-1">Retry scheduled connection</div>
        </div>

        {/* KPI 7: Average Decision Time */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Avg Automated Decision Time</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">1.2 min</div>
          <div className="text-[10px] text-slate-400 mt-1">Manual turnaround: ~18.4 hrs</div>
        </div>

        {/* KPI 8: Auto Decision Rate */}
        <div className="p-4 bg-white border border-slate-200 rounded">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Straight-Through Rate</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{autoDecisionRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Decided without human intervention</div>
        </div>
      </div>

      {/* Outcome Breakdown & Referral Reasons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Distribution Bar Graph */}
        <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Application Outcome Distribution
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Total {totalApps} Applications</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">In-Principle Approved</span>
                <span className="font-mono text-slate-900 font-bold">
                  {autoApprovals} ({totalApps > 0 ? Math.round((autoApprovals / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5"
                  style={{ width: `${totalApps > 0 ? (autoApprovals / totalApps) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Referred to Officer Review</span>
                <span className="font-mono text-slate-900 font-bold">
                  {referrals} ({totalApps > 0 ? Math.round((referrals / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                <div
                  className="bg-amber-600 h-2.5"
                  style={{ width: `${totalApps > 0 ? (referrals / totalApps) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Automatic Decline (Blacklist Match)</span>
                <span className="font-mono text-slate-900 font-bold">
                  {autoDeclines} ({totalApps > 0 ? Math.round((autoDeclines / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                <div
                  className="bg-rose-600 h-2.5"
                  style={{ width: `${totalApps > 0 ? (autoDeclines / totalApps) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Pending (Service Outage / Info Request)</span>
                <span className="font-mono text-slate-900 font-bold">
                  {pendingServiceOutage + pendingMissingInfo} (
                  {totalApps > 0
                    ? Math.round(((pendingServiceOutage + pendingMissingInfo) / totalApps) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                <div
                  className="bg-sky-600 h-2.5"
                  style={{
                    width: `${
                      totalApps > 0
                        ? ((pendingServiceOutage + pendingMissingInfo) / totalApps) * 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">View detailed application list:</span>
            <button
              onClick={() => setAdminTab('all_apps')}
              className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded hover:bg-slate-200"
            >
              Browse All Applications
            </button>
          </div>
        </div>

        {/* Reasons for Manual Referral */}
        <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Reasons for Manual Officer Referrals
            </h2>
            <button
              onClick={() => setAdminTab('review_queue')}
              className="text-xs font-semibold px-2 py-0.5 text-slate-700 border border-slate-200 rounded hover:bg-slate-50"
            >
              Open Review Queue
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(referralReasonsCount).map(([reason, count]) => (
              <div key={reason} className="py-2.5 flex items-center justify-between">
                <span className="text-slate-700 font-medium">{reason}</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {count} Case{count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            * Note: An application may trigger multiple referral rules. All unresolved exceptions must be evaluated prior to officer decision.
          </p>
        </div>
      </div>
    </div>
  )
}
