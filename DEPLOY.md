# Deploy Playground URL (step-by-step)

You need a **public URL** for the challenge reviewers.  
Two easy options are provided below.

---

## Option A – Render (recommended for beginners)

### 1. Push code to GitHub

```bash
cd airport-retail-media
git init
git add .
git commit -m "Airport Retail Media Platform POC"
# Create a new empty repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/airport-retail-media.git
git branch -M main
git push -u origin main
```

### 2. Create Blueprint on Render

1. Go to https://dashboard.render.com
2. Click **New** → **Blueprint**
3. Connect the GitHub repo you just pushed
4. Render reads `render.yaml` and creates:
   - PostgreSQL database
   - Backend web service (`airport-media-api`)
   - Frontend web service (`airport-media-web`)
5. Click **Apply**

### 3. Set the two cross-service URLs

After the first deploy finishes:

1. Open the **backend** service → Environment
   - Set `CORS_ORIGIN` = `https://airport-media-web.onrender.com`  
     (use the real frontend URL Render gave you)

2. Open the **frontend** service → Environment
   - Set `VITE_API_URL` = `https://airport-media-api.onrender.com`
   - Set `VITE_WS_URL`  = `wss://airport-media-api.onrender.com`

3. Manual Deploy both services again (so the new env vars take effect).

### 4. Your playground URL

```
https://airport-media-web.onrender.com
```

Put this URL in your Topcoder submission notes.

---

## Option B – Railway

### 1. Push code to GitHub (same as above)

### 2. New Project on Railway

1. Go to https://railway.app → **New Project**
2. **Deploy from GitHub repo** → select your repo
3. Click **+ Create** → **Database** → **Add PostgreSQL**
4. For the backend service:
   - Settings → Root Directory = `backend` (or let it use the Dockerfile)
   - Variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     FLIGHT_SOURCE=mock-aidx
     SIMULATION_START=2026-10-24T13:00:00Z
     PORT=3000
     CORS_ORIGIN=https://YOUR-FRONTEND.up.railway.app
     ```
5. Add a second service for the frontend (Root Directory = `frontend`):
   ```
   VITE_API_URL=https://YOUR-BACKEND.up.railway.app
   VITE_WS_URL=wss://YOUR-BACKEND.up.railway.app
   ```
6. On both services: Settings → Networking → **Generate Domain**

### 3. Your playground URL

```
https://xxxxx.up.railway.app
```

---

## After deploy – quick test

1. Open the public URL
2. You should see the Horizon Media header + role switcher
3. Click **Delay XY501 +45m** on the control bar
4. Switch to **Passenger Screen** → ad should change
5. Click the QR → claim page should open and record a redemption

If the frontend cannot reach the API, double-check `VITE_API_URL` and `CORS_ORIGIN`.

---

## Free-tier notes

- Render free web services spin down after ~15 min of inactivity (first request may take 30–60 s).
- Railway free quota is limited; use it only for the challenge window.
- Both are perfectly fine for the reviewers.

---

## What to write in the Topcoder submission

```
Playground URL: https://YOUR-URL-HERE
No login required – use the role switcher in the header.
Demo path: Simulation Control Bar → inject “Delay XY501 +45m”
           → Airline view → Passenger Screen → click QR → Retailer metrics.
```
