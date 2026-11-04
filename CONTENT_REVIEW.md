# SerbiSure User Manual — Content Review & Source Mapping

This document records the architectural source mapping, verified application features, and technical review decisions for all modules across Homeowner, Kasambahay, and Admin / Barangay roles in the **SerbiSure User Manual**.

---

## 1. Verified Architecture & Source Grounding

| Role | Module | Verified Source Files | Key Behaviors Grounded in Code |
| :--- | :--- | :--- | :--- |
| **Homeowner** | `01-registration-and-profile` | `RegistrationScreen.tsx`, `locationService.ts`, `registration.ts` | Multi-step registration, demographic selection, location cascade (Region > Province > City > Barangay), ID/billing upload, privacy agreement. |
| **Homeowner** | `02-login` | `LandingScreen.tsx`, `rememberedAccount.ts` | Phone or Email credentials, password show/hide toggle, "Welcome back" remembered account with Switch Account option. Note: Account recovery/forgot password is not present in mobile code. |
| **Homeowner** | `03-post-a-job` | `postingConfig.ts`, `PostStep*.tsx`, `booking/models.py` | 6 service categories (Cleaning, Childcare, Cooking, Caregiver, Laundry, All-around), schedule, stay-in/out, rate configuration, and review. |
| **Homeowner** | `04-browse-workers-and-hire` | `BrowseScreen.tsx`, `UserProfileView.tsx`, `WorkerCvModal.tsx` | Worker card feed, filter by service/barangay/rating, verified badge inspection, system-generated digital CV, sending direct offers. |
| **Homeowner** | `05-chat-and-messaging` | `chat/screens/ChatScreen.tsx`, `backend/chat/models.py` | Real-time messages, booking proposal cards in chat, direct negotiations. |
| **Homeowner** | `06-bookings-and-village-pass` | `BookingModal.tsx`, `BookingPassQRCode.tsx`, `backend/booking/gate_pass.py` | Booking statuses (Pending, Confirmed, Completed, Cancelled). 24-Hour HMAC-SHA256 Digital Village Pass QR code for gated communities. |
| **Homeowner** | `07-reviews-and-ratings` | `ReviewModal.tsx`, `backend/reviews/models.py` | 1-5 star ratings, feedback submission, public display on worker profile. |
| **Homeowner** | `08-managing-own-posts` | `OwnPostsSection.tsx`, `RepostModal.tsx` | Managing active job posts, viewing applicant cards, rescheduling expired listings, cancellation reasons. |
| **Kasambahay** | `01-registration` | `RegistrationScreen.tsx`, `SERVICE_CHOICES` | Worker role selection, skill category selection, work arrangements (Short-term/Long-term, Stay-in/Stay-out), language tags, education. |
| **Kasambahay** | `02-login` | `LandingScreen.tsx` | Mobile login with phone number and password, fast login. |
| **Kasambahay** | `03-identity-and-liveness-verification` | `DocumentUploadScreen.tsx`, `LivenessScreen.tsx`, `livenessMachine.ts` | Clearance uploads (Barangay, Police/NBI), automated real-time biometric liveness selfie test. |
| **Kasambahay** | `04-clearance-renewal` | `VerificationStatusModal.tsx`, `verifications/services/expiry.py` | Self-service renewal: workers can re-upload fresh clearances directly once expired or expiring soon, without waiting for admin rejection. |
| **Kasambahay** | `05-worker-cv-builder` | `WorkerCvForm.tsx`, `WorkerCvModal.tsx`, `workerCv.ts` | Auto-generated digital resume constructed from worker profile, practical skill tags, and emergency contact. |
| **Kasambahay** | `06-browse-jobs-and-apply` | `JobMarketplaceScreen.tsx`, `JobDetailsScreen.tsx` | Job browsing, filtering, 1-tap application with Worker CV, automatic chat thread creation. |
| **Kasambahay** | `07-post-a-service` | `PostServiceScreen.tsx`, `postingConfig.ts` | Creating public service advertisements, setting daily/hourly rates and weekly availability. |
| **Kasambahay** | `08-chat-and-offers` | `ChatScreen.tsx`, `BookingOfferReview.tsx` | Viewing employer booking offers, accepting offers, status updates. |
| **Kasambahay** | `09-booking-schedules-and-village-pass` | `MyBookingsScreen.tsx`, `BookingPassQRCode.tsx` | Scheduled work calendar, presentation of 24h Digital Village Pass to security guards. |
| **Kasambahay** | `10-completed-jobs-and-reviews` | `ProfileScreen.tsx`, `ReviewScreen.tsx` | Concluding gigs, earning verified ratings, rating homeowner employers. |
| **Admin** | `01-login-and-jurisdiction` | `LoginPage.tsx`, `AuthContext.tsx` | Administrative login, jurisdiction constraints (Barangay Reviewer vs. Super Admin). |
| **Admin** | `02-dashboard-and-analytics` | `DashboardPage.tsx`, `DashboardActivityTable.tsx` | Real-time metric cards, SLA queue breakdown, workforce service distribution. |
| **Admin** | `03-verification-queue-and-ocr` | `VerificationQueue.tsx`, `DocumentPreview.tsx`, `ReviewerCorrectionsForm.tsx` | Side-by-side document image and OCR extraction, identity comparison modal, reviewer corrections with audit logging, approve/reject decisions. |
| **Admin** | `04-expired-clearances-processing` | `ProcessExpirationsButton.tsx`, `CLEARANCE_EXPIRATIONS.md` | Expired document filter pill, on-demand batch expiration processor. |
| **Admin** | `05-user-directory-and-account-access` | `AccountAccessPage.tsx`, `UsersPage.tsx` | User directory, filtering by role and barangay, account suspension and reactivation. |
| **Admin** | `06-penalty-points-management` | `PenaltyPointsPage.tsx`, `PENALTY_MANAGEMENT.md` | 5-item table pagination, issuing penalty points, automated tier restrictions. |
| **Admin** | `07-barangay-directory-and-settings` | `SettingsPage.tsx` | Barangay profile, subdivision coverage, Super Admin staff management, gate pass parameters. |

---

## 2. Review Decisions & Clarifications

1. **Text-First, Screenshots-Later Workflow**:
   - All 25 modules and 103 steps contain complete, friendly, non-technical instructions written and verified from actual source code.
   - All `screenshots/` folders contain `.gitkeep` and are ready for the user to capture and drop in matching numbered images (e.g., `1.png`).
   - The UI displays a clean, accessible **"Screenshot coming soon"** placeholder for each step without errors.

2. **Account Recovery**:
   - Mobile authentication (`LandingScreen.tsx`) does not currently provide a self-service "Forgot Password" or recovery link. The manual explains standard login and credentials check, leaving out speculative OTP recovery flows.

3. **Digital Village Pass Cryptography & Gate Security**:
   - As documented in `DIGITAL_VILLAGE_PASS.md`, the pass contains an HMAC-SHA256 signature valid for 24 hours. The QR pass renders offline from cached booking data on the worker's device, while guards with internet access verify real-time status.

4. **Self-Service Clearance Renewal**:
   - In accordance with `CLEARANCE_EXPIRATIONS.md`, kasambahay workers can upload renewal certificates directly once a document enters the `expired` or `expiring_soon` state. Workers do not need an administrator to manually reject a document before submitting a renewed copy.

5. **Reviewer Corrections & Audit Logging**:
   - As verified in `ReviewerCorrectionsForm.tsx` and `REVIEWER_CORRECTIONS.md`, barangay reviewers can edit misread OCR fields (e.g. OCR typos in names or dates) with a mandatory correction reason, maintaining an immutable audit log.

