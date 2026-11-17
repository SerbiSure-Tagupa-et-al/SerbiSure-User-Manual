#!/usr/bin/env python3
"""
scripts/redact-privacy.py

Automated privacy redaction script for the SerbiSure User Manual.
Blurs actual faces, government identity documents (National ID, NBI Clearance, Police Clearance),
and personal contact details (phone numbers, personal emails, individual names) across all
screenshots in `docs/**/screenshots/*` to comply with the Philippine Data Privacy Act of 2012 (RA 10173).
"""

import os
import shutil
from PIL import Image, ImageFilter

# Map of screenshot path (relative to repo root) to list of bounding boxes [x1, y1, x2, y2]
# to redact with Gaussian blur.
REDACTION_REGIONS = {
    # -------------------------------------------------------------------------
    # 1. Homeowner Module 01: Registration & Profile
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
    # 2. Homeowner Module 04 & 05: Worker Profiles & Messaging
    # -------------------------------------------------------------------------
    # 3.jpg: Worker profile avatar (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/3.jpg": [
        (18, 130, 115, 225),   # Worker avatar
    ],
    # 5.jpg: Worker profile avatar before starting conversation (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/5.jpg": [
        (18, 130, 115, 225),   # Worker avatar
    ],
    # 2.jpg: Chat header avatar (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/2.jpg": [
        (18, 45, 75, 105),     # Header avatar
    ],

    # -------------------------------------------------------------------------
    # 3. Kasambahay Module 01: Registration
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
    # 4. Kasambahay Module 03: Identity & Liveness Verification
    # -------------------------------------------------------------------------
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
    # 5. Kasambahay Module 04: Clearance Renewal
    # -------------------------------------------------------------------------
    # 1.jpg, 2.jpg, 3.jpg: Clearance renewal documents (454x1024)
    "docs/kasambahay/04-clearance-renewal/screenshots/1.jpg": [
        (25, 275, 430, 525),   # Clearance document card
    ],
    "docs/kasambahay/04-clearance-renewal/screenshots/2.jpg": [
        (25, 275, 430, 525),   # Clearance document card
    ],
    "docs/kasambahay/04-clearance-renewal/screenshots/3.jpg": [
        (25, 275, 430, 655),   # Clearance documents list
    ],

    # -------------------------------------------------------------------------
    # 6. Admin Module 03: Verification Queue and OCR
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
    # 7. Admin Module 04: Expired Clearances Processing
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
    # 8. Admin Module 05: User Directory & Account Access
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
}


def backup_screenshots():
    """Ensure a safe backup of screenshots exists in _screenshots_backup before redaction."""
    backup_dir = "_screenshots_backup"
    os.makedirs(backup_dir, exist_ok=True)
    count = 0
    for root, _, files in os.walk("docs"):
        if "screenshots" in root:
            for file in files:
                src = os.path.join(root, file)
                rel = os.path.relpath(src, "docs")
                dst = os.path.join(backup_dir, rel)
                if not os.path.exists(dst):
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    shutil.copy2(src, dst)
                    count += 1
    if count > 0:
        print(f"[Backup] Backed up {count} screenshots into {backup_dir}/")
    else:
        print(f"[Backup] Verified backup directory {backup_dir}/ is up to date.")


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
    print("SerbiSure User Manual - Privacy Redaction Tool (RA 10173 Compliance)")
    print("=" * 70)

    # 1. Back up
    backup_screenshots()

    # 2. Apply redactions
    success_count = 0
    for rel_path, boxes in REDACTION_REGIONS.items():
        norm_path = os.path.normpath(rel_path)
        if redact_image(norm_path, boxes, blur_radius=22):
            print(f"[Redacted] {norm_path} ({len(boxes)} regions blurred)")
            success_count += 1

    print("-" * 70)
    print(f"Privacy redaction complete! Successfully redacted {success_count} files.")
    print("=" * 70)


if __name__ == "__main__":
    main()
