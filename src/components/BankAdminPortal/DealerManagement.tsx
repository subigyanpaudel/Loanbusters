import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Dealer } from '../../types'

export const DealerManagement: React.FC = () => {
  const { dealers, quotations, addDealer, toggleDealerStatus } = useApp()

  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return
    addDealer({
      name,
      code,
      contactPerson,
      email,
      phone,
      address,
      active: true
    })
    setShowAddModal(false)
    setName('')
    setCode('')
    setContactPerson('')
    setEmail('')
    setPhone('')
    setAddress('')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Partner Channel Management
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Approved Vehicle Dealers ({dealers.length})
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
          >
            Add Approved Dealer
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Only quotations from active, approved dealers are eligible for automated auto loan credit appraisal under Rule R7. Dealers can generate quotations and view consented customer application statuses only.
        </p>

        {/* Dealers Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Dealer Code</th>
                <th className="p-3">Dealer Legal Name</th>
                <th className="p-3">Contact Person</th>
                <th className="p-3">Contact Email & Phone</th>
                <th className="p-3">Address</th>
                <th className="p-3">Quotations Created</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dealers.map((dealer) => {
                const quoCount = quotations.filter((q) => q.dealerId === dealer.id).length
                return (
                  <tr key={dealer.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{dealer.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{dealer.name}</td>
                    <td className="p-3 text-slate-700">{dealer.contactPerson}</td>
                    <td className="p-3 text-slate-600">
                      <div>{dealer.email}</div>
                      <div className="text-[10px] text-slate-400">{dealer.phone}</div>
                    </td>
                    <td className="p-3 text-slate-600">{dealer.address}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{quoCount} Active/Total</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          dealer.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {dealer.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleDealerStatus(dealer.id)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border ${
                          dealer.active
                            ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {dealer.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dealer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white border border-slate-300 rounded max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Add Approved Vehicle Dealer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                [ Cancel ]
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dealer Legal Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kathmandu Motors Pvt. Ltd."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dealer Code:</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. KM-THAPATHALI"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person:</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Bajracharya"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +977-1-4245678"
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@dealer.com.np"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Thapathali, Kathmandu"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800"
              >
                Save Dealer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
