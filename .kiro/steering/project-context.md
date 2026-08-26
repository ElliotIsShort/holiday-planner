# Spain Villa Holiday Planner - Project Context

> **IMPORTANT FOR AI AGENTS:** This document must be kept up to date. When adding new features, modifying existing ones, or changing the project structure, update this documentation accordingly before completing the task.

---

## Project Overview

### Purpose
A web application to coordinate a 14–20 person group holiday in Spain for Summer 2027. The site facilitates group decision-making within a maximum villa budget threshold of **£350 per person**.

### Core Goals
1. Provide a centralized dashboard for group members to vote on shortlisted villas and propose activities
2. Prevent group-chat decision fatigue through structured polling (Love / Live With It / Veto)
3. Maintain strict admin oversight over major trip variables (villa options, final budget thresholds)

### Target Users
- **Admins (Organizers):** Full control over villas, user management
- **Members (Attendees):** Can vote on villas, submit availability, propose activities

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| Backend/Database | Firebase Firestore |
| Authentication | Firebase Auth (Email/Password) |
| Hosting | GitHub Pages (with GitHub Actions CI/CD) |
| Styling | Custom CSS with CSS Variables (no UI framework) |

### Key Dependencies
- `firebase` - Authentication and Firestore database
- `react-router-dom` - Client-side routing
- `date-fns` - Date manipulation for availability calendar
- `vitest` - Unit testing framework
- `@testing-library/react` - React component testing utilities

---

## Project Structure

```
holiday-planner/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions for auto-deploy to GitHub Pages
├── public/
│   ├── 404.html            # SPA redirect handler for GitHub Pages
│   └── vite.svg            # Favicon
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx      # Main app shell with navigation header
│   │   ├── Layout.css
│   │   ├── LoadingSpinner.tsx
│   │   ├── LoadingSpinner.test.tsx
│   │   └── LoadingSpinner.css
│   ├── config/
│   │   ├── firebase.ts     # Firebase initialization, demo mode detection
│   │   └── firebase.test.ts
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication state, sign in/out, user profile
│   ├── hooks/
│   │   └── useFirestore.ts # All Firestore CRUD operations + demo mode data
│   ├── pages/
│   │   ├── LoginPage.tsx/.css
│   │   ├── DashboardPage.tsx/.css
│   │   ├── VillasPage.tsx/.css
│   │   ├── AvailabilityPage.tsx/.css
│   │   └── ActivitiesPage.tsx/.css
│   ├── styles/
│   │   └── index.css       # Global styles, CSS variables, button/form styles
│   ├── test/
│   │   ├── setup.ts        # Test setup, Firebase mocks
│   │   └── test-utils.tsx  # Custom render with providers
│   ├── types/
│   │   ├── index.ts        # TypeScript interfaces for all data models
│   │   └── index.test.ts
│   ├── utils/
│   │   ├── villa-scoring.ts      # Villa vote scoring calculations
│   │   ├── villa-scoring.test.ts
│   │   ├── availability.ts       # Availability heatmap calculations
│   │   └── availability.test.ts
│   ├── App.tsx             # Route definitions and protected routes
│   ├── main.tsx            # React entry point with error boundary
│   └── vite-env.d.ts       # Vite environment type definitions
├── .env.example            # Template for Firebase config
├── .npmrc                  # Uses public npm registry (bypasses work proxy)
├── firestore.rules         # Firestore security rules
├── package.json
├── tsconfig.json
├── vitest.config.ts        # Vitest test configuration
└── vite.config.ts          # Vite config with GitHub Pages base path
```

---

## Data Models

All TypeScript interfaces are defined in `src/types/index.ts`.

### User
```typescript
interface User {
  uid: string           // Firebase Auth UID
  username: string      // Login identifier (e.g., "alex_s")
  displayName: string   // Shown in UI (e.g., "Alex Smith")
  role: 'admin' | 'user'
  budgetCap: number     // Default: 350
  preferences: string[] // e.g., ["Private Pool", "Sea View"]
}
```

### Villa
```typescript
interface Villa {
  id: string
  title: string
  sourceUrl: string     // Link to Airbnb/booking site
  imageUrl: string
  totalPriceGBP: number
  bedrooms: number
  bathrooms: number
  location: string
  notes: string
  createdBy: string     // Admin's UID
  createdAt: Timestamp
}
```

### VillaVote
```typescript
type VoteType = 'LOVE' | 'FINE' | 'VETO'

interface VillaVote {
  id: string            // Composite: `${villaId}_${userId}`
  villaId: string
  userId: string
  userName: string
  voteType: VoteType
}

// Vote weights for scoring
const VOTE_WEIGHTS = { LOVE: 2, FINE: 1, VETO: -99 }
```

### Availability
```typescript
interface Availability {
  userId: string
  userName: string
  freeDates: string[]   // ISO dates: ["2027-07-03", "2027-07-04"]
}
```

### Activity
```typescript
interface Activity {
  id: string
  title: string
  description: string
  estimatedCostPerPerson: number
  proposedBy: string          // User's UID
  proposedByName: string
  upvotes: string[]           // Array of user UIDs
}
```

---

## Features

### 1. Authentication (LoginPage)
- Username/password login (no visible email)
- Usernames converted to synthetic emails: `admin` → `admin@group-trip.internal`
- Demo mode auto-activates when Firebase config is missing

### 2. Dashboard (DashboardPage)
- Stats overview: group size, villas listed, votes cast, availability submitted
- Leading villa (highest score without vetos)
- Best dates (most people available)
- Popular activities (most upvotes)
- Budget info display

### 3. Villa Showcase & Voting (VillasPage)
- Villa cards with image, specs, location, notes, source link
- **Budget indicator:** Green badge if ≤£350/person, red if over
- **Voting buttons:**
  - ❤️ Love It (+2 points)
  - 👍 Can Live With It (+1 point)
  - 🚫 Veto (-99 points)
- Vote breakdown display (count per type)
- **Admin only:** Add/delete villas via modal form

### 4. Availability Heatmap (AvailabilityPage)
- Calendar grid: June–September 2027
- Click dates to toggle availability
- **Heatmap colors:** Darker green = more people free
- Sidebar: Best dates, who's submitted, your selection count
- Save button persists to Firestore

### 5. Activity Pitchboard (ActivitiesPage)
- Anyone can propose activities
- "Count Me In" toggle for interest
- Shows interested count and names
- Proposer or admin can delete

---

## Authentication Flow

1. User enters username + password on login page
2. `usernameToEmail()` converts username to synthetic email
3. `signInWithEmailAndPassword()` authenticates with Firebase Auth
4. On success, `onAuthStateChanged` triggers profile fetch from `users` collection
5. User profile stored in AuthContext, accessible via `useAuth()` hook

### Demo Mode
When `VITE_FIREBASE_API_KEY` is not set:
- `isDemoMode` becomes `true`
- App uses in-memory mock data (defined in `useFirestore.ts`)
- All CRUD operations work locally but don't persist
- Orange banner displays at top of layout

---

## Firestore Collections

| Collection | Document ID | Access |
|------------|-------------|--------|
| `users` | Firebase Auth UID | Read: authenticated, Write: admin only |
| `villas` | Auto-generated | Read: authenticated, Write: admin only |
| `villaVotes` | `{villaId}_{userId}` | Read: authenticated, Write: own votes only |
| `availability` | User's UID | Read: authenticated, Write: own only |
| `activities` | Auto-generated | Read: authenticated, Create: any, Delete: owner/admin |

---

## Key Files for Common Changes

| Change | Files to Modify |
|--------|-----------------|
| Add new data field | `src/types/index.ts`, relevant page, `useFirestore.ts` |
| New page/route | Create in `src/pages/`, add to `src/App.tsx` routes, add nav link in `Layout.tsx` |
| Styling changes | Page-specific CSS or `src/styles/index.css` for globals |
| Firebase operations | `src/hooks/useFirestore.ts` |
| Auth changes | `src/contexts/AuthContext.tsx` |
| Environment config | `.env`, `src/config/firebase.ts`, `.github/workflows/deploy.yml` |

---

## CSS Design System

CSS variables defined in `src/styles/index.css`:

```css
--primary: #f97316        /* Orange - buttons, links, accents */
--success: #22c55e        /* Green - under budget, positive */
--danger: #ef4444         /* Red - over budget, errors, veto */
--warning: #eab308        /* Yellow - admin badge */

--text: #1e293b           /* Primary text */
--text-secondary: #64748b /* Secondary text */
--background: #f8fafc     /* Page background */
--surface: #ffffff        /* Card backgrounds */
--border: #e2e8f0         /* Borders */

--spacing-xs through --spacing-2xl
--radius-sm through --radius-full
```

### Button Classes
- `.btn` - Base button
- `.btn-primary` - Orange filled
- `.btn-secondary` - Outlined
- `.btn-danger` - Red filled
- `.btn-sm`, `.btn-lg` - Sizes

---

## Testing

### Test Framework
- **Vitest** - Fast unit test runner (Vite-native)
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - Custom DOM matchers

### Running Tests
```bash
npm test           # Run all tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Test Structure
Tests are co-located with source files using `.test.ts` or `.test.tsx` suffix:
- `src/config/firebase.test.ts` - Username→email conversion, demo mode detection
- `src/types/index.test.ts` - Vote weights, budget constants
- `src/utils/villa-scoring.test.ts` - Villa scoring calculations
- `src/utils/availability.test.ts` - Availability heatmap logic
- `src/components/LoadingSpinner.test.tsx` - Component rendering

### Test Setup
- `src/test/setup.ts` - Firebase mocks, environment stubs
- `src/test/test-utils.tsx` - Custom render with Router/Auth providers
- `vitest.config.ts` - Test configuration

### What Tests Cover
- **Vote scoring logic** - LOVE/FINE/VETO weights, score calculation
- **Budget calculations** - Cost per person, budget threshold checks
- **Availability heatmap** - Date counting, heat levels, best dates
- **Username conversion** - Synthetic email generation
- **UI components** - LoadingSpinner rendering variants

---

## Deployment

### GitHub Pages (Current)
- Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- Firebase secrets stored in GitHub repo settings
- Base URL: `https://elliotisshort.github.io/holiday-planner/`

### Environment Variables
Required secrets in GitHub Actions:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## Adding New Features - Guidelines

### Before Starting
1. Read this context file
2. Check `src/types/index.ts` for existing data models
3. Review similar existing features for patterns

### Implementation Pattern
1. **Types first:** Add interfaces to `src/types/index.ts`
2. **Data layer:** Add Firestore hooks/functions to `useFirestore.ts`
3. **UI components:** Create page/component with co-located CSS
4. **Routing:** Add route to `App.tsx`, navigation to `Layout.tsx`
5. **Test:** Verify in demo mode and with real Firebase

### Code Style
- Functional components with hooks
- TypeScript strict mode
- CSS modules pattern (ComponentName.css imported into ComponentName.tsx)
- No external UI framework - use existing CSS classes

### After Completing
- **Update this documentation** if you:
  - Added new data models
  - Created new pages/routes
  - Changed authentication flow
  - Modified the project structure
  - Added new environment variables

---

## Known Limitations

1. **No email notifications** - Users must check the site for updates
2. **No image upload** - Villa images must be URLs (e.g., from Unsplash)
3. **Single trip only** - No multi-trip support
4. **Manual user creation** - Admin must create Firebase Auth users manually

---

## Future Enhancement Ideas

- [ ] Email notifications for new villas/votes
- [ ] Image upload via Firebase Storage
- [ ] Cost splitting calculator
- [ ] Itinerary builder with dates
- [ ] Comments/discussion on villas
- [ ] Export to PDF/calendar
