# Parkent Express - Admin Panel

Admin dashboard for managing the Parkent Express food delivery system, built with React, Vite, and TailwindCSS.

## 🚀 Features

- **Authentication**: Secure admin login with JWT tokens
- **Dashboard**: Overview of key metrics (Users, Vendors, Drivers, Orders)
- **User Management**: Manage platform users
- **Vendor Management**: Manage food vendors
- **Driver Management**: Manage delivery drivers
- **Order Management**: Track and manage orders
- **Product Management**: Manage food products
- **Settings**: Configure system settings

## 🛠️ Tech Stack

- **React 18**: UI library
- **Vite 5**: Build tool and dev server
- **TailwindCSS 3**: Utility-first CSS framework
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API requests
- **Recharts**: Charting library
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the API URL in `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
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
│   ├── assets/          # Images, icons
│   ├── components/      # React components
│   │   ├── Layout/      # Layout components (Sidebar, Header)
│   │   ├── common/      # Reusable UI components
│   │   └── charts/      # Chart components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
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

The admin panel uses JWT-based authentication. Login with admin credentials to access the dashboard. The token is stored in localStorage and automatically included in API requests.

## 🎨 Styling

The project uses TailwindCSS with a custom color palette. Custom utility classes are defined in `src/index.css`:
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card container style
- `.input` - Input field style

## 🔌 API Integration

API calls are configured in `src/services/`:
- `api.js` - Axios instance with interceptors
- `authService.js` - Authentication endpoints
- `config.js` - API configuration

The API base URL is configured via the `VITE_API_URL` environment variable.

## 📝 Available Routes

- `/login` - Admin login page
- `/dashboard` - Main dashboard
- `/users` - User management
- `/vendors` - Vendor management
- `/drivers` - Driver management
- `/orders` - Order management
- `/products` - Product management
- `/settings` - System settings

All routes except `/login` are protected and require authentication.

## 🚧 Development Status

This is a foundational setup. Individual page functionality will be implemented in subsequent steps.

## 📄 License

Part of the Parkent Express project.
