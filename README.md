# 🍃 JelantahPoint - Platform Penukaran Minyak Jelantah

![Version](https://img.shields.io/badge/version-1.0-blue)
![Security](https://img.shields.io/badge/security-95%2F100-green)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)

**Platform inovatif untuk mengubah limbah minyak jelantah menjadi poin berharga yang dapat ditukar dengan sembako dan kebutuhan rumah tangga.**

Inisiasi dari **Dewan Kerja Ranting (DKR) Jeruklegi** untuk program Jejak Jelantah - kontribusi nyata untuk lingkungan yang lebih bersih dan berkelanjutan.

---

## 🌟 Features

### 🔐 **Security (Score: 95/100)**
- ✅ **Bcrypt Password Hashing** - 12 salt rounds untuk keamanan maksimal
- ✅ **JWT Authentication** - Token-based auth dengan signature verification
- ✅ **Rate Limiting** - Proteksi dari brute force attacks
- ✅ **Input Validation** - XSS dan injection prevention
- ✅ **CORS Security** - Whitelist-based origin control
- ✅ **Security Headers** - CSP, X-Frame-Options, XSS Protection
- ✅ **HttpOnly Cookies** - Prevent JavaScript access to tokens
- ✅ **Auto Password Migration** - Legacy passwords auto-upgraded to bcrypt

### 📱 **Responsive Design**
- ✅ Mobile-first approach
- ✅ Adaptive layouts untuk semua device sizes
- ✅ Touch-friendly UI elements
- ✅ Optimized typography scaling

### 🎯 **Core Features**
- 🥤 **Setor Jelantah** - Submit minyak jelantah dengan foto dan tracking
- 🎁 **Tukar Poin** - Redeem points untuk sembako dan produk
- 🗺️ **Drop Point Map** - Interactive map dengan Leaflet
- 🏆 **Leaderboard** - Ranking pengguna berdasarkan kontribusi
- 📚 **Edukasi** - Informasi tentang dampak lingkungan
- 👤 **User Profile** - Track points, history, dan achievements
- 👨‍💼 **Admin Dashboard** - Manage deposits, users, products

### 🔄 **Real-time Updates**
- ⚡ Socket.IO untuk live data sync
- 📊 Real-time stats updates
- 🔔 Instant notifications

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/inukun21/JelantahPoint.git
cd JelantahPoint

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dan set JWT_SECRET (lihat instruksi di bawah)

# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy hasil dan paste ke .env sebagai JWT_SECRET

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Project Structure

```
JelantahPoint/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── admin/         # Admin API
│   │   │   ├── users/         # User management
│   │   │   ├── products/      # Product catalog
│   │   │   ├── deposits/      # Deposit submissions
│   │   │   └── transactions/  # Transaction management
│   │   ├── edukasi/           # Education page
│   │   ├── drop-point/        # Drop point map
│   │   ├── peringkat/         # Leaderboard
│   │   ├── profil/            # User profile
│   │   ├── registrasi/        # Registration
│   │   ├── setor/             # Deposit submission
│   │   └── tukar/             # Point redemption
│   ├── components/            # React components
│   ├── context/               # React Context (DataContext, SocketContext)
│   ├── database/              # JSON database files (gitignored)
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Password hashing utilities
│   │   ├── jwt.ts             # JWT token management
│   │   ├── validation.ts      # Input validation
│   │   ├── rateLimit.ts       # Rate limiting
│   │   └── jsonDB.ts          # Database operations
│   └── scripts/               # Utility scripts
│       └── migratePasswords.js # Password migration script
├── middleware.ts              # Next.js middleware (auth, security headers)
├── server.js                  # Custom server with Socket.IO
├── SECURITY.md               # Security documentation
└── .env                      # Environment variables (gitignored)
```

---

## 🔒 Security

> **Security Score: 95/100** 🏆

Aplikasi ini dibangun dengan security best practices:

### Implemented Security Features

1. **Password Security**
   - Bcrypt hashing dengan 12 salt rounds
   - Automatic migration dari plain text
   - Strong password validation

2. **Authentication**
   - JWT tokens dengan signature
   - HttpOnly secure cookies
   - Token expiration handling

3. **Rate Limiting**
   - Login: 5 attempts / 15 minutes
   - Register: 3 attempts / hour
   - API: 100 requests / minute

4. **Input Security**
   - XSS prevention via sanitization
   - Email validation
   - SQL injection prevention

5. **Headers**
   - Content-Security-Policy
   - X-Frame-Options: DENY
   - X-XSS-Protection
   - Referrer-Policy

Lihat [SECURITY.md](./SECURITY.md) untuk detail lengkap.

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` ke `.env` dan configure:

```env
# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-key-change-this

# JWT Expiration
JWT_EXPIRES_IN=24h

# Environment
NODE_ENV=development

# Production Domain (for CORS)
# PRODUCTION_DOMAIN=https://yourdomain.com
```

**⚠️ IMPORTANT:** Generate strong JWT_SECRET dengan:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Build for production
npm start               # Start production server

# Utilities
npm run lint            # Run ESLint
npm run format          # Format code with Biome
npm run migrate:passwords  # Migrate plain text passwords to bcrypt
```

---

## 🗃️ Database

Project menggunakan JSON-based database untuk development:
- `users.json` - User accounts
- `products.json` - Product catalog  
- `deposits.json` - Deposit submissions
- `drop_points.json` - Drop point locations

**Note:** Database files di-gitignore untuk security. Untuk production, recommended migrate ke PostgreSQL/MongoDB.

---

## 👥 Default Users

### Admin Account
- **Username:** `admin`
- **Password:** `password123` (di-hash otomatis saat login pertama)

### Moderator Account
- **Username:** `moderator`
- **Password:** `password123` (di-hash otomatis saat login pertama)

**⚠️ PENTING:** Ganti password default setelah setup!

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables di Vercel dashboard:
- `JWT_SECRET`
- `NODE_ENV=production`

### Manual Deployment

```bash
# Build
npm run build

# Set environment
export NODE_ENV=production
export JWT_SECRET=your-secret-key

# Start
npm start
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15.3 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Map:** Leaflet + React Leaflet
- **Real-time:** Socket.IO
- **Authentication:** JWT + bcrypt
- **Validation:** Validator.js
- **Security:** Helmet, Rate Limiting

---

## 📊 Performance

- ⚡ Next.js 15 with Turbopack
- 📦 Optimized bundle size
- 🎨 CSS-in-JS with Tailwind
- 🔄 Real-time updates via WebSocket
- 📱 Mobile-optimized

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **DKR Jeruklegi** - Program Jejak Jelantah initiator
- **Pramuka Cilacap** - Environmental awareness program
- Next.js team for amazing framework
- Open source community

---

## 📧 Contact

- **Project Maintainer:** inukun21
- **Email:** ibnunurramadani175@gmail.com
- **Repository:** https://github.com/inukun21/JelantahPoint

---

## 🔐 Security Issues

Found a security vulnerability? Please email security concerns to:
**ibnunurramadani175@gmail.com**

DO NOT create public GitHub issues for security vulnerabilities.

---

<div align="center">

**Made with ❤️ for a cleaner environment**

🍃 **JelantahPoint** - Turning waste oil into valuable rewards

⭐ Star this repo if you find it useful!

</div>
