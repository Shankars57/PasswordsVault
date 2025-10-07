# SecureVault - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)
8. [Client-Side Encryption](#client-side-encryption)
9. [Authentication Flow](#authentication-flow)
10. [Component Architecture](#component-architecture)

---

## Overview

SecureVault is a privacy-first password manager built with Next.js that implements client-side encryption. The core principle is that the server never has access to plaintext passwords - all encryption and decryption happens in the user's browser using their master password.

### Key Principles

1. **Zero-Knowledge Architecture**: Server never sees plaintext data
2. **Client-Side Encryption**: All crypto operations in browser
3. **Secure by Default**: Industry-standard encryption algorithms
4. **Privacy-First**: Minimal data collection and storage

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    React/Next.js                      │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │ Auth Form  │  │   Password   │  │    Vault    │  │  │
│  │  │ Component  │  │  Generator   │  │  Dashboard  │  │  │
│  │  └────────────┘  └──────────────┘  └─────────────┘  │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │              Client-Side Crypto Layer                 │  │
│  │  (Web Crypto API - AES-GCM, PBKDF2)                  │  │
│  └───────────────────────┬──────────────────────────────┘  │
└────────────────────────┬─┴──────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼───────────────────────────────────┐
│                    Next.js API Routes                       │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │   Auth     │  │   Vault    │  │   JWT Middleware     │ │
│  │ Endpoints  │  │ Endpoints  │  │                      │ │
│  └────────────┘  └────────────┘  └──────────────────────┘ │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │
┌────────────────────────▼───────────────────────────────────┐
│                     MongoDB Database                        │
│  ┌─────────────────┐      ┌─────────────────────────────┐ │
│  │  users          │      │  vault_items                │ │
│  │  - email        │      │  - encrypted data blobs     │ │
│  │  - password     │      │  - salt, IV                 │ │
│  │    (hashed)     │      │  - metadata                 │ │
│  └─────────────────┘      └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **Theme**: next-themes (dark mode support)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Database Driver**: MongoDB Node.js Driver

### Security
- **Encryption**: Web Crypto API
  - AES-GCM (256-bit)
  - PBKDF2 (100,000 iterations)
- **Transport**: HTTPS (production)
- **Cookies**: HTTP-only, Secure, SameSite

---

## Data Flow

### 1. User Registration Flow

```
User Input (Email + Password)
         ↓
Client: Send to /api/auth/signup
         ↓
Server: Hash password with bcrypt (10 rounds)
         ↓
Server: Store user in MongoDB
         ↓
Server: Generate JWT token
         ↓
Server: Set HTTP-only cookie
         ↓
Client: Redirect to unlock screen
```

### 2. Vault Unlock Flow

```
User Input (Master Password)
         ↓
Client: Store master password in memory only
         ↓
Client: Fetch encrypted items from /api/vault
         ↓
Server: Return encrypted blobs (encrypted, IV, salt)
         ↓
Client: For each item:
  - Derive key from master password + salt
  - Decrypt with AES-GCM using IV
  - Store decrypted data in component state
         ↓
Client: Display decrypted data
```

### 3. Save Password Flow

```
User Input (Title, Username, Password, URL, Notes)
         ↓
Client: Generate random salt & IV
         ↓
Client: Derive key from master password + salt (PBKDF2)
         ↓
Client: Encrypt password with AES-GCM
         ↓
Client: Send to /api/vault
  - title, username, url, notes (plaintext metadata)
  - encrypted, IV, salt (encrypted password)
         ↓
Server: Verify JWT token
         ↓
Server: Store in MongoDB
         ↓
Client: Reload vault items
```

### 4. Copy Password Flow

```
User clicks copy button
         ↓
Client: Copy decrypted password to clipboard
         ↓
Client: Show success toast
         ↓
Client: Start 15-second timer
         ↓
Client: After 15s, clear clipboard
```

---

## Security Architecture

### Encryption Implementation

#### Key Derivation (PBKDF2)

```javascript
Input: Master Password + Salt
Algorithm: PBKDF2
Iterations: 100,000
Hash: SHA-256
Output Key Length: 256 bits
Output: Encryption Key
```

**Why PBKDF2?**
- Intentionally slow to resist brute force attacks
- 100,000 iterations = ~100ms computation time
- Industry standard (NIST approved)
- Wide browser support

#### Encryption (AES-GCM)

```javascript
Input: Plaintext + Key + IV
Algorithm: AES-GCM-256
IV: 12 random bytes (unique per encryption)
Output: Ciphertext + Auth Tag
```

**Why AES-GCM?**
- Authenticated encryption (prevents tampering)
- Excellent performance on modern hardware
- Parallelizable
- No padding oracle attacks
- Native browser support via Web Crypto API

#### Security Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Salt | UUID (128-bit) | Unique per item, prevents rainbow tables |
| IV | 12 random bytes | Unique per encryption, prevents pattern analysis |
| Key Length | 256 bits | Maximum security for AES |
| PBKDF2 Iterations | 100,000 | Slow down brute force attacks |

### Authentication Security

#### JWT Implementation

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days
- **Storage**: HTTP-only cookie (not accessible via JavaScript)
- **Secret**: Minimum 32 characters (environment variable)

#### Cookie Security

```javascript
{
  httpOnly: true,        // Prevents XSS attacks
  secure: production,    // HTTPS only in production
  sameSite: 'lax',      // CSRF protection
  maxAge: 7 days,       // Auto-expire
  path: '/'             // Available site-wide
}
```

#### Password Hashing (Server-Side)

- **Algorithm**: bcrypt
- **Rounds**: 10 (2^10 = 1,024 iterations)
- **Purpose**: Protect login passwords
- **Note**: Different from master password (used for encryption)

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  createdAt: Date
}
```

**Indexes:**
- `email`: unique index for fast lookups

### Vault Items Collection

```javascript
{
  _id: ObjectId,
  userId: String (required, indexed),
  title: String (required),
  username: String,
  url: String,
  notes: String,
  encrypted: String (base64 encoded ciphertext),
  iv: String (base64 encoded initialization vector),
  salt: String (UUID for key derivation),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`: indexed for fast user queries
- Compound index: `{userId: 1, createdAt: -1}` for sorted listings

**Note**: Only the `password` field is encrypted. Metadata (title, username, URL, notes) is stored in plaintext for search functionality. If maximum privacy is needed, these could also be encrypted.

---

## API Design

### Authentication Endpoints

#### POST /api/auth/signup
```javascript
Request: { email, password }
Response: { message, userId }
Sets: HTTP-only JWT cookie
```

#### POST /api/auth/login
```javascript
Request: { email, password }
Response: { message, userId }
Sets: HTTP-only JWT cookie
```

#### POST /api/auth/logout
```javascript
Request: none
Response: { message }
Clears: JWT cookie
```

#### GET /api/auth/me
```javascript
Request: JWT cookie
Response: { userId, email }
```

### Vault Endpoints

#### GET /api/vault
```javascript
Request: JWT cookie
Response: {
  items: [{
    id, title, username, url, notes,
    encrypted, iv, salt,
    createdAt, updatedAt
  }]
}
```

#### POST /api/vault
```javascript
Request: {
  title, username, url, notes,
  encrypted, iv, salt
}
Response: { message, id }
```

#### PUT /api/vault/[id]
```javascript
Request: {
  title, username, url, notes,
  encrypted, iv, salt
}
Response: { message }
```

#### DELETE /api/vault/[id]
```javascript
Request: none
Response: { message }
```

### Error Handling

All endpoints return standardized error responses:

```javascript
{
  error: "Error message",
  status: HTTP_STATUS_CODE
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Server Error

---

## Client-Side Encryption

### Crypto Library Location

`/lib/crypto.js` - Contains all encryption utilities

### Key Functions

#### 1. deriveKey(password, salt)
```javascript
Purpose: Generate encryption key from password
Input: Master password (string), Salt (string)
Output: CryptoKey object
Algorithm: PBKDF2 with 100k iterations
```

#### 2. encryptData(data, masterPassword)
```javascript
Purpose: Encrypt data with master password
Input: Data object, Master password
Output: { encrypted, iv, salt }
Process:
  1. Generate random salt (UUID)
  2. Generate random IV (12 bytes)
  3. Derive key from password + salt
  4. Encrypt with AES-GCM
  5. Base64 encode output
```

#### 3. decryptData(encryptedObj, masterPassword)
```javascript
Purpose: Decrypt encrypted data
Input: { encrypted, iv, salt }, Master password
Output: Decrypted data object
Process:
  1. Derive key from password + salt
  2. Base64 decode encrypted data and IV
  3. Decrypt with AES-GCM
  4. Parse JSON
Throws: Error if decryption fails
```

#### 4. generatePassword(length, options)
```javascript
Purpose: Generate secure random password
Input: Length, Options object
Output: Random password string
Algorithm: Crypto.getRandomValues() for true randomness
```

### Security Considerations

1. **No Storage**: Master password never stored (only in memory)
2. **Unique Salts**: Each item has unique salt (prevents rainbow tables)
3. **Unique IVs**: Each encryption has unique IV (prevents pattern analysis)
4. **Authenticated Encryption**: GCM mode prevents tampering
5. **Browser Native**: Uses Web Crypto API (audited, optimized)

---

## Authentication Flow

### Complete Authentication Sequence

```
1. User visits site
   ↓
2. Check for JWT cookie
   ↓
3a. No cookie → Show login/signup
3b. Valid cookie → Load user data
   ↓
4. User logs in
   ↓
5. Server validates credentials
   ↓
6. Server generates JWT
   ↓
7. Server sets HTTP-only cookie
   ↓
8. Client receives success response
   ↓
9. Client shows "unlock vault" screen
   ↓
10. User enters master password
   ↓
11. Client attempts to decrypt one item (validation)
   ↓
12a. Success → Unlock vault
12b. Failure → Show error
```

### JWT Token Structure

```javascript
Header: {
  alg: "HS256",
  typ: "JWT"
}

Payload: {
  userId: "user_id_here",
  iat: 1234567890,  // Issued at
  exp: 1234567890   // Expires at
}

Signature: HMAC-SHA256(
  base64(header) + "." + base64(payload),
  JWT_SECRET
)
```

### Session Management

- **Duration**: 7 days
- **Renewal**: Manual (re-login required after expiration)
- **Revocation**: Server-side cookie clearing
- **Security**: HTTP-only prevents XSS theft

---

## Component Architecture

### Component Hierarchy

```
App (page.js)
├── AuthForm
│   └── Login/Signup UI
├── Password Unlock Screen
│   └── Master password input
└── Vault Dashboard
    ├── Header
    │   └── Logout button
    ├── Tabs
    │   ├── Vault Tab
    │   │   ├── Search bar
    │   │   ├── Add button
    │   │   └── VaultItem (multiple)
    │   │       ├── Copy button
    │   │       ├── Show/hide button
    │   │       ├── Edit button
    │   │       └── Delete button
    │   └── Generator Tab
    │       └── PasswordGenerator
    │           ├── Length slider
    │           ├── Option checkboxes
    │           ├── Generate button
    │           └── Use password button
    └── VaultItemDialog
        └── Add/Edit form
```

### State Management

**Local Component State** (using React hooks):

```javascript
// App-level state
const [user, setUser] = useState(null);
const [isUnlocked, setIsUnlocked] = useState(false);
const [masterPassword, setMasterPassword] = useState('');
const [vaultItems, setVaultItems] = useState([]);
const [decryptedItems, setDecryptedItems] = useState({});
const [searchQuery, setSearchQuery] = useState('');
```

**Why no global state management?**
- Simple application with limited state
- State mostly local to main component
- No prop drilling issues
- Easier to understand and maintain
- Can be upgraded to Context/Redux if needed

### Component Responsibilities

#### AuthForm
- Handle login/signup UI
- Form validation
- API calls to auth endpoints
- Error handling

#### PasswordGenerator
- UI for password customization
- Generate secure random passwords
- Copy to clipboard
- Pass generated password to vault

#### VaultItem
- Display single vault item
- Show/hide password toggle
- Copy password to clipboard
- Edit/delete actions

#### VaultItemDialog
- Modal for add/edit
- Form validation
- Password visibility toggle
- Submit encrypted data

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components loaded on demand
2. **Memoization**: Decrypt items once, cache in state
3. **Debouncing**: Search input debounced
4. **Efficient Queries**: MongoDB indexes for fast lookups
5. **Minimal Re-renders**: Proper React key usage

### Encryption Performance

- **Key Derivation**: ~100ms per operation (intentional)
- **Encryption/Decryption**: <10ms per operation
- **Vault Load**: Parallel decryption of all items
- **User Impact**: Minimal, happens once per unlock

---

## Scalability Considerations

### Current Limitations

- Single device (no sync)
- No sharing capabilities
- Client-side decryption load

### Scaling Strategies

1. **Horizontal Scaling**: Next.js easily deployable to multiple instances
2. **Database**: MongoDB scales well with sharding
3. **Caching**: Add Redis for session management
4. **CDN**: Static assets served via CDN
5. **API Rate Limiting**: Prevent abuse

### Future Improvements

1. **Multi-device Sync**: Encrypted sync protocol
2. **Shared Vaults**: End-to-end encrypted sharing
3. **Offline Support**: Service worker + IndexedDB
4. **Backup/Export**: Encrypted export functionality
5. **2FA/TOTP**: Additional authentication layer

---

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────┐
│         CDN (Static Assets)         │
└───────────┬─────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│      Vercel/Hosting Platform        │
│  ┌───────────────────────────────┐  │
│  │    Next.js Application        │  │
│  │  (Multiple Instances)         │  │
│  └───────────┬───────────────────┘  │
└──────────────┼──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      MongoDB Atlas (Cloud)          │
│  ┌────────────────────────────┐    │
│  │  Primary + Replicas        │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Environment Variables

Production environment requires:
- `MONGODB_URI`: Production database
- `JWT_SECRET`: Strong random secret (32+ chars)
- `NODE_ENV`: Set to 'production'

### Security Checklist

- [ ] HTTPS enabled
- [ ] Strong JWT secret
- [ ] MongoDB connection encrypted
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTP security headers set
- [ ] Dependencies updated

---

## Testing Strategy

### Recommended Test Coverage

1. **Unit Tests**
   - Crypto functions (encrypt/decrypt)
   - Password generator
   - Auth utilities

2. **Integration Tests**
   - API endpoints
   - Database operations
   - Auth flow

3. **E2E Tests**
   - User signup/login
   - Password generation
   - Vault CRUD operations
   - Copy to clipboard

### Security Testing

1. **Encryption Validation**
   - Verify unique salts/IVs
   - Test decryption failures
   - Validate key derivation

2. **Auth Testing**
   - JWT validation
   - Cookie security
   - Session expiration

3. **Penetration Testing**
   - XSS prevention
   - CSRF protection
   - SQL injection (N/A for MongoDB)
   - Rate limiting

---

## Conclusion

SecureVault implements a robust, privacy-first password manager using modern web technologies and industry-standard encryption. The zero-knowledge architecture ensures that user data remains private and secure, while the clean UI provides an excellent user experience.

### Key Takeaways

1. **Client-side encryption** ensures server never sees plaintext
2. **Industry-standard crypto** (AES-GCM, PBKDF2) provides strong security
3. **Simple architecture** makes the codebase maintainable
4. **Modern stack** (Next.js, React) enables rapid development
5. **Scalable design** allows for future enhancements

---

**Document Version**: 1.0
**Last Updated**: 2025
**Author**: SecureVault Development Team
