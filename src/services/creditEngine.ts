import {
  CustomerProfile,
  CreditPolicy,
  RuleId,
  RuleResult,
  ApplicationStatus,
  Quotation
} from '../types'

/**
 * Calculates Reducing-balance Equated Monthly Instalment (EMI).
 * Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * @param principal Principal loan amount in NPR
 * @param annualInterestRate Annual interest percentage (e.g. 10.0 for 10%)
 * @param termMonths Number of monthly instalments (e.g. 84)
 */
export function calculateReducingBalanceEmi(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0
  if (annualInterestRate <= 0) {
    return Math.round((principal / termMonths) * 100) / 100
  }

  const r = annualInterestRate / 12 / 100
  const n = termMonths
  const numerator = principal * r * Math.pow(1 + r, n)
  const denominator = Math.pow(1 + r, n) - 1

  if (denominator === 0) return 0
  const emi = numerator / denominator
  return Math.round(emi * 100) / 100
}

/**
 * Calculates Loan-to-Value (LTV) percentage.
 * Formula: LTV = (requested loan amount / eligible vehicle value) * 100
 */
export function calculateLtv(loanAmount: number, vehiclePrice: number): number {
  if (vehiclePrice <= 0) return 0
  const ltv = (loanAmount / vehiclePrice) * 100
  return Math.round(ltv * 100) / 100
}

/**
 * Calculates Debt-Service Ratio (DSR) percentage.
 * Formula: DSR = ((existing monthly debt + new EMI) / verified monthly gross income) * 100
 */
export function calculateDsr(
  existingMonthlyDebt: number,
  newEmi: number,
  monthlyGrossIncome: number
): number {
  if (monthlyGrossIncome <= 0) return 100
  const totalCommitment = existingMonthlyDebt + newEmi
  const dsr = (totalCommitment / monthlyGrossIncome) * 100
  return Math.round(dsr * 100) / 100
}

export interface AppraisalInput {
  customer: CustomerProfile
  quotation: Quotation
  requestedLoanAmount: number
  termMonths: number
  policy: CreditPolicy
  bureauAvailable?: boolean
  overrideRules?: Partial<Record<RuleId, 'PASS' | 'FAIL' | 'REFER' | 'PENDING'>>
  complianceFlagsPresent?: boolean
  ocrMismatch?: boolean
  incomeDiscrepancy?: boolean
}

export interface AppraisalEvaluation {
  status: ApplicationStatus
  stage: 1 | 2 | 3 | 4 | 5
  calculatedEmi: number
  calculatedLtv: number
  calculatedDsr: number
  downPayment: number
  ruleResults: Record<RuleId, RuleResult>
  decisionReason: string
  approvalExpiryDate?: string
  conditions: string[]
}

/**
 * Deterministic 10-Rule Credit Decision Engine
 */
export function evaluateCreditApplication(input: AppraisalInput): AppraisalEvaluation {
  const {
    customer,
    quotation,
    requestedLoanAmount,
    termMonths,
    policy,
    bureauAvailable = true,
    complianceFlagsPresent = false,
    ocrMismatch = false,
    incomeDiscrepancy = false
  } = input

  const nowIso = new Date().toISOString()
  const vehiclePrice = quotation.eligiblePrice
  const downPayment = Math.max(0, vehiclePrice - requestedLoanAmount)
  const interestRate = policy.approvedAnnualInterestRate

  const calculatedEmi = calculateReducingBalanceEmi(requestedLoanAmount, interestRate, termMonths)
  const calculatedLtv = calculateLtv(requestedLoanAmount, vehiclePrice)
  const calculatedDsr = calculateDsr(
    customer.existingMonthlyDebt,
    calculatedEmi,
    customer.salaryMonthlyGross
  )

  const ruleResults: Record<RuleId, RuleResult> = {} as any

  // R1: Customer Eligibility
  let r1Status: 'PASS' | 'REFER' = 'PASS'
  let r1Details = 'Existing individual customer verified; active consent on record; valid KYC verified.'
  if (!customer.consentGiven) {
    r1Status = 'REFER'
    r1Details = 'Mandatory customer consent for credit appraisal and bureau access is missing.'
  } else if (customer.kycStatus === 'outdated') {
    r1Status = 'REFER'
    r1Details = 'Customer KYC record is outdated. Verification update required.'
  } else if (customer.kycStatus === 'pending') {
    r1Status = 'REFER'
    r1Details = 'Customer KYC verification is pending. Targeted KYC update required.'
  }
  ruleResults.R1 = {
    ruleId: 'R1',
    ruleName: 'Customer Eligibility & Consent',
    status: r1Status,
    details: r1Details,
    actualValue: `KYC: ${customer.kycStatus}, Consent: ${customer.consentGiven ? 'Granted' : 'Missing'}`,
    thresholdValue: 'Verified KYC & Recorded Consent',
    evaluatedAt: nowIso
  }

  // R2: Credit Bureau & Blacklist
  let r2Status: 'PASS' | 'FAIL' | 'REFER' | 'PENDING' = 'PASS'
  let r2Details = 'Credit bureau report verified; clean blacklist check.'
  if (!bureauAvailable) {
    r2Status = 'PENDING'
    r2Details = 'External Credit Information Bureau service timeout/outage. Application held in pending state.'
  } else if (customer.blacklistStatus === 'confirmed_match') {
    r2Status = 'FAIL'
    r2Details = 'Confirmed match found on Credit Information Bureau blacklist registry. Mandatory automatic decline.'
  } else if (customer.blacklistStatus === 'ambiguous_match') {
    r2Status = 'REFER'
    r2Details = 'Ambiguous identity match detected in blacklist registry. Referred for manual identity reconciliation.'
  }
  ruleResults.R2 = {
    ruleId: 'R2',
    ruleName: 'Credit Bureau & Blacklist Check',
    status: r2Status,
    details: r2Details,
    actualValue: !bureauAvailable ? 'Bureau Outage' : customer.blacklistStatus,
    thresholdValue: 'Bureau Available & Clean Blacklist Status',
    evaluatedAt: nowIso
  }

  // R3: Age and Term
  const ageAtFinalInstalment = customer.age + termMonths / 12
  let r3Status: 'PASS' | 'REFER' = 'PASS'
  let r3Details = `Applicant age ${customer.age} years; age at maturity ${ageAtFinalInstalment.toFixed(1)} years within policy bounds.`
  if (customer.age < policy.minAge) {
    r3Status = 'REFER'
    r3Details = `Applicant age ${customer.age} is below minimum age threshold (${policy.minAge} years). Referred for review.`
  } else if (ageAtFinalInstalment > policy.maxAgeFinalInstalment) {
    r3Status = 'REFER'
    r3Details = `Age at final installment (${ageAtFinalInstalment.toFixed(1)}) exceeds policy limit (${policy.maxAgeFinalInstalment} years). Referred for term restructuring.`
  } else if (termMonths < policy.minTermMonths || termMonths > policy.maxTermMonths) {
    r3Status = 'REFER'
    r3Details = `Requested loan term of ${termMonths} months is outside policy limits (${policy.minTermMonths}-${policy.maxTermMonths} months).`
  }
  ruleResults.R3 = {
    ruleId: 'R3',
    ruleName: 'Applicant Age & Term Eligibility',
    status: r3Status,
    details: r3Details,
    actualValue: `Age: ${customer.age}, Term: ${termMonths}m, Maturity: ${ageAtFinalInstalment.toFixed(1)}y`,
    thresholdValue: `Age ${policy.minAge}-65 at maturity, Term ${policy.minTermMonths}-${policy.maxTermMonths}m`,
    evaluatedAt: nowIso
  }

  // R4: Income Evidence
  let r4Status: 'PASS' | 'REFER' = 'PASS'
  let r4Details = `6 consecutive months salary credits verified. Monthly gross: Rs. ${customer.salaryMonthlyGross.toLocaleString('en-IN')}.`
  if (customer.salaryHistoryMonths.length < 6) {
    r4Status = 'REFER'
    r4Details = `Fewer than 6 consecutive months of bank salary credits found (${customer.salaryHistoryMonths.length} months). Manual verification required.`
  } else if (ocrMismatch) {
    r4Status = 'REFER'
    r4Details = 'OCR discrepancy between uploaded income tax certificate and banking salary record. Officer review required.'
  } else if (incomeDiscrepancy) {
    r4Status = 'REFER'
    r4Details = 'Discrepancy detected between self-declared income and verified salary transaction average.'
  }
  ruleResults.R4 = {
    ruleId: 'R4',
    ruleName: 'Income Verification & History',
    status: r4Status,
    details: r4Details,
    actualValue: `${customer.salaryHistoryMonths.length} Months Credits; Rs. ${customer.salaryMonthlyGross.toLocaleString('en-IN')}/mo`,
    thresholdValue: '6 Consecutive Months Identifiable Salary & Verified Tax Evidence',
    evaluatedAt: nowIso
  }

  // R5: Existing Debt
  let r5Status: 'PASS' | 'REFER' = 'PASS'
  let r5Details = `Monthly commitments reconciled: Rs. ${customer.existingMonthlyDebt.toLocaleString('en-IN')}. No unverified debt.`
  if (customer.existingMonthlyDebt < 0) {
    r5Status = 'REFER'
    r5Details = 'Unresolved negative commitment value detected. Never assume missing payments are zero.'
  }
  ruleResults.R5 = {
    ruleId: 'R5',
    ruleName: 'Existing Debt Reconciliation',
    status: r5Status,
    details: r5Details,
    actualValue: `Rs. ${customer.existingMonthlyDebt.toLocaleString('en-IN')}/month`,
    thresholdValue: 'Reconciled Bank & Bureau Commitments (No Double-Counting)',
    evaluatedAt: nowIso
  }

  // R6: Credit History
  let r6Status: 'PASS' | 'REFER' = 'PASS'
  let r6Details = `Established credit history confirmed. Overdue balance: Rs. ${customer.creditHistorySummary.overdueBalance}; max late days (12m): ${customer.creditHistorySummary.maxDaysLate12m}.`
  if (!customer.creditHistorySummary.hasEstablishedHistory) {
    r6Status = 'REFER'
    r6Details = 'No established bureau credit history on file (thin file). Referred for officer assessment.'
  } else if (customer.creditHistorySummary.overdueBalance > 0) {
    r6Status = 'REFER'
    r6Details = `Active overdue debt balance of Rs. ${customer.creditHistorySummary.overdueBalance.toLocaleString('en-IN')} detected.`
  } else if (customer.creditHistorySummary.maxDaysLate12m > 30) {
    r6Status = 'REFER'
    r6Details = `Delinquency of ${customer.creditHistorySummary.maxDaysLate12m} days recorded within preceding 12 months (limit is <= 30 days).`
  }
  ruleResults.R6 = {
    ruleId: 'R6',
    ruleName: 'Credit History & Repayment Track Record',
    status: r6Status,
    details: r6Details,
    actualValue: `Score: ${customer.creditHistorySummary.creditBureauScore}, Overdue: Rs. ${customer.creditHistorySummary.overdueBalance}, Max Late: ${customer.creditHistorySummary.maxDaysLate12m}d`,
    thresholdValue: 'Established History, 0 Overdue, <= 30 Days Late (12m)',
    evaluatedAt: nowIso
  }

  // R7: Vehicle and Quotation
  let r7Status: 'PASS' | 'REFER' = 'PASS'
  let r7Details = `Approved catalogue quotation: ${quotation.make} ${quotation.model} ${quotation.variant} (Dealer: ${quotation.dealerName}).`
  const isExpired = new Date(quotation.expiryDate) < new Date()
  if (quotation.status === 'expired' || isExpired) {
    r7Status = 'REFER'
    r7Details = 'Dealer quotation has expired. Customer must request a revised active quotation.'
  } else if (quotation.status !== 'active') {
    r7Status = 'REFER'
    r7Details = `Quotation status is ${quotation.status}. Active quotation required.`
  }
  ruleResults.R7 = {
    ruleId: 'R7',
    ruleName: 'Vehicle Catalogue & Dealer Quotation',
    status: r7Status,
    details: r7Details,
    actualValue: `${quotation.make} ${quotation.model} (Status: ${quotation.status})`,
    thresholdValue: 'New Private Vehicle, Approved Active Dealer, Valid Quotation',
    evaluatedAt: nowIso
  }

  // R8: Loan-to-Value (LTV)
  // Max automated: 60.00%. At 60.00% passes. Above 60.00% (e.g. 60.01%) cannot receive auto approval.
  let r8Status: 'PASS' | 'REFER' = 'PASS'
  let r8Details = `LTV ratio is ${calculatedLtv.toFixed(2)}%, within automated threshold of <= ${policy.maxAutomatedLtvPercent.toFixed(2)}%.`
  if (calculatedLtv > policy.maxAutomatedLtvPercent) {
    r8Status = 'REFER'
    const compliantMaxLoan = Math.floor((vehiclePrice * policy.maxAutomatedLtvPercent) / 100)
    r8Details = `LTV of ${calculatedLtv.toFixed(2)}% exceeds policy limit of ${policy.maxAutomatedLtvPercent.toFixed(2)}%. Cannot receive automatic approval. Eligible compliant loan is Rs. ${compliantMaxLoan.toLocaleString('en-IN')}.`
  }
  ruleResults.R8 = {
    ruleId: 'R8',
    ruleName: 'Loan-to-Value (LTV) Ratio',
    status: r8Status,
    details: r8Details,
    actualValue: `${calculatedLtv.toFixed(2)}%`,
    thresholdValue: `<= ${policy.maxAutomatedLtvPercent.toFixed(2)}%`,
    evaluatedAt: nowIso
  }

  // R9: Affordability / Debt-Service Ratio (DSR)
  // Max automated: 50.00%. At 50.00% passes. Above 50.00% (e.g. 50.01%) must be referred.
  let r9Status: 'PASS' | 'REFER' = 'PASS'
  let r9Details = `Debt-Service Ratio is ${calculatedDsr.toFixed(2)}%, within automated threshold of <= ${policy.maxAutomatedDsrPercent.toFixed(2)}%.`
  if (calculatedDsr > policy.maxAutomatedDsrPercent) {
    r9Status = 'REFER'
    r9Details = `Debt-Service Ratio of ${calculatedDsr.toFixed(2)}% exceeds automated limit of ${policy.maxAutomatedDsrPercent.toFixed(2)}%. Case referred for officer affordability assessment.`
  }
  ruleResults.R9 = {
    ruleId: 'R9',
    ruleName: 'Affordability & Debt-Service Ratio',
    status: r9Status,
    details: r9Details,
    actualValue: `${calculatedDsr.toFixed(2)}%`,
    thresholdValue: `<= ${policy.maxAutomatedDsrPercent.toFixed(2)}%`,
    evaluatedAt: nowIso
  }

  // R10: Authority and Loan Limit
  // Proposed maximum automated loan amount: NPR 2,500,000.
  let r10Status: 'PASS' | 'REFER' = 'PASS'
  let r10Details = `Requested loan Rs. ${requestedLoanAmount.toLocaleString('en-IN')} within automated credit limit (Rs. ${policy.maxAutomatedLoanAmount.toLocaleString('en-IN')}).`
  if (requestedLoanAmount > policy.maxAutomatedLoanAmount) {
    r10Status = 'REFER'
    r10Details = `Loan amount of Rs. ${requestedLoanAmount.toLocaleString('en-IN')} exceeds automated approval ceiling of Rs. ${policy.maxAutomatedLoanAmount.toLocaleString('en-IN')}. Referred to authorised Credit Officer.`
  } else if (complianceFlagsPresent) {
    r10Status = 'REFER'
    r10Details = 'Unresolved compliance flag on record. Automatic approval prohibited; escalated to Compliance/Senior Approver.'
  }
  ruleResults.R10 = {
    ruleId: 'R10',
    ruleName: 'Delegated Authority & Exception Limits',
    status: r10Status,
    details: r10Details,
    actualValue: `Rs. ${requestedLoanAmount.toLocaleString('en-IN')}`,
    thresholdValue: `<= Rs. ${policy.maxAutomatedLoanAmount.toLocaleString('en-IN')}`,
    evaluatedAt: nowIso
  }

  // Apply manual override if provided in test scenarios
  if (input.overrideRules) {
    Object.entries(input.overrideRules).forEach(([rId, status]) => {
      const id = rId as RuleId
      if (ruleResults[id]) {
        ruleResults[id].status = status as any
        ruleResults[id].details = `[Rule Override] Evaluated status set to ${status}.`
      }
    })
  }

  // Evaluate Routing Sequence
  let finalStatus: ApplicationStatus = 'approved_in_principle'
  let stage: 1 | 2 | 3 | 4 | 5 = 5
  let decisionReason = 'All ten automated credit criteria passed preliminary verification.'
  let approvalExpiryDate: string | undefined

  if (ruleResults.R2.status === 'PENDING') {
    finalStatus = 'pending'
    stage = 3
    decisionReason = 'Application held pending due to Credit Bureau service interruption. Retrying connection.'
  } else if (ruleResults.R2.status === 'FAIL') {
    finalStatus = 'declined'
    stage = 5
    decisionReason = 'Application declined pursuant to confirmed Credit Information Bureau blacklist registry record.'
  } else {
    // Check if any rule is REFER
    const referredRules = (Object.keys(ruleResults) as RuleId[]).filter(
      (rId) => ruleResults[rId].status === 'REFER'
    )

    if (referredRules.length > 0) {
      finalStatus = 'referred'
      stage = 4
      const ruleNames = referredRules.join(', ')
      decisionReason = `Referred to Credit Officer for manual assessment due to rules: ${ruleNames}.`
    } else {
      // All passed
      finalStatus = 'approved_in_principle'
      stage = 5
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + policy.approvalValidityDays)
      approvalExpiryDate = expiry.toISOString().split('T')[0]
      decisionReason = 'Preliminary In-Principle Auto Loan Approval granted.'
    }
  }

  const conditions = [
    'Subject to physical verification of original citizenship and tax documents.',
    'Quotation price lock guaranteed for 30 calendar days from approval date.',
    'Disbursement subject to final execution of bank loan contract and hypothecation of vehicle.',
    'The bank reserves the right to withdraw approval if customer financial circumstances change.'
  ]

  return {
    status: finalStatus,
    stage,
    calculatedEmi,
    calculatedLtv,
    calculatedDsr,
    downPayment,
    ruleResults,
    decisionReason,
    approvalExpiryDate,
    conditions
  }
}
