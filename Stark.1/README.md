# Innovation Ecosystem Platform

A national Innovation Ecosystem Platform built for a hackathon, connecting startups, investors, and IT companies.

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend/Database**: Supabase
- **Authentication**: Supabase Auth
- **Language**: TypeScript

## Features

### Phase 1: Project Initialization, Security, and RBAC ✅

- ✅ Next.js project with TypeScript and Tailwind CSS
- ✅ Supabase integration with Row Level Security (RLS)
- ✅ Role-Based Access Control (RBAC)
- ✅ Secure authentication (login/registration)
- ✅ Audit logging system
- ✅ Role-specific dashboards (Admin, Startup, Investor, IT Company)

## Project Structure

```
innovation-ecosystem/
├── app/
│   ├── dashboard/
│   │   ├── admin/          # Admin dashboard
│   │   ├── startup/        # Startup dashboard
│   │   ├── investor/       # Investor dashboard
│   │   ├── it-company/     # IT Company dashboard
│   │   └── layout.tsx      # Dashboard layout with auth
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase client configs
│   ├── types/              # TypeScript type definitions
│   ├── audit.ts            # Audit logging utilities
│   └── utils.ts            # Utility functions
├── supabase/
│   └── schema.sql          # Database schema with RLS
└── middleware.ts           # RBAC middleware
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and execute it in the SQL Editor

This will create:
- `profiles` table with user roles
- `audit_logs` table for tracking actions
- Row Level Security (RLS) policies
- Automatic triggers for user registration

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under **API**.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

#### `profiles`
- `id` (UUID, references auth.users)
- `role` (enum: 'admin', 'startup', 'investor', 'it_company')
- `full_name` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `audit_logs`
- `id` (UUID)
- `user_id` (UUID, references auth.users)
- `action` (TEXT)
- `details` (JSONB)
- `ip_address` (INET)
- `created_at` (TIMESTAMPTZ)

### Row Level Security (RLS) Policies

**Profiles Table:**
- Users can view and update their own profile
- Admins can view, update, and delete all profiles

**Audit Logs Table:**
- Users can view their own audit logs
- System can insert audit logs
- Admins can view and delete all audit logs

## User Roles

### 1. Admin
- Full access to all platform features
- View all users and statistics
- Manage user profiles
- Access to audit logs

### 2. Startup
- Create and manage startup profile
- Connect with investors
- Browse IT companies for partnerships
- Track profile views and connections

### 3. Investor
- Browse startups
- View investment opportunities
- Manage portfolio
- Track startup interactions

### 4. IT Company
- Showcase technology solutions
- Browse startups for partnerships
- Manage service offerings
- Track leads and projects

## Authentication Flow

1. **Registration**: Users register with email, password, full name, and role selection
2. **Email Verification**: Supabase sends verification email (configure in Supabase Auth settings)
3. **Login**: Users authenticate with email and password
4. **Audit Logging**: Login action is automatically logged
5. **Role-Based Redirect**: Users are redirected to their role-specific dashboard
6. **Protected Routes**: Middleware ensures users can only access their authorized routes

## Middleware & RBAC

The `middleware.ts` file implements:
- Authentication checks for `/dashboard/*` routes
- Role-based redirects to appropriate dashboards
- Prevention of unauthorized access to other role dashboards
- Automatic redirect to dashboard if already authenticated

## Audit Logging

The platform logs important user actions:
- User registration
- User login
- (Future: Profile updates, connections, etc.)

Access audit logs via the `logAction()` utility:

```typescript
import { logAction } from '@/lib/audit'

await logAction({
  user_id: user.id,
  action: 'action_name',
  details: { key: 'value' },
  ip_address: '127.0.0.1' // optional
})
```

## Development Notes

### TypeScript Errors
All TypeScript errors shown in the IDE are due to missing `node_modules`. Run `npm install` to resolve them.

### Supabase Configuration
Make sure to:
1. Enable Email Auth in Supabase Dashboard → Authentication → Providers
2. Configure email templates if needed
3. Set up redirect URLs for production deployment

### Adding New Roles
To add new roles:
1. Update the `user_role` enum in `supabase/schema.sql`
2. Update `UserRole` type in `lib/types/database.types.ts`
3. Add role-based routing in `middleware.ts`
4. Create new dashboard page in `app/dashboard/[role]/page.tsx`

## Next Steps (Future Phases)

- [ ] User profile management
- [ ] Startup listing and discovery
- [ ] Investor matching algorithm
- [ ] IT company service catalog
- [ ] Messaging system
- [ ] Event management
- [ ] Analytics dashboard
- [ ] File uploads (pitch decks, documents)
- [ ] Advanced search and filtering

## Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Secure authentication with Supabase Auth
- ✅ Role-Based Access Control (RBAC)
- ✅ Audit logging for compliance
- ✅ Protected API routes
- ✅ Middleware-based route protection
- ✅ Environment variable security

## Contributing

This is a hackathon project. Feel free to extend and improve!

## License

MIT License - feel free to use this for your hackathon or project.
