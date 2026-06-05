# 🚀 Vercel Deployment Guide

Complete guide to deploy InterviewAI on Vercel.

---

## Prerequisites

- GitHub account with your repo
- Vercel account (free) - [vercel.com](https://vercel.com)
- All environment variables ready

---

## Step-by-Step Deployment

### 1. **Connect to Vercel**

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository:
   ```
   aryan45sandilya/AI-MOCK-INTERVIEW-PLATFORM-
   ```
4. Click **"Import"**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

---

### 2. **Configure Project Settings**

In the Vercel import screen:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

---

### 3. **Add Environment Variables**

⚠️ **CRITICAL:** Add all environment variables before deploying!

Click **"Environment Variables"** and add:

#### **Database**
```
DATABASE_URL = postgresql://your-neon-db-url
```

#### **Clerk Authentication**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY = sk_live_...
CLERK_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
```

#### **AI APIs**
```
GOOGLE_GENERATIVE_AI_API_KEY = your_gemini_key
OPENAI_API_KEY = sk-...
```

#### **Code Execution (Optional)**
```
RAPIDAPI_KEY = your_rapidapi_key
```

#### **App URLs**
```
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL = https://your-socket-server.com
```

**Note:** Set these for **Production**, **Preview**, and **Development** environments!

---

### 4. **Deploy**

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## Post-Deployment Setup

### 1. **Update Clerk Webhook**

After deployment, update your Clerk webhook URL:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks**
3. Update endpoint URL to:
   ```
   https://your-app.vercel.app/api/webhooks/clerk
   ```
4. Test the webhook

### 2. **Update Environment Variables**

Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL:

```bash
# In Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

Redeploy after updating.

### 3. **Database Migration**

If using Drizzle ORM:

```bash
# Run migrations (one-time setup)
npm run db:push
```

Or connect to your deployed app and run migrations via Vercel CLI:

```bash
vercel env pull .env.local
npm run db:push
```

---

## Custom Domain (Optional)

### Add Your Domain

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `interviewai.com`)
3. Update DNS records as shown by Vercel
4. Update environment variables with new domain

---

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `CLERK_WEBHOOK_SECRET` - Clerk webhook secret
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL
- [ ] All Clerk redirect URLs configured

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Solution: Add all required env vars in Vercel dashboard

**Error: Database connection**
- Solution: Ensure `DATABASE_URL` is correct and database is accessible

**Error: Module not found**
- Solution: Check `package.json` dependencies and run `npm install` locally

### Runtime Errors

**Clerk authentication not working**
- Solution: Verify all Clerk env vars are set
- Check redirect URLs match your Vercel domain

**API routes returning 500**
- Solution: Check Vercel logs (Dashboard → Deployments → Functions)
- Verify all secrets are set correctly

**Database queries failing**
- Solution: Run `npm run db:push` to sync schema
- Check database connection string

---

## Vercel CLI Commands

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# List deployments
vercel ls
```

---

## Automatic Deployments

Vercel automatically deploys:

- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches or pull requests

---

## Performance Optimization

### Enable Edge Functions (Optional)

For faster response times, convert API routes to Edge Functions:

```typescript
export const runtime = 'edge';
```

### Enable Image Optimization

Vercel automatically optimizes images via Next.js Image component.

### Enable Caching

Add caching headers to API routes:

```typescript
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

---

## Monitoring

### View Analytics

1. Go to **Analytics** tab in Vercel dashboard
2. Monitor:
   - Page views
   - Response times
   - Error rates
   - Top pages

### Check Logs

```bash
# Real-time logs
vercel logs --follow

# Or view in dashboard
# Dashboard → Deployments → [Select deployment] → Runtime Logs
```

---

## Cost Considerations

**Vercel Free Tier includes:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Edge Network

**Paid plans needed for:**
- Heavy traffic (>100GB/month)
- Team collaboration
- Advanced analytics
- More function execution time

---

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use environment variables** for all secrets
3. **Enable Vercel's security features:**
   - Automatic HTTPS
   - DDoS protection
   - Secure headers

4. **Rotate API keys** regularly
5. **Monitor usage** in API dashboards (OpenAI, Gemini, Clerk)

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Update README with live demo link
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring and alerts
5. ✅ Share with users! 🎉

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Support:** support@vercel.com

---

<div align="center">
  <strong>🚀 Ready to go live!</strong>
  <br />
  <sub>Built with ❤️ by Aryan Sandilya</sub>
</div>
