# Acceptance Criteria: n8n Marketing Dashboard

## TAG BLOCK

```yaml
SPEC_ID: SPEC-MKT-001
RELATED_SPEC: spec.md
IMPLEMENTATION_PLAN: plan.md
STATUS: Planned
```

---

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Feature 1: Strategy Input Panel](#feature-1-strategy-input-panel)
3. [Feature 2: AI Workflow Generator](#feature-2-ai-workflow-generator)
4. [Feature 3: Asset Creation Automation](#feature-3-asset-creation-automation)
5. [Feature 4: Workflow Management](#feature-4-workflow-management)
6. [Feature 5: Analytics and Reporting](#feature-5-analytics-and-reporting)
7. [Feature 6: All-in-One Assistant Chat](#feature-6-all-in-one-assistant-chat)
8. [Security Acceptance Criteria](#security-acceptance-criteria)
9. [Performance Acceptance Criteria](#performance-acceptance-criteria)

---

## Testing Strategy Overview

### Test Coverage Requirements

**Per TRUST 5 Framework:**
- **Unit Tests:** Minimum 85% code coverage
- **Integration Tests:** All API endpoints covered
- **E2E Tests:** Critical user journeys covered
- **Characterization Tests:** Existing code behavior preserved

### Testing Pyramid

```
         E2E Tests (10%)
        - Critical user journeys
        - Smoke tests

       Integration Tests (30%)
        - API endpoints
        - Database operations
        - External API integrations

      Unit Tests (60%)
        - Business logic
        - Components
        - Utilities
```

### Test Organization

**Directory Structure:**
```
tests/
├── unit/
│   ├── services/           # Business logic tests
│   ├── components/         # Frontend component tests
│   └── utils/              # Utility function tests
├── integration/
│   ├── api/                # API endpoint tests
│   ├── database/           # Database operation tests
│   └── external/           # Third-party integration tests
└── e2e/
    ├── workflows/          # Complete user journey tests
    └── smoke/              # Smoke tests
```

---

## Feature 1: Strategy Input Panel

### AC-101: Strategy Form Input

**Given** a marketing professional is logged in
**When** they access the strategy input panel
**Then** the system shall display a form with fields for:
- Target audience (age range, interests, location)
- Campaign goals
- Marketing channels (checkboxes for social media, email, SEO)
- Budget allocation
- Timeline (start date, end date)

**Given** a user is filling out the strategy form
**When** they provide target audience information
**Then** the system shall validate that required fields are not empty
**And** display error messages if validation fails

**Given** a user has selected "social media" as a marketing channel
**When** the channel selection changes
**Then** the system shall display additional fields for platform selection (Instagram, Facebook, Twitter, LinkedIn)

**Given** a user is entering budget information
**When** they allocate budget across channels
**Then** the system shall provide real-time validation to ensure allocation does not exceed total budget
**And** display remaining budget

**Test Scenarios:**
```gherkin
Scenario: User submits valid strategy form
  Given user is on strategy input page
  And user fills in target audience: "Age 25-34, Fitness enthusiasts, US"
  And user selects "social media" channel
  And user fills budget: "$5000"
  And user fills timeline: "2026-03-01 to 2026-03-31"
  When user submits form
  Then strategy is saved successfully
  And user sees success message

Scenario: User submits incomplete strategy form
  Given user is on strategy input page
  And user leaves target audience empty
  When user attempts to submit form
  Then error message displays: "Target audience is required"
  And form highlights missing fields

Scenario: User allocates budget exceeding total
  Given user sets total budget to "$5000"
  And user allocates "$3000" to social media
  And user attempts to allocate "$2500" to email
  Then system shows error: "Allocation exceeds total budget"
  And remaining budget shows "-$500"
```

---

### AC-102: AI-Powered Input Refinement

**Given** a user has submitted incomplete strategy inputs
**When** the AI analysis is triggered
**Then** the system shall generate clarifying questions
**And** display suggestions for refinement

**Given** a user's target audience description is less than 10 words
**When** the form validation runs
**Then** the system shall prompt for more detailed demographic information
**And** provide examples of good descriptions

**Given** a user is viewing strategy suggestions
**When** the system provides templates
**Then** the templates shall include:
- "E-commerce Launch"
- "Brand Awareness"
- "Lead Generation"
- "Event Promotion"

**Given** a user has saved multiple strategy versions
**When** they access strategy history
**Then** the system shall display all saved versions
**And** allow comparison between versions

**Test Scenarios:**
```gherkin
Scenario: AI suggests refinements for vague input
  Given user enters target audience: "Everyone"
  When user triggers AI analysis
  Then system asks: "Could you specify age range, location, interests?"
  And system provides example: "Age 25-34, Urban professionals, US"

Scenario: User selects strategy template
  Given user is on strategy input page
  When user selects "E-commerce Launch" template
  Then form pre-fills with recommended fields:
    | Channel | Budget | Timeline |
    | Social Media, Email | 40/60 split | 4 weeks |
  And user can modify pre-filled values

Scenario: User compares strategy versions
  Given user has saved 3 strategy versions
  When user views strategy history
  Then system displays versions side-by-side
  And highlights differences between versions
```

---

### AC-103: Channel Support

**Given** a user has selected multiple marketing channels
**When** the strategy is saved
**Then** the system shall generate channel-specific recommendations for each selected channel

**Given** a user selects "email marketing" as a channel
**When** the channel-specific fields load
**Then** the system shall prompt for:
- Email list size
- Segmentation strategy
- Email frequency

**Given** a user selects "SEO" as a channel
**When** the channel-specific fields load
**Then** the system shall request:
- Target keywords
- Content strategy
- Competitor analysis preferences

**Given** a user enters contradictory channel strategies
**When** validation runs
**Then** the system shall display warning: "Incompatible channel strategies detected"
**And** suggest corrections

**Test Scenarios:**
```gherkin
Scenario: User selects email marketing channel
  Given user selects "email marketing" checkbox
  Then system displays additional fields:
    | Field | Type |
    | Email List Size | Number |
    | Segmentation Strategy | Dropdown |
    | Email Frequency | Dropdown |

Scenario: User enters contradictory strategies
  Given user selects "B2B only" as target audience
  And user selects "TikTok" as primary channel
  When user validates strategy
  Then system shows warning: "TikTok is primarily B2C platform"
  And system suggests: "Consider LinkedIn for B2B audiences"

Scenario: System generates channel-specific recommendations
  Given user selects "social media" and "email"
  When user saves strategy
  Then system generates recommendations:
    - Social Media: "Post 3-5 times per week, use visual content"
    - Email: "Send weekly newsletters, segment by engagement"
```

---

## Feature 2: AI Workflow Generator

### AC-201: Natural Language Processing

**Given** a user submits natural language request: "Create 10 Instagram posts for a fitness brand targeting millennials"
**When** the NLP processing completes
**Then** the system shall extract and display:
- Content type: "Instagram posts"
- Quantity: 10
- Brand domain: "fitness"
- Target audience: "millennials"

**Given** a user provides ambiguous input: "Create posts for my campaign"
**When** the NLP analysis detects missing information
**Then** the system shall ask clarifying questions:
- "How many posts do you need?"
- "Which platform?"
- "What is your brand about?"

**Given** the NLP processing completes
**When** the system displays interpreted requirements
**Then** the user must confirm before workflow generation proceeds

**Test Scenarios:**
```gherkin
Scenario: System parses natural language input
  Given user enters: "Create 5 blog posts about vegan recipes"
  When NLP processing completes
  Then system displays extracted parameters:
    | Content Type | Quantity | Brand Domain | Target Audience |
    | Blog Posts | 5 | Vegan Recipes | Not specified |
  And system asks: "Who is your target audience?"

Scenario: User confirms interpreted requirements
  Given system has extracted parameters
  And user reviews extracted parameters
  When user clicks "Generate Workflow"
  Then workflow generation proceeds

Scenario: User rejects interpreted requirements
  Given system has extracted parameters
  When user modifies "Blog Posts" to "Social Media Posts"
  And user clicks "Generate Workflow"
  Then workflow generation uses modified parameters
```

---

### AC-202: n8n Workflow Generation

**Given** a user has confirmed interpreted requirements
**When** the workflow generation completes
**Then** the system shall generate a valid n8n workflow JSON definition

**Given** the generated workflow
**When** inspected by the user
**Then** it shall include:
- HTTP Request nodes for API calls
- Code nodes for data transformation
- Error handling nodes with retry logic (max 3 retries)
- IF/ELSE nodes for conditional logic
- Webhook nodes for triggers (if applicable)
- Function nodes for custom logic

**Given** the workflow requires AI content generation
**When** the workflow is generated
**Then** it shall insert OpenAI/Groq API nodes with appropriate prompt templates

**Given** the workflow JSON is generated
**When** validated against n8n schema
**Then** it shall not exceed n8n's maximum node count limit (1000 nodes)

**Test Scenarios:**
```gherkin
Scenario: System generates valid n8n workflow
  Given user requests workflow for "10 Instagram posts"
  When workflow generation completes
  Then generated JSON includes:
    | Node Type | Quantity |
    | HTTP Request | 10+ |
    | OpenAI | 1+ |
    | Error Handling | 3+ |
  And JSON validates against n8n schema

Scenario: Workflow includes AI content generation
  Given user requests workflow with AI-generated content
  When workflow is generated
  Then OpenAI node includes:
    - Prompt template: "Generate {quantity} Instagram posts about {topic}"
    - Temperature parameter
    - Max tokens parameter
  And output is connected to transformation node

Scenario: Workflow exceeds node limit
  Given workflow complexity would require 1200 nodes
  When generation attempts to create workflow
  Then system detects limit exceeded
  And splits workflow into 2 sub-workflows
  And user is notified: "Workflow split into 2 parts due to complexity"
```

---

### AC-203: Workflow Preview

**Given** a workflow has been generated
**When** the user views the workflow preview
**Then** the system shall display a visual representation of:
- Node connections and data flow
- API credentials used (masked as `sk-...1234`)
- Estimated execution time
- Estimated cost (if applicable)

**Given** the user is viewing the workflow preview
**When** they modify the workflow
**Then** the system shall update the workflow JSON accordingly
**And** maintain modification history

**Given** the workflow preview is displayed
**When** the user hovers over a node
**Then** the system shall show node details:
- Node type and name
- Input parameters
- Output schema
- Connected nodes

**Test Scenarios:**
```gherkin
Scenario: User views workflow preview
  Given workflow has been generated
  When user clicks "Preview Workflow"
  Then visual diagram displays:
    - All nodes with icons
    - Connection lines between nodes
    - Data flow direction
  And system shows estimated execution time: "Approximately 2 minutes"
  And system shows estimated cost: "$0.15"

Scenario: User modifies workflow in preview
  Given user is viewing workflow preview
  When user drags node to new position
  Then workflow JSON updates with new node position
  And visual preview reflects change immediately

Scenario: User views node details
  Given user is viewing workflow preview
  When user hovers over OpenAI node
  Then tooltip displays:
    - Node Type: OpenAI Chat Model
    - Model: gpt-4-turbo
    - Temperature: 0.7
    - Max Tokens: 2000
```

---

### AC-204: Workflow Deployment

**Given** a user has approved the workflow
**When** they click "Deploy to n8n"
**Then** the system shall deploy the workflow to the configured n8n instance via API
**And** display deployment progress

**Given** the deployment is in progress
**When** the deployment completes successfully
**Then** the system shall display success message
**And** provide link to view workflow in n8n

**Given** the deployment fails
**When** the error is received from n8n
**Then** the system shall display the error message
**And** suggest corrective actions based on error type

**Given** a workflow is deployed successfully
**When** the deployment completes
**Then** the system shall store a backup in the application database
**And** associate it with the user account

**Test Scenarios:**
```gherkin
Scenario: Successful workflow deployment
  Given user has approved workflow
  And user clicks "Deploy to n8n"
  When deployment completes
  Then success message displays: "Workflow deployed successfully"
  And link to n8n workflow is provided
  And workflow is saved to database with status "deployed"

Scenario: Deployment fails with authentication error
  Given n8n API credentials are invalid
  When user attempts deployment
  Then error message displays: "Authentication failed. Check n8n API credentials."
  And system suggests: "Go to Settings → n8n Configuration"

Scenario: Deployment fails with validation error
  Given workflow JSON has invalid parameter
  When deployment attempt fails
  Then error message displays: "Validation error: Invalid parameter in OpenAI node"
  And system highlights problematic node in preview
  And system suggests: "Check OpenAI node parameters"

Scenario: Workflow backup created
  Given workflow deployment succeeds
  When backup process completes
  Then workflow JSON is stored in database
  And metadata includes:
    - Deployment timestamp
    - n8n workflow ID
    - User ID
```

---

## Feature 3: Asset Creation Automation

### AC-301: Text Content Generation

**Given** a workflow requires text content generation
**When** the AI generates content
**Then** it shall adhere to:
- Brand voice guidelines (if provided)
- Platform-specific best practices (character limits, hashtags)
- SEO best practices (keywords, meta descriptions)
- Legal requirements (disclosures, disclaimers)

**Given** a user provides brand voice examples
**When** the AI generates content
**Then** it shall use few-shot prompting to match the style
**And** generate at least 3 variations for A/B testing

**Given** the generated text content
**When** reviewed by the user
**Then** they shall be able to:
- Approve the content
- Regenerate with modified prompt
- Edit manually
- Request additional variations

**Test Scenarios:**
```gherkin
Scenario: AI generates Instagram posts
  Given workflow requires Instagram posts
  And brand voice: "Casual, emoji-heavy, motivational"
  When AI generates content
  Then each post includes:
    - Hook phrase (first line)
    - Body content (under 2200 characters)
    - Relevant hashtags (5-10 hashtags)
    - Emoji usage (3-5 emojis)
  And tone matches "Casual, motivational"
  And system generates 3 variations for A/B testing

Scenario: AI generates email copy
  Given workflow requires email campaign
  And user provides: "Welcome new subscribers, offer 20% discount"
  When AI generates email
  Then email includes:
    - Subject line (under 50 characters)
    - Preheader text (under 100 characters)
    - Personalized greeting
    - Call-to-action button
    - Unsubscribe link (legal requirement)
    - Disclaimer text (if applicable)

Scenario: User regenerates content with feedback
  Given AI generated content is "too formal"
  When user provides feedback: "Make it more casual"
  And user clicks "Regenerate"
  Then new content has casual tone
  And previous version is saved for comparison
```

---

### AC-302: Image Generation

**Given** a workflow requires image assets
**When** the AI generates images
**Then** the images shall comply with:
- Platform dimension requirements (1080x1080 for Instagram, 1920x1080 for YouTube)
- Brand color schemes (if specified)
- Safe content guidelines (no prohibited content)

**Given** image generation is requested
**When** the generation fails
**Then** the system shall retry with modified prompts up to 3 times
**And** notify user if all retries fail

**Given** the user requests image generation
**When** they have not provided explicit consent for real people or copyrighted characters
**Then** the system shall not generate such images
**And** warn about content policy restrictions

**Test Scenarios:**
```gherkin
Scenario: AI generates Instagram images
  Given workflow requires Instagram post images
  And brand colors: "#FF5733, #33FF57"
  When AI generates images
  Then each image is 1080x1080 pixels
  And images incorporate brand colors
  And images pass safety filter check
  And generation completes within 30 seconds

Scenario: Image generation fails and retries
  Given AI image generation fails with timeout
  When first retry occurs
  Then prompt is modified: add "simpler composition"
  When second retry occurs
  Then prompt is modified: add "minimalist style"
  When third retry occurs
  Then prompt is modified: add "basic shapes only"
  If all retries fail, user is notified: "Unable to generate image. Try modifying the prompt."

Scenario: User requests prohibited content
  Given user requests: "Generate image of celebrity endorsing product"
  When system detects prohibited content
  Then system blocks generation
  And displays warning: "Cannot generate images of real people without consent"
  And suggests: "Use stock photos or create generic illustrations instead"
```

---

### AC-303: External API Integration

**Given** a workflow requires graphic design
**When** the Canva API is called
**Then** the system shall:
- Create designs from templates
- Modify text and images
- Export designs in PNG/JPG format

**Given** a workflow requires email campaigns
**When** the Mailchimp API is called
**Then** the system shall:
- Create email campaigns
- Add recipients to segments
- Schedule sending
- Track open/click rates

**Given** external API calls fail
**When** the failure is detected
**Then** the system shall implement exponential backoff:
- Retry 1: 1 second delay
- Retry 2: 2 seconds delay
- Retry 3: 4 seconds delay
- Retry 4: 8 seconds delay
- Retry 5: 16 seconds delay (max)

**Given** external API calls are made
**When** logging interactions
**Then** the system shall mask API keys in logs
**And** never log sensitive request/response data

**Test Scenarios:**
```gherkin
Scenario: Canva API creates design
  Given workflow requires Canva design
  When API call is made
  Then design is created from template
  And text is updated with AI-generated content
  And images are replaced with AI-generated images
  And design is exported in PNG format
  And exported file is saved to object storage

Scenario: Mailchimp API creates campaign
  Given workflow requires email campaign
  When API call is made
  Then campaign is created in Mailchimp
  And recipients are added to segment
  And campaign is scheduled for specified date/time
  And campaign ID is saved to database

Scenario: External API fails with exponential backoff
  Given Mailchimp API returns 429 (rate limit)
  When system handles error
  Then first retry occurs after 1 second
  If still rate limited, second retry after 2 seconds
  If still rate limited, third retry after 4 seconds
  If all retries fail, user is notified: "Mailchimp API unavailable. Please try again later."
```

---

### AC-304: Content Personalization

**Given** a campaign targets multiple audience segments
**When** content is generated
**Then** the system shall generate personalized content for each segment

**Given** personalization is active
**When** content is generated
**Then** the system shall use:
- First names (if provided)
- Location-specific information
- Past engagement data (if available)
- Device-specific formatting

**Given** personalization would use sensitive data
**When** such data is detected
**Then** the system shall not use it without explicit user consent
**And** prompt for consent before proceeding

**Test Scenarios:**
```gherkin
Scenario: Personalization for multiple segments
  Given campaign targets segments: "Millennials in US", "Gen Z in Europe"
  When content is generated
  Then separate content generated for each segment:
    - Millennials US: Casual tone, US cultural references
    - Gen Z Europe: Trendy tone, European cultural references
  And user can preview both versions
  And user can approve each segment independently

Scenario: Personalization uses first names
  Given user provides recipient first names
  When email content is generated
  Then greeting is personalized: "Hi [First Name],"
  And content references user's location: "As a [City] resident..."
  And recommendations based on past engagement: "Since you liked [Previous Product]..."

Scenario: Consent for sensitive data
  Given personalization would use health data
  When system detects sensitive data
  Then system prompts: "This personalization uses health data. Do you consent?"
  If user declines, then content generated without sensitive data
  If user approves, then consent is logged with timestamp
```

---

## Feature 4: Workflow Management

### AC-401: Workflow List

**Given** a user accesses the workflow management section
**When** the workflow list loads
**Then** it shall display:
- Workflow name
- Creation date
- Last execution status (success/failed/running)
- Execution count
- Actions (edit, deploy, monitor, delete)

**Given** the workflow list is displayed
**When** the user applies filters
**Then** they shall be able to filter by:
- Date range
- Status
- Name (search)

**Given** the user has more than 50 workflows
**When** the list is displayed
**Then** it shall implement pagination (20 workflows per page)
**And** provide page navigation controls

**Test Scenarios:**
```gherkin
Scenario: User views workflow list
  Given user has 5 workflows
  When user navigates to workflow list
  Then table displays:
    | Name | Created | Status | Executions | Actions |
    | Fitness Campaign | 2026-01-30 | Success | 15 | Edit Deploy Monitor Delete |
    | Product Launch | 2026-01-28 | Failed | 3 | Edit Deploy Monitor Delete |
  And all workflows are visible

Scenario: User filters workflow list
  Given user has 50 workflows
  When user filters by status: "Success"
  Then only successful workflows displayed
  And result count shows: "Showing 32 of 50 workflows"
  When user filters by date: "Last 7 days"
  Then only workflows from last 7 days displayed
  And result count shows: "Showing 5 of 50 workflows"

Scenario: User paginates through workflows
  Given user has 65 workflows
  When user views workflow list
  Then page 1 shows workflows 1-20
  And page navigation shows: "1 2 3 4"
  When user clicks page 2
  Then workflows 21-40 are displayed
```

---

### AC-402: Workflow Editing

**Given** a user selects a workflow to edit
**When** the workflow editor loads
**Then** they shall be able to:
- Add new nodes
- Remove existing nodes
- Modify node parameters
- Reconnect nodes
- Adjust triggers and schedules

**Given** a user modifies a deployed workflow
**When** they attempt to save changes
**Then** the system shall warn: "This workflow is deployed. Changes must be redeployed to take effect."
**And** require confirmation before saving

**Given** a workflow is edited
**When** the edit is saved
**Then** the system shall create a new version
**And** maintain version history (minimum 10 versions)

**Test Scenarios:**
```gherkin
Scenario: User edits workflow structure
  Given user opens workflow editor
  And workflow has 5 nodes
  When user adds new OpenAI node
  And user connects it between Node 2 and Node 3
  And user saves workflow
  Then new version is created (version 2)
  And workflow now has 6 nodes
  And node connection is updated

Scenario: User modifies deployed workflow
  Given user edits deployed workflow
  And user changes OpenAI model from "gpt-4" to "gpt-3.5-turbo"
  When user clicks "Save"
  Then warning displays: "This workflow is deployed. Changes must be redeployed to take effect."
  And user must confirm to proceed
  If user confirms, then workflow is saved as new version
  And workflow status changes to "draft"

Scenario: User views version history
  Given workflow has 5 versions
  When user clicks "View History"
  Then system displays:
    | Version | Saved At | Changes | Actions |
    | 5 | 2026-01-31 14:30 | Added error handling | Restore |
    | 4 | 2026-01-31 12:15 | Changed model to gpt-3.5 | Restore |
    | 3 | 2026-01-30 16:45 | Added retry logic | Restore |
  When user clicks "Restore" on version 3
  Then workflow reverts to version 3 state
```

---

### AC-403: Real-Time Monitoring

**Given** a workflow is executing
**When** the user views the monitoring dashboard
**Then** the system shall display real-time status updates via WebSocket connection

**Given** the workflow is running
**When** the monitoring dashboard is displayed
**Then** it shall show:
- Currently executing node (highlighted)
- Execution time elapsed
- Data passed between nodes
- Errors or warnings (if any)

**Given** a workflow execution fails
**When** the failure is detected
**Then** the system shall highlight the failed node
**And** display error details
**And** suggest corrective actions

**Given** a workflow is monitored
**When** execution completes
**Then** the system shall log all execution details
**And** store logs for minimum 90 days

**Test Scenarios:**
```gherkin
Scenario: User monitors workflow execution
  Given workflow is deployed and triggered
  When user opens monitoring dashboard
  Then WebSocket connection established
  And status shows: "Running - Node 3 of 10"
  And execution time displays: "Elapsed: 00:00:45"
  And data flow shows: "Node 2 output → Node 3 input"
  And when Node 3 completes, Node 4 highlights

Scenario: Workflow execution fails
  Given workflow is executing
  When Node 5 fails with error
  Then monitoring dashboard:
    - Highlights Node 5 in red
    - Displays error: "API rate limit exceeded"
    - Shows suggestion: "Retry after 60 seconds or use fallback API"
  And execution status changes to "Failed"
  And user can click "Retry" to restart execution

Scenario: Execution logs are stored
  Given workflow execution completes
  When log storage process runs
  Then logs are saved to database with:
    - Start timestamp
    - End timestamp
    - Node-by-node execution details
    - Input/output data for each node
    - Status (success/failed)
  And logs are retrievable for 90 days
```

---

### AC-404: Execution Logs

**Given** a user views workflow execution logs
**When** the logs are displayed
**Then** they shall include:
- Start and end timestamps
- Execution status (success/failure/running)
- Node-by-node execution details
- Input/output data for each node
- Error messages (if applicable)

**Given** logs contain sensitive data
**When** they are stored
**Then** the sensitive data shall be masked or encrypted
**And** never displayed in plaintext

**Given** a user searches execution logs
**When** they apply search filters
**Then** they shall be able to search by:
- Date range
- Workflow name
- Status
- Error message

**Test Scenarios:**
```gherkin
Scenario: User views execution logs
  Given workflow execution completed
  When user views execution logs
  Then logs display:
    - Start: "2026-01-31 14:30:00"
    - End: "2026-01-31 14:31:15"
    - Status: "Success"
    - Node 1: Webhook trigger (Input: {...})
    - Node 2: OpenAI GPT-4 (Input: "Generate post", Output: "Here is your post...")
    - Node 3: HTTP Request to Instagram (Input: {...}, Output: {status: "success"})
  And user can expand each node for details

Scenario: Sensitive data is masked in logs
  Given workflow execution includes API key
  When logs are stored
  Then API key is masked: "sk-...1234"
  And plaintext API key is not stored
  And user sees masked version in logs

Scenario: User searches execution logs
  Given user has 100 execution logs
  When user filters by date: "Last 24 hours"
  Then only logs from last 24 hours displayed
  When user searches by error: "rate limit"
  Then only logs containing "rate limit" displayed
  When user filters by status: "Failed"
  Then only failed executions displayed
```

---

## Feature 5: Analytics and Reporting

### AC-501: Campaign Performance Tracking

**Given** a campaign is active
**When** performance metrics are fetched
**Then** the system shall automatically fetch from:
- Google Analytics (website traffic, conversions)
- Social media APIs (engagement, reach, impressions)
- Email marketing platforms (open rate, click rate, conversions)

**Given** the analytics dashboard is displayed
**When** metrics are shown
**Then** they shall be displayed in:
- Visual charts (line graphs, bar charts, pie charts)
- Aggregated tables with sorting and filtering
- Date range comparisons (week-over-week, month-over-month)

**Given** metrics are displayed
**When** the data refresh interval elapses
**Then** the system shall update metrics at minimum every 24 hours

**Test Scenarios:**
```gherkin
Scenario: Dashboard displays campaign metrics
  Given campaign is active with 7 days of data
  When user views analytics dashboard
  Then charts display:
    - Line graph: Daily engagement over time
    - Bar chart: Engagement by platform
    - Pie chart: Demographics breakdown
  And tables show:
    | Platform | Reach | Impressions | Engagement Rate |
    | Instagram | 10,500 | 25,000 | 4.2% |
    | Facebook | 8,200 | 18,500 | 3.8% |
  And user can compare: "This week vs. Last week"

Scenario: Metrics update automatically
  Given metrics were last updated 24 hours ago
  When user refreshes dashboard
  Then system fetches latest metrics from all platforms
  And dashboard displays updated data
  And "Last updated" timestamp shows current time

Scenario: User customizes date range
  Given user views analytics dashboard
  When user selects custom date range: "2026-01-15 to 2026-01-31"
  Then dashboard shows metrics only for selected range
  And all charts and tables update accordingly
```

---

### AC-502: AI Insights and Optimization

**Given** performance data is available
**When** the AI analyzes the data
**Then** it shall generate optimization suggestions

**Given** AI suggestions are generated
**When** they are displayed
**Then** they shall include:
- Underperforming content recommendations
- Best posting times based on engagement
- Audience expansion opportunities
- A/B test recommendations

**Given** a user implements a suggestion
**When** the change is applied
**Then** the system shall track the impact of the change
**And** compare before/after metrics

**Given** suggestions are displayed
**When** the user has not approved them
**Then** the system shall not make automatic changes to campaigns

**Test Scenarios:**
```gherkin
Scenario: AI generates optimization suggestions
  Given campaign has 30 days of performance data
  When AI analysis completes
  Then suggestions include:
    1. "Your posts at 9 AM get 40% more engagement. Consider posting more at this time."
    2. "Video content outperforms images by 2.5x. Increase video frequency."
    3. "Audience growth stalled. Consider running a giveaway contest."
    4. "A/B test: Try shorter captions (under 100 characters) for higher engagement."
  And user can click each suggestion for details

Scenario: User implements suggestion and tracks impact
  Given user implements suggestion: "Post at 9 AM"
  When 7 days pass
  Then system compares engagement:
    - Before: 3.5% average engagement
    - After: 4.9% average engagement
  And system displays: "Engagement increased by 40% after implementing suggestion"
  And suggestion is marked as "Successful"

Scenario: Automatic changes require approval
  Given AI suggests: "Increase posting frequency to 3x daily"
  When suggestion is displayed
  Then system does NOT automatically change posting schedule
  And user must manually approve to implement change
  And user can dismiss suggestion if not desired
```

---

### AC-503: Custom Reports

**Given** a user requests a custom report
**When** the report builder is displayed
**Then** the user shall be able to select:
- Date range
- Metrics to include
- Campaigns to compare
- Visualization format

**Given** the report is generated
**When** the user exports it
**Then** it shall be exportable in:
- PDF format
- CSV format
- Excel format

**Given** the report builder is displayed
**When** the user views templates
**Then** the system shall provide templates for:
- Weekly performance summary
- Monthly campaign review
- Platform comparison report
- ROI analysis

**Test Scenarios:**
```gherkin
Scenario: User creates custom report
  Given user opens report builder
  When user selects:
    - Date range: "2026-01-01 to 2026-01-31"
    - Metrics: "Reach, Engagement, Conversions"
    - Campaigns: "Campaign A, Campaign B"
    - Format: "PDF with charts"
  And user clicks "Generate Report"
  Then report is generated with selected parameters
  And report includes:
    - Executive summary
    - Metric breakdown tables
    - Visual charts
    - Conclusions and recommendations

Scenario: User exports report in multiple formats
  Given report is generated
  When user clicks "Export as PDF"
  Then PDF file downloads with all visualizations
  When user clicks "Export as CSV"
  Then CSV file downloads with raw data tables
  When user clicks "Export as Excel"
  Then Excel file downloads with multiple sheets (data + charts)

Scenario: User uses report template
  Given user selects "Weekly Performance Summary" template
  When template loads
  Then report builder pre-fills with:
    - Date range: "Last 7 days"
    - Metrics: "Reach, Engagement, Conversions, ROI"
    - Format: "PDF"
  And user can modify pre-filled values
  And user can generate report immediately
```

---

## Feature 6: All-in-One Assistant Chat

### AC-601: Chatbot Interface

**Given** a user accesses the assistant chat
**When** the chat interface loads
**Then** it shall display:
- Message history (previous conversation)
- Input field for text commands
- Quick action buttons
- Typing indicator for AI responses

**Given** the chat session is active
**When** the user sends messages
**Then** the system shall always maintain conversation context for the current session

**Given** the user is typing a message
**When** the AI is generating a response
**Then** the typing indicator shall be displayed
**And** removed when the response is received

**Test Scenarios:**
```gherkin
Scenario: User opens assistant chat
  Given user clicks "Assistant" button
  When chat interface loads
  Then elements displayed:
    - Message history (if previous conversation exists)
    - Input field with placeholder: "Ask me anything..."
    - Quick action buttons: "Create Workflow", "Generate Assets", "View Analytics"
    - Typing indicator (hidden by default)

Scenario: User sends message and sees typing indicator
  Given user types: "How do I create a workflow?"
  And user clicks "Send"
  Then message appears in chat history
  And typing indicator displays: "Assistant is typing..."
  When AI response arrives
  Then typing indicator disappears
  And AI response displays in chat

Scenario: Conversation context is maintained
  Given user asks: "Create 5 Instagram posts"
  And AI asks: "What is your brand about?"
  And user answers: "Fitness brand for millennials"
  When AI generates workflow
  Then workflow incorporates: "Fitness brand for millennials"
  And AI says: "Great! I've created 5 Instagram posts for your fitness brand targeting millennials."
```

---

### AC-602: Natural Language Understanding

**Given** a user asks a question or gives a command
**When** the NLP processes the input
**Then** it shall understand:
- Intent (question, command, clarification)
- Entities (workflow names, campaign names, dates)
- Sentiment (confusion, satisfaction, urgency)

**Given** the NLP does not understand the user's intent
**When** confidence score is low (< 60%)
**Then** the system shall ask clarifying questions
**And** provide example requests

**Given** a multi-turn conversation is active
**When** the user references previous context
**Then** the system shall maintain context across turns
**And** resolve references correctly

**Test Scenarios:**
```gherkin
Scenario: NLP understands user intent
  Given user types: "Show me my best performing campaign"
  When NLP processes input
  Then intent is classified as: "query"
  And entities extracted:
    - Query type: "best performing"
    - Entity: "campaign"
  And system responds: "Your best performing campaign is 'Fitness Launch' with 25,000 engagements"

Scenario: NLP asks for clarification
  Given user types: "Create a post"
  When NLP detects missing information
  Then system asks: "I'd be happy to help! Could you provide more details?"
  And system provides examples:
    - "Create 5 Instagram posts for my fitness brand"
    - "Generate an email campaign for product launch"
  And user can provide clarification or select an example

Scenario: Context maintained across turns
  Given user asks: "How many workflows do I have?"
  And AI responds: "You have 10 workflows"
  And user asks: "Show me the last one"
  When AI processes request
  Then context resolves "last one" as "most recent workflow"
  And AI displays workflow created most recently
```

---

### AC-603: Capabilities

**Given** the assistant chat is active
**When** the user interacts with it
**Then** the assistant shall be able to:
- Answer questions about features and workflows
- Guide users through workflow creation step-by-step
- Explain error messages and suggest fixes
- Provide marketing strategy recommendations
- Trigger workflow creation via command
- Schedule workflow executions

**Given** a user requests a complex action
**When** the assistant breaks it down
**Then** it shall provide step-by-step instructions
**And** offer to automate each step

**Given** the user's behavior indicates confusion
**When** the AI detects patterns (repeated errors, help requests)
**Then** the system shall provide proactive suggestions
**And** offer guided tutorials

**Test Scenarios:**
```gherkin
Scenario: Assistant answers feature questions
  Given user asks: "How do I connect my Mailchimp account?"
  When AI responds
  Then response includes:
    - Step-by-step instructions
    - Link to settings page
    - "Would you like me to guide you through the setup?"
  And user can accept guidance

Scenario: Assistant explains error messages
  Given workflow execution fails with error: "API rate limit exceeded"
  And user asks: "What does this error mean?"
  When AI responds
  Then explanation includes:
    - Plain language explanation: "You've made too many API requests too quickly"
    - Cause: "OpenAI allows 60 requests per minute"
    - Solution: "Wait 60 seconds or upgrade to higher tier"
    - Prevention: "Enable automatic retry with exponential backoff"

Scenario: Assistant triggers workflow creation
  Given user types: "Create a workflow for 10 Instagram posts about vegan recipes"
  When AI processes command
  Then workflow generation is triggered
  And AI confirms: "I'm creating a workflow for 10 Instagram posts about vegan recipes"
  And AI updates: "Workflow created! Would you like to preview and deploy it?"
  And user can confirm to deploy

Scenario: Assistant provides proactive suggestions
  Given user has failed 3 workflow deployments
  When user opens assistant chat
  Then AI proactively suggests:
    "I noticed you've had some trouble deploying workflows. Would you like me to:
    1. Check your n8n connection
    2. Review your workflow for errors
    3. Guide you through the deployment process"
```

---

### AC-604: Voice Commands

**Given** the user's browser supports Web Speech API
**When** the assistant chat is displayed
**Then** the system shall provide a microphone button for voice input

**Given** the microphone button is clicked
**When** the user speaks
**Then** the system shall:
- Display visual feedback during recording
- Transcribe speech to text for confirmation
- Support common voice commands

**Given** voice input is transcribed
**When** the transcription is displayed
**Then** the user shall be able to:
- Edit the transcription before sending
- Re-record if transcription is incorrect

**Given** voice recordings are created
**When** transcription completes
**Then** the system shall not store voice recordings after transcription without explicit consent

**Test Scenarios:**
```gherkin
Scenario: User enables voice input
  Given user's browser supports Web Speech API
  When assistant chat displays
  Then microphone button is visible
  And button has tooltip: "Click to speak"

Scenario: User records voice command
  Given user clicks microphone button
  When user speaks: "Create a workflow for my fitness campaign"
  Then visual feedback displays during recording:
    - Pulsing microphone icon
    - "Listening..." message
  When user stops speaking
  Then transcription displays: "Create a workflow for my fitness campaign"
  And user confirms: "Send" or "Re-record"

Scenario: User edits transcription
  Given user spoke: "Create a workflow for my fitness compaign" (misspelled)
  When transcription displays
  And user notices typo
  Then user can edit text to: "Create a workflow for my fitness campaign"
  And user can send corrected transcription

Scenario: Voice recordings not stored
  Given user records voice message
  When transcription completes
  Then voice recording is deleted immediately
  And only transcription is stored in conversation history
  Unless user explicitly consents to recording retention
```

---

## Security Acceptance Criteria

### AC-SEC-001: OWASP Top 10 Compliance

**Given** the application is deployed
**When** a security scan is performed
**Then** the application shall have zero critical vulnerabilities
**And** zero high-severity vulnerabilities

**Given** all user inputs are processed
**When** they reach the backend
**Then** they shall be validated using Pydantic schemas
**And** sanitized to prevent injection attacks

**Given** authentication is implemented
**When** passwords are stored
**Then** they shall be hashed with bcrypt (cost factor 12)
**And** never stored in plaintext

**Test Scenarios:**
```gherkin
Scenario: SQL injection prevention
  Given user enters input: "'; DROP TABLE users; --"
  When input is processed
  Then SQL query remains safe
  And no tables are dropped
  And input is logged for security monitoring

Scenario: XSS prevention
  Given user enters comment: "<script>alert('XSS')</script>"
  When comment is displayed
  Then script is not executed
  And content is sanitized: "&lt;script&gt;alert('XSS')&lt;/script&gt;"

Scenario: Password hashing
  Given user registers with password: "MyPassword123!"
  When password is stored
  Then database contains:
    - password_hash: "$2b$12$..." (bcrypt hash)
    - NOT plaintext: "MyPassword123!"
```

---

### AC-SEC-002: API Key Management

**Given** API keys are configured
**When** they are stored
**Then** they shall be encrypted at rest using AES-256
**And** never logged in plaintext

**Given** API keys are displayed
**When** shown in the UI
**Then** they shall be masked (e.g., `sk-...1234`)
**And** only revealable with explicit user action

**Given** API keys need to be rotated
**When** rotation is requested
**Then** the system shall support key rotation
**And** invalidate old keys
**And** update all references to new keys

**Test Scenarios:**
```gherkin
Scenario: API keys encrypted at rest
  Given user configures OpenAI API key: "sk-proj-abc123xyz789"
  When key is saved to database
  Then database stores encrypted value: "aes256:encrypted_string_here"
  And plaintext key is not stored
  And key can be decrypted for API calls

Scenario: API keys masked in UI
  Given user views configured API keys
  Then each key displays as: "sk-...1234"
  And full key is hidden
  When user clicks "Reveal"
  Then full key displays temporarily
  And key hides again after 30 seconds

Scenario: API key rotation
  Given user rotates OpenAI API key
  When rotation completes
  Then old key is invalidated
  And new key is active
  And all workflow configurations updated to use new key
```

---

### AC-SEC-003: Rate Limiting

**Given** the application is under load
**When** rate limits are enforced
**Then** the system shall:
- Limit per-IP requests to 100 per minute
- Limit per-user requests to 1000 per hour
- Limit expensive operations with stricter limits

**Given** a rate limit is exceeded
**When** the limit is triggered
**Then** the system shall return HTTP 429 (Too Many Requests)
**And** include Retry-After header

**Test Scenarios:**
```gherkin
Scenario: Per-IP rate limiting
  Given IP address makes 100 requests in 1 minute
  When IP makes 101st request
  Then response status is 429
  And response includes: "Retry-After: 60"
  And error message: "Rate limit exceeded. Please try again in 60 seconds."

Scenario: Per-user rate limiting
  Given authenticated user makes 1000 requests in 1 hour
  When user makes 1001st request
  Then response status is 429
  And user sees: "You've exceeded your hourly quota. Please upgrade your plan."

Scenario: Expensive operation rate limiting
  Given user requests 10 workflow generations in 1 minute
  When user requests 11th workflow generation
  Then response status is 429
  And error message: "Workflow generation limit: 10 per minute. Please wait."
```

---

### AC-SEC-004: GDPR Compliance

**Given** a user requests data export
**When** the request is processed
**Then** the system shall provide all user data in machine-readable format (JSON)
**And** include all personally identifiable information

**Given** a user requests account deletion
**When** the request is processed
**Then** the system shall:
- Delete all user data within 30 days
- Anonymize data that must be retained for legal reasons
- Confirm deletion via email

**Given** consent is required
**When** personal data is processed
**Then** the system shall obtain explicit user consent
**And** maintain consent records with timestamps

**Test Scenarios:**
```gherkin
Scenario: User requests data export
  Given user clicks "Export My Data"
  When export process completes
  Then JSON file includes:
    - User profile data
    - All workflows created
    - All campaigns created
    - All assets generated
    - All execution logs
  And file downloads automatically
  And email sent with download link

Scenario: User requests account deletion
  Given user clicks "Delete Account"
  And user confirms deletion
  Then account is marked for deletion
  And user receives email: "Your account will be permanently deleted in 30 days"
  After 30 days, then:
    - All user data deleted from database
    - All assets deleted from storage
    - All API keys revoked
  And confirmation email sent: "Your account has been permanently deleted"

Scenario: Explicit consent for data processing
  Given new user registers
  When registration form displays
  Then consent checkboxes shown:
    - [ ] I consent to data processing for account management
    - [ ] I consent to AI processing for content generation
  And user cannot register without checking required consents
  And consent records stored with timestamp
```

---

## Performance Acceptance Criteria

### AC-PERF-001: API Response Time

**Given** the application is under normal load
**When** API endpoints are called
**Then** response times shall be:
- P50: < 100ms
- P95: < 200ms
- P99: < 500ms

**Given** the application is under high load (100 concurrent users)
**When** API endpoints are called
**Then** response times shall not exceed:
- P95: < 500ms
- P99: < 1000ms

**Test Scenarios:**
```gherkin
Scenario: API response time under normal load
  Given application is under normal load (10 concurrent users)
  When 1000 API calls are made
  Then metrics show:
    - P50 response time: < 100ms
    - P95 response time: < 200ms
    - P99 response time: < 500ms

Scenario: API response time under high load
  Given application is under high load (100 concurrent users)
  When 5000 API calls are made
  Then metrics show:
    - P95 response time: < 500ms
    - P99 response time: < 1000ms
  And zero 5xx errors
  And < 1% 4xx errors
```

---

### AC-PERF-002: Dashboard Load Time

**Given** a user accesses the dashboard
**When** the page loads
**Then** it shall fully render in < 2 seconds on standard broadband connection

**Given** the dashboard contains analytics data
**When** the page loads
**Then** the initial HTML shall load in < 1 second
**And** analytics data shall load within 1 additional second

**Test Scenarios:**
```gherkin
Scenario: Dashboard load time
  Given user navigates to dashboard
  When page loads on 25 Mbps connection
  Then initial HTML renders in < 1 second
  And dashboard displays loading state
  And analytics data loads within 1 second
  And dashboard fully interactive in < 2 seconds total
  And user sees no blank states longer than 500ms
```

---

### AC-PERF-003: Workflow Generation Time

**Given** a user requests workflow generation
**When** the workflow complexity is standard (10-20 nodes)
**Then** generation shall complete in < 10 seconds

**Given** a user requests workflow generation
**When** the workflow complexity is high (50+ nodes)
**Then** generation shall complete in < 30 seconds

**Test Scenarios:**
```gherkin
Scenario: Standard workflow generation time
  Given user requests workflow for "10 Instagram posts"
  When generation runs
  Then workflow JSON generates in < 10 seconds
  And visual preview renders in < 2 seconds
  And total time < 12 seconds

Scenario: Complex workflow generation time
  Given user requests workflow for "100 social media posts with A/B testing"
  When generation runs
  Then workflow JSON generates in < 30 seconds
  And visual preview renders in < 5 seconds
  And total time < 35 seconds
```

---

### AC-PERF-004: Asset Generation Time

**Given** a user requests text asset generation
**When** the AI generates content
**Then** generation shall complete in < 5 seconds for single asset

**Given** a user requests image asset generation
**When** the AI generates images
**Then** generation shall complete in < 30 seconds for single image

**Test Scenarios:**
```gherkin
Scenario: Text asset generation time
  Given user requests "1 Instagram post"
  When AI generates text
  Then generation completes in < 5 seconds
  And result displays immediately

Scenario: Image asset generation time
  Given user requests "1 Instagram image"
  When AI generates image
  Then generation completes in < 30 seconds
  And result displays with loading progress
```

---

## Quality Gates

### Pre-Deployment Checklist

Before deploying to production, all of the following must be satisfied:

**Code Quality:**
- [ ] All unit tests pass (85%+ coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass for critical paths
- [ ] Linting passes (Ruff/ESLint with zero errors)
- [ ] Type checking passes (mypy/tsc with zero errors)
- [ ] Code formatted (Prettier/Black)

**Security:**
- [ ] Zero critical vulnerabilities in security scan
- [ ] Zero high-severity vulnerabilities
- [ ] All dependencies up-to-date
- [ ] API keys encrypted and masked
- [ ] GDPR compliance verified

**Performance:**
- [ ] API response times meet P95 < 200ms target
- [ ] Dashboard load time < 2 seconds
- [ ] Workflow generation < 10 seconds (standard)
- [ ] Asset generation within specified limits

**Documentation:**
- [ ] API documentation updated
- [ ] User guides updated
- [ ] CHANGELOG entry added
- [ ] Deployment runbook updated

---

*Last Updated: 2026-01-31*
*Next Review: Before Milestone 1 completion*
