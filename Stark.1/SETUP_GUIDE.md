# Quick Setup Guide

Follow these steps to get the Innovation Ecosystem Platform running:

## Step 1: Install Node.js Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Supabase, Tailwind CSS, and shadcn/ui components.

## Step 2: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub or create an account
4. Click "New Project"
5. Fill in:
   - **Name**: Innovation Ecosystem Platform
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your location
6. Click "Create new project" and wait for setup to complete

## Step 3: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click "Run" or press `Ctrl+Enter`
7. You should see "Success. No rows returned"

This creates:
- User profiles table
- Audit logs table
- Row Level Security policies
- Automatic user registration trigger

## Step 4: Get Supabase Credentials

1. In Supabase dashboard, click **Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Add these lines (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 6: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Optionally configure:
   - **Confirm email**: Toggle on/off based on your needs
   - **Email templates**: Customize verification emails

## Step 7: Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 8: Test the Application

### Register a New User

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "Register"
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Role (select Startup, Investor, or IT Company)
4. Click "Create Account"
5. Check your email for verification (if enabled)

### Login

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your role-specific dashboard

### Create Admin User (Optional)

To create an admin user:

1. Register a normal user first
2. Go to Supabase dashboard → **Table Editor** → **profiles**
3. Find your user's row
4. Click on the `role` field
5. Change it from your current role to `admin`
6. Save
7. Log out and log back in
8. You'll now have access to the Admin Dashboard

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` to install all dependencies

### Authentication not working
- Check that your `.env.local` file exists and has correct values
- Verify Supabase URL and anon key are correct
- Make sure Email provider is enabled in Supabase

### Database errors
- Verify you ran the entire `schema.sql` file
- Check Supabase dashboard → **Table Editor** to see if tables exist
- Look at Supabase logs for detailed error messages

### Redirect loops
- Clear browser cookies and local storage
- Check middleware.ts is not modified
- Verify user has a profile in the profiles table

### TypeScript errors in IDE
- These are normal before running `npm install`
- After installing, restart your IDE/editor

## Next Steps

Once everything is running:

1. Explore the different dashboards by creating users with different roles
2. Check the audit logs in Supabase → **Table Editor** → **audit_logs**
3. Review the RLS policies in Supabase → **Authentication** → **Policies**
4. Start building additional features!

## Need Help?

- Check the main README.md for detailed documentation
- Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Review Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
