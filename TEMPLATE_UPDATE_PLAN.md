# AstroPress Template Update Plan
*Safe Auto-Update Workflow for User Repositories*

## Project Architecture Overview

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   AstroPress        │    │     User GitHub      │    │    Template Repo    │
│   Dashboard         │◄──►│     Repository       │◄──►│   (Main Source)     │
│   (Next.js)         │    │   (User's Blog)      │    │                     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
           │                          │                           │
           ▼                          ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│    Hono Backend     │    │   Cloudflare Pages   │    │   GitHub Workflows  │
│  (Workflow Engine)  │    │   (User's Site)      │    │   (Auto Updates)    │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## Core Problem Statement

**Challenge:** Update template core files in user repositories without affecting:
- User content (`src/content/blog/`, `src/content/data/`)
- User customizations
- User configurations

**Solution:** Selective file merging with content preservation

---

## File Classification System

### 🔴 **NEVER UPDATE** (User Content)
```
src/content/blog/           # User's blog posts
src/content/data/authors.json
src/content/data/categories.json
src/content/data/tags.json
src/content/data/settings.json  # User configurations
src/content/data/pages.json
src/content/data/forms.json
src/content/data/ads.json
public/                     # User assets
.env                        # User environment variables
astro.config.mjs           # User customizations
```

### 🟡 **MERGE CAREFULLY** (Core + User Config)
```
src/content.config.ts      # Schema updates + user data
src/content/data/settings.json  # New fields only
package.json               # Dependencies + user scripts
tailwind.config.mjs        # Core + user customizations
```

### 🟢 **SAFE TO UPDATE** (Core Template)
```
src/core/                  # All core logic
src/components/            # All components
src/layouts/               # All layouts
src/pages/ (except content routes)
src/utils/
src/styles/ (base styles)
```

---

## Update Workflow Architecture

### Phase 1: Pre-Update Analysis
```javascript
// Workflow: analyze-user-repo.js
const analyzeUserRepo = async (userRepo) => {
  return {
    userContent: await scanUserContent(userRepo),
    customizations: await detectCustomizations(userRepo),
    currentVersion: await getTemplateVersion(userRepo),
    conflicts: await predictConflicts(userRepo)
  };
};
```

### Phase 2: Safe Update Strategy

#### Strategy A: **Selective File Replacement**
```yaml
name: AstroPress Template Update
on:
  workflow_dispatch:
    inputs:
      target_version:
        description: 'Template version to update to'
        required: true

jobs:
  safe-update:
    runs-on: ubuntu-latest
    steps:
      - name: Backup User Content
        run: |
          # Create backup branch
          git checkout -b backup-$(date +%s)
          git push origin backup-$(date +%s)

      - name: Download Template Updates
        run: |
          # Fetch latest template
          curl -L https://api.github.com/repos/astropress/template/zipball/main > template.zip

      - name: Apply Safe Updates
        run: |
          # Update only core files
          ./scripts/selective-update.sh
```

#### Strategy B: **Smart Merge System**
```javascript
// Hono Backend: /api/update-user-repo
const updateUserRepo = async (c) => {
  const { userId, repoName, targetVersion } = await c.req.json();

  // 1. Create update branch
  await createUpdateBranch(userId, repoName);

  // 2. Apply core updates
  await applyCoreUpdates(userId, repoName, targetVersion);

  // 3. Preserve user content
  await preserveUserContent(userId, repoName);

  // 4. Create PR for review
  await createUpdatePR(userId, repoName);

  return c.json({ success: true, prUrl: updatePrUrl });
};
```

---

## Update File Mapping

### Core Files Update Map
```javascript
const UPDATE_MAP = {
  // Core logic - Always replace
  'src/core/': {
    action: 'replace',
    preserve: false
  },

  // Components - Always replace
  'src/components/': {
    action: 'replace',
    preserve: false
  },

  // Settings - Merge new fields only
  'src/content/data/settings.json': {
    action: 'merge',
    strategy: 'addNewFields',
    preserve: ['siteName', 'siteUrl', 'author', 'themeSettings']
  },

  // Content config - Smart merge
  'src/content.config.ts': {
    action: 'merge',
    strategy: 'schemaUpdate',
    preserve: ['userCollections']
  },

  // Package.json - Dependency update
  'package.json': {
    action: 'merge',
    strategy: 'updateDependencies',
    preserve: ['scripts.custom*', 'dependencies.user*']
  }
};
```

---

## Implementation Plan

### Step 1: **Version Tracking System**
```javascript
// Add to every user repo
// .astropress/version.json
{
  "templateVersion": "2.1.0",
  "lastUpdate": "2025-01-15T10:30:00Z",
  "userModifications": [
    "src/content/data/settings.json",
    "tailwind.config.mjs"
  ],
  "preservedFiles": [
    "src/content/blog/*",
    "src/content/data/authors.json"
  ]
}
```

### Step 2: **Update Detection API**
```typescript
// Hono Backend Route
app.post('/api/check-updates', async (c) => {
  const { userId, repoName } = await c.req.json();

  const userVersion = await getUserTemplateVersion(userId, repoName);
  const latestVersion = await getLatestTemplateVersion();

  if (userVersion < latestVersion) {
    const updates = await generateUpdatePlan(userVersion, latestVersion);
    return c.json({
      hasUpdates: true,
      currentVersion: userVersion,
      latestVersion: latestVersion,
      updates: updates,
      safetyLevel: 'safe' // 'safe' | 'review-required' | 'manual'
    });
  }

  return c.json({ hasUpdates: false });
});
```

### Step 3: **Smart Update Engine**
```bash
#!/bin/bash
# scripts/selective-update.sh

echo "🚀 Starting AstroPress Template Update..."

# 1. Backup user content
mkdir -p .update-backup
cp -r src/content/blog .update-backup/
cp -r src/content/data .update-backup/
cp -r public .update-backup/

# 2. Update core files
echo "📦 Updating core files..."
rm -rf src/core
rm -rf src/components
rm -rf src/layouts
cp -r template-update/src/core src/
cp -r template-update/src/components src/
cp -r template-update/src/layouts src/

# 3. Smart merge settings
echo "⚙️  Merging configuration files..."
node scripts/merge-settings.js

# 4. Restore user content
echo "💾 Restoring user content..."
cp -r .update-backup/* src/content/

# 5. Update dependencies
echo "📋 Updating dependencies..."
npm install

echo "✅ Update complete!"
```

### Step 4: **AstroPress Dashboard Integration**
```typescript
// Next.js Dashboard Component
const UpdateManager = () => {
  const [updateStatus, setUpdateStatus] = useState('checking');

  const checkForUpdates = async () => {
    const response = await fetch('/api/check-updates', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        repoName: selectedRepo
      })
    });

    const result = await response.json();
    setUpdateStatus(result.hasUpdates ? 'available' : 'current');
  };

  const triggerUpdate = async () => {
    // Trigger GitHub workflow via API
    await fetch('/api/trigger-update', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        repoName: selectedRepo,
        updateType: 'safe-auto'
      })
    });
  };

  return (
    <div className="update-manager">
      {updateStatus === 'available' && (
        <button onClick={triggerUpdate}>
          🔄 Update Template (Safe)
        </button>
      )}
    </div>
  );
};
```

---

## Safety Mechanisms

### 1. **Automatic Backups**
- Create backup branch before any update
- Store user content in `.update-backup/`
- Keep 5 most recent backup branches

### 2. **Rollback System**
```javascript
const rollbackUpdate = async (userId, repoName, backupBranch) => {
  // Restore from backup branch
  await git.checkout(backupBranch);
  await git.merge('main');
  await git.push('origin', 'main');
};
```

### 3. **Update Validation**
```bash
# Post-update validation
npm run build  # Ensure build works
npm run test   # Run any tests
npm run lint   # Check code quality
```

### 4. **User Notification System**
```typescript
// Send update summary to user
const notifyUser = async (userId: string, updateResult: UpdateResult) => {
  await sendEmail(userId, {
    subject: '✅ AstroPress Template Updated',
    template: 'update-success',
    data: {
      filesUpdated: updateResult.filesUpdated,
      newFeatures: updateResult.newFeatures,
      backupBranch: updateResult.backupBranch
    }
  });
};
```

---

## Deployment Strategy

### Phase 1: **Beta Testing** (2 weeks)
- Test with 10 volunteer users
- Manual approval for each update
- Detailed logging and monitoring

### Phase 2: **Gradual Rollout** (4 weeks)
- Auto-updates for "safe" changes only
- Manual approval for complex updates
- 95% success rate target

### Phase 3: **Full Automation** (Ongoing)
- Fully automated safe updates
- Intelligent conflict detection
- Self-healing mechanisms

---

## Emergency Procedures

### If Update Fails:
1. **Automatic rollback** to backup branch
2. **Notify user** with error details
3. **Create support ticket** for manual review
4. **Preserve all user content**

### Manual Override:
```bash
# Emergency rollback command
curl -X POST "https://api.astropress.dev/emergency-rollback" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"repoName": "user-blog", "backupBranch": "backup-1234567890"}'
```

---

## Success Metrics

- **Update Success Rate:** > 95%
- **Zero Content Loss:** 100%
- **User Satisfaction:** > 90%
- **Rollback Time:** < 5 minutes
- **Build Success Post-Update:** > 98%

---

## Technical Implementation Timeline

### Week 1-2: **Core Infrastructure**
- [ ] Version tracking system
- [ ] Update detection API
- [ ] Backup mechanisms

### Week 3-4: **Update Engine**
- [ ] Selective file replacement
- [ ] Smart merge algorithms
- [ ] Validation systems

### Week 5-6: **Dashboard Integration**
- [ ] Update UI components
- [ ] Workflow triggers
- [ ] User notifications

### Week 7-8: **Testing & Deployment**
- [ ] Beta testing with volunteers
- [ ] Security audits
- [ ] Performance optimization

---

*This plan ensures user content is never lost while keeping templates up-to-date with the latest features and security improvements.*