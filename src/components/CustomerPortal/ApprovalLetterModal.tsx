import React from 'react'
import { Application } from '../../types'

interface Props {
  application: Application
  onClose: () => void
}

export const ApprovalLetterModal: React.FC<Props> = ({ application, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded max-w-2xl w-full p-8 shadow-2xl relative space-y-6 my-8">
        {/* Header with Bank Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-500">
              RETAIL BANKING CREDIT DIVISION
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              LOAN RANGERS BANKING CORPORATION NEPAL
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Central Operations Office, Durbar Marg, Kathmandu, Nepal
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
          >
            [ Close ]
          </button>
        </div>

        {/* Title */}
        <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded">
          <div className="text-xs font-mono text-slate-500 uppercase">
            REF NO: {application.id} • DATED: {application.decisionDate ? new Date(application.decisionDate).toLocaleDateString() : new Date().toLocaleDateString()}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 uppercase tracking-wide">
            Preliminary In-Principle Auto Loan Approval Letter
          </h3>
        </div>

        {/* Body content */}
        <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
          <p>
            Dear <strong>{application.customerName}</strong> (Account Ref: {application.maskedAccount}),
          </p>
          <p>
            We are pleased to inform you that following your digital application and automated credit appraisal under our Retail Credit Guidelines, your auto-loan request has received <strong>Preliminary In-Principle Approval</strong> subject to the terms and stipulations outlined herein.
          </p>
        </div>

        {/* Sanctioned Terms Table */}
        <div className="border border-slate-200 rounded overflow-hidden text-xs">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100 font-sans">
              <tr className="bg-slate-50">
                <td className="p-2.5 font-semibold text-slate-600 w-1/2">Approved Loan Principal (NPR):</td>
                <td className="p-2.5 font-mono font-bold text-slate-900">
                  Rs. {(application.approvedLoanAmount || application.requestedLoanAmount).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-600">Eligible Vehicle Details:</td>
                <td className="p-2.5 text-slate-900">
                  {application.quotation.make} {application.quotation.model} ({application.quotation.variant})
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-2.5 font-semibold text-slate-600">Authorized Dealer:</td>
                <td className="p-2.5 text-slate-900">{application.quotation.dealerName}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-600">Annual Interest Rate:</td>
                <td className="p-2.5 font-mono text-slate-900">{application.interestRateAnnual.toFixed(2)}% p.a. (Reducing-Balance)</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-2.5 font-semibold text-slate-600">Repayment Tenor:</td>
                <td className="p-2.5 font-mono text-slate-900">{application.loanTermMonths} Monthly Instalments</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-600">Estimated Monthly EMI (NPR):</td>
                <td className="p-2.5 font-mono font-bold text-slate-900">
                  Rs. {application.emiMonthly.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-2.5 font-semibold text-slate-600">Approval Expiry Date:</td>
                <td className="p-2.5 font-mono font-bold text-rose-700">
                  {application.approvalExpiryDate || '30 Calendar Days from Issuance'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Important Regulatory & Process Disclaimers */}
        <div className="p-4 bg-amber-50/70 border border-amber-300 rounded text-[11px] text-amber-950 space-y-2 leading-relaxed">
          <div className="font-bold uppercase tracking-wider text-amber-900">
            Important Terms, Conditions & Policy Notice
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Preliminary In-Principle Notice:</strong> This sanction is strictly preliminary, valid for 30 calendar days under proposed bank policy, subject to unchanged customer financial status and verification of physical documentation.
            </li>
            <li>
              <strong>Not a Disbursement Confirmation:</strong> This letter does not constitute a final disbursement guarantee. Loan disbursement, vehicle hypothecation, insurance endorsement, and loan account opening occur under the bank's downstream retail process.
            </li>
            <li>
              Vehicle quotation price lock is guaranteed only for the duration of the approved dealer quotation.
            </li>
          </ul>
        </div>

        {/* Signature Block */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600 font-mono">
          <div>
            <div>System Verification ID: LR-DEC-8810-AUTOPROC</div>
            <div>Automated Underwriting Engine: Rule Engine v1.4</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-900 font-sans">Retail Credit Risk Operations</div>
            <div>Loan Rangers Banking Corporation</div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  )
}
