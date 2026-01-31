# Project Structure

## Directory Overview

```
n8nvibes/
├── .claude/                      # Claude Code configuration
│   ├── agents/                   # Custom agent definitions
│   ├── commands/                 # Custom slash commands
│   ├── skills/                   # Custom skill definitions
│   └── rules/                    # Project-specific rules
│
├── .moai/                        # MoAI-ADK configuration
│   ├── config/                   # Project configuration files
│   │   └── sections/             # Configuration sections (quality, user, language)
│   ├── memory/                   # Memory and context management
│   │   └── checkpoints/          # Agent checkpoints and resume capability
│   ├── project/                  # Project documentation (this file)
│   │   ├── product.md            # Product vision and requirements
│   │   ├── structure.md          # Project structure documentation
│   │   └── tech.md               # Technology stack
│   └── specs/                    # SPEC documents (EARS format requirements)
│       └── SPEC-XXX/             # Individual specification folders
│
├── src/                          # Application source code
│   └── [project_name]/           # Main application package
│       ├── __init__.py           # Package initialization
│       ├── main.py               # FastAPI application entry point
│       ├── api/                  # API route handlers
│       │   ├── __init__.py
│       │   ├── v1/               # API version 1
│       │   │   ├── __init__.py
│       │   │   ├── router.py     # API router setup
│       │   │   └── endpoints/    # Endpoint modules
│       │   │       ├── auth.py   # Authentication endpoints
│       │   │       ├── users.py  # User management endpoints
│       │   │       └── ...
│       │   └── deps.py           # FastAPI dependencies
│       ├── core/                 # Core functionality
│       │   ├── __init__.py
│       │   ├── config.py         # Application configuration
│       │   ├── security.py       # Security utilities (JWT, hashing)
│       │   ├── database.py       # Database connection and session
│       │   └── logging.py        # Logging configuration
│       ├── models/               # Database models (SQLAlchemy)
│       │   ├── __init__.py
│       │   ├── base.py           # Base model class
│       │   ├── user.py           # User model
│       │   └── ...
│       ├── schemas/              # Pydantic schemas (request/response)
│       │   ├── __init__.py
│       │   ├── user.py           # User schemas
│       │   ├── auth.py           # Authentication schemas
│       │   └── ...
│       ├── services/             # Business logic layer
│       │   ├── __init__.py
│       │   ├── auth_service.py   # Authentication logic
│       │   ├── user_service.py   # User management logic
│       │   └── ...
│       ├── repositories/         # Data access layer
│       │   ├── __init__.py
│       │   ├── base.py           # Base repository
│       │   ├── user_repository.py
│       │   └── ...
│       └── utils/                # Utility functions
│           ├── __init__.py
│           ├── validators.py     # Custom validators
│           └── helpers.py        # Helper functions
│
├── tests/                        # Test suite
│   ├── __init__.py
│   ├── conftest.py               # Pytest configuration and fixtures
│   ├── unit/                     # Unit tests
│   │   ├── test_services/        # Service layer tests
│   │   ├── test_repositories/    # Repository tests
│   │   └── test_utils/           # Utility tests
│   ├── integration/              # Integration tests
│   │   ├── test_api/             # API endpoint tests
│   │   └── test_database/        # Database integration tests
│   └── e2e/                      # End-to-end tests
│       └── test_workflows/       # Full workflow tests
│
├── alembic/                      # Database migration framework
│   ├── env.py                    # Alembic environment configuration
│   ├── script.py.mako            # Migration script template
│   └── versions/                 # Migration files
│       └── 001_initial.py        # Initial schema
│
├── scripts/                      # Utility scripts
│   ├── init_db.py                # Database initialization
│   ├── seed_data.py              # Seed data for development
│   └── migrate.sh                # Migration wrapper script
│
├── docs/                         # Documentation
│   ├── api/                      # API documentation
│   ├── guides/                   # User and developer guides
│   └── architecture/             # System architecture documentation
│
├── frontend/                     # Frontend application (optional)
│   ├── src/                      # Frontend source code
│   ├── public/                   # Static assets
│   └── package.json              # Frontend dependencies
│
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── .mcp.json                     # MCP server configuration
├── CLAUDE.md                     # MoAI execution directive
├── README.md                     # Project overview and quick start
├── pyproject.toml                # Python project configuration
├── requirements/                 # Python dependencies
│   ├── base.txt                  # Base dependencies
│   ├── development.txt           # Development dependencies
│   └── production.txt            # Production dependencies
├── docker-compose.yml            # Docker development environment
├── Dockerfile                    # Production Docker image
├── alembic.ini                   # Alembic configuration
└── pytest.ini                    # Pytest configuration
```

---

## Directory Purposes

### Configuration Directories

#### `.claude/`
Claude Code's project-specific configuration. Contains custom agents, commands, skills, and rules that extend Claude Code's functionality for this project.

**Key Files:**
- `agents/` - Custom sub-agent definitions
- `commands/` - Custom slash command implementations
- `skills/` - Reusable skill definitions
- `rules/moai/` - MoAI-ADK framework rules and workflows

#### `.moai/`
MoAI Application Development Kit configuration and runtime data.

**Key Sections:**
- `config/sections/` - Project configuration (quality gates, user preferences, language settings)
- `memory/checkpoints/` - Agent execution checkpoints for resume capability
- `project/` - Project documentation (product, structure, tech stack)
- `specs/` - SPEC documents containing requirements in EARS format

---

### Source Code Directories

#### `src/[project_name]/`
Main application package. All application code resides here to ensure clean separation from tests and configuration.

**Subdirectories:**

**`api/`** - API layer containing route handlers
- `v1/endpoints/` - Individual endpoint modules organized by domain
- `deps.py` - FastAPI dependency functions (authentication, database session)

**`core/`** - Core application functionality
- `config.py` - Settings class using Pydantic Settings
- `security.py` - Password hashing, JWT token creation/validation
- `database.py` - Database engine, session factory, base class
- `logging.py` - Structured logging configuration

**`models/`** - SQLAlchemy ORM models
- Each file represents a database table
- Inherit from declarative base
- Include relationships and constraints

**`schemas/`** - Pydantic models for request/response validation
- Separate from models for API layer
- Include validation rules and examples
- Organized by domain (user, auth, etc.)

**`services/`** - Business logic layer
- Implement application rules and workflows
- Coordinate between repositories and external services
- Handle complex operations

**`repositories/`** - Data access layer
- Abstract database operations
- Provide CRUD interface for models
- Enable testing with mock repositories

**`utils/`** - Shared utility functions
- Validators, formatters, helpers
- Keep logic pure and testable

---

### Test Directories

#### `tests/`
Comprehensive test suite organized by test type.

**Structure:**

**`unit/`** - Tests for individual functions and classes in isolation
- Test services with mocked repositories
- Test utilities with various inputs
- Fast execution, high coverage

**`integration/`** - Tests interactions between components
- Test API endpoints with test database
- Test database operations
- Slower than unit tests

**`e2e/`** - End-to-end workflow tests
- Test complete user journeys
- Test authentication flows
- Test business workflows

**`conftest.py`** - Pytest configuration
- Shared fixtures (database, client, authentication)
- Test database setup/teardown
- Test configuration overrides

---

### Database Migration Directory

#### `alembic/`
Database migration files for schema evolution.

**Key Files:**
- `env.py` - Alembic environment configuration
- `versions/` - Migration files (auto-generated)
- Each migration has `upgrade()` and `downgrade()` functions

**Usage:**
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

### Documentation Directory

#### `docs/`
Project documentation for developers and users.

**Structure:**
- `api/` - Auto-generated API documentation
- `guides/` - Getting started, how-to guides
- `architecture/` - System design, data flows, diagrams

---

### Frontend Directory (Optional)

#### `frontend/`
Frontend application if using React, Vue, or similar.

**Structure:**
- `src/` - Source code
- `public/` - Static assets
- `package.json` - Dependencies and scripts

---

## Key File Locations

### Entry Points

**`src/[project_name]/main.py`** - FastAPI application entry point
- Creates FastAPI app instance
- Registers routers and middleware
- Configures CORS, exception handlers
- Includes startup and shutdown events

**`alembic/versions/001_initial.py`** - Initial database schema
- Defines initial tables and relationships
- Creates indexes and constraints

### Configuration Files

**`pyproject.toml`** - Python project configuration
- Project metadata
- Dependencies (using Poetry or PEP 621)
- Tool configurations (pytest, ruff, mypy)

**`pytest.ini`** - Pytest configuration
- Test discovery patterns
- Fixture locations
- Coverage settings

**`.env.example`** - Environment variable template
- Required environment variables
- Default values for development
- Documentation for each variable

**`docker-compose.yml`** - Development environment
- PostgreSQL database
- Redis cache
- Application container configuration

### Documentation Files

**`README.md`** - Project overview
- Quick start guide
- Installation instructions
- Usage examples
- Contributing guidelines

**`.moai/project/product.md`** - Product vision
- Feature requirements
- Use cases
- Success metrics

**`.moai/project/tech.md`** - Technology stack
- Framework choices
- Rationale for technology decisions

---

## File Naming Conventions

### Python Modules
- Lowercase with underscores: `user_service.py`
- Test files: `test_` prefix: `test_user_service.py`
- Private modules: Single leading underscore: `_internal.py`

### Database Migrations
- Sequential numbering: `001_initial.py`, `002_add_users.py`
- Descriptive names: `add_user_preferences.py`

### Documentation
- Lowercase with hyphens: `getting-started.md`
- API docs: Match endpoint structure

---

## Import Conventions

### Absolute Imports (Recommended)
```python
from src.project_name.models.user import User
from src.project_name.services.auth_service import AuthService
```

### Relative Imports (Within Package)
```python
from .models import User
from .schemas import UserCreate
```

### Grouping Order
1. Standard library imports
2. Third-party imports
3. Local application imports
4. Each group separated by blank line

---

## File Size Guidelines

### Maximum File Sizes
- Route handlers: < 200 lines
- Services: < 300 lines
- Models: < 150 lines
- Tests: < 300 lines per file

### When to Split Files
- Route handlers: > 5 endpoints → split by domain
- Services: > 3 major functions → split by responsibility
- Tests: > 300 lines → split by scenario

---

## Best Practices

### Directory Organization
- Keep related files together
- Separate concerns (API, business logic, data access)
- Use `__init__.py` to control public API
- Avoid circular dependencies

### File Placement
- One class per file (models, schemas)
- Group related functions in modules
- Keep test structure mirroring source structure

### Documentation Location
- API docs: Next to code (docstrings)
- Architecture docs: `docs/architecture/`
- User guides: `docs/guides/`
- SPEC docs: `.moai/specs/SPEC-XXX/`

---

*Last Updated: 2026-01-31*
*Maintained by: RogerGV*
