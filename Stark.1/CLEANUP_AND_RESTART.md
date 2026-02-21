# 🔧 Cleanup and Restart Instructions

## Problem
Environment variables from `.env.local` are not being loaded by Next.js.

## Solution: Complete Cleanup and Restart

Follow these steps **in order**:

### Step 1: Stop the Development Server
```powershell
# Press Ctrl+C in the terminal running npm run dev
```

### Step 2: Delete Build Cache
```powershell
# Delete .next folder
Remove-Item -Recurse -Force .next

# Delete node_modules cache (if exists)
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### Step 3: Verify .env.local Exists
```powershell
# Check if .env.local exists
Test-Path .env.local
```

**If it returns `False`, create the file:**
```powershell
# Create .env.local with correct content
@"
NEXT_PUBLIC_SUPABASE_URL=https://bjsdagwquuontqgvdtdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### Step 4: Verify .env.local Content
```powershell
# Display .env.local content
Get-Content .env.local
```

**Expected output:**
```
NEXT_PUBLIC_SUPABASE_URL=https://bjsdagwquuontqgvdtdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep
```

### Step 5: Check for Conflicting .env Files
```powershell
# List all .env files
Get-ChildItem -Filter .env* | Select-Object Name
```

**You should only see:**
- `.env.example` (template file - OK)
- `.env.local` (your actual config - REQUIRED)

**Delete any of these if they exist:**
- `.env` (conflicts with .env.local)
- `.env.production` (conflicts with .env.local)
- `.env.development` (conflicts with .env.local)

```powershell
# Remove conflicting files if they exist
Remove-Item .env -ErrorAction SilentlyContinue
Remove-Item .env.production -ErrorAction SilentlyContinue
Remove-Item .env.development -ErrorAction SilentlyContinue
```

### Step 6: Restart Development Server
```powershell
npm run dev
```

### Step 7: Test Environment Variables
Open your browser and go to:
```
http://localhost:3000/test-env
```

This page will show you if the environment variables are loaded correctly.

### Step 8: Check Console Logs
Look at your terminal where `npm run dev` is running. You should see:
```
🔍 [SERVER] Supabase URL: https://bjsdagwquuo...
🔍 [SERVER] Supabase Key: sb_publishable_9JeQ...
```

If you see `❌ UNDEFINED`, the environment variables are not being loaded.

## Troubleshooting

### If variables still show as undefined:

1. **Check file encoding:**
   ```powershell
   # .env.local should be UTF-8
   Get-Content .env.local -Encoding UTF8
   ```

2. **Check for hidden characters:**
   ```powershell
   # Display file with special characters visible
   Get-Content .env.local | Format-Hex
   ```

3. **Recreate .env.local from scratch:**
   ```powershell
   Remove-Item .env.local
   New-Item .env.local -ItemType File
   Add-Content .env.local "NEXT_PUBLIC_SUPABASE_URL=https://bjsdagwquuontqgvdtdx.supabase.co"
   Add-Content .env.local "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep"
   ```

4. **Verify Node.js version:**
   ```powershell
   node --version
   # Should be v18 or higher
   ```

5. **Reinstall dependencies:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

## Why This Happens

Next.js loads environment variables when the server starts. If you:
- Create `.env.local` after starting the server
- Modify `.env.local` while the server is running
- Have conflicting `.env` files

The server won't see the changes until you restart it with a clean build cache.

## Quick Reference Commands

```powershell
# Full cleanup and restart (one-liner)
Remove-Item -Recurse -Force .next; npm run dev

# Check if .env.local exists
Test-Path .env.local

# View .env.local content
Get-Content .env.local

# Test environment variables
# Visit: http://localhost:3000/test-env
```
