import React from 'react'
import { useApp, AdminTab } from '../../context/AppContext'

export const AdminSidebar: React.FC = () => {
  const { adminTab, setAdminTab, applications, currentUser } = useApp()

  const referredCount = applications.filter((a) => a.status === 'referred').length
  const pendingCount = applications.filter((a) => a.status === 'pending').length
  const autoApprovedCount = applications.filter(
    (a) => a.status === 'approved_in_principle' && (!a.assignedOfficerId || a.assignedOfficerId === '')
  ).length

  const navItems: Array<{ id: AdminTab; label: string; badge?: number }> = [
    { id: 'overview', label: 'Admin Overview' },
    { id: 'all_apps', label: 'All Applications', badge: applications.length },
    { id: 'review_queue', label: 'Officer Review Queue', badge: referredCount },
    { id: 'auto_decisions', label: 'Automated Decisions', badge: autoApprovedCount },
    { id: 'pending_apps', label: 'Pending Applications', badge: pendingCount },
    { id: 'kyc_records', label: 'Customer & KYC Records' },
    { id: 'dealers', label: 'Dealer Management' },
    { id: 'vehicles', label: 'Vehicle Catalogue' },
    { id: 'policy_settings', label: 'Credit Rules & Policy (Maker-Checker)' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'audit_trail', label: 'Audit Trail' }
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="pb-3 mb-3 border-b border-slate-100">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            OPERATIONS NAVIGATION
          </div>
          <div className="text-xs font-semibold text-slate-900 mt-0.5">
            Credit Assessment Unit
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = adminTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ml-2 ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : item.id === 'review_queue'
                        ? 'bg-amber-100 text-amber-800'
                        : item.id === 'pending_apps'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <div>
          Operator: <strong className="text-slate-800">{currentUser.name}</strong>
        </div>
        <div>
          Role: <strong className="text-slate-800 uppercase">{currentUser.role}</strong>
        </div>
        {currentUser.officerAuthorityLimit && (
          <div>
            Discretionary Cap: <span className="font-mono text-slate-700">Rs. {currentUser.officerAuthorityLimit.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
