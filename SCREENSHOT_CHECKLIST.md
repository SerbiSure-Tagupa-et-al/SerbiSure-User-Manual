# SerbiSure User Manual — Screenshot Capture Checklist

Rows marked **RE-CAPTURE** or **NEW** need current main-branch screenshots. Startup notes do not change the existing login screenshot.

This checklist contains every screen to capture for the **SerbiSure User Manual**.

## 📸 Capture Conventions & Guidelines
1. **Before-Action Rule**: Capture the screen/state being described **before** triggering the primary tap, click, or typing action. For example, for a step describing "Tap Register", capture the screen with the form filled and the Register button visible.
2. **Result-Only Screens**: For final success screens, confirmation dialogs, or generated passes, capture the resulting screen after completion.
3. **Orientation**:
   - **Mobile (Homeowner & Kasambahay)**: Capture in **Portrait** orientation on a mobile device or emulator (e.g. 1080x2400 or 1170x2532).
   - **Admin / Barangay**: Capture in **Landscape / Desktop** orientation (e.g. 1920x1080) on a desktop web browser.
4. **Privacy & Redaction**: Use realistic synthetic sample data (e.g., test names, sample addresses, test contact numbers). **Never capture real IDs, real personal addresses, real phone numbers, or genuine live QR pass URLs.**
5. **Image Format & Naming**:
   - Supported extensions: `.png`, `.jpg`, `.jpeg`, `.webp`.
   - Filenames match the step number exactly (e.g. `1.png`, `2.png`, `3.png`).
   - Store images in the exact destination directory listed for each step.
   - When you place an image in its folder, the website automatically replaces the "Screenshot coming soon" placeholder during development, or after a rebuild for the published site!

---


# 🏠 Homeowner Guides

### Module: Registration & Identity Verification (`homeowner/01-registration-and-profile`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Start Registration & Select Homeowner Role | Role selection screen titled "How would you like to join?" showing the "I am a Homeowner" card button | `docs/homeowner/01-registration-and-profile/screenshots/1.png` |
| - [ ] | **2** | Fill In Personal and Account Details | RE-CAPTURE: Registration personal details form, including +63 phone field, password and Next. | `docs/homeowner/01-registration-and-profile/screenshots/2.png` |
| - [ ] | **3** | Enter Your Address and Give Consent | RE-CAPTURE: Homeowner address form with location selectors, street, ZIP and both consent boxes. | `docs/homeowner/01-registration-and-profile/screenshots/3.png` |
| - [ ] | **4** | Take Your Registration Face Photo | RE-CAPTURE: Homeowner Face Verification captured-selfie review with Retake Photo and Use This Photo. | `docs/homeowner/01-registration-and-profile/screenshots/4.png` |
| - [ ] | **5** | Submit Your National ID | RE-CAPTURE: Homeowner Identity Documents screen with National ID front/back, Submit and Skip. | `docs/homeowner/01-registration-and-profile/screenshots/5.png` |

### Module: Logging In to SerbiSure (`homeowner/02-login`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open SerbiSure to the Sign In Screen | Mobile welcome screen showing the "Log in" button at the bottom | `docs/homeowner/02-login/screenshots/1.png` |
| - [ ] | **2** | Enter Email or Phone & Password | Sign in form showing the "Email or phone number" field and password field | `docs/homeowner/02-login/screenshots/2.png` |
| - [ ] | **3** | Fast Login with Remembered Account ("Welcome Back") | Returning screen showing "Welcome back, [First Name]" with "Log in" and "Switch account" | `docs/homeowner/02-login/screenshots/3.png` |

### Module: Post a Job Listing (`homeowner/03-post-a-job`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Post a Job | RE-CAPTURE: Main app screen with the plus Create a post button beside the bottom bar, signed in as job poster. | `docs/homeowner/03-post-a-job/screenshots/1.png` |
| - [ ] | **2** | Choose Services and Work Type | RE-CAPTURE: Post a Job, Step 1 of 3, with services, ENGAGEMENT, WORK SETUP and Next. | `docs/homeowner/03-post-a-job/screenshots/2.png` |
| - [ ] | **3** | Enter the Job Location | RE-CAPTURE: Post a Job Step 2 of 3 showing the work address fields and Use Profile Address. | `docs/homeowner/03-post-a-job/screenshots/3.png` |
| - [ ] | **4** | Set Daily Work Hours | RE-CAPTURE: Post a Job Step 2 with Work hours picker open, showing daily start and end times. | `docs/homeowner/03-post-a-job/screenshots/4.png` |
| - [ ] | **5** | Add Household Instructions | RE-CAPTURE: Post a Job Step 2 showing INSTRUCTIONS (OPTIONAL) and OFFER AMOUNT. | `docs/homeowner/03-post-a-job/screenshots/5.png` |
| - [ ] | **6** | Enter the Offer Amount | RE-CAPTURE: Post a Job Step 2 showing OFFER AMOUNT with the daily or monthly unit and Next. | `docs/homeowner/03-post-a-job/screenshots/6.png` |
| - [ ] | **7** | Review and Post Your Job | RE-CAPTURE: Post a Job Step 3 of 3 showing preview, summary, agreement and Post Job. | `docs/homeowner/03-post-a-job/screenshots/7.png` |

### Module: Browse Workers & Send Offers (`homeowner/04-browse-workers-and-hire`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Browse Public Posts | RE-CAPTURE: Home Recent Posts card showing owner name/photo and description; capture the worker post appropriate to this role. | `docs/homeowner/04-browse-workers-and-hire/screenshots/1.png` |
| - [ ] | **2** | Filter the Posts | RE-CAPTURE: Filter & Sort panel showing categories, booking type, setup, maximum rate and location; no minimum-rating control. | `docs/homeowner/04-browse-workers-and-hire/screenshots/2.png` |
| - [ ] | **3** | View a Worker Profile and CV | RE-CAPTURE: Worker public profile showing About Kasambahay and View CV. | `docs/homeowner/04-browse-workers-and-hire/screenshots/3.png` |
| - [ ] | **4** | Read Verification and Feedback | RE-CAPTURE: Worker public profile with Reviews & Feedbacks selected, rating and feedback summary visible. | `docs/homeowner/04-browse-workers-and-hire/screenshots/4.png` |
| - [ ] | **5** | Start a Conversation | RE-CAPTURE: Service post details with Message Kasambahay visible. | `docs/homeowner/04-browse-workers-and-hire/screenshots/5.png` |

### Module: Chat & In-App Messaging (`homeowner/05-chat-and-messaging`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open the Messages Tab & Select a Conversation | Mobile app screen showing open the messages tab & select a conversation | `docs/homeowner/05-chat-and-messaging/screenshots/1.png` |
| - [ ] | **2** | Discuss Job Terms, Schedules & Specific Needs | Mobile app screen showing discuss job terms, schedules & specific needs | `docs/homeowner/05-chat-and-messaging/screenshots/2.png` |
| - [ ] | **3** | Send a Booking Offer in Chat | RE-CAPTURE: Chat booking offer review, with actual dates, hours, pay, agreement and Send Offer visible. | `docs/homeowner/05-chat-and-messaging/screenshots/3.png` |

### Module: Bookings & Digital Village Pass (`homeowner/06-bookings-and-village-pass`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Your Bookings | RE-CAPTURE: My Bookings & Hires list with its five tabs and Details buttons. | `docs/homeowner/06-bookings-and-village-pass/screenshots/1.png` |
| - [ ] | **2** | Check the Agreed Booking Details | RE-CAPTURE: Booking details review with saved dates, work hours, work days, address, pay and status. | `docs/homeowner/06-bookings-and-village-pass/screenshots/2.png` |
| - [ ] | **3** | Open and Refresh the Digital Village Pass | RE-CAPTURE: Booking details with Digital Village Pass QR and BK booking code; redact the live signed QR before adding the screenshot. | `docs/homeowner/06-bookings-and-village-pass/screenshots/3.png` |
| - [ ] | **4** | Read the Guard Check Result | RE-CAPTURE: Guard public pass page with a test booking result; show status words and redact private details and signed link. | `docs/homeowner/06-bookings-and-village-pass/screenshots/4.png` |
| - [ ] | **5** | Complete the Job | RE-CAPTURE: Ongoing booking card before Complete; use the Complete Job dialog for a separate reference if needed. | `docs/homeowner/06-bookings-and-village-pass/screenshots/5.png` |

### Module: Reviews & Feedback (`homeowner/07-reviews-and-ratings`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open a Completed Booking Review | RE-CAPTURE: Completed booking card showing Leave Review or Mandatory Service Feedback prompt. | `docs/homeowner/07-reviews-and-ratings/screenshots/1.png` |
| - [ ] | **2** | Select Star Ratings for Service Quality | Mobile app screen showing select star ratings for service quality | `docs/homeowner/07-reviews-and-ratings/screenshots/2.png` |
| - [ ] | **3** | Write and Submit Feedback | RE-CAPTURE: Review form showing YOUR EXPERIENCE, character guidance and Submit Review. | `docs/homeowner/07-reviews-and-ratings/screenshots/3.png` |

### Module: Managing Your Job Posts (`homeowner/08-managing-own-posts`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Find My Recent Posts | RE-CAPTURE: Personal Info with My Recent Posts selected and an own public job card visible. | `docs/homeowner/08-managing-own-posts/screenshots/1.png` |
| - [ ] | **2** | Open Your Post Details | RE-CAPTURE: Own Post Details showing Work hours, Location, About / Instructions, Cancel Post and Close. | `docs/homeowner/08-managing-own-posts/screenshots/2.png` |
| - [ ] | **3** | Agree on Dates in Chat | RE-CAPTURE: Employer chat with a worker, showing the booking-offer entry control before composing a dated offer. | `docs/homeowner/08-managing-own-posts/screenshots/3.png` |
| - [ ] | **4** | Cancel a Public Post | RE-CAPTURE: Cancel Post confirmation dialog with Remove this post from the public feed?, Keep Post and Cancel Post. | `docs/homeowner/08-managing-own-posts/screenshots/4.png` |


# 🧹 Kasambahay Guides

### Module: Kasambahay Registration (`kasambahay/01-registration`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Choose the Kasambahay Worker Role | Role selection screen titled "How would you like to join?" showing the "I am a Kasambahay" card button | `docs/kasambahay/01-registration/screenshots/1.png` |
| - [ ] | **2** | Fill In Personal and Account Details | RE-CAPTURE: Registration personal details form, including +63 phone field, password and Next. | `docs/kasambahay/01-registration/screenshots/2.png` |
| - [ ] | **3** | Select Services You Offer | RE-CAPTURE: Worker registration work-profile form with SERVICES YOU OFFER expanded. | `docs/kasambahay/01-registration/screenshots/3.png` |
| - [ ] | **4** | Choose Work Preferences and Rates | RE-CAPTURE: Worker registration work-profile form showing work preferences and expected monthly/daily rates. | `docs/kasambahay/01-registration/screenshots/4.png` |
| - [ ] | **5** | Fill In Your Background | RE-CAPTURE: Lower worker registration work-profile form showing experience, education, civil status and children. | `docs/kasambahay/01-registration/screenshots/5.png` |
| - [ ] | **6** | Enter Your Address and Give Consent | RE-CAPTURE: Worker address form with location selectors, street, ZIP and both consent boxes. | `docs/kasambahay/01-registration/screenshots/6.png` |

### Module: Kasambahay Login (`kasambahay/02-login`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open the SerbiSure App to the Sign In Screen | Mobile app screen showing open the serbisure app to the sign in screen | `docs/kasambahay/02-login/screenshots/1.png` |
| - [ ] | **2** | Enter Your Contact Number and Password | Mobile app screen showing enter your contact number and password | `docs/kasambahay/02-login/screenshots/2.png` |
| - [ ] | **3** | One-Tap Sign In with Saved Profile | Mobile app screen showing one-tap sign in with saved profile | `docs/kasambahay/02-login/screenshots/3.png` |

### Module: Identity & Liveness Verification (`kasambahay/03-identity-and-liveness-verification`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Document Verification | RE-CAPTURE: Profile settings showing Get Verified and the current verification status. | `docs/kasambahay/03-identity-and-liveness-verification/screenshots/1.png` |
| - [ ] | **2** | Select Your NBI Clearance | RE-CAPTURE: Document Verification upload area with NBI Clearance and Police Clearance cards. | `docs/kasambahay/03-identity-and-liveness-verification/screenshots/2.png` |
| - [ ] | **3** | Submit Both Required Clearances | RE-CAPTURE: Document Verification with both clearance images selected and Submit Documents visible. | `docs/kasambahay/03-identity-and-liveness-verification/screenshots/3.png` |
| - [ ] | **4** | Check Your Face Photo | RE-CAPTURE: Profile avatar status pop-up with a rejected test photo, reviewer note and Retake Photo; no rejection banner at top of Profile. | `docs/kasambahay/03-identity-and-liveness-verification/screenshots/4.png` |
| - [ ] | **5** | Read the Review Results | RE-CAPTURE: Document Verification Submitted Documents list showing real status labels and reviewer feedback. | `docs/kasambahay/03-identity-and-liveness-verification/screenshots/5.png` |

### Module: Clearance Expiry & Renewal (`kasambahay/04-clearance-renewal`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Check for an Expired Clearance | RE-CAPTURE: Profile Renewal needed notice for an expired required clearance. | `docs/kasambahay/04-clearance-renewal/screenshots/1.png` |
| - [ ] | **2** | Open the Renewal Upload | RE-CAPTURE: Expired clearance row with its date and Upload renewed clearance button. | `docs/kasambahay/04-clearance-renewal/screenshots/2.png` |
| - [ ] | **3** | Submit the Renewed Clearance | RE-CAPTURE: Document Verification renewal upload with the new clearance selected and Submit Documents visible. | `docs/kasambahay/04-clearance-renewal/screenshots/3.png` |

### Module: Worker Profile & Generated CV (`kasambahay/05-worker-cv-builder`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Your Worker CV | RE-CAPTURE: SerbiSure CV view with the pencil Edit CV control, View PDF and Download PDF. | `docs/kasambahay/05-worker-cv-builder/screenshots/1.png` |
| - [ ] | **2** | Edit Services, Rates and Experience | RE-CAPTURE: Upper Edit CV Details form showing services, work preferences, rates, languages, experience and optional skill selector. | `docs/kasambahay/05-worker-cv-builder/screenshots/2.png` |
| - [ ] | **3** | Edit Personal Details and Save | RE-CAPTURE: Lower Edit CV Details form showing education, civil status, children, Cancel and Update. | `docs/kasambahay/05-worker-cv-builder/screenshots/3.png` |
| - [ ] | **4** | View or Download the PDF | RE-CAPTURE: Saved SerbiSure CV with View PDF and Download PDF visible. | `docs/kasambahay/05-worker-cv-builder/screenshots/4.png` |

### Module: Browse Jobs & Apply (`kasambahay/06-browse-jobs-and-apply`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Browse Public Posts | RE-CAPTURE: Home Recent Posts card showing owner name/photo and description; capture the homeowner post appropriate to this role. | `docs/kasambahay/06-browse-jobs-and-apply/screenshots/1.png` |
| - [ ] | **2** | Filter the Posts | RE-CAPTURE: Filter & Sort panel showing categories, booking type, setup, maximum rate and location; no minimum-rating control. | `docs/kasambahay/06-browse-jobs-and-apply/screenshots/2.png` |
| - [ ] | **3** | Read the Full Job Details | RE-CAPTURE: Job details sheet showing ABOUT THIS ROLE, Work hours and Apply Now, without dates. | `docs/kasambahay/06-browse-jobs-and-apply/screenshots/3.png` |
| - [ ] | **4** | Apply for the Job | RE-CAPTURE: Job details sheet before tapping Apply Now. | `docs/kasambahay/06-browse-jobs-and-apply/screenshots/4.png` |
| - [ ] | **5** | Discuss Dates with the Homeowner | RE-CAPTURE: Chat opened from a job application, with the application context and message input visible. | `docs/kasambahay/06-browse-jobs-and-apply/screenshots/5.png` |

### Module: Post a Service Advertisement (`kasambahay/07-post-a-service`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Post a Service | RE-CAPTURE: Main app screen with the plus Create a post button beside the bottom bar, signed in as service poster. | `docs/kasambahay/07-post-a-service/screenshots/1.png` |
| - [ ] | **2** | Choose Services and Work Type | RE-CAPTURE: Post a Service, Step 1 of 3, with services, ENGAGEMENT, WORK SETUP and Next. | `docs/kasambahay/07-post-a-service/screenshots/2.png` |
| - [ ] | **3** | Set Location and Daily Hours | RE-CAPTURE: Post a Service Step 2 of 3 showing location and Work hours; no date or weekday controls. | `docs/kasambahay/07-post-a-service/screenshots/3.png` |
| - [ ] | **4** | Add Your Notes and Expected Rate | RE-CAPTURE: Post a Service Step 2 showing ABOUT YOU (OPTIONAL), OFFER AMOUNT and Next. | `docs/kasambahay/07-post-a-service/screenshots/4.png` |
| - [ ] | **5** | Review and Post Your Service | RE-CAPTURE: Post a Service Step 3 of 3 showing preview, summary, agreement and Post Service. | `docs/kasambahay/07-post-a-service/screenshots/5.png` |

### Module: Chat & Booking Offers (`kasambahay/08-chat-and-offers`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Messages to View Homeowner Inquiries | Mobile app screen showing open messages to view homeowner inquiries | `docs/kasambahay/08-chat-and-offers/screenshots/1.png` |
| - [ ] | **2** | Review a Booking Offer | RE-CAPTURE: Received booking offer review showing the saved dates, hours, work days, address and pay. | `docs/kasambahay/08-chat-and-offers/screenshots/2.png` |
| - [ ] | **3** | Accept or Decline the Offer | RE-CAPTURE: Received booking offer with Accept and Decline controls visible. | `docs/kasambahay/08-chat-and-offers/screenshots/3.png` |

### Module: Schedules & Digital Village Pass (`kasambahay/09-booking-schedules-and-village-pass`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Your Bookings | RE-CAPTURE: My Jobs & Contracts list with its five tabs and Details buttons. | `docs/kasambahay/09-booking-schedules-and-village-pass/screenshots/1.png` |
| - [ ] | **2** | Open and Refresh the Digital Village Pass | RE-CAPTURE: Booking details from a job-post application showing Digital Village Pass and BK code; redact the signed QR. | `docs/kasambahay/09-booking-schedules-and-village-pass/screenshots/2.png` |
| - [ ] | **3** | Show the Pass to the Guard | RE-CAPTURE: Guard public pass page for a pending test application showing amber Do not enter yet; redact signed link. | `docs/kasambahay/09-booking-schedules-and-village-pass/screenshots/3.png` |

### Module: Completed Jobs & Reputation (`kasambahay/10-completed-jobs-and-reviews`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Record Job Completion | RE-CAPTURE: My Jobs & Contracts Ongoing booking card showing Complete. | `docs/kasambahay/10-completed-jobs-and-reviews/screenshots/1.png` |
| - [ ] | **2** | Read Feedback on Your Profile | RE-CAPTURE: Personal Info with Reviews & Feedbacks selected, rating and positive-feedback summary visible. | `docs/kasambahay/10-completed-jobs-and-reviews/screenshots/2.png` |
| - [ ] | **3** | Review Your Experience with the Homeowner | RE-CAPTURE: Review form for the homeowner showing stars, YOUR EXPERIENCE and Submit Review. | `docs/kasambahay/10-completed-jobs-and-reviews/screenshots/3.png` |


# 🏛️ Admin / Barangay Guides

### Module: Admin Login & Jurisdiction Access (`admin/01-login-and-jurisdiction`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Navigate to the SerbiSure Admin Portal | Admin desktop browser view showing navigate to the serbisure admin portal | `docs/admin/01-login-and-jurisdiction/screenshots/1.png` |
| - [ ] | **2** | Sign In with Your Official Account | RE-CAPTURE: Admin login form showing Email or Username, Password, Remember me and Sign In. | `docs/admin/01-login-and-jurisdiction/screenshots/2.png` |
| - [ ] | **3** | Check Your Jurisdiction | RE-CAPTURE: Signed-in portal header and sidebar showing the test account role and assigned jurisdiction. | `docs/admin/01-login-and-jurisdiction/screenshots/3.png` |

### Module: Dashboard & Activity Analytics (`admin/02-dashboard-and-analytics`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Read the Workforce Totals | RE-CAPTURE: Dashboard workforce cards with their exact labels, explanatory note and Sync Real-Time. | `docs/admin/02-dashboard-and-analytics/screenshots/1.png` |
| - [ ] | **2** | Read Verification Status and Employment Trends | RE-CAPTURE: Dashboard verification status and employment trend panels with available filters. | `docs/admin/02-dashboard-and-analytics/screenshots/2.png` |
| - [ ] | **3** | Read Skills and Service Distribution | RE-CAPTURE: Skills & Service Distribution panel with service percentages and its explanatory note. | `docs/admin/02-dashboard-and-analytics/screenshots/3.png` |

### Module: Verification Queue & Reviewer Corrections (`admin/03-verification-queue-and-ocr`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open the Verification Queue | RE-CAPTURE: Verifications page with Verification Queue and recent/oldest sort selector. | `docs/admin/03-verification-queue-and-ocr/screenshots/1.png` |
| - [ ] | **2** | Find an Applicant and Document | RE-CAPTURE: Expanded applicant in Verification Queue showing separate documents and Review controls. | `docs/admin/03-verification-queue-and-ocr/screenshots/2.png` |
| - [ ] | **3** | Inspect the Scan and Read Details | RE-CAPTURE: Document review panel with scan, extracted fields, Flagged Discrepancies and Click to Zoom Scan. | `docs/admin/03-verification-queue-and-ocr/screenshots/3.png` |
| - [ ] | **4** | Compare the Photo with the Document | RE-CAPTURE: Review applicant dialog with profile photo, document and image controls. | `docs/admin/03-verification-queue-and-ocr/screenshots/4.png` |
| - [ ] | **5** | Correct Confirmed Details | RE-CAPTURE: Edit details form with Account details, Document details and Save corrections; no correction-reason field. | `docs/admin/03-verification-queue-and-ocr/screenshots/5.png` |
| - [ ] | **6** | Approve or Reject the Document | RE-CAPTURE: Document review decision area showing APPROVE, REJECT and optional rejection-reason input. | `docs/admin/03-verification-queue-and-ocr/screenshots/6.png` |

### Module: Expired Clearances Management (`admin/04-expired-clearances-processing`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Find Expired Clearances | RE-CAPTURE: Expanded verification applicant with an expired clearance row and saved expiry date. | `docs/admin/04-expired-clearances-processing/screenshots/1.png` |
| - [ ] | **2** | Process Expired Clearances | RE-CAPTURE: Process expired clearances confirmation showing counts and jurisdiction, using test data. | `docs/admin/04-expired-clearances-processing/screenshots/2.png` |
| - [ ] | **3** | Review Updated Worker Expiry Statuses | Admin desktop browser view showing review updated worker expiry statuses | `docs/admin/04-expired-clearances-processing/screenshots/3.png` |

### Module: User Directory & Account Controls (`admin/05-user-directory-and-account-access`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open the User Directory | RE-CAPTURE: Users directory with its account-type tabs and user list. | `docs/admin/05-user-directory-and-account-access/screenshots/1.png` |
| - [ ] | **2** | Search and Filter Accounts | RE-CAPTURE: Account Access filters showing Search name or barangay, All users and All access. | `docs/admin/05-user-directory-and-account-access/screenshots/2.png` |
| - [ ] | **3** | View a User and Open Their Conversation | RE-CAPTURE: Users directory with a selected user detail panel and Message control. | `docs/admin/05-user-directory-and-account-access/screenshots/3.png` |
| - [ ] | **4** | Suspend an Account | RE-CAPTURE: Manage access dialog showing Change access set to Suspend account, explanation and Continue. | `docs/admin/05-user-directory-and-account-access/screenshots/4.png` |
| - [ ] | **5** | Restore Account Access | RE-CAPTURE: Manage access dialog for a suspended test account with Restore account selected. | `docs/admin/05-user-directory-and-account-access/screenshots/5.png` |

### Module: Penalty Points & Sanctions (`admin/06-penalty-points-management`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Penalty Points | RE-CAPTURE: Penalty Points user list showing search, filters and scores out of 3. | `docs/admin/06-penalty-points-management/screenshots/1.png` |
| - [ ] | **2** | Find the User to Review | RE-CAPTURE: Penalty Points filtered list with a Review button and pagination when present. | `docs/admin/06-penalty-points-management/screenshots/2.png` |
| - [ ] | **3** | Adjust Monthly Penalty Points | RE-CAPTURE: Review penalty points dialog showing cancellations, Adjustment, New score, notes and Apply adjustment. | `docs/admin/06-penalty-points-management/screenshots/3.png` |
| - [ ] | **4** | Check Restrictions and Adjustment History | RE-CAPTURE: Penalty review showing score out of 3 and Recent adjustments, with synthetic incident notes. | `docs/admin/06-penalty-points-management/screenshots/4.png` |

### Module: Barangay Settings & Directory (`admin/07-barangay-directory-and-settings`)

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| :---: | :---: | :--- | :--- | :--- |
| - [ ] | **1** | Open Settings | RE-CAPTURE: Settings page for a barangay account with desk-profile and password sections visible. | `docs/admin/07-barangay-directory-and-settings/screenshots/1.png` |
| - [ ] | **2** | Review Barangay Directory and Coverage | RE-CAPTURE: Super Admin Barangay Directory & Coverage table with filters and Search barangay... field. | `docs/admin/07-barangay-directory-and-settings/screenshots/2.png` |
| - [ ] | **3** | Set Up an LGU Account as Super Admin | RE-CAPTURE: Super Admin Setup LGU form for a test barangay, with required fields and any jurisdiction-lock notice visible. | `docs/admin/07-barangay-directory-and-settings/screenshots/3.png` |
| - [ ] | **4** | Update the Desk Profile or Password | RE-CAPTURE: Barangay desk-profile settings with named fields and Save Desk Profile; keep passwords out of the capture. | `docs/admin/07-barangay-directory-and-settings/screenshots/4.png` |


---
**Total Steps in Manual**: 107 steps across all modules.

## New review and registration screens

| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |
| --- | --- | --- | --- | --- |
| - [ ] | **6** | Check Your Profile Photo Review | NEW: Profile avatar status pop-up; use a rejected test photo so Note from reviewer and Retake Photo are visible. | `docs/homeowner/01-registration-and-profile/screenshots/6.png` |
| - [ ] | **7** | Take Your Registration Face Photo | NEW: Worker Face Verification captured-selfie review with Retake Photo and Use This Photo. | `docs/kasambahay/01-registration/screenshots/7.png` |
| - [ ] | **8** | Submit Your Worker Clearances | NEW: Worker Identity Documents screen showing separate NBI Clearance and Police Clearance upload cards. | `docs/kasambahay/01-registration/screenshots/8.png` |
| - [ ] | **7** | Review the Profile Photo | NEW: Profile Photo review panel with loaded test photo, required rejection reason, Approve Photo and Reject Photo. | `docs/admin/03-verification-queue-and-ocr/screenshots/7.png` |
