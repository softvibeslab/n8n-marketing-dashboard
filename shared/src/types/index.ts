/**
 * ===========================================
 * Shared Type Definitions
 * ===========================================
 */

// ===========================================
// User Types
// ===========================================

export type UserRole = 'ADMIN' | 'USER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// Authentication Types
// ===========================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role?: UserRole;
}

// ===========================================
// Workflow Types
// ===========================================

export type WorkflowStatus = 'DRAFT' | 'DEPLOYED' | 'ARCHIVED';

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  n8nWorkflowJson: Record<string, unknown>;
  n8nWorkflowId?: string;
  version: number;
  status: WorkflowStatus;
  isDeployed: boolean;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  n8nWorkflowJson: Record<string, unknown>;
  changeLog?: string;
  createdAt: string;
}

// ===========================================
// Campaign Types
// ===========================================

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface Campaign {
  id: string;
  userId: string;
  workflowId?: string;
  name: string;
  description?: string;
  strategy: Record<string, unknown>;
  status: CampaignStatus;
  metrics?: Record<string, unknown>;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyInput {
  targetAudience: {
    ageRange?: string;
    interests?: string[];
    location?: string;
  };
  campaignGoals: string[];
  marketingChannels: string[];
  budgetAllocation?: Record<string, number>;
  timeline?: {
    startDate: string;
    endDate: string;
  };
}

// ===========================================
// Asset Types
// ===========================================

export type AssetType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DESIGN';

export type AssetStatus = 'DRAFT' | 'GENERATED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface Asset {
  id: string;
  campaignId: string;
  type: AssetType;
  content?: string;
  fileUrl?: string;
  metadata?: Record<string, unknown>;
  isAIGenerated: boolean;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// Execution Types
// ===========================================

export type ExecutionStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Execution {
  id: string;
  workflowId: string;
  userId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  logs?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: string;
}

// ===========================================
// Analytics Types
// ===========================================

export interface AnalyticsMetrics {
  source: string;
  metrics: Record<string, unknown>;
  fetchedAt: string;
}

export interface AIInsight {
  type: string;
  message: string;
  impact?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CampaignAnalyticsData {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  revenue?: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
  roi?: number;
  breakdown?: Array<{
    date: string;
    [key: string]: number | string | undefined;
  }>;
}

export interface RealtimeMetrics {
  executions: {
    total: number;
    success: number;
    failed: number;
    running: number;
  };
  timeline: Array<{
    hour: number;
    count: number;
  }>;
}

// ===========================================
// Asset Types (Extended)
// ===========================================

export interface AssetGenerationRequest {
  type: 'TEXT' | 'IMAGE';
  prompt: string;
  tone?: string;
  maxLength?: number;
  keywords?: string[];
  targetAudience?: string;
  style?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  numberOfImages?: number;
  quality?: 'standard' | 'hd';
}

// ===========================================
// Assistant Types
// ===========================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedAction {
  type: 'generate_workflow' | 'create_asset' | 'execute_workflow' | 'get_analytics';
  label: string;
  description: string;
  icon: string;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===========================================
// n8n Types
// ===========================================

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, unknown>;
  position: [number, number];
}

export interface N8nConnection {
  from: string;
  to: string;
  index: number;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, N8nConnection[][]>;
  settings?: Record<string, unknown>;
  staticData?: Record<string, unknown>;
}
