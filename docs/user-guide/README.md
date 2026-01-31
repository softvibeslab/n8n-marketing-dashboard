# User Guide

Complete guide to using the n8n Marketing Dashboard application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Creating Marketing Strategies](#creating-marketing-strategies)
4. [Generating Workflows](#generating-workflows)
5. [Creating Assets](#creating-assets)
6. [Managing Campaigns](#managing-campaigns)
7. [Viewing Analytics](#viewing-analytics)
8. [Using the AI Assistant](#using-the-ai-assistant)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First-Time Setup

1. **Register an Account**
   - Navigate to the application URL
   - Click "Sign Up" in the top right
   - Enter your email address and create a secure password (minimum 12 characters)
   - Click "Create Account"

2. **Verify Your Email** (if enabled)
   - Check your email for a verification link
   - Click the link to verify your account

3. **Configure Your Profile**
   - Add your name and organization
   - Set your time zone for accurate analytics

4. **Connect Your Services**
   - Go to Settings > Integrations
   - Connect your n8n instance
   - Add your OpenAI API key (or Groq)
   - Connect social media accounts (optional)

### Navigation

The application has a main navigation sidebar on the left:

- **Dashboard**: Overview of your marketing activities
- **Strategy**: Create and manage marketing strategies
- **Workflows**: Generate and manage n8n workflows
- **Assets**: Create and organize marketing assets
- **Campaigns**: Manage marketing campaigns
- **Analytics**: View performance metrics
- **AI Assistant**: Get help and guidance

---

## Dashboard Overview

The Dashboard provides a high-level view of your marketing activities.

### Key Sections

#### Quick Stats
- **Active Campaigns**: Number of currently running campaigns
- **Total Assets**: Assets created across all campaigns
- **Workflow Executions**: Number of workflow runs this month
- **Engagement Rate**: Average engagement across all campaigns

#### Recent Activity
- Latest workflow executions
- Recently created assets
- Campaign updates

#### Quick Actions
- Create new strategy
- Generate workflow
- Create asset
- Open AI Assistant

---

## Creating Marketing Strategies

### What is a Strategy?

A strategy defines your overall marketing approach, including:
- Target audience
- Campaign goals
- Marketing channels
- Budget allocation
- Timeline

### Creating a Strategy

1. **Navigate to Strategy Page**
   - Click "Strategy" in the sidebar

2. **Start from Scratch or Use a Template**
   - **Blank Strategy**: Start with a clean slate
   - **Template**: Use a pre-built strategy template

3. **Fill in Strategy Details**

#### Target Audience
- **Age Range**: Select primary age group (e.g., 25-34)
- **Interests**: Add interests relevant to your audience (e.g., fitness, health)
- **Location**: Specify geographic targeting
- **Gender**: Choose target gender (or all)

#### Campaign Goals
Select what you want to achieve:
- Brand Awareness
- Lead Generation
- Sales Conversion
- Engagement Growth
- Website Traffic

#### Marketing Channels
Choose where you'll promote:
- Social Media (Instagram, Facebook, TikTok, LinkedIn)
- Email Marketing
- SEO/Content Marketing
- Paid Advertising
- Influencer Marketing

#### Budget Allocation
- Set total budget
- Allocate budget across channels
- System ensures total allocation matches budget

#### Timeline
- Set campaign start and end dates
- Add key milestones
- Campaign duration affects recommendations

4. **Get AI Suggestions**
   - Click "Analyze with AI" for optimization suggestions
   - AI will recommend:
     - Best channels for your audience
     - Budget allocation adjustments
     - Timeline improvements
     - Potential issues

5. **Save Your Strategy**
   - Click "Save Strategy"
   - Strategy is saved as DRAFT
   - You can edit it later before activating

### Strategy Templates

Templates provide pre-built strategies for common scenarios:

#### E-commerce Launch
- **Duration**: 4-6 weeks
- **Channels**: Instagram, Facebook, Email, Google Ads
- **Goals**: Brand awareness, initial sales
- **Best For**: New product launches

#### Brand Awareness
- **Duration**: 8-12 weeks
- **Channels**: Instagram, TikTok, YouTube
- **Goals**: Reach, impressions, engagement
- **Best For**: New brands, rebranding

#### Lead Generation
- **Duration**: 4-8 weeks
- **Channels**: LinkedIn, Email, Facebook Ads
- **Goals**: Email signups, demo requests
- **Best For**: B2B, high-ticket products

#### Content Marketing
- **Duration**: Ongoing
- **Channels**: Blog, SEO, Social Media
- **Goals**: Traffic, authority, leads
- **Best For**: Long-term growth

---

## Generating Workflows

### What is a Workflow?

A workflow is an automation created in n8n that executes marketing tasks. The dashboard generates these workflows from your strategy using AI.

### Generating a Workflow from Natural Language

1. **Navigate to Workflows Page**
   - Click "Workflows" in the sidebar
   - Click "Generate Workflow" tab

2. **Describe Your Workflow**
   Use natural language to describe what you want:

   **Examples:**
   - "Create 10 Instagram posts for a fitness brand targeting millennials"
   - "Generate weekly email newsletter for ecommerce customers"
   - "Post daily motivational quotes on Twitter and LinkedIn"
   - "Create landing page copy for SaaS product launch"

3. **Select Strategy (Optional)**
   - Choose a strategy to associate with the workflow
   - This provides context for better generation

4. **Click "Generate Workflow"**
   - AI processes your request
   - Takes 5-10 seconds to generate

5. **Review Generated Workflow**
   - See the interpreted requirements
   - View workflow structure (nodes and connections)
   - Check estimated execution time and cost

6. **Edit if Needed**
   - Add or remove nodes
   - Adjust parameters
   - Modify connections
   - Changes are version-controlled

7. **Deploy to n8n**
   - Click "Deploy"
   - Workflow is sent to your n8n instance
   - Status changes to "DEPLOYED"
   - You can now execute it

### Workflow Templates

Quick-start with pre-built workflow templates:

#### Social Media Post Generator
- **Purpose**: Generate and post social media content
- **Inputs**: Brand, topic, platform, quantity
- **Output**: Scheduled posts with AI-generated content

#### Email Campaign Creator
- **Purpose**: Create email sequences
- **Inputs**: Topic, audience, sequence length
- **Output**: Email campaign with generated copy

#### Content Calendar Builder
- **Purpose**: Plan content schedule
- **Inputs**: Strategy, duration, channels
- **Output**: Content calendar with due dates

### Managing Workflows

#### View All Workflows
- See all your workflows in one place
- Filter by status (Draft, Deployed, Archived)
- Search by name or description

#### Workflow Actions
- **Edit**: Modify workflow structure
- **Deploy**: Send to n8n
- **Execute**: Run the workflow
- **Monitor**: View execution status
- **Version History**: See all versions
- **Delete**: Remove workflow

#### Execution Monitoring
- See real-time status of running workflows
- View execution logs
- Check which nodes succeeded/failed
- Debug errors with detailed logs

---

## Creating Assets

### What are Assets?

Assets are the marketing content you create:
- **Text**: Social media posts, emails, blog articles, ad copy
- **Images**: Graphics, photos, illustrations
- **Videos**: (Coming soon) Video content

### Creating Text Assets

1. **Navigate to Assets Page**
   - Click "Assets" in the sidebar

2. **Click "Generate Asset"**

3. **Choose Asset Type**
   - Select "TEXT"

4. **Provide Details**
   - **Prompt**: Describe what you want
   - **Campaign**: Associate with a campaign (optional)
   - **Platform**: Where will this be used?
   - **Tone**: motivational, professional, casual, etc.
   - **Length**: Short (< 280 chars), Medium (< 500 chars), Long (> 500 chars)
   - **Include Hashtags**: Yes/No
   - **Include Emojis**: Yes/No

5. **Generate**
   - Click "Generate"
   - AI creates the content
   - Takes 2-5 seconds

6. **Review and Edit**
   - Read the generated content
   - Make manual edits if needed
   - Regenerate if not satisfied

7. **Approve or Request Changes**
   - Approve to finalize
   - Keep as DRAFT for later review

### Text Asset Examples

#### Instagram Caption
**Prompt**: "Create an engaging Instagram caption for morning workout motivation"

**Generated Content**:
```
Rise and grind! 🌅

Morning workouts aren't just about fitness—they're about setting the tone for your entire day. When you prioritize your health first thing, everything else falls into place. 💪

Your workout doesn't need to be perfect. It just needs to happen. Show up for yourself today, tomorrow, and every day after.

Who else is crushing their morning workouts? Drop a 💪 in the comments!

#MorningWorkouts #FitnessMotivation #RiseAndGrind #FitnessJourney #NoExcuses
```

#### Email Subject Line
**Prompt**: "Generate 5 email subject lines for fitness product launch"

**Generated Content**:
1. "🚀 Your Fitness Journey Starts Here (Inside!)"
2. "The Wait Is Finally Over... ⏰"
3. "You Asked, We Listened: Meet Your New Fitness Partner"
4. "Ready to Transform Your Workouts? 💪"
5. "Last Chance: Early Bird Pricing Ends Tonight!"

### Creating Image Assets

1. **Navigate to Assets Page**
2. **Click "Generate Asset"**
3. **Choose Asset Type: IMAGE**
4. **Provide Details**
   - **Prompt**: Describe the image you want
   - **Style**: realistic, minimalist, colorful, etc.
   - **Dimensions**:
     - Square: 1080x1080 (Instagram)
     - Landscape: 1920x1080 (YouTube, Twitter)
     - Portrait: 1080x1920 (Instagram Stories, TikTok)
   - **Quality**: Standard, HD

5. **Generate**
   - Click "Generate"
   - Takes 10-30 seconds
   - AI creates 4 variations

6. **Select and Download**
   - Choose the best image
   - Download to your device
   - Approve for use in campaigns

### Image Asset Examples

#### Fitness Motivation Image
**Prompt**: "Professional fitness model doing morning yoga in bright studio, minimalist aesthetic"

**Generated**: High-quality image matching the description

#### Product Showcase
**Prompt**: "Elegant water bottle on clean white background, professional product photography"

**Generated**: Professional product image

### Batch Asset Generation

Generate multiple assets at once:

1. **Click "Batch Generate"**
2. **Select Campaign**
3. **Choose Asset Types and Quantities**
   - 10 Instagram captions
   - 5 blog post titles
   - 3 promotional images
4. **Click "Generate Batch"**
5. **Review All Generated Assets**
6. **Approve or Regenerate Individually**

---

## Managing Campaigns

### What is a Campaign?

A campaign organizes your marketing efforts around a specific goal, timeline, or initiative. It includes:
- Strategy
- Workflow
- Assets
- Analytics

### Creating a Campaign

1. **Navigate to Campaigns Page**
   - Click "Campaigns" in the sidebar

2. **Click "New Campaign"**

3. **Enter Campaign Details**
   - **Name**: Campaign title (e.g., "Summer Fitness Challenge")
   - **Strategy**: Select an existing strategy or create new
   - **Workflow**: Associate a workflow (optional initially)
   - **Status**: Draft, Active, Paused, Completed

4. **Add Assets**
   - Generate new assets
   - Add existing assets
   - Organize by type or platform

5. **Launch Campaign**
   - Ensure workflow is deployed
   - Verify assets are approved
   - Change status to "Active"
   - Campaign starts executing

### Monitoring Campaigns

#### Campaign Dashboard
- Overview of all campaigns
- Quick stats for each
- Status indicators

#### Campaign Detail View
- **Overview**: Campaign info and goals
- **Assets**: All associated assets
- **Workflows**: Active workflows and executions
- **Analytics**: Performance metrics
- **Timeline**: Key dates and milestones

### Campaign Actions

#### Pause Campaign
- Temporarily stop all executions
- Status changes to "Paused"
- Resume anytime

#### Clone Campaign
- Create a copy with all settings
- Useful for A/B testing
- Reuse successful campaigns

#### Archive Campaign
- Remove from active list
- Data preserved for analytics
- Can be reactivated

---

## Viewing Analytics

### Analytics Overview

The Analytics dashboard provides comprehensive insights into your marketing performance across all channels.

### Key Metrics

#### Reach Metrics
- **Impressions**: Total times your content was displayed
- **Reach**: Unique people who saw your content
- **Followers Growth**: New followers gained

#### Engagement Metrics
- **Engagements**: Total interactions (likes, comments, shares)
- **Engagement Rate**: Engagements divided by reach
- **Video Views**: Total video plays
- **Click-Through Rate (CTR)**: Clicks divided by impressions

#### Conversion Metrics
- **Conversions**: Desired actions taken (signups, purchases)
- **Conversion Rate**: Conversions divided by clicks
- **Cost Per Conversion**: Total spend divided by conversions
- **Return on Investment (ROI)**: Revenue divided by cost

### Navigation

1. **Navigate to Analytics Page**
   - Click "Analytics" in the sidebar

2. **Select Campaign**
   - Choose from dropdown
   - Or view all campaigns aggregated

3. **Set Date Range**
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Custom range

### Dashboard Sections

#### Performance Overview
- High-level metrics at a glance
- Compare to previous period
- Trend indicators (↑↓)

#### Platform Breakdown
- Metrics by platform (Instagram, Facebook, etc.)
- See which platforms perform best
- Allocate budget accordingly

#### Content Performance
- Top-performing assets
- Worst-performing assets
- Engagement by content type
- Best posting times

#### Trend Analysis
- Line charts showing trends over time
- Compare multiple metrics
- Identify patterns and seasonality

### AI-Powered Insights

The AI analyzes your performance and provides actionable recommendations:

#### Automatic Insights
- Click "Generate Insights" button
- AI reviews your data
- Takes 5-10 seconds

#### Insight Types

**Underperforming Content**
- Identifies low-performing assets
- Suggests improvements
- Expected impact estimate

**Optimization Opportunities**
- Best posting times
- Optimal content frequency
- Platform-specific tips

**Audience Insights**
- Demographic breakdowns
- Interest analysis
- Expansion opportunities

**A/B Test Recommendations**
- Suggests tests to run
- Hypotheses to validate
- Expected learnings

### Exporting Reports

Generate professional reports for stakeholders:

1. **Click "Generate Report"**

2. **Choose Report Settings**
   - **Campaigns**: Select campaigns to include
   - **Date Range**: Set period
   - **Metrics**: Choose which metrics to include
   - **Format**: PDF, CSV, or Excel
   - **Include Charts**: Yes/No
   - **Include Comparison**: Compare to previous period

3. **Generate and Download**
   - Report is generated
   - Download link provided
   - Can be shared with team

---

## Using the AI Assistant

### What is the AI Assistant?

The AI Assistant is your copilot for using the dashboard. It can:
- Answer questions about features
- Guide you through tasks
- Execute actions on your behalf
- Provide marketing recommendations
- Troubleshoot issues

### Starting a Conversation

1. **Click "AI Assistant" in sidebar**
   - Or use keyboard shortcut: `Cmd/Ctrl + K`

2. **Start Chatting**
   - Type your question or request
   - Press Enter to send
   - AI responds in real-time

### Example Conversations

#### Creating a Workflow
**You**: "How do I create a workflow for Instagram posts?"

**AI**: "To create an Instagram posts workflow, follow these steps:
1. Go to the Workflows page
2. Click the 'Generate' tab
3. Describe what you want, like 'Create 10 Instagram posts for my fitness brand'
4. Click 'Generate'
5. Review and deploy

Would you like me to generate one for you now?"

#### Troubleshooting
**You**: "My workflow failed. What do I do?"

**AI**: "I can help with that. Let me check the execution logs...
The workflow failed at the 'Send Email' node with an authentication error.

Here's how to fix it:
1. Check your email service API credentials in Settings
2. Ensure the credentials are valid
3. Redeploy the workflow

Would you like me to walk you through checking your credentials?"

#### Marketing Advice
**You**: "What's the best time to post on Instagram?"

**AI**: "Based on your analytics data, your audience is most active:
- Weekdays: 7-9 AM EST
- Weekends: 10-11 AM EST

Your top-performing posts are motivational quotes in the morning. I recommend:
- Posting 3-5 times per week
- Focusing on morning posts
- Using consistent hashtags

Would you like me to create a content calendar for you?"

### Suggested Actions

The AI often provides clickable action buttons:

- **"Generate Workflow"**: Opens workflow generator with pre-filled prompt
- **"Go to Settings"**: Navigates to settings page
- **"View Analytics"**: Opens analytics for specific campaign
- **"Create Asset"**: Opens asset generation form

### Voice Input (Coming Soon)

Soon you'll be able to:
- Click the microphone button
- Speak your question or command
- AI transcribes and responds

---

## Best Practices

### Strategy Creation

#### DO:
- Be specific about your target audience
- Set realistic budgets
- Choose channels relevant to your audience
- Use AI suggestions for optimization
- Start with templates for best results

#### DON'T:
- Target too broad an audience
- Ignore AI recommendations
- Overallocate budget to untested channels
- Set unrealistic timelines

### Workflow Generation

#### DO:
- Use clear, specific prompts
- Include context (brand, audience, goals)
- Review generated workflows before deploying
- Test with small batches first
- Monitor executions closely

#### DON'T:
- Use vague descriptions
- Deploy without reviewing
- Generate complex workflows immediately
- Ignore execution errors

### Asset Creation

#### DO:
- Provide detailed prompts
- Specify tone and style
- Generate multiple variations
- Edit and refine AI output
- Maintain brand consistency

#### DON'T:
- Use generic prompts
- Skip human review
- Ignore platform best practices
- Overuse emojis or hashtags

### Analytics

#### DO:
- Check analytics regularly (daily/weekly)
- Compare time periods
- Act on AI insights
- A/B test hypotheses
- Track ROI

#### DON'T:
- Ignore underperforming content
- Focus only on vanity metrics
- Make decisions without data
- Neglect long-term trends

---

## Troubleshooting

### Common Issues

#### Workflow Generation Failed

**Problem**: Workflow generation returns an error

**Solutions**:
1. Check your OpenAI API key in Settings
2. Ensure you have sufficient API credits
3. Try a simpler, more specific prompt
4. Contact support if issue persists

#### Workflow Deployment Failed

**Problem**: Can't deploy workflow to n8n

**Solutions**:
1. Verify n8n connection in Settings > Integrations
2. Check n8n API key is valid
3. Ensure n8n instance is running
4. Review workflow JSON for errors
5. Check n8n logs for specific error

#### Asset Generation Slow

**Problem**: Image generation takes too long

**Solutions**:
1. Image generation takes 10-30 seconds normally
2. Try during off-peak hours
3. Reduce image quality setting
4. Use text generation instead when possible

#### Analytics Not Updating

**Problem**: Analytics show old data

**Solutions**:
1. Click "Refresh" button
2. Select current date range
3. Check platform connections are active
4. Wait 24 hours for data to populate

#### AI Assistant Not Responding

**Problem**: AI chat gives no response

**Solutions**:
1. Check internet connection
2. Verify API credentials
3. Refresh the page
4. Try a different browser

### Getting Help

#### In-App Help
- Click the "?" icon in the top right
- Access documentation
- Watch tutorial videos

#### AI Assistant
- Ask AI Assistant for help
- It can guide you through most issues

#### Support
- Email: support@yourdomain.com
- Documentation: /docs
- Issue Tracker: GitHub Issues

### Status Page

Check the application status page for:
- Service uptime
- Known issues
- Scheduled maintenance

---

## Keyboard Shortcuts

**Navigation:**
- `Cmd/Ctrl + K`: Open AI Assistant
- `Cmd/Ctrl + B`: Toggle sidebar
- `G then D`: Go to Dashboard
- `G then S`: Go to Strategy
- `G then W`: Go to Workflows
- `G then A`: Go to Assets
- `G then C`: Go to Campaigns
- `G then N`: Go to Analytics

**Actions:**
- `Cmd/Ctrl + N`: New item (context-dependent)
- `Cmd/Ctrl + /`: Open keyboard shortcuts
- `Esc`: Close modal or dropdown

---

## Tips and Tricks

### Productivity Tips

1. **Use Templates**: Start from templates to save time
2. **Batch Work**: Generate multiple assets at once
3. **Schedule Content**: Plan and schedule posts in advance
4. **Reuse Workflows**: Clone successful workflows for new campaigns
5. **Monitor Analytics**: Check analytics weekly to optimize

### Advanced Features

#### Workflow Chaining
- Chain multiple workflows together
- Pass data between workflows
- Create complex automation sequences

#### Custom Webhooks
- Use webhooks to trigger workflows from external events
- Integrate with other tools and services

#### API Access
- Use the API for custom integrations
- Automate dashboard tasks
- Build custom dashboards

---

**Version:** 1.0.0
**Last Updated:** 2026-01-31
