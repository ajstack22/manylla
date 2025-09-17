# Draft Prompts - Story Parking Lot

This directory contains draft prompts that represent potential improvements and enhancements identified during development. These drafts serve as a "parking lot" for stories that need to be prioritized and expanded into full prompt packs.

## Purpose

Draft prompts capture:
- Issues discovered during implementation
- Improvement opportunities
- Technical debt items
- Developer experience enhancements
- Tool and process improvements

## Current Drafts

### 🔧 DevOps & Deployment

#### [Update Deployment Script for Platform Migration](./update-deployment-script-for-platform-migration.md)
**Priority**: High  
**Problem**: Deployment script's autofix breaks platform imports  
**Value**: Eliminates manual intervention during deployments

### 📦 Code Organization

#### [Standardize @platform Alias Usage](./standardize-platform-alias-imports.md)
**Priority**: Medium-High  
**Problem**: Mixed import patterns causing inconsistency  
**Value**: Consistent imports, better maintainability

### 🛠️ Developer Experience

#### [Fix ESLint Import Configuration](./fix-eslint-import-configuration.md)
**Priority**: Medium  
**Problem**: ESLint incorrectly flags and fixes valid imports  
**Value**: Accurate linting, safe autofix, reliable CI/CD

## Draft Structure

Each draft should include:
1. **Problem Statement** - What's broken or suboptimal
2. **Value Proposition** - Why fix it
3. **Proposed Implementation** - How to fix it
4. **Success Criteria** - How we know it's fixed
5. **Estimated Effort** - Time/resource requirements
6. **Dependencies** - What needs to happen first

## Promotion Process

To promote a draft to a full prompt pack:
1. Review and refine the draft
2. Get team consensus on approach
3. Estimate priority and impact
4. Create detailed prompt pack in `/docs/prompts/active/`
5. Move draft to `/docs/prompts/archive/drafts/`

## Adding New Drafts

When identifying new improvement opportunities:
1. Create a new `.md` file in this directory
2. Follow the draft template structure
3. Update this README with a brief description
4. Tag with appropriate priority level

## Priority Levels

- **Critical**: Blocking deployments or development
- **High**: Significant productivity impact
- **Medium**: Quality of life improvements
- **Low**: Nice to have enhancements

## Review Schedule

Drafts should be reviewed during:
- Sprint planning sessions
- Technical debt discussions
- Post-incident reviews
- Quarterly planning

---

*Last Updated: September 2025*  
*Total Drafts: 3*