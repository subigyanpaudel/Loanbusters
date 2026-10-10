import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { DEMO_SCENARIOS } from '../../services/scenarioRunner'

export const DemoScenariosPage: React.FC = () => {
  const { scenarioResults, runScenario, runAllScenarios, resetSystemData, setActivePortal, setCustomerTab, setSelectedApplicationId } = useApp()
  const [filterMode, setFilterMode] = useState<'ALL' | 'EXECUTED'>('ALL')

  const executedCount = Object.keys(scenarioResults).length
  const matchedCount = Object.values(scenarioResults).filter((r) => r.matched).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Automated Verification Suite
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Acceptance Test Scenarios (16 Benchmark Cases)
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runAllScenarios}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              Run All 16 Test Scenarios
            </button>
            <button
              onClick={resetSystemData}
              className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
            >
              Reset Seed Data
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          This test console evaluates all sixteen acceptance scenarios defined in <strong>Section 9 of the Business Requirements Specification</strong>. Each scenario demonstrates deterministic credit policy enforcement, exception management, and boundary precision (e.g. 60.00% vs 60.01% LTV, 50.00% vs 50.01% DSR, Maker-Checker dual approvals).
        </p>

        {/* Scorecard */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Defined Cases</span>
            <span className="font-mono font-bold text-slate-900 text-base">16 Scenarios</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Executed Tests</span>
            <span className="font-mono font-bold text-slate-900 text-base">{executedCount} / 16</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Specification Matches</span>
            <span className="font-mono font-bold text-emerald-700 text-base">
              {matchedCount} Passed
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block">Compliance Status</span>
            <span className="font-mono font-bold text-slate-900 text-base">
              {executedCount === 16 && matchedCount === 16 ? '100% SPEC VERIFIED' : 'READY TO RUN'}
            </span>
          </div>
        </div>
      </div>

      {/* Scenarios Grid / List */}
      <div className="space-y-4">
        {DEMO_SCENARIOS.map((sc) => {
          const res = scenarioResults[sc.id]
          const isExecuted = !!res

          return (
            <div
              key={sc.id}
              className={`p-5 rounded border transition-colors ${
                isExecuted
                  ? res.matched
                    ? 'bg-white border-slate-300'
                    : 'bg-rose-50/50 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Case #{sc.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {sc.title.split('. ')[1]}
                    </h3>
                    {isExecuted && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          res.matched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {res.matched ? '[ PASS / MATCH ]' : '[ MISMATCH ]'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {sc.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => runScenario(sc.id)}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 whitespace-nowrap"
                  >
                    {isExecuted ? 'Rerun Scenario' : 'Run Scenario'}
                  </button>
                  {res?.applicationId && (
                    <button
                      onClick={() => {
                        setSelectedApplicationId(res.applicationId!)
                        setActivePortal('customer')
                        setCustomerTab('application_detail')
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 whitespace-nowrap"
                    >
                      View App
                    </button>
                  )}
                </div>
              </div>

              {/* Expected vs Actual Comparison Box */}
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Specification Expected Outcome:
                  </div>
                  <div className="font-medium text-slate-800 mt-1">
                    {sc.expectedOutcome}
                  </div>
                </div>

                <div className={`p-3 border rounded ${
                  isExecuted
                    ? res.matched
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Engine Actual Outcome:
                  </div>
                  <div className="font-medium text-slate-900 mt-1">
                    {isExecuted ? res.actualDetails : 'Pending execution. Click "Run Scenario" to evaluate.'}
                  </div>
                  {isExecuted && res.executedAt && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Evaluated at {res.executedAt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
