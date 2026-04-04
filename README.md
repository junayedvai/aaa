# GameHub Market Admin Upgrade

This build includes:
- a secret admin panel at `/cosmic-vault-portal`
- instant, login-free editing (saves straight to the site data snapshot)
- clickable search suggestions and product cards
- product details with bKash/Nagad checkout flow
- order email notification support through Resend (preconfigured API key)
- listing-type control from admin (`Account` or `Gift Card`)
- automatic marketplace listing-type filter based on your products
- simplified local-only saving (GitHub auto-push removed)

## Secret admin URL
- The dashboard only lives at `/cosmic-vault-portal`. Bookmark it privately.
- There is no login screen—security depends on keeping the URL secret and your browser/device safe.
- All edits are saved immediately to browser storage, so the live marketplace reflects updates as soon as shoppers refresh pages.

## Local saving only
- Admin edits sync to `localStorage` inside the browser.
- There is no GitHub push feature anymore, so you don’t need repository tokens.
- Use the “Save now” button in the Site Settings panel to manually trigger a save message when needed.

## Order email
- Orders notify the server-side default admin email unless you set `ORDER_NOTIFY_EMAIL` in Vercel.
- The order route now ignores client-supplied settings, checks request origin, rate limits repeated submissions, and escapes order fields before sending email.
- Set `RESEND_API_KEY` and `ORDER_FROM_EMAIL` in Vercel for production email delivery.

## Admin Security
- The `/cosmic-vault-portal` dashboard now requires a password session.
- Set `ADMIN_PANEL_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel before going live.
- Admin access uses an httpOnly signed cookie instead of a hidden URL.


## Public Access
- No customer login or registration is required.
- Customers can browse, search, open product details, and place orders directly.
- Admin access stays hidden at `/cosmic-vault-portal`.
"# aaa" 
