# API Documentation

Complete API reference for the n8n Marketing Dashboard backend.

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.yourdomain.com/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## API Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password-12-chars",
  "name": "John Doe"
}
```

**Validation Rules:**
- `email`: Valid email address, unique
- `password`: Minimum 12 characters, must include uppercase, lowercase, number, and special character
- `name`: Optional, max 255 characters

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2026-01-31T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses:**
- `400`: Validation error (email format, password strength)
- `409`: Email already exists

---

#### POST /auth/login

Authenticate a user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password-12-chars"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `429`: Too many login attempts (rate limit)

---

#### POST /auth/refresh

Refresh an expired access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses:**
- `401`: Invalid or expired refresh token

---

#### POST /auth/logout

Logout a user and invalidate tokens.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### Strategy Endpoints

#### POST /strategy/analyze

Analyze strategy input with AI and receive suggestions.

**Authentication:** Required

**Request Body:**
```json
{
  "targetAudience": {
    "ageRange": "25-34",
    "interests": ["fitness", "health", "wellness"],
    "location": "United States",
    "gender": "all"
  },
  "campaignGoals": ["brand-awareness", "lead-generation"],
  "marketingChannels": ["instagram", "facebook", "email"],
  "budget": {
    "total": 5000,
    "allocation": {
      "social-media": 3000,
      "email": 1000,
      "influencer": 1000
    }
  },
  "timeline": {
    "startDate": "2026-02-01",
    "endDate": "2026-04-30",
    "milestones": ["launch", "mid-campaign", "wrap-up"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "strengths": ["Clear target audience", "Realistic budget"],
      "suggestions": [
        "Consider adding TikTok for younger audience",
        "Increase email budget for better ROI"
      ],
      "recommendations": [
        {
          "channel": "instagram",
          "recommended": true,
          "reason": "High engagement for fitness content"
        }
      ]
    },
    "optimizedStrategy": { ... }
  }
}
```

---

#### POST /strategy

Create a new marketing strategy.

**Authentication:** Required

**Request Body:** Same as /strategy/analyze

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "strategy": { ... },
    "status": "DRAFT",
    "createdAt": "2026-01-31T12:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### GET /strategy

List all strategies for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, ACTIVE, COMPLETED)
- `limit` (optional): Number of results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "ACTIVE",
        "createdAt": "2026-01-31T12:00:00.000Z",
        "strategy": { ... }
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

#### GET /strategy/:id

Get details of a specific strategy.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "strategy": { ... },
    "status": "ACTIVE",
    "campaigns": [ ... ],
    "createdAt": "2026-01-31T12:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Strategy not found
- `403`: Not authorized to access this strategy

---

#### PUT /strategy/:id

Update a strategy.

**Authentication:** Required

**Request Body:** Partial strategy object with fields to update

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "strategy": { ... },
    "updatedAt": "2026-01-31T12:30:00.000Z"
  }
}
```

---

#### DELETE /strategy/:id

Delete a strategy.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Strategy deleted successfully"
  }
}
```

---

#### GET /strategy/templates

Get available strategy templates.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "ecommerce-launch",
        "name": "E-commerce Product Launch",
        "description": "Comprehensive strategy for launching a new e-commerce product",
        "category": "E-commerce",
        "channels": ["instagram", "facebook", "email", "google-ads"],
        "estimatedDuration": "4-6 weeks",
        "template": { ... }
      },
      {
        "id": "brand-awareness",
        "name": "Brand Awareness Campaign",
        "description": "Build brand recognition and reach new audiences",
        "category": "Branding",
        "channels": ["instagram", "tiktok", "youtube"],
        "estimatedDuration": "8-12 weeks",
        "template": { ... }
      }
    ]
  }
}
```

---

#### POST /strategy/from-template

Create a strategy from a template.

**Authentication:** Required

**Request Body:**
```json
{
  "templateId": "ecommerce-launch",
  "customizations": {
    "budget": 10000,
    "timeline": {
      "startDate": "2026-02-01",
      "endDate": "2026-03-15"
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "strategy": { ... },
    "status": "DRAFT"
  }
}
```

---

### Workflow Endpoints

#### POST /workflows/generate

Generate an n8n workflow from natural language description.

**Authentication:** Required

**Request Body:**
```json
{
  "prompt": "Create 10 Instagram posts for a fitness brand targeting millennials, include hashtag strategy",
  "strategyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflow": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Instagram Posts Generator - Fitness Brand",
      "description": "Generate 10 Instagram posts with AI content",
      "n8nWorkflowJson": { ... },
      "nodes": [
        {
          "id": "node-1",
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "parameters": { ... }
        }
      ],
      "connections": [ ... ]
    },
    "interpretation": {
      "contentType": "Instagram posts",
      "quantity": 10,
      "brand": "fitness",
      "targetAudience": "millennials"
    }
  }
}
```

---

#### POST /workflows

Create a workflow manually.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Custom Workflow",
  "description": "Does something amazing",
  "n8nWorkflowJson": { ... },
  "strategyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Custom Workflow",
    "description": "Does something amazing",
    "status": "DRAFT",
    "createdAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### GET /workflows

List all workflows for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, DEPLOYED, ARCHIVED)
- `strategyId` (optional): Filter by strategy
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Instagram Posts Generator",
        "status": "DEPLOYED",
        "executions": 45,
        "lastExecution": "2026-01-31T10:30:00.000Z",
        "createdAt": "2026-01-30T12:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### GET /workflows/:id

Get workflow details.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Instagram Posts Generator",
    "description": "Generate 10 Instagram posts",
    "n8nWorkflowJson": { ... },
    "status": "DEPLOYED",
    "n8nWorkflowId": "123",
    "version": 3,
    "executions": 45,
    "strategy": { ... },
    "createdAt": "2026-01-30T12:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### PUT /workflows/:id

Update a workflow.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Workflow Name",
  "n8nWorkflowJson": { ... }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Workflow Name",
    "version": 4,
    "updatedAt": "2026-01-31T12:30:00.000Z"
  }
}
```

---

#### DELETE /workflows/:id

Delete a workflow.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Workflow deleted successfully"
  }
}
```

---

#### POST /workflows/:id/deploy

Deploy a workflow to n8n.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflowId": "550e8400-e29b-41d4-a716-446655440000",
    "n8nWorkflowId": "123",
    "status": "DEPLOYED",
    "deployedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid workflow JSON
- `502`: n8n service unavailable

---

#### POST /workflows/:id/execute

Execute a deployed workflow.

**Authentication:** Required

**Request Body:**
```json
{
  "inputData": { ... }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "executionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "RUNNING",
    "startedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### GET /workflows/:id/versions

Get workflow version history.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version": 1,
        "createdAt": "2026-01-30T12:00:00.000Z",
        "description": "Initial version"
      },
      {
        "version": 2,
        "createdAt": "2026-01-31T10:00:00.000Z",
        "description": "Added error handling"
      },
      {
        "version": 3,
        "createdAt": "2026-01-31T12:00:00.000Z",
        "description": "Optimized prompts"
      }
    ]
  }
}
```

---

#### GET /workflows/:id/executions

Get workflow execution history.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (RUNNING, SUCCESS, FAILED)
- `limit` (optional): Results per page
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "SUCCESS",
        "startedAt": "2026-01-31T10:00:00.000Z",
        "completedAt": "2026-01-31T10:00:15.000Z",
        "duration": 15,
        "nodeExecutions": [ ... ]
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Asset Endpoints

#### POST /assets/generate

Generate an asset (text or image) with AI.

**Authentication:** Required

**Text Generation Request:**
```json
{
  "type": "TEXT",
  "prompt": "Create an engaging Instagram caption for a fitness brand post about morning workouts",
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "options": {
    "tone": "motivational",
    "maxLength": 500,
    "includeHashtags": true,
    "platform": "instagram"
  }
}
```

**Image Generation Request:**
```json
{
  "type": "IMAGE",
  "prompt": "Professional fitness model doing morning yoga in a bright studio, clean minimalist aesthetic",
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "options": {
    "style": "realistic",
    "dimensions": {
      "width": 1080,
      "height": 1080
    },
    "quality": "standard"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "TEXT",
    "content": "Rise and grind! 🌅 Morning workouts set the tone...",
    "status": "GENERATED",
    "metadata": {
      "wordCount": 45,
      "hashtagCount": 8,
      "platform": "instagram"
    },
    "createdAt": "2026-01-31T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid generation request
- `429`: Rate limit exceeded for AI service
- `502`: AI service unavailable

---

#### POST /assets/batch

Generate multiple assets in batch.

**Authentication:** Required

**Request Body:**
```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "assets": [
    {
      "type": "TEXT",
      "prompt": "Instagram post about workout tips",
      "options": { ... }
    },
    {
      "type": "IMAGE",
      "prompt": "Fitness motivation image",
      "options": { ... }
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "batchId": "550e8400-e29b-41d4-a716-446655440000",
    "assets": [ ... ],
    "summary": {
      "total": 2,
      "completed": 2,
      "failed": 0
    }
  }
}
```

---

#### POST /assets

Create an asset manually (not generated).

**Authentication:** Required

**Request Body:**
```json
{
  "type": "TEXT",
  "content": "Manually created content",
  "campaignId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "TEXT",
    "content": "Manually created content",
    "status": "DRAFT",
    "createdAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### GET /assets

List all assets for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `type` (optional): Filter by type (TEXT, IMAGE)
- `status` (optional): Filter by status (DRAFT, GENERATED, APPROVED)
- `limit` (optional): Results per page
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "TEXT",
        "content": "Morning workout motivation...",
        "status": "APPROVED",
        "campaignId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2026-01-31T12:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### GET /assets/:id

Get asset details.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "TEXT",
    "content": "Full asset content...",
    "status": "APPROVED",
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "metadata": { ... },
    "fileUrl": null,
    "createdAt": "2026-01-31T12:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### PUT /assets/:id

Update an asset.

**Authentication:** Required

**Request Body:**
```json
{
  "content": "Updated content",
  "status": "APPROVED"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Updated content",
    "status": "APPROVED",
    "updatedAt": "2026-01-31T12:30:00.000Z"
  }
}
```

---

#### DELETE /assets/:id

Delete an asset.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Asset deleted successfully"
  }
}
```

---

### Campaign Endpoints

#### POST /campaigns

Create a new campaign.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Fitness Brand Launch",
  "strategyId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Fitness Brand Launch",
    "strategyId": "550e8400-e29b-41d4-a716-446655440000",
    "workflowId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ACTIVE",
    "metrics": { ... },
    "createdAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### GET /campaigns

List all campaigns for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status
- `strategyId` (optional): Filter by strategy
- `limit` (optional): Results per page
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Fitness Brand Launch",
        "status": "ACTIVE",
        "assets": 25,
        "executions": 10,
        "createdAt": "2026-01-31T12:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### GET /campaigns/:id

Get campaign details.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Fitness Brand Launch",
    "strategy": { ... },
    "workflow": { ... },
    "status": "ACTIVE",
    "assets": [ ... ],
    "metrics": { ... },
    "createdAt": "2026-01-31T12:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### PUT /campaigns/:id

Update a campaign.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Campaign Name",
    "updatedAt": "2026-01-31T12:30:00.000Z"
  }
}
```

---

#### DELETE /campaigns/:id

Delete a campaign.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Campaign deleted successfully"
  }
}
```

---

### Analytics Endpoints

#### GET /analytics/campaigns/:id

Get analytics for a specific campaign.

**Authentication:** Required

**Query Parameters:**
- `startDate` (optional): Start date filter (ISO 8601)
- `endDate` (optional): End date filter (ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "metrics": {
      "impressions": 125000,
      "reach": 85000,
      "engagement": 5500,
      "clicks": 2200,
      "conversions": 145,
      "cost": 1500,
      "roi": 2.4
    },
    "platforms": {
      "instagram": {
        "impressions": 75000,
        "engagement": 3500,
        "clicks": 1400
      },
      "facebook": {
        "impressions": 50000,
        "engagement": 2000,
        "clicks": 800
      }
    },
    "trends": [ ... ],
    "topAssets": [ ... ]
  }
}
```

---

#### POST /analytics/fetch-platform

Fetch fresh analytics from external platforms.

**Authentication:** Required

**Request Body:**
```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "platforms": ["instagram", "facebook", "google-analytics"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Analytics fetch initiated",
    "status": "PROCESSING",
    "jobId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

#### POST /analytics/insights

Generate AI-powered insights and recommendations.

**Authentication:** Required

**Request Body:**
```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "focusAreas": ["underperforming-content", "optimization", "audience-expansion"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "underperforming-content",
        "severity": "medium",
        "finding": "Instagram video posts have 40% lower engagement than image posts",
        "recommendation": "Focus on image posts with motivational quotes and fitness tips",
        "expectedImpact": "25% increase in engagement"
      },
      {
        "type": "optimization",
        "severity": "low",
        "finding": "Best posting time is 7-9 AM EST",
        "recommendation": "Schedule posts for early morning",
        "expectedImpact": "15% increase in reach"
      }
    ],
    "score": 72,
    "improvementSuggestions": [ ... ]
  }
}
```

---

#### POST /analytics/reports

Generate a custom report.

**Authentication:** Required

**Request Body:**
```json
{
  "campaignIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "dateRange": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "metrics": ["impressions", "engagement", "conversions", "roi"],
  "format": "pdf",
  "includeCharts": true,
  "includeComparison": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "GENERATING",
    "format": "pdf",
    "estimatedReadyAt": "2026-01-31T12:05:00.000Z"
  }
}
```

---

#### GET /analytics/realtime/:campaignId

Get real-time metrics for a campaign.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T12:00:00.000Z",
    "activeExecutions": 3,
    "metrics": {
      "impressions": 125000,
      "engagement": 5500,
      "clicks": 2200
    },
    "recentActivity": [ ... ]
  }
}
```

---

### Assistant Endpoints

#### POST /assistant/chat

Send a message to the AI assistant.

**Authentication:** Required

**Request Body:**
```json
{
  "message": "How do I create a workflow for Instagram posts?",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "message": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "assistant",
      "content": "To create a workflow for Instagram posts, follow these steps...",
      "timestamp": "2026-01-31T12:00:00.000Z"
    },
    "suggestedActions": [
      {
        "type": "generate_workflow",
        "label": "Generate Instagram Workflow",
        "params": { ... }
      },
      {
        "type": "open_page",
        "label": "Go to Workflows",
        "params": {
          "page": "workflows"
        }
      }
    ]
  }
}
```

---

#### POST /assistant/actions

Execute a suggested action.

**Authentication:** Required

**Request Body:**
```json
{
  "action": "generate_workflow",
  "params": {
    "prompt": "Create Instagram posts workflow",
    "strategyId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "action": "generate_workflow",
    "result": { ... },
    "message": "Workflow generated successfully"
  }
}
```

---

#### GET /assistant/conversations

List all conversations for the authenticated user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Creating Instagram workflows",
        "messageCount": 8,
        "lastMessageAt": "2026-01-31T12:00:00.000Z",
        "createdAt": "2026-01-31T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### GET /assistant/conversations/:id

Get conversation history.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Creating Instagram workflows",
    "messages": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "role": "user",
        "content": "How do I create a workflow?",
        "timestamp": "2026-01-31T10:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "role": "assistant",
        "content": "To create a workflow...",
        "timestamp": "2026-01-31T10:00:01.000Z"
      }
    ],
    "context": { ... },
    "createdAt": "2026-01-31T10:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### DELETE /assistant/conversations/:id

Delete a conversation.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Conversation deleted successfully"
  }
}
```

---

### n8n Integration Endpoints

#### GET /n8n/status

Check n8n connection status.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "apiUrl": "https://n8n.example.com/api/v1",
    "version": "1.0.0",
    "lastChecked": "2026-01-31T12:00:00.000Z"
  }
}
```

---

#### POST /n8n/webhook

Receive webhook events from n8n.

**Authentication:** Required (Webhook signature verification)

**Request Body:** Varies based on n8n event type

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Webhook received successfully"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | External service unavailable |
| `N8N_CONNECTION_ERROR` | Cannot connect to n8n |
| `AI_SERVICE_ERROR` | AI service error |

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per hour per user
- **Workflow Generation**: 10 per hour per user
- **Asset Generation**: 50 per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643690400
```

## Pagination

List endpoints support pagination using `limit` and `offset` query parameters.

**Response Format:**
```json
{
  "data": { ... },
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Webhooks

### n8n Execution Webhook

n8n sends execution status updates to the configured webhook endpoint.

**Event Types:**
- `execution.started`: Workflow execution started
- `execution.success`: Workflow execution completed successfully
- `execution.failed`: Workflow execution failed
- `node.executed`: Individual node executed

**Webhook Signature:**

Webhooks are signed using the shared secret. Verify the signature:

```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(requestBody))
  .digest('hex');
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Generate a workflow
const response = await api.post('/workflows/generate', {
  prompt: 'Create Instagram posts for fitness brand',
  strategyId: '...'
});

const workflow = response.data.data.workflow;
```

### Python

```python
import requests

api = requests.Session()
api.headers.update({
    'Authorization': f'Bearer {token}'
})

# Generate a workflow
response = api.post(
    'http://localhost:3001/api/v1/workflows/generate',
    json={
        'prompt': 'Create Instagram posts for fitness brand',
        'strategyId': '...'
    }
)

workflow = response.json()['data']['workflow']
```

## Support

For API issues or questions:
- Documentation: `/docs`
- Issue Tracker: GitHub Issues
- Email: support@yourdomain.com

---

**Version:** 1.0.0
**Last Updated:** 2026-01-31
**Base URL:** http://localhost:3001/api/v1
