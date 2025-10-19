# Climate Finance App Setup Guide

## Current Configuration

The application is currently configured to use **mock data as the primary data source** with automatic backend transition support.

### Data Source Behavior

1. **Mock Data First**: The app loads mock data immediately for all supported endpoints
2. **Backend Check**: In the background, the app checks if the backend is available and has data
3. **Automatic Switch**: If the backend has actual data, the app automatically switches to using backend data
4. **Fallback**: If the backend is unavailable or has no data, the app continues using mock data

### Environment Variables

Create a `.env` file in the `climate-finance` directory with the following variables:

```env
# Backend API URL
VITE_BASE_URL=https://climate-finance.onrender.com

# Data Source Configuration
VITE_USE_BACKEND_ONLY=false
```

#### Configuration Options

- **VITE_BASE_URL**: 
  - `https://climate-finance.onrender.com` (production backend)
  - `http://localhost:5000` (local development)

- **VITE_USE_BACKEND_ONLY**:
  - `false` (default): Use mock data first, then check backend
  - `true`: Use backend only (requires database to be set up)

### Development Workflow

#### Current State (No Database)
- App uses mock data for all features
- All CRUD operations work with mock data
- No database setup required

#### When Backend Database is Ready
1. Set up your hosted database (e.g., Render PostgreSQL)
2. Update `VITE_BASE_URL` to point to your backend
3. The app will automatically detect when backend has data and switch over
4. No code changes needed - the transition is automatic

#### For Local Development
1. Set `VITE_BASE_URL=http://localhost:5000`
2. Start the backend: `cd backend && npm start`
3. Set up local database
4. App will use backend data once available

### Supported Endpoints with Mock Data

- Projects (CRUD operations)
- Agencies (CRUD operations)  
- Funding Sources (CRUD operations)
- Locations (CRUD operations)
- Focal Areas (CRUD operations)
- Authentication (login)
- Dashboard statistics
- Regional distribution data

### Troubleshooting

- **App shows mock data**: This is expected behavior when no database is configured
- **Backend not switching**: Check that backend returns data with `status: true` and non-empty `data` field
- **Console errors**: Check browser console for detailed logging about data source decisions
