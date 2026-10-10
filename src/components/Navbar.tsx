import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { UserRole } from '../types'

export const Navbar: React.FC = () => {
  const {
    currentUser,
    allUsers,
    setCurrentUserRole,
    activePortal,
    setActivePortal,
    notifications,
    markNotificationAsRead,
    resetSystemData
  } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const unreadCount = notifications.filter(
    (n) =>
      !n.read &&
      (n.recipientRole === currentUser.role ||
        (n.recipientCustomerId && n.recipientCustomerId === currentUser.id) ||
        (n.recipientDealerId && n.recipientDealerId === currentUser.dealerId))
  ).length

  const userNotifications = notifications.filter(
    (n) =>
      n.recipientRole === currentUser.role ||
      (n.recipientCustomerId && n.recipientCustomerId === currentUser.id) ||
      (n.recipientDealerId && n.recipientDealerId === currentUser.dealerId)
  )

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
              RETAIL BANKING CREDIT PLATFORM
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              LOAN RANGERS
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
              PROTOTYPE v1.4
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications Trigger */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-xs font-medium px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Notifications {unreadCount > 0 ? `[${unreadCount}]` : `[0]`}
            </button>

            {/* Reset Data Trigger */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-medium px-2.5 py-1.5 rounded border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/50 transition-colors"
            >
              Reset Seed Data
            </button>

            {/* Role Switcher */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <span className="text-xs text-slate-500 hidden sm:inline">User:</span>
              <select
                aria-label="Active User and Role Switcher"
                value={currentUser.id}
                onChange={(e) => {
                  const target = allUsers.find((u) => u.id === e.target.value)
                  if (target) {
                    setCurrentUserRole(target.role as UserRole, target.id)
                  }
                }}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role.toUpperCase()} {u.officerLevel ? `(${u.officerLevel})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Portal Navigation Row */}
        <div className="flex items-center justify-between py-2">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActivePortal('customer')}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                activePortal === 'customer'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Customer Portal
            </button>

            <button
              onClick={() => setActivePortal('admin')}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                activePortal === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Bank & Admin Portal
            </button>

            <button
              onClick={() => setActivePortal('dealer')}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                activePortal === 'dealer'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dealer Portal
            </button>

            <button
              onClick={() => setActivePortal('scenarios')}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors border ${
                activePortal === 'scenarios'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Demo Scenarios (16 Acceptance Tests)
            </button>
          </nav>

          <div className="hidden md:flex items-center text-xs text-slate-500 font-mono">
            Active Role: <span className="ml-1 font-semibold text-slate-800">{currentUser.role.toUpperCase()}</span>
            {currentUser.officerAuthorityLimit && (
              <span className="ml-2 text-slate-400">
                (Authority: Rs. {currentUser.officerAuthorityLimit.toLocaleString('en-IN')})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="absolute right-4 top-16 w-96 max-w-full bg-white border border-slate-300 shadow-lg rounded p-4 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              System Notifications ({userNotifications.length})
            </span>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              [ Close ]
            </button>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
            {userNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No notifications for active user.</p>
            ) : (
              userNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded border text-xs ${
                    n.read ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white border-slate-300 text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    {!n.read && (
                      <button
                        onClick={() => markNotificationAsRead(n.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-900 underline ml-2"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                  <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {n.applicationId && ` • ${n.applicationId}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded border border-slate-300 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Confirm Demo Data Reset
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will restore all applications, quotations, vehicle catalogue, credit policies, and customer records to initial demonstration state.
            </p>
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetSystemData()
                  setShowResetConfirm(false)
                }}
                className="text-xs px-3 py-1.5 rounded bg-rose-700 text-white hover:bg-rose-800"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
