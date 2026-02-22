# CircleUp

<p align="center">
  <img alt="CircleUp - Find your circle!" src="./app/twitter-image.png" width="600">
  <h1 align="center">CircleUp</h1>
</p>

<p align="center">
  Find your circle! A student-run initiative at the University of Maryland
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#prerequisites"><strong>Prerequisites</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#environment-setup"><strong>Environment Setup</strong></a> ·
  <a href="#running-the-app"><strong>Running the App</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a>
</p>

---

## Quick Start

Get CircleUp running locally in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd circleup-v2

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Environment Setup below)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** or **pnpm** package manager
- A **Supabase account** and project ([Create one here](https://database.new))

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd circleup-v2
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## Environment Setup

### 1. Create a Supabase Project

1. Go to [database.new](https://database.new) and create a new Supabase project
2. Wait for your project to be fully provisioned (this takes a few minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (found under "Project URL")
   - **Publishable Key** or **Anon Key** (found under "Project API keys")

### 3. Create Environment File

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

If `.env.example` doesn't exist, create `.env.local` manually with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Add Your Credentials

Open `.env.local` and replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note:** You can use either the new **publishable key** format or the legacy **anon key** format. Both work with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## Running the App

### Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes)

---

## Project Structure

```
circleup-v2/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── events/            # Events feed
│   ├── friends/           # Friends page
│   ├── profile/           # User profile
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client setup
└── public/               # Static assets
```

---

## Key Features

- ✅ **Authentication** - Password-based auth with Supabase
- ✅ **Event Discovery** - Browse and RSVP to events
- ✅ **Social Features** - Connect with friends
- ✅ **User Profiles** - Manage your profile
- ✅ **Responsive Design** - Mobile-first, desktop-optimized
- ✅ **Dark Mode** - Theme switching support

---

## Troubleshooting

### Environment Variables Not Loading

If your environment variables aren't being recognized:

1. Make sure the file is named `.env.local` (not `.env`)
2. Restart your development server after adding/changing variables
3. Check that variable names start with `NEXT_PUBLIC_` for client-side access

### Supabase Connection Issues

- Verify your Supabase project is active and not paused
- Double-check your URL and API key in `.env.local`
- Ensure there are no extra spaces or quotes in your environment variables

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
npm run dev -- -p 3001
```

---

## Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- File issues in the project repository

---

## License

This project is part of a student-run initiative at the University of Maryland.
