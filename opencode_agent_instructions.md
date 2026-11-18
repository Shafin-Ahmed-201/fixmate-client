# FixMate — OpenCode Implementation Blueprint

> **Token-Efficiency Directive:** Read this file once as your single source of truth. Do not repeat boilerplate explanations. Write modular, clean, production-ready code. Batch file edits where possible.

---

## 1. Project & Stack Overview
**FixMate:** On-demand Device & Home Appliance Repair Service Platform.
- **Client:** Next.js (App Router), Tailwind CSS + shadcn/ui (or DaisyUI/HeroUI), BetterAuth client, Lucide Icons, `sonner` / `react-hot-toast`.
- **Server:** Node.js, Express.js, MongoDB (native driver or Mongoose), BetterAuth (MongoDB adapter), `jsonwebtoken`, `stripe`, `cors`, `dotenv`.
- **External APIs:** ImgBB (image uploads), Stripe Checkout & Webhooks (test mode).
- **Repos:** Separate Client (min 20 meaningful commits) and Server (min 12 meaningful commits).

---

## 2. Database Schema (4 Core Collections)
*Note: BetterAuth auto-creates `user`, `session`, `account`, `verification`. Use BetterAuth's `user` collection as `users` via `additionalFields`.*

1. **`users`** (BetterAuth `user` + additionalFields):
   - `_id`, `name`, `email` (unique), `image` (ImgBB URL)
   - `role`: `'customer' | 'technician' | 'admin'` (default: `'customer'`)
   - `phone`: String, `area`: String, `bio`: String
   - *(Optional Pro Plan)*: `plan`: `'free' | 'pro'`
2. **`services`**:
   - `_id`, `title`, `category` (`'Smartphone' | 'Laptop & PC' | 'AC' | 'Refrigerator' | 'TV' | 'Washing Machine' | 'Electrical'`), `description`, `image` (ImgBB), `basePrice` (Number), `estimatedDuration`, `serviceMode` (`'Home Visit' | 'Shop Drop-off'`), `serviceArea`
   - `technicianName`, `technicianEmail`
   - `approvalStatus`: `'pending' | 'approved' | 'rejected'` (default: `'pending'`)
   - `isAvailable`: Boolean (default: `true`), `createdAt`: Date
3. **`bookings`**:
   - `_id`, `serviceId`, `serviceTitle`, `serviceImage`, `category`, `basePrice`, `technicianName`, `technicianEmail`
   - `customerName`, `customerEmail`, `customerPhone`, `address`, `preferredDate` (Date), `problemDescription`
   - `status`: `'requested' | 'accepted' | 'rejected' | 'in-progress' | 'completed' | 'cancelled'` (default: `'requested'`)
   - `finalAmount`: Number (default = `basePrice`, updated when marked `completed`)
   - `paymentStatus`: `'unpaid' | 'paid'` (default: `'unpaid'`)
   - *(Optional)*: `statusHistory`: `[{ status, changedAt }]`, `rating`: Number (1-5), `review`: String
4. **`payments`**:
   - `_id`, `bookingId`, `serviceTitle`, `customerName`, `customerEmail`, `technicianName`, `technicianEmail`
   - `amount`: Number, `currency`: `'usd'`, `transactionId` (Stripe `payment_intent`), `stripeSessionId` (unique), `paymentStatus`: `'paid'`, `paidAt`: Date

---

## 3. Core Business Logic & State Machine (Strict Server Enforcement)

### Job Status Pipeline (One-way, 1 step at a time)
- `requested` → `accepted` (Technician owner only)
- `requested` → `rejected` (Technician owner only — Final)
- `requested` → `cancelled` (Customer owner only — Final)
- `accepted` → `in-progress` (Technician owner only)
- `in-progress` → `completed` (Technician owner only; **must** pass `finalAmount > 0`)
- `completed` (`unpaid`) → `paymentStatus: 'paid'` (Stripe webhook / verification only, once per booking)
- *Reject all other transitions with `400 Bad Request`.*

### Business Rules
- **Signup:** Only `'customer'` or `'technician'` allowed. Force `'customer'` on server if anything else is passed. Admin is seeded manually in DB.
- **Service Visibility:** Public pages only query `{ approvalStatus: 'approved', isAvailable: true }`. Editing a service resets `approvalStatus` to `'pending'`.
- **Booking Constraints:**
  - Only `'customer'` role can book (Technicians/Admins blocked).
  - Block duplicate active bookings (`status` in `['requested', 'accepted', 'in-progress']`) by the same `customerEmail` for the same `serviceId`.
- **Idempotent Payments:** Check `payments` for existing `stripeSessionId` or `bookingId` before inserting to prevent duplicate records from Webhook + Success Page retries.

---

## 4. API Routes & Middlewares (Challenge 2 & 3)
Implement Express middlewares: `verifyToken` (401 if invalid/missing), `verifyCustomer`, `verifyTechnician`, `verifyAdmin` (403 if wrong role). Always verify ownership (`req.user.email === resource.email`).

- **Public:**
  - `GET /api/services` — Supports query params: `search` (regex on `title`/`category`), `category`, `serviceMode`, `sort` (`price_asc`, `price_desc`, `newest`), `page`, `limit` (Challenge 1).
  - `GET /api/services/:id` — Returns single approved & available service.
- **Authenticated (`verifyToken`):**
  - `PATCH /api/users/profile` — Update `name`, `phone`, `area`, `bio`, `image`.
- **Customer (`verifyToken, verifyCustomer`):**
  - `POST /api/bookings` — Create booking.
  - `GET /api/bookings/my` — Customer's bookings.
  - `PATCH /api/bookings/:id/cancel` — Cancel if `requested`.
  - `GET /api/payments/my` — Customer's payment history.
  - `POST /api/payments/create-checkout-session` — Fetch `finalAmount` from DB (`unit_amount = finalAmount * 100`), pass `bookingId` & `customerEmail` in metadata.
  - `GET /api/payments/verify?session_id=...` — Verify Stripe session & record payment idempotently.
- **Technician (`verifyToken, verifyTechnician`):**
  - `GET /api/services/my` — Technician's own services.
  - `POST /api/services` — Add service (`approvalStatus: 'pending'`).
  - `PATCH /api/services/:id` — Update service (resets `approvalStatus: 'pending'`) or toggle `isAvailable`.
  - `DELETE /api/services/:id` — Delete own service.
  - `GET /api/bookings/technician` — Bookings for technician.
  - `PATCH /api/bookings/:id/status` — Enforce state machine & `finalAmount`.
- **Admin (`verifyToken, verifyAdmin`):**
  - `GET /api/admin/stats` — Counts for overview & charts.
  - `GET /api/admin/users` & `PATCH /api/admin/users/:id/role` (Prevent admin changing own role).
  - `GET /api/admin/services` & `PATCH /api/admin/services/:id/approval` (`approved` / `rejected`).
  - `GET /api/admin/bookings` & `GET /api/admin/payments`.
- **Webhook (Raw body parser before `express.json()`):**
  - `POST /api/webhook/stripe` — Handle `checkout.session.completed`.

---

## 5. Frontend Routes & UI Checklist

### Layouts & Navigation
- **Public Layout:** Sticky Navbar (Consistent Wrench/Tool Logo, Home `/`, Services `/services`, About `/about`; Logged-out: Sign In/Up; Logged-in: Avatar dropdown with Name, Role Badge, Role Dashboard link, Profile, Sign Out; Mobile hamburger) + Footer (Logo, tagline, links, categories, contact, X icon).
- **Dashboard Layout:** Collapsible sidebar (role-based links), top bar (avatar, name, role, Home link), no public footer. Protect routes & handle reload persistence without flashing `/sign-in`.

### Pages
1. `/` (Home): Hero + CTA to `/services`, 6 Latest Approved Services (equal-height cards), 4-Step How It Works, Clickable Category Cards (`/services?category=...`) + Trust Stats/Testimonials.
2. `/services`: Server-driven Search, Category & Mode filters (synced with URL query params), Sort dropdown, Responsive Grid (3-4 cols desktop, 2 tablet, 1 mobile), Empty state.
3. `/services/[id]`: Full service details, Technician card, Role-aware Request Repair modal/form (Phone, Address, Future/Today Date, Problem Desc >= 20 chars).
4. `/about`: How It Works & platform mission.
5. `/sign-in` & `/sign-up`: Validation (Password: >=6 chars, 1 uppercase, 1 lowercase), Role selector cards (Customer/Technician only), Toasts, Redirects.
6. `/payment/success` & `/payment/cancel`: Session verification & status UI.
7. `/dashboard/profile`: Update Name, Phone, Area, Bio, ImgBB Avatar upload (live navbar update).
8. **Customer Routes:** `/dashboard/customer` (Stats + Chart), `/dashboard/customer/bookings` (Cancel modal for `requested`, Pay Now for `completed` + `unpaid`), `/dashboard/customer/payments`.
9. **Technician Routes:** `/dashboard/technician` (Stats + Chart), `/dashboard/technician/add-service` (ImgBB file upload), `/dashboard/technician/my-services` (Edit, Delete modal, Availability switch), `/dashboard/technician/requests` (Status filter, action buttons + Final Amount modal on complete).
10. **Admin Routes:** `/dashboard/admin` (Stats + Revenue/Status Charts), `/dashboard/admin/users` (Role selector), `/dashboard/admin/services` (Approve/Reject), `/dashboard/admin/bookings`, `/dashboard/admin/transactions` (Total revenue header + table).
11. **Global States:** `loading.tsx` skeletons, custom repair-themed `not-found.tsx`, `error.tsx`, confirmation modals, consistent status badge colors (`requested`: blue, `accepted`: indigo, `in-progress`: amber, `completed`: green, `rejected`/`cancelled`: red/gray).

---

## 6. Execution Phases (Follow in Order)
1. **Scaffold & Auth:** Init Next.js & Express apps, configure `.env`/`.env.local`, setup BetterAuth + MongoDB adapter + JWT bridge + Express role middlewares.
2. **Backend API & Seed:** Build all CRUD, search/filter/sort, status pipeline, Stripe Checkout + Webhook routes, and create a `seed.js` script (1 Admin, 2+ Technicians, 12+ Approved Services across all 7 categories, sample bookings).
3. **Public UI:** Build Navbar, Footer, Home, Browse Services (URL-synced filters), Service Details + Booking Form, Auth pages, Loading/404/Error pages.
4. **Dashboards & Payments:** Build Dashboard Layout, Customer/Technician/Admin views with Recharts/charts, ImgBB uploader, Stripe flow, and Profile page.
5. **Polish & README:** Verify CORS, production origins, reload persistence, and write `README.md` with live URL, credentials, features, and packages.