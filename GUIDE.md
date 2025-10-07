# SecureVault - Complete Setup & Usage Guide

This guide will walk you through everything you need to know to set up, use, and deploy SecureVault.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Using the Application](#using-the-application)
4. [MongoDB Configuration](#mongodb-configuration)
5. [Deployment Guide](#deployment-guide)
6. [Troubleshooting](#troubleshooting)
7. [Development Guide](#development-guide)

---

## Quick Start

### Prerequisites
- Node.js 18 or higher
- A MongoDB database (local or cloud)
- A code editor (VS Code recommended)

### 5-Minute Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env and add your MongoDB URI

# 3. Start development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

---

## Detailed Setup

### Step 1: Install Node.js

**Mac:**
```bash
brew install node
```

**Windows:**
Download from [nodejs.org](https://nodejs.org)

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 8.x or higher
```

### Step 2: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd password-vault

# Install all dependencies
npm install
```

This will install:
- Next.js and React
- MongoDB driver
- JWT and bcrypt for authentication
- UI components (shadcn/ui)
- And all other dependencies

### Step 3: Set Up MongoDB

You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project (name it "password-vault")
4. Click "Build a Database"
5. Choose "FREE" tier (M0 Sandbox)
6. Select a cloud provider and region close to you
7. Click "Create Cluster" (takes 3-5 minutes)
8. Once created, click "Connect"
9. Choose "Connect your application"
10. Copy the connection string
11. It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

#### Option B: Local MongoDB

```bash
# Mac
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download installer from mongodb.com
# Run MongoDB as a service
```

Local connection string: `mongodb://localhost:27017/password-vault`

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-vault?retryWrites=true&w=majority

# JWT Secret (generate a random string, min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

**Important Notes:**

1. **MONGODB_URI**: Replace with your actual connection string
   - Replace `<username>` with your MongoDB username
   - Replace `<password>` with your MongoDB password
   - Don't include `< >` brackets

2. **JWT_SECRET**: Generate a strong random secret
   ```bash
   # Generate random secret on Mac/Linux
   openssl rand -base64 32

   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. **Never commit `.env` to git** - it's already in `.gitignore`

### Step 5: Run the Application

```bash
# Development mode (with hot reload)
npm run dev

# Open your browser
# Navigate to http://localhost:3000
```

You should see the SecureVault login screen!

---

## Using the Application

### First Time Setup

#### 1. Create Your Account

1. Open the app (http://localhost:3000)
2. You'll see the login/signup screen
3. Click "Don't have an account? Sign up"
4. Enter your email and password
5. Password must be at least 8 characters
6. Click "Sign Up"

**Note:** This password is for logging into the app. You'll set a master password next.

#### 2. Set Your Master Password

1. After signup, you'll see "Unlock Your Vault"
2. Enter a **master password** (min. 8 characters)
3. **IMPORTANT**: This password is used to encrypt/decrypt your vault
4. It's never sent to the server
5. **Write it down somewhere safe** - you can't recover it if forgotten

**Master Password vs Login Password:**
- **Login Password**: Stored on server (hashed), authenticates you
- **Master Password**: Never leaves your device, encrypts your data

### Generating Passwords

#### Method 1: Using the Generator Tab

1. After unlocking your vault, click the "Generator" tab
2. Adjust the password length (8-64 characters)
3. Select options:
   - ✓ Uppercase (A-Z)
   - ✓ Lowercase (a-z)
   - ✓ Numbers (0-9)
   - ✓ Symbols (!@#$...)
   - ✓ Exclude similar characters (optional)
4. Click "Generate Password"
5. Click "Use This Password" to save it to your vault
6. Or click the copy icon to copy to clipboard

#### Method 2: Quick Copy

1. Generate a password as above
2. Click the copy icon
3. Password is copied to clipboard
4. **Auto-clears after 15 seconds** for security

### Managing Your Vault

#### Adding a Password

1. Go to "My Vault" tab
2. Click "Add Item" button
3. Fill in the form:
   - **Title*** (required): e.g., "Gmail Account"
   - **Username/Email**: your email or username
   - **Password*** (required): the password to store
   - **Website URL**: https://mail.google.com
   - **Notes**: any additional information
4. Click "Save"
5. Your password is encrypted and stored

#### Viewing Passwords

1. In your vault, you'll see cards for each item
2. Click the eye icon to reveal the password
3. Click again to hide it
4. Click the copy icon to copy to clipboard
5. Clipboard auto-clears after 15 seconds

#### Editing a Password

1. Find the item in your vault
2. Click the edit icon (pencil)
3. Modify any field you want
4. Click "Update"
5. Changes are encrypted and saved

#### Deleting a Password

1. Find the item in your vault
2. Click the delete icon (trash)
3. Confirm the deletion
4. Item is permanently removed

#### Searching Your Vault

1. Use the search bar at the top
2. Type any text to filter items
3. Searches through:
   - Item titles
   - Usernames
   - URLs
4. Results update as you type

### Security Features

#### Copy with Auto-Clear

When you copy a password:
1. It's copied to your clipboard immediately
2. You see a "Copied!" notification
3. After 15 seconds, clipboard is automatically cleared
4. Prevents passwords from lingering in clipboard

#### Show/Hide Passwords

- Passwords are hidden by default (••••••••)
- Click eye icon to reveal
- Click again to hide
- Ensures shoulder-surfing protection

#### Client-Side Encryption

- All encryption happens in your browser
- Server only stores encrypted blobs
- Master password never sent to server
- Even database admins can't see your passwords

### Best Practices

#### Choosing Passwords

1. **Strong Login Password**: Protects your account
   - At least 12 characters
   - Mix of upper, lower, numbers, symbols
   - Unique to this app

2. **Strong Master Password**: Encrypts your vault
   - At least 16 characters
   - Easy to remember but hard to guess
   - Consider a passphrase: "MyDog@teMyH0mew0rk2024!"
   - **NEVER FORGET THIS** - cannot be recovered

#### Using the App

1. **Generate Unique Passwords**: Use the generator for each service
2. **Update Old Passwords**: Replace weak passwords gradually
3. **Regular Backups**: Note important passwords elsewhere too
4. **Logout on Shared Devices**: Always logout when done
5. **Use HTTPS**: Ensure connection is secure

---

## MongoDB Configuration

### Creating a Production Database

#### MongoDB Atlas Setup (Detailed)

1. **Create Cluster**
   - Go to MongoDB Atlas dashboard
   - Click "Create"
   - Choose M0 (free tier) or higher
   - Select region closest to your users
   - Name your cluster

2. **Configure Network Access**
   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - For development: Add "0.0.0.0/0" (allows all)
   - For production: Add your server's IP

3. **Create Database User**
   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and strong password
   - Grant "Read and write to any database" role

4. **Get Connection String**
   - Go to "Database" in sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `test` with `password-vault`

Example: `mongodb+srv://myuser:MyP@ssw0rd@cluster0.abc123.mongodb.net/password-vault?retryWrites=true&w=majority`

### Database Collections

The app automatically creates these collections:

#### users
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$..." // bcrypt hash
  createdAt: ISODate("2025-01-01T00:00:00.000Z")
}
```

#### vault_items
```javascript
{
  _id: ObjectId("..."),
  userId: "user_id_here",
  title: "Gmail Account",
  username: "user@gmail.com",
  url: "https://mail.google.com",
  notes: "Personal email account",
  encrypted: "base64_encrypted_data...",
  iv: "base64_initialization_vector...",
  salt: "uuid-salt-string",
  createdAt: ISODate("2025-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2025-01-01T00:00:00.000Z")
}
```

### Viewing Your Data

In MongoDB Atlas:
1. Go to "Database" → "Browse Collections"
2. You'll see encrypted data in `vault_items`
3. The `encrypted` field contains your encrypted password
4. Even if someone accesses the database, they can't decrypt without your master password

---

## Deployment Guide

### Deploying to Vercel (Recommended)

Vercel is the creator of Next.js and offers the best deployment experience.

#### Prerequisites
- GitHub account
- Vercel account (free: vercel.com)
- Code pushed to GitHub

#### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js
   - Click "Deploy"

3. **Add Environment Variables**
   - In Vercel dashboard, go to your project
   - Click "Settings" → "Environment Variables"
   - Add:
     - `MONGODB_URI`: Your production MongoDB URI
     - `JWT_SECRET`: Your secret (use a new, strong one for production)
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "Redeploy" to apply environment variables

5. **Done!**
   - Your app is live at `your-project.vercel.app`
   - Get a custom domain in Settings

### Deploying to Other Platforms

#### Railway.app

```bash
# Install Railway CLI
npm install -g railway

# Login and initialize
railway login
railway init

# Add environment variables
railway variables set MONGODB_URI="your-uri"
railway variables set JWT_SECRET="your-secret"

# Deploy
railway up
```

#### Render.com

1. Create account at render.com
2. New → Web Service
3. Connect your GitHub repo
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables in dashboard
7. Deploy

#### DigitalOcean App Platform

1. Create account at digitalocean.com
2. Create → Apps → GitHub
3. Select repository
4. Choose Node.js
5. Add environment variables
6. Deploy

### Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] MongoDB allows connections from deployment IP
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] JWT secret is strong and unique
- [ ] Test signup and login
- [ ] Test password generation
- [ ] Test vault operations (add, edit, delete)
- [ ] Monitor for errors in platform logs

---

## Troubleshooting

### Common Issues

#### "Failed to connect to MongoDB"

**Cause**: MongoDB connection string is incorrect or database is unreachable

**Solutions**:
1. Check `MONGODB_URI` in `.env`
2. Ensure username/password are correct
3. Check if IP is whitelisted in MongoDB Atlas
4. For local MongoDB, ensure it's running: `mongod --version`
5. Test connection with MongoDB Compass

#### "Invalid token" / "Not authenticated"

**Cause**: JWT issues or cookie problems

**Solutions**:
1. Clear browser cookies for localhost:3000
2. Check `JWT_SECRET` is set in `.env`
3. Try logging out and back in
4. Check browser console for errors
5. If using Chrome, check "Application" → "Cookies"

#### "Decryption failed"

**Cause**: Wrong master password or corrupted data

**Solutions**:
1. Double-check your master password
2. Try re-entering it carefully
3. If recently changed master password, old items won't decrypt
4. Check browser console for detailed error
5. As last resort, delete vault items and start fresh

#### Build Errors

**"Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"Module not found: Can't resolve '@/components/...'"**
```bash
# Check tsconfig.json has correct paths
# Restart dev server
npm run dev
```

#### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find and kill the process
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
PORT=3001 npm run dev
```

### Debug Mode

Enable detailed logging:

1. Open browser DevTools (F12)
2. Go to Console tab
3. All errors will be logged here
4. Take screenshot for troubleshooting

For server-side errors:
- Check terminal where `npm run dev` is running
- Errors will appear there
- Look for stack traces

### Getting Help

If you're stuck:

1. Check this guide thoroughly
2. Review README.md for quick reference
3. Check ARCHITECTURE.md for technical details
4. Search existing GitHub issues
5. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Screenshots
   - Environment (OS, Node version, etc.)

---

## Development Guide

### Project Structure

```
password-vault/
├── app/                  # Next.js 13 app directory
│   ├── api/             # API routes (backend)
│   ├── globals.css      # Global styles
│   ├── layout.js        # Root layout
│   └── page.js          # Main page
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── *.js            # Custom components
├── lib/                # Utility functions
│   ├── auth.js         # JWT utilities
│   ├── crypto.js       # Encryption utilities
│   ├── mongodb.js      # Database connection
│   └── utils.ts        # Helper functions
├── public/             # Static assets
├── .env                # Environment variables (DO NOT COMMIT)
├── package.json        # Dependencies
└── next.config.js      # Next.js configuration
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run typecheck   # Check TypeScript types

# Utilities
npm install <package>  # Add new dependency
```

### Adding New Features

#### 1. Add a New API Endpoint

Create file in `app/api/your-endpoint/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  // Get auth token
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  // Verify auth
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
  const client = await clientPromise;
  const db = client.db('password-vault');

  // Query database
  const data = await db.collection('your_collection').find({}).toArray();

  return NextResponse.json({ data });
}
```

#### 2. Add a New Component

Create file in `components/YourComponent.js`:

```javascript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function YourComponent({ prop1, prop2 }) {
  const [state, setState] = useState('');

  const handleClick = () => {
    // Your logic
  };

  return (
    <div>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}
```

#### 3. Add a New Database Collection

In your API route:

```javascript
const client = await clientPromise;
const db = client.db('password-vault');
const collection = db.collection('your_new_collection');

// Create index for performance
await collection.createIndex({ userId: 1 });

// Insert document
await collection.insertOne({
  userId: userId,
  data: data,
  createdAt: new Date()
});
```

### Coding Standards

1. **Use JavaScript** (not TypeScript) for new files
2. **Use 'use client'** directive for components with hooks
3. **Handle errors** with try-catch and proper responses
4. **Validate input** before processing
5. **Use environment variables** for secrets
6. **Comment complex logic** (but code should be self-explanatory)
7. **Test thoroughly** before committing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add feature: description"

# Push to GitHub
git push origin feature/your-feature

# Create pull request on GitHub
# Merge after review
```

### Environment Variables

Add new variables in two places:

1. `.env` (local development)
   ```env
   NEW_VARIABLE=value
   ```

2. Deployment platform (Vercel, etc.)
   - Settings → Environment Variables
   - Add the same variable

Access in code:
```javascript
const value = process.env.NEW_VARIABLE;
```

---

## Performance Tips

### Optimizations

1. **Use MongoDB Indexes**
   ```javascript
   db.collection('vault_items').createIndex({ userId: 1, createdAt: -1 });
   ```

2. **Limit Queries**
   ```javascript
   const items = await collection.find({}).limit(100).toArray();
   ```

3. **Cache Decrypted Data**
   - Store in component state
   - Only decrypt once per unlock

4. **Lazy Load Components**
   ```javascript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

### Monitoring

In production, add monitoring:

1. **Vercel Analytics** (free)
   - Automatic with Vercel deployment
   - View in Vercel dashboard

2. **MongoDB Atlas Monitoring**
   - View in Atlas dashboard
   - Check query performance
   - Monitor connections

3. **Error Tracking**
   - Consider Sentry for error tracking
   - Log errors to console
   - Monitor server logs

---

## Security Considerations

### What You Should Do

1. **Strong Master Password**: 16+ characters
2. **Unique Passwords**: Never reuse passwords
3. **Regular Updates**: Keep dependencies updated
4. **HTTPS Only**: Never use over HTTP
5. **Logout Habit**: Always logout on shared devices
6. **Backup Important Passwords**: Don't rely only on this app

### What You Shouldn't Do

1. **Share Master Password**: Never tell anyone
2. **Write Master Password in App**: Don't store in a note
3. **Use Weak Passwords**: Generator exists for a reason
4. **Use Public WiFi**: Or use VPN if necessary
5. **Ignore Updates**: Keep the app updated

### For Developers

1. **Never Log Secrets**: No console.log for passwords
2. **Validate All Input**: Prevent injection attacks
3. **Use Parameterized Queries**: Already done with MongoDB driver
4. **Keep Dependencies Updated**: Run `npm audit` regularly
5. **Use Environment Variables**: Never hardcode secrets
6. **Review Code**: Double-check security-sensitive changes

---

## FAQ

**Q: What if I forget my master password?**
A: Unfortunately, it cannot be recovered. That's the trade-off for security. You'll need to delete all vault items and start fresh.

**Q: Can I change my master password?**
A: Currently no. This would require re-encrypting all items. Feature planned for future.

**Q: Is this production-ready?**
A: Yes for personal use. For business use, consider additional features like 2FA, audit logs, and professional security audit.

**Q: Can I use this offline?**
A: No, it requires internet connection to sync with MongoDB. Offline mode is planned for future.

**Q: How secure is this really?**
A: Very secure. Uses industry-standard AES-GCM encryption. However, security also depends on your master password strength and general security practices.

**Q: Can I export my passwords?**
A: Not yet. Export/import feature is planned for future updates.

**Q: Does this work on mobile?**
A: Yes! The UI is responsive. Open in your mobile browser. Native apps planned for future.

**Q: Can I share passwords with others?**
A: Not yet. Shared vaults feature is planned for future.

---

## Conclusion

You now have everything you need to use SecureVault! Remember:

1. **Keep master password safe** - write it down somewhere secure
2. **Generate unique passwords** - use the generator
3. **Logout on shared devices** - protect your account
4. **Keep the app updated** - security and features

Enjoy secure password management!

---

**Need Help?**
- 📖 Check README.md for quick reference
- 🏗️ See ARCHITECTURE.md for technical details
- 🐛 Report bugs on GitHub
- 💡 Suggest features via issues

**Stay Secure!** 🔒
