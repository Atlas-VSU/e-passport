# VSU E-Passport

A mobile-and-tablet-only web app for the Visayas State University Supreme
Student Council (USSC) campus tour. Students sign in with Google, move through
a road/journey-style passport UI, and "stamp" each campus landmark by
uploading a photo taken on-site. No desktop layout — this is built to be used
on phones and tablets during the physical campus tour.

View the app in AI Studio: https://ai.studio/apps/69cf0224-e4e1-43b0-84d0-6449df318e58

## Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth (Google OAuth provider)
- **Database:** Supabase Postgres
- **Storage:** Supabase Storage (bucket: `stamps`)

## Architecture

```
/app
  /login                        → Google sign-in screen
  /auth/callback                → OAuth callback route handler
  /consent                      → data privacy consent screen (gates access)
  /passport                     → main road/journey view with landmark stamps
  /passport/[landmarkId]        → landmark detail + camera/upload + stamp confirmation
  /passport/complete            → completion/celebration screen

/components
  PassportRoad.tsx              → road/path UI rendering landmark waypoints
  StampBadge.tsx                → stamped/unstamped visual states
  PhotoUpload.tsx                → camera/file upload with preview
  ConsentModal.tsx               → data privacy consent modal
  ProgressTracker.tsx            → stamped/total landmark progress indicator

/lib
  supabase/client.ts            → browser Supabase client
  supabase/server.ts            → server Supabase client
  supabase/middleware.ts        → session refresh + route guard logic
  landmarks.ts                  → static config of campus landmarks

/types
  index.ts                      → types matching the Supabase schema

middleware.ts                   → session refresh, auth + consent route guards
```

## Data Model (Supabase Postgres)

- **profiles** — `id`, `name`, `email`, `avatar_url`, `consent_given`,
  `consent_timestamp`, `created_at`
- **stamps** — `id`, `user_id`, `landmark_id`, `photo_url`, `stamped_at`
  (unique on `user_id` + `landmark_id`)
- A trigger auto-creates a `profiles` row on new `auth.users` signup

Row Level Security is enabled on both tables and on the `stamps` storage
bucket, so users can only read/write their own data.

## Core Flow

1. Student signs in with Google via Supabase Auth.
2. First-time users are routed to the consent screen and must accept before
   continuing; `consent_given` is written to their profile.
3. The passport home screen renders each landmark on a road/path UI as
   **stamped** (photo uploaded) or **unstamped** (no photo yet).
4. Tapping a landmark opens the detail screen, where the student captures or
   uploads a photo, confirms it, and triggers the stamp animation.
5. Progress is tracked against the total landmark count; completing all
   landmarks unlocks the completion screen.

## Run Locally

**Prerequisites:** Node.js, a Supabase project

1. Install dependencies:
   `npm install`
2. Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In your Supabase project, run the SQL migration (tables, trigger, and RLS
   policies) from `supabase/migration.sql`, and enable the Google provider
   under Authentication → Providers.
4. Run the app:
   `npm run dev`