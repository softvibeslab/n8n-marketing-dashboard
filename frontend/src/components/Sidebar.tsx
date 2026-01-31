/**
 * ===========================================
 * Sidebar Component
 * ===========================================
 */

import { NavLink } from 'react-router-dom';

/**
 * Navigation sidebar
 */
export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/strategy', label: 'Strategy', icon: '🎯' },
    { path: '/workflows', label: 'Workflows', icon: '⚙️' },
    { path: '/assets', label: 'Assets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/assistant', label: 'AI Assistant', icon: '🤖' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
