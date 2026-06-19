# GitHub Actions Workflow Setup

## Automatic Workflow Configuration

The CI/CD workflow file is located at `.github/workflows/ci-cd.yml` in the Manus project.

### To Enable the Workflow:

1. **Via GitHub Web UI:**
   - Go to: https://github.com/Nozqan/Akrepindirici
   - Click **Settings** → **Actions** → **General**
   - Under "Actions permissions", select: **Allow all actions and reusable workflows**
   - Go to **Actions** tab
   - The workflow should appear and be ready to run

2. **Manual Workflow File:**
   - Copy the workflow content from Manus project
   - Create `.github/workflows/ci-cd.yml` in your repository
   - Commit and push

### Workflow Jobs:

1. **Quality** - TypeScript, ESLint, Tests
2. **Build Backend** - Node.js server build
4. **Integration Tests** - Cross-component testing
5. **Security Scan** - Trivy vulnerability scanning
6. **Deploy** - Production deployment (main branch only)

### Required Permissions:

The token needs `workflows` permission to create/update workflow files. If using a GitHub App token, ensure it has the required permissions.

### Alternative: Use GitHub CLI

```bash
gh workflow enable ci-cd.yml
```

### Troubleshooting:

- **Token Permission Error**: Use a Personal Access Token (PAT) with `workflow` scope
- **Workflow Not Running**: Check Actions tab for disabled workflows
- **Build Failures**: Check workflow logs in Actions tab

