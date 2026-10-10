import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ApprovalLetterModal } from './ApprovalLetterModal'

export const CustomerApplicationDetail: React.FC = () => {
  const {
    applications,
    selectedApplicationId,
    setCustomerTab,
    customerUploadDocument,
    retryBureauCheck
  } = useApp()

  const [showApprovalLetter, setShowApprovalLetter] = useState(false)
  const [uploadDocName, setUploadDocName] = useState('Tax_Clearance_2081_82.pdf')
  const [uploadNotes, setUploadNotes] = useState('')
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const application =
    applications.find((a) => a.id === selectedApplicationId) || applications[0]

  if (!application) {
    return (
      <div className="bg-white p-8 border border-slate-200 rounded text-center">
        <p className="text-xs text-slate-500">No application selected.</p>
        <button
          onClick={() => setCustomerTab('my_applications')}
          className="mt-3 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Return to My Applications
        </button>
      </div>
    )
  }

  const stageLabels = [
    '1. Quotation Confirmed',
    '2. Consent & Verification',
    '3. Credit Appraisal',
    '4. Officer Review / Auto Decision',
    '5. Decision Communicated'
  ]

  const getStatusBadge = (status: string) => {
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

  const pendingRequests = application.documentRequests.filter((r) => !r.resolved)

  const handleUploadSubmit = () => {
    customerUploadDocument(
      application.id,
      uploadDocName,
      'tax_clearance',
      uploadNotes || 'Submitted by applicant via Customer Portal'
    )
    setShowUploadModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Application Reference</span>
              <span className="font-mono text-base font-bold text-slate-900">{application.id}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                  application.status
                )}`}
              >
                {application.status.replace(/_/g, ' ')}
              </span>
              {application.version > 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  Version {application.version}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Vehicle: <strong>{application.quotation.make} {application.quotation.model} ({application.quotation.variant})</strong> • Submitted: {new Date(application.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {application.status === 'approved_in_principle' && (
              <button
                onClick={() => setShowApprovalLetter(true)}
                className="px-3.5 py-1.5 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900"
              >
                View Approval Letter
              </button>
            )}
            <button
              onClick={() => setCustomerTab('my_applications')}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* 5-Stage Tracker */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Workflow Stage Status
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {stageLabels.map((lbl, idx) => {
              const stageNum = idx + 1
              const isPassed = application.stage > stageNum
              const isCurrent = application.stage === stageNum
              return (
                <div
                  key={stageNum}
                  className={`p-2.5 rounded border text-xs ${
                    isCurrent
                      ? 'border-slate-900 bg-slate-900 text-white font-medium'
                      : isPassed
                      ? 'border-slate-300 bg-slate-50 text-slate-800 font-medium'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  <div className="text-[10px] uppercase opacity-75">Stage {stageNum}</div>
                  <div className="mt-0.5 truncate">{lbl.split('. ')[1]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Decision Summary Banner */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Latest Decision & Appraisal Remarks
        </div>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded">
          {application.decisionReason || 'Automated credit appraisal completed.'}
        </p>

        {application.approvalExpiryDate && (
          <div className="flex items-center space-x-2 text-xs text-emerald-800 font-medium">
            <span>Approval Validity:</span>
            <span className="font-mono font-bold">Valid for 30 calendar days until {application.approvalExpiryDate}</span>
          </div>
        )}

        {application.bureauStatus === 'outage' && (
          <div className="p-4 bg-sky-50 border border-sky-300 rounded text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="uppercase">Credit Bureau Temporary Outage</strong>
              <p className="mt-0.5 text-slate-600">
                Automated check paused. Simulated connection retry can be triggered manually.
              </p>
            </div>
            <button
              onClick={() => retryBureauCheck(application.id)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              Simulate Bureau Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Outstanding Document Requests Action Box */}
      {pendingRequests.length > 0 && (
        <div className="bg-white border border-amber-300 rounded p-6 space-y-4 bg-amber-50/20">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Action Required: Outstanding Information Requests ({pendingRequests.length})
            </span>
            <span className="text-[11px] text-amber-700">Requested by Credit Operations</span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-white border border-amber-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{req.documentName}</div>
                  <div className="text-slate-600 mt-0.5">
                    <strong>Reason:</strong> {req.reason}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Requested on {new Date(req.requestDate).toLocaleDateString()} by {req.requestedBy}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedReqId(req.id)
                    setUploadDocName(`${req.documentName.replace(/\s+/g, '_')}_Uploaded.pdf`)
                    setShowUploadModal(true)
                  }}
                  className="px-3 py-1.5 bg-amber-800 text-white rounded text-xs font-semibold hover:bg-amber-900 self-start sm:self-auto"
                >
                  Upload Requested Document
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Details Grid */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Financial & Underwriting Calculation Summary
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Eligible Vehicle Price</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              Rs. {application.quotation.vehiclePrice.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Requested Loan</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              Rs. {application.requestedLoanAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Down Payment</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              Rs. {application.downPayment.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Monthly EMI</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              Rs. {application.emiMonthly.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Loan-to-Value (LTV)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {application.ltvPercent.toFixed(2)}%
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Debt-Service Ratio (DSR)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {application.debtServiceRatioPercent.toFixed(2)}%
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Repayment Term</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {application.loanTermMonths} Months
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Annual Interest Rate</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {application.interestRateAnnual.toFixed(2)}% p.a.
            </span>
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Submitted Application Documents ({application.documents.length})
        </div>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden">
          {application.documents.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 text-center">No documents uploaded.</div>
          ) : (
            application.documents.map((doc) => (
              <div key={doc.id} className="p-3 flex items-center justify-between text-xs bg-white">
                <div>
                  <div className="font-semibold text-slate-900">{doc.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Type: {doc.type} • Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 uppercase">
                  {doc.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Timeline of Events */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Application Audit Timeline ({application.timeline.length} Events)
        </div>
        <div className="border-l-2 border-slate-200 pl-4 space-y-4 ml-2">
          {application.timeline.map((evt, idx) => (
            <div key={idx} className="relative text-xs">
              <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-900"></div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{evt.action}</span>
                <span className="text-slate-400 text-[11px] font-mono">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                  {evt.actor} ({evt.role})
                </span>
              </div>
              <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">{evt.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase">
                Simulated Document Upload & Revalidation
              </h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                [ Close ]
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Provide simulated document filename and optional notes. Submitting resolves the pending document request and triggers automatic revalidation.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document File Name:</label>
                <input
                  type="text"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Submission Notes:</label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Attached certified copy from Inland Revenue Department"
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Submit Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Letter Modal */}
      {showApprovalLetter && (
        <ApprovalLetterModal
          application={application}
          onClose={() => setShowApprovalLetter(false)}
        />
      )}
    </div>
  )
}
