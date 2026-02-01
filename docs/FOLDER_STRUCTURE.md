# Folder Structure

## Complete Project Structure

```
parkent-expressV1/
│
├── backend/                           # Backend API & Bots
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── db.js                # MongoDB connection
│   │   │   └── constants.js         # App constants
│   │   │
│   │   ├── controllers/              # Route controllers (10 files)
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── vendor.controller.js
│   │   │   ├── driver.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── transaction.controller.js
│   │   │   └── stats.controller.js
│   │   │
│   │   ├── models/                   # Mongoose models (9 files)
│   │   │   ├── User.js
│   │   │   ├── Vendor.js
│   │   │   ├── Driver.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Category.js
│   │   │   ├── Review.js
│   │   │   ├── Transaction.js
│   │   │   └── Notification.js
│   │   │
│   │   ├── routes/                   # API routes (10 files)
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── vendor.routes.js
│   │   │   ├── driver.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── transaction.routes.js
│   │   │   └── stats.routes.js
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── authorize.js         # Role-based authorization
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   ├── validation.js        # Request validation
│   │   │   └── upload.js            # File upload (Multer)
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── logger.js            # Winston logger
│   │   │   ├── validators.js        # Validation functions
│   │   │   └── helpers.js           # Helper functions
│   │   │
│   │   ├── socket/                   # Socket.io (Real-time)
│   │   │   ├── index.js             # Socket.io setup
│   │   │   ├── handlers/            # Socket handlers
│   │   │   │   ├── order.handler.js
│   │   │   │   ├── location.handler.js
│   │   │   │   ├── chat.handler.js
│   │   │   │   └── notification.handler.js
│   │   │   └── middleware/
│   │   │       └── socketAuth.js
│   │   │
│   │   └── bots/                     # Telegram Bots (3 bots)
│   │       ├── customer/             # Customer Bot (1,524 LOC)
│   │       │   ├── index.js
│   │       │   ├── handlers/        # 7 handlers
│   │       │   ├── keyboards/       # 6 keyboards
│   │       │   └── utils/           # 2 utils
│   │       │
│   │       ├── vendor/               # Vendor Bot (2,525 LOC)
│   │       │   ├── index.js
│   │       │   ├── handlers/        # 5 handlers
│   │       │   ├── keyboards/       # 5 keyboards
│   │       │   └── utils/           # 2 utils
│   │       │
│   │       └── driver/               # Driver Bot (2,367 LOC)
│   │           ├── index.js
│   │           ├── handlers/        # 5 handlers
│   │           ├── keyboards/       # 3 keyboards
│   │           └── utils/           # 2 utils
│   │
│   ├── uploads/                      # Uploaded files
│   ├── server.js                     # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── admin-panel/                      # Admin Panel (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/              # Layout components
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Layout.jsx
│   │   │   │
│   │   │   ├── common/              # Common components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── FilterDropdown.jsx
│   │   │   │   └── ConfirmDialog.jsx
│   │   │   │
│   │   │   ├── charts/              # Chart components
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   └── AreaChart.jsx
│   │   │   │
│   │   │   ├── Dashboard/           # Dashboard components
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── RecentOrders.jsx
│   │   │   │   ├── RecentUsers.jsx
│   │   │   │   ├── TopVendors.jsx
│   │   │   │   └── QuickActions.jsx
│   │   │   │
│   │   │   ├── Analytics/           # Analytics components
│   │   │   │   ├── DateRangePicker.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── OrdersAnalytics.jsx
│   │   │   │   ├── VendorPerformance.jsx
│   │   │   │   └── DriverPerformance.jsx
│   │   │   │
│   │   │   └── Reports/             # Report components
│   │   │       ├── MetricsGrid.jsx
│   │   │       └── ExportButton.jsx
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Vendors.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── services/                 # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── vendorService.js
│   │   │   ├── driverService.js
│   │   │   ├── orderService.js
│   │   │   ├── productService.js
│   │   │   ├── dashboardService.js
│   │   │   └── analyticsService.js
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   ├── constants.js
│   │   │   ├── helpers.jsx
│   │   │   └── exportUtils.js
│   │   │
│   │   ├── context/                  # React Context
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env
│
├── nginx/                            # Nginx configs
│   ├── nginx.conf
│   └── default.conf
│
├── scripts/                          # Deployment scripts
│   ├── deploy.sh
│   ├── backup.sh
│   └── restore.sh
│
├── docs/                             # Documentation
│   ├── SETUP.md
│   ├── CONFIGURATION.md
│   ├── API_DOCUMENTATION.md
│   ├── TELEGRAM_BOTS.md
│   ├── FOLDER_STRUCTURE.md
│   └── CONTRIBUTING.md
│
├── docker-compose.yml                # Dev Docker Compose
├── docker-compose.prod.yml           # Prod Docker Compose
├── DEPLOYMENT.md                     # Deployment guide
├── README.md                         # Main README
└── LICENSE                           # MIT License
```

## Line Count Summary

- **Backend:** ~8,500 lines
- **Telegram Bots:** 6,416 lines
- **Admin Panel:** 3,094 lines
- **Docker & Config:** 701 lines
- **Documentation:** ~1,000 lines

**Total:** ~19,711 lines of code

## Key Directories Explained

### Backend (`/backend`)
The backend contains the Express.js API, Socket.io real-time communication, and 3 Telegram bots.

**Core Components:**
- **Controllers:** Business logic for API endpoints
- **Models:** Mongoose schemas for MongoDB
- **Routes:** API endpoint definitions
- **Middleware:** Authentication, validation, error handling
- **Socket:** Real-time communication handlers
- **Bots:** Three separate Telegram bots

### Admin Panel (`/admin-panel`)
React-based admin dashboard with Vite build tool.

**Core Components:**
- **Components:** Reusable UI components
- **Pages:** Full page components
- **Services:** API communication layer
- **Utils:** Helper functions and constants
- **Context:** React context for state management

### Infrastructure
- **nginx/:** Reverse proxy configuration
- **scripts/:** Deployment and maintenance scripts
- **docs/:** Project documentation

## Technology Stack by Directory

### Backend Technologies
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Multer (file uploads)
- Winston (logging)
- node-telegram-bot-api

### Admin Panel Technologies
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6
- Axios
- Recharts
- Lucide React Icons

### DevOps Technologies
- Docker & Docker Compose
- Nginx
- MongoDB
- Redis (planned)

## File Naming Conventions

- **Controllers:** `*.controller.js`
- **Models:** `PascalCase.js`
- **Routes:** `*.routes.js`
- **Middleware:** `camelCase.js`
- **React Components:** `PascalCase.jsx`
- **Services:** `*Service.js`
- **Utils:** `camelCase.js`

## Import/Export Patterns

### Backend (CommonJS)
```javascript
// Export
module.exports = functionName;

// Import
const functionName = require('./path/to/module');
```

### Frontend (ES Modules)
```javascript
// Export
export default ComponentName;
export { namedExport };

// Import
import ComponentName from './Component';
import { namedExport } from './module';
```

## Environment Variables Location

- Backend: `/backend/.env`
- Admin Panel: `/admin-panel/.env`
- Production: Docker secrets or environment files

## Build Artifacts (Not in Git)

```
node_modules/          # Dependencies
dist/                  # Build output
build/                 # Build output
uploads/               # User uploads
.env                   # Environment variables
*.log                  # Log files
```

These are excluded via `.gitignore`.
