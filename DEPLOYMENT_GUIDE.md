# 🚀 DhillonSMM / BotClips: Complete Zero-Cost Cloudflare & Vercel Deployment Guide

This guide details how to launch your SMM Panel **100% free of charge** using your custom domain, **Cloudflare**, **Vercel**, and **Supabase**, with a zero-downtime path to migrate to a VPS in the future.

---

## Architecture Overview

```
[ Your Custom Domain ] 
         │
         ▼
[ Cloudflare (Free) ] ── (DNS, Universal SSL, DDoS Defense, Edge Caching)
         │
         ▼ (CNAME)
[ Vercel (Free Hobby Plan) ] ── (Next.js 15 Fullstack App & Automated APIs)
         │
         ▼ (SSL Pooled Connection)
[ Supabase (Free Tier) ] ── (PostgreSQL Database)
```

---

## Step 1: Set up Free Supabase Database (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a project name (e.g. `dhillionsmm`), set a strong database password, and select region **South Asia (Mumbai)** or **Singapore** for fastest speeds in India.
3. Once the database initializes, go to **Project Settings** -> **Database**.
4. Copy the connection strings:
   - **Connection Pooling (Transaction mode - port 6543)** -> Save this as `DATABASE_URL`
   - **Direct connection (Session mode - port 5432)** -> Save this as `DIRECT_URL`
5. Replace `[YOUR-PASSWORD]` in the string with the password you set.

---

## Step 2: Set up Cloudflare for Your Custom Domain (5 minutes)

1. Log in to [cloudflare.com](https://cloudflare.com) and click **+ Add a Site**.
2. Enter your domain name (e.g., `yourdomain.com`).
3. Select the **Free** plan ($0/month).
4. Cloudflare will scan your existing records. Click **Continue**.
5. Cloudflare will provide you with **two Nameservers** (e.g., `eva.ns.cloudflare.com` and `jax.ns.cloudflare.com`).
6. Go to your domain registrar (GoDaddy, Namecheap, Hostinger, etc.) and replace your registrar nameservers with Cloudflare's two nameservers.
7. Under **SSL/TLS** in Cloudflare:
   - Set encryption mode to **Full** or **Full (Strict)**.
   - Enable **Always Use HTTPS**.

---

## Step 3: Deploy Fullstack App to Vercel (Free Tier) (3 minutes)

1. Push your code to a private GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial launch of BotClips SMM Panel"
   git branch -M main
   git remote add origin https://github.com/yourusername/dhillionsmm.git
   git push -u origin main
   ```
2. Log into [vercel.com](https://vercel.com) using your GitHub account.
3. Click **Add New** -> **Project**, select your `dhillionsmm` repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: `[Your Supabase Transaction Pooler URL]`
   - `DIRECT_URL`: `[Your Supabase Direct URL]`
   - `JWT_SECRET`: `[Any random 32+ character secret]`
   - `CRON_SECRET`: `[Any random 16+ character secret]`
   - `NEXT_PUBLIC_SITE_NAME`: `BotClips`
   - `NEXT_PUBLIC_CURRENCY_SYMBOL`: `₹`
5. Click **Deploy**. Vercel will automatically build the Next.js app and provide you with a `.vercel.app` domain.

---

## Step 4: Link Your Custom Domain in Vercel & Cloudflare (2 minutes)

1. In your Vercel project dashboard, go to **Settings** -> **Domains**.
2. Type your domain (e.g., `yourdomain.com` or `panel.yourdomain.com`) and click **Add**.
3. Vercel will show the required DNS record:
   - **Type**: `CNAME`
   - **Name**: `@` (or `panel`)
   - **Target**: `cname.vercel-dns.com`
4. Go to your **Cloudflare Dashboard** -> **DNS** -> **Records**:
   - Add a `CNAME` record:
     - **Name**: `@`
     - **Target**: `cname.vercel-dns.com`
     - **Proxy status**: **Proxied** (Orange cloud icon - provides free DDoS defense, SSL, and global edge cache).
5. Within 1-2 minutes, Vercel will verify the domain, and your website will be live worldwide with green SSL lock!

---

## Step 5: Connecting Your Upstream SMM Provider

1. Open your panel website: `https://yourdomain.com/admin`
2. Navigate to **SMM Providers** -> **Connect New Provider**.
3. Enter your upstream provider's details:
   - **Provider Name**: e.g., JustAnotherPanel, Peakerr, Secsers, HQSmart
   - **API Endpoint URL**: e.g., `https://justanotherpanel.com/api/v2`
   - **API Secret Key**: your provider API key
4. Click **Test Connection**. Your live provider balance will be fetched instantly.
5. All user orders placed on your site will automatically dispatch to your upstream provider!

---

## Step 6: Future Migration to VPS (When You Are Ready)

Because this codebase is built using standard Next.js and Docker, migrating to a VPS (e.g. Hetzner, DigitalOcean, Contabo, AWS) takes less than 5 minutes with zero code changes:

1. SSH into your VPS (Ubuntu 22.04 / 24.04):
   ```bash
   git clone https://github.com/yourusername/dhillionsmm.git
   cd dhillionsmm
   cp .env.example .env
   # Edit .env with your production variables
   docker compose up -d --build
   ```
2. In Cloudflare DNS:
   - Change your `A` record from Vercel to your VPS IP address.
3. Done! Cloudflare will instantly route all traffic to your VPS with 0 seconds of downtime.
