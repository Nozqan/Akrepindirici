# Akrepindirici CI/CD Setup Guide

## GitHub Actions Workflow Configuration

Due to token permission limitations, the CI/CD workflow needs to be set up via GitHub's web interface.

### To Enable CI/CD:

1. Go to your GitHub repository: https://github.com/Nozqan/Akrepindirici
2. Navigate to **Settings** → **Actions** → **General**
3. Under "Actions permissions", select "Allow all actions and reusable workflows"
4. Go to **Actions** tab
5. Click "New workflow" and create a workflow with the following configuration:

### Recommended Workflow Steps:

**Trigger:** On push to main/develop branches

**Jobs:**

#### 1. Lint & Test
- Node.js 18.x and 20.x matrix
- Install dependencies: `pnpm install`
- Type check: `pnpm check`
- Lint: `pnpm lint`
- Test: `pnpm test`

#### 2. Build
- Build server: `pnpm build`
- Upload artifacts to GitHub

#### 3. Mobile Build
- Check app.config.ts
- Validate TypeScript

### Alternative: Use act (Local Testing)

To test workflows locally:

```bash
# Install act
brew install act  # macOS
# or
choco install act  # Windows

# Run workflow
act -j build
```

### Environment Variables

If needed, add secrets via:
1. Repository Settings → Secrets and variables → Actions
2. Add any required API keys or tokens

### Build Status Badge

Add to README.md:

```markdown
![Build Status](https://github.com/Nozqan/Akrepindirici/workflows/Build%20and%20Deploy%20Akrepindirici/badge.svg)
```

## Notes

- The project uses pnpm as package manager
- TypeScript compilation is strict
- ESLint enforces code quality
- Tests are run with Vitest

## Support

For workflow issues, check:
- GitHub Actions logs in the Actions tab
- Workflow syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
