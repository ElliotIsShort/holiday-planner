# Adding New Users to the Holiday Planner

This guide explains how to add new users (either admin or regular members) to the app.

---

## Overview

Adding a user requires two steps:
1. **Create the user in Firebase Authentication** (for login)
2. **Create a user document in Firestore** (for profile data)

Both steps are required — the app won't work properly if you only do one.

---

## Step 1: Create User in Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`holiday-planner-2de28`)
3. Navigate to **Build → Authentication → Users**
4. Click **"Add user"**
5. Enter the details:

   | Field | Format | Example |
   |-------|--------|---------|
   | Email | `{username}@group-trip.internal` | `sarah_jones@group-trip.internal` |
   | Password | Any password (share with the user) | `sarah123` |

6. Click **"Add user"**
7. **Copy the User UID** from the table (you'll need this for step 2)

### Username Format
- Use lowercase letters and underscores
- Typically `firstname_lastname` or just `firstname`
- Examples: `sarah_jones`, `mike`, `emma_davis`

The user will log in using just the username part (e.g., `sarah_jones`), not the full email.

---

## Step 2: Create User Document in Firestore

1. In Firebase Console, go to **Build → Firestore Database**
2. Click on the `users` collection
3. Click **"Add document"**
4. Set the **Document ID** to the **User UID** you copied from step 1
5. Add these fields:

| Field | Type | Value | Notes |
|-------|------|-------|-------|
| `uid` | string | Same as document ID | e.g., `abc123xyz` |
| `username` | string | The username part | e.g., `sarah_jones` |
| `displayName` | string | Their real name | e.g., `Sarah Jones` |
| `role` | string | `admin` or `user` | See below |
| `budgetCap` | number | `350` | Max budget per person |
| `preferences` | array | `[]` | Leave empty initially |

6. Click **"Save"**

### Choosing the Role

- **`admin`** — Can add/edit/delete villas, manage the trip
- **`user`** — Can vote on villas, submit availability, propose activities

Most people should be `user`. Only give `admin` to organizers.

---

## Quick Reference

### Example: Adding a Regular Member

**Firebase Auth:**
- Email: `tom_wilson@group-trip.internal`
- Password: `tom2027`

**Firestore Document:**
```
Document ID: Xk9mN2pQrS... (the UID from Auth)

Fields:
  uid: "Xk9mN2pQrS..."
  username: "tom_wilson"
  displayName: "Tom Wilson"
  role: "user"
  budgetCap: 350
  preferences: []
```

**User logs in with:**
- Username: `tom_wilson`
- Password: `tom2027`

---

### Example: Adding an Admin

**Firebase Auth:**
- Email: `organizer@group-trip.internal`
- Password: `adminpass123`

**Firestore Document:**
```
Document ID: Abc123Def... (the UID from Auth)

Fields:
  uid: "Abc123Def..."
  username: "organizer"
  displayName: "Trip Organizer"
  role: "admin"
  budgetCap: 350
  preferences: []
```

---

## Troubleshooting

### "Invalid credentials" on login
- Check the username matches exactly (case-sensitive)
- Verify the password is correct
- Ensure both Auth user AND Firestore document exist

### User can log in but sees empty data
- The Firestore document might be missing
- Check the document ID matches the Auth UID exactly

### User logged in but name shows as blank
- The `displayName` field might be missing in Firestore
- Edit the user document and add/fix the field

---

## Bulk Adding Users

If adding many users, you can use the Firebase Admin SDK or import via CSV. Contact the developer for assistance with bulk imports.
