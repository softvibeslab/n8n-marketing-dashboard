/**
 * ===========================================
 * Strategy Input Form Component
 * ===========================================
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StrategyInput, StrategyAnalysisResponse } from '@n8nvibes/shared';

interface StrategyInputFormProps {
  onSuccess?: (campaignId: string) => void;
}

export function StrategyInputForm({ onSuccess }: StrategyInputFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [targetAudience, setTargetAudience] = useState<StrategyInput['targetAudience']>({
    ageRange: '',
    interests: [],
    location: '',
    gender: '',
    language: '',
  });

  const [campaignGoals, setCampaignGoals] = useState<
    Array<{ goal: string; metric: string; targetValue: number }>
  >([
    { goal: '', metric: '', targetValue: 0 },
  ]);

  const [marketingChannels, setMarketingChannels] = useState<
    Array<{ name: string; budget: number; isActive: boolean }>
  >([]);

  const [budgetAllocation, setBudgetAllocation] = useState<Record<string, number>>({});
  const [brandGuidelines, setBrandGuidelines] = useState({
    tone: '',
    colors: [] as string[],
    fonts: [] as string[],
  });

  const [additionalNotes, setAdditionalNotes] = useState('');

  // Analyze strategy mutation
  const analyzeMutation = useMutation({
    mutationFn: async (strategy: StrategyInput) => {
      const response = await api.post<{ data: StrategyAnalysisResponse }>('/strategy/analyze', strategy);
      return response.data.data;
    },
  });

  // Save campaign mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; strategy: StrategyInput }) => {
      const response = await api.post<{ data: { id: string } }>('/strategy/campaigns', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data.id);
    },
  });

  // Get templates query
  const { data: templates } = useQuery({
    queryKey: ['strategy-templates'],
    queryFn: async () => {
      const response = await api.get<{ data: typeof templates }>('/strategy/templates');
      return response.data.data;
    },
  });

  const handleAnalyze = async () => {
    const strategy: StrategyInput = {
      targetAudience,
      campaignGoals: campaignGoals.filter((g) => g.goal && g.metric),
      marketingChannels: marketingChannels.filter((c) => c.name),
      budgetAllocation: Object.keys(budgetAllocation).length > 0 ? budgetAllocation : undefined,
      brandGuidelines:
        brandGuidelines.tone || brandGuidelines.colors.length > 0 ? brandGuidelines : undefined,
      additionalNotes: additionalNotes || undefined,
    };

    try {
      await analyzeMutation.mutateAsync(strategy);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleSave = async () => {
    const strategy: StrategyInput = {
      targetAudience,
      campaignGoals: campaignGoals.filter((g) => g.goal && g.metric),
      marketingChannels: marketingChannels.filter((c) => c.name),
      budgetAllocation: Object.keys(budgetAllocation).length > 0 ? budgetAllocation : undefined,
      brandGuidelines:
        brandGuidelines.tone || brandGuidelines.colors.length > 0 ? brandGuidelines : undefined,
      additionalNotes: additionalNotes || undefined,
    };

    try {
      await saveMutation.mutateAsync({ name, description, strategy });
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    try {
      const response = await api.get<{ data: { template: StrategyInput } }>(`/strategy/templates/${templateId}`);
      const template = response.data.data.template;
      // Load template into form state
      setTargetAudience(template.targetAudience);
      setCampaignGoals(template.campaignGoals);
      setMarketingChannels(template.marketingChannels);
      if (template.budgetAllocation) setBudgetAllocation(template.budgetAllocation);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const addGoal = () => {
    setCampaignGoals([...campaignGoals, { goal: '', metric: '', targetValue: 0 }]);
  };

  const removeGoal = (index: number) => {
    setCampaignGoals(campaignGoals.filter((_, i) => i !== index));
  };

  const addChannel = () => {
    setMarketingChannels([...marketingChannels, { name: '', budget: 0, isActive: true }]);
  };

  const removeChannel = (index: number) => {
    setMarketingChannels(marketingChannels.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Campaign Name */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Marketing Campaign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your campaign..."
            />
          </div>
        </div>
      </div>

      {/* Templates */}
      {templates && templates.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Start from Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((template: any) => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template.id)}
                className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-600 mt-1">{template.category}</div>
                {template.description && (
                  <div className="text-sm text-gray-500 mt-2 line-clamp-2">{template.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Target Audience */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
            <input
              type="text"
              value={targetAudience.ageRange || ''}
              onChange={(e) => setTargetAudience({ ...targetAudience, ageRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 25-45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={targetAudience.location || ''}
              onChange={(e) => setTargetAudience({ ...targetAudience, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., United States, Europe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={targetAudience.gender || ''}
              onChange={(e) => setTargetAudience({ ...targetAudience, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input
              type="text"
              value={targetAudience.language || ''}
              onChange={(e) => setTargetAudience({ ...targetAudience, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., English, Spanish"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
            <input
              type="text"
              value={targetAudience.interests?.join(', ') || ''}
              onChange={(e) =>
                setTargetAudience({
                  ...targetAudience,
                  interests: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Technology, Fashion, Sports"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple interests with commas</p>
          </div>
        </div>
      </div>

      {/* Campaign Goals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Goals</h2>
          <button
            type="button"
            onClick={addGoal}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Add Goal
          </button>
        </div>
        <div className="space-y-3">
          {campaignGoals.map((goal, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={goal.goal}
                  onChange={(e) => {
                    const newGoals = [...campaignGoals];
                    newGoals[index].goal = e.target.value;
                    setCampaignGoals(newGoals);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Goal description"
                />
              </div>
              <div className="w-40">
                <input
                  type="text"
                  value={goal.metric}
                  onChange={(e) => {
                    const newGoals = [...campaignGoals];
                    newGoals[index].metric = e.target.value;
                    setCampaignGoals(newGoals);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Metric"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={goal.targetValue || ''}
                  onChange={(e) => {
                    const newGoals = [...campaignGoals];
                    newGoals[index].targetValue = parseFloat(e.target.value) || 0;
                    setCampaignGoals(newGoals);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Target"
                />
              </div>
              {campaignGoals.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGoal(index)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Channels */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Marketing Channels</h2>
          <button
            type="button"
            onClick={addChannel}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Add Channel
          </button>
        </div>
        <div className="space-y-3">
          {marketingChannels.map((channel, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={channel.name}
                  onChange={(e) => {
                    const newChannels = [...marketingChannels];
                    newChannels[index].name = e.target.value;
                    setMarketingChannels(newChannels);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Channel name"
                  list="channel-suggestions"
                />
                <datalist id="channel-suggestions">
                  <option value="Email Marketing" />
                  <option value="Social Media Ads" />
                  <option value="Google Ads" />
                  <option value="Content Marketing" />
                  <option value="Influencer Marketing" />
                </datalist>
              </div>
              <div className="w-40">
                <input
                  type="number"
                  value={channel.budget || ''}
                  onChange={(e) => {
                    const newChannels = [...marketingChannels];
                    newChannels[index].budget = parseFloat(e.target.value) || 0;
                    setMarketingChannels(newChannels);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Budget"
                />
              </div>
              {marketingChannels.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeChannel(index)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h2>
        <div className="space-y-3">
          {marketingChannels
            .filter((c) => c.name && c.budget > 0)
            .map((channel, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1 font-medium text-gray-700">{channel.name}</div>
                <div className="w-48">
                  <input
                    type="number"
                    value={budgetAllocation[channel.name] || channel.budget}
                    onChange={(e) => {
                      setBudgetAllocation({
                        ...budgetAllocation,
                        [channel.name]: parseFloat(e.target.value) || 0,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          <div className="flex items-center gap-3 pt-2 border-t">
            <div className="flex-1 font-semibold text-gray-900">Total</div>
            <div className="w-48 font-semibold text-gray-900">
              ${Object.values(budgetAllocation).reduce((sum, val) => sum + val, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Guidelines (Optional)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
            <select
              value={brandGuidelines.tone}
              onChange={(e) => setBrandGuidelines({ ...brandGuidelines, tone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select tone...</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="playful">Playful</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Colors</label>
            <input
              type="text"
              value={brandGuidelines.colors.join(', ')}
              onChange={(e) =>
                setBrandGuidelines({
                  ...brandGuidelines,
                  colors: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., #FF5733, #33FF57, #3357FF"
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional information about your campaign..."
        />
      </div>

      {/* AI Analysis Results */}
      {analyzeMutation.data && (
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Key Insights</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {analyzeMutation.data.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {analyzeMutation.data.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={`p-3 rounded ${
                      suggestion.priority === 'high'
                        ? 'bg-red-100 border border-red-200'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 border border-yellow-200'
                        : 'bg-green-100 border border-green-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{suggestion.category}</div>
                    <div className="text-sm text-gray-700 mt-1">{suggestion.suggestion}</div>
                    {suggestion.estimatedImpact && (
                      <div className="text-xs text-gray-600 mt-1">
                        Impact: {suggestion.estimatedImpact}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {analyzeMutation.data.recommendedChannels && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Recommended Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {analyzeMutation.data.recommendedChannels.map((channel, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzeMutation.isPending}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze with AI'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending || !name}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Strategy'}
        </button>
      </div>
    </div>
  );
}
