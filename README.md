# PlumberS — Admin Console

Plumbing & Fleet Management SaaS Dashboard     
Stack: **React 18 + Vite + Tailwind CSS 3 + React Router v6 + Axios**

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and set VITE_API_BASE_URL

# 3. Start dev server
npm run dev
```

App runs at **http://localhost:5173**  
Root redirects to `/admin/dashboard`

---

## Project Structure

```
src/
├── assets/
│   └── icons/            # Static icon assets (if any)
├── components/
│   ├── layout/
│   │   ├── AdminLayout.jsx   # Root layout (sidebar + header + outlet)
│   │   ├── Sidebar.jsx       # Collapsible sidebar nav
│   │   └── TopHeader.jsx     # Top header with breadcrumb + search
│   ├── ui/
│   │   └── NavIcons.jsx      # SVG nav icon components
│   └── shared/               # Shared UI components (Phase 2+)
├── hooks/
│   └── useSidebar.js         # Sidebar open/close state + mobile detection
├── pages/
│   ├── dashboard/            # Figma frame 1:3
│   ├── jobs/                 # Figma frame 1:506
│   ├── schedule/             # Figma frame 1:960
│   ├── fleet/                # Figma frame 1:1298
│   ├── safety/               # Figma frame 1:1619
│   ├── employees/            # Figma frame 1:1995
│   ├── reports/              # Figma frame 1:2392
│   ├── settings/             # Figma frame 1:2711
│   ├── createjob/            # Figma frame 1:2846
│   ├── jobdetails/           # Figma frame 1:3449
│   ├── filephotos/           # Figma frame 1:3895
│   ├── notes/                # Figma frame 1:4268
│   └── createmanager/        # Figma frame 1:4630
├── routes/
│   └── adminRoutes.js        # Single source of truth: routes + nav items
├── utils/
│   └── api.js                # Axios instance (placeholder)
├── App.jsx                   # Root router
├── main.jsx                  # Entry point
└── index.css                 # Tailwind base + global styles
```

---

## Routes

| Path | Page |
|------|------|
| `/admin/dashboard` | Dashboard |
| `/admin/jobs` | Jobs |
| `/admin/schedule` | Schedule |
| `/admin/fleet` | Fleet |
| `/admin/safety-forms` | Safety Forms |
| `/admin/employees` | Employees |
| `/admin/reports` | Reports |
| `/admin/settings` | Settings |
| `/admin/create-job` | Create Job |
| `/admin/jobs/:jobId` | Job Details |
| `/admin/jobs/:jobId/files` | File & Photos of Job |
| `/admin/jobs/:jobId/notes` | Notes & Communications |
| `/admin/create-manager` | Create Manager |

---

## Build

```bash
npm run build
# Output: dist/
```

---

## AWS Static Deployment (S3 + CloudFront)

1. **Build**: `npm run build`
2. **Upload** `dist/` to S3 bucket with static website hosting enabled
3. **CloudFront**: Set default root object to `index.html`
4. **SPA routing**: Add CloudFront error page rule — 403/404 → `/index.html` (200)  
   This ensures React Router handles all client-side routes.

---

## Design Tokens (Tailwind)

Key custom tokens defined in `tailwind.config.js`:

| Token | Value | Usage |
|-------|-------|-------|
| `brand` | `#f54900` | Primary accent, active nav |
| `sidebar-bg` | `#0f172b` | Sidebar background |
| `ink` | `#0f172b` | Primary text |
| `surface` | `#ffffff` | Card background |
| `surface-subtle` | `#f1f5f9` | Page background |
| `border` | `#e2e8f0` | Default border |
| `w-sidebar` | `256px` | Sidebar width |
| `h-header` | `61px` | Header height |