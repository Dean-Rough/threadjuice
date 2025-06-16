Initialize a comprehensive Next.js project with all modern tooling and configurations for: $ARGUMENTS

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

Remember: This initialization creates a production-ready development environment with all modern tooling, testing, and CI/CD configured for immediate productivity.
