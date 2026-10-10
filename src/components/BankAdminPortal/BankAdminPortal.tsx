import React from 'react'
import { useApp } from '../../context/AppContext'
import { AdminSidebar } from './AdminSidebar'
import { AdminOverview } from './AdminOverview'
import { AllApplications } from './AllApplications'
import { OfficerReviewQueue } from './OfficerReviewQueue'
import { CustomerKYCRecords } from './CustomerKYCRecords'
import { DealerManagement } from './DealerManagement'
import { VehicleCatalogue } from './VehicleCatalogue'
import { CreditRulesSettings } from './CreditRulesSettings'
import { ReportsAnalytics } from './ReportsAnalytics'
import { AuditTrailView } from './AuditTrailView'

export const BankAdminPortal: React.FC = () => {
  const { adminTab } = useApp()

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {adminTab === 'overview' && <AdminOverview />}
        {adminTab === 'all_apps' && <AllApplications />}
        {adminTab === 'review_queue' && <OfficerReviewQueue />}
        {adminTab === 'auto_decisions' && <AllApplications />}
        {adminTab === 'pending_apps' && <AllApplications />}
        {adminTab === 'kyc_records' && <CustomerKYCRecords />}
        {adminTab === 'dealers' && <DealerManagement />}
        {adminTab === 'vehicles' && <VehicleCatalogue />}
        {adminTab === 'policy_settings' && <CreditRulesSettings />}
        {adminTab === 'reports' && <ReportsAnalytics />}
        {adminTab === 'audit_trail' && <AuditTrailView />}
      </main>
    </div>
  )
}
