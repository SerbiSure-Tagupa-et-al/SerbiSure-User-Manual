from pathlib import Path
import json, re

root = Path(__file__).parent
docs = root / 'docs'
before = {p.relative_to(root).as_posix(): p.read_text(encoding='utf-8') for p in docs.rglob('*.md')}
changes = {}
captures = {}
def step(module, number, title, body, capture):
    path = f'docs/{module}/steps/{number}.md'
    changes[path] = '# ' + title + '\n\n' + body.strip() + '\n'
    captures[path] = capture

hreg = 'homeowner/01-registration-and-profile'
kreg = 'kasambahay/01-registration'
personal = '''1. Enter your **First Name**, **Middle Name (Optional)** and **Last Name**.
2. Choose your **Gender**, **Date of Birth** and **Nationality**. You may also choose your **Religion**.
3. Enter your mobile number after **+63**, starting with 9. Enter your **Email** if you use one.
4. Fill in **Password (min. 8 characters)** and **Confirm Password**.
5. Tap **Next**.'''
for m in [hreg,kreg]:
    step(m,2,'Fill In Personal and Account Details',personal,'Registration personal details form, including +63 phone field, password and Next.')
address = '''1. Choose **Select Region**, **Select Province**, **Select City / Municipality** and **Select Barangay**, in that order.
2. Enter **House No. / Street / Zone** and check **Zip Code (e.g. 9000)**.
3. Open and read **Terms and Conditions.** and **Data Privacy Policy.** Give consent to both.
4. Tap **Next** to continue to face verification.'''
step(hreg,3,'Enter Your Address and Give Consent',address,'Homeowner address form with location selectors, street, ZIP and both consent boxes.')
face = '''1. Allow camera access and follow the face-check instructions on the screen.
2. Keep your face inside the guide in a bright place.
3. Check the captured selfie. Tap **Retake Photo** if you need another picture.
4. Tap **Use This Photo** to submit it and create your account.

Your selfie starts as **Pending**. An official must approve it before you can post or book. Passing the face check does not approve your photo or other documents.'''
step(hreg,4,'Take Your Registration Face Photo',face,'Homeowner Face Verification captured-selfie review with Retake Photo and Use This Photo.')
step(hreg,5,'Submit Your National ID', '''1. On **Step 4: Identity Documents**, select **National ID (Front)** and **National ID (Back)**.
2. Take or choose clear photos of both sides. Check that all details can be read.
3. Tap **Submit**. Your documents go to the reviewers.
4. You can use **Skip** to submit documents later from your profile. Posting and booking remain blocked until your required documents and face photo are approved.''','Homeowner Identity Documents screen with National ID front/back, Submit and Skip.')
photo = '''1. Open **Profile** using the person icon in the bottom bar. You can also check the avatar in **Personal Info**.
2. Look at the photo badge: a green check means verified, a yellow clock means under review, a red exclamation mark means a retake is needed, and no badge means no photo has been submitted.
3. Tap the avatar to read **Profile Photo Verified**, **Photo Under Review**, **Profile Photo Needs Retake**, or **Add your face photo**.
4. For a rejected photo, read **Note from reviewer**. Tap **Retake Photo**. For a missing photo, tap **Take Photo**.
5. Use the live face camera and tap **Use This Photo**. Gallery photos are not available. The new photo returns to Pending for review.

A pending photo cannot be retaken. An approved photo is locked. To change it, message your barangay office or the SerbiSure admin. A missing, pending or rejected photo blocks posting and booking. Photo approval is separate from approval of your other documents.'''
step(hreg,6,'Check Your Profile Photo Review',photo,'Profile avatar status pop-up; use a rejected test photo so Note from reviewer and Retake Photo are visible.')
step(kreg,3,'Select Services You Offer', '''1. Under **SERVICES YOU OFFER**, choose the services you can provide: **Cleaning**, **Child Care**, **Cooking**, **Caregiver**, **Laundry** or **All-around**.
2. Choose all that apply. Continue down the same work-profile form.''','Worker registration work-profile form with SERVICES YOU OFFER expanded.')
step(kreg,4,'Choose Work Preferences and Rates', '''1. Under **WORK YOU ARE LOOKING FOR**, choose **Short-term, Stay-in**, **Short-term, Stay-out**, **Long-term, Stay-in**, **Long-term, Stay-out** or **Both**.
2. Enter your expected monthly salary and daily rate in the fields shown.
3. Continue down the same form to enter your background.''','Worker registration work-profile form showing work preferences and expected monthly/daily rates.')
step(kreg,5,'Fill In Your Background', '''1. Choose your spoken languages and household work background.
2. Select your approximate experience. You can also select practical skills.
3. Fill in your highest education, civil status and number of children.
4. Tap **Next** to open the address form.''','Lower worker registration work-profile form showing experience, education, civil status and children.')
step(kreg,6,'Enter Your Address and Give Consent',address,'Worker address form with location selectors, street, ZIP and both consent boxes.')
step(kreg,7,'Take Your Registration Face Photo',face,'Worker Face Verification captured-selfie review with Retake Photo and Use This Photo.')
step(kreg,8,'Submit Your Worker Clearances', '''1. On **Step 5: Identity Documents**, select **NBI Clearance** and **Police Clearance**.
2. Take or choose a clear photo of each document.
3. Tap **Submit** to send them for review. You can use **Skip** to upload them later from your profile.

You need both clearances and your face photo approved before you can apply, post or book.''','Worker Identity Documents screen showing separate NBI Clearance and Police Clearance upload cards.')

hp='homeowner/03-post-a-job'; kp='kasambahay/07-post-a-service'
for m,mode in [(hp,'Job'),(kp,'Service')]:
    step(m,1,f'Open Post a {mode}',f'''1. Tap the plus button beside the bottom navigation bar.
2. The **Post a {mode}** form opens.

Your required documents and profile photo must be approved. If the app asks you to complete verification, do that first.''',f'Main app screen with the plus Create a post button beside the bottom bar, signed in as {mode.lower()} poster.')
    step(m,2,'Choose Services and Work Type', '''1. Choose **Cleaning**, **Child Care**, **Cooking**, **Caregiver**, **Laundry** or **All-around**.
2. Under **ENGAGEMENT**, choose **Short-term** or **Long-term**.
3. Under **WORK SETUP**, choose **Stay-in** or **Stay-out**.
4. Tap **Next**.''',f'Post a {mode}, Step 1 of 3, with services, ENGAGEMENT, WORK SETUP and Next.')
step(hp,3,'Enter the Job Location', '''1. On the location page, tap **Use Profile Address** if you want to copy your saved address.
2. Check the region, province, city and barangay.
3. Enter **House No. / Street / Zone / Subdivision**, **Floor / Unit (optional)** and **ZIP Code** as needed.
4. Stay on this page to set the daily hours.''','Post a Job Step 2 of 3 showing the work address fields and Use Profile Address.')
hours='''1. Tap **Work hours** and choose the daily start and end hours. Short-term posts also offer preset hours.
2. Check that the end time is after the start time.

Public posts have no calendar dates or weekdays. Agree on real dates and work days later in a chat booking offer.'''
step(hp,4,'Set Daily Work Hours',hours,'Post a Job Step 2 with Work hours picker open, showing daily start and end times.')
step(hp,5,'Add Household Instructions', '''1. On the same location page, find **INSTRUCTIONS (OPTIONAL)**.
2. Describe the chores, house rules or other needs the worker should know.
3. Continue to **OFFER AMOUNT** on this page.''','Post a Job Step 2 showing INSTRUCTIONS (OPTIONAL) and OFFER AMOUNT.')
step(hp,6,'Enter the Offer Amount', '''1. Enter your pay offer under **OFFER AMOUNT**.
2. Check the unit: **/ day** for Short-term or **/ month** for Long-term.
3. If the app shows a minimum-rate message, correct the amount.
4. Tap **Next** to review your post.''','Post a Job Step 2 showing OFFER AMOUNT with the daily or monthly unit and Next.')
for m,mode,n in [(hp,'Job',7),(kp,'Service',5)]:
    step(m,n,f'Review and Post Your {mode}',f'''1. Read **LISTING PREVIEW** and **SUMMARY**. Check the service, engagement, work setup, rate, location and **Work hours**.
2. Tap the agreement checkbox. Read and accept the terms that open.
3. Tap **Post {mode}**.
4. Wait for **{mode} posted!** before leaving the form.''',f'Post a {mode} Step 3 of 3 showing preview, summary, agreement and Post {mode}.')
step(kp,3,'Set Location and Daily Hours', '''1. Check your region, province, city and barangay. Use **Use Profile Address** to copy your saved location if available.
2. Tap **Work hours** and choose your daily start and end hours. Short-term posts also offer presets.

Public service posts do not ask for dates or weekdays. Agree on those in a chat booking offer.''','Post a Service Step 2 of 3 showing location and Work hours; no date or weekday controls.')
step(kp,4,'Add Your Notes and Expected Rate', '''1. Under **ABOUT YOU (OPTIONAL)**, describe your experience or service.
2. Enter **OFFER AMOUNT**. The unit is **/ day** for Short-term or **/ month** for Long-term.
3. Correct any minimum-rate warning.
4. Tap **Next** to review.''','Post a Service Step 2 showing ABOUT YOU (OPTIONAL), OFFER AMOUNT and Next.')

own='homeowner/08-managing-own-posts'
step(own,1,'Find My Recent Posts', '''1. Tap the person icon in the bottom bar to open **Profile**.
2. Open **Personal Info**.
3. Select **My Recent Posts** to find your public listings.

Public posts have daily work hours, without calendar dates or expiry badges.''','Personal Info with My Recent Posts selected and an own public job card visible.')
step(own,2,'Open Your Post Details', '''1. Tap one of your post cards.
2. Read **Work hours**, **Location** and **About / Instructions**.
3. Tap **Close** to return to your posts.

Workers who apply can contact you in chat. A chat booking offer is separate from the public listing.''','Own Post Details showing Work hours, Location, About / Instructions, Cancel Post and Close.')
step(own,3,'Agree on Dates in Chat', '''1. Open the conversation with the worker using the speech-bubble icon in the bottom bar.
2. Discuss the actual work dates, weekdays, hours and pay.
3. Put the agreed schedule in a new booking offer.

Your public post has no date to extend or reschedule. A new chat offer does not automatically close the listing.''','Employer chat with a worker, showing the booking-offer entry control before composing a dated offer.')
step(own,4,'Cancel a Public Post', '''1. Open the post you want to remove.
2. Tap **Cancel Post**.
3. In **Cancel Post**, read **Remove this post from the public feed?**
4. Tap **Cancel Post** to remove it, or **Keep Post** to leave it visible.''','Cancel Post confirmation dialog with Remove this post from the public feed?, Keep Post and Cancel Post.')

hb='homeowner/04-browse-workers-and-hire'; kb='kasambahay/06-browse-jobs-and-apply'
for m,who in [(hb,'worker'),(kb,'homeowner')]:
    step(m,1,'Browse Public Posts',f'''1. Tap the briefcase icon in the bottom navigation bar to browse posts.
2. Use **Explore** for new posts or **Saved** for posts you bookmarked.
3. Read the service, location, work setup, rate and daily hours.

On **Home**, the **Recent Posts** cards have separate tap areas. Tap the {who}'s name or photo to open their profile. Tap the description to open full details. The swipe-deck controls stay the same.''',f'Home Recent Posts card showing owner name/photo and description; capture the {who} post appropriate to this role.')
    step(m,2,'Filter the Posts', '''1. Open **Filters** to see **Filter & Sort**.
2. Choose **SERVICE CATEGORY**, **BOOKING TYPE** and **WORK SETUP** as needed.
3. Set a maximum daily or monthly rate if you want a price limit.
4. Enter an area under **LOCATION / BARANGAY**. Filters update as you change them.
5. Close the panel to browse. Use **Reset all filters** to clear your choices.''','Filter & Sort panel showing categories, booking type, setup, maximum rate and location; no minimum-rating control.')
step(hb,3,'View a Worker Profile and CV', '''1. Tap the worker's name or photo on a **Recent Posts** card.
2. Read **About Kasambahay** and the details they share.
3. Tap **View CV** to open **SerbiSure CV**.
4. Read their services, work preferences, skills, experience, education and languages.''','Worker public profile showing About Kasambahay and View CV.')
step(hb,4,'Read Verification and Feedback', '''1. Check the worker's verification badge.
2. Open **Reviews & Feedbacks** to read feedback from other users.
3. Check the rating and positive-feedback summary. If there are no reviews, the profile shows **No reviews yet**.

A profile photo approval is separate from the worker's other document approvals.''','Worker public profile with Reviews & Feedbacks selected, rating and feedback summary visible.')
step(hb,5,'Start a Conversation', '''1. On the worker's profile, tap **Message** beside their name.
2. From a service post's details, you can also tap **Message Kasambahay**.
3. Discuss the work dates, hours, address and pay in chat before sending a booking offer.

Your required documents and face photo must be approved before booking.''','Service post details with Message Kasambahay visible.')
step(kb,3,'Read the Full Job Details', '''1. On a Home card, tap the description or the details icon. In browse results, open the post details.
2. Read **ABOUT THIS ROLE**, the location, rate and **Work hours**.
3. Tap the homeowner's name or photo if you want to view their profile.

The public listing has no calendar dates or weekdays. Discuss those in chat.''','Job details sheet showing ABOUT THIS ROLE, Work hours and Apply Now, without dates.')
step(kb,4,'Apply for the Job', '''1. Tap **Apply Now** on the job details.
2. Wait for the application to be saved. The app opens the homeowner's chat.
3. Use **Applied** in the browse screen to find your applications later.

Your required clearances and profile photo must be approved before you can apply. An application is not a confirmed booking.''','Job details sheet before tapping Apply Now.')
step(kb,5,'Discuss Dates with the Homeowner', '''1. In the chat that opens after applying, send a greeting.
2. Discuss the actual dates, weekdays, daily hours and pay.
3. Review any booking offer the homeowner sends before accepting it.

An application pass may already be visible while your application is pending. It stays amber and does not permit entry.''','Chat opened from a job application, with the application context and message input visible.')

ver='kasambahay/03-identity-and-liveness-verification'
step(ver,1,'Open Document Verification', '''1. Tap the person icon in the bottom bar to open **Profile**.
2. Tap **Get Verified** to open **Document Verification**.
3. Check your submitted documents and any reviewer notes.''','Profile settings showing Get Verified and the current verification status.')
step(ver,2,'Select Your NBI Clearance', '''1. In **Document Verification**, find **Upload Documents**.
2. Tap **NBI Clearance**.
3. Take or choose a clear photo of the document. Check that your name and validity details can be read.''','Document Verification upload area with NBI Clearance and Police Clearance cards.')
step(ver,3,'Submit Both Required Clearances', '''1. Tap **Police Clearance** and take or choose a clear photo.
2. Check both your NBI and Police clearance photos.
3. Tap **Submit Documents**.
4. Wait for confirmation that your documents were submitted for review.

Workers need both NBI Clearance and Police Clearance. They are separate requirements.''','Document Verification with both clearance images selected and Submit Documents visible.')
step(ver,4,'Check Your Face Photo',photo,'Profile avatar status pop-up with a rejected test photo, reviewer note and Retake Photo; no rejection banner at top of Profile.')
step(ver,5,'Read the Review Results', '''1. Open **Document Verification** again to check progress.
2. **Under Review** means an official is still reviewing the document. **Checking document** means its details are being read.
3. **Approved** means the document was accepted. **Needs Re-upload** means you should read the note and send a new photo.
4. **Expired** means you need a renewed document.

Your worker verification needs approved, valid NBI and Police clearances and an approved face photo. Automated checks assist the officials; they do not guarantee approval.''','Document Verification Submitted Documents list showing real status labels and reviewer feedback.')
renew='kasambahay/04-clearance-renewal'
step(renew,1,'Check for an Expired Clearance', '''1. Open **Profile** and look for **Renewal needed**.
2. Tap the notice or **Get Verified** to open **Document Verification**.
3. Find the document marked **Expired** and read its expiry date.

An expired clearance does not delete your account. You can upload a renewal without waiting for an official to reject it.''','Profile Renewal needed notice for an expired required clearance.')
step(renew,2,'Open the Renewal Upload', '''1. Find the expired document in **Document Verification**.
2. Read **Please upload your renewed document.**
3. Tap **Upload renewed clearance**.''','Expired clearance row with its date and Upload renewed clearance button.')
step(renew,3,'Submit the Renewed Clearance', '''1. Take or choose a clear photo of the newly issued clearance.
2. Check your name and the issue and validity dates.
3. Tap **Submit Documents**.
4. The renewal goes under review. You can apply and post again once your required documents are approved and valid.''','Document Verification renewal upload with the new clearance selected and Submit Documents visible.')

cv='kasambahay/05-worker-cv-builder'
step(cv,1,'Open Your Worker CV', '''1. Open **Profile**, then **Personal Info**.
2. Tap **View CV** beside your profile information.
3. **SerbiSure CV** opens with a resume made from your saved details.
4. Tap the pencil button labelled **Edit CV** to open **Edit CV Details**.''','SerbiSure CV view with the pencil Edit CV control, View PDF and Download PDF.')
step(cv,2,'Edit Services, Rates and Experience', '''1. In **Edit CV Details**, choose **SERVICES YOU OFFER** and **WORK YOU ARE LOOKING FOR**.
2. Enter **EXPECTED MONTHLY SALARY** and **EXPECTED DAILY RATE**.
3. Select **SPOKEN LANGUAGES** and **HOUSEHOLD WORK BEFORE**.
4. Choose your **APPROXIMATE EXPERIENCE**. The optional skills selector below it also uses **APPROXIMATE EXPERIENCE** as its label; choose the practical skills you have.''','Upper Edit CV Details form showing services, work preferences, rates, languages, experience and optional skill selector.')
step(cv,3,'Edit Personal Details and Save', '''1. Choose **HIGHEST EDUCATION**, **CIVIL STATUS** and **NUMBER OF CHILDREN**.
2. Tap **Update** to save your changes and return to your CV.
3. Tap **Cancel** if you want to leave without saving.''','Lower Edit CV Details form showing education, civil status, children, Cancel and Update.')
step(cv,4,'View or Download the PDF', '''1. Review your saved **SerbiSure CV**. It includes your profile, contact details, skills, experience, work preferences, education and languages. Personal details appear when shared.
2. Tap **View PDF** to open the PDF preview.
3. Tap **Download PDF** to save or share a copy using the options your phone provides.

Check the details before sharing your CV.''','Saved SerbiSure CV with View PDF and Download PDF visible.')

hc='homeowner/05-chat-and-messaging'; kc='kasambahay/08-chat-and-offers'
step(hc,3,'Send a Booking Offer in Chat', '''1. In the worker's chat, open the booking form using the booking control.
2. Choose the service, **ENGAGEMENT** and **WORK SETUP**.
3. Set the actual dates, **WORK HOURS** and **WORK SCHEDULE**. Enter **WORK ADDRESS** and the agreed daily or monthly pay.
4. Read the review and accept **SerbiSure Terms of Service**.
5. Tap **Send Offer**. The worker can review it and choose **Accept** or **Decline**.

Dates and weekdays belong in this offer. Sending it does not automatically close your public post.''','Chat booking offer review, with actual dates, hours, pay, agreement and Send Offer visible.')
step(kc,2,'Review a Booking Offer', '''1. Tap the booking offer card in the homeowner's chat to open its details.
2. Check the service, **Service date** or **Start date**, **End date** if shown, **Work hours** and **Work days**.
3. Read the address, work setup and **Daily rate** or **Monthly salary**.
4. Ask the homeowner in chat if anything needs to change.''','Received booking offer review showing the saved dates, hours, work days, address and pay.')
step(kc,3,'Accept or Decline the Offer', '''1. If the terms are correct, tap **Accept**.
2. If you do not agree, tap **Decline** or discuss changes in chat.
3. After acceptance, the offer shows **Booking Confirmed**.

You cannot accept an offer whose start date has passed. Ask the homeowner to send a new offer with a future schedule.''','Received booking offer with Accept and Decline controls visible.')

hpass='homeowner/06-bookings-and-village-pass'; kpass='kasambahay/09-booking-schedules-and-village-pass'
for m,role in [(hpass,'homeowner'),(kpass,'kasambahay')]:
    step(m,1,'Open Your Bookings',f'''1. Tap the booking icon at the top of the app, labelled **Bookings & Hires**.
2. You will see **{'My Bookings & Hires' if role=='homeowner' else 'My Jobs & Contracts'}**.
3. Choose **Active**, **Pending**, **Ongoing**, **Completed** or **Cancelled**.
4. Tap **Details** on the booking you want to open.''',f"{'My Bookings & Hires' if role=='homeowner' else 'My Jobs & Contracts'} list with its five tabs and Details buttons.")
passbody='''1. Open the booking details and find **Digital Village Pass**. It is shown inside the booking, including bookings that began from a job post.
2. Open the booking while online to refresh its pass. The signed QR link expires 24 hours after it is issued. Old QR screenshots stop working after that time.
3. Tap the QR or the **BK-XXXXXXXX** code to copy the booking code. This code is a logbook reference. It cannot look up a pass.
4. Once the booking and its pass are saved on your phone, the QR can display without internet. The guard still needs internet to check it.

If no pass was saved, the app says **Connect to the internet and reopen this booking to get a fresh pass.**

An applicant can see a pass while their job application is pending. It stays amber and does not allow entry.'''
step(hpass,3,'Open and Refresh the Digital Village Pass',passbody,'Booking details with Digital Village Pass QR and BK booking code; redact the live signed QR before adding the screenshot.')
step(kpass,2,'Open and Refresh the Digital Village Pass',passbody,'Booking details from a job-post application showing Digital Village Pass and BK code; redact the signed QR.')
guard='''1. Show the saved QR to the guard. The guard scans it with an internet-connected phone.
2. The guard's page opens without a login.
3. Read the result: green **OK to enter** means the live checks allow entry; amber **Do not enter yet** means the booking is pending, outside its work time or needs confirmation; red **Do not enter** means entry is refused, including cancelled or ended bookings.
4. Follow the guard's identity check and local entry rules. A QR image or copied booking code alone does not guarantee entry.'''
step(hpass,4,'Read the Guard Check Result',guard,'Guard public pass page with a test booking result; show status words and redact private details and signed link.')
step(kpass,3,'Show the Pass to the Guard',guard,'Guard public pass page for a pending test application showing amber Do not enter yet; redact signed link.')
step(hpass,2,'Check the Agreed Booking Details', '''1. Open **Details** on a booking.
2. Read the partner's name, service, agreed dates, **Work hours**, **Work days**, address and pay.
3. Check whether the booking is pending or confirmed before arranging your arrival.

These are the dates agreed in the booking offer. Public listings only show daily hours.''','Booking details review with saved dates, work hours, work days, address, pay and status.')
completion='''1. Open your bookings and find the job when the work is finished.
2. If work has not been started in the app, use **Start Job** and **Confirm Start** when appropriate.
3. For work in progress, tap **Complete**.
4. In **Complete Job**, tap **Mark Complete**.
5. The booking becomes **Completed** and the required feedback form opens.'''
step(hpass,5,'Complete the Job',completion,'Ongoing booking card before Complete; use the Complete Job dialog for a separate reference if needed.')
kreview='kasambahay/10-completed-jobs-and-reviews'
step(kreview,1,'Record Job Completion',completion,'My Jobs & Contracts Ongoing booking card showing Complete.')
step(kreview,2,'Read Feedback on Your Profile', '''1. Open **Profile**, then **Personal Info**.
2. Check your rating and positive-feedback summary.
3. Select **Reviews & Feedbacks** to read reviews.
4. If you have not received feedback, the profile shows **No reviews yet**.''','Personal Info with Reviews & Feedbacks selected, rating and positive-feedback summary visible.')
hreview='homeowner/07-reviews-and-ratings'
reviewentry='''1. Open your bookings using the booking icon at the top of the app.
2. Choose **Completed** and tap **Leave Review** on the booking.
3. You can also open the **Mandatory Service Feedback** prompt when it appears.
4. Check the other person's name before rating them.'''
step(hreview,1,'Open a Completed Booking Review',reviewentry,'Completed booking card showing Leave Review or Mandatory Service Feedback prompt.')
reviewbody='''1. Select a star rating from 1 to 5.
2. Under **YOUR EXPERIENCE**, write feedback with at least 10 characters and no more than 1000.
3. Tap **Submit Review**. Keep the screen open while your feedback is checked.
4. When **Review submitted** appears, tap **Done**.

Your star rating is separate from the feedback sentiment. If analysis is unavailable, read the message and use **Try Again**.'''
step(hreview,3,'Write and Submit Feedback',reviewbody,'Review form showing YOUR EXPERIENCE, character guidance and Submit Review.')
step(kreview,3,'Review Your Experience with the Homeowner',reviewentry+'\n\n'+reviewbody,'Review form for the homeowner showing stars, YOUR EXPERIENCE and Submit Review.')

alog='admin/01-login-and-jurisdiction'
step(alog,2,'Sign In with Your Official Account', '''1. Enter your **Email or Username**.
2. Enter your **Password**.
3. Select **Remember me** only on a trusted computer if you want the portal to remember your sign-in.
4. Click **Sign In**.''','Admin login form showing Email or Username, Password, Remember me and Sign In.')
step(alog,3,'Check Your Jurisdiction', '''1. Check the signed-in account and assigned barangay in the portal.
2. Barangay accounts can review and manage residents only within their allowed jurisdiction.
3. Super Admin accounts can access wider barangay views and LGU setup controls.

Only use the actions available to your account. Review and access changes record the official who made them.''','Signed-in portal header and sidebar showing the test account role and assigned jurisdiction.')
dash='admin/02-dashboard-and-analytics'
step(dash,1,'Read the Workforce Totals', '''1. Open **Dashboard**.
2. Read **TOTAL REGISTERED WORKERS**, **CURRENTLY EMPLOYED (OCCUPIED)** and **CURRENTLY AVAILABLE**.
3. Read the note below the cards to understand who is counted. Counts use verified-worker records and worker status.
4. Click **Sync Real-Time** to refresh the data.''','Dashboard workforce cards with their exact labels, explanatory note and Sync Real-Time.')
step(dash,2,'Read Verification Status and Employment Trends', '''1. Read the verification status chart for **Verified**, **Pending**, **Unverified**, **Expired** and **Rejected** accounts.
2. Use its role and barangay filters where your account allows them.
3. Read the employment trend for **Occupied** and **Available** workers.
4. A month with **No history** has no recorded history; do not treat it as zero workers.''','Dashboard verification status and employment trend panels with available filters.')
step(dash,3,'Read Skills and Service Distribution', '''1. Find **Skills & Service Distribution** on the dashboard.
2. Read the counts and percentages for each service.
3. Use the allowed barangay view to check your area.

Workers may offer several services, so percentages can add up to more than 100%. All-around is counted as its own category.''','Skills & Service Distribution panel with service percentages and its explanatory note.')
av='admin/03-verification-queue-and-ocr'
step(av,1,'Open the Verification Queue', '''1. Click **Verifications** in the sidebar.
2. Find **Verification Queue**.
3. Use **Recent First** or **Oldest First** to choose the order. Use **Refresh Queue** to reload submissions.''','Verifications page with Verification Queue and recent/oldest sort selector.')
step(av,2,'Find an Applicant and Document', '''1. Use **All Roles** to choose Kasambahay or Homeowner.
2. Use the barangay filter if it is available to your account.
3. Expand the applicant's documents.
4. Click **Review** on the document you want to inspect. Use the page controls for more applicants.''','Expanded applicant in Verification Queue showing separate documents and Review controls.')
step(av,3,'Inspect the Scan and Read Details', '''1. Select the applicant's document in the review panel.
2. Read **ID Name**, **ID Type**, document number, **Date Issued**, **Validity** and **Status** where shown.
3. Click **Click to Zoom Scan** to enlarge the scan. Use **Rotate** if needed.
4. Compare the actual image with the extracted details and any **Flagged Discrepancies**.''','Document review panel with scan, extracted fields, Flagged Discrepancies and Click to Zoom Scan.')
step(av,4,'Compare the Photo with the Document', '''1. Click **Compare Face** to open **Review applicant**.
2. Compare the profile photo with the face on the selected document.
3. Use the image zoom, rotate and move controls as needed.
4. Select another document with **Document to review** if needed.
5. Click **Done** when finished.

A generated avatar cannot be used for face comparison. Make your own visual check; this screen does not provide a biometric similarity score.''','Review applicant dialog with profile photo, document and image controls.')
step(av,5,'Correct Confirmed Details', '''1. Click **Edit details** in the document review panel.
2. Correct only details you can confirm from the document.
3. Check **Account details** and **Document details**, including names, birthdate, document number and clearance dates where shown.
4. Click **Save corrections**.

The change is recorded in the Audit Trail. Saving corrections does not approve the document. Login, contact information, role and barangay cannot be changed here.''','Edit details form with Account details, Document details and Save corrections; no correction-reason field.')
step(av,6,'Approve or Reject the Document', '''1. In the document review panel, click **APPROVE** if the document meets the requirements.
2. To reject it, click **REJECT**, enter a helpful explanation in **Rejection reason (optional)** and click **Send**.
3. In the **Review applicant** comparison dialog, the equivalent controls are **Approve document**, **Reject document** and **Confirm rejection**.

Review every required document separately. A document decision does not approve the profile photo.''','Document review decision area showing APPROVE, REJECT and optional rejection-reason input.')
step(av,7,'Review the Profile Photo', '''1. Open **Profile Photo** from the applicant's documents.
2. Check that the face is clear and matches the person's ID.
3. Click **Approve Photo** to approve the photo only.
4. To reject it, fill in **Reason if rejected (required)**, click **Reject Photo**, then **Confirm rejection**. Use **Keep reviewing** to cancel.

Approving this photo does not approve the other documents. A rejected photo must be retaken before posting, applying or booking.''','Profile Photo review panel with loaded test photo, required rejection reason, Approve Photo and Reject Photo.')
exp='admin/04-expired-clearances-processing'
step(exp,1,'Find Expired Clearances', '''1. Open **Verifications** and inspect the applicant's document rows.
2. Check the expiry information shown with each clearance.
3. Review the saved validity date before requesting renewal.

Expiry is based on saved dates. A clearance may need renewal even before an official processes it.''','Expanded verification applicant with an expired clearance row and saved expiry date.')
step(exp,2,'Process Expired Clearances', '''1. Click **Process expired clearances**.
2. Read the confirmation showing the document count, worker count and jurisdiction.
3. Confirm only after checking the scope. The action covers your whole jurisdiction, regardless of table filters.
4. The expired clearances are marked Rejected and affected workers receive a renewal notification. Valid clearances stay unchanged.

If there is nothing to process, the portal shows **No expired clearances need processing in your jurisdiction.** Workers can upload renewals without waiting for this action.''','Process expired clearances confirmation showing counts and jurisdiction, using test data.')

users='admin/05-user-directory-and-account-access'
step(users,1,'Open the User Directory', '''1. Click **Users** in the sidebar to open the directory.
2. Choose the account-type tab you need.
3. Review the names and contact details available to your account.

Use **Account Access** to manage messaging pauses and account suspensions.''','Users directory with its account-type tabs and user list.')
step(users,2,'Search and Filter Accounts', '''1. In **Users**, enter a name in the search field.
2. Choose the account-type tab. Use the barangay filter if your account can access it.
3. In **Account Access**, use **Search name or barangay**, **All users** and **All access** to narrow the list.
4. Clear the filters if the account does not appear.''','Account Access filters showing Search name or barangay, All users and All access.')
step(users,3,'View a User and Open Their Conversation', '''1. Select a user in **Users**.
2. Read the details shown in the user panel.
3. Click **Message** to open a conversation if you need to contact them.
4. Use **Verifications** for their submitted documents and **Penalty Points** for penalty review.''','Users directory with a selected user detail panel and Message control.')
step(users,4,'Suspend an Account', '''1. Open **Account Access** and click **Manage access** for the user.
2. Under **Change access**, choose **Suspend account**.
3. Read the explanation. This blocks all app access, including support messages.
4. Click **Continue**, check the confirmation, then click **Confirm**.

To pause only resident chats, choose **Pause messaging** and **Pause for** instead. Support and Barangay messages stay open during a messaging pause.''','Manage access dialog showing Change access set to Suspend account, explanation and Continue.')
step(users,5,'Restore Account Access', '''1. Open **Manage access** for the suspended user.
2. Choose **Restore account** under **Change access**.
3. Click **Continue**, check the confirmation and click **Confirm**.
4. For a messaging pause, use **Lift messaging pause** instead.

Access changes record your official account. Check the access history after saving.''','Manage access dialog for a suspended test account with Restore account selected.')
pen='admin/06-penalty-points-management'
step(pen,1,'Open Penalty Points', '''1. Click **Penalty Points** in the sidebar.
2. Review the user list and the monthly score shown out of 3.
3. Use the search, user-role, score and barangay filters available to your account.''','Penalty Points user list showing search, filters and scores out of 3.')
step(pen,2,'Find the User to Review', '''1. Enter a name or barangay in **Search name or barangay**.
2. Use **All users** and **All scores** to narrow the list.
3. Use **Previous** and **Next** to move through pages when shown.
4. Click **Review** for the user.''','Penalty Points filtered list with a Review button and pagination when present.')
step(pen,3,'Adjust Monthly Penalty Points', '''1. In **Review penalty points**, read **This month’s cancellations**.
2. Check the cancellation and verify any safety report with the user or barangay records.
3. Choose **Adjustment** and check **New score**. The result must remain between 0 and 3.
4. Enter **Reason / incident notes** with at least 10 characters.
5. If you verified a report, select **I verified the safety / incident report** and add **Report or blotter reference** when applicable.
6. Click **Apply adjustment**.

Each adjustment is recorded with your name, the point change and notes.''','Review penalty points dialog showing cancellations, Adjustment, New score, notes and Apply adjustment.')
step(pen,4,'Check Restrictions and Adjustment History', '''1. Check the user's monthly score. At **3/3**, booking and posting are restricted until the 1st of next month.
2. Read **Recent adjustments** in the review dialog.
3. Use the history view on **Penalty Points** to find earlier adjustments.

Monthly penalty restrictions are separate from an account suspension managed in Account Access.''','Penalty review showing score out of 3 and Recent adjustments, with synthetic incident notes.')
settings='admin/07-barangay-directory-and-settings'
step(settings,1,'Open Settings', '''1. Click **Settings** in the sidebar.
2. Check the settings available to your account.
3. A Super Admin can view **Barangay Directory & Coverage**. A barangay account can maintain its desk profile and password.''','Settings page for a barangay account with desk-profile and password sections visible.')
step(settings,2,'Review Barangay Directory and Coverage', '''1. As Super Admin, open **Barangay Directory & Coverage**.
2. Use **All**, **Active LGUs** or **Needs Account** to narrow the directory.
3. Enter a name in **Search barangay...**.
4. Read the LGU account, citizen, verification and employment counts for the barangay.''','Super Admin Barangay Directory & Coverage table with filters and Search barangay... field.')
step(settings,3,'Set Up an LGU Account as Super Admin', '''1. Find a barangay marked **No Account**.
2. Click **Setup LGU**. Use **Add Barangay** when adding a new directory entry.
3. Fill in the location and required account details in the form.
4. Review any **Jurisdiction Locked:** notice. Do not change an existing community's jurisdiction.
5. Submit the form after checking the details.''','Super Admin Setup LGU form for a test barangay, with required fields and any jurisdiction-lock notice visible.')
step(settings,4,'Update the Desk Profile or Password', '''1. In your barangay settings, update **Desk Officer in Charge**, **Official Desk Hotline**, **Physical Desk / Barangay Hall Location** and **Office Operating Hours & Public Notice** as needed.
2. Click **Save Desk Profile** and wait for confirmation.
3. To change your password, enter the current password and the new password twice, then click **Update Password**.

These settings do not change QR pass validity or gate-entry rules.''','Barangay desk-profile settings with named fields and Save Desk Profile; keep passwords out of the capture.')

# Preserve steps that match main, changing only incorrect phrases in otherwise valid steps.
for m in ['homeowner/02-login','kasambahay/02-login']:
    path=f'docs/{m}/steps/1.md'
    changes[path]=before[path].rstrip()+'''\n\n**Startup help:** On launch, SerbiSure checks for updates on a branded starting screen. If the check takes over 6 seconds or fails, check your internet and tap **Try Again**. An app update downloads and restarts SerbiSure. For an Android installer update, tap **Update Now** and follow your phone's **Update** or **Allow** prompt. Use **Finish Update** if prompted. A failed update check cannot be skipped.\n'''
for path, text in list(before.items()):
    if path not in changes:
        replacement=text.replace('**Messages** tab','speech-bubble tab').replace('**Profile** tab','person tab (**Profile**)')
        if replacement!=text:
            changes[path]=replacement
            captures[path]='Bottom navigation showing the speech-bubble/person icon used in the instructions, before opening that screen.'

# Save the audit BEFORE applying guide edits; one row for each original step.
audit=['# Audit against origin/main','',
'Reference snapshots: mobile `c47f074da958fb60b42c7b45a680049823848a82`; backend `2e643f1a596976b43fbf054170d14a4adc51fa48`; admin `1f120c7c65dbc82e15559a0185b9bd4468fcf7f6`.',
'','All app source was read with `git show origin/main:<path>`. No redesign branch or app working-tree implementation was used. This is a source audit, not a device test.','',
'| File | What is wrong | Planned change |','| --- | --- | --- |']
reasons={hreg:'Registration fields/order, face review and document submission differ from main.',kreg:'Registration fields/order and face/document submission differ from main.',hp:'Posting entry, form order, dates, rates or labels are outdated.',kp:'Posting entry, form order, weekdays, rates or labels are outdated.',own:'Own-post management controls or dated/repost flow do not exist on main.',hb:'Browse filters, CV details, profile actions or Recent Posts tap targets are wrong or missing.',kb:'Browse/apply controls or public-post dates and application confirmation are wrong.',ver:'Verification entry, document types, status labels or face-review workflow are wrong.',renew:'Renewal prompt, expiry alert or upload labels are wrong.',cv:'CV controls and editable fields are invented or outdated.',hc:'Booking offer labels and workflow are wrong.',kc:'Offer detail and acceptance labels are wrong.',hpass:'Booking entry, details, pass behavior or completion labels are wrong.',kpass:'Booking entry and village-pass behavior are wrong.',kreview:'Completion/review labels or reputation claims are unsupported.',hreview:'Review entry, feedback field or submission requirements are wrong.',alog:'Login placeholder or permission description is wrong.',dash:'Dashboard metrics, SLA workload chart or service chart labels are wrong.',av:'Queue/review controls, OCR correction form or identity comparison claims are wrong; photo review is missing.',exp:'Expiry filter or processor labels, scope and result are wrong.',users:'Directory and account-access controls are conflated or invented.',pen:'Penalty creation, review controls and restriction thresholds are wrong.',settings:'Directory, LGU setup, desk settings or gate-pass controls are invented or outdated.'}
for path in sorted(before):
    m='/'.join(path.split('/')[1:3])
    if path in changes:
        why=reasons.get(m,'Startup troubleshooting is missing; navigation uses a label not shown on the icon bar.')
        action=changes[path].splitlines()[0].lstrip('# ')+'; keep existing step number.'
    else: why='No discrepancy found in this step.'; action='Keep unchanged.'
    audit.append(f'| `{path}` | {why} | {action} |')
audit+=['','New steps: homeowner registration 6 (photo status); worker registration 7–8 (face and clearances); admin verification 7 (photo review). No old steps removed.','',
'## Source map', '',
'- Mobile navigation: `src/app/AppNavigator.tsx`, `src/shared/components/AppHeader.tsx`.',
'- Registration: `src/features/auth/screens/RegistrationScreen.tsx`; verification: `DocumentUploadScreen.tsx`, `VerificationStatusModal.tsx`, `LivenessScreen.tsx` under `src/features/verification/components/`.',
'- Photos: `src/features/profile/components/ProfilePhotoAvatar.tsx`, `ProfilePhotoSection.tsx`, `screens/ProfileScreen.tsx`; backend `accounts/workforce.py`, `verifications/migrations/0013_grandfather_profile_photos.py` and selfie upload/review services. The migration approves existing nonempty photos, not accounts without a photo.',
'- Posts: `src/features/posting/components/PostStep1.tsx`, `PostStep2.tsx`, `PostStep3.tsx`, `PublicWorkHoursFields.tsx`, `postingConfig.ts`, `hooks/usePostForm.ts`; profile `OwnPostsSection.tsx`; backend booking post serializers/validation.',
'- Browse: `src/features/feed/components/FeedPostCard.tsx`, `JobDetailSheet.tsx`, `FilterModal.tsx`; `screens/BrowseScreen.tsx`; profile `UserProfileView.tsx`.',
'- CV: `src/features/profile/worker/WorkerCvModal.tsx`, `WorkerCvForm.tsx`, `WorkerCvPreview.tsx`, `workerCv.ts`; `screens/ProfileScreen.tsx`.',
'- Offers/passes: `src/features/chat/components/ChatDetailScreen.tsx`; `src/features/bookings/components/BookingModal.tsx`, `BookingOfferReview.tsx`, `BookingPassQRCode.tsx`, `MyBookingsModal.tsx`; backend `booking/gate_pass.py`, `views_pass.py`, serializers and pass template.',
'- Reviews: `src/features/reviews/components/ReviewModal.tsx`; profile `ReviewsSection.tsx`.',
'- Startup: `src/app/components/ColdStartUpdateGate.tsx`, `src/app/services/coldStartUpdates.ts` (6000 ms check timeout). Main also includes Android installer updates requiring user action.',
'- Admin: `src/pages/*Page.tsx`; `src/components/verifications/{VerificationQueue,DocumentPreview,IdentityComparisonModal,ReviewerCorrectionsForm,ProfilePhotoReview,ProcessExpirationsButton}.tsx`; users `UserDirectory.tsx`, `AccountControls.tsx`; penalties `PenaltyReviewDialog.tsx`; dashboard charts.',
'','## Limits and differences from the supplied change list','',
'- Pending photos are locked too. Missing photos use Take Photo; rejected photos use Retake Photo. Approved-photo changes require contacting barangay/admin.',
'- Existing accounts were grandfathered only when a nonempty photo already existed and no photo-review document existed.',
'- Startup retry text is Try Again. Android APK updates also have Update Now, Finish Update and installer approval; updates are not always an automatic restart.',
'- Source snapshots are the locally available origin/main refs. No fetch was performed, so newer remote commits cannot be ruled out.',
'- No device, live guard scan, offline cache, PDF export, installation or admin review was executed. Screenshots and real-device validation remain for the owner.',
'- No screenshots were generated or captured; no app repository, database, deployment or remote was changed.']
(root/'CONTENT_AUDIT.md').write_text('\n'.join(audit)+'\n',encoding='utf-8')
for path,text in changes.items():
    p=root/path; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(text,encoding='utf-8')

# Update only existing checklist rows for changed screens; append new rows.
checkpath=root/'SCREENSHOT_CHECKLIST.md'
check=checkpath.read_text(encoding='utf-8')
newrows=[]
for path,capture in captures.items():
    screenshot=path.replace('/steps/','/screenshots/').replace('.md','.png')
    number=Path(path).stem
    title=changes[path].splitlines()[0][2:]
    row=f'| - [ ] | **{number}** | {title} | RE-CAPTURE: {capture} | `{screenshot}` |'
    lines=check.splitlines(); found=False
    for i,line in enumerate(lines):
        if '`'+screenshot+'`' in line: lines[i]=row;found=True
    check='\n'.join(lines)+'\n'
    if not found: newrows.append(row.replace('RE-CAPTURE:','NEW:'))
if newrows:
    check+='\n## New review and registration screens\n\n| Status | Step | Step Title | Screen to Capture / Preparation | Target Image Destination |\n| --- | --- | --- | --- | --- |\n'+'\n'.join(newrows)+'\n'
check=check.replace('This checklist contains every screen', 'Rows marked **RE-CAPTURE** or **NEW** need current main-branch screenshots. Startup notes do not change the existing login screenshot.\n\nThis checklist contains every screen',1)
check=check.replace('on the next page refresh or build!', 'during development, or after a rebuild for the published site!')
checkpath.write_text(check,encoding='utf-8')
readme=root/'README.md'; text=readme.read_text(encoding='utf-8');text=text.replace('\n','\n\nWritten for SerbiSure app v2.1.5\n',1);readme.write_text(text,encoding='utf-8')
# Replace stale source-review claims with the current audit rather than retaining contradictory guidance.
(root/'CONTENT_REVIEW.md').write_text('''# Content Review and Source Mapping

See [CONTENT_AUDIT.md](CONTENT_AUDIT.md) for the complete step-by-step audit, exact origin/main snapshots, source map and verification limits.

The released app retains its bottom navigation. Public posts contain daily hours, not dates or weekdays. Actual dates belong in chat booking offers. Both roles need an approved face photo as part of verification. Workers need separate NBI and Police clearances; homeowners need both sides of their National ID.

Photo approval does not approve other documents. Existing nonempty photos were grandfathered by the backend migration; missing photos were not. Pending and approved photos are locked. Rejected photos can be retaken using the live camera.

Screenshots are supplied by the owner. Follow SCREENSHOT_CHECKLIST.md; do not generate or capture replacement app screenshots. No live app or database actions were performed for this review.
''',encoding='utf-8')
print(f'Updated {len(changes)} step files; {len(captures)} changed/new capture rows. Audited {len(before)} original steps.')
