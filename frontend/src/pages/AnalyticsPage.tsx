/**
 * ===========================================
 * Analytics Page
 * ===========================================
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Analytics and reporting page
 */
export default function AnalyticsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [period, setPeriod] = useState<string>('30d');
  const [showInsights, setShowInsights] = useState(false);

  // List campaigns query
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.get<{ data: { items: typeof campaigns } }>('/strategy/campaigns');
      return response.data.data.items;
    },
  });

  // Get analytics metrics query
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['analytics', selectedCampaign, period],
    queryFn: async () => {
      if (!selectedCampaign) return null;
      const response = await api.get<{ data: typeof metricsData }>(`/analytics/campaigns/${selectedCampaign}?period=${period}`);
      return response.data.data;
    },
    enabled: !!selectedCampaign,
  });

  // Get AI insights mutation
  const insightsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCampaign || !metricsData) return;
      const response = await api.post<{ data: typeof insightsData }>('/analytics/insights', {
        campaignId: selectedCampaign,
        metrics: metricsData.summary || metricsData,
        goals: [], // Would be populated from campaign
      });
      return response.data.data;
    },
  });

  const metrics = metricsData?.summary || {};
  const breakdown = metricsData?.breakdown || [];
  const insightsData = insightsMutation.data;

  const formatMetric = (value: number | undefined, decimals = 0) => {
    if (value === undefined) return 'N/A';
    return decimals > 0 ? value.toFixed(decimals) : value.toLocaleString();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your campaign performance and metrics</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a campaign...</option>
              {campaigns?.map((campaign: any) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={() => insightsMutation.mutate()}
            disabled={!selectedCampaign || !metricsData || insightsMutation.isPending}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {insightsMutation.isPending ? 'Analyzing...' : '✨ AI Insights'}
          </button>

          <button
            onClick={() => {/* TODO: Generate report */}}
            disabled={!selectedCampaign}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
          >
            📊 Export Report
          </button>
        </div>
      </div>

      {/* No campaign selected */}
      {!selectedCampaign && (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Campaign</h2>
            <p className="text-gray-600">Choose a campaign to view analytics</p>
          </div>
        </div>
      )}

      {/* Loading metrics */}
      {metricsLoading && selectedCampaign && (
        <div className="card">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-3">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* Metrics Display */}
      {selectedCampaign && !metricsLoading && metricsData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Impressions</div>
              <div className="text-2xl font-bold text-gray-900">{formatMetric(metrics.impressions)}</div>
              <div className="text-xs text-gray-500 mt-1">Total views</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Clicks</div>
              <div className="text-2xl font-bold text-gray-900">{formatMetric(metrics.clicks)}</div>
              <div className="text-xs text-gray-500 mt-1">User interactions</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Conversions</div>
              <div className="text-2xl font-bold text-gray-900">{formatMetric(metrics.conversions)}</div>
              <div className="text-xs text-gray-500 mt-1">Successful actions</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Revenue</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.revenue)}</div>
              <div className="text-xs text-gray-500 mt-1">Total generated</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">CTR (Click-Through Rate)</div>
              <div className="text-2xl font-bold text-gray-900">{formatMetric(metrics.ctr, 2)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(metrics.ctr || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 mb-1">CPC (Cost Per Click)</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.cpc)}</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 mb-1">CPA (Cost Per Acquisition)</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.cpa)}</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 mb-1">ROI (Return on Investment)</div>
              <div className={`text-2xl font-bold ${(metrics.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMetric(metrics.roi, 2)}%
              </div>
            </div>
          </div>

          {/* Spend vs Revenue */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend vs Revenue</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Spend</span>
                  <span className="font-medium text-gray-900">{formatCurrency(metrics.spend)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-medium text-gray-900">{formatCurrency(metrics.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 pt-2">
                Profit: <span className={`font-medium ${(metrics.revenue || 0) - (metrics.spend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency((metrics.revenue || 0) - (metrics.spend || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Trend Chart (Simple Bar Representation) */}
          {breakdown.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
              <div className="space-y-2">
                {breakdown.slice(0, 14).map((day: any, index) => {
                  const maxValue = Math.max(...breakdown.map((d: any) => d.impressions || 0));
                  const value = day.impressions || 0;
                  const percentage = (value / maxValue) * 100;

                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-600">{day.date}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-600 h-6 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-24 text-sm text-gray-900 text-right">
                        {formatMetric(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Insights Panel */}
          {showInsights && insightsData && (
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">✨ AI Insights</h3>
                <button
                  onClick={() => setShowInsights(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {insightsData.insights && insightsData.insights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                    <ul className="space-y-2">
                      {insightsData.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-purple-600">💡</span>
                          <span className="text-sm text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insightsData.recommendations && insightsData.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {insightsData.recommendations.map((rec: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded ${
                            rec.priority === 'high'
                              ? 'bg-red-100 border border-red-200'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 border border-yellow-200'
                              : 'bg-green-100 border border-green-200'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{rec.category}</div>
                          <div className="text-sm text-gray-700 mt-1">{rec.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insights Button */}
          {!showInsights && (
            <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Get AI-Powered Insights</h3>
                  <p className="text-sm text-gray-600">
                    Analyze your performance and get actionable recommendations
                  </p>
                </div>
                <button
                  onClick={() => insightsMutation.mutate()}
                  disabled={insightsMutation.isPending}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {insightsMutation.isPending ? 'Analyzing...' : 'Generate Insights'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
