# Team Authentication Setup Guide

## 🎯 Objective
Remove mock authentication and set up proper Supabase authentication for your 3-person team collaboration.

## 🔧 Current Status
- ✅ Supabase configured with real credentials
- ✅ Removed mock authentication from ProtectedRoute
- ✅ Improved configuration validation in supabaseClient
- ❌ Need to create test user accounts in database

## 🚀 Steps to Complete Setup

### 1. Create Test Users in Supabase

Run one of these SQL scripts in your Supabase SQL Editor:

**Option A: Complete user creation (if auth.users table is empty)**
```
File: create-test-users.sql
```

**Option B: Profile-only creation (if auth.users already exist)**
```
File: create-test-profiles.sql
```

### 2. Test User Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `board_lmuller` | `Suasenha7` | Editor | Full access (create/edit/delete cards) |
| `viewer_john` | `ViewerPass123!` | Viewer | Read-only access |
| `admin_sarah` | `AdminPass123!` | Admin | Full access + admin features |

### 3. Verify Authentication Works

1. Open your app at `http://localhost:3001`
2. Try logging in with `board_lmuller` / `Suasenha7`
3. Check browser console for "✅ Using real Supabase authentication" message
4. Test logout functionality

### 4. Team Collaboration Workflow

Each team member should:
1. Use their assigned credentials
2. Login with their specific username/password
3. Work on cards simultaneously (real-time collaboration)
4. Logout properly when switching users

## 🔍 Troubleshooting

### If login still doesn't work:

1. **Check browser console** for authentication messages
2. **Verify Supabase connection** - look for the green checkmark message
3. **Clear browser storage** - localStorage and sessionStorage
4. **Restart development server** - stop and run `npm run dev` again

### Common Issues:

**Issue**: Still getting mock authentication
**Solution**: Check that `.env` file has correct Supabase credentials and restart server

**Issue**: Cannot logout
**Solution**: Use the force-logout.html page or browser console method

**Issue**: Wrong password errors
**Solution**: Verify you're using the correct credentials from the table above

## 🛡️ Security Notes

- Passwords are securely hashed in the database
- Each user has appropriate role-based access
- Session management handled by Supabase
- Row Level Security (RLS) policies protect data

## 📋 Next Steps

1. Run the SQL script to create users
2. Test login/logout functionality
3. Verify all team members can access with their credentials
4. Start collaborative work on cards

The system is now ready for proper team collaboration without mock authentication!