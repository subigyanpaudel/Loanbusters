import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Application } from '../../types'

export const CustomerApplications: React.FC = () => {
  const {
    currentUser,
    applications,
    setCustomerTab,
    setSelectedApplicationId
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')

  const userApplications = applications.filter((a) => a.customerId === currentUser.id)

  const filteredApps = userApplications.filter(
    (a) =>
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.quotation.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.quotation.model.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: Application['status']) => {
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

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Applications Archive
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">My Auto Loan Applications</h2>
          </div>
          <button
            onClick={() => setCustomerTab('new_application')}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 self-start sm:self-auto"
          >
            Start New Application
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by Application ID, Vehicle Make, or Model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Applications Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Application ID</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">Requested Loan</th>
                <th className="p-3">Monthly EMI</th>
                <th className="p-3">Submission Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions Required</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No loan applications found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const pendingReqs = app.documentRequests.filter((r) => !r.resolved)
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
                        <div className="font-semibold text-slate-900">
                          {app.quotation.make} {app.quotation.model}
                        </div>
                        <div className="text-[11px] text-slate-500">{app.quotation.variant}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        Rs. {app.requestedLoanAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono text-slate-800">
                        Rs. {app.emiMonthly.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-slate-600 font-mono">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {pendingReqs.length > 0 ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Upload Requested ({pendingReqs.length})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedApplicationId(app.id)
                            setCustomerTab('application_detail')
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
