# 🌾 GreenFarmIQ - Professional Agricultural Marketplace

A comprehensive agricultural marketplace platform connecting farmers directly with buyers (hotels, wholesalers, exporters) using a reverse bidding model.

## 🚀 Key Features

### 🎯 Core Functionality
- **Reverse Bidding System**: Buyers post requirements, farmers bid competitively
- **Role-based Authentication**: Buyer, Farmer, and Admin roles with proper access control
- **Smart Matching Algorithm**: Advanced 5-factor matching system showing top 3 recommendations
- **Real-time Messaging**: Integrated chat system for communication between buyers and farmers
- **Order Management**: Complete order lifecycle from placement to delivery

### 📊 Enhanced Dashboards
- **Buyer Dashboard**: Post requirements, view bids, manage orders, track history
- **Farmer Dashboard**: View recommendations, place bids, manage orders, update status
- **Admin Panel**: User management, analytics, KYC verification, system monitoring

### 💰 Payment & Financial Systems
- **Multiple Payment Options**: UPI, Bank Transfer, Digital Wallets
- **Escrow System**: Secure payment handling with trust mechanism
- **Order Payments**: Integrated payment processing for all transactions

### ⭐ Rating & Review System
- **Two-way Reviews**: Both buyers and farmers can rate each other
- **Star Rating System**: 5-star rating system for quality feedback
- **Detailed Reviews**: Text-based feedback for improved transparency

### 📱 Notification System
- **Multi-channel Notifications**: Email, WhatsApp, and in-app notifications
- **Real-time Updates**: Instant notifications for order status, bids, payments
- **Notification Preferences**: Customizable notification settings

### 🌍 Multi-language Support
- **Regional Languages**: English, Hindi, Telugu
- **Seamless Switching**: Language toggle with persistent preferences
- **Cultural Localization**: Culturally appropriate translations

### 🎨 Agricultural UI Design
- **Professional Interface**: Modern, responsive design optimized for agriculture sector
- **Mobile-first**: Fully responsive design working on all devices
- **Theme System**: Custom agriculture-themed color scheme
- **Agricultural Elements**: Relevant icons and visual elements

## 🏗️ Architecture & Technology

### Tech Stack
- **Frontend**: ReactJS with Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based secure authentication
- **Deployment**: Production-ready with comprehensive error handling

### Folder Structure
```
agricultural-marketplace/
├── backend/
│   ├── middleware/
│   ├── models/         # User, ProductListing, Bid, Order, Chat models
│   ├── routes/         # API routes for all features
│   ├── utils/          # Smart matching algorithm
│   ├── config/         # Database configuration
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── docs/                   # Documentation
├── tests/                 # Unit and integration tests
├── PROFESSIONAL_FEATURES.md # Enhanced feature documentation
├── README.md
├── setup.bat            # Automatic setup script
├── run.bat             # Launch script
└── docker/              # Docker deployment files
```

## ⚙️ API Architecture

### Endpoints Summary
- **Authentication**: `POST /api/users/login`, `POST /api/users/register`, `POST /api/users/role-decision`
- **Product Listings**: `POST /api/product-listings`, `GET /api/product-listings`
- **Bidding System**: `POST /api/bids`, `GET /api/bids`, `PUT /api/bids/:id`
- **Order Management**: `POST /api/orders`, `GET /api/orders`, `PUT /api/orders/:id`
- **Smart Matching**: `GET /api/matching/recommendations`, `GET /api/matching/best-matches/:id`
- **Admin Panel**: `GET /api/admin/dashboard`, `GET /api/admin/users`, `PUT /api/admin/users/:id`
- **Chat System**: `POST /api/chat`, `GET /api/chat`, `PUT /api/chat/:id/read`
- **Payment Integration**: `POST /api/payments`, `POST /api/payments/verify`
- **Notifications**: `GET /api/notifications`, `POST /api/notifications/whatsapp`

### Database Schema
- **Users**: Role-based fields, KYC verification, ratings, wallet system
- **ProductListings**: Detailed requirement specifications with budget ranges
- **Bids**: Competitive bidding with quantity and price offers
- **Orders**: Complete order lifecycle with status tracking
- **Chat**: Real-time messaging with read status
- **Notifications**: Multi-channel notification system

## 🎯 Smart Matching Algorithm

### 5-Factor Weighted System
1. **Distance Proximity** (30%): Geographic proximity between buyer and farmer
2. **Price Competitiveness** (25%): Bid price within buyer's budget range
3. **Farmer Ratings** (20%): Historical performance and reliability scores
4. **Availability** (15%): Current inventory and delivery capacity
5. **Specialization** (10%): Expertise in specific product categories

### Implementation
- Real-time matching calculations
- Top 3 farmer recommendations displayed
- Dynamic scoring based on multiple criteria
- Performance-optimized algorithms

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-based Access**: Different permissions for Buyer/Farmer/Admin
- **Password Security**: Bcrypt hashing with salt
- **Session Management**: Automatic token refresh and expiration

### Data Protection
- **Input Validation**: Comprehensive validation for all user inputs
- **Rate Limiting**: Protection against abuse and spam
- **CORS Configuration**: Secure cross-origin requests
- **Error Handling**: Proper error responses without exposing sensitive data

## 🚀 Deployment & Production

### Environment Configuration
- **Environment Variables**: Secure configuration management
- **Database Connection**: MongoDB Atlas integration with connection pooling
- **API Security**: Production-grade security headers and middleware
- **Performance Optimization**: Caching strategies and response optimization

### Monitoring & Analytics
- **Logging System**: Comprehensive application logging
- **Error Tracking**: Centralized error monitoring
- **Performance Metrics**: Application performance monitoring
- **User Analytics**: Business intelligence and user behavior tracking

## 📋 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Quick Setup
1. Clone the repository
2. Run `setup.bat` for automatic installation
3. Configure `.env` file with your MongoDB connection string
4. Run `run.bat` to start both frontend and backend servers

### Manual Installation
```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup
cd frontend
npm install
npm run dev
```

## 🎨 UI/UX Features

### Design Principles
- **Agricultural Theme**: Green color scheme with farming elements
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: WCAG compliant with proper ARIA labels
- **User Experience**: Intuitive navigation and clear information hierarchy

### Visual Elements
- **Custom Icons**: Agriculture-specific icons and illustrations
- **Professional Layout**: Clean, modern interface design
- **Interactive Components**: Smooth animations and transitions
- **Data Visualization**: Charts and graphs for analytics

## 📱 Mobile Responsiveness

### Device Support
- **Mobile Phones**: Optimized for all smartphone sizes
- **Tablets**: Dedicated tablet layouts and interactions
- **Desktop**: Full-featured desktop experience
- **Touch Support**: Proper touch targets and gestures

### Performance Optimization
- **Lazy Loading**: Component and image lazy loading
- **Code Splitting**: Bundle optimization for faster loading
- **Caching**: Efficient caching strategies
- **Progressive Web App**: PWA capabilities for mobile experience

## 🛠️ Development & Maintenance

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting standards
- **Git Hooks**: Pre-commit and pre-push validation
- **Testing Framework**: Jest and React Testing Library

### Documentation
- **API Documentation**: Comprehensive API endpoint documentation
- **Code Comments**: Clear inline documentation
- **Architecture Diagrams**: System architecture visualization
- **User Guides**: Detailed user documentation

## 🌟 Business Value

### For Buyers
- **Cost Savings**: Competitive bidding reduces procurement costs
- **Quality Assurance**: Verified farmers with rating systems
- **Transparency**: Clear communication and order tracking
- **Convenience**: One-stop platform for all agricultural needs

### For Farmers
- **Market Access**: Direct access to premium buyers
- **Fair Pricing**: Competitive bidding ensures fair compensation
- **Reduced Middlemen**: Direct transactions increase profit margins
- **Market Intelligence**: Insights into demand patterns and pricing

### For Platform
- **Revenue Streams**: Commission-based model
- **Data Analytics**: Valuable market insights
- **Scalability**: Cloud-based infrastructure for growth
- **Trust Building**: Verified ecosystem with ratings and reviews

## 🚀 Future Enhancements

### Planned Features
- **AI-powered Recommendations**: Machine learning for better matching
- **Blockchain Integration**: Supply chain transparency
- **IoT Integration**: Smart farming data integration
- **Mobile Apps**: Native iOS and Android applications
- **Advanced Analytics**: Predictive analytics and market forecasting

### Scalability Features
- **Microservices Architecture**: Modular system design
- **Load Balancing**: Horizontal scaling capabilities
- **Database Sharding**: Large-scale data management
- **CDN Integration**: Global content delivery

## 📞 Support & Contact

For technical support, feature requests, or business inquiries:
- **Email**: support@greenfarmiq.com
- **Documentation**: [docs.greenfarmiq.com](https://docs.greenfarmiq.com)
- **GitHub**: [github.com/greenfarmiq](https://github.com/greenfarmiq)

---

**GreenFarmIQ** - Revolutionizing agricultural commerce through technology and innovation. 🌱