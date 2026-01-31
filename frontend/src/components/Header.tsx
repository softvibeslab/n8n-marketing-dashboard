/**
 * ===========================================
 * Header Component
 * ===========================================
 */

import { useAuth } from '../hooks/useAuth';

/**
 * Application header
 */
export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary-600">n8n Marketing Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
