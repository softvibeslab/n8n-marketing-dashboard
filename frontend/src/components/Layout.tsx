/**
 * ===========================================
 * Layout Component
 * ===========================================
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout with header and sidebar
 */
export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
}
