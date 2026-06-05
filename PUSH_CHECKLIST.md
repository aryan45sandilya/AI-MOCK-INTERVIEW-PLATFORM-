# 📋 GitHub Push Checklist

Before pushing your code to GitHub, ensure you follow these steps:

---

## ✅ Pre-Push Checklist

### 1. **Environment Variables**
- [ ] Ensure `.env.local` and `.env` are in `.gitignore`
- [ ] Never commit API keys or secrets
- [ ] Update `.env.example` with all required variables (without actual values)

### 2. **Sensitive Files to NEVER Push**
- [ ] `.env.local`
- [ ] `.env`
- [ ] Any files containing API keys
- [ ] Database credentials
- [ ] `node_modules/`
- [ ] `.next/` build folder
- [ ] User uploads (`public/uploads/`)

### 3. **Files to Always Include**
- [ ] `README.md` (with setup instructions)
- [ ] `.env.example` (template for environment variables)
- [ ] `.gitignore` (properly configured)
- [ ] `package.json` & `package-lock.json`
- [ ] All source code (`app/`, `components/`, `lib/`, etc.)
- [ ] Configuration files (`next.config.ts`, `tailwind.config.ts`, `tsconfig.json`)
- [ ] Docker files (`Dockerfile`, `docker-compose.yml`)
- [ ] Database config (`drizzle.config.ts`)

### 4. **Build & Test Before Push**
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Try building the project
npm run build
```

### 5. **Clean Unnecessary Files**
```bash
# Remove build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Ensure no sensitive logs
rm -f *.log
```

---

## 🚀 Git Commands

```bash
# Check current status
git status

# Add only necessary files (be selective!)
git add .

# Review what you're about to commit
git diff --cached

# Commit with a meaningful message
git commit -m "feat: Add AI-powered interview platform"

# Push to GitHub
git push origin main
```

---

## ⚠️ Important Notes

1. **Never push**:
   - API keys (OpenAI, Gemini, Clerk, RapidAPI)
   - Database URLs with credentials
   - Webhook secrets
   - User uploaded files
   - Build artifacts

2. **Repository Size**:
   - Ensure `node_modules/` is ignored (saves ~500MB)
   - Don't commit `.next/` folder
   - Ignore user uploads

3. **Security**:
   - Review all files before committing
   - Use GitHub secret scanning
   - Enable branch protection rules

---

## 📊 What Gets Pushed vs Ignored

### ✅ **PUSH** (Tracked by Git)
```
├── app/                    # Application code
├── components/             # React components
├── lib/                    # Utilities
├── server/                 # Express server
├── types/                  # TypeScript types
├── public/                 # Public assets (except uploads/)
├── .env.example            # Template only
├── .gitignore
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── SETUP.md
└── LICENSE
```

### ❌ **IGNORE** (Not tracked by Git)
```
├── node_modules/           # 500MB+ of dependencies
├── .next/                  # Build output
├── .env                    # SECRETS!
├── .env.local              # SECRETS!
├── .env*.local             # SECRETS!
├── public/uploads/         # User files
├── lib/db/migrations/      # Generated files
├── *.log                   # Log files
├── .DS_Store               # OS files
└── .vscode/                # Editor settings
```

---

## 🔐 After First Push

1. **Add Repository Secrets** (GitHub Settings → Secrets):
   - `DATABASE_URL`
   - `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - etc.

2. **Set up CI/CD** (optional):
   - GitHub Actions for automated testing
   - Vercel deployment

3. **Update README**:
   - Add live demo link
   - Add screenshots
   - Update repository URL

---

## ✨ Quick Verification

Before pushing, run this command to check what will be committed:

```bash
git status --ignored
```

This shows both tracked and ignored files. Make sure no `.env` files or secrets are tracked!

---

**Ready to push? Double-check everything above, then push with confidence! 🚀**
