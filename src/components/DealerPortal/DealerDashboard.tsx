import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Vehicle } from '../../types'

export const DealerDashboard: React.FC = () => {
  const {
    currentUser,
    dealers,
    vehicles,
    quotations,
    applications,
    createQuotation
  } = useApp()

  const currentDealer =
    dealers.find((d) => d.id === currentUser.dealerId) || dealers[0]

  const dealerQuotations = quotations.filter((q) => q.dealerId === currentDealer.id)

  // Filter associated consented applications for this dealer only!
  const dealerApplications = applications.filter(
    (a) => a.quotation.dealerId === currentDealer.id
  )

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '')
  const [quotedPrice, setQuotedPrice] = useState<number>(vehicles[0]?.eligibleValue || 4000000)
  const [expiryDays, setExpiryDays] = useState<number>(30)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0]

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle) return

    const expiry = new Date()
    expiry.setDate(expiry.getDate() + expiryDays)

    const newQuo = createQuotation({
      dealerId: currentDealer.id,
      dealerName: currentDealer.name,
      vehicleId: selectedVehicle.id,
      make: selectedVehicle.make,
      model: selectedVehicle.model,
      variant: selectedVehicle.variant,
      eligiblePrice: quotedPrice,
      quotationDate: new Date().toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0]
    })

    setShowCreateModal(false)
    setSuccessMessage(`Digital Quotation ${newQuo.id} generated successfully.`)
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
      {/* Dealer Header */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Dealer Portal
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              {currentDealer.name} ({currentDealer.code})
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Authorized Representative: <strong>{currentUser.name}</strong> • Channel ID: <span className="font-mono">{currentDealer.id}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setSuccessMessage(null)
              setShowCreateModal(true)
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 self-start sm:self-auto"
          >
            Create New Digital Quotation
          </button>
        </div>

        {/* Dealer Privacy Policy Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 mt-4 leading-relaxed space-y-1">
          <div className="font-bold text-slate-800 uppercase text-[11px]">
            Restricted Partner Data Access Policy
          </div>
          <p>
            Pursuant to the Business Requirements Document and privacy regulations, dealer accounts are restricted exclusively to vehicle quotations created by your dealership and consented application milestone statuses. Access to applicant bank transactions, salaries, CIB bureau credit reports, blacklist registries, or internal officer credit notes is strictly prohibited.
          </p>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 font-medium mt-4">
            {successMessage}
          </div>
        )}
      </div>

      {/* Quotations List */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Dealership Quotation Registry ({dealerQuotations.length} Active / Issued)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Channel: {currentDealer.code}</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Quotation ID</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">Quoted Price (NPR)</th>
                <th className="p-3">Issuance Date</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dealerQuotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No quotations generated by this dealership.
                  </td>
                </tr>
              ) : (
                dealerQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{q.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{q.make} {q.model}</div>
                      <div className="text-[11px] text-slate-500">{q.variant}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      Rs. {q.eligiblePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{q.quotationDate}</td>
                    <td className="p-3 font-mono text-slate-600">{q.expiryDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          q.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consented Application Statuses Table */}
      <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Associated Applications with Customer Consent ({dealerApplications.length})
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Privacy-Filtered View</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Application Reference</th>
                <th className="p-3">Customer Reference</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Quotation ID</th>
                <th className="p-3">Current Application Milestone</th>
                <th className="p-3">Submission Date</th>
                <th className="p-3">Decision Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dealerApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No active consented loan applications linked to this dealer's quotations.
                  </td>
                </tr>
              ) : (
                dealerApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{app.id}</td>
                    <td className="p-3 font-mono text-slate-700">{app.maskedAccount}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {app.quotation.make} {app.quotation.model}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{app.quotationId}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{app.createdAt.split('T')[0]}</td>
                    <td className="p-3 font-mono text-slate-600">
                      {app.approvalExpiryDate || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white border border-slate-300 rounded max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Create Digital Vehicle Quotation
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                [ Cancel ]
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Model from Approved Catalogue:
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value)
                    const v = vehicles.find((item) => item.id === e.target.value)
                    if (v) setQuotedPrice(v.eligibleValue)
                  }}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                >
                  {vehicles.filter((v) => v.active).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.variant}) — Catalogue Ref: Rs. {v.eligibleValue.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quoted Price in NPR (Excluding Insurance & Accessories):
                </label>
                <input
                  type="number"
                  required
                  min={500000}
                  step={25000}
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quotation Validity Window:
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value={15}>15 Calendar Days</option>
                  <option value={30}>30 Calendar Days (Standard Lock)</option>
                  <option value={45}>45 Calendar Days</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600">
                Dealer Name locked to <strong>{currentDealer.name}</strong>. Quotation cannot be changed once customer confirms application.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800"
              >
                Generate Quotation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
