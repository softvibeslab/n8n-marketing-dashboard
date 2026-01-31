# SPEC: n8n Marketing Dashboard

## TAG BLOCK

```yaml
SPEC_ID: SPEC-MKT-001
TITLE: AI-Powered n8n Marketing Dashboard
STATUS: Implementation Complete
PRIORITY: High
ASSIGNED: MoAI DDD Implementation
CREATED: 2026-01-31
COMPLETED: 2026-01-31
DOMAIN: Marketing Automation
EPIC: Core Platform
RELATED_SPECS: TBD
IMPLEMENTATION_REPORT: DDD-IMPLEMENTATION-REPORT.md
```

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Environment](#environment)
3. [Assumptions](#assumptions)
4. [Requirements (EARS Format)](#requirements-ears-format)
5. [Technical Specifications](#technical-specifications)
6. [Security Requirements](#security-requirements)
7. [Integration Points](#integration-points)
8. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Executive Summary

The n8n Marketing Dashboard is an AI-powered all-in-one dashboard application for digital marketing agencies. The system integrates with n8n (open-source workflow automation tool) to automatically generate and deploy workflows that create digital assets. The platform enables marketing professionals to describe campaigns in natural language and receive automated workflow generation, asset creation, and performance tracking.

### Problem Statement

Digital marketing agencies face repetitive tasks in creating and managing campaigns across multiple channels. Manual workflow creation in n8n requires technical expertise and time. Agencies need an intelligent system that can translate marketing strategies into executable automation workflows.

### Solution Overview

An AI-powered dashboard that:
- Accepts natural language marketing strategy inputs
- Generates n8n-compatible workflows automatically
- Integrates with AI content generators (OpenAI, Groq, DALL-E, Stable Diffusion)
- Manages external APIs (Canva, Mailchimp, Google Analytics)
- Provides real-time workflow monitoring and analytics
- Offers an AI assistant chatbot for guidance

### Target Users

- Digital Marketing Agencies
- Marketing Professionals
- Social Media Managers
- Email Marketing Specialists
- Small Business Owners

---

## Environment

### System Context

**Primary Environment:**
- Frontend: Web application (React + TypeScript)
- Backend: Node.js/Express API server with TypeScript
- AI Integration: MoAI-ADK AI modules (NLP, prompt engineering, conversational AI)
- Workflow Automation: n8n self-hosted or cloud instance
- Deployment: Vercel/Netlify (frontend), Backend hosting service (Railway/Render/Fly.io)

**Supported Platforms:**
- Desktop browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers: iOS Safari, Chrome Mobile (responsive design)
- Target screen resolution: 1280x720 minimum

**External Dependencies:**
- n8n API (workflow creation and deployment)
- OpenAI API (GPT-4 for text generation, DALL-E for images)
- Groq API (fast inference alternative)
- Canva API (graphic design automation)
- Mailchimp API (email campaign management)
- Google Analytics API (performance tracking)
- Social Media APIs (Instagram, Facebook, Twitter, LinkedIn)

### Technical Constraints

**Framework Constraints:**
- MUST use MoAI-ADK as core framework
- MUST implement JWT-based authentication
- MUST comply with OWASP Top 10 security standards
- MUST achieve 85%+ test coverage per TRUST 5 framework

**Performance Requirements:**
- API response time: < 200ms (P95)
- Workflow generation: < 10 seconds for standard workflows
- Asset generation: < 30 seconds for AI-generated assets
- Dashboard load time: < 2 seconds

**Scalability Requirements:**
- Support 100+ concurrent users
- Handle 1000+ workflows per month
- Process 50+ simultaneous asset generation requests

**Regulatory Compliance:**
- GDPR compliance for EU users
- CCPA compliance for California users
- API key security and encryption
- Rate limiting to prevent abuse

---

## Assumptions

### Technical Assumptions

| Assumption | Confidence | Evidence Basis | Risk if Wrong | Validation Method |
|------------|------------|----------------|---------------|-------------------|
| n8n API provides workflow CRUD operations | High | n8n API documentation confirms workflow endpoints | Medium - May require custom API wrapper | Review n8n API docs, test endpoint access |
| OpenAI API supports bulk content generation | High | API documentation and usage examples | Low - Well-documented feature | Test API calls with sample requests |
| Canva API exposes programmatic design creation | Medium | Limited API documentation | High - May require manual approval | Contact Canva developer support |
| MoAI-ADK AI modules integrate with Node.js | High | Module documentation shows TS support | Low - TypeScript compatible | Test module imports and basic operations |
| React 19 supports required UI patterns | High | Release notes confirm Server Components | Low - Feature-complete | Prototype critical UI components |

### Business Assumptions

| Assumption | Confidence | Evidence Basis | Risk if Wrong | Validation Method |
|------------|------------|----------------|---------------|-------------------|
| Marketing agencies need workflow automation | High | Industry research and competitor analysis | High - Market may not exist | Conduct user interviews with 5+ agencies |
| Users prefer natural language input over forms | Medium | UX studies on AI interfaces | Medium - May prefer structured input | A/B test both approaches in prototype |
| Free-tier users can sustain business model | Low | Competitor pricing analysis | High - Revenue may be insufficient | Financial modeling with different scenarios |
| AI-generated content quality is acceptable | Medium | Current GPT-4 capabilities | Medium - May require human review | Generate sample content, evaluate quality |

### Integration Assumptions

| Assumption | Confidence | Evidence Basis | Risk if Wrong | Validation Method |
|------------|------------|----------------|---------------|-------------------|
| n8n workflow execution is reliable | High | Production usage reports | Low - Proven technology | Test workflow execution with 100+ runs |
| Social media API rate limits are sufficient | Medium | API documentation shows limits | High - May throttle campaigns | Simulate high-volume posting scenarios |
| Third-party API uptime is 99%+ | High | SLA documentation | Medium - Downtime affects users | Monitor API status for 2 weeks |

---

## Requirements (EARS Format)

### 1. Strategy Input Panel

#### 1.1 Strategy Form Input

**WHEN** a marketing professional accesses the strategy input panel, **THEN** the system **SHALL** display a form with fields for target audience, campaign goals, marketing channels, budget allocation, and timeline.

**WHEN** a user provides target audience information, **THEN** the system **SHALL** validate that required fields (age range, interests, location) are not empty.

**IF** a user selects "social media" as a marketing channel, **THEN** the system **SHALL** display additional fields for platform selection (Instagram, Facebook, Twitter, LinkedIn).

**WHILE** the user is entering budget information, **THE SYSTEM** **SHALL** provide real-time validation to ensure budget allocation does not exceed total budget.

#### 1.2 AI-Powered Input Refinement

**WHEN** a user submits incomplete or vague strategy inputs, **THEN** the system **SHALL** use AI to generate clarifying questions and suggestions for refinement.

**IF** the user's target audience description is less than 10 words, **THEN** the system **SHALL** prompt for more detailed demographic information.

**WHERE** possible, the system **SHALL** provide pre-defined strategy templates based on industry best practices (e.g., "E-commerce Launch", "Brand Awareness", "Lead Generation").

**THE SYSTEM** **SHALL** **ALWAYS** preserve user input history to enable strategy iteration and comparison.

#### 1.3 Channel Support

**WHEN** a user selects multiple marketing channels, **THEN** the system **SHALL** generate channel-specific strategy recommendations for each selected channel.

**IF** "email marketing" is selected, **THEN** the system **SHALL** prompt for email list size, segmentation strategy, and email frequency.

**IF** "SEO" is selected, **THEN** the system **SHALL** request target keywords, content strategy, and competitor analysis preferences.

**THE SYSTEM** **SHALL NOT** allow contradictory channel strategies (e.g., "B2B only" with "TikTok" as primary channel).

### 2. AI Workflow Generator

#### 2.1 Natural Language Processing

**WHEN** a user submits a natural language request such as "Create 10 Instagram posts for a fitness brand targeting millennials", **THEN** the system **SHALL** parse the input to extract: content type (Instagram posts), quantity (10), brand domain (fitness), target audience (millennials).

**IF** the natural language input is ambiguous or missing critical information, **THEN** the system **SHALL** ask clarifying questions before proceeding.

**THE SYSTEM** **SHALL** **ALWAYS** display the interpreted requirements to the user for confirmation before workflow generation.

#### 2.2 n8n Workflow Generation

**WHEN** the user confirms interpreted requirements, **THEN** the system **SHALL** generate a valid n8n workflow JSON definition.

**THE GENERATED WORKFLOW** **SHALL** include:
- HTTP Request nodes for API calls
- Code nodes for data transformation
- Error handling nodes with retry logic
- IF/ELSE nodes for conditional logic
- Webhook nodes for triggers (if applicable)
- Function nodes for custom logic

**IF** the workflow requires AI content generation, **THEN** the system **SHALL** insert OpenAI/Groq API nodes with appropriate prompt templates.

**THE SYSTEM** **SHALL** **NOT** generate workflows that exceed n8n's maximum node count limit (1000 nodes).

#### 2.3 Workflow Preview

**BEFORE** deploying a workflow to n8n, **THE SYSTEM** **SHALL** display a visual preview of the workflow structure.

**WHEN** the user views the workflow preview, **THEN** the system **SHALL** show:
- Node connections and data flow
- API credentials used (masked)
- Estimated execution time
- Estimated cost (if applicable)

**IF** the user modifies the workflow in the preview, **THEN** the system **SHALL** update the workflow JSON accordingly.

#### 2.4 Workflow Deployment

**WHEN** the user approves the workflow, **THEN** the system **SHALL** deploy the workflow to the configured n8n instance via API.

**IF** deployment fails, **THEN** the system **SHALL** display the error message and suggest corrective actions.

**THE SYSTEM** **SHALL** **ALWAYS** store a backup of deployed workflows in the application database for recovery purposes.

### 3. Asset Creation Automation

#### 3.1 Text Content Generation

**WHEN** a workflow requires text content generation (social media posts, email copy, blog articles), **THEN** the system **SHALL** use OpenAI GPT-4 or Groq API to generate content.

**THE GENERATED CONTENT** **SHALL** adhere to:
- Brand voice guidelines (if provided)
- Platform-specific best practices (character limits, hashtags)
- SEO best practices (keywords, meta descriptions)
- Legal requirements (disclosures, disclaimers)

**IF** the user provides brand voice examples, **THEN** the system **SHALL** use few-shot prompting to match the style.

**WHERE** possible, the system **SHALL** generate multiple variations for A/B testing.

#### 3.2 Image Generation

**WHEN** a workflow requires image assets, **THEN** the system **SHALL** use DALL-E 3 or Stable Diffusion API to generate images.

**THE GENERATED IMAGES** **SHALL** comply with:
- Platform dimension requirements (1080x1080 for Instagram, 1920x1080 for YouTube thumbnails)
- Brand color schemes (if specified)
- Safe content guidelines (no prohibited content)

**IF** image generation fails, **THEN** the system **SHALL** retry with modified prompts up to 3 times.

**THE SYSTEM** **SHALL NOT** generate images depicting real people or copyrighted characters without explicit user consent.

#### 3.3 External API Integration

**WHEN** a workflow requires graphic design, **THEN** the system **SHALL** use Canva API to create or modify designs.

**IF** a workflow requires email campaigns, **THEN** the system **SHALL** use Mailchimp API to:
- Create email campaigns
- Add recipients to segments
- Schedule sending
- Track open/click rates

**WHEN** external API calls fail, **THEN** the system **SHALL** implement exponential backoff retry logic (1s, 2s, 4s, 8s, 16s max).

**THE SYSTEM** **SHALL** **ALWAYS** mask API keys in logs and error messages.

#### 3.4 Content Personalization

**IF** a campaign targets multiple audience segments, **THEN** the system **SHALL** generate personalized content for each segment.

**WHEN** personalizing content, **THE SYSTEM** **SHALL** use:
- First names (if provided)
- Location-specific information
- Past engagement data (if available)
- Device-specific formatting

**THE SYSTEM** **SHALL NOT** use sensitive personal information (health, financial, political) without explicit consent.

### 4. Workflow Management

#### 4.1 Workflow List

**WHEN** a user accesses the workflow management section, **THEN** the system **SHALL** display a list of all generated workflows with:
- Workflow name
- Creation date
- Last execution status
- Execution count
- Actions (edit, deploy, monitor, delete)

**THE SYSTEM** **SHALL** provide filtering and sorting options (by date, status, name).

**IF** more than 50 workflows exist, **THEN** the system **SHALL** implement pagination (20 workflows per page).

#### 4.2 Workflow Editing

**WHEN** a user edits an existing workflow, **THEN** the system **SHALL** provide a visual editor for:
- Adding/removing nodes
- Modifying node parameters
- Reconnecting nodes
- Adjusting triggers and schedules

**IF** a user modifies a deployed workflow, **THEN** the system **SHALL** warn that changes must be redeployed to take effect.

**THE SYSTEM** **SHALL** **ALWAYS** maintain version history for workflows (minimum 10 versions).

#### 4.3 Real-Time Monitoring

**WHEN** a workflow is executing, **THEN** the system **SHALL** display real-time status updates via WebSocket connection.

**THE STATUS DISPLAY** **SHALL** include:
- Currently executing node
- Execution time elapsed
- Data passed between nodes
- Errors or warnings

**IF** a workflow execution fails, **THEN** the system **SHALL** highlight the failed node and display error details.

**THE SYSTEM** **SHALL** **ALWAYS** log all workflow executions for debugging and audit purposes.

#### 4.4 Execution Logs

**WHEN** a user views workflow execution logs, **THEN** the system **SHALL** display:
- Start and end timestamps
- Execution status (success/failure/running)
- Node-by-node execution details
- Input/output data for each node
- Error messages (if applicable)

**THE SYSTEM** **SHALL** retain execution logs for minimum 90 days.

**IF** logs contain sensitive data, **THEN** the system **SHALL** mask or encrypt the data before storage.

### 5. Analytics and Reporting

#### 5.1 Campaign Performance Tracking

**WHEN** a campaign is active, **THEN** the system **SHALL** automatically fetch performance metrics from:
- Google Analytics (website traffic, conversions)
- Social media APIs (engagement, reach, impressions)
- Email marketing platforms (open rate, click rate, conversions)

**THE DASHBOARD** **SHALL** display metrics in:
- Visual charts (line graphs, bar charts, pie charts)
- Aggregated tables with sorting and filtering
- Date range comparisons (week-over-week, month-over-month)

**THE SYSTEM** **SHALL** update metrics at minimum every 24 hours.

#### 5.2 AI Insights and Optimization

**WHEN** performance data is available, **THEN** the system **SHALL** use AI to generate optimization suggestions.

**THE SUGGESTIONS** **SHALL** include:
- Underperforming content recommendations
- Best posting times based on engagement
- Audience expansion opportunities
- A/B test recommendations

**IF** a user implements a suggestion, **THEN** the system **SHALL** track the impact of the change.

**THE SYSTEM** **SHALL** **NOT** make automatic changes to campaigns without user approval.

#### 5.3 Custom Reports

**WHEN** a user requests a custom report, **THEN** the system **SHALL** allow selection of:
- Date range
- Metrics to include
- Campaigns to compare
- Visualization format

**THE GENERATED REPORT** **SHALL** be exportable in:
- PDF format
- CSV format
- Excel format

**WHERE** possible, the system **SHALL** provide report templates for common use cases.

### 6. All-in-One Assistant Chat

#### 6.1 Chatbot Interface

**WHEN** a user accesses the assistant chat, **THEN** the system **SHALL** display a conversational interface with:
- Message history
- Input field for text/voice commands
- Quick action buttons
- Typing indicator for AI responses

**THE SYSTEM** **SHALL** **ALWAYS** maintain conversation context for the current session.

#### 6.2 Natural Language Understanding

**WHEN** a user asks a question or gives a command, **THEN** the system **SHALL** use NLP to understand:
- Intent (question, command, clarification)
- Entities (workflow names, campaign names, dates)
- Sentiment (confusion, satisfaction, urgency)

**IF** the system does not understand the user's intent, **THEN** the system **SHALL** ask clarifying questions.

**THE SYSTEM** **SHALL** support multi-turn conversations with context preservation.

#### 6.3 Capabilities

**THE ASSISTANT** **SHALL** be able to:
- Answer questions about features and workflows
- Guide users through workflow creation step-by-step
- Explain error messages and suggest fixes
- Provide marketing strategy recommendations
- Trigger workflow creation via command
- Schedule workflow executions

**IF** the user requests a complex action, **THEN** the system **SHALL** break it down into step-by-step instructions.

**WHERE** possible, the system **SHALL** provide proactive suggestions based on user behavior.

#### 6.4 Voice Commands

**IF** the user's browser supports Web Speech API, **THEN** the system **SHALL** provide voice input capability.

**WHEN** voice input is enabled, **THE SYSTEM** **SHALL**:
- Display a microphone button
- Provide visual feedback during recording
- Transcribe speech to text for confirmation
- Support common voice commands

**THE SYSTEM** **SHALL NOT** store voice recordings after transcription without explicit consent.

---

## Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  React 19 + TypeScript + TailwindCSS                        │
│  ┌───────────────┬───────────────┬───────────────┐         │
│  │ Strategy UI   │ Workflow UI   │ Analytics UI  │         │
│  │ Chat Widget   │ Asset Preview │ Dashboard     │         │
│  └───────────────┴───────────────┴───────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│  Node.js + Express + TypeScript                             │
│  JWT Authentication │ Rate Limiting │ Request Validation    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ AI Services  │ Workflow Svc │ Asset Svc    │ Analytics Svc│
├──────────────┼──────────────┼──────────────┼──────────────┤
│ MoAI-ADK NLP │ n8n API      │ OpenAI API   │ GA API       │
│ Prompt Eng   │ Webhook Mgmt │ Groq API     │ Social APIs  │
│ Conversational│ JSON Schema │ DALL-E       │ Mailchimp    │
│              │ Validation   │ Stable Diff  │ Canva API    │
└──────────────┴──────────────┴──────────────┴──────────────┘
                            ▼
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ PostgreSQL   │ Redis Cache  │ n8n Instance │ Object Store │
│ User Data    │ Sessions     │ Workflows    │ Assets       │
│ Workflows    │ Rate Limits  │ Executions   │ Logs         │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Component Specifications

#### Frontend Components

**Technology Stack:**
- React 19 with TypeScript
- TailwindCSS for styling
- TanStack Query for server state
- Zustand for client state
- React Router for navigation
- WebSocket client for real-time updates

**Key Components:**

1. **StrategyInputForm**
   - Form validation with React Hook Form
   - AI-powered suggestions sidebar
   - Channel-specific conditional fields
   - Auto-save functionality

2. **WorkflowVisualizer**
   - React Flow for node-based visualization
   - Drag-and-drop node editing
   - Real-time preview updates
   - Export to n8n JSON format

3. **AssetGallery**
   - Grid/list view toggle
   - Image preview modal
   - Batch operations (regenerate, delete)
   - Export functionality

4. **AnalyticsDashboard**
   - Chart.js or Recharts for visualizations
   - Custom date range picker
   - Metric comparison tools
   - Export to PDF/CSV

5. **AssistantChat**
   - Message thread view
   - Voice input button (Web Speech API)
   - Quick action suggestions
   - Typing indicators

#### Backend Services

**Technology Stack:**
- Node.js 20+ LTS
- Express.js with TypeScript
- JWT authentication (jsonwebtoken)
- PostgreSQL with Prisma ORM
- Redis for caching
- WebSocket server (Socket.io)

**Service Architecture:**

1. **AuthenticationService**
   - JWT token generation and validation
   - Password hashing with bcrypt
   - Multi-user support with roles
   - Session management via Redis

2. **WorkflowService**
   - n8n API integration
   - Workflow JSON generation
   - Template management
   - Version control

3. **AIService**
   - MoAI-ADK integration
   - Prompt template management
   - OpenAI/Groq API calls
   - Response parsing and validation

4. **AssetService**
   - Text generation orchestration
   - Image generation coordination
   - External API integration (Canva, Mailchimp)
   - Asset storage and retrieval

5. **AnalyticsService**
   - Third-party API integration
   - Data aggregation and transformation
   - AI-powered insights generation
   - Report generation

#### Database Schema

**Users Table**
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- role: ENUM('admin', 'user', 'viewer')
- api_keys: JSONB (encrypted)
- preferences: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Workflows Table**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- name: VARCHAR(255)
- description: TEXT
- n8n_workflow_json: JSONB
- version: INTEGER
- status: ENUM('draft', 'deployed', 'archived')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Campaigns Table**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- workflow_id: UUID (FK)
- name: VARCHAR(255)
- strategy: JSONB
- status: ENUM('active', 'paused', 'completed')
- metrics: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Assets Table**
```sql
- id: UUID (PK)
- campaign_id: UUID (FK)
- type: ENUM('text', 'image', 'video', 'design')
- content: TEXT
- file_url: VARCHAR(500)
- metadata: JSONB
- created_at: TIMESTAMP
```

**Executions Table**
```sql
- id: UUID (PK)
- workflow_id: UUID (FK)
- status: ENUM('running', 'success', 'failed')
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- logs: JSONB
- error_message: TEXT
```

**Conversations Table**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- messages: JSONB
- context: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### API Endpoints

**Authentication**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

**Strategy**
- `POST /api/v1/strategy/analyze` - Analyze strategy input with AI
- `POST /api/v1/strategy/save` - Save strategy for campaign
- `GET /api/v1/strategy/templates` - Get strategy templates

**Workflows**
- `POST /api/v1/workflows/generate` - Generate workflow from natural language
- `GET /api/v1/workflows` - List user workflows
- `GET /api/v1/workflows/:id` - Get workflow details
- `PUT /api/v1/workflows/:id` - Update workflow
- `DELETE /api/v1/workflows/:id` - Delete workflow
- `POST /api/v1/workflows/:id/deploy` - Deploy workflow to n8n
- `GET /api/v1/workflows/:id/versions` - Get workflow version history

**Assets**
- `POST /api/v1/assets/generate` - Generate asset (text/image)
- `GET /api/v1/assets` - List user assets
- `GET /api/v1/assets/:id` - Get asset details
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

**Campaigns**
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/campaigns` - List campaigns
- `GET /api/v1/campaigns/:id` - Get campaign details
- `PUT /api/v1/campaigns/:id` - Update campaign
- `DELETE /api/v1/campaigns/:id` - Delete campaign
- `POST /api/v1/campaigns/:id/execute` - Execute campaign workflow

**Analytics**
- `GET /api/v1/analytics/campaigns/:id` - Get campaign analytics
- `GET /api/v1/analytics/insights` - Get AI-generated insights
- `GET /api/v1/analytics/reports/:id` - Get specific report
- `POST /api/v1/analytics/reports` - Generate custom report

**Assistant**
- `POST /api/v1/assistant/chat` - Send message to assistant
- `GET /api/v1/assistant/conversations` - List conversations
- `GET /api/v1/assistant/conversations/:id` - Get conversation history
- `POST /api/v1/assistant/voice` - Process voice command

**n8n Integration**
- `GET /api/v1/n8n/status` - Check n8n connection status
- `POST /api/v1/n8n/webhook` - Receive n8n execution webhooks
- `GET /api/v1/n8n/executions/:id` - Get execution details

---

## Security Requirements

### OWASP Top 10 Compliance

#### 1. Injection Attacks

**THE SYSTEM** **SHALL** prevent:
- SQL injection via parameterized queries (Prisma ORM)
- NoSQL injection via input sanitization
- OS command injection via whitelist validation
- LDAP injection via proper escaping

**ALL** user inputs **SHALL** be validated using Pydantic schemas before processing.

#### 2. Broken Authentication

**THE SYSTEM** **SHALL** implement:
- Strong password policy (minimum 12 characters, complexity requirements)
- Secure password hashing with bcrypt (cost factor 12)
- JWT token expiration (15 minutes access token, 7 days refresh token)
- Secure token storage (HttpOnly cookies)
- Multi-factor authentication (optional for Phase 2)

**THE SYSTEM** **SHALL NOT**:
- Allow weak passwords or common passwords
- Store passwords in plaintext
- Expose JWT tokens in URLs

#### 3. Data Exposure

**THE SYSTEM** **SHALL**:
- Encrypt sensitive data at rest (API keys, passwords)
- Use HTTPS for all communications in production
- Mask sensitive data in logs (API keys, passwords, PII)
- Implement proper CORS configuration
- Use secure HTTP headers (Helmet.js)

**THE SYSTEM** **SHALL NOT**:
- Expose stack traces to end users
- Return verbose error messages with system details
- Log sensitive user information

#### 4. XML External Entities (XXE)

**THE SYSTEM** **SHALL**:
- Disable XML external entity processing
- Use JSON for data exchange instead of XML

#### 5. Broken Access Control

**THE SYSTEM** **SHALL**:
- Implement role-based access control (RBAC)
- Validate ownership of resources before access
- Prevent privilege escalation
- Implement proper API authorization checks
- Use UUIDs instead of auto-increment IDs

**THE SYSTEM** **SHALL NOT**:
- Allow users to access other users' resources
- Expose administrative functionality to regular users

#### 6. Security Misconfiguration

**THE SYSTEM** **SHALL**:
- Disable debug mode in production
- Remove default credentials
- Keep dependencies up-to-date
- Implement proper error handling
- Use environment-specific configurations

**THE SYSTEM** **SHALL NOT**:
- Expose configuration files
- Use default encryption keys

#### 7. Cross-Site Scripting (XSS)

**THE SYSTEM** **SHALL**:
- Sanitize user-generated content before display
- Implement Content Security Policy (CSP)
- Escape HTML entities in user input
- Use HttpOnly cookies for session tokens

#### 8. Insecure Deserialization

**THE SYSTEM** **SHALL**:
- Validate serialized data before deserialization
- Use integrity checks for serialized objects
- Avoid deserializing untrusted data

#### 9. Using Components with Known Vulnerabilities

**THE SYSTEM** **SHALL**:
- Scan dependencies for vulnerabilities (npm audit)
- Update dependencies regularly
- Monitor security advisories
- Use Dependabot for automated updates

#### 10. Insufficient Logging & Monitoring

**THE SYSTEM** **SHALL**:
- Log all authentication attempts (success and failure)
- Log all authorization failures
- Log all high-value transactions
- Implement log aggregation and monitoring
- Alert on suspicious activities

### API Key Management

**THE SYSTEM** **SHALL**:
- Encrypt API keys at rest using AES-256
- Never log API keys in plaintext
- Provide masked display in UI (e.g., `sk-...1234`)
- Support API key rotation
- Allow users to revoke API keys
- Use environment variables for API keys in server

**THE SYSTEM** **SHALL NOT**:
- Store API keys in code or version control
- Expose API keys in client-side code
- Share API keys between users

### Rate Limiting

**THE SYSTEM** **SHALL** implement:
- Per-IP rate limiting (100 requests per minute)
- Per-user rate limiting (1000 requests per hour)
- Per-endpoint rate limiting (strict limits on expensive operations)
- Exponential backoff for rate limit violations
- HTTP 429 (Too Many Requests) response with Retry-After header

### GDPR Compliance

**THE SYSTEM** **SHALL**:
- Obtain explicit consent for data processing
- Provide data export functionality
- Provide data deletion functionality (right to be forgotten)
- Implement data retention policies (90 days for logs)
- Appoint a data protection officer (if required)
- Conduct data protection impact assessments

**THE SYSTEM** **SHALL** maintain records of:
- User consent
- Data processing activities
- Data breaches (if occurring)

---

## Integration Points

### n8n Integration

**API Version:** n8n REST API (latest stable version)

**Endpoints Used:**
- `POST /workflows` - Create workflow
- `GET /workflows/{id}` - Get workflow details
- `PUT /workflows/{id}` - Update workflow
- `DELETE /workflows/{id}` - Delete workflow
- `POST /workflows/{id}/activate` - Activate workflow
- `POST /workflows/{id}/deactivate` - Deactivate workflow
- `GET /executions` - List executions
- `GET /executions/{id}` - Get execution details

**Authentication:** API key or OAuth token

**Webhook Integration:**
- n8n sends execution status updates to application webhook endpoint
- Application verifies webhook signature for security

**Error Handling:**
- Retry failed API calls with exponential backoff
- Log all API interactions for debugging
- Display user-friendly error messages

### OpenAI Integration

**API Version:** OpenAI API v1

**Models Used:**
- GPT-4 Turbo - Text generation, workflow generation
- GPT-3.5 Turbo - Chat assistant (faster, cheaper)
- DALL-E 3 - Image generation

**Rate Limits:**
- Implement request queuing to stay within limits
- Cache common responses to reduce API calls
- Use Groq as fallback for high-volume operations

**Cost Management:**
- Track token usage per user
- Implement usage alerts and limits
- Optimize prompts to reduce token consumption

### Canva Integration

**API Version:** Canva API (latest)

**Capabilities:**
- Create designs from templates
- Modify text and images in designs
- Export designs in multiple formats

**Authentication:** OAuth 2.0

**Limitations:**
- Rate limits (100 requests per hour per user)
- Design complexity limits
- Requires user approval for app access

### Mailchimp Integration

**API Version:** Mailchimp API v3

**Capabilities:**
- Create email campaigns
- Manage subscriber lists
- Schedule campaigns
- Track campaign statistics

**Authentication:** API key

**Data Handling:**
- Sync subscriber data regularly
- Handle bounce and complaint notifications
- Comply with anti-spam regulations

### Google Analytics Integration

**API Version:** Google Analytics Reporting API v4

**Capabilities:**
- Fetch traffic metrics
- Track conversions
- Generate custom reports

**Authentication:** OAuth 2.0 service account

**Data Refresh:**
- Cache data for 1 hour to reduce API calls
- Incremental updates for large date ranges

### Social Media APIs

**Platforms Supported:**
- Instagram Graph API
- Facebook Graph API
- Twitter API v2
- LinkedIn Marketing API

**Capabilities:**
- Post content
- Schedule posts
- Fetch engagement metrics
- Manage comments

**Rate Limiting:**
- Respect platform-specific rate limits
- Implement per-platform rate limit tracking
- Queue posts to stay within limits

---

## Edge Cases & Error Handling

### Natural Language Processing Edge Cases

**Case 1: Ambiguous User Input**
- Scenario: User says "Create posts for my campaign"
- Missing: Number of posts, platform, brand
- Handling: Ask clarifying questions before proceeding
- Fallback: Provide template options for quick selection

**Case 2: Conflicting Instructions**
- Scenario: User says "Create 10 posts" then "Actually, make it 5"
- Handling: Confirm with user before regenerating
- Prevention: Require confirmation for destructive changes

**Case 3: Unrecognized Entities**
- Scenario: User mentions brand not in database
- Handling: Prompt user to provide brand details
- Learning: Store brand info for future use

### Workflow Generation Edge Cases

**Case 1: Exceeding Node Limits**
- Scenario: Generated workflow exceeds 1000 nodes
- Handling: Split into multiple sub-workflows
- Notification: Inform user about workflow split

**Case 2: Circular Dependencies**
- Scenario: Workflow creates infinite loop
- Detection: Validate workflow structure before deployment
- Prevention: Limit recursion depth, detect cycles

**Case 3: Missing Required Credentials**
- Scenario: Workflow requires API key not configured
- Handling: Prompt user to configure API key
- Prevention: Validate credentials before deployment

### Asset Generation Edge Cases

**Case 1: Content Policy Violations**
- Scenario: AI generates prohibited content
- Detection: Content moderation filters
- Handling: Flag for manual review, regenerate with adjusted prompt

**Case 2: API Rate Limits**
- Scenario: OpenAI rate limit exceeded
- Handling: Queue request, provide estimated wait time
- Fallback: Use alternative AI provider (Groq)

**Case 3: Generation Failures**
- Scenario: Image generation fails repeatedly
- Handling: Notify user, suggest alternative approaches
- Logging: Record failure for troubleshooting

### Deployment Edge Cases

**Case 1: n8n Service Unavailable**
- Scenario: Cannot connect to n8n instance
- Handling: Display connection error, retry with backoff
- Notification: Alert administrators if service remains down

**Case 2: Workflow Validation Errors**
- Scenario: n8n rejects workflow JSON
- Handling: Display validation error, highlight problematic node
- Prevention: Validate JSON structure before sending to n8n

**Case 3: Concurrent Deployment Conflicts**
- Scenario: Multiple users deploy same workflow
- Handling: Implement optimistic locking
- Resolution: Notify conflict, require manual merge

### Execution Monitoring Edge Cases

**Case 1: Long-Running Workflows**
- Scenario: Workflow execution exceeds expected time
- Handling: Provide progress updates, allow cancellation
- Timeout: Implement maximum execution time limit

**Case 2: Intermittent Failures**
- Scenario: Workflow fails intermittently
- Detection: Track failure patterns
- Handling: Implement automatic retry with circuit breaker

**Case 3: Zombie Executions**
- Scenario: Execution marked as running but actually stopped
- Detection: Heartbeat monitoring
- Resolution: Mark as failed, notify user

### Analytics Edge Cases

**Case 1: Data Gaps**
- Scenario: Third-party API returns incomplete data
- Handling: Flag missing data points, continue with available data
- Notification: Inform user about data quality issues

**Case 2: Metric Calculation Errors**
- Scenario: Division by zero in metrics
- Handling: Return null or 0 with explanation
- Prevention: Validate data before calculations

**Case 3: Time Zone Issues**
- Scenario: User views analytics in different time zone
- Handling: Store all timestamps in UTC, convert to user's time zone
- UI: Display time zone used for clarity

### Authentication Edge Cases

**Case 1: Token Expiration During Operation**
- Scenario: JWT expires while user is active
- Handling: Automatic token refresh via refresh token
- User Experience: Seamless, no interruption

**Case 2: Concurrent Login Conflicts**
- Scenario: Same user logs in from multiple devices
- Handling: Allow multiple sessions, provide session list
- Security: Notify user of new login, allow remote logout

**Case 3: Compromised Credentials**
- Scenario: Login from unusual location
- Detection: Flag suspicious activity
- Handling: Require additional verification (MFA)

### Data Consistency Edge Cases

**Case 1: Race Conditions**
- Scenario: Two users edit same workflow simultaneously
- Handling: Implement version control with conflict resolution
- Prevention: Pessimistic locking for critical operations

**Case 2: Orphaned Records**
- Scenario: Campaign deleted but executions remain
- Handling: Cascade delete or soft delete with cleanup job
- Prevention: Foreign key constraints with proper actions

**Case 3: Data Migration Issues**
- Scenario: Schema change breaks existing data
- Handling: Backward-compatible migrations, data transformation scripts
- Testing: Test migrations on staging before production

---

## Traceability

### Requirements to Components Mapping

| Requirement ID | Requirement | Frontend Component | Backend Service | Database Table |
|----------------|-------------|-------------------|-----------------|----------------|
| 1.1 | Strategy Form Input | StrategyInputForm | StrategyService | users, campaigns |
| 1.2 | AI Input Refinement | AISuggestionsPanel | AIService | conversations |
| 2.1 | NLP Processing | NaturalLanguageInput | AIService | conversations |
| 2.2 | Workflow Generation | WorkflowVisualizer | WorkflowService | workflows |
| 3.1 | Text Generation | TextAssetPreview | AssetService | assets |
| 3.2 | Image Generation | ImageGallery | AssetService | assets |
| 4.1 | Workflow List | WorkflowList | WorkflowService | workflows |
| 4.2 | Workflow Editing | WorkflowEditor | WorkflowService | workflows, versions |
| 5.1 | Performance Tracking | AnalyticsDashboard | AnalyticsService | campaigns, metrics |
| 6.1 | Chatbot Interface | AssistantChat | AssistantService | conversations |

### Acceptance Criteria Links

Each requirement section maps to specific acceptance criteria in `acceptance.md`:
- Requirements 1.x → AC-1xx (Strategy Input Panel)
- Requirements 2.x → AC-2xx (AI Workflow Generator)
- Requirements 3.x → AC-3xx (Asset Creation Automation)
- Requirements 4.x → AC-4xx (Workflow Management)
- Requirements 5.x → AC-5xx (Analytics and Reporting)
- Requirements 6.x → AC-6xx (All-in-One Assistant Chat)

---

*Last Updated: 2026-01-31*
*Next Review: After Phase 1 completion*
