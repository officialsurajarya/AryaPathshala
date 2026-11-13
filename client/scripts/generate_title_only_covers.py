import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"e:/aryapathshalaCode/client"
IMG_DIR = os.path.join(BASE_DIR, "public", "images")
BLANK_BOOK_PATH = os.path.join(IMG_DIR, "blank_book.jpg")

base_cv = cv2.imread(BLANK_BOOK_PATH)
bh, bw, _ = base_cv.shape

# Inner frame quad coordinates
DST_PTS = np.float32([[331, 165], [707, 146], [764, 720], [402, 729]])
PW, PH = 640, 960
SRC_PTS = np.float32([[0, 0], [PW, 0], [PW, PH], [0, PH]])
TRANSFORM_MATRIX = cv2.getPerspectiveTransform(SRC_PTS, DST_PTS)

FONT_PATH = "C:/Windows/Fonts/Nirmala.ttc"

COURSES = [
    # Vedas
    {"filename": "Rigveda.jpg", "title": "ऋग्वेद"},
    {"filename": "Yajurveda.jpg", "title": "यजुर्वेद"},
    {"filename": "Samveda.jpg", "title": "सामवेद"},
    {"filename": "AtharvaVeda.jpg", "title": "अथर्ववेद"},
    # Vedangas
    {"filename": "ShikshaVedang.jpg", "title": "शिक्षा"},
    {"filename": "KalpVedang.jpg", "title": "कल्प"},
    {"filename": "VyakaranVedang.jpg", "title": "व्याकरण"},
    {"filename": "NiruktVedang.jpg", "title": "निरुक्त"},
    {"filename": "ChhandVedang.jpg", "title": "छन्द"},
    {"filename": "JyotishVedang.jpg", "title": "ज्योतिष"},
    # Upanishads
    {"filename": "Ishopanishad.jpg", "title": "ईशोपनिषद्"},
    {"filename": "Kenopanishad.jpg", "title": "केनोपनिषद्"},
    {"filename": "Kathopanishad.jpg", "title": "कठोपनिषद्"},
    {"filename": "Prashnopanishad.jpg", "title": "प्रश्नोपनिषद्"},
    {"filename": "Mundakopanishad.jpg", "title": "मुण्डकोपनिषद्"},
    {"filename": "Mandukyopanishad.jpg", "title": "माण्डूक्योपनिषद्"},
    {"filename": "Aitareyopanishad.jpg", "title": "ऐतरेयोपनिषद्"},
    {"filename": "Taittireyopanishad.jpg", "title": "तैत्तिरीयोपनिषद्"},
    {"filename": "Brihadaranyakopanishad.jpg", "title": "बृहदारण्यकोपनिषद्"},
    {"filename": "Shvetashvataropanishad.jpg", "title": "श्वेताश्वतरोपनिषद्"},
    # Darshanas
    {"filename": "SankhyaDarshan.jpg", "title": "सांख्य दर्शन"},
    {"filename": "YogDarshan.jpg", "title": "योग दर्शन"},
    {"filename": "NyayaDarshan.jpg", "title": "न्याय दर्शन"},
    {"filename": "VaisheshikDarshan.jpg", "title": "वैशेषिक दर्शन"},
    {"filename": "MimansaDarshan.jpg", "title": "मीमांसा दर्शन"},
    {"filename": "VedantDarshan.jpg", "title": "वेदान्त दर्शन"},
    # Aarshagranthas
    {"filename": "BhagavadGita.jpg", "title": "भगवद्गीता"},
    {"filename": "SatyarthPrakash.jpg", "title": "सत्यार्थ प्रकाश"},
    {"filename": "SanskarVidhi.jpg", "title": "संस्कार विधि"},
    {"filename": "Manusmriti.jpg", "title": "मनुस्मृति"},
    {"filename": "RigvedadibhashyaBhumika.jpg", "title": "ऋग्वेदादिभाष्यभूमिका"},
    {"filename": "YagyavalkyaSmriti.jpg", "title": "याज्ञवल्क्य स्मृति"},
    {"filename": "KautilyaArthashastra.jpg", "title": "कौटिल्य अर्थशास्त्र"},
    # UGC NET
    {"filename": "UgcNet25.jpg", "title": "UGC NET\nसंस्कृत (25)"},
    {"filename": "UgcNet73.jpg", "title": "UGC NET\nसंस्कृत (73)"},
]

def render_cover_with_title(title, filename):
    plate = Image.new("RGBA", (PW, PH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(plate)

    lines = title.split("\n")
    max_len = max(len(l) for l in lines)

    if max_len <= 6 and len(lines) == 1:
        font_size = 84
    elif max_len <= 10 and len(lines) == 1:
        font_size = 66
    elif max_len <= 14 and len(lines) == 1:
        font_size = 54
    elif len(lines) > 1:
        font_size = 52
    else:
        font_size = 44

    font = ImageFont.truetype(FONT_PATH, font_size)
    cx = PW // 2
    cy = 380

    line_height = int(font_size * 1.25)
    total_height = line_height * len(lines)
    start_y = cy - (total_height // 2) + (line_height // 2)

    for i, line in enumerate(lines):
        ly = start_y + i * line_height
        # 3D shadow layers
        draw.text((cx + 4, ly + 6), line, fill=(15, 8, 4, 230), font=font, anchor="mm")
        draw.text((cx + 2, ly + 4), line, fill=(35, 18, 8, 200), font=font, anchor="mm")
        draw.text((cx + 1, ly + 2), line, fill=(65, 35, 15, 160), font=font, anchor="mm")
        # Top-left highlight
        draw.text((cx - 1, ly - 1), line, fill=(255, 238, 185, 120), font=font, anchor="mm")
        # Main rich antique gold fill (matching user's reference)
        draw.text((cx, ly), line, fill=(215, 172, 92, 255), font=font, anchor="mm")

    plate_cv = cv2.cvtColor(np.array(plate), cv2.COLOR_RGBA2BGRA)
    warped = cv2.warpPerspective(
        plate_cv, TRANSFORM_MATRIX, (bw, bh),
        flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0)
    )

    alpha = warped[:, :, 3:4] / 255.0
    color = warped[:, :, :3]
    result = (color * alpha + base_cv * (1.0 - alpha)).astype(np.uint8)

    out_path = os.path.join(IMG_DIR, filename)
    cv2.imwrite(out_path, result, [cv2.IMWRITE_JPEG_QUALITY, 96])
    print(f"Generated title-only cover: {filename} -> {title.replace(chr(10), ' ')}")

def main():
    print(f"Generating {len(COURSES)} clean title-only book covers matching user reference...")
    for c in COURSES:
        render_cover_with_title(c["title"], c["filename"])
    print("Done!")

if __name__ == "__main__":
    main()

