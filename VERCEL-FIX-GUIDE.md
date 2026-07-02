# Vercel 404 Fix - Step by Step

## What Went Wrong

From your screenshot, I can see two problems:

1. **"Add files via upload"** - You manually uploaded files to Vercel. This doesn't work for React/Vite projects because Vercel needs to BUILD the code first (compile TypeScript, bundle JavaScript, etc.). You must push code via GitHub so Vercel can run the build process.

2. **Missing SPA configuration** - Your website is a Single Page Application (SPA). When someone visits `/inventory`, Vercel looks for a file called `inventory.html` which doesn't exist. All routes must be redirected to `index.html`.

## The Fix (3 Steps)

---

### Step 1: Push Code to GitHub Properly (NOT Upload)

**You must use the Terminal/Command Line. Do NOT drag-and-drop files into Vercel.**

Open Terminal (Mac) or Command Prompt (Windows) and run these commands one by one:

```bash
# 1. Go to your project folder
cd ~/Desktop/apexmotors

# 2. Make sure you're on the main branch
git checkout main

# 3. Add all files including the new vercel.json
git add .

# 4. Commit
git commit -m "Add vercel config for SPA routing"

# 5. Push to GitHub
git push origin main
```

**If you don't have the project on your computer yet**, first clone it:

```bash
# Download the project from GitHub
cd ~/Desktop
git clone https://github.com/cargroup-cyber/apexmotors.git
cd apexmotors
```

Then copy your website files into this folder and push:

```bash
# After copying your files into the folder:
git add .
git commit -m "Update website files"
git push origin main
```

---

### Step 2: Fix Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Click on your **apexmotors** project
3. Click **Settings** tab at the top
4. Click **General** on the left
5. Under **Build & Development Settings**, make sure these are set:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

If any of these are blank or different, click the override toggle and enter the correct value.

6. Click **Save**

---

### Step 3: Redeploy

1. In Vercel, go to the **Deployments** tab
2. Click the **Redeploy** button (or push new code to trigger auto-deploy)
3. Wait for the build to complete (should show green checkmark)
4. Click **Visit** to see your live site

---

## What Changed (The `vercel.json` file)

I created a `vercel.json` file in your project that tells Vercel:

- **Build the project** using `npm run build` (compiles your React code)
- **Serve files from the `dist/` folder** (where built files go)
- **Redirect ALL routes to `index.html`** (so `/inventory`, `/vehicle/123`, etc. all work)
- **Cache images** for better performance

This is what fixes the 404 error.

---

## Important Rules

1. **Never use "Upload" in Vercel** - Always push via Git
2. **Always wait for the build to complete** - Look for the green checkmark in Vercel
3. **Check the build logs** - If it fails, click "Logs" to see the error message
4. **Make sure `vercel.json` is in your GitHub repo** - It must be at the root of the project

---

## If It Still Doesn't Work

Check these common issues:

**Problem: "No package.json found"**
- Your `package.json` must be in the ROOT folder of your GitHub repo
- Not inside a subfolder

**Problem: "Build failed"**
- Click the **Logs** button in Vercel to see the exact error
- Common fix: delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem: "Page not found" after build succeeds**
- Make sure `vercel.json` was pushed to GitHub
- Check that the `dist/` folder exists after build

---

## Your Current Vercel URLs

After the fix, your website will be available at:
- `https://apexmotors-git-main-cargroup-6479s-projects.vercel.app`

And after you connect your custom domain:
- `https://yourdomain.com`

---

## Quick Checklist

- [ ] Project pushed to GitHub (not uploaded)
- [ ] `vercel.json` is in the root folder
- [ ] Vercel Framework Preset = "Vite"
- [ ] Vercel Build Command = `npm run build`
- [ ] Vercel Output Directory = `dist`
- [ ] Build shows green checkmark (not red X)
- [ ] Website loads without 404 error
