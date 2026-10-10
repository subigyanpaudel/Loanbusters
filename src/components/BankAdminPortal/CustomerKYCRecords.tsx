import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { StorageService } from '../../services/storage'

export const CustomerKYCRecords: React.FC = () => {
  const { customers } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [localCustomers, setLocalCustomers] = useState(customers)

  const customerList = Object.values(localCustomers)

  const filtered = customerList.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citizenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.maskedAccount.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateKyc = (customerId: string, newStatus: 'verified' | 'pending' | 'outdated') => {
    const updated = {
      ...localCustomers,
      [customerId]: {
        ...localCustomers[customerId],
        kycStatus: newStatus,
        kycVerifiedDate: newStatus === 'verified' ? new Date().toISOString().split('T')[0] : localCustomers[customerId].kycVerifiedDate
      }
    }
    setLocalCustomers(updated)
    StorageService.saveCustomers(updated)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Identity & KYC Master Registry
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Customer KYC & Credit Profiles ({customerList.length})
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded">
            Biometric & CBS Connected
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Under Rule R1, existing individual bank customers with verified KYC records do not need to re-upload identity documentation. Outdated or pending records trigger targeted information requests.
        </p>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by customer name, account reference, or citizenship ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded bg-slate-50"
          />
        </div>

        {/* Customer Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Customer ID</th>
                <th className="p-3">Legal Full Name</th>
                <th className="p-3">Account Number</th>
                <th className="p-3">Citizenship ID</th>
                <th className="p-3">Age & DOB</th>
                <th className="p-3">Verified Gross Monthly</th>
                <th className="p-3">Existing Debt</th>
                <th className="p-3">CIB Bureau Score</th>
                <th className="p-3">KYC Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{c.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{c.fullName}</td>
                  <td className="p-3 font-mono text-slate-600">{c.maskedAccount}</td>
                  <td className="p-3 font-mono text-slate-700">{c.citizenNumber}</td>
                  <td className="p-3 text-slate-600">{c.age} yrs ({c.dateOfBirth})</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    Rs. {c.salaryMonthlyGross.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    Rs. {c.existingMonthlyDebt.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono">
                    <span
                      className={`font-bold ${
                        c.creditHistorySummary.creditBureauScore >= 700
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {c.creditHistorySummary.creditBureauScore}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                        c.kycStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : c.kycStatus === 'outdated'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {c.kycStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {c.kycStatus === 'outdated' ? (
                      <button
                        onClick={() => handleUpdateKyc(c.id, 'verified')}
                        className="px-2.5 py-1 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900"
                      >
                        Verify KYC
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateKyc(c.id, 'outdated')}
                        className="px-2.5 py-1 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
                      >
                        Set Outdated
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
