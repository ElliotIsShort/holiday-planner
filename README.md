# Spain Villa Holiday Planner 2027 🌴

A web application to coordinate a 14–20 person group holiday in Spain. The site facilitates group decision-making with villa voting, availability tracking, and activity planning.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Firebase (Authentication, Firestore Database, Hosting)
- **Styling:** Custom CSS with CSS Variables

## Features

### Villa Showcase & Voting Engine
- Rich villa cards with images, specs (bedrooms/bathrooms), and pricing
- Budget indicator showing if cost is under/over £350/person threshold
- Weighted voting system:
  - ❤️ **Love It** (+2 points)
  - 👍 **Can Live With It** (+1 point)
  - 🚫 **Veto** (-99 points)
- Admin-only villa management

### Availability Heatmap
- Interactive calendar for June–September 2027
- Multi-select date picking
- Visual heatmap showing group availability percentage
- Best dates summary sidebar

### Activity Pitchboard
- Open activity submissions from any member
- "I'm In!" opt-in counter for interest tracking
- Cost estimation per activity

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore and Auth enabled

### Installation

```bash
npm install
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** with Email/Password provider
3. Enable **Firestore Database**
4. Copy your Firebase config values
5. Create a `.env` file based on `.env.example`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Seeding Users

Users log in with usernames (not emails). Pre-seed users in Firebase Auth using synthetic emails:

```
username: alex_smith
synthetic email: alex_smith@group-trip.internal
```

Also create a corresponding document in the `users` collection:

```json
{
  "uid": "<firebase-auth-uid>",
  "username": "alex_smith",
  "displayName": "Alex Smith",
  "role": "user",
  "budgetCap": 350,
  "preferences": []
}
```

### Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Layout.tsx     # Main app shell with navigation
│   └── LoadingSpinner.tsx
├── config/
│   └── firebase.ts    # Firebase initialization & helpers
├── contexts/
│   └── AuthContext.tsx # Authentication state management
├── hooks/
│   └── useFirestore.ts # Firestore data hooks & operations
├── pages/
│   ├── DashboardPage.tsx
│   ├── VillasPage.tsx
│   ├── AvailabilityPage.tsx
│   ├── ActivitiesPage.tsx
│   └── LoginPage.tsx
├── styles/
│   └── index.css      # Global styles & CSS variables
├── types/
│   └── index.ts       # TypeScript type definitions
├── App.tsx            # Route configuration
└── main.tsx           # App entry point
```

## Role-Based Access

- **Admin:** Full CRUD on villas, user management
- **Member:** Read villas, vote, update own availability, propose activities

## Budget Constraint

Maximum villa budget: **£350 per person** based on group headcount.

## License

Private - Group Holiday Planning
