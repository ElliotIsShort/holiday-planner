# Deployment Guide: GitHub Pages + Firebase

This guide walks you through hosting the Spain Villa Planner on GitHub Pages with Firebase as the backend.

---

## Part 1: Create a Firebase Project

### Step 1.1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Sign in with your Google account
3. Click **"Create a project"** (or "Add project")

### Step 1.2: Set Up the Project
1. Enter a project name: `spain-villa-planner` (or similar)
2. Disable Google Analytics (optional, not needed for this app)
3. Click **"Create project"**
4. Wait for setup, then click **"Continue"**

### Step 1.3: Register a Web App
1. On the project dashboard, click the **Web icon** (`</>`)
2. Enter an app nickname: `Spain Villa Planner`
3. **Don't** check "Firebase Hosting" (we're using GitHub Pages)
4. Click **"Register app"**
5. You'll see a code block with `firebaseConfig` - **copy these values**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
6. Click **"Continue to console"**

---

## Part 2: Enable Firebase Authentication

### Step 2.1: Enable Email/Password Auth
1. In the Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** under Sign-in providers
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### Step 2.2: Create Test Users
1. Go to the **"Users"** tab in Authentication
2. Click **"Add user"**
3. Create users with **synthetic emails**:
   
   | Email | Password | Notes |
   |-------|----------|-------|
   | `admin@group-trip.internal` | `admin123` | Admin user |
   | `sarah_jones@group-trip.internal` | `sarah123` | Regular member |
   | `mike_wilson@group-trip.internal` | `mike123` | Regular member |

4. Copy the **User UID** for each user (you'll need these for Firestore)

---

## Part 3: Set Up Firestore Database

### Step 3.1: Create the Database
1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add rules later)
4. Choose a location close to your users (e.g., `europe-west2` for UK)
5. Click **"Enable"**

### Step 3.2: Create the Users Collection
1. Click **"Start collection"**
2. Collection ID: `users`
3. Add a document:
   - Document ID: **paste the UID from Firebase Auth** (e.g., `abc123xyz`)
   - Add fields:
     ```
     uid: (string) paste-same-uid-here
     username: (string) admin
     displayName: (string) Your Name
     role: (string) admin
     budgetCap: (number) 350
     preferences: (array) []
     ```
4. Click **"Save"**
5. Repeat for other users (with `role: "user"` for non-admins)

### Step 3.3: Deploy Security Rules
1. Go to **Firestore → Rules** tab
2. Replace the content with:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /villas/{villaId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /villaVotes/{voteId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    match /availability/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && 
        (resource.data.proposedBy == request.auth.uid || isAdmin());
    }
  }
}
```

3. Click **"Publish"**

---

## Part 4: Create a GitHub Repository

### Step 4.1: Create the Repo
1. Go to https://github.com/new
2. Repository name: `holiday-planner`
3. Keep it **Public** (required for free GitHub Pages)
4. **Don't** initialize with README (we already have files)
5. Click **"Create repository"**

### Step 4.2: Push Your Code
Run these commands in your terminal:

```bash
cd /Users/elliotshort/Repos/Non-work/holiday-planner

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Spain Villa Planner"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/holiday-planner.git

# Push
git branch -M main
git push -u origin main
```

---

## Part 5: Add Firebase Secrets to GitHub

### Step 5.1: Go to Repository Settings
1. On GitHub, go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**

### Step 5.2: Add Each Secret
Add these 6 secrets (one at a time), using values from your Firebase config:

| Secret Name | Value (from Firebase) |
|------------|----------------------|
| `VITE_FIREBASE_API_KEY` | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc123` |

---

## Part 6: Enable GitHub Pages

### Step 6.1: Configure Pages
1. Go to repo → **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. That's it! The workflow will handle the rest.

### Step 6.2: Trigger the First Deploy
1. Go to repo → **Actions**
2. You should see the "Deploy to GitHub Pages" workflow
3. If it hasn't run automatically, click on it → **"Run workflow"** → **"Run workflow"**
4. Wait 2-3 minutes for the build to complete

### Step 6.3: Access Your Site
Your site will be live at:
```
https://YOUR_USERNAME.github.io/holiday-planner/
```

---

## Part 7: Configure Firebase for GitHub Pages Domain

### Step 7.1: Add Authorized Domain
1. Go to Firebase Console → **Authentication** → **Settings**
2. Click the **"Authorized domains"** tab
3. Click **"Add domain"**
4. Add: `YOUR_USERNAME.github.io`
5. Click **"Add"**

---

## Testing Your Deployment

1. Open `https://YOUR_USERNAME.github.io/holiday-planner/`
2. You should see the login page
3. Log in with: `admin` / `admin123` (or whatever you set)
4. Verify data saves to Firestore by:
   - Adding a villa
   - Checking Firebase Console → Firestore → `villas` collection

---

## Troubleshooting

### White screen after deploy
- Check browser console (F12) for errors
- Verify all 6 GitHub secrets are set correctly
- Check that Firebase authorized domain includes your GitHub Pages URL

### "Permission denied" errors
- Check Firestore rules are published
- Verify user document exists in `users` collection with matching UID
- Check `role` field is set correctly

### Login fails
- Ensure Email/Password auth is enabled in Firebase
- Check user exists in Firebase Auth with synthetic email format
- Verify user document exists in Firestore `users` collection

### 404 on page refresh
- The 404.html redirect should handle this
- If issues persist, try using HashRouter instead of BrowserRouter

---

## Local Development with Firebase

To test Firebase locally before deploying:

1. Create `.env` file in project root:
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

2. Run: `npm run dev`

3. The app will now use your real Firebase project!

---

## Future: Moving to Custom Domain

When ready for a proper domain:

1. Buy a domain (e.g., Namecheap, Google Domains)
2. Option A: Keep GitHub Pages + custom domain
3. Option B: Move to Firebase Hosting (free SSL, better performance)
4. Option C: Move to Vercel/Netlify (easiest migration)

Firebase Hosting migration is simple:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
