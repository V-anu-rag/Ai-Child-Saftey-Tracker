# 🚀 SafeTrack Deployment Guide

This document provides step-by-step instructions for deploying the SafeTrack ecosystem to production.

---

## 1. Backend (Node.js/Express)
**Recommended Platform:** [Render](https://render.com) or [Fly.io](https://fly.io)

### Steps:
1.  **Create a Web Service**: Connect your GitHub repository.
2.  **Root Directory**: Set to `backend`.
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Environment Variables**: Add all keys from `backend/.env.example`.
    - `NODE_ENV`: `production`
    - `JWT_SECRET`: (Generate a long random string)
    - `MONGODB_URI`: (Your MongoDB Atlas connection string)
    - `CLIENT_URL`: (Your deployed Frontend URL)

---

## 2. Frontend (Next.js Dashboard)
**Recommended Platform:** [Vercel](https://vercel.com)

### Steps:
1.  **Import Project**: Connect your GitHub repository.
2.  **Root Directory**: Set to `frontend`.
3.  **Framework Preset**: Next.js.
4.  **Environment Variables**: Add all keys from `frontend/.env.local.example`.
    - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com/api`
    - `NEXT_PUBLIC_SOCKET_URL`: `https://your-backend-url.onrender.com`

---

## 3. Mobile (Expo/React Native)
**Platform:** [Expo Application Services (EAS)](https://expo.dev/eas)

### Steps:
1.  **Install EAS CLI**: `npm install -g eas-cli`
2.  **Configure Build**: `eas build:configure` (if not already done).
3.  **Update `eas.json`**: Ensure the `env` variables in `production` point to your deployed backend.
4.  **Build for Android**:
    ```bash
    cd mobile
    eas build --platform android --profile production
    ```
5.  **Build for iOS**:
    ```bash
    cd mobile
    eas build --platform ios --profile production
    ```

---

## 🔒 Security Best Practices
- **Never** commit `.env` files to Git.
- **Database**: Use IP Whitelisting in MongoDB Atlas. If using Render, you may need to allow `0.0.0.0/0` (not recommended) or use a static IP service.
- **API Rate Limiting**: The backend is configured with `express-rate-limit`. If you scale to multiple instances, consider using a Redis store for the rate limiter.
- **SSL**: Both Vercel and Render handle SSL automatically.

---

## ✅ Post-Deployment Checklist
- [ ] Visit `https://your-backend-url.onrender.com/api/health` to verify API status.
- [ ] Log in to the Frontend and check if the avatar images (Dicebear) load correctly.
- [ ] Verify that the Mobile App can connect to the production Socket.io server.
