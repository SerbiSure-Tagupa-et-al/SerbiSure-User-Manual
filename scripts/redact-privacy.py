#!/usr/bin/env python3
"""
scripts/redact-privacy.py

Comprehensive privacy redaction tool for the SerbiSure User Manual.
Blurs all actual faces (selfies, profile photos, avatar badges, swipe cards, chat lists),
government identity documents (National ID, NBI Clearances, Police Clearances),
and personal contact details (phone numbers, personal emails, resident names in directories)
across all screenshots in `docs/**/screenshots/*` to comply with the Philippine Data Privacy Act of 2012 (RA 10173).
"""

import os
import shutil
from PIL import Image, ImageFilter

REDACTION_REGIONS = {
    # =========================================================================
    # HOMEOWNER MODULES
    # =========================================================================

    # -------------------------------------------------------------------------
    # Homeowner 01: Registration & Profile
    # -------------------------------------------------------------------------
    # 4.jpg: Live selfie face preview (454x1024)
    "docs/homeowner/01-registration-and-profile/screenshots/4.jpg": [
        (85, 255, 370, 525),   # Selfie oval frame
    ],
    # 5.jpg: PhilSys National ID (Front and Back) cards (454x1024)
    "docs/homeowner/01-registration-and-profile/screenshots/5.jpg": [
        (35, 375, 420, 530),   # Front National ID card
        (35, 555, 420, 710),   # Back National ID card
    ],
    # 6.jpg: Profile Photo review avatar & banner face (454x1024)
    "docs/homeowner/01-registration-and-profile/screenshots/6.jpg": [
        (120, 270, 380, 345),  # Review dialog face preview
    ],

    # -------------------------------------------------------------------------
    # Homeowner 03: Post a Job
    # -------------------------------------------------------------------------
    # 1.jpg: Home screen with "Hello, Sakura!" and "Recent Posts" cards (454x1024)
    "docs/homeowner/03-post-a-job/screenshots/1.jpg": [
        (40, 140, 100, 205),   # Top avatar "Hello, Sakura!"
        (40, 440, 100, 500),   # Card 1 worker avatar (Mary Ann)
        (40, 715, 100, 775),   # Card 2 worker avatar (Emie)
    ],

    # -------------------------------------------------------------------------
    # Homeowner 04: Browse Workers and Hire
    # -------------------------------------------------------------------------
    # 1.jpg: "Find Kasambahay" swipe deck (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/1.jpg": [
        (55, 200, 115, 260),   # Top avatar beside Find Kasambahay
        (40, 350, 414, 780),   # Center large swipe-card face photo (Naruto)
    ],
    # 3.jpg: Worker profile (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/3.jpg": [
        (18, 130, 115, 225),   # Worker avatar
    ],
    # 4.jpg: Reviews & feedback list (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/4.jpg": [
        (18, 130, 115, 225),   # Worker avatar at top
        (30, 250, 85, 750),    # Reviewer avatars down the feedback list
    ],
    # 5.jpg: Worker profile avatar before starting conversation (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/5.jpg": [
        (18, 130, 115, 225),   # Worker avatar
    ],

    # -------------------------------------------------------------------------
    # Homeowner 05: Chat and Messaging
    # -------------------------------------------------------------------------
    # 1.jpg: Chat conversation inbox list (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/1.jpg": [
        (55, 100, 115, 820),   # All avatars down the chat inbox list
    ],
    # 2.jpg: Active chat thread (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/2.jpg": [
        (18, 45, 75, 105),     # Header partner avatar
        (15, 450, 60, 500),    # Chat bubble avatar
    ],
    # 3.jpg: Chat thread with booking offer card (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/3.jpg": [
        (18, 45, 75, 105),     # Header partner avatar
        (60, 240, 110, 300),   # Offer card worker avatar
    ],

    # -------------------------------------------------------------------------
    # Homeowner 06: Bookings and Village Pass
    # -------------------------------------------------------------------------
    # 1.jpg: "My Bookings & Hires" list (454x1024)
    "docs/homeowner/06-bookings-and-village-pass/screenshots/1.jpg": [
        (75, 320, 135, 880),   # Booking card avatars (including First Name Last Ma...)
    ],
    # 2.jpg: Booking details view (454x1024)
    "docs/homeowner/06-bookings-and-village-pass/screenshots/2.jpg": [
        (35, 150, 100, 215),   # Worker avatar
    ],
    # 3.jpg: Booking pass details (454x1024)
    "docs/homeowner/06-bookings-and-village-pass/screenshots/3.jpg": [
        (35, 150, 100, 215),   # Worker avatar
    ],

    # -------------------------------------------------------------------------
    # Homeowner 07: Reviews and Ratings
    # -------------------------------------------------------------------------
    # 1.png: Review prompt dialog (454x1024)
    "docs/homeowner/07-reviews-and-ratings/screenshots/1.png": [
        (175, 170, 280, 275),  # Worker avatar in review prompt
    ],
    # 2.jpg: Review rating form (454x1024)
    "docs/homeowner/07-reviews-and-ratings/screenshots/2.jpg": [
        (175, 170, 280, 275),  # Worker avatar in rating form
    ],
    # 3.jpg: Submitted review on profile (454x1024)
    "docs/homeowner/07-reviews-and-ratings/screenshots/3.jpg": [
        (35, 150, 100, 215),   # Profile avatar
        (30, 480, 85, 550),    # Reviewer avatar on feedback card
    ],

    # -------------------------------------------------------------------------
    # Homeowner 08: Managing Own Posts
    # -------------------------------------------------------------------------
    # 1.jpg: Own posts list (454x1024)
    "docs/homeowner/08-managing-own-posts/screenshots/1.jpg": [
        (40, 140, 100, 205),   # Top avatar
        (40, 440, 100, 500),   # Card 1 avatar
        (40, 715, 100, 775),   # Card 2 avatar
    ],
    # 2.jpg: Post details view (454x1024)
    "docs/homeowner/08-managing-own-posts/screenshots/2.jpg": [
        (40, 140, 100, 205),   # Homeowner avatar
    ],
    # 3.jpg: Post applicants list (454x1024)
    "docs/homeowner/08-managing-own-posts/screenshots/3.jpg": [
        (40, 280, 100, 850),   # Applicant worker avatars down the list
    ],


    # =========================================================================
    # KASAMBAHAY MODULES
    # =========================================================================

    # -------------------------------------------------------------------------
    # Kasambahay 01: Registration
    # -------------------------------------------------------------------------
    # 7.jpg: Registration selfie camera preview (360x812)
    "docs/kasambahay/01-registration/screenshots/7.jpg": [
        (65, 235, 295, 465),   # Selfie camera frame
    ],
    # 8.jpg: Worker clearances (NBI & Police clearances) (360x812)
    "docs/kasambahay/01-registration/screenshots/8.jpg": [
        (25, 315, 335, 430),   # NBI Clearance card
        (25, 445, 335, 570),   # Police Clearance card
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 02: Login
    # -------------------------------------------------------------------------
    # 3.jpg: Kasambahay Home Screen (360x812)
    "docs/kasambahay/02-login/screenshots/3.jpg": [
        (30, 110, 80, 160),    # Top avatar
        (30, 350, 80, 400),    # Job card 1 avatar
        (30, 570, 80, 620),    # Job card 2 avatar
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 03: Identity and Liveness Verification
    # -------------------------------------------------------------------------
    # 1.jpg: Profile screen - Christine Tagupa (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/1.jpg": [
        (60, 130, 140, 220),   # Face avatar
        (140, 130, 330, 230),  # Full name & phone number (+639152154796)
    ],
    # 2.jpg: NBI Clearance preview card (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/2.jpg": [
        (25, 290, 430, 515),   # NBI Clearance document preview
    ],
    # 3.jpg: Both NBI and Police Clearances (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/3.jpg": [
        (25, 275, 430, 655),   # Both clearance previews
    ],
    # 4.jpg: Profile face photo preview (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/4.jpg": [
        (75, 245, 375, 545),   # Face selfie preview
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 04: Clearance Renewal
    # -------------------------------------------------------------------------
    # 1.jpg: Profile screen / clearance status (454x1024)
    "docs/kasambahay/04-clearance-renewal/screenshots/1.jpg": [
        (60, 130, 140, 220),   # Face avatar
        (140, 130, 330, 230),  # Full name & phone number
        (25, 275, 430, 525),   # Clearance document card
    ],
    # 2.jpg: Clearance renewal upload preview (454x1024)
    "docs/kasambahay/04-clearance-renewal/screenshots/2.jpg": [
        (25, 275, 430, 525),   # Clearance document card
    ],
    # 3.jpg: Clearance renewal list (454x1024)
    "docs/kasambahay/04-clearance-renewal/screenshots/3.jpg": [
        (25, 275, 430, 655),   # Clearance documents list
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 05: Worker CV Builder
    # -------------------------------------------------------------------------
    # 1.jpg: CV builder header (454x1024)
    "docs/kasambahay/05-worker-cv-builder/screenshots/1.jpg": [
        (40, 140, 110, 210),   # Worker avatar at top
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 06: Browse Jobs and Apply
    # -------------------------------------------------------------------------
    # 1.jpg: Browse jobs swipe deck (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/1.jpg": [
        (55, 200, 115, 260),   # Top avatar
        (40, 350, 414, 780),   # Center large job card photo
    ],
    # 3.jpg: Job post details view (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/3.jpg": [
        (40, 140, 100, 205),   # Homeowner employer avatar
    ],
    # 4.jpg: Job application form (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/4.jpg": [
        (40, 140, 100, 205),   # Worker avatar
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 07: Post a Service
    # -------------------------------------------------------------------------
    # 1.jpg: Kasambahay home screen (454x1024)
    "docs/kasambahay/07-post-a-service/screenshots/1.jpg": [
        (40, 140, 100, 205),   # Top avatar
        (40, 440, 100, 500),   # Card 1 avatar
        (40, 715, 100, 775),   # Card 2 avatar
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 08: Chat and Offers
    # -------------------------------------------------------------------------
    # 1.jpg: Chat conversation inbox list (454x1024)
    "docs/kasambahay/08-chat-and-offers/screenshots/1.jpg": [
        (55, 100, 115, 820),   # All avatars down the chat inbox list
    ],
    # 2.jpg: Active chat thread (454x1024)
    "docs/kasambahay/08-chat-and-offers/screenshots/2.jpg": [
        (18, 45, 75, 105),     # Header partner avatar
        (15, 450, 60, 500),    # Chat bubble avatar
    ],
    # 3.jpg: Booking offer received card (454x1024)
    "docs/kasambahay/08-chat-and-offers/screenshots/3.jpg": [
        (18, 45, 75, 105),     # Header partner avatar
        (60, 240, 110, 300),   # Offer card avatar
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 09: Booking Schedules and Village Pass
    # -------------------------------------------------------------------------
    # 1.jpg: Bookings list (454x1024)
    "docs/kasambahay/09-booking-schedules-and-village-pass/screenshots/1.jpg": [
        (75, 320, 135, 880),   # Homeowner avatars on booking cards
    ],
    # 2.jpg: Booking details and digital pass (454x1024)
    "docs/kasambahay/09-booking-schedules-and-village-pass/screenshots/2.jpg": [
        (35, 150, 100, 215),   # Homeowner avatar
    ],

    # -------------------------------------------------------------------------
    # Kasambahay 10: Completed Jobs and Reviews
    # -------------------------------------------------------------------------
    # 1.png: Completed jobs list (454x1024)
    "docs/kasambahay/10-completed-jobs-and-reviews/screenshots/1.png": [
        (75, 320, 135, 880),   # Booking card avatars
    ],
    # 2.jpg: Review received card (454x1024)
    "docs/kasambahay/10-completed-jobs-and-reviews/screenshots/2.jpg": [
        (30, 250, 85, 350),    # Reviewer avatar
    ],
    # 3.jpg: Profile review list (454x1024)
    "docs/kasambahay/10-completed-jobs-and-reviews/screenshots/3.jpg": [
        (60, 130, 140, 220),   # Profile header avatar
        (140, 130, 330, 230),  # Full name & phone number
        (30, 480, 85, 550),    # Reviewer avatar on feedback card
    ],


    # =========================================================================
    # ADMIN & BARANGAY MODULES
    # =========================================================================

    # -------------------------------------------------------------------------
    # Admin 03: Verification Queue and OCR
    # -------------------------------------------------------------------------
    # 1.png: Queue table rows with resident names, contacts, and doc IDs (1595x997)
    "docs/admin/03-verification-queue-and-ocr/screenshots/1.png": [
        (280, 240, 1550, 850), # Table applicant rows
    ],
    # 2.png: Expanded applicant row & documents (1595x997)
    "docs/admin/03-verification-queue-and-ocr/screenshots/2.png": [
        (280, 240, 1550, 880), # Table & expanded document cards
    ],
    # 3.png: Inspect scan and extracted details (1595x1057)
    "docs/admin/03-verification-queue-and-ocr/screenshots/3.png": [
        (1050, 280, 1545, 525), # Document scan preview card
        (1070, 550, 1545, 730), # Applicant profile summary (avatar, name, email, phone)
        (280, 240, 1020, 900),  # Queue list rows on left
    ],
    # 4.png: Compare face modal dialog (1600x1061)
    "docs/admin/03-verification-queue-and-ocr/screenshots/4.png": [
        (110, 175, 770, 930),   # Left panel: Profile Face Photo
        (830, 175, 1490, 930),  # Right panel: Document Scan (ID card / clearance photo)
    ],
    # 5.png: Edit details form (1595x997)
    "docs/admin/03-verification-queue-and-ocr/screenshots/5.png": [
        (1050, 280, 1545, 525), # Document scan preview
        (1050, 420, 1545, 870), # Form input fields (names, birthdate, ID number)
        (280, 240, 1020, 900),  # Queue list rows on left
    ],
    # 6.png: Approve or Reject decision panel (1595x997)
    "docs/admin/03-verification-queue-and-ocr/screenshots/6.png": [
        (1050, 280, 1545, 525), # Document scan preview
        (1070, 550, 1545, 730), # Applicant profile summary
        (280, 240, 1020, 900),  # Queue list rows on left
    ],
    # 7.png: Review profile photo dialog (1600x1061)
    "docs/admin/03-verification-queue-and-ocr/screenshots/7.png": [
        (1135, 375, 1475, 725), # Large profile face photo
        (280, 240, 1020, 900),  # Queue list rows on left
    ],

    # -------------------------------------------------------------------------
    # Admin 04: Expired Clearances Processing
    # -------------------------------------------------------------------------
    # 1.png: Queue table rows with worker names and clearance dates (1595x997)
    "docs/admin/04-expired-clearances-processing/screenshots/1.png": [
        (280, 240, 1550, 850), # Table applicant rows
    ],
    # 2.png: Process confirmation dialog with worker counts/names (1595x1057)
    "docs/admin/04-expired-clearances-processing/screenshots/2.png": [
        (280, 240, 1550, 850), # Background table applicant rows
    ],
    # 3.png: Updated status table (1595x997)
    "docs/admin/04-expired-clearances-processing/screenshots/3.png": [
        (280, 240, 1550, 850), # Table applicant rows
    ],

    # -------------------------------------------------------------------------
    # Admin 05: User Directory & Account Access
    # -------------------------------------------------------------------------
    # 1.png: User directory list and selected profile (1600x1000)
    "docs/admin/05-user-directory-and-account-access/screenshots/1.png": [
        (255, 140, 590, 930),   # User list (avatars & full names)
        (1210, 95, 1585, 310),  # Profile avatar, full name, address
        (1210, 465, 1585, 565), # Email address & contact phone number
    ],
    # 2.png: Search and filter user directory (1600x1000)
    "docs/admin/05-user-directory-and-account-access/screenshots/2.png": [
        (255, 140, 590, 930),   # User list (avatars & full names)
        (1210, 95, 1585, 310),  # Profile avatar, full name, address
        (1210, 465, 1585, 565), # Email address & contact phone number
    ],
    # 3.png: User view & messaging panel (1600x1000)
    "docs/admin/05-user-directory-and-account-access/screenshots/3.png": [
        (255, 140, 590, 930),   # User list (avatars & full names)
        (1210, 95, 1585, 310),  # Profile avatar, full name, address
        (1210, 465, 1585, 565), # Email address & contact phone number
    ],
    # 4.png: Account suspension modal (1600x1000)
    "docs/admin/05-user-directory-and-account-access/screenshots/4.png": [
        (580, 270, 1020, 360),  # Suspension dialog user name
        (255, 140, 590, 930),   # Background user list
    ],
    # 5.png: Restore account access modal (1600x1000)
    "docs/admin/05-user-directory-and-account-access/screenshots/5.png": [
        (580, 270, 1020, 360),  # Restore dialog user name
        (255, 140, 590, 930),   # Background user list
    ],

    # -------------------------------------------------------------------------
    # Admin 06: Penalty Points Management
    # -------------------------------------------------------------------------
    # 1.png, 2.png, 3.png, 4.png: Resident directory tables & penalty logs
    "docs/admin/06-penalty-points-management/screenshots/1.png": [
        (260, 220, 1560, 850), # Table rows with resident names and avatars
    ],
    "docs/admin/06-penalty-points-management/screenshots/2.png": [
        (260, 220, 1560, 850), # Table rows with resident names and avatars
    ],
    "docs/admin/06-penalty-points-management/screenshots/3.png": [
        (260, 220, 1560, 850), # Penalty modal details
    ],
    "docs/admin/06-penalty-points-management/screenshots/4.png": [
        (260, 220, 1560, 850), # Penalty details log
    ],

    # -------------------------------------------------------------------------
    # Admin 07: Barangay Directory & Settings
    # -------------------------------------------------------------------------
    # 1.png, 2.png, 3.png, 4.png: Barangay officer directory cards (names, emails, phones)
    "docs/admin/07-barangay-directory-and-settings/screenshots/1.png": [
        (260, 220, 1450, 550), # Barangay officer directory cards
    ],
    "docs/admin/07-barangay-directory-and-settings/screenshots/2.png": [
        (260, 220, 1450, 550), # Barangay officer directory cards
    ],
    "docs/admin/07-barangay-directory-and-settings/screenshots/3.png": [
        (50, 150, 530, 550),   # Officer edit details
    ],
    "docs/admin/07-barangay-directory-and-settings/screenshots/4.png": [
        (260, 220, 1450, 550), # Barangay officer directory cards
    ],
}


def redact_image(path: str, boxes: list[tuple[int, int, int, int]], blur_radius: int = 22):
    """
    Applies Gaussian blur to the specified bounding boxes of an image.
    Preserves image format, mode, and maximum visual fidelity for the surrounding UI.
    """
    if not os.path.exists(path):
        print(f"[Warning] File not found: {path}")
        return False

    with Image.open(path) as img:
        img_format = img.format or ("PNG" if path.lower().endswith(".png") else "JPEG")
        w, h = img.size
        work_img = img.copy()

        for box in boxes:
            x1, y1, x2, y2 = box
            # Clamp coordinates to image boundaries
            x1 = max(0, min(x1, w))
            x2 = max(0, min(x2, w))
            y1 = max(0, min(y1, h))
            y2 = max(0, min(y2, h))

            if x2 <= x1 or y2 <= y1:
                continue

            # Extract subregion, apply heavy Gaussian blur, and paste back
            sub = work_img.crop((x1, y1, x2, y2))
            blurred_sub = sub.filter(ImageFilter.GaussianBlur(radius=blur_radius))
            work_img.paste(blurred_sub, (x1, y1))

        # Save back in place
        if img_format == "JPEG" or path.lower().endswith((".jpg", ".jpeg")):
            work_img.save(path, "JPEG", quality=95, optimize=True)
        else:
            work_img.save(path, "PNG", optimize=True)

    return True


def main():
    print("=" * 70)
    print("SerbiSure User Manual - Comprehensive Privacy Redaction Tool (RA 10173)")
    print("=" * 70)

    # Always restore from pristine backup first to prevent blur stacking
    backup_dir = "_screenshots_backup"
    if os.path.exists(backup_dir):
        print("[Restore] Restoring pristine original screenshots from backup...")
        for root, _, files in os.walk(backup_dir):
            for file in files:
                bak_path = os.path.join(root, file)
                rel = os.path.relpath(bak_path, backup_dir)
                dst = os.path.join("docs", rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(bak_path, dst)

    success_count = 0
    total_regions = 0
    for rel_path, boxes in REDACTION_REGIONS.items():
        norm_path = os.path.normpath(rel_path)
        if redact_image(norm_path, boxes, blur_radius=22):
            print(f"[Redacted] {norm_path} ({len(boxes)} regions blurred)")
            success_count += 1
            total_regions += len(boxes)

    print("-" * 70)
    print(f"Privacy redaction complete! Successfully redacted {success_count} files ({total_regions} regions blurred).")
    print("=" * 70)


if __name__ == "__main__":
    main()
