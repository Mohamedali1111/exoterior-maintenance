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

## Database (optional – for slot blocking)

There is **no database by default**. The form works without one: submissions go to your email only, and all time slots appear available.

To **store appointments and block booked slots** (so others can’t pick the same time):

1. Create a free [Supabase](https://supabase.com) project.
2. In the SQL Editor, run the script in `lib/supabase-appointments.sql` to create the `appointments` table.
3. In `.env.local` (and in Vercel), set:
   - `NEXT_PUBLIC_SUPABASE_URL` – your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` – your service role key (Project Settings → API)

With these set, booked slots are saved and shown as unavailable; if two people book the same slot, only the first succeeds.

## Deploy on Vercel

The app is ready to deploy on Vercel. No code edits needed.

1. Push your repo and import the project in [Vercel](https://vercel.com).
2. In the project **Settings → Environment Variables**, add:
   - **Required:** `NEXT_PUBLIC_FORMSUBMIT_EMAIL` = your email (so form submissions go to you).
   - **Optional (for slot blocking):** `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Redeploy.

FormSubmit works from your Vercel domain. If you use a new email with FormSubmit, check your inbox and click the activation link once.
