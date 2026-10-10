import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export const CreditRulesSettings: React.FC = () => {
  const {
    policy,
    policyVersions,
    currentUser,
    proposePolicyChange,
    approvePolicyChange,
    rejectPolicyChange
  } = useApp()

  const [isEditing, setIsEditing] = useState(false)
  const [minAge, setMinAge] = useState(policy.minAge)
  const [maxAgeFinalInstalment, setMaxAgeFinalInstalment] = useState(policy.maxAgeFinalInstalment)
  const [minTermMonths, setMinTermMonths] = useState(policy.minTermMonths)
  const [maxTermMonths, setMaxTermMonths] = useState(policy.maxTermMonths)
  const [maxAutomatedLtvPercent, setMaxAutomatedLtvPercent] = useState(policy.maxAutomatedLtvPercent)
  const [maxAutomatedDsrPercent, setMaxAutomatedDsrPercent] = useState(policy.maxAutomatedDsrPercent)
  const [maxAutomatedLoanAmount, setMaxAutomatedLoanAmount] = useState(policy.maxAutomatedLoanAmount)
  const [approvedAnnualInterestRate, setApprovedAnnualInterestRate] = useState(
    policy.approvedAnnualInterestRate
  )
  const [approvalValidityDays, setApprovalValidityDays] = useState(policy.approvalValidityDays)
  const [justification, setJustification] = useState('')

  const [approvalNotes, setApprovalNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!justification) {
      setErrorMessage('A detailed policy justification is required to submit a credit policy change.')
      return
    }

    proposePolicyChange(
      {
        minAge,
        maxAgeFinalInstalment,
        minTermMonths,
        maxTermMonths,
        maxAutomatedLtvPercent,
        maxAutomatedDsrPercent,
        maxAutomatedLoanAmount,
        approvedAnnualInterestRate,
        approvalValidityDays
      },
      justification
    )

    setIsEditing(false)
    setJustification('')
    setSuccessMessage('Policy proposal submitted successfully. Pending Maker-Checker sign-off.')
  }

  const handleApprove = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    const res = approvePolicyChange(approvalNotes || 'Approved by Risk & Compliance Checker.')
    if (!res.success) {
      setErrorMessage(res.error || 'Dual approval failed.')
      return
    }
    setApprovalNotes('')
    setSuccessMessage('Dual-authorisation confirmed! New immutable credit policy version activated.')
  }

  const handleReject = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    rejectPolicyChange(approvalNotes || 'Rejected during Checker evaluation.')
    setApprovalNotes('')
    setSuccessMessage('Policy modification proposal rejected.')
  }

  return (
    <div className="space-y-6">
      {/* Header & Policy Version */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Governance & Dual-Authorisation Policy Engine
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Automated Credit Rules & Policy Settings
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200 font-bold">
              Active Version: {policy.version}
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Propose Policy Modification (Maker)
              </button>
            )}
          </div>
        </div>

        {/* Regulatory Governance Warning */}
        <div className="p-4 bg-amber-50/70 border border-amber-300 rounded text-xs text-amber-950 mt-4 leading-relaxed space-y-1">
          <div className="font-bold uppercase tracking-wider text-amber-900">
            Regulatory Notice: Proposed Demonstration Policy Parameters
          </div>
          <p>
            The thresholds below are <strong>proposed policies for university demonstration</strong>, subject to formal Credit Risk Committee and Nepal Rastra Bank regulatory approval prior to real-world deployment. Every parameter alteration enforces strict <strong>Maker-Checker Dual Authorisation</strong>; self-approval by a single user is prohibited.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 font-medium mt-4">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 font-medium mt-4">
            {successMessage}
          </div>
        )}

        {/* Pending Dual Approval Proposal Banner */}
        {policy.proposedChanges && (
          <div className="p-5 bg-sky-50/60 border border-sky-300 rounded text-xs text-sky-950 mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200 pb-2">
              <span className="font-bold text-sky-900 uppercase tracking-wide">
                Pending Dual-Authorisation Request (Maker-Checker Workflow)
              </span>
              <span className="font-mono text-[11px] text-sky-800">
                Proposed by: {policy.proposedChanges.proposerName} on{' '}
                {new Date(policy.proposedChanges.proposedTimestamp).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-1 text-slate-800">
              <div>
                <strong>Justification:</strong> {policy.proposedChanges.justification}
              </div>
              <div className="text-[11px] text-slate-600 font-mono pt-1">
                Proposed Modifications:{' '}
                {JSON.stringify(policy.proposedChanges.changes)}
              </div>
            </div>

            <div className="pt-2 border-t border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Checker evaluation notes or rejection rationale..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-sky-300 rounded bg-white"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 bg-rose-700 text-white rounded font-semibold hover:bg-rose-800"
                >
                  Reject Proposal
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded font-bold hover:bg-emerald-900"
                >
                  Approve Proposal (Checker)
                </button>
              </div>
            </div>
            <div className="text-[10px] text-sky-800 italic">
              * Segregation of duties: If current user ({currentUser.name}) is the Maker ({policy.proposedChanges.proposerName}), approval will be blocked. Switch to Admin Sanjay Shrestha or a second administrator to approve.
            </div>
          </div>
        )}

        {/* Policy Configuration Form / Card */}
        {isEditing ? (
          <form onSubmit={handleProposeSubmit} className="mt-6 space-y-4 border-t border-slate-100 pt-4 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wide">
              Step 1: Enter Proposed Parameter Values
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Minimum Applicant Age:</label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Proposed baseline: 21 years</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Age at Final Instalment:</label>
                <input
                  type="number"
                  value={maxAgeFinalInstalment}
                  onChange={(e) => setMaxAgeFinalInstalment(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Proposed ceiling: 65 years</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Automated LTV (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxAutomatedLtvPercent}
                  onChange={(e) => setMaxAutomatedLtvPercent(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Proposed limit: 60.00%</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Automated DSR (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxAutomatedDsrPercent}
                  onChange={(e) => setMaxAutomatedDsrPercent(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Proposed ceiling: 50.00%</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Automated Loan Amount (NPR):</label>
                <input
                  type="number"
                  step="50000"
                  value={maxAutomatedLoanAmount}
                  onChange={(e) => setMaxAutomatedLoanAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Proposed ceiling: Rs. 2,500,000</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Annual Interest Rate (%):</label>
                <input
                  type="number"
                  step="0.25"
                  value={approvedAnnualInterestRate}
                  onChange={(e) => setApprovedAnnualInterestRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Standard rate: 10.00% p.a.</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Min Repayment Tenor (Months):</label>
                <input
                  type="number"
                  value={minTermMonths}
                  onChange={(e) => setMinTermMonths(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Policy minimum: 12 months</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Repayment Tenor (Months):</label>
                <input
                  type="number"
                  value={maxTermMonths}
                  onChange={(e) => setMaxTermMonths(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Policy maximum: 84 months</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Approval Validity (Days):</label>
                <input
                  type="number"
                  value={approvalValidityDays}
                  onChange={(e) => setApprovalValidityDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
                <span className="text-[10px] text-slate-400">Proposed standard: 30 days</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Formal Justification Rationale (Mandatory for Maker):
              </label>
              <textarea
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Detail business reason, risk calibration basis, or regulatory directive behind proposed change..."
                rows={3}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
              >
                Submit Proposal to Checker
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Min Applicant Age</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.minAge} Years</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Max Age at Maturity</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.maxAgeFinalInstalment} Years</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Max Automated LTV</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.maxAutomatedLtvPercent.toFixed(2)}%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Max Automated DSR</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.maxAutomatedDsrPercent.toFixed(2)}%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Max Automated Loan</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                Rs. {policy.maxAutomatedLoanAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Annual Interest Rate</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.approvedAnnualInterestRate.toFixed(2)}% p.a.</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Tenor Range</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.minTermMonths} - {policy.maxTermMonths} Months</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Approval Validity</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{policy.approvalValidityDays} Days</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Credit Bureau Filter</span>
              <span className="font-mono font-bold text-slate-900 text-sm">0 Overdue, &le; 30d</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Blacklist Check</span>
              <span className="font-mono font-bold text-rose-700 text-sm">Auto-Decline</span>
            </div>
          </div>
        )}
      </div>

      {/* Immutable Version Archive */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Audit & Compliance Log
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Immutable Policy Version History ({policyVersions.length} Historic Records)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historical assessments remain permanently tied to their applicable policy version. Modifying rules never retrospectively alters past decisions.
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden text-xs">
          {policyVersions.map((pv) => (
            <div key={pv.id} className="p-4 bg-white hover:bg-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{pv.version}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded uppercase">
                    Dual-Authorised
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Approved on: {new Date(pv.approvedDate).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-2 text-slate-700">
                <strong>Signatures:</strong> Proposed by <strong>{pv.proposerName}</strong> • Approved by <strong>{pv.approverName}</strong>
              </div>

              <div className="mt-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                <strong>Governance Justification:</strong> {pv.justification}
              </div>

              <div className="mt-2 text-[10px] text-slate-400 font-mono flex flex-wrap gap-3">
                <span>LTV Cap: {pv.policySnapshot.maxAutomatedLtvPercent}%</span>
                <span>•</span>
                <span>DSR Cap: {pv.policySnapshot.maxAutomatedDsrPercent}%</span>
                <span>•</span>
                <span>Max Auto Loan: Rs. {pv.policySnapshot.maxAutomatedLoanAmount.toLocaleString('en-IN')}</span>
                <span>•</span>
                <span>Interest: {pv.policySnapshot.approvedAnnualInterestRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
