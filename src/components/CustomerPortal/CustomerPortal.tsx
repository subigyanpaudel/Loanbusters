import React from 'react'
import { useApp } from '../../context/AppContext'
import { CustomerDashboard } from './CustomerDashboard'
import { ApplicationWizard } from './ApplicationWizard'
import { CustomerApplications } from './CustomerApplications'
import { CustomerApplicationDetail } from './CustomerApplicationDetail'

export const CustomerPortal: React.FC = () => {
  const { customerTab, setCustomerTab } = useApp()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Secondary Sub-navigation for Customer */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setCustomerTab('dashboard')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              customerTab === 'dashboard'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCustomerTab('new_application')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              customerTab === 'new_application'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            New Loan Application
          </button>
          <button
            onClick={() => setCustomerTab('my_applications')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              customerTab === 'my_applications'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Applications
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
          Digital Banking • Nepalese Auto Loan Credit Appraisal
        </div>
      </div>

      <main>
        {customerTab === 'dashboard' && <CustomerDashboard />}
        {customerTab === 'new_application' && <ApplicationWizard />}
        {customerTab === 'my_applications' && <CustomerApplications />}
        {customerTab === 'application_detail' && <CustomerApplicationDetail />}
      </main>
    </div>
  )
}
