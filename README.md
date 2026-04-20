# initialZero

initialZero is a React + TypeScript nutrition tracker with Firebase auth, Firestore-backed meal logs, USDA food search, and daily macro goal tracking.

## Features

- Email/password sign in and sign up
- Google sign in
- Dashboard with daily macro progress (calories, protein, carbs, fats)
- Search foods from USDA FoodData Central
- Add foods to today's log with gram-based scaling
- Remove items from today's log
- Settings page for daily goals
- Calories auto-calculated from macros:

$$
Calories \approx (Protein \times 4) + (Carbs \times 4) + (Fats \times 9)
$$

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Firebase Auth + Firestore
- React Router
- Lucide React

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the project root and add:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_USDA_API_KEY=
```

### 3. Run the app

```bash
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - type-check and build production bundle
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Project Structure

```text
src/
  components/      Reusable UI components
  context/         Auth context provider
  pages/           Route-level pages (Login, Dashboard, Library, Pantry, Settings)
  services/        Firebase, Firestore, USDA API helpers
  types/           Shared TypeScript types
```

## Firebase Setup Notes

- Enable Authentication providers:
  - Email/Password
  - Google
- Create a Firestore database
- Ensure Firestore rules allow each authenticated user to access only their own user-scoped data

Expected user-scoped paths used by the app:

- `users/{uid}/dailyLogs/{logId}`
- `users/{uid}/settings/goals`

## Roadmap

- Pantry module currently shows a placeholder and is ready for inventory tracking features.

## License

This project is currently unlicensed. Add a license file if you plan to publish or distribute it.
