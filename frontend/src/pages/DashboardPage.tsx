/**
 * ===========================================
 * Dashboard Page
 * ===========================================
 */

/**
 * Dashboard home page
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your n8n Marketing Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
          <p className="text-gray-600 text-sm mt-1">Track your campaign performance</p>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900">Workflows</h3>
          <p className="text-gray-600 text-sm mt-1">Manage your automation workflows</p>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">📁</div>
          <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
          <p className="text-gray-600 text-sm mt-1">View generated content assets</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Create a marketing strategy</li>
          <li>Generate AI-powered workflows</li>
          <li>Deploy workflows to n8n</li>
          <li>Monitor performance analytics</li>
        </ol>
      </div>
    </div>
  );
}
