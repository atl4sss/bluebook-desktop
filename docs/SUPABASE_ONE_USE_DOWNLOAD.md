# One-use downloads on Supabase Free

Code in `supabase/` is ready to deploy. **No Supabase project is connected or
deployed from this repository yet; no live personal links exist.** The current
GitHub Actions installers are still accessible to repository collaborators and
through any other URLs the organizer has shared. The six-digit test code and
manual organizer approval are a separate feature.

The Windows installer built from commit `b69552b` is
`nsis/Bluebook_0.1.0_x64-setup.exe` inside the Windows artifact of GitHub Actions
Desktop builds run `36156563230`: 5,276,341 bytes, below the Supabase Free
50 MB per-file limit. Use the installer itself, **not** the ZIP with both EXE/MSI.
The macOS artifact is also available but should use its own storage object and
individual personal links.

## First setup (organizer)

1. Create a Supabase Free project. In Project Settings → API, note the project URL.
   Access to the project dashboard is needed to deploy. Never share its `service_role`
   key in chat, GitHub, screenshots, desktop code, or public sites.
2. In the project's SQL Editor, run
   `supabase/migrations/20260925160000_one_use_download.sql`. It creates the
   `installer-downloads` private Storage bucket, the grants table with RLS and a
   transaction-backed atomic claim function. Confirm the bucket is **Private**
   under Storage. If it already existed and was public, fix that before issuing.
3. Open Storage → `installer-downloads`. Upload the EXE under
   `installers/Bluebook_0.1.0_x64-setup.exe`. Confirm it cannot be retrieved by an
   unauthenticated storage URL. Do not add public object policies or share signed
   storage URLs. Keep the original object available while links are active.
4. Deploy `supabase/functions/one-use-download/index.ts` as an Edge Function named
   `one-use-download`. Disable **Verify JWT** for that function only: the
   secret in each personal URL authorizes its POST. Leave the grants table and
   bucket private. Supabase sets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   as server-side runtime variables; confirm they are present for this function.

CLI equivalent (run in the repo, using your account; no secret in commands):

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy one-use-download --no-verify-jwt
```

The dashboard can be used for the SQL, Storage, and Edge Function steps instead.
If the function deployment interface does not support direct source upload, use
CLI for step 4.

## Issue a personal link

On your own computer, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as
private process environment variables (find the key in the Supabase dashboard).
Do not put them in `.env.local` consumed by Vite or GitHub repo variables. Then:

```sh
node scripts/issue-supabase-download.mjs installers/Bluebook_0.1.0_x64-setup.exe Bluebook_0.1.0_x64-setup.exe 24
```

The script checks the private object exists, makes a cryptographically random
secret, stores only its SHA-256 hash and prints the URL once. `24` is the number
of hours before expiry (1–168). Send the printed **Personal link**, not the
original GitHub Actions or Storage download address, to the recipient. Keep the
Grant ID (hash) if you may need to revoke the link:

```sh
node scripts/revoke-supabase-download.mjs GRANT_ID
```

A GET to the personal link does not consume it. The recipient presses the
Download button; an atomic database update claims the grant before the function
streams bytes from private Storage. Repeated POSTs return 410. An interrupted
transfer cannot be resumed; issue a fresh link. Anyone with the personal URL
can use it first. It does not prevent the recipient from copying the already
installed EXE. The app currently asks the organizer to approve each start code,
which is a separate manual control.

## Production verification

Check with a newly issued test link: page loads without consuming; first Download
returns the installer and matches the uploaded SHA-256; reload and re-submit
return 410; a link past expiry returns 410; revocation blocks an unused link;
two simultaneous Download requests result in only one success. If the instance
starts cold, downloads may be delayed. Supabase Free projects pause after a week
of inactivity, so revive the project and verify it before distributing links.

The service-role key grants database and Storage privileges. Keep it on your own
machine only. Rotate it if exposed. The code has no public administrative
endpoint. Current Firebase/Cloud Run distribution code is an alternative design
and is not used by these Supabase links.
