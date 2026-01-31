/**
 * ===========================================
 * Assets Page
 * ===========================================
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Asset, AssetType } from '@n8nvibes/shared';

/**
 * Asset management page
 */
export default function AssetsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showGenerator, setShowGenerator] = useState(false);

  // List campaigns query
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.get<{ data: { items: typeof campaigns } }>('/strategy/campaigns');
      return response.data.data.items;
    },
  });

  // List assets query
  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', selectedCampaign, selectedType],
    queryFn: async () => {
      if (!selectedCampaign) return { items: [], total: 0 };
      const response = await api.get<{ data: typeof assetsData }>(`/assets?campaignId=${selectedCampaign}&type=${selectedType === 'all' ? '' : selectedType}`);
      return response.data.data;
    },
    enabled: !!selectedCampaign,
  });

  const assets = assetsData?.items || [];

  const typeColors: Record<AssetType, string> = {
    TEXT: 'bg-blue-100 text-blue-800',
    IMAGE: 'bg-green-100 text-green-800',
    VIDEO: 'bg-purple-100 text-purple-800',
    DESIGN: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        <p className="text-gray-600">Create and manage your marketing content assets</p>
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

          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>

          <button
            onClick={() => setShowGenerator(true)}
            disabled={!selectedCampaign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            + Generate with AI
          </button>
        </div>
      </div>

      {/* No campaign selected */}
      {!selectedCampaign && (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📁</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Campaign</h2>
            <p className="text-gray-600">Choose a campaign to view and manage assets</p>
          </div>
        </div>
      )}

      {/* Asset Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Generate Asset with AI</h2>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Asset Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['TEXT', 'IMAGE', 'VIDEO', 'DESIGN'] as AssetType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {/* TODO: Handle type selection */}}
                      className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">
                        {type === 'TEXT' ? '📝' : type === 'IMAGE' ? '🖼️' : type === 'VIDEO' ? '🎬' : '🎨'}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you want to create
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Create a promotional email for our summer sale with 20% discount on all products. Use an exciting and urgent tone."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific about the content you want to generate
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Friendly</option>
                    <option>Exciting</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Modern</option>
                    <option>Classic</option>
                    <option>Minimalist</option>
                    <option>Bold</option>
                    <option>Playful</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Generate Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      {selectedCampaign && !isLoading && assets.length === 0 && (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assets Yet</h2>
            <p className="text-gray-600 mb-4">Create your first AI-generated asset</p>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Generate Asset
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="card">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-3">Loading assets...</p>
          </div>
        </div>
      )}

      {selectedCampaign && assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset: any) => (
            <div key={asset.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    typeColors[asset.type] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {asset.type}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.status === 'GENERATED'
                      ? 'bg-green-100 text-green-800'
                      : asset.status === 'PUBLISHED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {asset.status}
                </span>
              </div>

              {asset.type === 'TEXT' && asset.content && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 line-clamp-4">{asset.content}</p>
                </div>
              )}

              {asset.type === 'IMAGE' && asset.fileUrl && (
                <div className="mb-3 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={asset.fileUrl} alt="Generated asset" className="w-full h-full object-cover" />
                </div>
              )}

              {asset.isAIGenerated && (
                <div className="text-xs text-gray-500 mb-3">✨ AI Generated</div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
