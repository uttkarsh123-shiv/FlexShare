# Fixing Black UI Screen Issue

## Problem
The UI is showing just a black screen instead of the styled interface.

## Root Cause
Tailwind CSS v4 might not be compiling properly, or the dev server needs to be restarted.

## Solution Steps

### 1. Clear Vite Cache (Already Done ✅)
```bash
cd frontend
Remove-Item -Path "node_modules/.vite" -Recurse -Force
```

### 2. Restart Dev Server
**IMPORTANT:** Stop the current dev server (Ctrl+C) and restart it:

```bash
cd frontend
npm run dev
```

### 3. Verify Tailwind is Loading
Open browser DevTools (F12) and check:
- **Console tab**: Look for any CSS errors
- **Network tab**: Check if CSS files are loading
- **Elements tab**: Inspect an element and see if Tailwind classes are applied

### 4. Check Browser Console
Look for errors like:
- "Failed to load resource" (CSS files)
- "Uncaught SyntaxError"
- Any Tailwind-related errors

### 5. Verify Setup
Make sure these files are correct:

**`frontend/vite.config.js`** ✅ Correct:
```javascript
import tailwindcss from '@tailwindcss/vite'
plugins: [tailwindcss(), react()]
```

**`frontend/src/index.css`** ✅ Correct:
```css
@import 'tailwindcss';
```

**`frontend/src/main.jsx`** ✅ Correct:
```javascript
import './index.css'
```

### 6. If Still Black Screen

#### Option A: Check if Tailwind Classes Work
Add this test in `Hero.jsx` temporarily:
```jsx
<div style={{color: 'red', padding: '20px'}}>
  TEST: If you see this, React is working
</div>
```

#### Option B: Force Rebuild
```bash
cd frontend
npm run build
npm run preview
```

#### Option C: Reinstall Dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Expected Result
After restarting the dev server, you should see:
- ✅ Gradient dark background
- ✅ White/orange text
- ✅ Styled buttons
- ✅ Proper spacing and layout

## Quick Test
1. Open `http://localhost:5173` in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for any red errors
5. Check if you see: "VITE v7.x.x ready in XXX ms"

If you see the Vite ready message but still black screen, the issue is CSS compilation.

## Still Not Working?
Check:
1. Is the dev server actually running? (Check terminal)
2. Are there any errors in the terminal?
3. Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Check if port 5173 is being used by another process


