// scripts/generate-initial-docs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../docs');

const guidesData = {
  homeowner: [
    {
      folder: '01-registration-and-profile',
      meta: {
        title: 'Registration & Identity Verification',
        overview: 'Create your Homeowner account, fill in your profile, and upload proof of residence to start hiring trusted household help.',
        icon: 'user-plus'
      },
      steps: [
        {
          num: 1,
          title: 'Start Registration & Select Homeowner Role',
          content: `# Start Registration & Select Homeowner Role

Begin your journey on SerbiSure by creating a dedicated Homeowner account.

1. Open the **SerbiSure** app on your phone.
2. On the welcome screen, tap the **Get Started** button.
3. On the role selection screen, choose **Homeowner (Employer)**.
4. Tap **Continue** to proceed to the registration form.

> [!TIP]
> Choosing **Homeowner** configures your account to post jobs, browse kasambahay profiles, and hire trusted household help.`
        },
        {
          num: 2,
          title: 'Fill In Personal Details & Contact Information',
          content: `# Fill In Personal Details & Contact Information

Provide your legal personal information and active mobile contact number.

1. In the **First Name**, **Middle Name** (optional), and **Last Name** fields, enter your legal name as shown on your government ID.
2. Select your **Gender** and tap the **Date of Birth** field to choose your birthdate.
3. In the **Contact Number** field, enter your active 11-digit mobile number (e.g., 09171234567).
4. Enter your active **Email Address** and create a secure **Password** (at least 8 characters).
5. Tap **Next** to move to location details.

> [!NOTE]
> Your mobile number is used for booking notifications and gate pass verifications.`
        },
        {
          num: 3,
          title: 'Enter Household Address & Barangay',
          content: `# Enter Household Address & Barangay

Specify your residence location so SerbiSure can connect you with nearby workers and barangay services.

1. Select your **Region** (e.g., Region X - Northern Mindanao).
2. Select your **Province** (e.g., Misamis Oriental) and **City / Municipality** (e.g., Cagayan de Oro City).
3. Select your assigned **Barangay** from the list. The postal ZIP code will auto-fill.
4. Type your complete house number, street name, and subdivision or village name in the **House / Street Address** field.
5. Tap **Next** to proceed to document submission.

> [!IMPORTANT]
> The barangay you select determines the local jurisdiction reviewing worker clearances and issuing village access passes.`
        },
        {
          num: 4,
          title: 'Upload Government ID or Proof of Billing',
          content: `# Upload Government ID or Proof of Billing

Verify your household account by uploading an official government ID or proof of residence.

1. On the document upload step, tap **Select Document Type** (choose between Philippine Passport, Driver's License, UMID, National ID, or Utility/Billing Statement).
2. Tap **Upload Front Image** to take a clear, well-lit photo or choose from your gallery.
3. If using an ID with two sides, tap **Upload Back Image**.
4. Confirm all text, your full name, and your address are crisp and legible.
5. Tap **Submit Document** to attach it to your application.

> [!TIP]
> Make sure the corners of the document are visible and there is no glare blocking important details.`
        },
        {
          num: 5,
          title: 'Review Account Information & Complete Registration',
          content: `# Review Account Information & Complete Registration

Double-check your information before finalizing your account.

1. Review the summary of your personal details, household address, and uploaded ID.
2. Read the SerbiSure **Terms of Service** and **Privacy Policy** by tapping the links.
3. Check the box agreeing to the **Data Privacy Consent**.
4. Tap **Complete Registration**.
5. Wait for the success confirmation screen. You can now log into your account!

> [!NOTE]
> Once registered, you can immediately explore available services while your document undergoes barangay verification.`
        }
      ]
    },
    {
      folder: '02-login',
      meta: {
        title: 'Logging In to SerbiSure',
        overview: 'Sign into your Homeowner account using your registered phone number or email, or use one-tap fast login.',
        icon: 'log-in'
      },
      steps: [
        {
          num: 1,
          title: 'Open SerbiSure to the Sign In Screen',
          content: `# Open SerbiSure to the Sign In Screen

Access the SerbiSure sign-in screen from the mobile app.

1. Launch the **SerbiSure** app on your smartphone.
2. On the welcome landing screen, tap **Log in** at the bottom.
3. The sign-in form will slide into view with the SerbiSure header.

> [!TIP]
> If you are a new user who has not created an account yet, tap **Sign Up** instead.`
        },
        {
          num: 2,
          title: 'Enter Phone or Email & Password',
          content: `# Enter Phone or Email & Password

Enter your credentials to securely authenticate.

1. Tap the **Phone or Email** input field.
2. Type either your registered 11-digit mobile number or your email address.
3. Tap the **Password** field and type your password.
4. Tap the **Eye Icon** on the right side of the password field if you wish to reveal characters and verify your typing.
5. Tap the dark **Sign in** button.
6. Upon successful authentication, you will be taken directly to the Homeowner Home Dashboard!

> [!NOTE]
> If you receive an "Invalid email or password" notice, check your spelling and ensure caps lock is off.`
        },
        {
          num: 3,
          title: 'Fast Login with Remembered Account ("Welcome Back")',
          content: `# Fast Login with Remembered Account ("Welcome Back")

Quickly sign back in on your personal device without retyping your username.

1. When returning to SerbiSure on a device you previously signed in with, you will see a **"Welcome back, [First Name]!"** header.
2. Your username is safely remembered, so you only need to enter your **Password**.
3. Type your password and tap **Sign in**.
4. If you wish to log into a different account, tap **Switch Account** at the bottom to reveal the standard username input field.

> [!TIP]
> For security, never leave your device unlocked if others have access to it.`
        }
      ]
    },
    {
      folder: '03-post-a-job',
      meta: {
        title: 'Post a Job Listing',
        overview: 'Publish a household job listing with your schedule, location, tasks, and budget to attract qualified kasambahay.',
        icon: 'briefcase'
      },
      steps: [
        {
          num: 1,
          title: 'Tap "Post a Job" from the Home Screen',
          content: `# Tap "Post a Job" from the Home Screen

Start a new job posting from your primary dashboard.

1. Make sure you are on the **Home** tab of the SerbiSure app.
2. Locate the quick-action banner or top button labeled **Post a Job**.
3. Tap **Post a Job** to open the step-by-step job creation wizard.

> [!NOTE]
> As a homeowner, you post *Jobs* seeking assistance. Kasambahay workers post *Services* advertising their skills.`
        },
        {
          num: 2,
          title: 'Select the Household Service Category',
          content: `# Select the Household Service Category

Choose the primary category of help your household requires.

1. On **Step 1: Service Type**, browse the available categories:
   - **Cleaning** (general tidying, deep cleaning, vacuuming)
   - **Childcare** (nanny, baby-sitting, tutoring supervision)
   - **Cooking** (meal prep, daily family cooking, grocery run)
   - **Caregiver** (elderly care, patient assistance, mobility aid)
   - **Laundry** (washing, drying, folding, ironing)
   - **All-around** (general housekeeping and multi-tasking)
2. Tap the card matching your needed service. A checkmark will highlight your choice.
3. Tap **Next Step** to proceed.`
        },
        {
          num: 3,
          title: 'Describe the Job Requirements & Tasks',
          content: `# Describe the Job Requirements & Tasks

Give workers a clear picture of what the role entails.

1. In the **Job Title** field, enter a concise title (e.g., "Full-Day House Cleaning & Laundry").
2. In the **Description** box, write details about your household expectations, house size (e.g., 2 bedrooms, 1 bath), and specific chores.
3. Check any applicable **Practical Skills** or special requirements (e.g., "Pet friendly", "Meal prep experience").
4. Tap **Next Step** to continue.`
        },
        {
          num: 4,
          title: 'Set the Work Schedule & Timing',
          content: `# Set the Work Schedule & Timing

Define when you need the worker to report to your home.

1. Select the **Engagement Type**:
   - **Short-term** (one-time or multi-day temporary work)
   - **Long-term** (regular weekly or monthly arrangement)
2. Select the **Living Setup**:
   - **Stay-out** (worker commutes daily)
   - **Stay-in** (worker resides in your household)
3. Tap **Target Start Date** to pick the day you need the job to start.
4. Specify the working hours (e.g., 8:00 AM to 5:00 PM).
5. Tap **Next Step** to set the job location.`
        },
        {
          num: 5,
          title: 'Confirm Job Location & Address',
          content: `# Confirm Job Location & Address

Confirm where the household helper will perform the work.

1. Your registered household address and barangay will appear as the default.
2. If this job is for a different property or specific unit, edit the **House / Street / Unit** details.
3. Add any specific **Gate / Subdivision landmarks** to assist the worker when arriving.
4. Tap **Next Step** to configure compensation.`
        },
        {
          num: 6,
          title: 'Define Payment Budget & Compensation Rate',
          content: `# Define Payment Budget & Compensation Rate

Set a fair, competitive compensation for the job.

1. Choose the **Rate Type** (e.g., Per Day, Per Hour, or Monthly Salary).
2. Enter the amount in Philippine Pesos (₱) in the **Budget / Rate** field (e.g., ₱650).
3. Mention any additional perks provided (such as free meals, travel allowance, or SSS/PhilHealth contributions for long-term hires).
4. Tap **Review Listing** to see the final preview.`
        },
        {
          num: 7,
          title: 'Review Summary & Publish Your Job',
          content: `# Review Summary & Publish Your Job

Review all details before making your listing public to workers.

1. Inspect the summary card displaying your chosen service, schedule, rate, and tasks.
2. If any detail needs adjustment, tap the **Back** button or the corresponding step indicator.
3. When everything is correct, tap the orange **Publish Job** button.
4. You will see a success confirmation! Your job is now live on the marketplace for verified kasambahay to view and apply for.`
        }
      ]
    },
    {
      folder: '04-browse-workers-and-hire',
      meta: {
        title: 'Browse Workers & Send Offers',
        overview: 'Search verified kasambahay profiles, review generated worker CVs and barangay clearances, and send direct booking offers.',
        icon: 'search'
      },
      steps: [
        {
          num: 1,
          title: 'Explore the "Find Kasambahay" Directory',
          content: `# Explore the "Find Kasambahay" Directory

Discover available domestic workers ready to work in your area.

1. Tap the **Browse** or **Workers** tab in the bottom navigation bar.
2. You will see a curated feed of worker profile cards showing their photo, full name, primary services, hourly/daily rate, and verified badge.
3. Scroll through the listings to explore available helpers.`
        },
        {
          num: 2,
          title: 'Filter Workers by Service, Barangay & Rating',
          content: `# Filter Workers by Service, Barangay & Rating

Narrow down worker profiles to find the perfect match for your needs.

1. Tap the **Filter** icon at the top right of the screen.
2. Under **Service**, select one or more categories (e.g., "Cooking", "Childcare").
3. Under **Location**, pick your preferred Barangay to find nearby workers who have short commute times.
4. Under **Minimum Rating**, choose your preferred threshold (e.g., 4.5+ stars).
5. Tap **Apply Filters** to update the list instantly.`
        },
        {
          num: 3,
          title: 'View a Kasambahay\'s Verified Profile & Generated CV',
          content: `# View a Kasambahay's Verified Profile & Generated CV

Inspect a worker's professional credentials and work history.

1. Tap any worker card from the browse results to open their full profile.
2. Read their **About Me** personal bio, work preferences (Stay-in vs. Stay-out), and languages spoken.
3. Tap **View Worker CV** to open their standardized, system-generated digital CV.
4. Inspect their listed past household experience, practical skill tags, and emergency contact verification status.`
        },
        {
          num: 4,
          title: 'Verify Clearances Badge & Review Client Ratings',
          content: `# Verify Clearances Badge & Review Client Ratings

Ensure peace of mind by checking the worker's official verification status.

1. Check the top of the profile for the **Verified Worker** badge.
2. Look at the **Clearances Checklist**:
   - **Barangay Clearance**: Approved & Active
   - **Police / NBI Clearance**: Approved & Active
   - **Government ID & Face Match**: Verified
3. Scroll down to the **Reviews & Ratings** section to read authentic reviews from previous homeowners who hired this worker.`
        },
        {
          num: 5,
          title: 'Send Direct Booking Offer or Start a Chat',
          content: `# Send Direct Booking Offer or Start a Chat

Initiate contact with your selected kasambahay.

1. At the bottom of the worker's profile, you will see two primary buttons:
   - **Message**: Opens a direct chat to ask questions or discuss requirements.
   - **Book Now / Send Offer**: Opens the formal booking proposal form.
2. If you are ready to propose work immediately, tap **Book Now / Send Offer**.
3. Select your proposed dates, working hours, address, and offered rate.
4. Tap **Send Booking Offer**. The worker will receive an immediate notification in their app!`
        }
      ]
    },
    {
      folder: '05-chat-and-messaging',
      meta: {
        title: 'Chat & In-App Messaging',
        overview: 'Communicate safely within the SerbiSure app to coordinate details, clarify tasks, and exchange booking proposals.',
        icon: 'message-square'
      },
      steps: [
        {
          num: 1,
          title: 'Open the Messages Tab & Select a Conversation',
          content: `# Open the Messages Tab & Select a Conversation

Access your ongoing communications in one secure location.

1. Tap the **Messages** tab in the bottom navigation bar.
2. The conversation inbox displays all conversations with workers you have contacted or who have applied to your job posts.
3. An unread badge shows new incoming messages.
4. Tap any conversation row to enter the full chat room.`
        },
        {
          num: 2,
          title: 'Discuss Job Terms, Schedules & Specific Needs',
          content: `# Discuss Job Terms, Schedules & Specific Needs

Coordinate arrangements safely inside the SerbiSure messaging system.

1. Tap the text input box at the bottom of the chat screen.
2. Type your message clarifying specific chores, arrival instructions, or questions about experience.
3. Tap the **Send** button (arrow icon).
4. Messages are delivered in real time.

> [!CAUTION]
> For your safety and protection against fraud, keep all communications and agreements inside the SerbiSure app.`
        },
        {
          num: 3,
          title: 'Send or Review a Formal Booking Offer in Chat',
          content: `# Send or Review a Formal Booking Offer in Chat

Create a legally binding booking proposal directly within the conversation.

1. Inside the chat room, tap the **Send Offer** button or tap an incoming application banner.
2. Set the agreed service date, scheduled time, and final agreed pay rate.
3. Tap **Submit Offer**.
4. An interactive **Booking Card** appears inside the chat timeline showing the proposed schedule and status.
5. When the worker accepts, the booking card automatically updates to **Confirmed**!`
        }
      ]
    },
    {
      folder: '06-bookings-and-village-pass',
      meta: {
        title: 'Bookings & Digital Village Pass',
        overview: 'Track active bookings and generate the official 24-hour HMAC-SHA256 Digital Village Pass QR code for security gate entry.',
        icon: 'calendar'
      },
      steps: [
        {
          num: 1,
          title: 'Access "My Bookings" & Track Booking Stages',
          content: `# Access "My Bookings" & Track Booking Stages

Monitor the lifecycle of all your household engagements.

1. Tap the **Bookings** tab in the bottom navigation bar.
2. View your bookings segmented into tabs:
   - **Active / Upcoming**: Bookings that are confirmed and awaiting service.
   - **Pending**: Offers waiting for worker response.
   - **Completed**: Finished service engagements ready for review.
   - **Cancelled**: Terminated or expired engagements.
3. Tap on any booking card to open its detailed management screen.`
        },
        {
          num: 2,
          title: 'View Confirmed Booking Details & Agreed Terms',
          content: `# View Confirmed Booking Details & Agreed Terms

Inspect the exact details of an accepted household job.

1. In the booking details screen, review:
   - **Kasambahay Name & Contact**: Call or message shortcut.
   - **Scheduled Date & Time**: Agreed start and end hours.
   - **Service Location**: Verified household address.
   - **Agreed Compensation**: Agreed total or hourly amount.
   - **Current Status**: Labeled with an orange **Confirmed** badge.`
        },
        {
          num: 3,
          title: 'Generate the 24-Hour Digital Village Pass QR Code',
          content: `# Generate the 24-Hour Digital Village Pass QR Code

Issue a cryptographic security pass allowing the worker through your subdivision gate.

1. On the confirmed booking screen on the scheduled work day, locate the **Digital Village Pass** section.
2. Tap the **View Village Pass QR** button.
3. The app generates a tamper-proof QR code backed by an HMAC-SHA256 signature containing the booking ID, worker name, and homeowner address.
4. The pass displays a **Valid for 24 Hours** countdown indicator.

> [!IMPORTANT]
> The cryptographic pass is valid for 24 hours from issuance. A static screenshot taken days earlier cannot be reused.`
        },
        {
          num: 4,
          title: 'Show the Village Pass at the Subdivision Guard Gate',
          content: `# Show the Village Pass at the Subdivision Guard Gate

How subdivision guards verify worker entry authorization.

1. When the worker arrives at your subdivision or village security gate, the security guard inspects the pass.
2. The guard scans the QR code with their scanner or phone camera.
3. The guard sees the verified worker photo, employer homeowner address, and barangay clearance validity.
4. Entry is authorized smoothly without confiscating physical IDs or tedious manual logbook sign-ins!`
        },
        {
          num: 5,
          title: 'Mark Service as Completed Once Work is Finished',
          content: `# Mark Service as Completed Once Work is Finished

Finalize the booking after the worker concludes their tasks.

1. Once the scheduled workday is completed, return to the booking details screen.
2. Tap the **Mark as Completed** button.
3. A confirmation dialog will ask you to confirm that the work was rendered satisfactorily.
4. Tap **Confirm Completion**. The booking status changes to **Completed** and the review screen will open.`
        }
      ]
    },
    {
      folder: '07-reviews-and-ratings',
      meta: {
        title: 'Reviews & Feedback',
        overview: 'Rate your hired kasambahay, leave detailed feedback, and help build a trusted barangay community.',
        icon: 'star'
      },
      steps: [
        {
          num: 1,
          title: 'Open Completed Booking to Leave Feedback',
          content: `# Open Completed Booking to Leave Feedback

Begin the review process for a concluded service.

1. When a booking is marked as completed, a **Rate & Review** prompt appears automatically.
2. Alternatively, go to **Bookings** > **Completed**, select the job, and tap **Leave a Review**.
3. The review form displays the worker's name and photo.`
        },
        {
          num: 2,
          title: 'Select Star Ratings for Service Quality',
          content: `# Select Star Ratings for Service Quality

Provide transparent ratings on performance.

1. Tap the star bar to assign an overall rating from **1 to 5 Stars**:
   - ⭐⭐⭐⭐⭐ (5 Stars): Excellent service, highly recommended!
   - ⭐⭐⭐⭐ (4 Stars): Good service, satisfied with results.
   - ⭐⭐⭐ (3 Stars): Average service, met basic expectations.
   - ⭐⭐ / ⭐ (2 or 1 Star): Unsatisfactory or issues encountered.
2. The rating highlights in SerbiSure orange upon selection.`
        },
        {
          num: 3,
          title: 'Write Helpful Feedback & Submit the Review',
          content: `# Write Helpful Feedback & Submit the Review

Add constructive comments to assist fellow homeowners and acknowledge the worker.

1. Tap the **Write a Review** comment area.
2. Share specifics: punctuality, thoroughness, trustworthiness, and attitude.
3. Check the confirmation checkbox stating your review is truthful.
4. Tap the **Submit Review** button.
5. Your rating will immediately appear on the worker's public profile and contribute to their overall score!`
        }
      ]
    },
    {
      folder: '08-managing-own-posts',
      meta: {
        title: 'Managing Your Job Posts',
        overview: 'Review your published job listings, inspect applicants, reschedule expired posts, or cancel open listings.',
        icon: 'file-text'
      },
      steps: [
        {
          num: 1,
          title: 'Navigate to "My Job Posts" in Your Profile',
          content: `# Navigate to "My Job Posts" in Your Profile

View all job listings you have created on SerbiSure.

1. Tap the **Profile** tab in the bottom navigation bar.
2. In your profile menu, tap **My Job Posts**.
3. You will see a list of your posted listings categorized by status:
   - **Active**: Open for applications from kasambahay.
   - **Expired**: Past scheduled date without an active hire.
   - **Closed / Cancelled**: Concluded or taken down listings.`
        },
        {
          num: 2,
          title: 'View Active Applicants & Responders for Each Post',
          content: `# View Active Applicants & Responders for Each Post

Review workers who have submitted applications for your job.

1. Tap on any active job card to open its management view.
2. Tap the **Applicants** tab to view all workers who applied.
3. Each applicant card displays their photo, rating, and match percentage with your requested skills.
4. Tap **View Profile** to inspect their credentials or **Message** to initiate a chat.`
        },
        {
          num: 3,
          title: 'Reschedule or Repost an Expired Job Listing',
          content: `# Reschedule or Repost an Expired Job Listing

Reactivate a past listing with a fresh future schedule.

1. If your job date passed without hiring, it displays an **Expired Schedule** badge.
2. Tap the **Repost / Reschedule** button on the expired card.
3. Select a new target start date and adjust the rate if needed.
4. Tap **Confirm Repost**. The job returns to the active marketplace immediately with its new dates.`
        },
        {
          num: 4,
          title: 'Cancel or Close an Active Job Post',
          content: `# Cancel or Close an Active Job Post

Take down a job listing when help is no longer required.

1. Open the job listing you want to remove.
2. Scroll to the bottom of the details page and tap **Cancel Job Post**.
3. Select a cancellation reason (e.g., "Found help elsewhere", "Schedule changed").
4. Tap **Confirm Cancellation**.
5. The post is closed, and any pending applicants are politely notified.`
        }
      ]
    }
  ],
  kasambahay: [
    {
      folder: '01-registration',
      meta: {
        title: 'Kasambahay Registration',
        overview: 'Sign up as a domestic worker, choose your household skills, and configure your work preferences.',
        icon: 'user-plus'
      },
      steps: [
        {
          num: 1,
          title: 'Choose the Kasambahay Worker Role',
          content: `# Choose the Kasambahay Worker Role

Start your registration to offer household services on SerbiSure.

1. Launch the **SerbiSure** app on your mobile device.
2. Tap the **Get Started** button on the welcome screen.
3. On the role selection screen, tap the **Kasambahay (Worker)** card.
4. Tap **Continue** to start the worker registration form.`
        },
        {
          num: 2,
          title: 'Enter Personal Details & Contact Number',
          content: `# Enter Personal Details & Contact Number

Provide your basic identifying information and mobile contact number.

1. Enter your **First Name**, **Middle Name** (if applicable), and **Last Name**.
2. Select your **Gender** and your **Date of Birth** using the date selector.
3. Enter your active 11-digit **Contact Number** (e.g., 09181234567).
4. Enter your email (or leave blank if you register by phone only).
5. Choose your **Region**, **Province**, **City / Municipality**, and home **Barangay**.
6. Tap **Next** to move to the skills selection step.`
        },
        {
          num: 3,
          title: 'Select Household Skills & Services Offered',
          content: `# Select Household Skills & Services Offered

Highlight what domestic services you can perform for households.

1. On the services screen, tap each service you provide:
   - **Cleaning** (sweeping, mopping, dusting, bathroom cleaning)
   - **Childcare** (looking after infants, toddlers, or young children)
   - **Cooking** (daily home cooking, grocery planning)
   - **Caregiver** (elderly care, companionship, medication reminders)
   - **Laundry** (hand-washing, washing machine, ironing)
   - **All-around** (general housekeeping across all areas)
2. You can select one or multiple services.
3. Tap **Next** to specify your work preferences.`
        },
        {
          num: 4,
          title: 'Select Preferred Work Arrangement (Stay-in / Stay-out)',
          content: `# Select Preferred Work Arrangement (Stay-in / Stay-out)

Define your preferred working living conditions and contract length.

1. Under **Work Arrangement Looking For**, choose:
   - **Short-term, Stay-out** (Daily or temporary gigs with commute)
   - **Short-term, Stay-in** (Temporary live-in contracts)
   - **Long-term, Stay-out** (Regular daily employment)
   - **Long-term, Stay-in** (Permanent residential live-in employment)
   - **Both / Flexible** (Open to either arrangement)
2. Tap your preference card to highlight it.
3. Tap **Next** to proceed.`
        },
        {
          num: 5,
          title: 'Provide Experience, Languages & Education Details',
          content: `# Provide Experience, Languages & Education Details

Add background details that make your profile stand out to employers.

1. Under **Household Work Experience**, select:
   - First-time worker
   - In my household
   - Previous paid worker
2. Select your **Approximate Experience** (e.g., Less than 1 year, 1-3 years, More than 3 years).
3. Tap the languages you speak fluently (**Bisaya**, **Tagalog**, **English**).
4. Select your **Civil Status** and **Educational Attainment** (e.g., High School Graduate).
5. Tap **Next** to set up your password.`
        },
        {
          num: 6,
          title: 'Create a Secure Password & Accept Terms',
          content: `# Create a Secure Password & Accept Terms

Protect your account and finalize your basic profile.

1. In the **Password** field, type a secure password with at least 8 characters.
2. In the **Confirm Password** field, type the exact same password again.
3. Review the **Terms of Service** and **Privacy Policy** links.
4. Tap the checkbox to give consent for SerbiSure worker verification.
5. Tap the orange **Complete Registration** button.
6. Your account is created! You will be guided to the Verification Center to submit your clearances.`
        }
      ]
    },
    {
      folder: '02-login',
      meta: {
        title: 'Kasambahay Login',
        overview: 'Log into your Kasambahay account with your registered phone number and password.',
        icon: 'log-in'
      },
      steps: [
        {
          num: 1,
          title: 'Open the SerbiSure App to the Sign In Screen',
          content: `# Open the SerbiSure App to the Sign In Screen

Access your Kasambahay account login.

1. Open the **SerbiSure** app on your phone.
2. On the welcome screen, tap **Log in** at the bottom.
3. The sign-in form opens with input fields for your phone/email and password.`
        },
        {
          num: 2,
          title: 'Enter Your Contact Number and Password',
          content: `# Enter Your Contact Number and Password

Type your registered credentials.

1. Tap the **Phone or Email** field and enter your 11-digit mobile number.
2. Tap the **Password** field and type your secret password.
3. Tap the **Eye Icon** to verify that you typed your password correctly.
4. Tap the dark **Sign in** button.
5. You will land directly on the Kasambahay Dashboard!`
        },
        {
          num: 3,
          title: 'One-Tap Sign In with Saved Profile',
          content: `# One-Tap Sign In with Saved Profile

Quickly access your worker dashboard when returning to the app.

1. When you open the app after previously logging in, you will see **"Welcome back, [Name]!"**.
2. Simply enter your **Password** in the password field.
3. Tap **Sign in** to access your jobs and chat instantly.
4. If you share your phone with another person, tap **Switch Account** to clear the saved name and log in with different credentials.`
        }
      ]
    },
    {
      folder: '03-identity-and-liveness-verification',
      meta: {
        title: 'Identity & Liveness Verification',
        overview: 'Upload your required clearances and perform an automated liveness selfie check to earn your Verified Worker badge.',
        icon: 'shield-check'
      },
      steps: [
        {
          num: 1,
          title: 'Navigate to the Verification Center',
          content: `# Navigate to the Verification Center

Open your verification status page from your profile.

1. From the Kasambahay home screen, tap the **Profile** tab in the bottom bar.
2. Tap **Verification Center** or tap the **Get Verified** prompt on your home dashboard.
3. You will see a list of required documents and their status (Pending, Approved, Expired, or Action Needed).`
        },
        {
          num: 2,
          title: 'Upload a Valid Government ID (Front & Back)',
          content: `# Upload a Valid Government ID (Front & Back)

Submit a clear copy of your primary government identification.

1. Tap **Government ID** from the document list.
2. Select your ID type (e.g., PhilSys National ID, UMID, Postal ID, Driver's License, or Voter's ID).
3. Tap **Take Photo of Front** and position the ID inside the camera guide box. Ensure details are sharp and clear.
4. Tap **Take Photo of Back** if your ID has a back side.
5. Tap **Save & Upload Document**.
6. The app's OCR engine extracts your legal name and birthdate for barangay comparison.`
        },
        {
          num: 3,
          title: 'Upload Barangay Clearance & Police/NBI Clearance',
          content: `# Upload Barangay Clearance & Police/NBI Clearance

Provide official local clearances proving your clean community record.

1. In the Verification Center, tap **Barangay Clearance**.
2. Tap **Upload Photo**, select a crisp image of your official stamped clearance certificate issued by your barangay hall, and tap **Upload**.
3. Next, tap **Police / NBI Clearance**.
4. Take a clear photo of your valid NBI or Police Clearance certificate.
5. Confirm that the issue date, expiration date, and official dry seal or QR stamp are clearly visible.
6. Tap **Submit Clearances**.`
        },
        {
          num: 4,
          title: 'Perform Automated Real-Time Liveness Selfie Check',
          content: `# Perform Automated Real-Time Liveness Selfie Check

Complete the biometric face verification to confirm your identity matches your ID.

1. In the Verification Center, tap **Start Liveness Check**.
2. Hold your phone steady at eye level and frame your face inside the oval guide.
3. Follow the on-screen instructions (e.g., "Look straight", "Blink gently", or "Turn your head slightly").
4. The system automatically captures and validates your biometric presence.
5. A green checkmark confirms: **"Liveness Check Passed!"**.`
        },
        {
          num: 5,
          title: 'Monitor Verification Review Status',
          content: `# Monitor Verification Review Status

Track the review progress by your assigned Barangay Admin.

1. Return to the **Verification Center** to view the progress bar.
2. Each clearance will show one of three statuses:
   - 🟡 **Pending Review**: Submitted and awaiting barangay reviewer action.
   - 🟢 **Approved**: Verified by barangay staff; contributes to your active badge.
   - 🔴 **Requires Resubmission**: Reviewer left a note explaining why (e.g., blurry image, expired date).
3. When all clearances are approved, your profile receives the official **Verified Worker** badge!`
        }
      ]
    },
    {
      folder: '04-clearance-renewal',
      meta: {
        title: 'Clearance Expiry & Renewal',
        overview: 'Renew expiring or expired barangay and police clearances using self-service upload to keep your badge active.',
        icon: 'refresh-cw'
      },
      steps: [
        {
          num: 1,
          title: 'Check Expiry Alerts for Your Documents',
          content: `# Check Expiry Alerts for Your Documents

Identify which clearances require renewal.

1. When a clearance is within 30 days of expiring, SerbiSure displays an alert banner on your dashboard.
2. If a clearance has passed its validity date, its status displays an orange **Expired** pill.
3. Open the **Verification Center** to view the document requiring attention.

> [!NOTE]
> An expired clearance does not delete your account. You can renew it at any time through self-service upload without waiting for an admin to reject it.`
        },
        {
          num: 2,
          title: 'Select the Expired or Expiring Clearance',
          content: `# Select the Expired or Expiring Clearance

Open the renewal form for the specific document.

1. In the Verification Center, tap the clearance marked with **Expiring Soon** or **Expired**.
2. A renewal prompt appears stating: "Upload your newly issued clearance to maintain full verification."
3. Tap the **Renew Clearance** button.`
        },
        {
          num: 3,
          title: 'Upload the Fresh Clearance Certificate for Review',
          content: `# Upload the Fresh Clearance Certificate for Review

Submit your updated certificate to barangay staff.

1. Tap **Take Photo** or **Choose from Gallery**.
2. Take a clear, flat photo of your newly issued clearance from the Barangay Hall or Police station.
3. Confirm that the new expiration date is in the future and clearly legible.
4. Tap **Submit for Renewal**.
5. The document status moves to **Pending Review**. Once the barangay reviewer confirms it, your Verified badge remains in good standing!`
        }
      ]
    },
    {
      folder: '05-worker-cv-builder',
      meta: {
        title: 'Worker Profile & Generated CV',
        overview: 'Build a standout worker profile and view your system-generated digital CV that employers see.',
        icon: 'file-text'
      },
      steps: [
        {
          num: 1,
          title: 'Open the "My Worker CV" Editor in Profile',
          content: `# Open the "My Worker CV" Editor in Profile

Access your professional worker profile details.

1. Tap the **Profile** tab in the bottom bar.
2. Tap the **Edit Worker CV** button below your profile photo.
3. The CV builder opens with editable sections for your summary, skills, experience, and references.`
        },
        {
          num: 2,
          title: 'Update Bio, Practical Skills & Years of Experience',
          content: `# Update Bio, Practical Skills & Years of Experience

Add key information that highlights your household expertise.

1. In the **Professional Summary / Bio** field, write a short friendly introduction (e.g., "Experienced kasambahay specializing in infant care and home cooking for 4 years.").
2. Under **Practical Skills**, toggle skill tags that you excel in (e.g., "Deep cleaning", "Meal preparation", "Ironing", "Infant care").
3. Update your **Total Years of Experience**.
4. Tap **Save Changes**.`
        },
        {
          num: 3,
          title: 'Add Emergency Contact & Personal Details',
          content: `# Add Emergency Contact & Personal Details

Provide emergency references for trust and safety.

1. In the **Emergency Contact** section, enter the full name, relationship (e.g., Spouse, Parent, Sibling), and 11-digit phone number of your emergency contact.
2. Confirm your spoken languages and civil status.
3. Tap **Save Details**.`
        },
        {
          num: 4,
          title: 'Preview the Auto-Generated Professional Worker CV',
          content: `# Preview the Auto-Generated Professional Worker CV

See exactly what homeowners see when considering hiring you.

1. Return to your profile screen and tap **Preview Worker CV**.
2. The app formats your data into a clean, professional digital resume:
   - Your profile photo and full name
   - Verified clearances status badge
   - Star rating summary and job completion count
   - Categorized skills and work preferences (Stay-in / Stay-out)
   - Emergency contact verification status
3. Tap **Close Preview** when finished.`
        }
      ]
    },
    {
      folder: '06-browse-jobs-and-apply',
      meta: {
        title: 'Browse Jobs & Apply',
        overview: 'Search homeowner job posts in your barangay, filter by your skills, and submit job applications.',
        icon: 'briefcase'
      },
      steps: [
        {
          num: 1,
          title: 'Browse Available Jobs in the Marketplace',
          content: `# Browse Available Jobs in the Marketplace

Discover open job opportunities from homeowners seeking assistance.

1. From the Kasambahay dashboard, tap the **Jobs** tab in the bottom navigation.
2. You will see a feed of job cards posted by verified homeowners.
3. Each job card displays the job title, required service (e.g., Cleaning), location barangay, offered rate, and schedule.`
        },
        {
          num: 2,
          title: 'Filter Jobs by Service Type, Location & Pay Rate',
          content: `# Filter Jobs by Service Type, Location & Pay Rate

Find jobs that match your skills and location preferences.

1. Tap the **Filter** button at the top of the Jobs screen.
2. Select the **Service** matching your expertise (e.g., "Cooking" or "Laundry").
3. Choose your preferred **Barangay** to find jobs within walking distance or a short commute.
4. Set the **Engagement** (Short-term or Long-term) and **Living Setup** (Stay-in or Stay-out).
5. Tap **Apply Filters**.`
        },
        {
          num: 3,
          title: 'View Full Job Details & Homeowner Requirements',
          content: `# View Full Job Details & Homeowner Requirements

Read the complete requirements before deciding to apply.

1. Tap any job card in the list to open the detailed view.
2. Review the **Job Description**, house details, and specific chores requested.
3. Check the **Schedule & Duration** (e.g., "Mondays & Thursdays, 8:00 AM - 4:00 PM").
4. Inspect the **Offered Compensation** to make sure the pay meets your expectations.`
        },
        {
          num: 4,
          title: 'Tap "Apply Now" to Submit Your Application',
          content: `# Tap "Apply Now" to Submit Your Application

Submit your profile and interest to the employer.

1. At the bottom of the job details page, tap the orange **Apply Now** button.
2. A confirmation prompt opens: "Apply for this job listing with your SerbiSure Worker CV?"
3. Add an optional short message introducing yourself to the homeowner.
4. Tap **Confirm Application**.
5. You will see a success message: "Application Submitted Successfully!"`
        },
        {
          num: 5,
          title: 'Open Direct Chat with the Homeowner',
          content: `# Open Direct Chat with the Homeowner

Start coordinating with the employer right after applying.

1. After submitting your application, tap **Message Employer**.
2. The conversation window opens immediately with a banner referencing the job you applied for.
3. Send a polite greeting confirming your availability for the scheduled dates.
4. Keep checking your **Messages** tab for the homeowner's reply and booking offer!`
        }
      ]
    },
    {
      folder: '07-post-a-service',
      meta: {
        title: 'Post a Service Advertisement',
        overview: 'Publish a service advertisement to let homeowners discover and book you directly.',
        icon: 'plus-circle'
      },
      steps: [
        {
          num: 1,
          title: 'Tap "Post a Service" on Your Dashboard',
          content: `# Tap "Post a Service" on Your Dashboard

Create an advertisement showcasing your household availability.

1. Go to the **Home** tab of your Kasambahay account.
2. Tap the quick-action button labeled **Post a Service**.
3. The service listing creator opens.`
        },
        {
          num: 2,
          title: 'Choose the Service Category You Are Offering',
          content: `# Choose the Service Category You Are Offering

Select the primary service for this specific advertisement.

1. Select one of the supported service categories:
   - **Cleaning**
   - **Childcare**
   - **Cooking**
   - **Caregiver**
   - **Laundry**
   - **All-around**
2. Tap the selected category card.
3. Tap **Next Step**.`
        },
        {
          num: 3,
          title: 'Specify Your Service Rates & Availability Schedule',
          content: `# Specify Your Service Rates & Availability Schedule

Set your expected pay rate and when you are open for bookings.

1. Under **Rate Type**, choose between **Per Day** or **Per Hour**.
2. Enter your desired rate in Philippine Pesos (₱) in the **Standard Rate** field (e.g., ₱600/day).
3. Under **Availability**, select the days of the week you are free to work (e.g., Mon, Wed, Fri).
4. Tap **Next Step**.`
        },
        {
          num: 4,
          title: 'Add Service Description & Highlight Your Strengths',
          content: `# Add Service Description & Highlight Your Strengths

Describe what makes your service dependable and thorough.

1. In the **Service Title** field, type a catchy title (e.g., "Thorough Home Cleaning & Kitchen Organization").
2. In the **Description** box, describe your experience, attention to detail, and what tasks you include.
3. Check off relevant skill badges.
4. Tap **Review Listing**.`
        },
        {
          num: 5,
          title: 'Review & Publish Your Public Service Listing',
          content: `# Review & Publish Your Public Service Listing

Make your service visible to homeowners in your area.

1. Review the preview card with your service details, rates, and availability.
2. If satisfied, tap the orange **Publish Service** button.
3. Your service listing is now live! Homeowners browsing for help can now find your service and send you direct booking requests.`
        }
      ]
    },
    {
      folder: '08-chat-and-offers',
      meta: {
        title: 'Chat & Booking Offers',
        overview: 'Communicate with prospective employers, review formal booking offers, and accept or decline gigs.',
        icon: 'message-circle'
      },
      steps: [
        {
          num: 1,
          title: 'Open Messages to View Homeowner Inquiries',
          content: `# Open Messages to View Homeowner Inquiries

Check incoming messages from employers.

1. Tap the **Messages** tab in the bottom bar.
2. Conversations with employers are listed with unread message badges.
3. Tap any conversation to view the chat history.`
        },
        {
          num: 2,
          title: 'Receive & Review Direct Booking Offers',
          content: `# Receive & Review Direct Booking Offers

Inspect the terms of a proposed engagement.

1. When a homeowner wants to hire you, an interactive **Booking Offer** card appears in the chat.
2. The card shows:
   - **Proposed Dates**: Work start and end times.
   - **Service Requested**: Specific tasks.
   - **Address**: Homeowner's subdivision and barangay.
   - **Total Compensation**: Agreed pay amount.
3. Tap **View Offer Details** to expand the full terms.`
        },
        {
          num: 3,
          title: 'Accept the Booking Offer or Negotiate Terms',
          content: `# Accept the Booking Offer or Negotiate Terms

Finalize the work agreement.

1. If you are satisfied with the dates, hours, and pay, tap the green **Accept Offer** button.
2. If the dates do not work for you, tap **Decline** or send a message in chat suggesting an alternative time.
3. Once you tap **Accept**, the booking is locked in and officially moved to your **Confirmed Bookings** schedule!`
        }
      ]
    },
    {
      folder: '09-booking-schedules-and-village-pass',
      meta: {
        title: 'Schedules & Digital Village Pass',
        overview: 'Check your upcoming work schedule and use your 24-hour Digital Village Pass QR code to enter gated communities.',
        icon: 'calendar'
      },
      steps: [
        {
          num: 1,
          title: 'View Your Scheduled Work Bookings Calendar',
          content: `# View Your Scheduled Work Bookings Calendar

Keep track of your confirmed upcoming jobs.

1. Tap the **Bookings** tab in the bottom navigation.
2. View your **Upcoming** engagements organized chronologically.
3. Tap on today's job card to see full directions, employer contact, and access passes.`
        },
        {
          num: 2,
          title: 'Access the Digital Village Pass for Today\'s Job',
          content: `# Access the Digital Village Pass for Today's Job

Open your digital pass for gated subdivision entry.

1. On the day of your confirmed booking, a **Digital Village Pass** banner appears at the top of your booking details screen.
2. Tap **Open Village Pass**.
3. The cryptographic QR code and pass summary will display on your screen.
4. The pass displays your verified photo, employer name, destination address, and a 24-hour validity countdown.`
        },
        {
          num: 3,
          title: 'Present the 24-Hour Pass QR Code to Gate Security',
          content: `# Present the 24-Hour Pass QR Code to Gate Security

Show your pass to the subdivision security guard.

1. When arriving at the security gate or guardhouse, hold your phone up so the guard can scan the QR code.
2. The QR verification confirms your active booking and identity without requiring you to surrender your personal ID card.
3. The guard logs your entry and opens the gate for you to proceed to the employer's residence.`
        }
      ]
    },
    {
      folder: '10-completed-jobs-and-reviews',
      meta: {
        title: 'Completed Jobs & Reputation',
        overview: 'Confirm job completion, review feedback and star ratings received, and rate your experience with employers.',
        icon: 'award'
      },
      steps: [
        {
          num: 1,
          title: 'Confirm Job Completion with Homeowner',
          content: `# Confirm Job Completion with Homeowner

Wrap up your work assignment at the end of the day.

1. When you have finished all scheduled household tasks, inform the homeowner.
2. Open the booking details in your SerbiSure app.
3. Verify that the homeowner has tapped **Mark as Completed** or tap **Confirm Finished**.
4. The booking status updates to **Completed**.`
        },
        {
          num: 2,
          title: 'View Earned Ratings & Testimonials on Profile',
          content: `# View Earned Ratings & Testimonials on Profile

Watch your reputation and hiring opportunities grow.

1. Go to your **Profile** tab.
2. View your updated **Average Rating** (out of 5.0 stars) and your **Total Completed Jobs** counter.
3. Scroll to the **Client Reviews** section to read comments from your employers.
4. Positive ratings increase your visibility in search results and attract more high-paying job offers!`
        },
        {
          num: 3,
          title: 'Rate Your Work Experience with the Employer',
          content: `# Rate Your Work Experience with the Employer

Provide feedback about your working conditions.

1. On the completed booking screen, tap **Rate Homeowner**.
2. Select a star rating from 1 to 5 reflecting how courteous, respectful, and punctual the homeowner was with payment.
3. Add any optional comments.
4. Tap **Submit Feedback**.`
        }
      ]
    }
  ],
  admin: [
    {
      folder: '01-login-and-jurisdiction',
      meta: {
        title: 'Admin Login & Jurisdiction Access',
        overview: 'Sign into the SerbiSure Admin Portal and understand your role permissions and barangay jurisdiction.',
        icon: 'shield'
      },
      steps: [
        {
          num: 1,
          title: 'Navigate to the SerbiSure Admin Portal',
          content: `# Navigate to the SerbiSure Admin Portal

Open the web-based administrative management portal.

1. Open your web browser on your computer or desktop workstation.
2. Navigate to the official SerbiSure Admin Portal URL.
3. You will see the SerbiSure Administrative sign-in screen featuring the official seal and logo.`
        },
        {
          num: 2,
          title: 'Enter Official Barangay / Admin Credentials',
          content: `# Enter Official Barangay / Admin Credentials

Authenticate using your authorized administrative account.

1. In the **Email / Username** field, enter your official government or administrative email address.
2. In the **Password** field, enter your assigned administrative password.
3. Tap the **Sign In** button.
4. Upon successful sign-in, you are directed to the main administrative dashboard.`
        },
        {
          num: 3,
          title: 'Understand Jurisdiction Scope & Role Permissions',
          content: `# Understand Jurisdiction Scope & Role Permissions

Review your administrative authorization level.

1. Look at the top navigation bar to see your logged-in role:
   - **Barangay Staff / Reviewer**: Authorized to review verifications, process expirations, and inspect users belonging strictly to your assigned Barangay jurisdiction.
   - **Super Admin**: City-wide authority across all barangays, with access to staff account creation and global system settings.
2. All verification actions and audit logs record your staff ID for transparency and security.`
        }
      ]
    },
    {
      folder: '02-dashboard-and-analytics',
      meta: {
        title: 'Dashboard & Activity Analytics',
        overview: 'Monitor real-time metrics including pending verification counts, active users, and service category breakdown.',
        icon: 'bar-chart-2'
      },
      steps: [
        {
          num: 1,
          title: 'View Real-Time Metric Cards (Pending, Active, Issues)',
          content: `# View Real-Time Metric Cards (Pending, Active, Issues)

Get an immediate snapshot of community operations.

1. On the **Dashboard** overview, inspect the top metric cards:
   - **Pending Verifications**: Count of clearances awaiting reviewer approval.
   - **Active Kasambahay**: Verified domestic workers currently active in your jurisdiction.
   - **Registered Homeowners**: Total employer households in your barangay.
   - **Expiring Clearances**: Documents reaching expiry within 30 days.
2. Clicking any card filters the corresponding management queue.`
        },
        {
          num: 2,
          title: 'Analyze Verification Workload & SLA Indicators',
          content: `# Analyze Verification Workload & SLA Indicators

Ensure document verification turnaround times stay within community targets.

1. Inspect the **Verification Queue Summary** chart on the dashboard.
2. Monitor submissions organized by age (e.g., Under 24h, 24-48h, Over 48h).
3. Identify any bottleneck in pending clearances needing attention.`
        },
        {
          num: 3,
          title: 'Inspect Workforce Service Distribution Breakdown',
          content: `# Inspect Workforce Service Distribution Breakdown

Understand the skills balance in your barangay.

1. Scroll to the **Service Distribution** percentage chart.
2. View the proportion of registered workers offering Cleaning, Childcare, Cooking, Caregiver, and Laundry services.
3. Use this data for barangay livelihood programs and community workforce planning.`
        }
      ]
    },
    {
      folder: '03-verification-queue-and-ocr',
      meta: {
        title: 'Verification Queue & Reviewer Corrections',
        overview: 'Review submitted IDs and clearances with OCR assistance, apply reviewer corrections with audit logging, and approve or reject documents.',
        icon: 'check-square'
      },
      steps: [
        {
          num: 1,
          title: 'Open the Pending Verifications Queue',
          content: `# Open the Pending Verifications Queue

Access documents submitted by workers and homeowners awaiting review.

1. In the left navigation sidebar, click **Verifications**.
2. The **Verification Queue** displays all submissions awaiting review.
3. Submissions are sorted chronologically by submission date.`
        },
        {
          num: 2,
          title: 'Filter Submissions by Role, Document Type & Status',
          content: `# Filter Submissions by Role, Document Type & Status

Locate specific document batches.

1. Use the top filter dropdowns:
   - **Role**: Kasambahay or Homeowner.
   - **Document Type**: Barangay Clearance, Police Clearance, or Government ID.
   - **Status**: Pending, Approved, Rejected, or Expired.
2. Click on any row to open the full inspection modal.`
        },
        {
          num: 3,
          title: 'Inspect Document Image Alongside OCR Extracted Data',
          content: `# Inspect Document Image Alongside OCR Extracted Data

Compare the original certificate image against automated machine reading.

1. In the document review dialog, the high-resolution scanned document appears on the left.
2. Use the **Zoom** and **Rotate** controls to inspect the seal, issue date, and signatures.
3. On the right panel, review the **OCR Extracted Fields** (Full Name, Date of Birth, ID Number, Issue Date, Expiration Date).`
        },
        {
          num: 4,
          title: 'Perform Identity Comparison & Face Match Check',
          content: `# Perform Identity Comparison & Face Match Check

Verify that the applicant matches their identification.

1. Click **View Identity Comparison**.
2. The modal displays:
   - The photo on the uploaded government ID.
   - The real-time selfie captured during the worker's liveness check.
   - The automated biometric similarity score.
3. Confirm visual match and authenticity.`
        },
        {
          num: 5,
          title: 'Apply Reviewer Corrections with Audit Logging',
          content: `# Apply Reviewer Corrections with Audit Logging

Fix minor OCR typos without making the user start over.

1. If the OCR misread a character (such as mistaking "0" for "O"), click **Edit Extracted Data**.
2. Correct the spelling in the field (e.g., First Name or Expiry Date).
3. In the **Correction Reason** field, enter a brief reason (e.g., "Corrected OCR typo on middle initial").
4. Click **Save Correction**. The system records an immutable audit trail with your admin username and timestamp.`
        },
        {
          num: 6,
          title: 'Approve or Reject Document with Official Remarks',
          content: `# Approve or Reject Document with Official Remarks

Make the final determination on the clearance.

1. If all criteria are satisfied:
   - Click the green **Approve Document** button.
   - The clearance is marked as Approved and the worker moves toward full verification.
2. If the document is invalid, fake, or illegible:
   - Click the red **Reject Document** button.
   - Select a standard rejection reason or type a note explaining why (e.g., "Clearance photo is too dark. Please re-upload a clear copy.").
   - Click **Confirm Rejection**. The user is notified to re-upload.`
        }
      ]
    },
    {
      folder: '04-expired-clearances-processing',
      meta: {
        title: 'Expired Clearances Management',
        overview: 'Track expiring worker clearances and run manual batch expiration processing.',
        icon: 'calendar-x'
      },
      steps: [
        {
          num: 1,
          title: 'Filter Document Records by "Expired" Status',
          content: `# Filter Document Records by "Expired" Status

Identify documents that have passed their expiration date.

1. Go to the **Verifications** page.
2. Click the **Expired Documents** filter pill at the top of the table.
3. The table lists all clearances whose expiration date is in the past, including worker name, clearance type, and expiration date.`
        },
        {
          num: 2,
          title: 'Trigger the Manual Expiration Batch Processor',
          content: `# Trigger the Manual Expiration Batch Processor

Run the system expiry engine on demand.

1. While the system periodically checks expirations automatically, admins can trigger an instant update.
2. Click the **Process Expirations** button in the top action bar.
3. The system scans all approved clearances against the current date.
4. A notification indicates: "Successfully processed clearances. [X] documents transitioned to Expired."`
        },
        {
          num: 3,
          title: 'Review Updated Worker Expiry Statuses',
          content: `# Review Updated Worker Expiry Statuses

Verify that workers with expired documents receive renewal notices.

1. Workers with expired mandatory clearances have their active badge paused until renewal.
2. Check the updated table to ensure statuses reflect accurately.
3. When workers upload fresh certificates, they will reappear in your pending queue for re-approval.`
        }
      ]
    },
    {
      folder: '05-user-directory-and-account-access',
      meta: {
        title: 'User Directory & Account Controls',
        overview: 'Search registered community members, inspect profiles, and manage account access or suspensions.',
        icon: 'users'
      },
      steps: [
        {
          num: 1,
          title: 'Access the Master User Directory',
          content: `# Access the Master User Directory

View all registered homeowners and workers in your jurisdiction.

1. In the sidebar navigation, click **Account Access** (or **Users**).
2. The user table displays:
   - User Full Name
   - Registered Role (Kasambahay or Homeowner)
   - Contact Number & Email
   - Verification Badge Status
   - Account Status (Active, Suspended, or Pending)`
        },
        {
          num: 2,
          title: 'Search & Filter Users by Name, Role or Barangay',
          content: `# Search & Filter Users by Name, Role or Barangay

Quickly locate any community account.

1. In the search box, type a user's first name, last name, or mobile number.
2. Filter by **Role** (Homeowner or Kasambahay).
3. If you have city-wide Super Admin permissions, filter by specific **Barangay**.
4. The table filters in real time.`
        },
        {
          num: 3,
          title: 'View Comprehensive User Profile & History',
          content: `# View Comprehensive User Profile & History

Inspect a user's complete history on SerbiSure.

1. Click **View Details** on any user row.
2. The user details panel shows:
   - Profile photo and registered address.
   - List of all uploaded clearances and their approval history.
   - Booking count and overall rating.
   - Penalty points and infraction log (if any).`
        },
        {
          num: 4,
          title: 'Suspend an Account for Policy Violations',
          content: `# Suspend an Account for Policy Violations

Restrict account access in response to confirmed misconduct.

1. On the user details screen, click the **Manage Access** button.
2. Click **Suspend Account**.
3. Select the violation category (e.g., Code of Conduct breach, fraudulent document submission, or safety complaint).
4. Enter an official explanation for the suspension.
5. Click **Confirm Suspension**. The user is immediately logged out and blocked from posting or booking.`
        },
        {
          num: 5,
          title: 'Reactivate a Suspended User Account',
          content: `# Reactivate a Suspended User Account

Restore access once an appeal or resolution is reached.

1. Open the profile of the suspended account.
2. Click **Reactivate Account**.
3. Enter the reinstatement justification and case reference number.
4. Click **Confirm Reactivation**. The account status returns to **Active**.`
        }
      ]
    },
    {
      folder: '06-penalty-points-management',
      meta: {
        title: 'Penalty Points & Sanctions',
        overview: 'Track infractions, issue penalty points, and inspect the 5-item paginated history of sanctions.',
        icon: 'alert-triangle'
      },
      steps: [
        {
          num: 1,
          title: 'Navigate to Penalty Points Management Portal',
          content: `# Navigate to Penalty Points Management Portal

Access community disciplinary records.

1. In the sidebar navigation, click **Penalty Points**.
2. The portal displays an overview of active penalties issued across the community.
3. Review total penalty points, active suspensions, and recent incident logs.`
        },
        {
          num: 2,
          title: 'View Users with Active Penalties (5 Items Per Page)',
          content: `# View Users with Active Penalties (5 Items Per Page)

Inspect the paginated list of accounts with penalties.

1. The penalties table displays 5 items per page for clean, focused inspection.
2. Each row displays:
   - User Name & Role
   - Current Accumulated Penalty Points
   - Latest Infraction Date
   - Active Restriction (e.g., Booking restricted, Warning issued)
3. Use the **Next Page** and **Previous Page** controls at the bottom to navigate.`
        },
        {
          num: 3,
          title: 'Issue New Penalty Points with Reason and Evidence',
          content: `# Issue New Penalty Points with Reason and Evidence

Record an infraction verified by barangay investigation.

1. Click the **Add Penalty** button at the top right.
2. Search and select the user by name or phone number.
3. Select the infraction category (e.g., "Unexcused No-Show", "Disrespectful Behavior", "Terms of Service Violation").
4. Specify the point value (e.g., 1 point, 3 points, 5 points).
5. Attach notes or reference evidence from the incident report.
6. Click **Issue Penalty**.`
        },
        {
          num: 4,
          title: 'Review Historical Sanctions and Automatic Restrictions',
          content: `# Review Historical Sanctions and Automatic Restrictions

Monitor automatic tier-based system restrictions.

1. Open an individual user's penalty log.
2. SerbiSure applies progressive measures:
   - **1-2 Points**: Formal in-app warning sent to user.
   - **3-4 Points**: Temporary booking cooldown (7 days).
   - **5+ Points**: Automatic suspension pending barangay hearing.
3. Review the complete timeline of logged events and resolved disputes.`
        }
      ]
    },
    {
      folder: '07-barangay-directory-and-settings',
      meta: {
        title: 'Barangay Settings & Directory',
        overview: 'Manage barangay jurisdiction configuration, staff accounts (Super Admin), and gate pass security settings.',
        icon: 'settings'
      },
      steps: [
        {
          num: 1,
          title: 'Access Barangay Settings & Configuration',
          content: `# Access Barangay Settings & Configuration

Configure community administrative rules.

1. In the left navigation sidebar, click **Settings**.
2. Review your barangay hall's profile:
   - Official Barangay Name & City
   - Hall Office Address
   - Official Helpline & Contact Number
   - Operational Hours for Clearance Verification`
        },
        {
          num: 2,
          title: 'View Registered Barangay Jurisdictions & Coverage',
          content: `# View Registered Barangay Jurisdictions & Coverage

Review coverage areas and registered subdivisions.

1. Click the **Jurisdiction & Subdivisions** tab.
2. View the registered villages, subdivisions, and residential zones covered by your barangay.
3. Confirm that gate security checkpoints are synchronized with the Digital Village Pass validator.`
        },
        {
          num: 3,
          title: 'Manage Barangay Staff Accounts (Super Admin Only)',
          content: `# Manage Barangay Staff Accounts (Super Admin Only)

Create and manage reviewer accounts for barangay personnel.

> [!NOTE]
> This section is strictly accessible to users with the **Super Admin** role.

1. Click the **Staff Accounts** tab in Settings.
2. To add a new reviewer:
   - Click **Create Staff Account**.
   - Enter the staff member's name, official email, and assigned barangay.
   - Select permissions (**Reviewer** or **Barangay Admin**).
   - Click **Save & Send Activation**.
3. To revoke access when personnel rotate, click **Deactivate Staff** on the staff member's row.`
        },
        {
          num: 4,
          title: 'Update Barangay Contact Details & Gate Pass Protocols',
          content: `# Update Barangay Contact Details & Gate Pass Protocols

Maintain up-to-date emergency contacts and village pass parameters.

1. In the **Security & Gate Pass** configuration panel, review gate pass validity settings (standard 24-hour HMAC expiration).
2. Update the security desk phone number displayed on visitor passes in case of questions.
3. Click **Save Configuration**. All security gates and mobile apps update immediately!`
        }
      ]
    }
  ]
};

// Create directories and write files
let totalModules = 0;
let totalSteps = 0;

for (const [role, modules] of Object.entries(guidesData)) {
  const roleDir = path.join(docsRoot, role);
  if (!fs.existsSync(roleDir)) {
    fs.mkdirSync(roleDir, { recursive: true });
  }

  for (const mod of modules) {
    totalModules++;
    const modDir = path.join(roleDir, mod.folder);
    const screenshotsDir = path.join(modDir, 'screenshots');
    const stepsDir = path.join(modDir, 'steps');

    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(stepsDir, { recursive: true });

    // Write module.json
    fs.writeFileSync(path.join(modDir, 'module.json'), JSON.stringify(mod.meta, null, 2), 'utf-8');

    // Write .gitkeep in screenshots
    const gitkeepPath = path.join(screenshotsDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '', 'utf-8');
    }

    // Write steps
    for (const step of mod.steps) {
      totalSteps++;
      const stepFile = path.join(stepsDir, `${step.num}.md`);
      fs.writeFileSync(stepFile, step.content.trim() + '\n', 'utf-8');
    }
  }
}

console.log(`Generated docs successfully: ${Object.keys(guidesData).length} roles, ${totalModules} modules, ${totalSteps} steps.`);

