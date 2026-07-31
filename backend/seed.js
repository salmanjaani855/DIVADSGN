import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Plan from "./models/Plan.js";
import Blog from "./models/Blog.js";
import User from "./models/User.js";

const plans = [
  {
    name: "Free",
    price: 0,
    stripePriceId: "price_free_placeholder",
    accessLevel: "free",
    features: ["Access to free articles", "Community comments", "Weekly newsletter"],
  },
  {
    name: "Pro",
    price: 120,
    stripePriceId: "price_pro_placeholder",
    accessLevel: "pro",
    features: [
      "Everything in Free",
      "Access to Pro-tier articles",
      "Downloadable resources",
      "Early access to new posts",
    ],
  },
  {
    name: "Premium",
    price: 260,
    stripePriceId: "price_premium_placeholder",
    accessLevel: "premium",
    features: [
      "Everything in Pro",
      "Access to Premium-tier articles",
      "Priority support",
      "Exclusive deep-dive series",
    ],
  },
];

const sampleBlogs = [
  {
    title: "Getting Started with Node.js in 2026",
    excerpt: "A beginner-friendly tour of the modern Node.js ecosystem.",
    content:
      "<h2>Introduction</h2><p>Node.js remains one of the most popular runtimes for building scalable backends. In this post we cover the basics of setting up a project, understanding the event loop, and writing your first server.</p><p>We'll also touch on <b>ES modules</b>, package managers, and how to structure a maintainable codebase.</p><ul><li>Install Node.js</li><li>Initialize a project</li><li>Write your first route</li></ul><p>By the end of this article you should feel comfortable spinning up a simple API from scratch.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    accessLevel: "free",
    author: "Admin",
    tags: ["node", "javascript", "backend"],
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Which",
    excerpt: "A practical comparison of two essential CSS layout tools.",
    content:
      "<h2>Two Great Tools</h2><p>Both CSS Grid and Flexbox solve layout problems, but they shine in different scenarios. Flexbox is one-dimensional, ideal for rows or columns of items, while Grid is two-dimensional and excels at full page layouts.</p><p>This article walks through real examples of navigation bars, card grids, and responsive dashboards to help you decide.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200",
    accessLevel: "free",
    author: "Admin",
    tags: ["css", "frontend", "design"],
  },
  {
    title: "Designing a Scalable REST API with Express and MongoDB",
    excerpt: "Patterns and pitfalls for building production-grade REST APIs.",
    content:
      "<h2>Architecture Matters</h2><p>As your API grows, a clean separation of concerns between routes, controllers, and models keeps things maintainable. This article dives into middleware composition, error handling strategies, and pagination patterns.</p><p>We also discuss <b>indexing strategies</b> in MongoDB to keep your queries fast as your dataset scales into the millions of documents.</p><p>Finally, we cover rate limiting and caching layers that reduce load on your database under heavy traffic.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
    accessLevel: "pro",
    author: "Admin",
    tags: ["express", "mongodb", "api", "architecture"],
  },
  {
    title: "Implementing Stripe Subscriptions the Right Way",
    excerpt: "Everything you need to know about recurring billing with Stripe.",
    content:
      "<h2>Billing Is Hard</h2><p>Subscription billing involves way more edge cases than a one-off checkout: trials, upgrades/downgrades, failed payments, dunning, and cancellations. This deep dive walks through a production-ready webhook handler and explains why raw request bodies matter for signature verification.</p><p>We cover <b>checkout.session.completed</b>, <b>invoice.payment_failed</b>, and <b>customer.subscription.deleted</b> events with real code you can adapt.</p><p>By the end you'll understand how to keep your database in sync with Stripe's source of truth without polling.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
    accessLevel: "pro",
    author: "Admin",
    tags: ["stripe", "billing", "saas"],
  },
  {
    title: "Advanced System Design: Building a Multi-Tenant SaaS",
    excerpt: "Deep architectural strategies for scaling a SaaS product to thousands of tenants.",
    content:
      "<h2>Multi-Tenancy Strategies</h2><p>Choosing between a shared database with tenant IDs, schema-per-tenant, or fully isolated databases is one of the most consequential decisions in SaaS architecture. This premium deep-dive walks through the trade-offs with real-world benchmarks.</p><p>We also explore <b>data isolation</b>, <b>noisy neighbor mitigation</b>, and how to design your indexes so a single tenant's growth doesn't degrade performance for everyone else.</p><p>Finally we cover migration strategies for moving tenants between isolation models as they grow.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    accessLevel: "premium",
    author: "Admin",
    tags: ["system-design", "saas", "architecture", "scaling"],
  },
  {
    title: "Security Hardening Checklist for Production Node APIs",
    excerpt: "A comprehensive checklist to lock down your Express API before launch.",
    content:
      "<h2>Don't Ship Vulnerable APIs</h2><p>From helmet headers to rate limiting, input sanitization, and secrets management, this premium guide is a checklist-style walkthrough of everything you should verify before taking a Node.js API to production.</p><p>We cover JWT best practices, password hashing cost factors, and how to think about least-privilege access control for admin routes.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200",
    accessLevel: "premium",
    author: "Admin",
    tags: ["security", "node", "best-practices"],
  },
];

const run = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/blogsaas";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[seed] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.error(`[seed] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  try {
    console.log("[seed] Upserting plans...");
    for (const plan of plans) {
      await Plan.findOneAndUpdate({ accessLevel: plan.accessLevel }, plan, {
        upsert: true,
        new: true,
      });
      console.log(`  - ${plan.name} ($${plan.price}/mo) [${plan.accessLevel}]`);
    }

    console.log("[seed] Upserting sample blogs...");
    for (const blog of sampleBlogs) {
      const existing = await Blog.findOne({ title: blog.title });
      if (existing) {
        Object.assign(existing, blog);
        await existing.save();
        console.log(`  - (updated) ${blog.title} [${blog.accessLevel}]`);
      } else {
        const created = new Blog(blog);
        await created.save();
        console.log(`  - (created) ${created.title} -> /${created.slug} [${created.accessLevel}]`);
      }
    }

    console.log("[seed] Upserting admin user...");
    const adminEmail = "admin@example.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash("Admin123!", 10);
      admin = await User.create({
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "admin",
        subscription: { plan: "premium", status: "active" },
      });
      console.log(`  - created admin user: ${adminEmail} / Admin123!`);
    } else {
      admin.role = "admin";
      await admin.save();
      console.log(`  - admin user already exists: ${adminEmail}`);
    }

    console.log("\n[seed] Done! Seeded:");
    console.log(`  - ${plans.length} plans`);
    console.log(`  - ${sampleBlogs.length} blogs`);
    console.log("  - 1 admin user (admin@example.com / Admin123!)");
  } catch (err) {
    console.error("[seed] Error while seeding:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
