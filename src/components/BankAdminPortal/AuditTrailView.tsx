import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.applicationId && log.applicationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'ALL' || log.actorRole.toLowerCase() === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Governance & Security Audit Repository
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Immutable System Audit Trail ({filteredLogs.length} Events)
            </h1>
          </div>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded">
            Tamper-Resistant Storage Active
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Under banking compliance mandates, all user actions, consent recordings, credit decisions, policy modifications, and discretionary overrides are recorded into this append-only audit trail. Entries cannot be edited or deleted.
        </p>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
          <div>
            <input
              type="text"
              placeholder="Search by action, details, actor, or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-slate-50"
            />
          </div>
          <div>
            <select
              aria-label="Filter Audit Logs by Actor Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-800"
            >
              <option value="ALL">All Actor Roles</option>
              <option value="customer">Customer Actions</option>
              <option value="officer">Bank Officer Actions</option>
              <option value="admin">Administrator Actions</option>
              <option value="dealer">Dealer Actions</option>
              <option value="system">System / Automated Engine</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Application ID</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 text-[10px]">{log.id}</td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{log.actorRole}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-900">
                      {log.applicationId || '—'}
                    </td>
                    <td className="p-3 text-slate-700 max-w-md leading-relaxed text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
