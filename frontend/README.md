# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and `[typescript-eslint](https://typescript-eslint.io)` in your project.







## **Project Title**

**BlogSaaS — Subscription-Based Blog Platform** *(or your preferred name)*

## **Short Elevator Pitch (1-2 lines, for a portfolio card/resume bullet)**

> A full-stack SaaS platform where users subscribe to tiered plans (Free/Pro/Premium) to unlock premium blog content, featuring Stripe-powered recurring billing, JWT authentication, and plan-based access control — built with the MERN stack.

## **Full Description (for README / portfolio page)**

**BlogSaaS** is a production-style subscription platform that gates premium written content behind paid membership tiers — similar to how services like Medium's paywall or a newsletter platform (e.g. Substack) work. It was built to demonstrate real-world SaaS engineering patterns: recurring billing, role-based access control, and content-gating logic, rather than just CRUD.

**Problem it solves:** Content creators/publishers need a way to monetize premium articles while still offering free content to attract an audience. This project solves that by implementing a three-tier access model (Free/Pro/Premium) where each blog post is tagged with a required access level, and the backend enforces — server-side, not just visually — whether a given visitor is allowed to see the full content or just a locked preview.

**Core features:**

- **Tiered subscription plans** (Free/Pro/Premium) with Stripe Checkout for recurring billing, a Stripe Customer Portal for self-service plan management, and webhook-driven sync (renewals, failed payments, cancellations automatically update the user's access level in the database).
- **Server-side content gating** — a dedicated access-control middleware compares a user's current plan rank against a blog's required access level before deciding whether to return full content or a stripped ~100-word preview with a `locked` flag, so paywall bypass isn't possible by just editing frontend state.
- **JWT authentication** with bcrypt-hashed passwords, role-based authorization (`user` vs `admin`) protecting admin-only routes.
- **Admin panel** for creating/editing/deleting blog posts, setting each post's access tier, and uploading cover images to Cloudinary.
- **Responsive, animated UI** built with Tailwind CSS and Framer Motion — glassmorphic cards, gradient accents, scroll-reveal animations, matching a modern SaaS landing page aesthetic (adapted from a Figma design).
- **Billing dashboard** showing current plan, renewal date, upgrade/downgrade/cancel actions, and billing history pulled live from Stripe.

**Tech stack:**

- Frontend: React (Vite), Tailwind CSS, Framer Motion, React Router, Axios, Context API for auth state
- Backend: Node.js, Express.js, MongoDB/Mongoose
- Auth: JWT + bcrypt
- Payments: Stripe (Checkout Sessions, Subscriptions API, Webhooks, Billing Portal)
- Media: Cloudinary for image uploads

**Notable engineering challenges solved:**

- Designing an access-control layer that works for both anonymous and authenticated requests (treating anonymous visitors as "free tier" for locked/unlocked computation).
- Correctly handling Stripe's raw-body webhook signature verification alongside a JSON-parsing Express app (mounting the webhook route before the global body parser).
- Keeping local subscription state eventually-consistent with Stripe's source of truth via webhook events (`checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted/updated`) rather than trusting client-reported payment success.

## **Even Shorter (resume bullet style)**

> Built a full-stack subscription blog platform (MERN + Stripe) with tiered content access control, JWT auth, an admin CMS, and webhook-synced recurring billing.

