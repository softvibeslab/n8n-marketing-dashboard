# n8n Marketing Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-black)](https://react.dev/)

An AI-powered all-in-one dashboard application for digital marketing agencies. Transform natural language marketing strategies into automated n8n workflows with AI-generated content and real-time analytics.

## Features

- **AI-Powered Strategy Input**: Describe your marketing goals in natural language and let AI transform them into actionable campaigns
- **Automated Workflow Generation**: Generate n8n-compatible workflows automatically from strategy descriptions
- **Multi-Channel Asset Creation**: Create text content and images for social media, email campaigns, and more
- **Real-Time Analytics**: Track campaign performance with AI-powered insights and optimization suggestions
- **Conversational AI Assistant**: Get guidance, ask questions, and execute commands through natural language chat
- **Visual Workflow Editor**: Preview, edit, and deploy workflows with an intuitive interface
- **Asset Management**: Organize, review, and regenerate marketing assets in one place
- **n8n Integration**: Seamless integration with n8n for workflow automation and execution

## Tech Stack

### Frontend
- React 19 with TypeScript
- TailwindCSS for styling
- TanStack Query for server state
- Zustand for client state
- React Router for navigation
- Vite for build tooling

### Backend
- Node.js 20+ LTS
- Express.js with TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching
- Socket.IO for real-time updates
- JWT authentication

### Integrations
- n8n API (workflow automation)
- OpenAI/Groq (AI content generation)
- DALL-E/Stable Diffusion (image generation)
- Canva API (design automation)
- Mailchimp API (email campaigns)
- Google Analytics (performance tracking)

## Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL database
- n8n instance (self-hosted or cloud)
- OpenAI API key (or Groq API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/n8n-marketing-dashboard.git
   cd n8n-marketing-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Setup database**
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Documentation

- [API Documentation](docs/api/README.md) - Complete API reference with all endpoints
- [User Guide](docs/user-guide/README.md) - How to use the application features
- [Developer Guide](docs/developer-guide/README.md) - Architecture and contribution guidelines
- [Deployment Guide](docs/deployment/README.md) - Production deployment instructions

## Architecture

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
│ OpenAI API   │ n8n API      │ GPT-4/DALL-E │ GA API       │
│ Groq API     │ Webhook Mgmt │ Content Gen  │ Social APIs  │
│ Prompt Eng   │ JSON Schema  │ Asset Mgmt   │ Reports      │
└──────────────┴──────────────┴──────────────┴──────────────┘
                            ▼
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ PostgreSQL   │ Redis Cache  │ n8n Instance │ Object Store │
│ User Data    │ Sessions     │ Workflows    │ Assets       │
│ Workflows    │ Rate Limits  │ Executions   │ Logs         │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Key Features in Detail

### 1. Strategy Input Panel

Define your marketing strategy with our intuitive form or use natural language input. Get AI-powered suggestions and templates for common campaign types.

- Template library (E-commerce Launch, Brand Awareness, Lead Generation)
- AI-powered input refinement
- Multi-channel strategy support
- Budget allocation tracking

### 2. AI Workflow Generator

Convert marketing strategies into executable n8n workflows with a single click.

- Natural language to workflow conversion
- Visual workflow preview
- One-click deployment to n8n
- Version control and rollback

### 3. Asset Creation Automation

Generate marketing assets using AI-powered content creation.

- Text generation for social media, emails, blogs
- Image generation with DALL-E 3
- Brand voice matching
- Batch asset generation
- Asset approval workflow

### 4. Analytics & Reporting

Track campaign performance with AI-powered insights.

- Real-time metrics dashboard
- Multi-platform analytics aggregation
- AI-generated optimization suggestions
- Custom report generation
- Export to PDF, CSV, Excel

### 5. AI Assistant Chat

Get help and guidance through conversational AI.

- Natural language interface
- Context-aware conversations
- Action execution (create workflows, campaigns)
- Marketing strategy recommendations
- Quick actions and shortcuts

## API Endpoints

The application provides 35+ REST API endpoints organized into the following categories:

- **Authentication** - Login, register, token refresh
- **Strategy** - Analyze, create, and manage marketing strategies
- **Workflows** - Generate, deploy, and manage n8n workflows
- **Assets** - Generate and manage marketing assets
- **Campaigns** - Create and track marketing campaigns
- **Analytics** - Fetch metrics and generate reports
- **Assistant** - Chat with AI assistant
- **n8n Integration** - n8n connection and webhook handling

See [API Documentation](docs/api/README.md) for complete endpoint reference.

## Development

### Project Structure

```
n8n-marketing-dashboard/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── tests/          # Service tests
│   │   └── utils/          # Utilities
│   ├── prisma/             # Database schema
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilities
│   └── package.json
├── shared/                 # Shared TypeScript types
│   └── src/
│       └── types/          # Shared type definitions
├── docs/                   # Documentation
├── .moai/                  # MoAI-ADK configuration
└── package.json           # Root package.json
```

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint all code
npm run lint

# Format code
npm run lint:fix

# Type checking
npm run type-check
```

## Environment Variables

See [Deployment Guide](docs/deployment/README.md) for complete environment configuration.

Required variables:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/n8n_marketing

# Authentication
JWT_SECRET=your-jwt-secret-min-32-characters

# n8n Integration
N8N_API_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_SECRET=your-webhook-secret

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
GROQ_API_KEY=gsk-your-groq-api-key

# Encryption
ENCRYPTION_KEY=32-character-encryption-key
```

## Deployment

### Quick Deployment Options

**Vercel + Railway**
- Frontend: Deploy to Vercel
- Backend: Deploy to Railway or Render
- Database: Managed PostgreSQL

**Self-Hosted (VPS)**
- Use Docker Compose for complete stack
- Deploy on Hostinger VPS with Easypanel
- See [HOSTINGER-DEPLOY.md](HOSTINGER-DEPLOY.md) for Spanish guide

See [Deployment Guide](docs/deployment/README.md) for detailed instructions.

---

## Despliegue en Hostinger VPS (Español)

Para desplegar en un VPS de Hostinger con Easypanel:

1. **Preparar Repositorio en GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
   git push -u origin main
   ```

2. **Conectar al VPS de Hostinger**
   ```bash
   ssh root@TU_IP_VPS
   ```

3. **Ejecutar Script de Configuración**
   ```bash
   cd /opt
   git clone https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
   cd n8n-marketing-dashboard
   ./scripts/setup-hostinger.sh --domain tudominio.com --email tu@email.com
   ```

4. **Configurar Variables de Entorno**
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```

5. **Desplegar Aplicación**
   ```bash
   ./scripts/deploy.sh production
   ```

Para instrucciones detalladas en español, consulta [HOSTINGER-DEPLOY.md](HOSTINGER-DEPLOY.md)

## Contributing

We welcome contributions! Please see [Developer Guide](docs/developer-guide/README.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Documentation: [docs/](docs/)
- Issue Tracker: [GitHub Issues](https://github.com/your-org/n8n-marketing-dashboard/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/n8n-marketing-dashboard/discussions)

## Roadmap

### Version 1.1.0 (Planned)
- [ ] Visual workflow editor with drag-and-drop
- [ ] Workflow templates marketplace
- [ ] A/B testing framework
- [ ] Voice input for AI assistant

### Version 1.2.0 (Planned)
- [ ] Campaign scheduling system
- [ ] Advanced analytics with cohort analysis
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Version 2.0.0 (Future)
- [ ] White-label customization
- [ ] Team collaboration features
- [ ] Advanced automation rules
- [ ] Plugin system for extensions

## Acknowledgments

Built with:
- [n8n](https://n8n.io/) - Workflow automation
- [OpenAI](https://openai.com/) - AI capabilities
- [React](https://react.dev/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [MoAI-ADK](https://github.com/alfred/moai-adk) - Development framework

---

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2026-01-31
