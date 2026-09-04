# Jara — Full-Stack E-Commerce Platform (Bangladesh)

Jara is a production-oriented online store built for the Bangladesh retail market. It covers the complete commerce loop: a Bengali storefront, cash-on-delivery checkout, courier fulfillment with [Steadfast](https://steadfast.com.bd/), and a role-based admin dashboard for catalog, orders, customers, and store configuration.

The app is designed as a **COD-first** shop (no customer accounts required). Shoppers browse, add to cart, checkout with name / phone / address, then track orders by phone number.

---

## Resume highlights

Use these bullets on a CV or LinkedIn project section:

- Built a full-stack e-commerce platform (Next.js, React, MongoDB) with a Bengali storefront and a role-based admin dashboard.
- Implemented COD checkout with Bangladesh district/region mapping, configurable shipping classes, and variant-aware stock.
- Integrated Steadfast Courier (single + bulk consignment create) into the order fulfillment workflow.
- Added Meta Pixel tracking for product views, cart, and purchase events to support paid-ads optimization.
- Delivered store CMS features: hero banners, brand assets, theme colors, client reviews, and contact/policy pages — all editable from admin.
- Designed RBAC (Super Admin, Shop Manager, Moderator) with hashed passwords, HTTP-only session cookies, and permission-gated APIs.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| UI | Material UI 9, Tailwind CSS 4, Lucide / MUI icons |
| Motion | Motion (Framer Motion) |
| Data fetching | TanStack React Query |
| Forms | React Hook Form |
| Charts | Recharts |
| Database | MongoDB |
| Media | ImageKit (authenticated admin uploads) |
| Courier | Steadfast Courier API |
| Analytics | Meta (Facebook) Pixel |
| Language / SEO | Bengali (`bn` / `bn_BD`), sitemap, robots, Open Graph |

---

## Storefront features

### Catalog & merchandising

- Home page with hero banner carousel, category sections, “why choose us,” and homepage client reviews
- Product listing with search (`?q=`), category filtering, and responsive product grid
- Product detail pages: image gallery, sale vs regular pricing, ratings, share, related products
- Product variants (size / color / weight or custom attributes) with per-variant stock
- Out-of-stock handling for products and individual variants
- Category directory with nested / organized browsing
- Dynamic shop logo, favicon, and theme colors from site settings

### Cart, wishlist & checkout

- Persistent cart and wishlist (client-side) with quantity limits based on stock
- Cart and wishlist slide-over drawers from the navbar
- Buy now and add-to-cart flows
- Checkout with:
  - Customer name, 11-digit BD phone validation, full address
  - Bangladesh division → district selection and Dhaka vs outside-Dhaka delivery area
  - Shipping classes and area-based charges, including free-delivery products
  - Cash on delivery as the payment method
  - Line-item variant selection and quantity edits
- Thank-you page after successful order placement

### Order tracking & support

- Public **order tracking** by phone number (latest orders, status timeline in Bengali)
- Support page covering contact, shipping policy, returns, and privacy (content driven by store settings)
- Click-to-call / SMS / email contact actions

### SEO & marketing

- Per-page metadata, canonical URLs, Open Graph, and Twitter cards
- `sitemap.xml` and `robots.txt`
- Meta Pixel: PageView, product ViewContent, AddToCart, InitiateCheckout, Purchase (BDT)
- Configurable Pixel ID from the admin dashboard

---

## Admin dashboard features

Access: `/admin/login` → `/dashboard`  
Admin routes are `noindex` and gated by session + role. The shell uses a collapsible sidebar (desktop drawer / mobile overlay), English ops copy, and responsive tables that collapse into mobile cards with pagination.

| Path | Module |
| --- | --- |
| `/dashboard` | Overview |
| `/dashboard/orders` | Orders & courier |
| `/dashboard/products` | Product list |
| `/dashboard/products/new` | Create product |
| `/dashboard/products/[id]/edit` | Edit product |
| `/dashboard/products/attributes` | Variant attributes |
| `/dashboard/categories` | Categories |
| `/dashboard/customers` | Customers |
| `/dashboard/reports/repeat-customers` | Repeat-customer orders |
| `/dashboard/settings/general` | Brand & theme |
| `/dashboard/settings/pixel` | Meta Pixel |
| `/dashboard/settings/steadfast` | Courier credentials |
| `/dashboard/settings/shipping` | Areas & rates |
| `/dashboard/settings/contact` | Store contact |
| `/dashboard/settings/banners` | Hero banners |
| `/dashboard/settings/reviews` | Homepage reviews |
| `/dashboard/users` | Staff accounts |
| `/dashboard/account` | Own profile |

### Authentication & access control

- HTTP-only cookie sessions (7-day TTL) plus a client session helper
- Hashed admin passwords; env-based super-admin seed (`npm run db:seed:admin`)
- Route + API permission checks — users only see nav items they can use
- Three roles:

| Role | Access |
| --- | --- |
| **Super Admin** | Overview, orders, catalog, customers, all settings, staff users, reports |
| **Shop Manager** | Overview, products / attributes / categories, customers, own account |
| **Moderator** | Orders, reports, own account (default landing: orders) |

### Overview

- KPI cards: total revenue, orders, pending (new) orders, delivered orders, product count, low stock (qty ≤ 5), out of stock, unique customers, average order value
- Fraudulent / excluded statuses are omitted from revenue
- 6-month revenue chart (Recharts)
- Recent activity feed and recent-orders table
- Quick actions: add product, view orders, categories

### Orders & fulfillment

Ops-focused COD workflow, not a generic Shopify clone.

- Search by order number, customer name, or phone
- Date filters: Today, Yesterday, 7 / 15 / 30 days, Lifetime, custom from–to
- Filter by fulfillment status
- Status pipeline:
  - New order → Order confirmed → Entered in Steadfast → Out for delivery
  - Ops flags: No response, Will inform later, Color code pending, Scammer / fraudulent
- Multi-select + **bulk send to Steadfast**
- Per-order **Send to courier** (creates consignment; skips if already sent)
- Copy consignment ID / tracking code; open Steadfast tracking URL
- **Print invoice** (A5) and **print courier sticker**
- Click-to-call, copy phone, WhatsApp the customer
- Repeat-customer chip → filtered report for that phone
- View modal: items, pricing, delivery, Steadfast IDs
- Edit modal: status, delivery method, add/remove line items (product picker), qty / unit price / line discount, customer name / phone / address / area, shipping fee, order-level discount
- Delete order
- Desktop table + mobile cards

### Catalog — products

- List with thumbnail, bilingual title, sale vs regular price, discount %, stock summary (including variants)
- Debounced search and category filter; create / edit / delete
- Product form:
  - Regular vs variable product type
  - Titles (BN / EN), auto slug, brand/vendor, category, description
  - Regular + sale price with auto discount percentage
  - Featured image + gallery uploads via ImageKit (auth token from admin API)
  - Shipping class
  - Manual rating / review count (shown on the storefront)
  - Simple stock qty + stock status, or per-variant stock table
  - Variant type driven by attribute definitions (size, color, weight, or custom)

### Catalog — attributes

- CRUD for product attributes: English / Bangla labels, slug, option placeholder (e.g. `S, M, L, XL`), sort order
- Used as the variant picker on product create/edit

### Catalog — categories

- Create / edit / delete with name, auto slug, and ImageKit image
- Drag-and-drop reorder (persisted)
- Pagination; also available as a tab on the products screen

### Customers

- Phone-centric profiles built from order history (no shopper login)
- Stats: total customers, repeat customers, total spent
- Search by name or phone
- Detail modal: spend, order count, order history with status and totals
- Link through to that customer’s orders

### Repeat-customer report

- Opens from a repeat-customer chip on Orders
- Same orders table, pre-filtered by phone (`?phone=`)

### Staff users (Super Admin)

- List staff with role chips
- Create user (username, display name, password, role)
- Edit name, role, or reset password
- Delete user (cannot remove the signed-in account)

### My account

- Update display name
- Change password (current password + confirmation, min 6 characters)

### Store settings (CMS)

Operators can rebrand and reconfigure the live shop without a deploy.

| Section | Features |
| --- | --- |
| **General** | Tagline, short description, copyright; primary color + presets (theme tokens derived automatically); logo & favicon upload; social links (platform, URL, enable/disable) |
| **Meta Pixel** | Pixel ID, enable/disable switch, storefront-ready status |
| **Steadfast** | Base URL, API key, secret, enable switch, **test connection** |
| **Shipping** | Named delivery areas; shipping classes with per-area charges or free-delivery flag |
| **Contact** | Phone, email, address shown in navbar, footer, and support |
| **Hero banners** | ImageKit upload, alt text, link URL, show-on-homepage toggle, reorder/remove |
| **Client reviews** | Name, location, quote, star rating, sort order, show-on-homepage; CRUD |

---


## Architecture notes

```
src/
  app/                 # App Router pages + API routes
  components/          # Storefront, dashboard, providers
  hooks/               # Cart, wishlist, products, dashboard, settings
  lib/                 # MongoDB, auth, shipping, courier, Pixel, SEO
```

- **Server modules** load catalog, settings, and dashboard summaries on the server; the storefront hydrates with React Query.
- **REST-style Route Handlers** under `src/app/api/` separate public store APIs from `/api/admin/*` (permission-checked).
- **Site settings** act as a lightweight CMS so operators can rebrand and reconfigure without code deploys.
- Storefront copy and UI are **Bengali-first**; the dashboard is English for operations staff.

---

## Public routes

| Path | Purpose |
| --- | --- |
| `/` | Home |
| `/products` | Catalog + search |
| `/products/[id]` | Product detail |
| `/categories` | Category directory |
| `/checkout` | COD checkout |
| `/thankyou` | Order confirmation |
| `/orders-traking` | Track by phone |
| `/support` | Contact & policies |
| `/admin/login` | Staff login |
| `/dashboard/*` | Admin panel |

---

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB connection string
- ImageKit account (admin image uploads)
- Optional: Steadfast API credentials, Meta Pixel ID, public site URL

### Setup

```bash
npm install
cp env.example .env.local
```

Fill in `MONGODB_URI`, `BDNAME`, admin seed credentials, and ImageKit keys. See `env.example`.

```bash
npm run db:seed:admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:seed:admin` | Seed the env-based super admin |

---

## Project status

Private application (`package.json` name: `jara`). Built as a complete store + ops console for a Bangladesh COD retailer, not a generic storefront template.
