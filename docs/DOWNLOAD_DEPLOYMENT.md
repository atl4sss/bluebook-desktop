# Private one-use installer downloads

Implemented in `functions/distribution`; **not deployed**. This service limits
installer downloads only. The desktop app does not yet enforce one-test licenses.
Do not distribute the current unrestricted installer as a licensed build.

## Hosting choice

Use a standalone Google Cloud Run service in the existing Firebase project,
Firestore for grants, and a **private dedicated Cloud Storage bucket** for files.
Cloud Run streams the installer directly; no reusable signed URL is returned.
Do not deploy this download handler as a Firebase HTTP function or proxy it through
Firebase Hosting: installer sizes/transfer times can exceed those services' limits.
Cloud Run supports large streamed responses without setting Content-Length:
https://docs.cloud.google.com/run/quotas

Deployment requires an authorized Google Cloud administrator and billing.
No cloud resources or charges are created by committing these files.

## Administrator setup

1. Enable Firestore, Cloud Run, Cloud Build, Artifact Registry, and Cloud Storage
   in the selected project. Configure billing and usage alerts with the owner.
2. Create a dedicated bucket with uniform bucket-level access and enforced public
   access prevention. Do not add allUsers/allAuthenticatedUsers permissions or
   Firebase download tokens. Upload installers under `installers/`. Keep each
   release at a distinct object path; do not overwrite files with outstanding links.
3. Use a dedicated runtime service account with `roles/storage.objectViewer` on
   that bucket and `roles/datastore.user` on the project. Existing Firestore rules
   deny client access to downloadGrants; Admin SDK uses IAM instead of these rules.
4. Build the image using `functions/Dockerfile` and the `functions` directory as
   build context. The Docker ignore file excludes credentials and unrelated files.
5. Deploy the image to Cloud Run, listening on PORT, with the runtime account,
   request timeout 3600 seconds, concurrency 8, maximum instances 2, minimum 0.
   Allow public invocation: the bearer grant authorizes each download in the app.
   Configure `DOWNLOAD_BUCKET` and `DOWNLOAD_ORIGIN=https://YOUR_SERVICE_HOST` with
   no trailing slash. Reserve/obtain the service URL before serving student links;
   update the environment and revision after initial creation if necessary.
   Do not enable HTTP/2 end-to-end for this Node HTTP/1 server.
6. Confirm the original bucket URL denies anonymous reads. Do not publish the
   same installer in public GitHub Releases or Firebase download URLs.

## Issue and revoke

Run on an administrator workstation using Application Default Credentials (ADC).
Authenticate through `gcloud auth application-default login`; select the intended
project via `GOOGLE_CLOUD_PROJECT`. Never place service account keys in the repo
or desktop app. The administrator needs Firestore writes and bucket object reads.

From `functions`, install dependencies with `npm ci`, then set DOWNLOAD_BUCKET and
DOWNLOAD_ORIGIN in your shell and run:

```sh
node distribution/admin.js issue installers/Bluebook-setup.exe Bluebook-setup.exe 24
```

This returns a grant ID, a personal URL, and expiration (24 hours here; maximum
168). The secret is displayed once. Only its SHA-256 hash is stored in Firestore.
Send the personal URL to the intended recipient. Whoever uses it first can obtain
one transfer; a download link by itself does not authenticate a student's identity.

To revoke an unused link:

```sh
node distribution/admin.js revoke GRANT_ID
```

No public issuance API or admin page is exposed. CLI issuance is authorized by
Google Cloud IAM. Revocation cannot recall bytes already transferred.

## Transfer behavior and verification

GET renders a generic page and does not read/consume the grant. The secret is a
URL fragment, absent from normal HTTP access logs; the page puts it into a POST
body only when the recipient presses Download. Never enable request-body logging.

A transaction changes `issued` to `consumed` before streaming. Concurrent requests
have one winner. Revoked/expired/consumed grants receive 410. Transfers use the
exact object generation recorded when issued. Range/resume requests are rejected.
A missing object returns 503 without consumption. After a started transfer fails,
issue a replacement link; never reset the old grant to issued.

Local checks: `node --test functions/distribution/access.test.js` covers HTTP
replays, concurrent requests against an atomic in-memory store, bad origins,
expiry, revocation, missing objects, and stream failure. Transaction-wrapper tests
use a fake transaction; they do **not** verify live Firestore concurrency.
Before production, verify with deployed Firestore/Storage that two concurrent
POSTs return exactly one full file, checksum matches the uploaded installer, and a
file larger than 32 MiB downloads completely. Also verify cancellation, expiry,
revocation, bucket privacy, and two independent Cloud Run instances.

## Still required for the user's full goal

Device-bound activation, one authoritative test session, durable answers, crash
recovery with the original deadline, and completion/expiry enforcement inside the
desktop app are not implemented. See SINGLE_USE_ACCESS.md. A downloaded file can
still be copied and the current desktop app can still run repeatedly.
