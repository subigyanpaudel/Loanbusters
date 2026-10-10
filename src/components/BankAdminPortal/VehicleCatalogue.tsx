import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Vehicle } from '../../types'

export const VehicleCatalogue: React.FC = () => {
  const { vehicles, addVehicle, toggleVehicleStatus } = useApp()

  const [showAddModal, setShowAddModal] = useState(false)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [variant, setVariant] = useState('')
  const [eligibleValue, setEligibleValue] = useState<number>(4500000)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!make || !model) return
    addVehicle({
      make,
      model,
      variant: variant || 'Standard Variant',
      category: 'Private',
      eligibleValue,
      active: true,
      effectiveDate: new Date().toISOString().split('T')[0]
    })
    setShowAddModal(false)
    setMake('')
    setModel('')
    setVariant('')
    setEligibleValue(4500000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Asset Master Catalogue
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Approved Vehicle Catalogue ({vehicles.length} Models)
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
          >
            Add New Vehicle Model
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Under bank retail credit policy (Rule R7), only new private passenger vehicles listed in this approved catalogue are eligible for automated credit financing. Commercial vehicles and unverified imports are strictly excluded.
        </p>

        {/* Vehicles Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Vehicle Code</th>
                <th className="p-3">Make & Model</th>
                <th className="p-3">Trim / Variant</th>
                <th className="p-3">Category</th>
                <th className="p-3">Eligible Value (NPR)</th>
                <th className="p-3">Effective Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{v.id}</td>
                  <td className="p-3 font-bold text-slate-900">
                    {v.make} {v.model}
                  </td>
                  <td className="p-3 text-slate-700">{v.variant}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {v.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    Rs. {v.eligibleValue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-slate-500">{v.effectiveDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                        v.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      {v.active ? 'ELIGIBLE' : 'SUSPENDED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleVehicleStatus(v.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border ${
                        v.active
                          ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {v.active ? 'Suspend' : 'Reinstate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white border border-slate-300 rounded max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Add Vehicle to Approved Catalogue
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Make / Brand:</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Hyundai"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Model Name:</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Creta"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Variant / Trim:</label>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="e.g. SX (O) 1.5 Turbo Petrol DCT"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Eligible Vehicle Price (NPR):</label>
                <input
                  type="number"
                  required
                  min={500000}
                  step={50000}
                  value={eligibleValue}
                  onChange={(e) => setEligibleValue(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600">
                Category automatically locked to <strong>Private</strong>. Commercial, taxi, or fleet vehicles cannot be enrolled in retail auto loan product catalogue.
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
                Enrol Vehicle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
