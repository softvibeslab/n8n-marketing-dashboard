/**
 * ===========================================
 * AI Workflow Generator Component
 * ===========================================
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { N8nWorkflow } from '@n8nvibes/shared';

interface WorkflowGeneratorProps {
  onSuccess?: (workflowId: string) => void;
}

export function WorkflowGenerator({ onSuccess }: WorkflowGeneratorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<N8nWorkflow | null>(null);

  // Generate workflow mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ data: { id: string } }>('/workflows/generate', {
        name,
        description,
        naturalLanguageInput,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setGeneratedWorkflow(data as any); // Will be populated by getWorkflow
      onSuccess?.(data.id);
    },
  });

  // Deploy workflow mutation
  const deployMutation = useMutation({
    mutationFn: async ({ workflowId, activate }: { workflowId: string; activate: boolean }) => {
      const response = await api.post<{ data: any }>(`/workflows/${workflowId}/deploy`, {
        deployToN8n: true,
        activate,
      });
      return response.data.data;
    },
  });

  const handleGenerate = async () => {
    if (!name || !naturalLanguageInput) {
      alert('Please provide a name and description');
      return;
    }

    try {
      await generateMutation.mutateAsync();
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate workflow. Please try again.');
    }
  };

  const handleDeploy = async (activate: boolean) => {
    if (!generatedWorkflow) return;

    try {
      const result = await deployMutation.mutateAsync({
        workflowId: (generatedWorkflow as any).id,
        activate,
      });
      alert(`Workflow deployed successfully! URL: ${result.deployedUrl || 'n8n dashboard'}`);
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Failed to deploy workflow. Please try again.');
    }
  };

  const examplePrompts = [
    {
      title: 'Social Media Scheduler',
      description: 'Schedule posts across multiple platforms',
      prompt:
        'Create a workflow that posts content to Instagram, Facebook, and Twitter automatically at scheduled times. It should read from a spreadsheet, create the posts, and log the results.',
    },
    {
      title: 'Email Campaign Automation',
      description: 'Send personalized email sequences',
      prompt:
        'Build a workflow that triggers when a user signs up, adds them to Mailchimp, sends a welcome email, and follows up with a sequence of 3 emails over 2 weeks.',
    },
    {
      title: 'Content Generator',
      description: 'Generate marketing content with AI',
      prompt:
        'Create a workflow that accepts a product description, generates blog post, social media captions, and email copy using AI, then saves everything to a database.',
    },
    {
      title: 'Lead Scoring Pipeline',
      description: 'Score and qualify leads automatically',
      prompt:
        'Build a workflow that monitors new leads, scores them based on engagement data, tags high-quality leads in the CRM, and notifies the sales team via Slack.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Workflow</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="My Awesome Workflow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of what this workflow does..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What should this workflow do? *
            </label>
            <textarea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the workflow in plain English. For example:

When a new user signs up, add them to Mailchimp, send a welcome email, and notify the team on Slack. The email should include the user's name and a personalized discount code."
            />
            <p className="text-sm text-gray-500 mt-1">
              Be as specific as possible about triggers, actions, and data flow
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !name || !naturalLanguageInput}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {generateMutation.isPending ? 'Generating Workflow...' : 'Generate Workflow with AI'}
          </button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Inspiration?</h2>
        <p className="text-sm text-gray-600 mb-4">Click on an example to get started:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setName(example.title);
                setNaturalLanguageInput(example.prompt);
              }}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">{example.title}</div>
              <div className="text-sm text-gray-600 mt-1">{example.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Workflow Preview */}
      {generateMutation.isSuccess && generatedWorkflow && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Generated!</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Ready to Deploy
            </span>
          </div>

          <div className="space-y-4">
            {/* Workflow Info */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">{(generatedWorkflow as any).name}</h3>
              <p className="text-sm text-gray-600">
                {(generatedWorkflow as any).description || 'No description provided'}
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <span>{(generatedWorkflow as any).nodes?.length || 0} nodes</span>
                <span>
                  Status:{' '}
                  <span className="font-medium text-blue-600">{(generatedWorkflow as any).status}</span>
                </span>
              </div>
            </div>

            {/* Node Visualization */}
            {(generatedWorkflow as any).nodes && (generatedWorkflow as any).nodes.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Workflow Nodes</h4>
                <div className="space-y-2">
                  {(generatedWorkflow as any).nodes.map((node: any, index: number) => (
                    <div key={node.id || index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{node.name}</div>
                        <div className="text-xs text-gray-500">{node.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleDeploy(false)}
                disabled={deployMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {deployMutation.isPending ? 'Deploying...' : 'Deploy to n8n'}
              </button>
              <button
                onClick={() => handleDeploy(true)}
                disabled={deployMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {deployMutation.isPending ? 'Deploying...' : 'Deploy & Activate'}
              </button>
            </div>

            <p className="text-sm text-gray-600">
              <strong>Note:</strong> You can edit and customize the workflow in the n8n interface after
              deployment.
            </p>
          </div>
        </div>
      )}

      {/* Generation Error */}
      {generateMutation.isError && (
        <div className="card bg-red-50 border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Generation Failed</h2>
          <p className="text-red-700">
            There was an error generating your workflow. Please check your input and try again.
          </p>
          <button
            onClick={() => generateMutation.reset()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Tips for Better Workflows</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              <strong>Be specific:</strong> Clearly describe triggers, actions, and data transformations
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              <strong>Describe the flow:</strong> Explain what happens step by step
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              <strong>Mention integrations:</strong> Specify which services you want to connect (e.g.,
              Mailchimp, Slack, Google Sheets)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              <strong>Include error handling:</strong> Mention what should happen if something fails
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
