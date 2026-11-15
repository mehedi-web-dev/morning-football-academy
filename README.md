
# Morning Football Academy

### RISE TOGETHER. PLAY TO WIN.

A modern, responsive football academy management platform built to manage players, registrations, matches, results, gallery content, and academy administration.

<p align="center">
  <a href="https://morning-football-academy.vercel.app/">
    <strong>Visit Live Website</strong>
  </a>
</p>

---

## 🌐 Live Links

| Resource | URL |
|---|---|
| Live Website | https://morning-football-academy.vercel.app |
| Backend API | https://morning-football-academy-server.vercel.app |
| API Health Check | https://morning-football-academy-server.vercel.app/api/v1/health |

---

## 📌 About the Project

Morning Football Academy is a full-stack web application designed to provide a digital platform for a football academy.

The platform offers a public-facing website for visitors and players, along with an administrative dashboard for managing academy operations.

It focuses on a clean user experience, responsive layouts, secure authentication, and efficient data management.

---

## ✨ Features

### Public Website
- Modern and responsive landing page
- Academy information and introduction
- Player registration system
- Player profiles and details
- Match information
- Match results
- Photo gallery
- Mobile-friendly navigation
- Bengali language interface

### Admin Dashboard
- Secure admin authentication
- Dashboard overview
- Player management
- Player registration management
- Match management
- Match result management
- Gallery content management
- Administrative data management
- Responsive admin navigation

### UI & Experience
- Premium football club-inspired design
- Responsive desktop, tablet, and mobile layouts
- Consistent design system
- Modern typography
- Smooth and intuitive user experience
- Bengali typography support

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| HeroUI | UI components |
| Lucide React | Icons |
| Better Auth | Authentication |
| REST API | Backend communication |
| Vercel | Deployment |

---

## 🎨 Design System

The website follows a premium European football club-inspired visual style.

| Element | Value |
|---|---|
| Primary Background | `#101A17` |
| Secondary Background | `#18251F` |
| Card Background | `#202E27` |
| Accent Color | `#B9F66B` |
| Muted Text | `#A4B0A8` |
| Main Text | `#FFFFFF` |

**Typography:** Hind Siliguri and Noto Sans Bengali.

---

## 📂 Project Structure

```text
morning-football-academy/
│
├── public/
│   └── images/
│       └── logo.jpeg
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │
│   ├── lib/
│   │   └── api-client.ts
│   │
│   └── ...
│
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd morning-football-academy
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, configure the appropriate environment variables in your deployment platform.

### 5. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

---

## 🔗 Backend Repository

This frontend application communicates with a separate backend API built using Express.js, TypeScript, MongoDB, and Better Auth.

**Backend Live URL:**

https://morning-football-academy-server.vercel.app

**API Base URL:**

https://morning-football-academy-server.vercel.app/api/v1

---

## 🚀 Deployment

The frontend is deployed on Vercel.

**Production URL:**

https://morning-football-academy.vercel.app

To deploy your own version:

1. Push the frontend repository to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Deploy the application.

---

## 👨‍💻 Developer

**Mehedi Hasan**

Full-Stack Web Developer

- Portfolio: https://developerjoy.me
- GitHub: https://github.com/

---

## 📄 License

This project was developed for Morning Football Academy.

All rights reserved unless otherwise specified.

---

<p align="center">
  <strong>MORNING FOOTBALL ACADEMY</strong><br />
  RISE TOGETHER. PLAY TO WIN.
</p>
