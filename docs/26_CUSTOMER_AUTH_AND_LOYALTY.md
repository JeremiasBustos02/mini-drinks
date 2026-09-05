# Customer auth and Mini Club

`/login` is the single email/password entry point for Supabase Auth. A server-side check of `admin_users.auth_user_id` determines the destination: administrators go to `/admin`; all other authenticated users go to `/mi-cuenta`.

`/registro` stores the display name as Supabase user metadata. A database trigger creates the idempotent `customer_profiles` row within the `auth.users` insertion, so email-confirmation mode does not require an immediate session. The migration also backfills profiles for existing non-admin Auth users. Profiles store only display information (`display_name` and optional `phone`), never credentials. `customer_profiles.auth_user_id` and `admin_users.auth_user_id` conceptually reference `auth.users.id`.

`/admin/login` redirects to `/login?next=/admin`. The `next` value is restricted to internal paths and only admins can use an `/admin` destination. `/admin/*` remains protected server-side through `requireAdmin`/`getAdminAccess`; UI redirects are not authorization.

Logout is shared and signs out through Supabase before redirecting to `/`. `/mi-cuenta` shows orders and the Mini Club ledger.

## Mini Sorpresa

Administrators create campaigns and point-code batches at `/admin/mini-club`. Each redeemable URL contains a cryptographically random token; only its SHA-256 hash is stored. Tokens, URLs, CSV exports, and QR images are available only in the admin's one-time batch result and are never logged.

`/canjear/<token>` requires a customer session and performs the mutable claim through a server action. The claim locks the code row, verifies campaign availability, credits a `code_reward` loyalty ledger entry with `code:<reward-code-id>:reward`, updates both loyalty totals, and marks the code redeemed in one PostgreSQL transaction. Future reward types are represented in schema only; discounts, shipping, multipliers, rewards catalogues, and point spending are not implemented.
