This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Exoterior – Maintenance Booking

## Quick setup (your email is already set)

Your booking form is set to send submissions to **mohamedali200bu@gmail.com**. You only need to do this:

1. **Run the site**  
   In the project folder, run: `npm run dev`  
   Open http://localhost:3000 and test the form.

2. **First time someone submits the form**  
   FormSubmit will send an email to mohamedali200bu@gmail.com with an **“Activate”** or **“Confirm”** link.  
   Open that email and **click the link once**. After that, every new booking will arrive in that inbox.

3. **When you put the site online (e.g. Vercel)**  
   In Vercel → your project → **Settings** → **Environment Variables**, add:
   - Name: `NEXT_PUBLIC_FORMSUBMIT_EMAIL`  
   - Value: `mohamedali200bu@gmail.com`  
   Then redeploy. If it’s the first time with this email, check the inbox and click the activation link again.

That’s it. No database or extra signup is required for the form to send to your email.

---

# Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Where the form sends (your email)

Booking submissions are sent to **your email** via [FormSubmit](https://formsubmit.co). You must set your email so the form works:

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_FORMSUBMIT_EMAIL=your-real-email@example.com`.
3. The first time FormSubmit receives a submission to that email, it will send you an activation link; click it once.

After that, every booking (name, phone, address, appointment date/time, services, notes) is emailed to you.

**Send to two addresses (e.g. Exoterior + Mohamed Ali):** set `NEXT_PUBLIC_FORMSUBMIT_EMAIL` to the main address and `NEXT_PUBLIC_FORMSUBMIT_EMAIL_SECONDARY` to the second. Both receive the same email. Activate each address once via FormSubmit’s link.

## How to enable Supabase (slot blocking)

Supabase stores bookings and blocks the same time slot for two people. Follow these steps:

### Step 1: Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign up or log in.
2. Click **“New project”**.
3. Choose your organization (or create one), set a **project name** (e.g. `exoterior`), set a **database password** (save it somewhere safe), and pick a **region** close to you.
4. Click **“Create new project”** and wait until the project is ready (about 1–2 minutes).

### Step 2: Create the appointments table

1. In the left sidebar, open **“SQL Editor”**.
2. Click **“New query”**.
3. Open the file **`lib/supabase-appointments.sql`** in your project and copy **all** its contents.
4. Paste into the Supabase SQL Editor.
5. Click **“Run”** (or press Ctrl+Enter). You should see “Success. No rows returned.”
6. In the left sidebar, open **“Table Editor”**. You should see a table named **`appointments`**.

### Step 3: Get your API keys

1. In the left sidebar, click the **gear icon** (Project Settings).
2. Click **“API”** in the left menu.
3. You will see:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`) → this is your **Supabase URL**.
   - **Project API keys**:
     - **anon public** – do **not** use this for the app.
     - **service_role** – click **“Reveal”** and copy this key. This is your **Service role key**. Keep it secret (do not commit it to Git or share it).

### Step 4: Add the keys to your app

1. Open (or create) the file **`.env.local`** in your project root (same folder as `package.json`).
2. Add these two lines (use your real URL and key from Step 3):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-pasted-here
```

3. Replace `YOUR_PROJECT_REF` with your actual project reference from the URL, and paste the full **service_role** key.
4. Save the file.

### Step 5: Restart and test

1. Stop the dev server (Ctrl+C) and run **`npm run dev`** again so it picks up the new env vars.
2. Open the booking form, pick a date and time, and submit. The slot should then appear as **booked** (unavailable) for that date when you or someone else selects the same date.

### Deploying on Vercel

In your Vercel project: **Settings → Environment Variables**, add the same two variables:

- **NEXT_PUBLIC_SUPABASE_URL** = your Supabase project URL  
- **SUPABASE_SERVICE_ROLE_KEY** = your service role key  

Then **redeploy**. After that, slot blocking works on the live site too.

## Deploy on Vercel

The app is ready to deploy on Vercel. No code edits needed.

1. Push your repo and import the project in [Vercel](https://vercel.com).
2. In the project **Settings → Environment Variables**, add:
   - **Required:** `NEXT_PUBLIC_FORMSUBMIT_EMAIL` = your email (so form submissions go to you).
   - **Optional:** `NEXT_PUBLIC_FORMSUBMIT_EMAIL_SECONDARY` = second recipient (e.g. Mohamed Ali); both get every booking.
   - **Optional (for slot blocking):** `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Redeploy.

FormSubmit works from your Vercel domain. If you use a new email with FormSubmit, check your inbox and click the activation link once.
