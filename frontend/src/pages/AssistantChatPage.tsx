/**
 * ===========================================
 * AI Assistant Chat Page
 * ===========================================
 */

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Conversation, ChatMessage, SuggestedAction } from '@n8nvibes/shared';

/**
 * AI Assistant Chat page
 */
export default function AssistantChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // List conversations query
  const { data: conversationsData, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<{ data: typeof conversationsData }>('/assistant/conversations');
      return response.data.data;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await api.post<{ data: any }>('/assistant/chat', {
        conversationId: selectedConversation || undefined,
        message: messageText,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setMessage('');
      // Auto-scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      refetch();
    },
  });

  // Execute action mutation
  const executeActionMutation = useMutation({
    mutationFn: async (action: any) => {
      const response = await api.post<{ data: any }>('/assistant/actions', {
        ...action,
        conversationId: selectedConversation,
      });
      return response.data.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await api.delete(`/assistant/conversations/${conversationId}`);
    },
    onSuccess: () => {
      refetch();
      if (selectedConversation === conversationId) {
        setSelectedConversation('');
      }
    },
  });

  const conversations = conversationsData?.items || [];
  const currentConversation = conversations.find((c: any) => c.id === selectedConversation);
  const messages = currentConversation?.messages || [];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecording = () => {
    // Check for browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(true);
      // TODO: Implement voice recording
    } else {
      alert('Voice input is not supported in this browser');
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // TODO: Stop recording and transcribe
  };

  const executeAction = (action: SuggestedAction) => {
    executeActionMutation.mutate(action);
  };

  const suggestedActions = sendMessageMutation.data?.suggestedActions || [];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sidebar - Conversation History */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="card h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => {
                  setSelectedConversation('');
                  // Start new conversation
                }}
                className="p-2 text-blue-600 hover:text-blue-700"
                title="New chat"
              >
                ✉️
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedConversation('');
                setSidebarOpen(false);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {conversations.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv.id);
                  setSidebarOpen(false);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conv.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-gray-900 truncate">{conv.title || 'New Chat'}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {conv.messages.length} messages
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 card flex flex-col">
        {!sidebarOpen && (
          <div className="p-3 border-b">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              ☰ Show Conversations
            </button>
          </div>
        )}

        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">
                {currentConversation
                  ? currentConversation.title || 'Active Conversation'
                  : 'Ask me anything about your marketing campaigns'}
              </p>
            </div>
            {currentConversation && (
              <button
                onClick={() => {
                  if (confirm('Delete this conversation?')) {
                    deleteConversationMutation.mutate(currentConversation.id);
                  }
                }}
                className="text-gray-400 hover:text-red-600"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedConversation && conversations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-600 mb-4">
                I can help you with:
              </p>
              <ul className="text-left text-gray-600 space-y-2 inline-block text-left">
                <li>• Creating marketing strategies</li>
                <li>• Generating n8n workflows</li>
                <li>• Building automation campaigns</li>
                <li>• Analyzing performance</li>
                <li>• Providing marketing insights</li>
              </ul>
              <button
                onClick={() => setSelectedConversation('new')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Chatting
              </button>
            </div>
          )}

          {!selectedConversation && conversations.length > 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-600">Choose from your previous conversations or start a new one</p>
            </div>
          )}

          {selectedConversation && messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Start the conversation
              </h2>
              <p className="text-gray-600">
                Ask me anything about your marketing campaigns and workflows
              </p>
            </div>
          )}

          {selectedConversation && messages.map((msg: ChatMessage, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs text-gray-500 mb-1">🤖 AI Assistant</div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                {msg.timestamp && (
                  <div className="text-xs opacity-70 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {selectedConversation && sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-500">Thinking...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Actions */}
        {selectedConversation && suggestedActions.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Actions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action: SuggestedAction, index) => (
                <button
                  key={index}
                  onClick={() => executeAction(action)}
                  className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm font-medium"
                >
                  <span className="mr-1">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              🎤
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              rows={1}
              className="flex-1 resize-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />

            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Send
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            <strong>Tip:</strong> You can ask me to create workflows, generate assets, analyze campaigns, or provide marketing advice.
          </div>
        </div>
      </div>
    </div>
  );
}
