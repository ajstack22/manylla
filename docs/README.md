# Manylla Documentation

## Documentation Structure (Optimized for LLM Consumption)

This documentation is structured for efficient parsing and understanding by Large Language Models. Each document follows consistent patterns with clear hierarchies, code examples, and explicit type definitions.

### Core Documents

#### [00_ARCHITECTURE.md](./00_ARCHITECTURE.md)
**Purpose**: System overview and high-level design
**Key Sections**: System design, core principles, data flow, component architecture, security model, file structure
**Use When**: Understanding overall system structure, making architectural decisions, onboarding new developers

#### [01_DESIGN_SYSTEM.md](./01_DESIGN_SYSTEM.md)
**Purpose**: UI/UX patterns and visual design guidelines
**Key Sections**: Color palette, typography, component patterns, spacing system, responsive breakpoints, accessibility
**Use When**: Building new components, maintaining UI consistency, implementing mobile-responsive features

#### [02_API_REFERENCE.md](./02_API_REFERENCE.md)
**Purpose**: Complete API endpoint documentation
**Key Sections**: Share endpoints, sync endpoints, rate limiting, error formats, database schema
**Use When**: Implementing API calls, debugging network requests, setting up backend services

#### [03_IMPLEMENTATION_GUIDE.md](./03_IMPLEMENTATION_GUIDE.md)
**Purpose**: Detailed implementation patterns and code examples
**Key Sections**: Frontend patterns, backend patterns, encryption, sharing, sync, testing, performance
**Use When**: Writing new features, debugging issues, optimizing performance

#### [04_DEPLOYMENT_GUIDE.md](./04_DEPLOYMENT_GUIDE.md)
**Purpose**: Build and deployment processes for all environments
**Key Sections**: Build process, deployment scripts, server configuration, database deployment, monitoring, rollback procedures
**Use When**: Deploying to staging/production, setting up CI/CD, troubleshooting deployment issues

#### [05_LLM_TOOLSETS.md](./05_LLM_TOOLSETS.md)
**Purpose**: Practical toolset reference for LLMs working with the codebase
**Key Sections**: GitHub operations, cPanel SSH access, deployment via SSH, database access, debugging, file management
**Use When**: Executing git commands, SSH operations, database queries, deployment tasks, system monitoring

## Quick Reference

### Technology Stack
- **Frontend**: React 19 + TypeScript + Material-UI v7
- **Backend**: PHP 8.0+ REST API
- **Database**: MySQL 8.0+
- **Encryption**: TweetNaCl.js (XSalsa20-Poly1305)
- **Build**: Create React App 5

### Key Patterns
```typescript
// Modal Pattern
<Box sx={{ textAlign: 'center', mb: 4 }}>
  <Icon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
  <Typography variant="h4" fontWeight="bold">{title}</Typography>
  <Typography color="text.secondary">{description}</Typography>
</Box>

// Panel Pattern
<Paper elevation={0} sx={{
  p: 3, border: '2px solid', borderColor: 'divider',
  '&:hover': { borderColor: 'primary.main' }
}}>

// Form Section Pattern
<Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
```

### Common Operations

#### Add New Feature
1. Review `00_ARCHITECTURE.md` for system context
2. Check `01_DESIGN_SYSTEM.md` for UI patterns
3. Reference `03_IMPLEMENTATION_GUIDE.md` for code patterns
4. Test using patterns in Implementation Guide

#### Fix Bug
1. Check `02_API_REFERENCE.md` if network-related
2. Review `03_IMPLEMENTATION_GUIDE.md` for common patterns
3. Verify against design system if UI-related

#### Optimize Performance
1. See Performance Optimization in `03_IMPLEMENTATION_GUIDE.md`
2. Check component patterns in `01_DESIGN_SYSTEM.md`
3. Review data flow in `00_ARCHITECTURE.md`

### File Locations
```
src/
├── components/         # React components
│   ├── Dialogs/       # Modal dialogs
│   ├── Forms/         # Form components
│   ├── Layout/        # Layout components
│   ├── Onboarding/    # Onboarding flow
│   ├── Profile/       # Profile management
│   ├── Settings/      # Settings components
│   ├── Sharing/       # Share functionality
│   └── Sync/          # Sync components
├── context/           # React contexts
├── hooks/             # Custom hooks
├── services/          # Business logic
├── types/             # TypeScript types
└── utils/             # Utilities
```

### Environment Variables
```bash
# Development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SHARE_DOMAIN=http://localhost:3000

# Production
REACT_APP_API_URL=https://manylla.com/api
REACT_APP_SHARE_DOMAIN=https://manylla.com
```

### Deployment Commands
```bash
# Development
npm start

# Build
npm run build

# Deploy to staging
./scripts/deploy-qual.sh

# Deploy to production
./scripts/deploy-prod.sh
```

## LLM Instructions

When working with this codebase:

1. **Always check existing patterns** in `01_DESIGN_SYSTEM.md` before creating new UI components
2. **Follow the architecture** outlined in `00_ARCHITECTURE.md` for system modifications
3. **Use API endpoints** exactly as specified in `02_API_REFERENCE.md`
4. **Implement features** using patterns from `03_IMPLEMENTATION_GUIDE.md`
5. **Maintain consistency** with the established design system and coding patterns

### Code Generation Guidelines
- Use TypeScript for all new React components
- Follow Material-UI v7 theming patterns
- Implement proper error boundaries and loading states
- Add accessibility attributes (ARIA labels, semantic HTML)
- Include mobile-responsive styles using breakpoints
- Use the established modal, panel, and form patterns

### Security Considerations
- Never store unencrypted sensitive data
- Always validate input on both client and server
- Use prepared statements for database queries
- Implement rate limiting on all API endpoints
- Follow zero-knowledge architecture principles

## Version History

### Current Version: 1.0.0
- Consolidated documentation structure
- Optimized for LLM consumption
- Added comprehensive design system
- Unified API reference
- Complete implementation guide

### Previous Versions
- 0.9.0: Initial fragmented documentation
- 0.8.0: Basic API documentation
- 0.7.0: Initial architecture notes