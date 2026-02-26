# Deploy Swarna Roots (Vercel + GoDaddy)

## 1) Push code to GitHub
- Commit changes.
- Push your `swarna-roots` project to a GitHub repository.

## 2) Deploy on Vercel
- Go to [vercel.com](https://vercel.com).
- Click **Add New Project** and import your GitHub repo.
- Framework: **Next.js** (auto-detected).
- Root directory: `swarna-roots` (if repo has multiple folders).
- Deploy once.

## 3) Set production environment variables in Vercel
Set these in **Project Settings -> Environment Variables**:

- `DATABASE_URL`
- `NEXTAUTH_URL=https://swarnaroots.com`
- `NEXT_PUBLIC_SITE_URL=https://swarnaroots.com`
- `NEXTAUTH_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY` (optional but recommended)
- `ORDER_EMAIL_FROM`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_LINKEDIN_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`

Then redeploy.

## 4) Connect domain in Vercel
- In Vercel: **Project Settings -> Domains**
- Add:
  - `swarnaroots.com`
  - `www.swarnaroots.com`

Vercel will show DNS records to configure.

## 5) Configure GoDaddy DNS
In GoDaddy DNS for `swarnaroots.com`, set:

- Type `A`, Host `@`, Value `76.76.21.21`
- Type `CNAME`, Host `www`, Value `cname.vercel-dns.com`

Remove conflicting old `A`/`CNAME` records for `@`/`www`.

## 6) Final production checks
- Open `https://swarnaroots.com`
- Open `https://www.swarnaroots.com`
- Open:
  - `/sitemap.xml`
  - `/robots.txt`
- Place one test order in Razorpay test mode.
- Confirm order + email flow.

## 7) SEO launch checklist
- Add domain property in Google Search Console (`swarnaroots.com`) and verify via DNS TXT.
- Submit sitemap: `https://swarnaroots.com/sitemap.xml`
- Enable Vercel Analytics + Speed Insights.
- Keep product names/descriptions unique and natural-language.
