import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { calculateReducingBalanceEmi, calculateLtv, calculateDsr } from '../../services/creditEngine'
import { Quotation } from '../../types'

export const ApplicationWizard: React.FC = () => {
  const {
    currentUser,
    customers,
    quotations,
    policy,
    submitNewApplication,
    setCustomerTab,
    setSelectedApplicationId
  } = useApp()

  const customer = customers[currentUser.id] || customers['USR-CUST-001']

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1: Consent
  const [consentGranted, setConsentGranted] = useState<boolean>(customer.consentGiven)
  const [consentTimestamp] = useState<string>(new Date().toISOString())

  // Step 2: Vehicle Quotation
  const activeQuotations = quotations.filter((q) => q.status === 'active')
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>(
    activeQuotations[0]?.id || ''
  )
  const selectedQuotation =
    quotations.find((q) => q.id === selectedQuotationId) || activeQuotations[0]

  // Step 3: Loan Preferences
  const [requestedLoanAmount, setRequestedLoanAmount] = useState<number>(() => {
    if (selectedQuotation) {
      // Default to 60% of vehicle price
      return Math.min(
        policy.maxAutomatedLoanAmount,
        Math.floor((selectedQuotation.eligiblePrice * 60) / 100)
      )
    }
    return 2400000
  })
  const [termMonths, setTermMonths] = useState<number>(84)

  // Step 4: Income & Evidence Simulation Flags
  const [simulateOcrMismatch, setSimulateOcrMismatch] = useState<boolean>(false)
  const [simulateComplianceFlag, setSimulateComplianceFlag] = useState<boolean>(false)
  const [uploadedDocName, setUploadedDocName] = useState<string>('Tax_Clearance_FY2081.pdf')
  const [uploadStatus, setUploadStatus] = useState<string>('Verified via Simulated OCR')

  // Submission error
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // Live Calculations
  const vehiclePrice = selectedQuotation ? selectedQuotation.eligiblePrice : 4000000
  const downPayment = Math.max(0, vehiclePrice - requestedLoanAmount)
  const emi = calculateReducingBalanceEmi(
    requestedLoanAmount,
    policy.approvedAnnualInterestRate,
    termMonths
  )
  const ltv = calculateLtv(requestedLoanAmount, vehiclePrice)
  const dsr = calculateDsr(customer.existingMonthlyDebt, emi, customer.salaryMonthlyGross)

  const handleNext = () => {
    if (currentStep === 1 && !consentGranted) {
      setSubmissionError('Mandatory consent for credit appraisal and bureau query is required to proceed.')
      return
    }
    setSubmissionError(null)
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as any)
    }
  }

  const handleBack = () => {
    setSubmissionError(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any)
    }
  }

  const handleSubmit = async () => {
    setSubmissionError(null)
    const result = await submitNewApplication({
      customerId: customer.id,
      quotationId: selectedQuotation.id,
      requestedLoanAmount,
      termMonths,
      complianceFlagsPresent: simulateComplianceFlag,
      ocrMismatch: simulateOcrMismatch
    })

    if (result.duplicate) {
      setSubmissionError(
        `Active application ${result.application.id} already exists for ${customer.fullName}. Duplicate submissions are prevented.`
      )
      return
    }

    setSelectedApplicationId(result.application.id)
    setCustomerTab('application_detail')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Auto Loan Application Wizard
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Multi-Step Preliminary Credit Appraisal
            </h2>
          </div>
          <button
            onClick={() => setCustomerTab('dashboard')}
            className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded"
          >
            Cancel & Return to Dashboard
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 mt-4 text-xs font-medium">
          {[
            '1. Verification & Consent',
            '2. Vehicle Quotation',
            '3. Loan Preferences',
            '4. Income & Evidence',
            '5. Review & Submit'
          ].map((title, idx) => {
            const stepNum = idx + 1
            const isActive = currentStep === stepNum
            const isCompleted = currentStep > stepNum
            return (
              <div
                key={stepNum}
                className={`p-2.5 rounded border text-center ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : isCompleted
                    ? 'border-slate-300 bg-slate-100 text-slate-800'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase opacity-75">Step {stepNum}</div>
                <div className="mt-0.5 truncate">{title.split('. ')[1]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {submissionError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 font-medium">
          {submissionError}
        </div>
      )}

      {/* Step 1: Customer Verification & Consent */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Step 1: Customer Identity Verification & Appraisal Consent
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify existing bank customer credentials and record explicit consent before credit checks are executed.
            </p>
          </div>

          {/* KYC Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Existing Bank KYC Records (Reused Automatically)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Full Legal Name</span>
                <span className="font-semibold text-slate-900">{customer.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Masked Account Number</span>
                <span className="font-mono font-semibold text-slate-900">{customer.maskedAccount}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Citizenship ID</span>
                <span className="font-mono font-semibold text-slate-900">{customer.citizenNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth & Age</span>
                <span className="text-slate-900">
                  {customer.dateOfBirth} ({customer.age} years)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">KYC Verification Status</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold text-[11px] uppercase">
                  {customer.kycStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">KYC Last Verified</span>
                <span className="font-mono text-slate-900">{customer.kycVerifiedDate}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
              Valid KYC on file. Pursuant to bank policy, existing identity documentation is reused without requiring re-upload.
            </p>
          </div>

          {/* Mandatory Consent Statement */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-3">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Mandatory Consent for Credit Appraisal & Bureau Query (Version v2.1-2026)
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p>
                By granting consent, I authorize Loan Rangers Digital Banking to access my transaction history, retrieve credit records from the Credit Information Bureau (CIB) of Nepal, verify blacklist registries, and compute automated debt-service ratios for this preliminary loan appraisal.
              </p>
              <p className="text-[11px] text-slate-500">
                Timestamp recorded upon agreement: <span className="font-mono">{consentTimestamp}</span>. Under Rule R1, credit appraisals cannot proceed without explicit consent.
              </p>
            </div>

            <label className="flex items-start space-x-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              <span className="text-xs font-semibold text-slate-900">
                I hereby grant consent for credit appraisal, CIB bureau access, and automated decision processing.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle Quotation Selection */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Step 2: Confirm Dealer Vehicle Quotation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select an approved digital quotation created by an authorized dealer. Prices are strictly locked to the dealer quotation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Active Dealer Quotations
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeQuotations.map((q) => {
                const isSelected = q.id === selectedQuotationId
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuotationId(q.id)
                      // Auto-adjust requested loan to 60%
                      setRequestedLoanAmount(Math.min(policy.maxAutomatedLoanAmount, Math.floor((q.eligiblePrice * 60) / 100)))
                    }}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{q.id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded uppercase">
                        Active Quotation
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">
                      {q.make} {q.model}
                    </div>
                    <div className="text-xs text-slate-600">{q.variant}</div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Quoted Price:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Rs. {q.eligiblePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Dealer: <strong className="text-slate-700">{q.dealerName}</strong> • Expires: {q.expiryDate}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedQuotation && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
              <span className="font-semibold text-slate-800 uppercase text-[11px]">Quotation Confirmation:</span>
              <p className="text-slate-600">
                Selected: <strong>{selectedQuotation.make} {selectedQuotation.model} ({selectedQuotation.variant})</strong> at Rs. {selectedQuotation.eligiblePrice.toLocaleString('en-IN')}. Quoted price is locked and cannot be edited without a dealer revised quotation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Loan Preferences & Live EMI Calculator */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Step 3: Loan Preferences & Reducing-Balance EMI Calculation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select desired financing terms. The reducing-balance EMI formula is updated live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Loan Amount Input */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <label htmlFor="loan-amount-input">Requested Loan Amount (NPR)</label>
                  <span className="font-mono text-slate-900 font-bold">
                    Rs. {requestedLoanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  id="loan-amount-input"
                  type="range"
                  min={500000}
                  max={vehiclePrice}
                  step={50000}
                  value={requestedLoanAmount}
                  onChange={(e) => setRequestedLoanAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-slate-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>Min: Rs. 500,000</span>
                  <span>Vehicle Value: Rs. {vehiclePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2">
                  <input
                    aria-label="Direct Loan Amount Entry in NPR"
                    type="number"
                    value={requestedLoanAmount}
                    onChange={(e) => setRequestedLoanAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Term Selector */}
              <div>
                <label htmlFor="repayment-term-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Repayment Term (Months)
                </label>
                <select
                  id="repayment-term-select"
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white text-slate-900"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={48}>48 Months (4 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                  <option value={72}>72 Months (6 Years)</option>
                  <option value={84}>84 Months (7 Years — Recommended)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Policy Limits: {policy.minTermMonths} to {policy.maxTermMonths} months.
                </span>
              </div>

              {/* Interest Rate */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                <span className="text-slate-500 block">Bank Annual Interest Rate</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {policy.approvedAnnualInterestRate.toFixed(2)}% p.a.
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Standard reducing-balance rate approved by Retail Credit Committee.
                </span>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
                Live Calculation Breakdown
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Eligible Vehicle Price:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    Rs. {vehiclePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Requested Loan:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    Rs. {requestedLoanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Required Down Payment:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    Rs. {downPayment.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600">Loan-to-Value (LTV):</span>
                  <span
                    className={`font-mono font-bold ${
                      ltv <= policy.maxAutomatedLtvPercent ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {ltv.toFixed(2)}% (Max Auto: {policy.maxAutomatedLtvPercent}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Monthly EMI:</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    Rs. {emi.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Debt-Service Ratio (DSR):</span>
                  <span
                    className={`font-mono font-bold ${
                      dsr <= policy.maxAutomatedDsrPercent ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {dsr.toFixed(2)}% (Max Auto: {policy.maxAutomatedDsrPercent}%)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
                * Note: Estimates are preliminary calculations based on the reducing-balance formula and are subject to underwriting verification.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Income & Liabilities + Document OCR Simulation */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Step 4: Income & Liabilities Verification
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulated bank transaction history retrieved. Review verified gross salary and existing debt commitments.
            </p>
          </div>

          {/* 6-Month Salary History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                6-Month Identifiable Salary Transactions
              </span>
              <span className="text-xs font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                Rule R4: Verified
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-semibold">Month</th>
                    <th className="p-2.5 font-semibold">Transaction Description</th>
                    <th className="p-2.5 font-semibold">Net Salary Deposit</th>
                    <th className="p-2.5 font-semibold">Verification Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {customer.salaryHistoryMonths.map((amt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-700 font-sans">Month {6 - idx} (Historical)</td>
                      <td className="p-2.5 text-slate-600 font-sans">SALARY CR - TECH ENTERPRISE NEPAL</td>
                      <td className="p-2.5 font-bold text-slate-900">
                        Rs. {amt.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-emerald-700 font-sans font-medium">Bank Core CBS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Income & Liabilities Summary Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded text-xs">
            <div>
              <span className="text-slate-500 block">Verified Gross Monthly Income:</span>
              <span className="text-base font-bold font-mono text-slate-900">
                Rs. {customer.salaryMonthlyGross.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Calculated from salary slips & annual tax statement.
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Existing Monthly Debt Commitments:</span>
              <span className="text-base font-bold font-mono text-slate-900">
                Rs. {customer.existingMonthlyDebt.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Reconciled CIB bureau commitments (Rule R5). Never assumed zero.
              </span>
            </div>
          </div>

          {/* Simulated Document Upload & OCR Test Controls */}
          <div className="p-4 border border-slate-200 rounded space-y-3">
            <div className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Document Evidence & OCR Verification
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="font-semibold text-slate-800">{uploadedDocName}</span>
                <span className="text-slate-500 block text-[11px]">{uploadStatus}</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                SIMULATED UPLOAD
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Prototype Test Toggles (Simulate Exceptions):
              </span>
              <div className="flex flex-col sm:flex-row gap-3 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateOcrMismatch}
                    onChange={(e) => setSimulateOcrMismatch(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  <span className="text-slate-700">Simulate OCR Data Mismatch (triggers R4 Officer Review)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateComplianceFlag}
                    onChange={(e) => setSimulateComplianceFlag(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  <span className="text-slate-700">Simulate Compliance Flag (triggers R10 Escalation)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Step 5: Review Application Summary & Submit for Appraisal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify all submitted parameters. Submitting will trigger the 10-rule automated credit appraisal engine.
            </p>
          </div>

          {/* Full Application Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="font-semibold text-slate-800 uppercase tracking-wide text-[11px]">
                Applicant & Vehicle
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">{customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account:</span>
                <span className="font-mono text-slate-900">{customer.maskedAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-semibold text-slate-900">
                  {selectedQuotation.make} {selectedQuotation.model} ({selectedQuotation.variant})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dealer:</span>
                <span className="text-slate-900">{selectedQuotation.dealerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quotation ID:</span>
                <span className="font-mono text-slate-900">{selectedQuotation.id}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="font-semibold text-slate-800 uppercase tracking-wide text-[11px]">
                Financial Metrics & Ratio Analysis
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Quoted Price:</span>
                <span className="font-mono font-semibold text-slate-900">
                  Rs. {vehiclePrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Loan:</span>
                <span className="font-mono font-bold text-slate-900">
                  Rs. {requestedLoanAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Down Payment:</span>
                <span className="font-mono text-slate-900">
                  Rs. {downPayment.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Term & Rate:</span>
                <span className="font-mono text-slate-900">
                  {termMonths} Months @ {policy.approvedAnnualInterestRate}%
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Estimated EMI:</span>
                <span className="font-mono text-slate-900">
                  Rs. {emi.toLocaleString('en-IN')}/month
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">LTV Ratio:</span>
                <span className="font-mono font-semibold text-slate-900">{ltv.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Debt-Service Ratio:</span>
                <span className="font-mono font-semibold text-slate-900">{dsr.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
            <strong className="text-slate-800 uppercase">Pre-Submission Validation Notice:</strong> Once submitted, application parameters are sealed into an immutable credit file, and deterministic rule evaluation (R1 through R10) is executed instantly.
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded text-xs font-semibold border ${
            currentStep === 1
              ? 'border-slate-200 text-slate-300 cursor-not-allowed'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Previous Step
        </button>

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
          >
            Continue to Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-800 text-white rounded text-xs font-bold hover:bg-emerald-900 uppercase tracking-wide"
          >
            Submit Loan Application
          </button>
        )}
      </div>
    </div>
  )
}
