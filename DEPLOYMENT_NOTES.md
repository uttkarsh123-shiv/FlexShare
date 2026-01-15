# FlexShare Deployment Configuration

## Backend URL Configuration ✅

The backend URL has been configured in the frontend:

### Frontend Environment Variables
- **File**: `frontend/.env`
- **Backend URL**: `https://flexshare-backend.onrender.com`

### Files Updated
1. Created `frontend/.env` with production backend URL
2. Created `frontend/.env.example` for documentation

### API URL Usage
The following files use the API URL:
- `frontend/src/pages/UploadPage.jsx`
- `frontend/src/pages/FilePage.jsx`

Both files use: `const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"`

## CORS Configuration ⚠️

### Current Backend CORS Settings
The backend (`backend/app.js`) currently allows these origins:
- `https://flex-share.vercel.app`
- `http://localhost:5173`
- `http://localhost:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

### Action Required
If your frontend is deployed at a different domain than `https://flex-share.vercel.app`, you need to:

1. Add your frontend domain to the `allowedOrigins` array in `backend/app.js`
2. Redeploy the backend to Render

Example:
```javascript
const allowedOrigins = [
  'https://flex-share.vercel.app',
  'https://your-frontend-domain.vercel.app', // Add your actual domain
  'http://localhost:5173',
  // ... other origins
];
```

## Testing the Configuration

### Local Development
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Frontend will use `http://localhost:3000` (fallback)

### Production
1. Frontend will use `https://flexshare-backend.onrender.com` (from .env)
2. Ensure CORS allows your frontend domain
3. Test file upload and download functionality

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://flexshare-backend.onrender.com
```

### Backend (.env)
Check `backend/.env` for:
- MongoDB connection string
- Cloudinary credentials
- Other API keys

## Next Steps

1. ✅ Frontend `.env` file created
2. ⚠️ Verify frontend deployment domain
3. ⚠️ Update backend CORS if needed
4. 🔄 Rebuild frontend to use new environment variable
5. 🧪 Test file upload/download in production

## Rebuild Frontend

After creating the `.env` file, rebuild the frontend:

```bash
cd frontend
npm run build
```

Then deploy the new build to Vercel.

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Check the frontend domain in browser
2. Add that domain to `allowedOrigins` in `backend/app.js`
3. Redeploy backend

### API Connection Errors
If the frontend can't connect to the backend:
1. Verify `VITE_API_URL` in `frontend/.env`
2. Check backend is running at `https://flexshare-backend.onrender.com`
3. Test backend health: `https://flexshare-backend.onrender.com/health`

### Environment Variables Not Loading
1. Restart the development server
2. Clear browser cache (Ctrl+F5)
3. Verify `.env` file is in `frontend/` directory
4. Check `.env` is not in `.gitignore` (it should be)
