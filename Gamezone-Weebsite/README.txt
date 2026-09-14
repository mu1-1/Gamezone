GAMEZONE WEBSITE
================

Files:
- index.html
- style.css
- script.js
- logo.jpg

Open index.html in your browser to preview it.

To add your real contact links:
1. Open index.html.
2. Find the two social-card links near the Contact section.
3. Replace href="#" with your Discord server URL and Instagram URL.

To add/edit products:
Edit the product cards in the Digital Currencies section of index.html.

GAMEZONE SECURE ORDER SYSTEM
============================
This package adds a real cart and secure server-side order architecture.
Customer cart data is only a convenience; the server/database must validate products and prices.

DEPLOYMENT TARGET
- Frontend + API: Vercel
- Database: Supabase Postgres
- Order notification: Discord webhook

FILES ADDED
- cart.html / cart.css / cart.js
- checkout.js
- api/orders.js
- api/admin/login.js
- api/admin/orders.js
- api/admin/status.js
- admin.html / admin.js
- supabase/schema.sql
- vercel.json

IMPORTANT
Do NOT put the Supabase service-role key or Discord webhook URL in public HTML/JS.
Set them as Vercel environment variables. The schema uses a server-side order RPC so prices are authoritative in the database.

ENVIRONMENT VARIABLES
SUPABASE_URL=your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=your server-only service role key
DISCORD_WEBHOOK_URL=your Discord channel webhook URL
ADMIN_PASSWORD=use a long random admin password

After creating the Supabase project, run supabase/schema.sql in the SQL editor, then deploy this folder to Vercel.
The admin page is /admin.html.
