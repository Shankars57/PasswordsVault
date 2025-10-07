# SecureVault - Password Manager with Client-Side Encryption

A modern, secure password manager built with Next.js that keeps your passwords safe using client-side encryption. Your master password never leaves your device, and all encryption/decryption happens in your browser.

## Features

- **Strong Password Generator**: Create secure passwords with customizable options

  - Adjustable length (8-64 characters)
  - Include/exclude uppercase, lowercase, numbers, symbols
  - Exclude similar-looking characters option

- **Secure Vault**: Store your passwords safely

  - Client-side AES-GCM encryption
  - Store title, username, password, URL, and notes
  - Search and filter functionality
  - Copy to clipboard with auto-clear after 15 seconds

- **Privacy-First Design**

  - Master password is never sent to the server
  - All encryption/decryption happens locally in your browser
  - Server only stores encrypted data

- **User Experience**
  - Clean, modern UI with shadcn/ui components
  - Dark mode support
  - Responsive design
  - Fast and intuitive

## Tech Stack

- **Frontend**: Next.js 13, React 18
- **Database**: MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **Encryption**: Web Crypto API (AES-GCM, PBKDF2)
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Styling**: Tailwind CSS with dark mode support

## Security

### Client-Side Encryption

The app uses the Web Crypto API to implement strong encryption:

- **Algorithm**: AES-GCM (256-bit)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Unique random salt per item
- **IV**: Random 12-byte initialization vector per encryption

**Why this approach?**

- AES-GCM provides authenticated encryption, ensuring data integrity
- PBKDF2 with high iteration count protects against brute force attacks
- Unique salts and IVs prevent pattern analysis
- All encryption happens client-side - the server never sees plaintext passwords

### Data Flow

1. **Signup/Login**: User credentials hashed with bcrypt, JWT token issued
2. **Unlock Vault**: User enters master password (stored only in memory)
3. **Save Password**: Data encrypted client-side, encrypted blob sent to server
4. **Load Passwords**: Encrypted blobs fetched, decrypted client-side with master password
5. **Copy Password**: Clipboard cleared after 15 seconds

## Installation & Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd password-vault
npm install
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-vault?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

**Important**:

- Replace `MONGODB_URI` with your actual MongoDB connection string
- Generate a strong random `JWT_SECRET` (minimum 32 characters)
- Never commit the `.env` file to version control

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Build for Production

```bash
npm run build
npm start
```

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account with your email and password
2. **Set Master Password**: Create a strong master password (this is used for encryption)
3. **Start Adding Passwords**: Use the password generator or add your existing passwords

### Generating Passwords

1. Go to the "Generator" tab
2. Adjust the length slider (8-64 characters)
3. Select options (uppercase, lowercase, numbers, symbols)
4. Click "Generate Password"
5. Click "Use This Password" to save it to your vault, or copy it

### Managing Vault Items

- **Add**: Click "Add Item" button, fill in details, save
- **Search**: Use the search bar to filter items by title, username, or URL
- **View**: Click the eye icon to reveal the password
- **Copy**: Click the copy icon to copy password to clipboard (auto-clears after 15s)
- **Edit**: Click the edit icon to modify an item
- **Delete**: Click the trash icon to remove an item

### Security Best Practices

1. **Master Password**: Choose a strong, unique master password you'll remember
2. **Never Share**: Never share your master password with anyone
3. **Regular Backups**: Periodically backup your important passwords elsewhere
4. **Unique Passwords**: Use the generator to create unique passwords for each service
5. **Logout**: Always logout when using shared devices

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string and update your `.env` file

### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod --dbpath /path/to/data
   ```
3. Update `.env` with local connection:
   ```env
   MONGODB_URI=mongodb://localhost:27017/password-vault
   ```

## Sample Data of users and Vault

## users

```
_id: 68e4eed52a57af4ce4df4d09
email: "shankarpubg4@gmail.com"
password: "$2b$10$MJo./8nUJ9sSZukR62ouNueAcg.0mN7ByBPeL38XIQ7oYVI/4LwPa"
createdAt: 2025-10-07T10:43:33.658+00:00

_id: 68e4f38bd717548aa8e70a93
email: "bonamgshankar@gmail.com"
password: "$2b$10$8qlWEFzUdLfgNrW4QYLmuuBJUlqcWFB0yWdCn679zRxoxJNAflvHW"
createdAt: 2025-10-07T11:03:39.287+00:00


```

## vault

```

_id: 68e4ef022a57af4ce4df4d0a
userId: "68e4eed52a57af4ce4df4d09"
title: "Sample "
username: "shankarpubg4@gmail.com"
url: "http://example.com"
notes: "Please save it bro"
encrypted: "tUTHqJAfHAOGLGcVPILYzPxyZeWlJooLjqIacX0daD4fSf4Z5GdsMztiUsaXPyk="
iv: "wh0dr/XWRe/w8VTk"
salt: "d74098ce-74b3-4da9-a5c2-3df74958dc0a"
createdAt: 2025-10-07T10:44:18.389+00:00
updatedAt: 2025-10-07T10:44:18.389+00:00

```

## Project Structure

```
password-vault/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   │   ├── signup/     # User registration
│   │   │   ├── login/      # User login
│   │   │   ├── logout/     # User logout
│   │   │   └── me/         # Get current user
│   │   └── vault/          # Vault CRUD endpoints
│   │       ├── route.js    # GET all, POST new
│   │       └── [id]/       # PUT update, DELETE item
│   ├── layout.js           # Root layout with providers
│   ├── page.js             # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── AuthForm.js         # Login/Signup form
│   ├── PasswordGenerator.js # Password generator
│   ├── VaultItem.js        # Individual vault item card
│   ├── VaultItemDialog.js  # Add/Edit vault item modal
│   └── theme-provider.js   # Dark mode provider
├── lib/
│   ├── mongodb.js          # MongoDB connection
│   ├── auth.js             # JWT & auth utilities
│   ├── crypto.js           # Client-side encryption
│   └── utils.ts            # Helper utilities
└── .env                    # Environment variables
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Vault

- `GET /api/vault` - Get all vault items for current user
- `POST /api/vault` - Create new vault item
- `PUT /api/vault/[id]` - Update vault item
- `DELETE /api/vault/[id]` - Delete vault item

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Other Platforms

The app can be deployed to any platform that supports Node.js:

- Railway
- Render
- DigitalOcean App Platform
- AWS, Google Cloud, Azure

Make sure to:

- Set environment variables
- Use production MongoDB instance
- Generate strong JWT secret

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run typecheck # Type check TypeScript files
```

### Adding New Features

1. Database changes: Update MongoDB queries in `/app/api`
2. UI changes: Modify components in `/components`
3. Encryption logic: Update `/lib/crypto.js`

## Troubleshooting

### Common Issues

**"Failed to connect to MongoDB"**

- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- Check network/firewall settings

**"Invalid token"**

- JWT secret might have changed
- Clear cookies and login again
- Check `JWT_SECRET` in `.env`

**"Decryption failed"**

- Master password is incorrect
- Data might be corrupted
- Check browser console for errors

**Build Errors**

- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild
- Check Node.js version (18+ required)

## Security Considerations

### What We Store

- **Database**: Email (hashed), encrypted vault items, salts, IVs
- **Cookies**: HTTP-only JWT token
- **Browser Memory**: Master password (cleared on logout)

### What We Don't Store

- Master password (never sent to server)
- Plaintext passwords
- Decrypted data on server

### Limitations

- Master password cannot be recovered if forgotten
- No password sharing features (yet)
- Single device sync (can be extended)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:

- Open an issue on GitHub
- Check existing documentation
- Review the code comments

## Future Enhancements

- [ ] Two-Factor Authentication (2FA/TOTP)
- [ ] Password strength meter
- [ ] Folders/tags for organization
- [ ] Export/import encrypted backup
- [ ] Password history
- [ ] Breach detection
- [ ] Browser extension
- [ ] Mobile apps

---

**Remember**: Your security is your responsibility. Always use strong, unique passwords and keep your master password safe!
