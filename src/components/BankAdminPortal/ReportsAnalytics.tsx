import React from 'react'
import { useApp } from '../../context/AppContext'

export const ReportsAnalytics: React.FC = () => {
  const { applications } = useApp()

  const total = applications.length
  const autoApprovals = applications.filter((a) => a.status === 'approved_in_principle').length
  const autoDeclines = applications.filter((a) => a.status === 'declined').length
  const referrals = applications.filter((a) => a.status === 'referred').length
  const pending = applications.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Risk & Operations Analytics
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Credit Decisioning Performance & Distribution Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical metrics assessing automated appraisal efficacy, turnaround latency, and referral causes.
          </p>
        </div>

        {/* Latency Comparison Card */}
        <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
            Turnaround Time Analysis: Automated Underwriting vs Manual Underwriting
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-slate-500 block">Automated Median Latency</span>
              <span className="font-mono font-bold text-slate-900 text-base">1.2 Minutes</span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">98.4% faster</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-slate-500 block">Automated 95th Percentile</span>
              <span className="font-mono font-bold text-slate-900 text-base">2.8 Minutes</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">With OCR extraction</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-slate-500 block">Manual Officer Turnaround</span>
              <span className="font-mono font-bold text-slate-900 text-base">18.4 Hours</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Queue wait + verification</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-slate-500 block">Bureau Outage Recovery</span>
              <span className="font-mono font-bold text-slate-900 text-base">10.0 Minutes</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Scheduled retry window</span>
            </div>
          </div>
        </div>

        {/* Volume by Product & Make */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="p-4 border border-slate-200 rounded bg-white space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-100 pb-2">
              Decision Funnel Conversion
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Applications Initiated</span>
                <span className="font-mono font-bold text-slate-900">{total} (100%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Identity & Consent Verified (R1)</span>
                <span className="font-mono font-bold text-slate-900">{total} (100%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Credit Bureau Clean & Available (R2)</span>
                <span className="font-mono font-bold text-slate-900">{total - pending} ({total > 0 ? Math.round(((total - pending) / total) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Straight-Through In-Principle Approved</span>
                <span className="font-mono font-bold text-emerald-700">{autoApprovals} ({total > 0 ? Math.round((autoApprovals / total) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Referred to Credit Operations Desk</span>
                <span className="font-mono font-bold text-amber-700">{referrals} ({total > 0 ? Math.round((referrals / total) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Automatic Decline (Confirmed Blacklist)</span>
                <span className="font-mono font-bold text-rose-700">{autoDeclines} ({total > 0 ? Math.round((autoDeclines / total) * 100) : 0}%)</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded bg-white space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-100 pb-2">
              Vehicle Demand Distribution
            </span>
            <div className="space-y-2">
              {['Hyundai Creta', 'Kia Seltos', 'Tata Nexon EV', 'BYD Atto 3', 'Suzuki Grand Vitara'].map((vName) => {
                const count = applications.filter((a) => `${a.quotation.make} ${a.quotation.model}`.includes(vName.split(' ')[0])).length
                return (
                  <div key={vName} className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">{vName}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {count} Application{count === 1 ? '' : 's'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
