# FixMate — Client

The web frontend for **FixMate**, a repair-services marketplace that connects customers
with verified technicians for smartphone, laptop, AC, refrigerator, TV, washing-machine
and electrical repairs.

Built with the Next.js App Router, Tailwind CSS v4 and the **shadcn/ui base-nova** kit
(Base UI primitives), with BetterAuth sessions and a JWT-authenticated REST API.

## Tech stack

| Layer      | Choice                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                                      |
| Styling    | Tailwind CSS v4 + shadcn/ui **base-nova** (Base UI, not Radix)          |
| Auth       | BetterAuth (email/password + Google, EdDSA JWTs)                        |
| Data       | Typed `fetch` layer against the Express API (`lib/api.ts`)             |
| Charts     | recharts via the shadcn chart wrapper                                   |
| Toasts     | sonner                                                                  |
| Icons      | lucide-react                                                            |
| Formatting | Prettier + prettier-plugin-tailwindcss                                  |

## Prerequisites

- Node.js 20+
- The FixMate API server running (default `http://localhost:5000`) — see
  `../fixmate-server`
- A MongoDB database (used by BetterAuth for users/sessions)

## Getting started

```bash
npm install
npm run dev
```

The app runs on <http://localhost:3000>.

### Environment (`.env`)

| Variable                    | Purpose                                             |
| --------------------------- | --------------------------------------------------- |
| `BETTER_AUTH_SECRET`        | Secret used to sign auth JWTs                       |
| `BETTER_AUTH_URL`           | Public base URL of this app                         |
| `MONGODB_URI`               | MongoDB connection string for BetterAuth            |
| `NEXT_PUBLIC_API_URL`       | Base URL of the Express API (`http://localhost:5000`) |
| `GOOGLE_CLIENT_ID/SECRET`   | Google OAuth (optional)                             |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Optional — enables ImgBB hosting for uploads        |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` | Stripe test keys (server-side checkout) |

> **Image uploads:** with `NEXT_PUBLIC_IMGBB_API_KEY` set, images upload to ImgBB.
> Without a key, the picker automatically compresses the file (≤800px JPEG) and stores
> it as a data URL — so uploads work out of the box with no external service.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run format     # prettier --write
```

## Project structure

```
app/
  (public)/           # marketing shell (navbar + footer)
    page.tsx          # home — hero, steps, categories, featured services
    services/         # browse with URL-synced search/category/mode/sort/pagination
      [id]/           # service detail + booking request modal
    about/            # about page
  (auth)/             # centered auth shell
    sign-in/          # email + password
    sign-up/          # role cards (customer/technician) + password rules
  dashboard/          # protected shell (role sidebar + topbar + session guard)
    page.tsx          # redirects to the role's dashboard home
    profile/          # profile editor (name, phone, area, bio, avatar)
    customer/         # overview + chart, bookings (cancel/pay), payments
    technician/       # overview, add-service, my-services, requests
    admin/            # overview + charts, users, services approval, bookings, transactions
  payment/
    success/          # Stripe return — verifies & records the payment
    cancel/           # Stripe cancellation return
  api/auth/[...all]/  # BetterAuth route handler
components/           # logo, navbar, footer, badges, cards, dialogs, image upload…
lib/                  # api.ts (JWT fetch layer), auth.ts, auth-client.ts,
                      # types.ts, constants.ts, format.ts, image.ts
```

## How the pieces fit together

### Auth & API calls

- BetterAuth keeps an http-only session cookie on this origin; `GET /api/auth/token`
  exchanges it for a short-lived JWT.
- `lib/api.ts` caches that JWT in memory (refreshing before expiry) and sends
  `Authorization: Bearer …` to the Express API on every request. `ApiError` carries the
  HTTP status so pages can distinguish 401s (redirect to sign-in) from validation errors.
- Role is stored on the user (`customer` | `technician` | `admin`, default `customer`);
  `/dashboard` redirects to the role's home and the sidebar/nav only shows allowed links.

### Booking state machine

`requested → accepted → in-progress → completed`, with `rejected`/`cancelled` as
terminal states. Customers can cancel only while `requested`; technicians drive the
rest and must supply a positive final amount to complete. The UI only ever offers the
legally available transitions and the server re-checks every one of them.

### Payments

“Pay now” creates a Stripe Checkout session server-side and redirects to Stripe.
`/payment/success` calls `GET /api/payments/verify?session_id=…`, which records the
payment idempotently (webhook + verify share one recorder), then shows the receipt.

## Demo accounts (seeded by `npm run seed` in fixmate-server)

| Role       | Email                          | Password     |
| ---------- | ------------------------------ | ------------ |
| Admin      | `admin@fixmate.com`            | `Admin@1234` |
| Technician | `arif.hassan@fixmate.com`      | `Technician@123` |
| Technician | `sumaiya.khan@fixmate.com`     | `Technician@123` |
| Customer   | `rahim.customer@fixmate.com`   | `Customer@123` |
| Customer   | `jasmin.customer@fixmate.com`  | `Customer@123` |
