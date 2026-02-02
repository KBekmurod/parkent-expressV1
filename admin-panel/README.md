# Admin Panel - Parkent Express

Modern admin dashboard for managing the Parkent Express food delivery system, built with React, Vite, and TailwindCSS.

## ✨ Features

### Core Features
- **🔐 Authentication** - Secure admin login with JWT tokens
- **📊 Dashboard** - Real-time statistics and analytics
- **👥 User Management** - Manage platform users
- **🏪 Vendor Management** - Approve and manage vendors
- **🚗 Driver Management** - Approve and manage drivers
- **📦 Order Management** - Track and manage orders
- **🍕 Product Management** - Manage food products
- **📈 Analytics** - Revenue trends and performance metrics
- **📄 Reports** - Export reports in PDF/CSV format
- **⚙️ Settings** - Configure system settings

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Recharts** - Charting library
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Update the API URL in `.env`:**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
admin-panel/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Layout/      # Layout components (Sidebar, Header)
│   │   ├── common/      # Reusable UI components
│   │   ├── charts/      # Chart components
│   │   ├── Dashboard/   # Dashboard components
│   │   ├── Analytics/   # Analytics components
│   │   └── Reports/     # Report components
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Vendors.jsx
│   │   ├── Drivers.jsx
│   │   ├── Orders.jsx
│   │   ├── Products.jsx
│   │   ├── Analytics.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── services/        # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── vendorService.js
│   │   ├── driverService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── dashboardService.js
│   │   └── analyticsService.js
│   ├── utils/           # Utility functions
│   ├── context/         # React Context providers
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json         # Dependencies and scripts
```

## 🔐 Authentication

The admin panel uses JWT-based authentication:
- Login with admin credentials
- Token stored in localStorage
- Automatic token inclusion in API requests
- Protected routes redirect to login

**Default Admin:**
- Email: `admin@parkentexpress.com`
- Password: `admin123` (change in production)

## 📄 Available Pages

### Dashboard (`/dashboard`)
- Real-time statistics
- Recent orders and users
- Top vendors
- Quick actions

### Users (`/users`)
- List all users
- Search and filter
- View user details
- Manage user status

### Vendors (`/vendors`)
- List vendors
- Approve/reject vendors
- View vendor details
- Manage vendor status

### Drivers (`/drivers`)
- List drivers
- Approve/reject drivers
- View driver details
- Track driver location

### Orders (`/orders`)
- List orders
- Filter by status
- View order details
- Track deliveries

### Products (`/products`)
- List products
- Filter by vendor/category
- View product details
- Manage availability

### Analytics (`/analytics`)
- Revenue charts
- Order analytics
- Vendor performance
- Driver performance

### Reports (`/reports`)
- Generate reports
- Export to PDF/CSV
- Custom date ranges

### Settings (`/settings`)
- System configuration
- Profile management
- Change password

## 🎨 Styling

TailwindCSS with custom configuration:

**Colors:**
```javascript
primary: '#4F46E5'
secondary: '#10B981'
danger: '#EF4444'
warning: '#F59E0B'
```

**Custom Classes:**
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card container
- `.input` - Input field

## 🔌 API Integration

API services are configured in `src/services/`:
- **api.js** - Axios instance with interceptors
- **authService.js** - Authentication endpoints
- **dashboardService.js** - Dashboard data
- **analyticsService.js** - Analytics data

All services automatically include JWT token in requests.

## 📊 Charts & Visualization

Using **Recharts** for data visualization:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Area charts for revenue

## 🚀 Deployment

### Docker
```bash
docker build -t parkent-admin .
docker run -p 3000:3000 parkent-admin
```

### Nginx
```bash
npm run build
# Copy dist/ to nginx web root
```

## 🧪 Testing

```bash
# Run tests
npm test

# Coverage
npm run test:coverage
```

## 📖 Additional Documentation

- [Main README](../README.md)
- [Backend API](../backend/README.md)
- [Setup Guide](../docs/SETUP.md)
- [Configuration](../docs/CONFIGURATION.md)

## 📜 License

MIT License - see [LICENSE](../LICENSE)

## 👨‍💻 Author

**KBekmurod** - [GitHub](https://github.com/KBekmurod)
