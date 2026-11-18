#!/usr/bin/env python3
"""
scripts/redact-privacy.py

Precise frame-level privacy redaction tool for the SerbiSure User Manual.
- Restores all screenshots from `_screenshots_backup/` first so no stale or compound blurs remain.
- Uses normalized convolution (masked Gaussian blur) so background colors outside a circle or card
  never bleed into the blurred region.
- Uses 4x supersampled anti-aliased masks matching each profile circle or rounded document frame.
- On full-bleed swipe cards, blurs only the background photo while preserving all overlaid UI text,
  badges, tag pills, and action buttons crisp and readable.
"""

import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

REDACTION_SHAPES = {
    # =========================================================================
    # HOMEOWNER MODULES
    # =========================================================================

    # Homeowner 01: Registration & Profile
    # 4.jpg: Camera selfie circle inside green verification ring (454x1024)
    "docs/homeowner/01-registration-and-profile/screenshots/4.jpg": [
        {"type": "circle", "cx": 227.0, "cy": 388.5, "r": 126.0, "preserve_badge": False},
    ],
    # 5.jpg: PhilSys National ID (Front and Back) uploaded photos (454x1024)
    "docs/homeowner/01-registration-and-profile/screenshots/5.jpg": [
        {"type": "rounded_rect", "box": (40, 397, 414, 506), "radius": 8},
        {"type": "rounded_rect", "box": (40, 568, 414, 678), "radius": 8},
    ],
    # 6.jpg: Profile header circular avatar (454x1024)
    "docs/homeowner/01-registration-and-profile/screenshots/6.jpg": [
        {"type": "circle", "cx": 80.5, "cy": 174.0, "r": 40.0, "preserve_badge": True},
    ],

    # Homeowner 03: Post a Job
    # 1.jpg: Home screen (Hello, Sakura! & Recent Posts worker avatars) (454x1024)
    "docs/homeowner/03-post-a-job/screenshots/1.jpg": [
        {"type": "circle", "cx": 72.0, "cy": 156.5, "r": 28.5},  # Sakura avatar
        {"type": "circle", "cx": 70.0, "cy": 475.0, "r": 29.5},  # Mary Ann avatar
        {"type": "circle", "cx": 70.0, "cy": 767.0, "r": 29.5},  # Emie avatar
    ],

    # Homeowner 04: Browse Workers and Hire
    # 1.jpg: Find Kasambahay swipe deck (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/1.jpg": [
        {"type": "circle", "cx": 71.5, "cy": 222.0, "r": 28.5},  # Top Sakura avatar
        {
            "type": "swipe_card",
            "top_pill": (59, 385, 180, 416),
            "bottom_btn": (278, 735, 397, 777),
        },
    ],
    # 2.jpg: Filter & Sort modal over Find Kasambahay (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/2.jpg": [
        {"type": "circle", "cx": 71.5, "cy": 221.5, "r": 28.5},  # Top Sakura avatar under backdrop
    ],
    # 3.jpg: SerbiSure CV worker profile avatar (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/3.jpg": [
        {"type": "circle", "cx": 64.0, "cy": 175.0, "r": 46.5},
    ],
    # 4.jpg: Reviews & Feedbacks (top partial avatar under sticky header + bottom reviewer avatar) (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/4.jpg": [
        {"type": "circle", "cx": 95.0, "cy": 96.5, "r": 48.5, "clip_y": (103, 200)},
        {"type": "circle", "cx": 59.0, "cy": 823.0, "r": 23.5},
    ],
    # 5.jpg: Chat screen with worker (header avatar + chat bubble avatar) (454x1024)
    "docs/homeowner/04-browse-workers-and-hire/screenshots/5.jpg": [
        {"type": "circle", "cx": 94.5, "cy": 64.5, "r": 21.5},   # Header avatar
        {"type": "circle", "cx": 34.0, "cy": 710.0, "r": 17.0},  # Chat bubble avatar
    ],

    # Homeowner 05: Chat and Messaging
    # 1.jpg: Chat conversation inbox list avatars (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/1.jpg": [
        {"type": "circle", "cx": 52.0, "cy": 143.5, "r": 29.5},  # Mae Huyop
        {"type": "circle", "cx": 52.0, "cy": 230.0, "r": 29.5},  # Divine Tapayan
        {"type": "circle", "cx": 52.0, "cy": 316.5, "r": 29.5},  # Isabell Gonzales
        {"type": "circle", "cx": 52.0, "cy": 403.5, "r": 29.5},  # Keitx Bryelle Baring
        {"type": "circle", "cx": 52.0, "cy": 490.0, "r": 29.5},  # Jomama Mamajo
        {"type": "circle", "cx": 52.0, "cy": 576.5, "r": 29.5},  # Steve Dizon
        {"type": "circle", "cx": 52.0, "cy": 750.0, "r": 29.5},  # James Christopher Capstone
    ],
    # 2.jpg: Active chat thread (header avatar + chat message avatar) (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/2.jpg": [
        {"type": "circle", "cx": 94.5, "cy": 64.5, "r": 21.5},   # Header avatar
        {"type": "circle", "cx": 34.0, "cy": 393.0, "r": 17.0},  # Chat message avatar ("Nice jobb boss")
    ],
    # 3.jpg: Booking Offer Step 1 of 4 worker card avatar (454x1024)
    "docs/homeowner/05-chat-and-messaging/screenshots/3.jpg": [
        {"type": "circle", "cx": 61.0, "cy": 228.5, "r": 25.0},
    ],

    # Homeowner 06: Bookings and Village Pass
    # 1.jpg: My Bookings & Hires Pending card 2 avatar (454x1024)
    "docs/homeowner/06-bookings-and-village-pass/screenshots/1.jpg": [
        {"type": "circle", "cx": 67.0, "cy": 579.0, "r": 28.5},
    ],
    # 2.jpg: Booking Details top card avatar (454x1024)
    "docs/homeowner/06-bookings-and-village-pass/screenshots/2.jpg": [
        {"type": "circle", "cx": 71.0, "cy": 152.0, "r": 26.0},
    ],
    # 5.png: My Bookings & Hires Ongoing card avatar (454x1024)
    "docs/homeowner/06-bookings-and-village-pass/screenshots/5.png": [
        {"type": "circle", "cx": 66.5, "cy": 345.0, "r": 28.5},
    ],

    # Homeowner 07: Reviews and Ratings
    # 1.png: My Bookings & Hires Completed card avatar (454x1024)
    "docs/homeowner/07-reviews-and-ratings/screenshots/1.png": [
        {"type": "circle", "cx": 66.5, "cy": 345.0, "r": 28.5},
    ],

    # Homeowner 08: Managing Own Posts
    # 3.jpg: Chat thread with applicant (header avatar + chat message avatar) (454x1024)
    "docs/homeowner/08-managing-own-posts/screenshots/3.jpg": [
        {"type": "circle", "cx": 94.5, "cy": 64.5, "r": 21.5},   # Header avatar
        {"type": "circle", "cx": 34.0, "cy": 328.0, "r": 17.0},  # Chat message avatar ("Nice jobb boss")
    ],


    # =========================================================================
    # KASAMBAHAY MODULES
    # =========================================================================

    # Kasambahay 01: Registration
    # 7.jpg: Registration selfie camera circle inside green verification ring (360x812)
    "docs/kasambahay/01-registration/screenshots/7.jpg": [
        {"type": "circle", "cx": 180.0, "cy": 341.0, "r": 100.0, "preserve_badge": False},
    ],
    # 8.jpg: Worker clearances uploaded photos (NBI & Police Clearance) (360x812)
    "docs/kasambahay/01-registration/screenshots/8.jpg": [
        {"type": "rounded_rect", "box": (30, 316, 329, 411), "radius": 8},
        {"type": "rounded_rect", "box": (30, 448, 329, 543), "radius": 8},
    ],

    # Kasambahay 02: Login
    # 3.jpg: Kasambahay Home Screen (360x812)
    "docs/kasambahay/02-login/screenshots/3.jpg": [
        {"type": "circle", "cx": 55.0, "cy": 125.0, "r": 23.5},  # Top Kasambahay avatar
        {"type": "circle", "cx": 55.5, "cy": 375.5, "r": 24.0},  # Job 1 employer avatar
        {"type": "circle", "cx": 55.5, "cy": 608.0, "r": 24.0},  # Job 2 employer avatar
    ],

    # Kasambahay 03: Identity and Liveness Verification
    # 1.jpg: Profile screen - Christine Tagupa (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/1.jpg": [
        {"type": "circle", "cx": 80.5, "cy": 174.0, "r": 40.0, "preserve_badge": True},
    ],
    # 3.jpg: Uploaded NBI Clearance document photo (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/3.jpg": [
        {"type": "rounded_rect", "box": (40, 555, 414, 676), "radius": 8},
    ],
    # 4.jpg: Public profile screen avatar (454x1024)
    "docs/kasambahay/03-identity-and-liveness-verification/screenshots/4.jpg": [
        {"type": "circle", "cx": 95.0, "cy": 165.0, "r": 48.5, "preserve_badge": True},
    ],

    # Kasambahay 04: Clearance Renewal
    # 1.jpg: Profile clearance status screen avatar (454x1024)
    "docs/kasambahay/04-clearance-renewal/screenshots/1.jpg": [
        {"type": "circle", "cx": 80.5, "cy": 174.0, "r": 40.0, "preserve_badge": True},
    ],
    # 3.jpg: Uploaded NBI Clearance renewal photo (454x1024)
    "docs/kasambahay/04-clearance-renewal/screenshots/3.jpg": [
        {"type": "rounded_rect", "box": (40, 657, 414, 778), "radius": 8},
    ],

    # Kasambahay 05: Worker CV Builder
    # 1.jpg & 4.jpg: SerbiSure CV header avatar (454x1024)
    "docs/kasambahay/05-worker-cv-builder/screenshots/1.jpg": [
        {"type": "circle", "cx": 64.0, "cy": 175.0, "r": 46.5},
    ],
    "docs/kasambahay/05-worker-cv-builder/screenshots/4.jpg": [
        {"type": "circle", "cx": 64.0, "cy": 166.0, "r": 46.5},
    ],

    # Kasambahay 06: Browse Jobs and Apply
    # 1.jpg: Find Jobs swipe deck (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/1.jpg": [
        {"type": "circle", "cx": 71.0, "cy": 222.0, "r": 28.5},  # Top Kasambahay avatar
        {
            "type": "swipe_card",
            "top_pill": (58, 385, 201, 416),
            "bottom_btn": (301, 735, 397, 777),
        },
    ],
    # 2.jpg: Filter & Sort modal over Find Jobs (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/2.jpg": [
        {"type": "circle", "cx": 71.5, "cy": 221.5, "r": 28.5},
    ],
    # 3.jpg: Home screen Recent Posts avatars (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/3.jpg": [
        {"type": "circle", "cx": 71.0, "cy": 156.5, "r": 28.5},  # Top avatar
        {"type": "circle", "cx": 70.0, "cy": 475.0, "r": 29.5},  # Card 1 avatar
        {"type": "circle", "cx": 70.0, "cy": 766.5, "r": 29.5},  # Card 2 avatar
    ],
    # 4.jpg: Job details sheet over Recent Posts (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/4.jpg": [
        {"type": "circle", "cx": 70.0, "cy": 295.0, "r": 29.5},  # Background card avatar
        {"type": "circle", "cx": 55.0, "cy": 503.0, "r": 31.0},  # Sheet employer avatar
    ],
    # 5.png: Chat thread after applying (454x1024)
    "docs/kasambahay/06-browse-jobs-and-apply/screenshots/5.png": [
        {"type": "circle", "cx": 94.5, "cy": 64.5, "r": 21.5},   # Header avatar
    ],

    # Kasambahay 07: Post a Service
    # 1.jpg: Kasambahay home screen avatars (454x1024)
    "docs/kasambahay/07-post-a-service/screenshots/1.jpg": [
        {"type": "circle", "cx": 71.0, "cy": 156.5, "r": 28.5},  # Top avatar
        {"type": "circle", "cx": 70.0, "cy": 475.0, "r": 29.5},  # Card 1 avatar
        {"type": "circle", "cx": 70.0, "cy": 766.5, "r": 29.5},  # Card 2 avatar
    ],

    # Kasambahay 08: Chat and Offers
    # 1.jpg: Messages inbox list avatars under Recent messages (454x1024)
    "docs/kasambahay/08-chat-and-offers/screenshots/1.jpg": [
        {"type": "circle", "cx": 52.0, "cy": 506.5, "r": 29.5},  # Gerald Llorente
        {"type": "circle", "cx": 52.0, "cy": 593.0, "r": 29.5},  # Sakura Sasuke
        {"type": "circle", "cx": 52.0, "cy": 680.0, "r": 29.5},  # Joey Lastpogi
        {"type": "circle", "cx": 52.0, "cy": 766.5, "r": 29.5},  # Nil Xandrea Montejo
        {"type": "circle", "cx": 52.0, "cy": 853.5, "r": 29.5, "clip_y": (820, 875)},  # James Christopher Tagupa
        {"type": "circle", "cx": 52.0, "cy": 940.0, "r": 29.5, "clip_y": (939, 972)},  # Bottom row avatar
    ],
    # 2.jpg: Active chat thread (header avatar + chat message avatar) (454x1024)
    "docs/kasambahay/08-chat-and-offers/screenshots/2.jpg": [
        {"type": "circle", "cx": 94.5, "cy": 64.5, "r": 21.5},   # Header avatar
        {"type": "circle", "cx": 34.0, "cy": 710.0, "r": 17.0},  # Chat message avatar
    ],
    # 3.jpg: Active chat thread with offer (header avatar + 2 chat message avatars) (454x1024)
    "docs/kasambahay/08-chat-and-offers/screenshots/3.jpg": [
        {"type": "circle", "cx": 94.5, "cy": 64.5, "r": 21.5},   # Header avatar
        {"type": "circle", "cx": 34.0, "cy": 419.0, "r": 17.0},  # Chat message avatar 1
        {"type": "circle", "cx": 34.0, "cy": 788.0, "r": 17.0},  # Chat message avatar 2
    ],

    # Kasambahay 09: Booking Schedules and Village Pass
    # 1.jpg: My Jobs & Contracts Pending card 2 avatar (454x1024)
    "docs/kasambahay/09-booking-schedules-and-village-pass/screenshots/1.jpg": [
        {"type": "circle", "cx": 67.0, "cy": 578.5, "r": 28.5},
    ],

    # Kasambahay 10: Completed Jobs and Reviews
    # 1.png: My Jobs & Contracts Ongoing card avatar (454x1024)
    "docs/kasambahay/10-completed-jobs-and-reviews/screenshots/1.png": [
        {"type": "circle", "cx": 66.5, "cy": 345.0, "r": 28.5},
    ],
    # 2.jpg: Homeowner profile & review list avatars (454x1024)
    "docs/kasambahay/10-completed-jobs-and-reviews/screenshots/2.jpg": [
        {"type": "circle", "cx": 95.0, "cy": 165.0, "r": 48.5},  # Top profile avatar
        {"type": "circle", "cx": 59.0, "cy": 701.0, "r": 23.5},  # Bottom reviewer avatar
    ],

    # =========================================================================
    # NEW MODULES: EXPLORE & SAVED, NOTIFICATIONS/SETTINGS, DOLE CONTRACT
    # =========================================================================
    **{
        f"docs/{role}/{folder_explore}/screenshots/1.jpg": [
            {"type": "circle", "cx": 73.5, "cy": 230.5, "r": 29.0},
            {"type": "swipe_card_449", "tutorial_modal_box": None},
            {"type": "highlight_rect", "box": (54, 128, 396, 192), "radius": 28},
            {"type": "highlight_circle", "cx": 426.5, "cy": 584.5, "r": 23.0},
            {"type": "highlight_rect", "box": (251, 734, 395, 786), "radius": 24},
            {"type": "highlight_circle", "cx": 144.5, "cy": 900.5, "r": 30.0},
        ]
        for role, folder_explore in [
            ("homeowner", "09-explore-and-saved-swipe-deck"),
            ("kasambahay", "11-explore-and-saved-swipe-deck"),
        ]
    },
    **{
        f"docs/{role}/{folder_explore}/screenshots/2.jpg": [
            {"type": "circle", "cx": 73.5, "cy": 230.5, "r": 29.0},
            {"type": "circle", "cx": 59.5, "cy": 443.0, "r": 34.0},
            {"type": "highlight_rect", "box": (380, 412, 422, 462), "radius": 12},
            {"type": "highlight_rect", "box": (22, 826, 427, 896), "radius": 28},
        ]
        for role, folder_explore in [
            ("homeowner", "09-explore-and-saved-swipe-deck"),
            ("kasambahay", "11-explore-and-saved-swipe-deck"),
        ]
    },
    **{
        f"docs/{role}/{folder_explore}/screenshots/3.jpg": [
            {"type": "circle", "cx": 73.5, "cy": 230.5, "r": 29.0},
            {"type": "circle", "cx": 74.0, "cy": 342.0, "r": 29.5},
            {"type": "highlight_rect", "box": (222, 133, 392, 189), "radius": 26},
            {"type": "highlight_rect", "box": (190, 456, 407, 516), "radius": 26},
        ]
        for role, folder_explore in [
            ("homeowner", "09-explore-and-saved-swipe-deck"),
            ("kasambahay", "11-explore-and-saved-swipe-deck"),
        ]
    },
    **{
        f"docs/{role}/{folder_settings}/screenshots/1.jpg": [
            {"type": "highlight_circle", "cx": 404.0, "cy": 71.0, "r": 26.0},
            {"type": "highlight_rect", "box": (248, 148, 430, 182), "radius": 14},
        ]
        for role, folder_settings in [
            ("homeowner", "10-notifications-language-and-settings"),
            ("kasambahay", "12-notifications-language-and-settings"),
        ]
    },
    **{
        f"docs/{role}/{folder_settings}/screenshots/2.jpg": [
            {"type": "circle", "cx": 83.0, "cy": 104.0, "r": 39.0, "clip_y": (105, 145), "preserve_green_badge": True},
            {"type": "rounded_rect", "box": (143, 132, 283, 154), "radius": 6},
            {"type": "highlight_rect", "box": (38, 540, 412, 608), "radius": 18},
            {"type": "highlight_rect", "box": (262, 624, 415, 812), "radius": 20},
        ]
        for role, folder_settings in [
            ("homeowner", "10-notifications-language-and-settings"),
            ("kasambahay", "12-notifications-language-and-settings"),
        ]
    },
    **{
        f"docs/{role}/{folder_settings}/screenshots/3.jpg": [
            {"type": "highlight_rect", "box": (28, 146, 421, 284), "radius": 22},
            {"type": "highlight_rect", "box": (28, 342, 421, 466), "radius": 22},
        ]
        for role, folder_settings in [
            ("homeowner", "10-notifications-language-and-settings"),
            ("kasambahay", "12-notifications-language-and-settings"),
        ]
    },
    **{
        f"docs/{role}/{folder_settings}/screenshots/4.jpg": [
            {"type": "circle", "cx": 73.5, "cy": 230.5, "r": 29.0},
            {"type": "swipe_card_449", "tutorial_modal_box": (18, 602, 431, 852)},
            {"type": "highlight_rect", "box": (18, 602, 431, 850), "radius": 26},
            {"type": "highlight_circle", "cx": 144.5, "cy": 900.5, "r": 34.0},
        ]
        for role, folder_settings in [
            ("homeowner", "10-notifications-language-and-settings"),
            ("kasambahay", "12-notifications-language-and-settings"),
        ]
    },
    **{
        f"docs/{role}/{folder_settings}/screenshots/5.jpg": [
            {"type": "highlight_rect", "box": (12, 180, 437, 294), "radius": 18},
            {"type": "highlight_rect", "box": (30, 578, 268, 700), "radius": 24},
        ]
        for role, folder_settings in [
            ("homeowner", "10-notifications-language-and-settings"),
            ("kasambahay", "12-notifications-language-and-settings"),
        ]
    },
    **{
        f"docs/{role}/{folder_dole}/screenshots/1.png": [
            {"type": "highlight_rect", "box": (26, 325, 424, 535), "radius": 16},
        ]
        for role, folder_dole in [
            ("homeowner", "11-dole-contract-and-booking-limits"),
            ("kasambahay", "13-dole-contract-and-booking-limits"),
        ]
    },
    **{
        f"docs/{role}/{folder_dole}/screenshots/2.png": [
            {"type": "highlight_rect", "box": (26, 325, 424, 535), "radius": 16},
        ]
        for role, folder_dole in [
            ("homeowner", "11-dole-contract-and-booking-limits"),
            ("kasambahay", "13-dole-contract-and-booking-limits"),
        ]
    },
    **{
        f"docs/{role}/{folder_dole}/screenshots/3.png": [
            {"type": "highlight_rect", "box": (20, 648, 430, 768), "radius": 16},
        ]
        for role, folder_dole in [
            ("homeowner", "11-dole-contract-and-booking-limits"),
            ("kasambahay", "13-dole-contract-and-booking-limits"),
        ]
    },
}


def normalized_blur_rgb(img_arr, src_mask_arr, radius=20):
    """
    Computes normalized Gaussian blur strictly from pixels where src_mask_arr > 0,
    preventing background colors outside the mask from bleeding into the blurred region.
    """
    m_im = Image.fromarray((np.clip(src_mask_arr, 0.0, 1.0) * 255).astype(np.uint8), mode="L")
    m_blur = np.array(m_im.filter(ImageFilter.GaussianBlur(radius=radius)), dtype=np.float32) / 255.0
    m_blur = np.maximum(m_blur, 1e-4)[..., None]

    weighted = img_arr * src_mask_arr[..., None]
    out = np.zeros_like(img_arr, dtype=np.float32)
    for c in range(3):
        ch_im = Image.fromarray(np.clip(weighted[:, :, c], 0, 255).astype(np.uint8), mode="L")
        ch_blur = np.array(ch_im.filter(ImageFilter.GaussianBlur(radius=radius)), dtype=np.float32)
        out[:, :, c] = ch_blur / m_blur[:, :, 0]
    return np.clip(out, 0, 255)


def apply_circle_blur(img, cx, cy, r, preserve_badge=False, preserve_green_badge=False, clip_y=None):
    """
    Blurs a circular profile avatar at (cx, cy) with radius r using normalized convolution
    and 4x supersampled anti-aliased circular masking.
    """
    w, h = img.size
    blur_radius = max(12, int(min(r * 0.55, 28)))
    pad = blur_radius * 2 + 8
    x1, y1 = max(0, int(cx - r - pad)), max(0, int(cy - r - pad))
    x2, y2 = min(w, int(cx + r + pad)), min(h, int(cy + r + pad))
    cw, ch = x2 - x1, y2 - y1
    if cw <= 0 or ch <= 0:
        return

    crop = img.crop((x1, y1, x2, y2))
    crop_arr = np.array(crop, dtype=np.float32)

    ss = 4
    mask_ss = Image.new("L", (cw * ss, ch * ss), 0)
    draw_ss = ImageDraw.Draw(mask_ss)
    draw_ss.ellipse(
        ((cx - r - x1) * ss, (cy - r - y1) * ss, (cx + r - x1) * ss, (cy + r - y1) * ss),
        fill=255,
    )
    if clip_y is not None:
        cy_min, cy_max = clip_y
        if cy_min > y1:
            draw_ss.rectangle((0, 0, cw * ss, (cy_min - y1) * ss), fill=0)
        if cy_max < y2:
            draw_ss.rectangle((0, (cy_max - y1) * ss, cw * ss, ch * ss), fill=0)
    mask_im = mask_ss.resize((cw, ch), Image.Resampling.LANCZOS)
    mask_arr = np.array(mask_im, dtype=np.float32) / 255.0

    # Optionally preserve the small yellow clock or green check verification badge on the bottom-right rim
    if preserve_badge or preserve_green_badge:
        yy, xx = np.mgrid[y1:y2, x1:x2]
        in_br = (xx > cx + r * 0.15) & (yy > cy + r * 0.15)
        R, G, B = crop_arr[:, :, 0], crop_arr[:, :, 1], crop_arr[:, :, 2]
        is_badge = np.zeros_like(R, dtype=bool)
        if preserve_badge:
            is_badge |= in_br & (R > 190) & (G > 140) & (R - B > 70)
        if preserve_green_badge:
            is_badge |= in_br & (G > 140) & (G - R > 35)
        if np.any(is_badge):
            badge_im = Image.fromarray((is_badge.astype(np.uint8) * 255), mode="L")
            badge_im = badge_im.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(radius=0.8))
            badge_mask = np.array(badge_im, dtype=np.float32) / 255.0
            mask_arr = np.clip(mask_arr * (1.0 - badge_mask), 0.0, 1.0)

    blurred_arr = normalized_blur_rgb(crop_arr, mask_arr > 0.5, radius=blur_radius)
    comp_arr = crop_arr * (1.0 - mask_arr[..., None]) + blurred_arr * mask_arr[..., None]
    img.paste(Image.fromarray(np.clip(comp_arr, 0, 255).astype(np.uint8)), (x1, y1))


def apply_rounded_rect_blur(img, box, radius=8):
    """
    Blurs a rounded-rectangle document image at box=(x1, y1, x2, y2) using normalized convolution.
    """
    w, h = img.size
    bx1, by1, bx2, by2 = box
    blur_radius = 18
    pad = blur_radius * 2 + 8
    x1, y1 = max(0, bx1 - pad), max(0, by1 - pad)
    x2, y2 = min(w, bx2 + pad), min(h, by2 + pad)
    cw, ch = x2 - x1, y2 - y1

    crop = img.crop((x1, y1, x2, y2))
    crop_arr = np.array(crop, dtype=np.float32)

    ss = 4
    mask_ss = Image.new("L", (cw * ss, ch * ss), 0)
    draw_ss = ImageDraw.Draw(mask_ss)
    draw_ss.rounded_rectangle(
        ((bx1 - x1) * ss, (by1 - y1) * ss, (bx2 - x1) * ss, (by2 - y1) * ss),
        radius=radius * ss,
        fill=255,
    )
    mask_im = mask_ss.resize((cw, ch), Image.Resampling.LANCZOS)
    mask_arr = np.array(mask_im, dtype=np.float32) / 255.0

    blurred_arr = normalized_blur_rgb(crop_arr, mask_arr > 0.5, radius=blur_radius)
    comp_arr = crop_arr * (1.0 - mask_arr[..., None]) + blurred_arr * mask_arr[..., None]
    img.paste(Image.fromarray(np.clip(comp_arr, 0, 255).astype(np.uint8)), (x1, y1))


def apply_swipe_card_blur(img, top_pill, bottom_btn):
    """
    Blurs only the background photo of a swipe deck card while preserving all overlaid
    UI elements (top badge pill, bookmark icon, X/Heart circular buttons, white text,
    orange location pin, tag pills, and bottom action button) crisp and readable.
    """
    w, h = img.size
    orig_arr = np.array(img, dtype=np.float32)

    # 1. Card region mask (main swipe card + peeking background card)
    ss = 4
    card_ss = Image.new("L", (w * ss, h * ss), 0)
    cdraw = ImageDraw.Draw(card_ss)
    cdraw.rounded_rectangle((52 * ss, 342 * ss, 401 * ss, 385 * ss), radius=20 * ss, fill=255)
    cdraw.rounded_rectangle((23 * ss, 354 * ss, 430 * ss, 794 * ss), radius=28 * ss, fill=255)
    card_mask = np.array(card_ss.resize((w, h), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0

    # 2. Solid UI elements mask
    ui_ss = Image.new("L", (w * ss, h * ss), 0)
    udraw = ImageDraw.Draw(ui_ss)
    # Left X circle button & Right Heart circle button
    udraw.ellipse(((23.0 - 21.0) * ss, (579.0 - 21.0) * ss, (23.0 + 21.0) * ss, (579.0 + 21.0) * ss), fill=255)
    udraw.ellipse(((430.0 - 21.0) * ss, (579.0 - 21.0) * ss, (430.0 + 21.0) * ss, (579.0 + 21.0) * ss), fill=255)
    # Top-left dark pill
    tp1, tp2, tp3, tp4 = top_pill
    udraw.rounded_rectangle((tp1 * ss, tp2 * ss, tp3 * ss, tp4 * ss), radius=15 * ss, fill=255)
    # Three white tag pills
    udraw.rounded_rectangle((59 * ss, 692 * ss, 143 * ss, 720 * ss), radius=8 * ss, fill=255)
    udraw.rounded_rectangle((149 * ss, 692 * ss, 225 * ss, 720 * ss), radius=8 * ss, fill=255)
    udraw.rounded_rectangle((231 * ss, 692 * ss, 306 * ss, 720 * ss), radius=8 * ss, fill=255)
    # Bottom-right button ('See Details' or 'Applied')
    bb1, bb2, bb3, bb4 = bottom_btn
    udraw.rounded_rectangle((bb1 * ss, bb2 * ss, bb3 * ss, bb4 * ss), radius=21 * ss, fill=255)
    ui_mask = np.array(ui_ss.resize((w, h), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0

    # 3. White text strokes, orange location pin, and bookmark icon mask
    text_mask = np.zeros((h, w), dtype=np.float32)
    local_bg = np.array(img.filter(ImageFilter.GaussianBlur(radius=5)), dtype=np.float32)

    text_boxes = [
        (55, 555, 400, 688),  # Card title, location, category, description
        (55, 725, 175, 782),  # Price ("Php 600 / per day")
        (360, 380, 398, 422), # Bookmark icon
    ]
    for tx1, ty1, tx2, ty2 in text_boxes:
        roi_orig = orig_arr[ty1:ty2, tx1:tx2]
        roi_bg = local_bg[ty1:ty2, tx1:tx2]
        lum_orig = np.min(roi_orig, axis=2)
        lum_bg = np.min(roi_bg, axis=2)
        diff = lum_orig - lum_bg
        a_white1 = np.clip((diff - 10.0) / 30.0, 0.0, 1.0) * np.clip((lum_orig - 115.0) / 40.0, 0.0, 1.0)
        a_white2 = np.clip((lum_orig - 160.0) / 40.0, 0.0, 1.0)
        # Orange location pin detection (high R-B in x=55..82, y=585..635)
        a_orange = np.zeros_like(lum_orig)
        if ty1 == 555:
            pin_roi = roi_orig[30:80, 0:28]
            pin_score = (pin_roi[:, :, 0] - pin_roi[:, :, 2]) - 45.0
            a_orange[30:80, 0:28] = np.clip(pin_score / 35.0, 0.0, 1.0)
        text_mask[ty1:ty2, tx1:tx2] = np.maximum(np.maximum(a_white1, a_white2), a_orange)

    keep_sharp_mask = np.clip(np.maximum(ui_mask, text_mask), 0.0, 1.0)

    # Exclude dilated UI/text from blur source so white pills/text do not cast bright halos
    exclude_im = Image.fromarray((keep_sharp_mask * 255).astype(np.uint8), mode="L").filter(ImageFilter.MaxFilter(5))
    exclude_src = np.array(exclude_im, dtype=np.float32) / 255.0
    photo_src_mask = np.clip(card_mask * (1.0 - exclude_src), 0.0, 1.0)

    blurred_card_arr = normalized_blur_rgb(orig_arr, photo_src_mask, radius=28)
    blur_opacity = card_mask * (1.0 - keep_sharp_mask)
    final_arr = orig_arr * (1.0 - blur_opacity[..., None]) + blurred_card_arr * blur_opacity[..., None]
    img.paste(Image.fromarray(np.clip(final_arr, 0, 255).astype(np.uint8)), (0, 0))


def apply_swipe_card_blur_449(img, tutorial_modal_box=None):
    """
    Blurs only the background photo on a 449x1024 Explore swipe card while keeping all overlaid
    white text, tag pills, See Details button, X/Heart buttons, and any tutorial modal 100% sharp.
    """
    w, h = img.size
    orig_arr = np.array(img, dtype=np.float32)

    ss = 4
    card_ss = Image.new("L", (w * ss, h * ss), 0)
    cdraw = ImageDraw.Draw(card_ss)
    cdraw.rounded_rectangle((54 * ss, 342 * ss, 395 * ss, 385 * ss), radius=20 * ss, fill=255)
    cdraw.rounded_rectangle((24 * ss, 356 * ss, 425 * ss, 803 * ss), radius=28 * ss, fill=255)
    card_mask = np.array(card_ss.resize((w, h), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0

    ui_ss = Image.new("L", (w * ss, h * ss), 0)
    udraw = ImageDraw.Draw(ui_ss)
    # Left X & Right Heart circular buttons
    udraw.ellipse(((22.0 - 22.0) * ss, (584.5 - 22.0) * ss, (22.0 + 22.0) * ss, (584.5 + 22.0) * ss), fill=255)
    udraw.ellipse(((426.5 - 22.0) * ss, (584.5 - 22.0) * ss, (426.5 + 22.0) * ss, (584.5 + 22.0) * ss), fill=255)
    # Top-left (i) View Profile pill
    udraw.rounded_rectangle((58 * ss, 390 * ss, 200 * ss, 424 * ss), radius=16 * ss, fill=255)
    # Three white tag pills ('Short-term', 'All-around', 'Stay-out')
    udraw.rounded_rectangle((58 * ss, 690 * ss, 159 * ss, 718 * ss), radius=8 * ss, fill=255)
    udraw.rounded_rectangle((166 * ss, 690 * ss, 263 * ss, 718 * ss), radius=8 * ss, fill=255)
    udraw.rounded_rectangle((271 * ss, 690 * ss, 355 * ss, 718 * ss), radius=8 * ss, fill=255)
    # Bottom-right 'See Details' button
    udraw.rounded_rectangle((255 * ss, 738 * ss, 392 * ss, 783 * ss), radius=22 * ss, fill=255)
    if tutorial_modal_box is not None:
        tx1, ty1, tx2, ty2 = tutorial_modal_box
        udraw.rounded_rectangle((tx1 * ss, ty1 * ss, tx2 * ss, ty2 * ss), radius=24 * ss, fill=255)
    ui_mask = np.array(ui_ss.resize((w, h), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0

    text_mask = np.zeros((h, w), dtype=np.float32)
    local_bg = np.array(img.filter(ImageFilter.GaussianBlur(radius=5)), dtype=np.float32)
    max_text_y = 602 if tutorial_modal_box is not None else 688
    text_boxes = [
        (52, 520, 405, max_text_y),  # Card title, location, category, description
        (355, 385, 398, 430),        # Bookmark icon
    ]
    if tutorial_modal_box is None:
        text_boxes.append((52, 720, 190, 785))  # Price ("Php 600 / per day")

    for tx1, ty1, tx2, ty2 in text_boxes:
        roi_orig = orig_arr[ty1:ty2, tx1:tx2]
        roi_bg = local_bg[ty1:ty2, tx1:tx2]
        lum_orig = np.min(roi_orig, axis=2)
        lum_bg = np.min(roi_bg, axis=2)
        diff = lum_orig - lum_bg
        a_white1 = np.clip((diff - 10.0) / 28.0, 0.0, 1.0) * np.clip((lum_orig - 100.0) / 40.0, 0.0, 1.0)
        a_white2 = np.clip((lum_orig - 145.0) / 40.0, 0.0, 1.0)
        a_orange = np.zeros_like(lum_orig)
        if ty1 == 520:
            pin_h = min(85, ty2 - ty1)
            pin_roi = roi_orig[30:pin_h, 0:28]
            pin_score = (pin_roi[:, :, 0] - pin_roi[:, :, 2]) - 40.0
            a_orange[30:pin_h, 0:28] = np.clip(pin_score / 35.0, 0.0, 1.0)
        text_mask[ty1:ty2, tx1:tx2] = np.maximum(np.maximum(a_white1, a_white2), a_orange)

    keep_sharp_mask = np.clip(np.maximum(ui_mask, text_mask), 0.0, 1.0)
    exclude_im = Image.fromarray((keep_sharp_mask * 255).astype(np.uint8), mode="L").filter(ImageFilter.MaxFilter(5))
    exclude_src = np.array(exclude_im, dtype=np.float32) / 255.0
    photo_src_mask = np.clip(card_mask * (1.0 - exclude_src), 0.0, 1.0)

    blurred_card_arr = normalized_blur_rgb(orig_arr, photo_src_mask, radius=28)
    blur_opacity = card_mask * (1.0 - keep_sharp_mask)
    final_arr = orig_arr * (1.0 - blur_opacity[..., None]) + blurred_card_arr * blur_opacity[..., None]
    img.paste(Image.fromarray(np.clip(final_arr, 0, 255).astype(np.uint8)), (0, 0))


def apply_highlight_circle(img, cx, cy, r):
    """
    Draws a crisp, 4x supersampled anti-aliased blue highlight circle (#2563EB) with a subtle
    white contrast halo around a circular UI element.
    """
    w, h = img.size
    ss = 4
    overlay = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    bbox = ((cx - r) * ss, (cy - r) * ss, (cx + r) * ss, (cy + r) * ss)
    draw.ellipse(bbox, outline=(255, 255, 255, 215), width=int(6.5 * ss))
    draw.ellipse(bbox, outline=(37, 99, 235, 255), width=int(3.5 * ss))
    overlay_sm = overlay.resize((w, h), Image.Resampling.LANCZOS)
    comp = Image.alpha_composite(img.convert("RGBA"), overlay_sm).convert("RGB")
    img.paste(comp, (0, 0))


def apply_highlight_rect(img, box, radius=16):
    """
    Draws a crisp, 4x supersampled anti-aliased blue highlight rounded-rectangle (#2563EB) with
    a subtle white contrast halo around a rectangular UI element.
    """
    w, h = img.size
    bx1, by1, bx2, by2 = box
    ss = 4
    overlay = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    bbox = (bx1 * ss, by1 * ss, bx2 * ss, by2 * ss)
    draw.rounded_rectangle(bbox, radius=int(radius * ss), outline=(255, 255, 255, 215), width=int(6.5 * ss))
    draw.rounded_rectangle(bbox, radius=int(radius * ss), outline=(37, 99, 235, 255), width=int(3.5 * ss))
    overlay_sm = overlay.resize((w, h), Image.Resampling.LANCZOS)
    comp = Image.alpha_composite(img.convert("RGBA"), overlay_sm).convert("RGB")
    img.paste(comp, (0, 0))


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backup_root = os.path.join(repo_root, "_screenshots_backup")
    docs_root = os.path.join(repo_root, "docs")

    # 1. Restore all screenshots from pristine backup first
    restored_count = 0
    for root, _, files in os.walk(backup_root):
        for f in files:
            if f.endswith((".png", ".jpg", ".jpeg")):
                bkp_path = os.path.join(root, f)
                rel = os.path.relpath(bkp_path, backup_root)
                doc_path = os.path.join(docs_root, rel)
                if os.path.exists(doc_path):
                    shutil.copy2(bkp_path, doc_path)
                    restored_count += 1
    print(f"Restored {restored_count} pristine screenshots from _screenshots_backup/")

    # 2. Apply exact shape redactions and blue highlight encirclements
    processed_files = 0
    total_shapes = 0

    for rel_path, shapes in sorted(REDACTION_SHAPES.items()):
        doc_path = os.path.join(repo_root, rel_path.replace("/", os.sep))
        if not os.path.exists(doc_path):
            print(f"WARNING: Missing {rel_path}")
            continue

        img = Image.open(doc_path).convert("RGB")
        for s in shapes:
            stype = s["type"]
            if stype == "circle":
                apply_circle_blur(
                    img,
                    s["cx"],
                    s["cy"],
                    s["r"],
                    preserve_badge=s.get("preserve_badge", False),
                    preserve_green_badge=s.get("preserve_green_badge", False),
                    clip_y=s.get("clip_y", None),
                )
            elif stype == "rounded_rect":
                apply_rounded_rect_blur(img, s["box"], radius=s.get("radius", 8))
            elif stype == "swipe_card":
                apply_swipe_card_blur(img, s["top_pill"], s["bottom_btn"])
            elif stype == "swipe_card_449":
                apply_swipe_card_blur_449(img, tutorial_modal_box=s.get("tutorial_modal_box", None))
            elif stype == "highlight_circle":
                apply_highlight_circle(img, s["cx"], s["cy"], s["r"])
            elif stype == "highlight_rect":
                apply_highlight_rect(img, s["box"], radius=s.get("radius", 16))
            total_shapes += 1

        if doc_path.lower().endswith(".png"):
            img.save(doc_path, format="PNG", optimize=True)
        else:
            img.save(doc_path, format="JPEG", quality=95, subsampling=0)
        processed_files += 1
        print(f"Processed {rel_path} ({len(shapes)} shape(s))")

    print(f"\nCompleted: {processed_files} files processed with {total_shapes} exact frame shapes.")


if __name__ == "__main__":
    main()
