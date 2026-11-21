# Morning Football Academy

A modern football academy management website built to showcase academy activities, players, matches, tournaments, and friendly football series.

**Live Website:** https://morning-football-academy.vercel.app

**Backend API:** https://morning-football-academy-server.vercel.app

---

## About the Project

Morning Football Academy is a football academy website designed to manage and showcase academy information, player profiles, match results, tournaments, and friendly football competitions.

The platform provides a public-facing website for visitors and an administrative dashboard for managing academy activities.

## Features

### Public Website

- Modern, responsive homepage.
- Academy information and activities.
- Player profiles and squad directory.
- Upcoming matches and match results.
- Tournament listings and tournament details.
- Tournament standings and fixtures.
- Tournament top goal scorers.
- Friendly football series listings.
- Friendly series match results and statistics.
- Friendly series team rosters.
- Friendly series top goal scorers.
- Latest Friendly Series section on the homepage.
- Responsive layouts for desktop, tablet, and mobile.

### Tournament Management

- Create and manage tournaments.
- Register teams and assign players.
- Team roster size: 5–6 players.
- Minimum 3 teams, with no fixed maximum.
- Automatic single round-robin fixture generation.
- Automatic bye handling for odd-numbered teams.
- League standings and points calculation.
- Top 2 teams qualify for the final.
- Match scheduling and result management.
- Goal scorer tracking and Golden Boot leaderboard.

### Friendly Series Management

- Create and manage two-team friendly series.
- Best of 3 and Best of 5 formats.
- Match scheduling and result submission.
- Multiple goal scorers per match.
- Normal goal and own-goal tracking.
- Player roster validation.
- Automatic series standings and winner calculation.
- Match result corrections.
- Top goal scorer leaderboard.
- Team-wise player roster display.

### Admin Dashboard

- Secure administrator access.
- Manage tournaments and friendly series.
- Manage teams and player assignments.
- Schedule matches.
- Submit and correct match results.
- Manage goal scorer information.

---

## Technologies Used

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Better Auth
- **Validation:** Zod
- **Deployment:** Vercel

---

## Project Structure

```text
morning-football-academy/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── friendly-series/
│   │   ├── tournaments/
│   │   ├── squad/
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── friendly-series/
│   │   ├── home/
│   │   └── tournaments/
│   └── lib/
│       ├── api-client.ts
│       └── bn-utils.ts
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_FRONTEND_REPOSITORY_URL>
```

### 2. Navigate to the Project

```bash
cd morning-football-academy
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Backend API

The frontend communicates with the backend through the `/api/v1` API routes.

For local development, make sure the frontend API proxy/rewrite configuration points to your local backend server.

Production Backend:

```text
https://morning-football-academy-server.vercel.app
```

Do not expose private API keys or credentials in frontend code.

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## API Integration

The frontend communicates with the Morning Football Academy backend.

**Production API Base:**

```text
https://morning-football-academy-server.vercel.app/api/v1
```

### Main API Modules

- Players
- Matches
- Results
- Tournaments
- Tournament Teams
- Tournament Fixtures
- Tournament Standings
- Tournament Goal Scorers
- Friendly Series
- Friendly Series Matches
- Friendly Series Players
- Friendly Series Top Scorers

### Friendly Series API

| Method | Endpoint | Access |
|---|---|---|
| GET | `/friendly-series` | Public |
| GET | `/friendly-series/:id` | Public |
| GET | `/friendly-series/:id/standings` | Public |
| GET | `/friendly-series/:id/matches` | Public |
| GET | `/friendly-series/:id/top-scorers` | Public |
| GET | `/friendly-series/:id/players` | Public |
| POST | `/friendly-series` | Admin |
| POST | `/friendly-series/:id/matches` | Admin |
| POST | `/friendly-series/:id/matches/:matchId/result` | Admin |

All endpoints are prefixed with `/api/v1`.

---

## Deployment

The frontend is deployed on Vercel.

**Production URL:**

https://morning-football-academy.vercel.app

To deploy your own version:

1. Push the frontend repository to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables and API rewrite settings.
4. Deploy the application.

Make sure the backend is deployed and accessible before testing production API integration.

---

## Backend Repository

The backend is maintained separately.

**Backend Repository:** Add your backend GitHub repository URL here.

**Backend Production URL:**

https://morning-football-academy-server.vercel.app

---

## Project Status

The project includes:

- Public academy website.
- Player profile system.
- Tournament management.
- Friendly Series management.
- Goal scorer tracking.
- Team roster management.
- Administrative dashboard.

Frontend TypeScript checks, ESLint, and production build have been reported as successful during development.

---

## License

This project is maintained for Morning Football Academy.

All rights reserved unless otherwise specified.
