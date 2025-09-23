# BXtra Club Backend API

A comprehensive Node.js backend for the BXtra Club startup founders network platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, profiles, connections, and admin approval system
- **Content Management**: Posts, events, requests with full CRUD operations
- **Payment Integration**: Stripe integration for subscription plans
- **Admin Dashboard**: Complete admin panel for user and content management
- **Real-time Features**: Like/unlike, upvote, comments, and replies
- **Search & Filtering**: Advanced search across all content types
- **Plan-based Access**: Feature restrictions based on subscription plans
- **Perks System**: Exclusive perks and discounts for members

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe API
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express Validator
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
backend/
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Post.js
│   ├── Event.js
│   ├── Request.js
│   ├── Plan.js
│   ├── Perk.js
│   └── Admin.js
├── routes/           # API routes
│   ├── auth.js
│   ├── user.js
│   ├── posts.js
│   ├── events.js
│   ├── requests.js
│   ├── admin.js
│   ├── plans.js
│   └── perks.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── scripts/          # Utility scripts
│   └── seedData.js
├── server.js         # Main server file
└── package.json
```

## 🔧 Installation & Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bxtra-club
   JWT_SECRET=your-super-secret-jwt-key
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   CLIENT_URL=http://localhost:3000
   ADMIN_EMAIL=admin@bxtraclub.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB locally
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Seed the database (optional)**
   ```bash
   node scripts/seedData.js
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify` | Verify JWT token |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/suggestions` | Get connection suggestions |
| POST | `/api/user/connect/:id` | Send connection request |
| PUT | `/api/user/connect/:id/accept` | Accept connection |
| GET | `/api/user/connections` | Get user connections |
| GET | `/api/user/search` | Search users |

### Posts Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create new post |
| GET | `/api/posts/:id` | Get single post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| PUT | `/api/posts/:id/like` | Like/unlike post |
| POST | `/api/posts/:id/comments` | Add comment |

### Events Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create event (Premium+) |
| GET | `/api/events/:id` | Get single event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| PUT | `/api/events/:id/join` | Join/leave event |

### Requests Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | Get all requests |
| POST | `/api/requests` | Create new request |
| GET | `/api/requests/:id` | Get single request |
| PUT | `/api/requests/:id/upvote` | Upvote request |
| POST | `/api/requests/:id/replies` | Add reply |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users/pending` | Get pending users |
| PUT | `/api/admin/users/:id/approve` | Approve user |
| PUT | `/api/admin/users/:id/reject` | Reject user |
| GET | `/api/admin/users` | Get all users |

### Plans & Perks Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | Get subscription plans |
| POST | `/api/plans/create-payment-intent` | Create Stripe payment |
| GET | `/api/perks` | Get available perks |
| POST | `/api/perks/:id/claim` | Claim perk |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```javascript
// Header
Authorization: Bearer <your-jwt-token>

// Or Cookie (automatically handled)
Cookie: token=<your-jwt-token>
```

## 🛡 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: All inputs validated and sanitized
- **Password Hashing**: bcrypt with salt rounds
- **JWT Expiration**: Tokens expire after 7 days

## 📊 Database Models

### User Schema
- Personal info (name, email, startup, role, city)
- Authentication (password, JWT tokens)
- Subscription (plan, Stripe IDs)
- Social (connections, requests)
- Status (pending/approved/rejected)

### Post Schema
- Content with images and tags
- Author relationship
- Likes and comments
- Public/private visibility

### Event Schema
- Event details (title, description, date/time)
- Location and capacity
- Attendee management
- Organizer relationship

### Request Schema
- Help requests with categories
- Urgency levels and tags
- Replies and upvotes
- Expiration dates

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test with sample data
node scripts/seedData.js
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bxtra-club
JWT_SECRET=super-secure-production-secret
STRIPE_SECRET_KEY=sk_live_your_live_key
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment Platforms

- **Render**: Easy Node.js deployment
- **Railway**: Simple with MongoDB addon
- **Heroku**: Classic platform (with MongoDB Atlas)
- **DigitalOcean**: App Platform or Droplets

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: All list endpoints support pagination
- **Caching**: Ready for Redis integration
- **Compression**: Gzip compression enabled
- **Rate Limiting**: Prevents API abuse

## 🔄 API Response Format

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10,      // For list endpoints
  "total": 100,     // Total items
  "page": 1,        // Current page
  "pages": 10       // Total pages
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Validation errors
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@bxtraclub.com
- Documentation: [API Docs](https://api.bxtraclub.com/docs)
- Issues: [GitHub Issues](https://github.com/bxtraclub/backend/issues)