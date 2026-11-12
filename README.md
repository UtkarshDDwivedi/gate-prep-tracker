# 🎒 GATE Prep Tracker — Your Road to GATE 2027 彡

A visually delightful, hand-drawn progress tracker built to guide aspirants along their preparation journey toward GATE 2027. Featuring interactive milestone trails, month-by-month planning, urgent subject prioritization, daily lecture logging, and a day-by-day study history timeline.

![Tech Stack](https://img.shields.io/badge/Next.js-16_(Turbopack)-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Database](https://img.shields.io/badge/Database-Neon_Serverless_Postgres-00e599?style=flat-square&logo=postgresql)
![Auth](https://img.shields.io/badge/Auth-Neon_Auth-00e599?style=flat-square)
![Animations](https://img.shields.io/badge/Animations-Framer_Motion-f43f5e?style=flat-square&logo=framer)

---

## ✨ Features

### 🗺️ Interactive "Road to GATE" Milestones
- **Panoramic Illustrated Trail**: Beautiful rolling green hills, sketched clouds, and wooden signposts marking each monthly milestone leading to the snowy February GATE peak.
- **Swipeable on Mobile**: Native horizontal touch-swipe inertia across an extended road track (`min-w-[880px]`) with enlarged tactile signposts and interactive pagination dots.
- **Desktop Navigation**: Smooth left/right chevron navigation controls with spring-physics hover animations.
- **100% Real-Time Database Metrics**: Dynamic completion percentages computed strictly from your logged records.

### ⚡ Monthly Progress & Urgent Daily Plan
- **Urgent Plan Calculation**: Automatically computes the exact daily pace required (`lectures/day = urgent lectures remaining ÷ days left in month`) to finish urgent subjects on time.
- **Study Cat Mascot**: An animated, headband-wearing study cat cheering on your daily focus sessions.
- **Month Progress Bar**: Smooth animated percentage bars reflecting verified lecture counts.

### 📚 Monthly Subjects Management
- **Add & Carry Over**: Add subjects to any month, or carry over existing subjects across months without losing your cumulative preparation progress.
- **Urgent Toggle**: Mark subjects as "Urgent" (must complete this month) or unmark them anytime with a single tap.
- **Tactile Stepper Counters**: Quick `[-]` and `[+]` controls to log completed lectures on the fly, complete with celebratory confetti upon finishing a subject.
- **Mobile-First Card Design**: Individual pastel-themed cards (Emerald, Amber, Lavender, and Mint) with radiating hand-drawn sketch rays, watercolor blob badges, and quick 3-dot action menus.

### 🕰️ Day-by-Day Study History (`/history`)
- **Preparation Timeline Starting from Day 1**: Track every lecture you've ever completed, grouped day-by-day starting from the very first day you logged.
- **Itemized Daily Breakdowns**: Shows the exact subjects completed each day, with proportional contribution bars and lecture count badges (`+3 lecs`).
- **Comprehensive Summary Metrics**:
  - **Study Days**: Total active preparation days.
  - **Total Lectures**: Cumulative lectures completed across all subjects.
  - **Daily Pace**: Average lectures completed per active study day.
  - **First Day**: Your starting date of GATE preparation.
  - **Best Day**: Your most productive study day.
- **Sort Toggle**: Easily switch between **Chronological (`Day 1 → Latest`)** and **Latest First (`Latest → Day 1`)**.

### 🔐 Authentication & Data Isolation
- Powered by **Neon Auth** (Managed Better Auth) with support for **Email/Password** and **Google OAuth**.
- Complete data privacy: Unauthenticated users see a clean dashboard with sign-in prompts; authenticated users get isolated, persistent records stored in Neon Serverless Postgres.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: [Google Fonts](https://fonts.google.com/) (`Outfit` for crisp UI, `Caveat` for sketched accents)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Celebrations**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Database**: [Neon Serverless Postgres](https://neon.tech/) (`@neondatabase/serverless`)
- **Authentication**: [Neon Auth](https://neon.tech/docs/guides/neon-auth) (`@neon/auth`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A [Neon](https://neon.tech) account with a Postgres database and Neon Auth enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:UtkarshDDwivedi/gate-prep-tracker.git
   cd gate-prep-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the project root:
   ```env
   # Neon Postgres Connection URL
   DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require"

   # Neon Auth Endpoint
   NEON_AUTH_URL="https://<your-neon-auth-endpoint>"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view your GATE Tracker!

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/         # Neon Auth proxy routes
│   │   ├── history/      # Day-by-day lecture logs endpoint
│   │   └── tracker/      # Subjects & monthly plan operations
│   ├── history/          # Study History timeline page (/history)
│   ├── globals.css       # Tailwind v4 theme & font definitions
│   ├── layout.tsx        # Root layout with fonts & metadata
│   └── page.tsx          # Main application page
├── components/
│   ├── AddSubjectModal.tsx       # Modal for adding/customizing subjects
│   ├── AuthModal.tsx             # Sign In / Sign Up dialog (Email & Google)
│   ├── GateTrackerApp.tsx        # Main orchestrator & state container
│   ├── Header.tsx                # Responsive top navigation & profile menu
│   ├── MonthlyProgressCard.tsx   # Urgent plan calculation & Study Cat
│   ├── MonthlySubjectsCard.tsx   # Subject cards (desktop row + mobile cards)
│   ├── RoadToGate.tsx            # Illustrated milestone trail & swipe track
│   └── StudyCat.tsx              # Sketched motivated cat SVG component
├── lib/
│   ├── auth/             # Neon Auth client & server initialization
│   └── db.ts             # Neon Postgres client & schema migration
├── public/               # Static assets & icons
└── README.md
```

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
