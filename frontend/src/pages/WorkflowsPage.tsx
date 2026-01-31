/**
 * ===========================================
 * Workflows Page
 * ===========================================
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { WorkflowGenerator } from '../components/WorkflowGenerator';

type Tab = 'list' | 'generate';

/**
 * Workflow management page
 */
export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('list');

  // List workflows query
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await api.get<{ data: typeof workflowsData }>('/workflows');
      return response.data.data;
    },
  });

  const workflows = workflowsData?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        <p className="text-gray-600">Create and manage your n8n automation workflows</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate with AI
          </button>
        </nav>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="card">
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-3">Loading workflows...</p>
              </div>
            </div>
          ) : workflows.length === 0 ? (
            <div className="card">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⚡</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workflows Yet</h2>
                <p className="text-gray-600 mb-4">Create your first AI-powered workflow</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Generate Workflow
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow: any) => (
                <div key={workflow.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.status === 'DEPLOYED'
                          ? 'bg-green-100 text-green-800'
                          : workflow.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {workflow.status}
                    </span>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workflow.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>v{workflow.version}</span>
                    {workflow.isDeployed && (
                      <span className="text-green-600 font-medium">Deployed</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && <WorkflowGenerator />}
    </div>
  );
}
