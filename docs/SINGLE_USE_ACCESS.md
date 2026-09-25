# One-test distribution: implementation requirements

Status: the private one-use download service is implemented in
`functions/distribution` but is not deployed. See DOWNLOAD_DEPLOYMENT.md for setup
and test limits. The executable is still reusable: device activation and one-test
license enforcement are not implemented.

## Confirmed behavior

The owner chose **one test**, not one application launch. Preparation and reopening
are allowed before starting. Starting reserves one test on one device. Completion
permanently consumes the license. A crash must not grant a second test: recovery
must resume the same server-authorized session and its original deadline.

## Proposed deployment using the existing Firebase project

- Keep installers in a private Cloud Storage bucket, separate from public releases.
- Use a server download endpoint with high-entropy, expiring, hashed tokens stored
  in Firestore. A landing-page GET does not consume a token (link previews may GET
  it); an explicit download POST atomically consumes it before streaming the file.
- Stream from private storage; do not redirect to a reusable signed storage URL.
  A dropped transfer requires an administrator to issue a replacement token.
- Issue a separate activation credential. A one-use download token alone cannot
  prevent copying an already downloaded installer.
- Bind activation to a device key pair; keep the private key in the OS credential
  store and register the public key on the server. Require proof of possession on
  subsequent calls, with server nonces and replay protection. A copied installer
  on a different machine has no activated key.
- Server-owned license state: `issued -> activated -> in_progress -> consumed`;
  `revoked` is also terminal. Only trusted server code can update these records.
- Atomically start one session with a fixed start time/deadline; repeated requests
  from that device return the existing session, never a new one.
- Persist same-session answers/progress for crash recovery. The current in-memory
  test state intentionally disappears on restart, so recovery requires additional
  work before one-test licenses can be safely enforced.
- Finish consumes the license idempotently. Do not rely solely on a finish-page
  request: expiration and authoritative progression must prevent replay after a
  client disconnects or suppresses completion.
- Require an online license check at activation/start/resume. Define any allowed
  temporary offline window explicitly; never fall back to an unrestricted test.
- Gate desktop entry and test start on authorization. Do not reuse `enteredCodes`
  as a license store or reinterpret its six-digit code as an activation secret.

## Boundaries

The installer can still be copied. The goal is to make an unactivated copy unable
to start a licensed test. Local flags, reinstall checks, localStorage, and public
hardware identifiers alone are insufficient. Client checks can also be patched;
stronger protection requires server-controlled test content and progression.
Old unrestricted builds cannot be remotely disabled by adding this mechanism to
a new build, and existing public question banks remain accessible.

## Deployment prerequisites still missing

- The actual installer distribution URL/storage location and the intended private
  download host. Repository Actions artifacts are build outputs, not a one-use
  student distribution endpoint.
- An authorized deployment channel for HTTPS server functions and private storage
  in the Firebase project. This session has repository access, not Firebase
  administrative deployment access. Do not commit service-account keys.
- An administrator-only issuance/revocation mechanism, and a production integration
  test covering simultaneous activation, repeated downloads, copied installers,
  interrupted tests, and completion/reinstallation.

## Primary references

- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://docs.cloud.google.com/storage/docs/access-control/signed-urls
