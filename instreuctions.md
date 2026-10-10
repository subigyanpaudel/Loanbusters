# Project: Auto Loan Credit Decisioning System — Loan Rangers

Build a complete, modern, responsive web application called *Loan Rangers — Auto Loan Credit Decisioning System*, based on the TO-BE business process in our Business Requirements Document.

The application must have *two primary portals: Customer Portal and Bank/Admin Portal*, connected to the same application database and credit decision workflow. Include a restricted dealer quotation feature because approved dealers create vehicle quotations in the proposed process.

This is a university project prototype demonstrating how an existing bank customer can obtain an automated preliminary auto-loan decision. It is not a production banking system.

## 1. Technology and design

- Build using React, TypeScript, Tailwind CSS and shadcn/ui.
- Use Supabase for authentication, database persistence and role-based access if available.
- If Supabase credentials are unavailable, implement a fully interactive demo using realistic seeded data and local persistence, with a clear path to connect a real backend later.
- Use a professional banking dashboard design with a white background, navy blue primary colour, subtle blue accents, light grey backgrounds and green, amber and red status indicators.
- Use clean typography, consistent spacing, rounded cards, subtle shadows, tables, charts, icons and responsive layouts.
- Make it look like a real Nepalese digital banking platform, not a generic landing page or static school project.
- Display all financial amounts in NPR (Rs.).
- Provide realistic demo data, loading states, empty states, form validation, error messages, confirmation dialogs, notifications and success messages.
- Every major button, menu, filter, form, chart interaction and workflow action must work.
- Use a shared database so changes in one portal appear in the other portal where permissions allow.

## 2. Authentication and user roles

Create a login page with role-based access for these roles:

### A. Customer
An existing individual bank customer applying for a new private vehicle loan.

### B. Bank officer
A credit officer who reviews referred applications, requests evidence and makes decisions within delegated authority.

### C. Bank administrator
An authorised user who manages users, approved dealers, vehicle catalogues, product configuration, rules and system reports. Policy changes must require two authorised users.

### D. Dealer
An approved vehicle dealer who creates quotations and sees only the status of applications associated with their quotations and authorised customer consent.

Provide a demo-mode role selector or demo credentials so the evaluator can easily test both main portals without external banking integrations.

After login, redirect users to the correct dashboard. Enforce permissions on the backend when a backend is configured; hiding a button alone is not sufficient.

## 3. Customer Portal

Create a customer-facing dashboard with the following pages.

### A. Customer dashboard
Display:
- Welcome message and masked customer account reference.
- Start New Auto Loan Application button.
- Current application status.
- Application ID and submission date.
- Vehicle quotation details.
- Requested loan amount and estimated EMI.
- Missing documents or outstanding customer actions.
- Notifications and recent activity.
- Application progress tracker.

Use these application stages:
1. Quotation confirmed.
2. Consent and information verification.
3. Credit appraisal.
4. Automated decision or officer review.
5. Decision communicated.

Display the actual status of the application rather than always showing every stage as completed.

### B. Start a new application

Create a guided multi-step application wizard.

Step 1 — Customer verification:
- Authenticate an existing bank customer.
- Use seeded demo customer records.
- Display existing KYC information and verification status.
- Reuse valid KYC records instead of asking for identity documents again.
- If information is missing, outdated or changed, request only the required updates.
- Capture customer consent for credit appraisal and credit bureau access.
- Store consent timestamp and consent version.
- Do not run credit checks without recorded consent.

Step 2 — Vehicle quotation:
- Select a valid quotation created by an approved dealer.
- Show make, model, variant, eligible vehicle price, dealer, quotation ID and expiry date.
- Allow the customer to confirm the quotation.
- Reject expired or invalid quotations.
- Do not allow the customer to change a dealer's quoted price without generating a revised quotation.

Step 3 — Loan preferences:
- Requested loan amount.
- Preferred repayment term between 12 and 84 months.
- Display the bank's configured interest rate.
- Show the estimated monthly EMI.
- Show the vehicle price, requested loan, down payment and LTV.
- Clearly identify estimates as preliminary until verified.

Step 4 — Income and liabilities:
- Retrieve simulated six-month salary transaction history from existing bank records.
- Display verified monthly gross income separately from net salary deposits.
- Display existing monthly debt obligations.
- Allow upload of missing income evidence or applicable tax evidence.
- Provide a simulated document upload and OCR extraction workflow for newly supplied documents.
- Flag unreadable documents and mismatched information for correction or officer review.
- Do not treat missing debt information as zero.

Step 5 — Review and submit:
- Display a complete application summary.
- Display the consent statement and confirmed quotation.
- Validate all mandatory fields.
- Prevent accidental duplicate submissions.
- Generate a unique application ID.
- Save the application and its history.
- Start the simulated credit appraisal only after consent and required prerequisites are satisfied.

### C. My Applications
Create a searchable list of applications with:
- Application ID.
- Vehicle details.
- Requested amount.
- Submission date.
- Current status.
- Latest decision.
- Required customer actions.
- View Details button.

Allow customers to open each application and view its complete timeline.

### D. Application details and document requests
Customers must be able to:
- View the application progress.
- View outstanding information requests.
- Upload or correct requested documents.
- Respond to officer questions.
- Submit revised loan preferences when requested.
- See whether a bureau service outage has delayed processing.
- View their decision letter and applicable conditions.
- See approval expiry dates.
- View previous application versions and decisions.

When information is amended, revalidate the affected checks and rerun the appropriate appraisal workflow.

### E. Decision and notification centre
Support the following customer-visible outcomes:

IN-PRINCIPLE APPROVED:
Show approved amount, annual interest rate, term, EMI, vehicle details, approval conditions, issue date and expiry date. State prominently that the approval is preliminary, valid for 30 calendar days under the proposed policy, subject to unchanged information and subsequent documentation and security requirements. It is not a disbursement confirmation.

DECLINED:
Show a clear, respectful decision notification and the reason appropriate to the authorised disclosure policy. A confirmed blacklist match is an automatic decline trigger under the proposed workflow.

REFERRED FOR REVIEW:
Explain that the application needs additional assessment and has not been rejected. Display the expected next action and any information requests.

PENDING:
Explain that processing is waiting for a mandatory service or required information. Never show a pending application as approved.

## 4. Bank/Admin Portal

Create a separate, protected banking operations dashboard with a left sidebar.

Navigation:
- Overview
- All Applications
- Officer Review Queue
- Automated Decisions
- Pending Applications
- Customer and KYC Records
- Dealer Management
- Vehicle Catalogue
- Credit Rules and Product Settings
- Notifications
- Reports and Analytics
- Audit Trail
- User and Role Management

### A. Admin overview dashboard

Show KPI cards for:
- Total applications.
- Automated approvals.
- Automatic declines.
- Applications referred for manual review.
- Applications pending because of missing information.
- Applications pending because of external-service failures.
- Average decision time.
- Percentage of complete applications decided automatically.

Add interactive charts for:
- Application volume over time.
- Approval, decline, referral and pending distribution.
- Application status breakdown.
- Reasons for manual referrals.
- Missing-document frequency.
- Automated versus manual decision times.

Provide date filters and application-status filters.

Keep automatic declines, referrals and pending cases separate in all metrics. Do not treat referrals or service failures as declines.

### B. All Applications

Create a comprehensive table with:
- Application ID.
- Customer reference.
- Customer name, visible only to authorised staff.
- Dealer.
- Vehicle.
- Requested amount.
- Submission date.
- Current status.
- Automation eligibility.
- Assigned officer.
- Last updated timestamp.

Include:
- Search by application ID or permitted customer fields.
- Filters by date, status, dealer, amount and assigned officer.
- Sorting and pagination.
- Export of authorised, appropriately minimised reports.
- View Application button.

The application detail screen must contain tabs for Overview, Customer and KYC, Income Evidence, Credit Bureau, Calculations, Rule Results, Decision History, Documents and Audit Log.

Mask sensitive data by default and restrict access according to role.

### C. Automated credit appraisal engine

Implement a deterministic, explainable rule-based decision engine. Do not use an opaque AI model to determine creditworthiness.

The engine must evaluate all ten rules from the business requirements document.

R1 — Customer eligibility:
- Existing individual customer.
- Authenticated customer.
- Valid recorded consent.
- Current verified KYC.
- If consent is missing, do not run credit checks.
- If KYC is missing or outdated, request an update or refer unresolved cases.

R2 — Credit bureau and blacklist:
- A current bureau report must be matched to the correct applicant.
- A confirmed blacklist match results in automatic decline.
- An uncertain identity match results in manual review.
- A bureau outage results in PENDING, never approval or decline.

R3 — Age and term:
- Proposed minimum age: 21 at application.
- Proposed maximum age: 65 at final instalment.
- Proposed term: 12–84 months.
- Cases outside these limits must be referred for eligibility review, not automatically declined solely on age.

R4 — Income:
- Require six consecutive months of identifiable salary credits and valid supporting income and applicable tax evidence.
- Irregular salary, self-employment income, incomplete evidence or material discrepancies require manual review.

R5 — Existing debt:
- Reconcile monthly commitments across bank records, bureau information and customer declarations.
- Prevent double counting.
- Unresolved commitments or discrepancies require review.
- Never assume missing payments are zero.

R6 — Credit history:
- Proposed automated eligibility requires established credit history, no current overdue balance and no payment more than 30 days late in the preceding 12 months.
- No-history cases, adverse history and incomplete coverage must be referred for assessment.

R7 — Vehicle and quotation:
- New private vehicle only.
- Approved active dealer.
- Valid catalogue-based quotation confirmed by the customer.
- Changed or expired quotations require reassessment.

R8 — Loan-to-value:
- LTV = requested loan amount / eligible vehicle value × 100.
- Proposed automated maximum: 60%, or a stricter applicable bank or regulatory limit.
- Values at the applicable limit may pass; values above it cannot receive automatic approval.
- Offer a compliant lower loan amount when appropriate, subject to explicit customer consent and fresh affected checks.
- Do not silently change the requested loan.

R9 — Affordability:
- EMI must be calculated using the reducing-balance formula and configured approved annual interest rate and loan term.
- Debt-service ratio = (existing monthly debt commitments + new EMI) / verified monthly gross income × 100.
- Proposed maximum automated ratio: 50%.
- Values at the applicable limit may pass; values above it must be referred.
- Recalculate when amount, term, interest rate or evidence changes.

R10 — Authority and exceptions:
- Proposed maximum loan amount for automated approval: NPR 2,500,000.
- Unresolved compliance flags or exceptions prohibit automated approval.
- Higher-value cases are referred to an authorised officer.
- Officers cannot bypass mandatory checks or applicable product limits.

All ten rules must pass for an automated in-principle approval.

Clearly label the thresholds as proposed demonstration policies requiring Credit Risk and Compliance approval before real-world implementation.

### D. Routing priority

Implement this decision-routing sequence:

1. Validate identity, customer eligibility and recorded consent.
2. If mandatory consent is missing, stop the credit checks.
3. If the blacklist is confirmed, decline the application.
4. If the bureau service is unavailable, set status to PENDING and retry twice at five-minute intervals in a real scheduled implementation. For the prototype, provide a simulated retry control and clearly indicate simulated retries.
5. Request missing information or refer unresolved identity, eligibility, income, debt, affordability, LTV, credit-history or authority exceptions.
6. Automatically approve only when all ten rules pass.
7. Save and communicate the outcome.

Never allow a service outage, ambiguous identity match or missing evidence to produce an automatic approval or an unsupported automatic decline.

### E. Officer Review Queue

Create a dedicated work queue for applications requiring human review.

Display:
- Application ID.
- Customer reference.
- Requested loan amount.
- Referral reason.
- Failed or unresolved rule IDs.
- Missing evidence.
- Bureau status.
- Assigned officer.
- Time waiting.
- Priority indicator.

When an officer opens an application, show:
- Customer and KYC summary.
- Verified gross income and salary history.
- Existing debt reconciliation.
- Credit report summary and match confidence.
- Vehicle quotation.
- EMI, LTV and debt-service ratio calculations.
- All ten rule results.
- Evidence timestamps and rule version.
- Complete previous action history.

Provide these actions:
1. Request Additional Information.
2. Return to Customer.
3. Approve Within Delegated Authority.
4. Decline With Recorded Reason.
5. Propose Revised Terms.
6. Escalate to Senior Approver.
7. Assign or Reassign Officer.

Every decision requires confirmation, an authorised user and an audit entry.

An officer must not be able to approve a case outside their delegated authority or bypass mandatory checks. Higher-value cases must be escalated.

When additional information is requested, notify the customer and return the application to the information-request stage. After the customer responds, revalidate the affected information before another decision.

### F. Dealer Management

Allow administrators to:
- Add, edit, activate and deactivate approved dealers.
- Store dealer name, identifier and contact details.
- Review quotations created by each dealer.
- Restrict dealers to their own quotations and authorised application-status information.

Dealer users can:
- Create a digital quotation.
- Select make, model and variant from the approved catalogue.
- Enter and validate price fields.
- Set quotation expiry.
- Generate a unique quotation ID.
- View quotations they created.
- View only the permitted status of associated consented applications.

Dealers must never see customers' income, bank transactions, credit bureau reports, blacklist information, detailed eligibility rules or internal officer notes.

### G. Vehicle Catalogue

Only authorised bank administrators can maintain the controlled catalogue.

Support:
- Vehicle make.
- Model.
- Variant.
- Vehicle category.
- Eligible vehicle value.
- Approved pricing fields.
- Active/inactive status.
- Effective date and audit history.

Only new private vehicles in the approved catalogue are eligible. Exclude used, commercial and fleet vehicles.

Validate quotations against active catalogue entries and ensure insurance, fees and accessories are excluded from eligible vehicle value where required by the configured policy.

### H. Credit Rules and Product Settings

Create a configuration screen for authorised policy administrators to manage:
- Minimum age.
- Maximum age at final instalment.
- Minimum and maximum term.
- Maximum automated LTV.
- Maximum automated debt-service ratio.
- Maximum automated loan amount.
- Approved interest rates.
- Approval validity.
- Credit-history eligibility parameters.

Display a clear warning that the values are proposed policies, not confirmed bank-approved settings.

Every policy change must:
- Require two authorised users, one to propose and another to approve.
- Record the old value, new value, reason, proposer, approver and timestamps.
- Create a new immutable rule version.
- Preserve previous versions.
- Apply the new version only to eligible new assessments or explicit reassessments.
- Never silently change the basis of a previous decision.

Use seed data and working demonstration controls to simulate this dual-approval workflow.

### I. Notifications

Provide in-app notifications for:
- Application submitted.
- Additional information requested.
- Documents received.
- Application referred.
- Application approved in principle.
- Application declined.
- Application pending due to a service outage.
- Approval nearing expiry.
- Approval expired.
- Dealer quotation created or expired.

Notifications should appear in the relevant user's portal. Use simulated email or SMS delivery unless a real provider is explicitly configured.

### J. Reports and audit trail

Reports must show:
- Total applications by period.
- Automated approvals and automatic declines separately.
- Referral counts and referral reasons.
- Missing-information cases.
- Bureau outages and pending duration.
- Median and 95th-percentile decision time.
- Automated versus manual processing times.
- Approval expiry and reassessment counts.

The audit trail must capture:
- Application creation and changes.
- Consent version and timestamp.
- Evidence additions and updates.
- Data-access events where implemented.
- Bureau request status and result metadata.
- Calculations and rule outcomes.
- Rule version.
- Officer actions and recorded reasons.
- Notifications and delivery status.
- Policy changes and dual approvals.

Protect the audit trail from ordinary editing or deletion. Restrict access to authorised personnel.

## 5. Calculation requirements

Use the reducing-balance EMI formula:

EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)

Where:
- P = principal loan amount.
- r = annual interest rate / 12 / 100.
- n = number of monthly instalments.

Handle a zero interest rate safely.

Calculate LTV and the debt-service ratio using the formulas specified above.

Use full precision for eligibility checks and display currency to two decimal places.

Recalculate whenever the requested amount, term, interest rate, eligible vehicle value, verified income or existing debt changes.

Include an illustrative example with:
- Eligible vehicle value: NPR 4,000,000.
- Requested loan: NPR 2,400,000.
- Annual interest rate: 10%.
- Term: 84 months.
- Verified gross monthly income: NPR 150,000.
- Existing monthly debt: NPR 20,000.

Use the actual calculation results generated by the application rather than hardcoding an outcome. The case can be automatically approved only if all ten rules pass.

## 6. Exception handling

Implement these scenarios explicitly:

- Missing KYC: request an update.
- Missing income evidence: request the missing documents.
- OCR mismatch: request correction or refer.
- Bureau timeout: remain pending and simulate retries.
- Uncertain blacklist match: refer for identity resolution.
- Confirmed blacklist match: decline.
- LTV above the limit: offer revised terms subject to consent, or refer.
- Debt-service ratio above the limit: refer for assessment of a lower amount or suitable term.
- Expired quotation: require a valid revised quotation.
- Expired approval: mark expired and require reassessment before issuing a new decision.
- Changed application information: create a new assessment version and rerun affected checks.
- Duplicate submission: maintain one active application and preserve submission history.
- Unresolved compliance flags: prohibit automatic approval.

## 7. Security and privacy

- Enforce role-based access.
- Restrict customers to their own applications.
- Restrict dealers to their own quotations and permitted application statuses.
- Restrict credit reports and financial evidence to authorised banking staff.
- Mask sensitive information in tables and dashboards.
- Use secure authentication and server-side permission checks.
- Use Supabase Row Level Security where Supabase is configured.
- Do not expose secrets or API keys in frontend code.
- Keep a record of important decisions and access events.
- Use synthetic customer data only in the demonstration.
- Do not connect to real bank accounts, national identity services or credit bureaus without authorised integration and appropriate security controls.

If a required external service is unavailable, implement a clearly labelled simulation with seeded responses. Never pretend that a real bureau check or real banking integration has occurred.

## 8. Important project boundaries

The application ends when the credit decision is recorded and communicated.

Do not implement:
- Final loan documentation or guarantees.
- Insurance processing.
- Lien or vehicle registration.
- Delivery order issuance.
- Vehicle handover.
- Loan account creation.
- Loan disbursement.
- Repayment collection.

Display a clear notice after approval explaining that these activities belong to the bank's existing downstream process.

## 9. Demo data and acceptance tests

Seed realistic fictional customers, approved dealers, vehicle catalogue entries, quotations, applications, officers and policy versions.

Create a Demo Scenarios page that lets the evaluator launch or reset the following cases:

1. All ten rules pass: automated in-principle approval.
2. Confirmed blacklist match: automatic decline.
3. Ambiguous blacklist identity: manual referral.
4. Bureau outage: pending, no approval.
5. Valid existing KYC: no unnecessary identity-document upload.
6. Missing KYC or income evidence: targeted information request.
7. LTV exactly 60%: potentially eligible, subject to all other rules.
8. LTV 60.01%: cannot be automatically approved under the proposed 60% limit.
9. Debt-service ratio exactly 50%: potentially eligible, subject to all other rules.
10. Debt-service ratio 50.01%: cannot be automatically approved under the proposed 50% limit.
11. Loan amount above NPR 2,500,000: refer for authorised review.
12. Changed quotation or expired approval: create a new assessment version.
13. Duplicate submission: no second active application.
14. Customer submits requested documents: return the case for revalidation.
15. Officer proposes a decision: require the appropriate authority.
16. Policy change: require two authorised users.

Each scenario must display the expected outcome and the actual outcome. Resetting demo data should restore the initial seed state without deleting production data if the application is later connected to a real backend.

## 10. Final deliverable

Build a polished, working end-to-end prototype with:
- A login and role selector for demonstration.
- A fully functional Customer Portal.
- A fully functional Bank/Admin Portal.
- A restricted Dealer quotation workflow.
- A deterministic credit rules engine.
- Persistent applications and shared status updates.
- Officer review and escalation workflows.
- Interactive dashboards and reports.
- An audit trail and policy version history.
- A Demo Scenarios page.
- Responsive desktop and mobile layouts.

Prioritise a working end-to-end process over decorative features. Implement the shared data model, application state transitions, validations, decision engine and role permissions before adding visual polish.

Use a consistent application ID and preserve the full decision history. Clearly distinguish simulated integrations from real integrations. Do not use fabricated live credit-bureau data or represent the prototype as a production banking service.

Start by building the complete navigation, shared data model, authentication and role permissions. Then implement the customer workflow, automated appraisal, officer queue, admin controls, dealer quotations and reporting. Verify every acceptance scenario before declaring the prototype complete.