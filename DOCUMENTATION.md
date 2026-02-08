# Valentine Week Interactive - Developer Documentation

This document provides a comprehensive guide to the **Valentine Week Interactive** project structure, logic, features, and extensibility.

## 📂 Project Structure

```
/
├── public/              # Static assets (images, audio)
├── components/          # Reusable UI components
│   ├── Confetti.tsx        # Canvas-based confetti effect
│   ├── FloatingHearts.tsx  # Background animated hearts
│   ├── MusicPlayer.tsx     # Global background audio player
│   └── ScratchCard.tsx     # Canvas scratch-to-reveal component
├── pages/               # Main application pages
│   ├── days/            # Day-specific interaction components
│   │   ├── RoseDay.tsx, ProposeDay.tsx, etc.
│   │   └── WaitingPage.tsx # Countdown page
│   ├── Dashboard.tsx    # User panel to customize messages & view confessions
│   ├── LandingPage.tsx  # Login/Register screen
│   └── PartnerRoute.tsx # Main routing logic for the partner's view
├── services/
│   └── storage.ts       # Supabase persistence logic (Users, Config, Confessions)
├── utils/
│   └── dateUtils.ts     # Date simulation and routing logic
├── types.ts             # TypeScript interfaces (User, DayTyp, DayContent)
├── App.tsx              # App entry point & Router setup
├── index.html           # Main HTML file (Tailwind config & Fonts)
├── index.tsx            # React mounting point
└── README.md            # Quick start guide
```

## 🛠️ Key Logic & Functions

### 1. Date & Routing Logic (`utils/dateUtils.ts`)
The core of this application is its ability to lock/unlock pages based on the current date.

*   **`getSimulatedDate()`**: 
    *   Returns the current date *or* a simulated date if `?simDate=YYYY-MM-DD` is present in the URL. 
    *   **Usage**: Essential for testing future days without changing system time.
*   **`getCurrentDayType()`**: 
    *   Analyzes the date (real or simulated) and returns a `DayType` enum (e.g., `DayType.ROSE`, `DayType.WAITING`).
    *   **Logic**: 
        *   Before Feb 7 -> `WAITING`
        *   Feb 7-14 -> Specific Day
        *   After Feb 14 -> `FINISHED`
*   **`getDaysLeft()`**: Calculates distinct days remaining until the start of Valentine Week (Feb 7).

### 2. Storage Service (`services/storage.ts`)
Uses **Supabase** for secure, real-time persistence. Authentication is handled via mobile number and a PIN (hashed with `bcryptjs`).

*   **`registerUser(username, partnerName)`**: Creates a new user profile with a partner name.
*   **`getUser(userId)`**: Retrieves full user details, including `partnerName`, by ID.
*   **`updateUserConfig(userId, day, content)`**: Allows the user (sender) to customize the message shown on a specific day.
*   **`saveConfession(userId, text, day)`**: Saves the partner's interaction input (e.g., the final letter on Valentine's Day).

### 3. Interaction Mechanics (`pages/days/*`)
Each day has unique interactive logic:
*   **Rose Day**: A multi-stage experience:
    1.  **Scratch Card**: Reveal hidden message using canvas scratch effect.
    2.  **Permission**: User must click "Haan" (Yes) to proceed; "No" button runs away.
    3.  **Offer Rose**: Interactive rose offering; "No" button runs away again.
    4.  **Quiz**: Sequential Yes/No questions about love.
*   **Teddy/Hug Day**: Uses `setInterval` on `onMouseDown` / `onTouchStart` to increase a progress bar, checking for completion (100%).
*   **Promise Day**: Manages an array of promise strings and an active index state to show a "stack" card effect.
*   **Kiss Day**: Generates floating emoji elements at random coordinates on click.

## 🚀 Features

1.  **Strict Date Locking**: Users cannot access future days manually.
2.  **Demo Mode**: 
    *   Append `?demo=true` URL parameter to `WaitingPage`.
    *   Triggers a 10-second countdown instead of the real date.
    *   Shows an "Enter (Demo)" button upon completion.
3.  **Preview System**: 
    *   The Dashboard allows the sender to "Preview" specific days effectively by opening a new tab with the correct `simDate` parameter.
4.  **Responsive Design**: Built `mobile-first` using pure CSS and Tailwind classes (via HTML CDN or CSS file) for animations (float, pulse, wiggle).

## 🔧 How to Extend / Update

### Adding a New "Day" or Event
1.  **Update Types**: Add the new day key to `DayType` enum in `types.ts`.
2.  **Create Component**: Create `NewDay.tsx` in `pages/days/`. Copy the structure of `HugDay.tsx` for a base.
3.  **Update Routing**: In `PartnerRoute.tsx`:
    *   Import the new component.
    *   Add a `case` in the `switch(currentDay)` statement to render it.
4.  **Update Date Logic**: In `utils/dateUtils.ts`, add the specific date check in `getCurrentDayType`.

### Changing Animations
*   Global animations are defined in `index.html` (under `tailwind.config`) or `index.css`.
*   To add a new keyframe animation, edit the `tailwind.config` script in `index.html`.

### Switching to a Real Backend
1.  Replace `services/storage.ts` functions.
2.  Instead of `localStorage.setItem`, make `fetch()` or `axios` calls to your API.
3.  Ensure `useEffect` hooks in `Dashboard` and `PartnerRoute` handle loading states (spinners are already implemented).

## 🐛 Troubleshooting

*   **Blank Screen?** Check `index.tsx` is mounting to `#root`.
*   **Date not changing?** Ensure you aren't passing a conflicting `simDate` in the Hash vs Search params.
*   **Audio not playing?** Browsers block autoplay. The `MusicPlayer` component waits for the first user interaction (click/touch) to start playing.

## 🎨 Typography

The project uses **Patrick Hand** (from Google Fonts) for a handwritten, romantic, yet readable vibe.
*   Class: `font-hand` (configured in `tailwind.config` in `index.html`)
*   Usage: Headers, quizzes, and handwritten-style messages.
