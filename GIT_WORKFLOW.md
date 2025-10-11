# Git Workflow for BugDex Team

## 🌿 Branch Structure

### Main Branches
- `main` - Production-ready code, always deployable
- `backend/contracts` - Smart contracts and blockchain logic
- `frontend/ui` - Frontend components and pages (for your partner)

### Feature Branches (optional)
- `backend/api-routes` - API endpoints
- `backend/ipfs` - IPFS/Lighthouse integration
- `frontend/camera` - Camera capture feature
- `frontend/wallet` - Web3 wallet integration

---

## 👥 Team Workflow

### Backend Developer (You)
```bash
# Always work on backend branch
git checkout backend/contracts

# Make changes, then:
git add .
git commit -m "feat: description"
git push origin backend/contracts

# When ready to merge to main:
# Create a Pull Request on GitHub
```

### Frontend Developer (Partner)
```bash
# Create and work on frontend branch
git checkout -b frontend/ui

# Make changes, then:
git add .
git commit -m "feat: description"
git push origin frontend/ui

# When ready to merge to main:
# Create a Pull Request on GitHub
```

---

## 🔄 Syncing Changes

### Backend needs latest frontend changes:
```bash
git checkout backend/contracts
git pull origin main
```

### Frontend needs latest backend changes:
```bash
git checkout frontend/ui
git pull origin main
```

---

## ✅ Merging to Main

1. **Create Pull Request** on GitHub
2. **Review each other's code** (optional but recommended)
3. **Merge** when tests pass and features work
4. **Both pull latest main**:
   ```bash
   git checkout main
   git pull origin main
   ```

---

## 📋 Current Status

- ✅ **backend/contracts** - Smart contracts complete (you)
- ⏳ **frontend/ui** - Web app UI (partner should create this)
- 🎯 **main** - Base project structure

---

## 🚀 Next Steps for Your Partner

```bash
# 1. Pull latest code
git pull origin main

# 2. Create frontend branch
git checkout -b frontend/ui

# 3. Work on frontend in apps/web
cd apps/web
pnpm dev

# 4. Commit and push
git add apps/web
git commit -m "feat: add camera capture UI"
git push origin frontend/ui
```

---

## 🔐 Protected Workflow

**Best Practice**: Don't push directly to `main`. Always use Pull Requests!

This way:
- You can review each other's code
- Avoid merge conflicts
- Keep main stable
- Track who changed what

---

## 📝 Commit Message Format

Use semantic commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

**Examples**:
```bash
git commit -m "feat: add BUG token faucet"
git commit -m "fix: resolve voting contract bug"
git commit -m "docs: update README with deployment steps"
```
