# BreathClean

**Breathe Easier on Every Journey.**

BreathClean is a health-first route planning application for urban commuters. It integrates real-time Air Quality Index (AQI) and weather data into navigation to recommend routes that minimize pollution exposure — because the fastest route isn't always the healthiest.

![Live AQI Data Active](https://img.shields.io/badge/AQI-Live%20Data-emerald)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Express](https://img.shields.io/badge/Express-5-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

---

## The Problem

In modern urban environments, air pollution varies significantly from street to street. Standard navigation apps optimize for speed or distance, often routing commuters through high-pollution corridors near highways, construction zones, and industrial areas. Over time, this repeated exposure contributes to respiratory issues, cardiovascular problems, and reduced quality of life.

## The Solution

BreathClean shifts the priority to your health. By analyzing live AQI data, real-time weather conditions, and traffic congestion at multiple points along each route, it computes a **health score** for every option and recommends the cleanest path through the city.

---

## Key Features

- **Health-First Routing** — Compare routes by health score, not just travel time. Each route is scored on air quality, weather conditions, and traffic congestion.
- **Real-Time AQI Integration** — Live air quality data from the AQICN network, with pollutant breakdowns (PM2.5, PM10, O3, NO2, SO2, CO).
- **Route Comparison Panel** — Side-by-side analysis of up to 5 route options with labeled recommendations: "Cleanest Path", "Fastest", and "Balanced".
- **Multi-Modal Support** — Walking, cycling, and driving directions with mode-specific health considerations.
- **Saved Routes** — Store frequent commutes, toggle favorites, and monitor air quality trends over time.
- **Google OAuth Authentication** — Secure sign-in with Google for personalized route saving and preferences.
- **Responsive Design** — Mobile-first UI with bottom sheet navigation, drag-to-expand panels, and snap-scroll route cards.

---

## Tech Stack

### Frontend

| Technology                                                                  | Purpose                                 |
| --------------------------------------------------------------------------- | --------------------------------------- |
| [Next.js 16](https://nextjs.org/)                                           | App Router, SSR/SSG, route groups       |
| [React 19](https://react.dev/)                                              | UI components with hooks-only state     |
| [Tailwind CSS 4](https://tailwindcss.com/)                                  | Utility-first styling                   |
| [Mapbox GL JS](https://www.mapbox.com/)                                     | Interactive maps, geocoding, directions |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Accessible component primitives         |
| [Lucide React](https://lucide.dev/)                                         | Icon system                             |
| [Sonner](https://sonner.emilkowal.dev/)                                     | Toast notifications                     |
| [Vercel Analytics](https://vercel.com/analytics)                            | Usage analytics                         |

### Backend

| Technology                                                                  | Purpose                     |
| --------------------------------------------------------------------------- | --------------------------- |
| [Express 5](https://expressjs.com/)                                         | HTTP server and API routing |
| [TypeScript 5](https://www.typescriptlang.org/)                             | Strict-mode type safety     |
| [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) | Document database and ODM   |
| [simply-auth](https://www.npmjs.com/package/simply-auth)                    | Google OAuth integration    |
| [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)      | API rate limiting           |

### External APIs

| API                                                                         | Usage                                                      |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Mapbox](https://docs.mapbox.com/)                                          | Map rendering, directions, geocoding                       |
| [AQICN](https://aqicn.org/api/)                                             | Real-time air quality data at route breakpoints            |
| [OpenWeather](https://openweathermap.org/api)                               | Weather conditions (temperature, humidity, pressure, wind) |
| [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) | User authentication                                        |

### Data Processing

| Technology | Purpose                                             |
| ---------- | --------------------------------------------------- |
| Python     | AQI data modeling and analysis (standalone scripts) |

---

## Project Structure

```
BreathClean/
├── client/                          # Next.js frontend
│   ├── app/
│   │   ├── (public)/                # Landing, login, features, about
│   │   └── (private)/               # Home (map), profile, saved-routes
│   ├── components/
│   │   ├── home/                    # HomeMap — main map interface
│   │   ├── routes/                  # Route comparison & discovery panels
│   │   ├── saved-routes/            # Saved routes gallery & insights
│   │   ├── landing/                 # Landing page sections
│   │   ├── login/                   # OAuth login UI
│   │   ├── profile/                 # User profile & preferences
│   │   └── ui/                      # Shared UI primitives
│   ├── lib/                         # Utilities
│   ├── types/                       # Global type declarations
│   └── middleware.ts                # Auth route protection
│
├── server/                          # Express backend
│   └── src/
│       ├── controllers/             # Request handlers
│       ├── routes/                  # API route definitions
│       ├── Schema/                  # Mongoose models (User, Route)
│       ├── middleware/              # JWT token verification
│       ├── utils/
│       │   └── compute/            # Scoring engine
│       │       ├── breakPoint.compute.ts   # Route breakpoint extraction
│       │       ├── aqi.compute.ts          # AQI data fetching
│       │       ├── weather.compute.ts      # Weather data fetching
│       │       └── traffic.compute.ts      # Traffic scoring
│       └── types/                   # Type extensions
│
├── data-processing/                 # Python AQI analysis scripts
└── package.json                     # Monorepo root config
```

---

## Architecture

### Route Scoring Pipeline

The core of BreathClean is its multi-stage scoring pipeline that evaluates route health:

```
Route Geometry → Extract Breakpoints → Fetch AQI → Fetch Weather → Compute Scores
```

**1. Breakpoint Extraction** — 3-4 evenly-spaced waypoints are sampled from each route's geometry using fractional distribution to avoid clustering at start/end points.

**2. AQI Data** — Each breakpoint is queried against the AQICN API (5 concurrent requests, 8s timeout) for real-time air quality index, dominant pollutant, and individual pollutant levels.

**3. Weather Data** — Each breakpoint is queried against the OpenWeather API (5 concurrent requests, 8s timeout) for temperature, humidity, pressure, and wind conditions.

**4. Score Computation** — Individual scores are calculated and combined:

| Component | Weight | Scoring Logic                                                                |
| --------- | ------ | ---------------------------------------------------------------------------- |
| Weather   | 40%    | Temperature (50%), humidity (30%), pressure (20%) relative to optimal values |
| AQI       | 30%    | Inverted scale: AQI 0-20 = 100pts, 200+ = 0pts                               |
| Traffic   | 30%    | Power curve penalty based on congestion level (0-3)                          |

**Overall Score** = `(weather × 0.4) + (aqi × 0.3) + (traffic × 0.3)` → 0-100 scale

### Authentication Flow

1. User clicks "Login with Google" → redirected to Google OAuth consent
2. Google callback returns auth code to the server
3. Server exchanges code for tokens, creates/updates user in MongoDB
4. Refresh token set as httpOnly cookie (30-day expiry)
5. Protected endpoints verify JWT via `tokenVerify` middleware

### API Routes

All routes are under `/api/v1/`:

| Method   | Endpoint                     | Auth | Description                                          |
| -------- | ---------------------------- | ---- | ---------------------------------------------------- |
| `GET`    | `/auth/google/link`          | No   | Generate Google OAuth URL                            |
| `GET`    | `/auth/google/callback`      | No   | Handle OAuth callback                                |
| `GET`    | `/auth/google/logout`        | No   | Clear auth cookies                                   |
| `GET`    | `/auth/user`                 | Yes  | Get current user info                                |
| `GET`    | `/auth/health`               | No   | Health check                                         |
| `POST`   | `/score/compute`             | Yes  | Calculate route health scores (rate-limited: 10/min) |
| `GET`    | `/saved-routes`              | Yes  | List user's saved routes                             |
| `POST`   | `/saved-routes`              | Yes  | Save a new route                                     |
| `DELETE` | `/saved-routes/:id`          | Yes  | Delete a saved route                                 |
| `PATCH`  | `/saved-routes/:id/favorite` | Yes  | Toggle favorite status                               |

### Database Models

**User** — Google profile data (googleId, email, name, picture) with timestamps.

**Route** — Saved route with origin/destination (GeoJSON Points), up to 5 route options with geometry, travel mode (walking/cycling/driving), distance, duration, last computed health score, and favorite flag.

---

## Getting Started

### Prerequisites

- **Node.js** v20+
- **MongoDB** (local instance or MongoDB Atlas)
- **API Keys:**
  - [Mapbox](https://account.mapbox.com/) — map rendering and directions
  - [AQICN](https://aqicn.org/data-platform/token/) — air quality data
  - [OpenWeather](https://openweathermap.org/api) — weather data
  - [Google Cloud Console](https://console.cloud.google.com/) — OAuth 2.0 credentials

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kaihere14/BreathClean.git
   cd BreathClean
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create `client/.env`:

   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
   ```

   Create `server/.env`:

   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
   ACCESS_TOKEN_SECRET=<random-secret-string>
   REFRESH_TOKEN_SECRET=<random-secret-string>
   WEATHER_API_KEY=<your-openweather-api-key>
   AQI_API_KEY=<your-aqicn-api-key>
   CLIENT_REDIRECT_URL=http://localhost:3000
   ```

4. **Start the development servers:**

   ```bash
   # Terminal 1 — Next.js frontend (port 3000)
   npm run dev:client

   # Terminal 2 — Express backend (port 8000)
   npm run dev:server
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `npm run dev:client`         | Start Next.js dev server (port 3000)              |
| `npm run dev:server`         | Start Express dev server with nodemon (port 8000) |
| `npm run build:client`       | Build Next.js for production                      |
| `npm run build:server`       | Compile TypeScript to `server/dist/`              |
| `npm run lint`               | Lint both client and server                       |
| `npm run format`             | Format all files with Prettier                    |
| `npm run check`              | Check formatting without writing                  |
| `npm run check-types:client` | TypeScript type-check client                      |
| `npm run check-types:server` | TypeScript type-check server                      |

---

## Code Style

- **TypeScript** strict mode in both client and server
- **Prettier** — double quotes, semicolons, trailing commas (es5), 80 char width
- **Import sorting** via `@trivago/prettier-plugin-sort-imports`: react → next → third-party → `@/` → relative
- **Tailwind class sorting** via `prettier-plugin-tailwindcss`
- **Pre-commit hooks** — Husky + lint-staged runs Prettier and ESLint on staged files

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

ISC

---

Built with care for a healthier urban future.
