import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Navbar } from './components/Navbar'
import { CustomerPortal } from './components/CustomerPortal/CustomerPortal'
import { BankAdminPortal } from './components/BankAdminPortal/BankAdminPortal'
import { DealerDashboard } from './components/DealerPortal/DealerDashboard'
import { DemoScenariosPage } from './components/DemoScenarios/DemoScenariosPage'

const MainContent: React.FC = () => {
  const { activePortal } = useApp()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <div className="flex-1">
        {activePortal === 'customer' && <CustomerPortal />}
        {activePortal === 'admin' && <BankAdminPortal />}
        {activePortal === 'dealer' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DealerDashboard />
          </div>
        )}
        {activePortal === 'scenarios' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DemoScenariosPage />
          </div>
        )}
      </div>

      {/* Institutional Legal & Boundaries Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="font-semibold text-slate-800">
              Loan Rangers — Auto Loan Credit Decisioning System
            </span>
            <span className="text-slate-400 block sm:inline sm:ml-2">
              University Project Prototype • Digital Retail Banking Nepal
            </span>
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-right font-mono">
            Amounts in Nepalese Rupees (NPR / Rs.) • Deterministic Underwriting Engine v1.4
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2">
          Project Boundary Notice: Preliminary In-Principle approval only. Downstream activities including vehicle registration, lien/hypothecation, delivery orders, loan disbursement, and debt collection reside in the bank's core banking system (CBS).
        </div>
      </footer>
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}

export default App
