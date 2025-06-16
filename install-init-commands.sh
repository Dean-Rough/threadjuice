#!/bin/bash

# Claude Code Initialization Commands Generator
# Creates just the enhanced initialization slash commands
# Run this to add The Terry's project bootstrap commands

set -e

echo "🚀 Installing The Terry's Enhanced Initialization Commands"
echo "========================================================"

GREEN='\033[0;32m'
NC='\033[0m'

# Function to create command files
create_command() {
    local file_path="$1"
    local content="$2"
    
    mkdir -p "$(dirname "$file_path")"
    echo "$content" > "$file_path"
    echo -e "${GREEN}✓${NC} Created command: $file_path"
}

echo ""
echo "Creating enhanced initialization commands..."

# 1. Enhanced Init Command (project-specific)
create_command ".claude/commands/enhanced-init.md" 'Initialize a comprehensive Next.js project with all modern tooling and configurations for: $ARGUMENTS

## Enhanced Project Initialization Protocol

### Phase 1: Project Analysis & Setup
1. **Analyze Current State**
   - Check if this is a new project or existing codebase
   - Identify current package.json and dependencies
   - Check for existing configuration files
   - Assess project structure

### Phase 2: Core Development Configuration
1. **Package.json Enhancement**
   - Add comprehensive scripts for development workflow
   - Include proper metadata (name, description, version)
   - Set up standard dependencies for Next.js TypeScript project
   - Configure dev dependencies for tooling

2. **TypeScript Configuration**
   - Create optimized `tsconfig.json` with strict settings
   - Configure path mapping for clean imports (@/ alias)
   - Set up proper target and lib configurations
   - Enable all strict type checking options

3. **Next.js Configuration**
   - Create `next.config.js` with performance optimizations
   - Configure image domains and security headers
   - Set up bundle analysis capabilities
   - Enable experimental features where appropriate

### Phase 3: Code Quality & Linting Setup
1. **ESLint Configuration**
   - Install and configure ESLint for Next.js with TypeScript
   - Add React hooks rules and accessibility plugins
   - Configure import sorting and unused import detection
   - Set up consistent code style rules

2. **Prettier Configuration**
   - Create `.prettierrc` with project-specific formatting
   - Add `.prettierignore` for build artifacts
   - Configure integration with ESLint
   - Set up consistent formatting for TypeScript/React

3. **EditorConfig**
   - Create `.editorconfig` for consistent editor behavior
   - Configure indent style, charset, and line endings
   - Ensure consistency across different IDEs

### Phase 4: Validation & Schema Setup
1. **Zod Configuration**
   - Install Zod for TypeScript-first schema validation
   - Create `lib/validations.ts` with common schemas
   - Set up environment variable validation
   - Create form validation patterns

2. **Environment Configuration**
   - Create `.env.example` with required variables
   - Set up environment validation with Zod
   - Configure different environments (dev, staging, prod)
   - Add proper .gitignore patterns

### Phase 5: Testing Infrastructure
1. **Vitest Setup**
   - Configure Vitest for unit and integration testing
   - Create `vitest.config.ts` with proper setup
   - Add testing utilities and React Testing Library
   - Create test setup files and global configurations

2. **Playwright E2E Setup**
   - Install and configure Playwright for E2E testing
   - Create `playwright.config.ts` with multiple browsers
   - Set up test fixtures and page object patterns
   - Configure CI/CD integration

### Phase 6: Database & ORM Setup (if applicable)
1. **Prisma Configuration**
   - Install Prisma ORM if database integration needed
   - Create initial `schema.prisma` with user model
   - Configure database connection for NeonDB
   - Set up migration scripts and seeding

### Phase 7: Authentication Setup (if applicable)
1. **Clerk Integration**
   - Install Clerk packages for authentication
   - Create authentication configuration
   - Set up middleware for protected routes
   - Configure sign-in/sign-up flows

### Phase 8: GitHub Integration & CI/CD
1. **GitHub Repository Setup**
   - Initialize git repository if not exists
   - Create comprehensive `.gitignore` for Next.js
   - Set up GitHub repository with `gh` CLI
   - Configure branch protection rules

2. **GitHub Actions Workflow**
   - Create `.github/workflows/ci.yml` for continuous integration
   - Set up automated testing on pull requests
   - Configure deployment workflows for Vercel
   - Add code quality checks and security scanning

3. **Issue & PR Templates**
   - Create `.github/ISSUE_TEMPLATE/` with bug and feature templates
   - Add pull request template with checklist
   - Configure automated labeling for issues

### Phase 9: Enhanced CLAUDE.md Creation
1. **Comprehensive Project Documentation**
   - Create enhanced CLAUDE.md with all our optimizations
   - Include all development commands and workflows
   - Add project-specific patterns and conventions
   - Import our modular workflow patterns

2. **Project-Specific Slash Commands**
   - Create useful project-specific commands
   - Add safety review commands (if child-facing app)
   - Configure development workflow automation
   - Set up deployment and maintenance commands

### Phase 10: Development Environment Verification
1. **Dependency Installation**
   - Run `npm install` to install all dependencies
   - Verify all tools are working correctly
   - Run initial build to check configuration
   - Execute test suite to ensure everything passes

2. **Git Initial Commit**
   - Stage all configuration files
   - Create initial commit with proper message
   - Push to GitHub repository
   - Set up development branch if needed

## Additional Configuration for Child Safety Projects
If project type includes "child-safety" or "coppa":
- Add specialized safety validation tools
- Configure enhanced security settings
- Set up parent notification systems
- Add compliance documentation templates
- Configure audit logging requirements

## Success Verification Checklist
After initialization, verify:
- [ ] All development commands work (`npm run dev`, `npm run build`, `npm test`)
- [ ] Linting passes without errors (`npm run lint`)
- [ ] Type checking succeeds (`npm run type-check`)
- [ ] Tests pass (`npm run test:unit`, `npm run test:e2e`)
- [ ] Git repository connected to GitHub
- [ ] CI/CD pipeline configured and working
- [ ] Enhanced CLAUDE.md with all patterns loaded
- [ ] Project structure follows best practices

Remember: This initialization creates a production-ready development environment with all modern tooling, testing, and CI/CD configured for immediate productivity.'

# 2. Quick Setup Command (global)
create_command "$HOME/.claude/commands/quick-setup.md" 'Rapidly set up a production-ready Next.js project with all tooling: $ARGUMENTS

## Quick Setup Protocol - Complete Project Bootstrap

This command orchestrates all setup commands to create a fully-configured project in minutes.

### Phase 1: Project Assessment
1. **Current State Analysis**
   - Check if package.json exists
   - Identify existing configuration files
   - Assess current git status
   - Determine project type (new vs existing)

### Phase 2: Rapid Tooling Installation
Execute in sequence:

1. **Core Dependencies Installation**
   ```bash
   # Install Next.js with TypeScript if new project
   npx create-next-app@latest . --typescript --tailwind --eslint --app
   
   # Or enhance existing project
   npm install next react react-dom
   npm install -D typescript @types/node @types/react @types/react-dom
   ```

2. **Development Tooling**
   ```bash
   # Essential dev dependencies
   npm install -D eslint eslint-config-next @typescript-eslint/eslint-plugin
   npm install -D prettier eslint-config-prettier
   npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
   npm install -D playwright @playwright/test
   npm install zod
   
   # Optional but recommended
   npm install -D prisma @prisma/client
   npm install @clerk/nextjs  # If authentication needed
   ```

### Phase 3: Configuration Files Generation
Create all configuration files simultaneously:

1. **TypeScript Configuration** (`tsconfig.json`)
2. **ESLint Configuration** (`.eslintrc.json`)
3. **Prettier Configuration** (`.prettierrc` + `.prettierignore`)
4. **Vitest Configuration** (`vitest.config.ts`)
5. **Playwright Configuration** (`playwright.config.ts`)
6. **Environment Files** (`.env.example`)
7. **Git Configuration** (`.gitignore`)
8. **Editor Configuration** (`.editorconfig`)

### Phase 4: Project Structure Creation
Generate standard project structure:
```
project/
├── app/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── forms/
├── lib/
│   ├── utils.ts
│   ├── validations.ts
│   └── db.ts
├── public/
├── tests/
│   ├── __mocks__/
│   └── setup.ts
├── docs/
│   ├── PRD.md
│   └── ROADMAP.md
└── .claude/
    └── commands/
```

### Phase 5: Enhanced CLAUDE.md Creation
Generate comprehensive project documentation:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Context
[Project description and requirements]

## Tech Stack
- **Frontend**: Next.js 14+ with React, TailwindCSS, TypeScript
- **Backend**: Next.js API routes
- **Database**: [Database choice]
- **Auth**: [Auth solution]
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Vercel

## Development Commands
```bash
npm run dev          # Development server (port 4288)
npm run build        # Production build
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run lint         # ESLint
npm run type-check   # TypeScript validation
npm run format       # Prettier formatting
```

## Import Modular Workflows
@personas/terry-personality.md
@workflows/autonomous-dev.md
@tech-stacks/nextjs.md
@testing/tdd-patterns.md
@tools/gemini-integration.md

## Project-Specific Patterns
[Add project-specific conventions here]
```

### Phase 6: GitHub Integration (Optional)
If GitHub integration requested:
1. Initialize git repository
2. Create GitHub repository with `gh repo create`
3. Set up GitHub Actions workflows
4. Configure issue and PR templates
5. Set up branch protection rules

### Phase 7: Verification & Testing
Run comprehensive verification:

1. **Build Verification**
   ```bash
   npm run type-check  # TypeScript compilation
   npm run lint        # ESLint rules
   npm run build       # Next.js build
   ```

2. **Test Suite Execution**
   ```bash
   npm run test:run    # Unit tests
   npx playwright install --with-deps
   npm run test:e2e    # E2E tests
   ```

3. **Development Server Test**
   ```bash
   npm run dev         # Should start on port 4288
   ```

### Phase 8: Documentation Generation
Create essential documentation files:

1. **README.md** - Project overview and setup instructions
2. **CONTRIBUTING.md** - Contribution guidelines
3. **docs/PRD.md** - Product Requirements Document template
4. **docs/ROADMAP.md** - Implementation roadmap template

### Phase 9: Initial Commit & Push
If git repository setup:
```bash
git add .
git commit -m "feat: initial project setup with comprehensive tooling

- Next.js 14 with TypeScript and TailwindCSS
- Complete testing infrastructure (Vitest + Playwright)
- Code quality tools (ESLint + Prettier)
- GitHub Actions CI/CD pipeline
- Comprehensive development environment"

git push -u origin main
```

### Success Indicators
Project setup is complete when:
- [ ] All npm scripts execute without errors
- [ ] TypeScript compilation succeeds
- [ ] Linting passes without warnings
- [ ] Test suite runs successfully
- [ ] Development server starts properly
- [ ] Build process completes successfully
- [ ] Git repository is properly configured
- [ ] GitHub integration is functional (if enabled)
- [ ] All configuration files are present and valid

### Post-Setup Recommendations
1. **Review Generated Configuration** - Customize settings as needed
2. **Update Environment Variables** - Add actual API keys and secrets
3. **Customize CLAUDE.md** - Add project-specific patterns
4. **Create First Feature Branch** - Start development workflow
5. **Set Up Deployment** - Configure production environment

This quick setup creates a production-ready development environment with all modern tooling, testing infrastructure, and CI/CD pipeline configured for immediate productivity.

Time to completion: ~5-10 minutes for complete setup.'

# 3. Setup Tooling Command (global)
create_command "$HOME/.claude/commands/setup-tooling.md" 'Set up complete development tooling for: $ARGUMENTS

## Development Tooling Setup Protocol

### TypeScript Configuration
Create optimized `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration
Create `.eslintrc.json`:
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling"],
        "newlines-between": "always"
      }
    ]
  }
}
```

### Prettier Configuration
Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

Create `.prettierignore`:
```
.next
node_modules
.vercel
build
dist
*.md
```

### Zod Validation Setup
Install Zod and create `lib/validations.ts`:
```typescript
import { z } from '\''zod'\'';

export const envSchema = z.object({
  NODE_ENV: z.enum(['\''development'\'', '\''test'\'', '\''production'\'']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
});

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(13).optional(),
});

export type User = z.infer<typeof userSchema>;
export type Env = z.infer<typeof envSchema>;
```

### Vitest Configuration
Create `vitest.config.ts`:
```typescript
import { defineConfig } from '\''vitest/config'\'';
import react from '\''@vitejs/plugin-react'\'';
import path from '\''path'\'';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: '\''jsdom'\'',
    setupFiles: ['\''./vitest.setup.ts'\''],
  },
  resolve: {
    alias: {
      '\''@'\'': path.resolve(__dirname, '\''./'\'']),
    },
  },
});
```

### Playwright Configuration
Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '\''@playwright/test'\'';

export default defineConfig({
  testDir: '\''./tests'\'',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: '\''html'\'',
  use: {
    baseURL: '\''http://localhost:3000'\'',
    trace: '\''on-first-retry'\'',
  },
  projects: [
    {
      name: '\''chromium'\'',
      use: { ...devices['\''Desktop Chrome'\''] },
    },
    {
      name: '\''firefox'\'',
      use: { ...devices['\''Desktop Firefox'\''] },
    },
    {
      name: '\''webkit'\'',
      use: { ...devices['\''Desktop Safari'\''] },
    },
  ],
  webServer: {
    command: '\''npm run dev'\'',
    url: '\''http://localhost:3000'\'',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Package.json Scripts Enhancement
Add these scripts to package.json:
```json
{
  "scripts": {
    "dev": "next dev -p 4288",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "build:analyze": "ANALYZE=true npm run build",
    "clean": "rm -rf .next out",
    "dev:turbo": "next dev --turbo",
    "postinstall": "prisma generate"
  }
}
```

### Development Dependencies Installation
Install essential development dependencies:
```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
npm install -D playwright @playwright/test
npm install -D prisma @prisma/client
npm install zod
```

### Verification Steps
After setup, verify everything works:
1. Run `npm run type-check` - should pass without errors
2. Run `npm run lint` - should pass without warnings
3. Run `npm run format:check` - should confirm formatting
4. Run `npm run build` - should build successfully
5. Run `npm run test:run` - should execute test suite
6. Run `npm run test:e2e` - should run E2E tests

All tooling is now configured for maximum developer productivity and code quality!'

# 4. GitHub Integration Command (global)
create_command "$HOME/.claude/commands/github-integration.md" 'Set up comprehensive GitHub integration for project: $ARGUMENTS

## GitHub Integration Setup Protocol

### Phase 1: Repository Initialization
1. **Git Repository Setup**
   - Initialize git repository if not exists: `git init`
   - Check current remote configuration
   - Create initial commit if repository is empty
   - Configure main branch protection

2. **GitHub Repository Creation**
   - Use `gh` CLI to create repository: `gh repo create`
   - Set repository description and visibility
   - Configure default branch settings
   - Enable issues, discussions, and wiki if needed

### Phase 2: GitHub Actions CI/CD Setup
Create `.github/workflows/ci.yml` with comprehensive pipeline for:
- Type checking and linting
- Unit and E2E testing
- Build verification
- Security scanning
- Deployment to Vercel

### Phase 3: Issue and PR Templates
Create professional templates for:
- Bug reports with browser compatibility
- Feature requests with problem/solution format
- Pull request checklist with quality gates
- Child safety validation (if applicable)

### Phase 4: Branch Protection & Security
Configure repository security:
- Branch protection rules for main
- Required status checks
- Enforce code review requirements
- Enable Dependabot and security scanning

### Phase 5: Labels and Project Management
Create standard label system:
- Priority levels (high/medium/low)
- Type classification (bug/feature/docs/security)
- Status tracking (in-progress/blocked/ready-for-review)
- Child safety labels (if applicable)

### Phase 6: Deployment Integration
Set up Vercel deployment:
- Connect repository to Vercel
- Configure environment variables
- Set up preview deployments
- Configure production deployment

### Success Verification
GitHub integration complete when:
- [ ] Repository created and accessible
- [ ] CI/CD pipeline runs successfully
- [ ] Branch protection prevents direct pushes to main
- [ ] Issue/PR templates load correctly
- [ ] Security scanning active
- [ ] Deployment pipeline functional

Professional GitHub setup completed with enterprise-grade workflows!'

echo ""
echo -e "${GREEN}✓${NC} All enhanced initialization commands created!"
echo ""
echo "Usage:"
echo "  /project:enhanced-init \"description\"    - Comprehensive project setup"
echo "  /quick-setup \"description\"             - Complete rapid bootstrap (global)"
echo "  /setup-tooling \"description\"           - Development tools only (global)"
echo "  /github-integration \"description\"      - GitHub & CI/CD setup (global)"
echo ""
echo "The Terry's enhanced initialization system is ready!"
echo "Now you can bootstrap production-ready projects in minutes."