import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Application } from '../../types'
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer'

export const AllApplications: React.FC = () => {
  const { applications, dealers } = useApp()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dealerFilter, setDealerFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [maskData, setMaskData] = useState(true)

  const pageSize = 8

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(search.toLowerCase()) ||
      app.customerName.toLowerCase().includes(search.toLowerCase()) ||
      app.quotation.make.toLowerCase().includes(search.toLowerCase()) ||
      app.quotation.model.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
    const matchesDealer = dealerFilter === 'ALL' || app.quotation.dealerName === dealerFilter
    return matchesSearch && matchesStatus && matchesDealer
  })

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return sortOrder === 'desc' ? diff : -diff
    }
    if (sortBy === 'amount') {
      const diff = b.requestedLoanAmount - a.requestedLoanAmount
      return sortOrder === 'desc' ? diff : -diff
    }
    if (sortBy === 'status') {
      const diff = a.status.localeCompare(b.status)
      return sortOrder === 'asc' ? diff : -diff
    }
    return 0
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const exportCsv = () => {
    const headers = [
      'Application ID',
      'Customer Ref',
      'Vehicle',
      'Dealer',
      'Requested Loan',
      'Monthly EMI',
      'LTV %',
      'DSR %',
      'Status',
      'Submission Date'
    ]
    const rows = filtered.map((a) => [
      a.id,
      maskData ? a.maskedAccount : a.customerName,
      `${a.quotation.make} ${a.quotation.model}`,
      `"${a.quotation.dealerName}"`,
      a.requestedLoanAmount,
      a.emiMonthly,
      a.ltvPercent,
      a.debtServiceRatioPercent,
      a.status,
      a.createdAt.split('T')[0]
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `LoanRangers_Applications_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Central Loan Registry
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              All Auto Loan Applications ({filtered.length})
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMaskData(!maskData)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium"
            >
              Masking: {maskData ? 'Active' : 'Off'}
            </button>
            <button
              onClick={exportCsv}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
            >
              Export Authorised CSV
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Search Registry:</label>
            <input
              type="text"
              placeholder="Search ID, customer, make..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Status Filter:</label>
            <select
              aria-label="Filter Applications by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-800"
            >
              <option value="ALL">All Outcomes</option>
              <option value="approved_in_principle">Approved In-Principle</option>
              <option value="referred">Referred for Review</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Dealer Filter:</label>
            <select
              aria-label="Filter Applications by Dealer"
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-800"
            >
              <option value="ALL">All Approved Dealers</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Sort Registry By:</label>
            <select
              aria-label="Sort Registry By Field"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any]
                setSortBy(sb)
                setSortOrder(so)
              }}
              className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-800"
            >
              <option value="date-desc">Newest Submission First</option>
              <option value="date-asc">Oldest Submission First</option>
              <option value="amount-desc">Highest Loan Amount</option>
              <option value="amount-asc">Lowest Loan Amount</option>
              <option value="status-asc">Status Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Application ID</th>
                <th className="p-3">Customer Reference</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">Dealer</th>
                <th className="p-3">Requested Loan</th>
                <th className="p-3">LTV / DSR</th>
                <th className="p-3">Submission Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Officer</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-400">
                    No applications match current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((app) => (
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
                        {maskData ? 'Aarav S****' : app.customerName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{app.maskedAccount}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">
                        {app.quotation.make} {app.quotation.model}
                      </div>
                      <div className="text-[11px] text-slate-500">{app.quotation.variant}</div>
                    </td>
                    <td className="p-3 text-slate-700">{app.quotation.dealerName}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      Rs. {app.requestedLoanAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {app.ltvPercent.toFixed(1)}% / {app.debtServiceRatioPercent.toFixed(1)}%
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {app.createdAt.split('T')[0]}
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
                    <td className="p-3 text-slate-600">
                      {app.assignedOfficerName || 'Auto System'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page {currentPage} of {totalPages} ({filtered.length} total applications)
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-2.5 py-1 border rounded ${
                currentPage === 1 ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1 border rounded ${
                currentPage === totalPages ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  )
}
