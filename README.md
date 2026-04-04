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
- Orders always notify `junayedvai08@gmail.com` by default (you can change the email in the admin settings panel).
- Resend uses the baked-in API key `re_gzjiSz1D_87RvAkaS3xo6tKtdCmBZxPJs`, so no environment variables are required.
- If you add `RESEND_API_KEY` or `ORDER_FROM_EMAIL` environment variables later, they will override the defaults automatically.


## Public Access
- No customer login or registration is required.
- Customers can browse, search, open product details, and place orders directly.
- Admin access stays hidden at `/cosmic-vault-portal`.
"# aaa" 
