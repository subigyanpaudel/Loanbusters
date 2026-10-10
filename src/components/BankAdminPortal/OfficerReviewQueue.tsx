import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Application } from '../../types'
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer'

export const OfficerReviewQueue: React.FC = () => {
  const {
    currentUser,
    applications,
    officerApproveApplication,
    officerDeclineApplication,
    officerRequestInformation,
    officerEscalateApplication,
    officerProposeRevisedTerms
  } = useApp()

  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [activeActionModal, setActiveActionModal] = useState<
    'approve' | 'decline' | 'request_info' | 'revise_terms' | 'escalate' | null
  >(null)
  const [modalTargetApp, setModalTargetApp] = useState<Application | null>(null)

  // Action form inputs
  const [actionNotes, setActionNotes] = useState('')
  const [requestDocName, setRequestDocName] = useState('Tax Clearance Certificate FY 2081/82')
  const [requestReason, setRequestReason] = useState('Required for high-value loan review compliance.')
  const [revisedLoanAmount, setRevisedLoanAmount] = useState<number>(2400000)
  const [revisedTerm, setRevisedTerm] = useState<number>(84)
  const [actionError, setActionError] = useState<string | null>(null)

  const reviewQueue = applications.filter((a) => a.status === 'referred')

  const getPriorityBadge = (app: Application) => {
    if (app.requestedLoanAmount > 2500000 || app.documentRequests.length > 0) {
      return 'bg-rose-50 text-rose-800 border-rose-300'
    }
    return 'bg-amber-50 text-amber-800 border-amber-300'
  }

  const handleApproveSubmit = () => {
    if (!modalTargetApp) return
    setActionError(null)
    const res = officerApproveApplication(modalTargetApp.id, actionNotes || 'Approved within discretionary delegated authority.')
    if (!res.success) {
      setActionError(res.error || 'Approval failed.')
      return
    }
    setActiveActionModal(null)
    setActionNotes('')
  }

  const handleDeclineSubmit = () => {
    if (!modalTargetApp) return
    if (!actionNotes) {
      setActionError('Recorded justification reason is required to decline an application.')
      return
    }
    officerDeclineApplication(modalTargetApp.id, actionNotes)
    setActiveActionModal(null)
    setActionNotes('')
  }

  const handleRequestInfoSubmit = () => {
    if (!modalTargetApp) return
    if (!requestDocName || !requestReason) {
      setActionError('Both document name and justification are required.')
      return
    }
    officerRequestInformation(modalTargetApp.id, requestDocName, requestReason)
    setActiveActionModal(null)
    setRequestDocName('Tax Clearance Certificate FY 2081/82')
    setRequestReason('Required for high-value loan review compliance.')
  }

  const handleEscalateSubmit = () => {
    if (!modalTargetApp) return
    officerEscalateApplication(modalTargetApp.id, actionNotes || 'Escalated to Senior Approver for credit authority sanction.')
    setActiveActionModal(null)
    setActionNotes('')
  }

  const handleReviseTermsSubmit = () => {
    if (!modalTargetApp) return
    officerProposeRevisedTerms(
      modalTargetApp.id,
      revisedLoanAmount,
      revisedTerm,
      actionNotes || 'Adjusted terms to comply with 60% LTV and 50% DSR policy ceiling.'
    )
    setActiveActionModal(null)
    setActionNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Work Queue Header */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Underwriting Work Queue
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Officer Review & Referral Queue ({reviewQueue.length} Active Cases)
            </h1>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-2.5">
            Active Reviewer: <strong>{currentUser.name}</strong> ({currentUser.officerLevel || 'Standard'} Officer) • Authority Limit:{' '}
            <span className="font-mono font-bold text-slate-900">
              Rs. {(currentUser.officerAuthorityLimit || 2500000).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Applications in this queue were flagged by the automated decision engine for manual credit assessment. Standard officers may approve up to their delegated limit (NPR 2,500,000). Higher amounts require Senior Approver escalation.
        </p>

        {/* Queue Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Application ID</th>
                <th className="p-3">Customer Reference</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">Requested Loan</th>
                <th className="p-3">Referral Reason</th>
                <th className="p-3">Triggered Rule IDs</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assigned Officer</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviewQueue.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No referred applications pending officer review.
                  </td>
                </tr>
              ) : (
                reviewQueue.map((app) => {
                  const triggeredRules = (Object.keys(app.ruleResults || {}) as (keyof typeof app.ruleResults)[]).filter(
                    (rId) => app.ruleResults[rId]?.status === 'REFER'
                  )
                  return (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {app.id}
                        {app.version > 1 && (
                          <span className="ml-1 text-[10px] text-slate-500 font-normal">
                            (v{app.version})
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{app.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{app.maskedAccount}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">
                          {app.quotation.make} {app.quotation.model}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Rs. {app.quotation.vehiclePrice.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        Rs. {app.requestedLoanAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 max-w-xs text-slate-700">
                        <div className="truncate" title={app.decisionReason}>
                          {app.decisionReason}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                          {triggeredRules.map((rId) => (
                            <span
                              key={rId}
                              className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded font-semibold"
                            >
                              {rId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPriorityBadge(
                            app
                          )}`}
                        >
                          {app.requestedLoanAmount > 2500000 ? 'HIGH' : 'STANDARD'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {app.assignedOfficerName || 'Bikram Thapa'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-semibold hover:bg-slate-200"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => {
                              setModalTargetApp(app)
                              setActionError(null)
                              setActiveActionModal('approve')
                            }}
                            className="px-2 py-1 bg-emerald-800 text-white rounded font-semibold hover:bg-emerald-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setModalTargetApp(app)
                              setActionError(null)
                              setActiveActionModal('request_info')
                            }}
                            className="px-2 py-1 bg-amber-700 text-white rounded font-semibold hover:bg-amber-800"
                          >
                            Req Info
                          </button>
                          <button
                            onClick={() => {
                              setModalTargetApp(app)
                              setActionError(null)
                              setRevisedLoanAmount(Math.floor((app.quotation.vehiclePrice * 60) / 100))
                              setActiveActionModal('revise_terms')
                            }}
                            className="px-2 py-1 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                          >
                            Revise
                          </button>
                          <button
                            onClick={() => {
                              setModalTargetApp(app)
                              setActionError(null)
                              setActiveActionModal('escalate')
                            }}
                            className="px-2 py-1 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                          >
                            Escalate
                          </button>
                          <button
                            onClick={() => {
                              setModalTargetApp(app)
                              setActionError(null)
                              setActiveActionModal('decline')
                            }}
                            className="px-2 py-1 bg-rose-700 text-white rounded font-semibold hover:bg-rose-800"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modals */}
      {activeActionModal && modalTargetApp && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Officer Action: {activeActionModal.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                [ Cancel ]
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                Application: <strong className="text-slate-900">{modalTargetApp.id}</strong> (Customer: {modalTargetApp.customerName})
              </div>
              <div>
                Requested Loan: <span className="font-mono font-bold">Rs. {modalTargetApp.requestedLoanAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 font-medium">
                {actionError}
              </div>
            )}

            {/* Approve Modal */}
            {activeActionModal === 'approve' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700">
                  You are exercising discretionary credit authority to approve application {modalTargetApp.id}.
                </p>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Approval Notes / Justification:</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Satisfied with verified income track record; exception approved within discretionary authority."
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveSubmit}
                    className="px-4 py-1.5 bg-emerald-800 text-white rounded font-bold hover:bg-emerald-900"
                  >
                    Confirm Approval
                  </button>
                </div>
              </div>
            )}

            {/* Decline Modal */}
            {activeActionModal === 'decline' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700">
                  Enter official decline justification. This decision will be archived and communicated in accordance with disclosure policy.
                </p>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Decline Reason (Mandatory):</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Affordability criteria unsatisfied; debt commitments exceed acceptable bank risk profile."
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeclineSubmit}
                    className="px-4 py-1.5 bg-rose-700 text-white rounded font-bold hover:bg-rose-800"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            )}

            {/* Request Info Modal */}
            {activeActionModal === 'request_info' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700">
                  Targeted document request will notify customer to upload evidence before revalidation.
                </p>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Document Name:</label>
                  <input
                    type="text"
                    value={requestDocName}
                    onChange={(e) => setRequestDocName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Request:</label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestInfoSubmit}
                    className="px-4 py-1.5 bg-amber-800 text-white rounded font-bold hover:bg-amber-900"
                  >
                    Send Request to Customer
                  </button>
                </div>
              </div>
            )}

            {/* Escalate Modal */}
            {activeActionModal === 'escalate' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700">
                  Escalate this case to Senior Approver <strong>Pooja Karki</strong> (Delegated Limit: NPR 5,000,000).
                </p>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Escalation Notes:</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Loan amount NPR 2,600,000 exceeds standard officer threshold; submitted for senior executive concurrence."
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEscalateSubmit}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                  >
                    Confirm Escalation
                  </button>
                </div>
              </div>
            )}

            {/* Revise Terms Modal */}
            {activeActionModal === 'revise_terms' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700">
                  Propose adjusted loan terms to bring LTV or DSR within policy limits.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Revised Loan Amount (NPR):</label>
                    <input
                      type="number"
                      value={revisedLoanAmount}
                      onChange={(e) => setRevisedLoanAmount(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Revised Term (Months):</label>
                    <input
                      type="number"
                      value={revisedTerm}
                      onChange={(e) => setRevisedTerm(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Notes to Applicant:</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Proposing loan adjusted to 60% LTV to enable preliminary sanction."
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviseTermsSubmit}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                  >
                    Submit Revised Terms
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dossier Drawer */}
      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  )
}
