import os
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Path definitions
BASE_DIR = r"e:/aryapathshalaCode/client"
IMG_DIR = os.path.join(BASE_DIR, "public", "images")
UPLOADED_BLANK = r"C:/Users/Suraj Arya/.gemini/antigravity/brain/4790f050-fa87-49c3-a4e4-f585cae40aad/.user_uploaded/media_1794500891534_57a18d5e.jpg"

os.makedirs(IMG_DIR, exist_ok=True)

# Base book image (1024x1024)
base_cv = cv2.imread(UPLOADED_BLANK)
bh, bw, _ = base_cv.shape

# Inner frame quad coordinates with 3px inset
# TL=(331, 165), TR=(707, 146), BR=(764, 720), BL=(402, 729)
DST_PTS = np.float32([[331, 165], [707, 146], [764, 720], [402, 729]])

# Flat design plate dimensions
PW, PH = 640, 960
SRC_PTS = np.float32([[0, 0], [PW, 0], [PW, PH], [0, PH]])
TRANSFORM_MATRIX = cv2.getPerspectiveTransform(SRC_PTS, DST_PTS)

# Lighting gradient (studio light from top-left)
grad = np.linspace(1.08, 0.90, PH)[:, None] * np.linspace(1.05, 0.95, PW)[None, :]
GRADIENT_MAP = np.clip(grad, 0.85, 1.15)

# Micro leather grain extraction
leather_gray = cv2.cvtColor(base_cv, cv2.COLOR_BGR2GRAY).astype(np.float32)
leather_norm = (leather_gray / np.mean(leather_gray[300:600, 450:650])) * 0.16 + 0.84
LEATHER_NORM = np.clip(leather_norm[:, :, None], 0.78, 1.20)

# Fonts
FONT_DEVA_LG = ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttc", 48)
FONT_DEVA_MD = ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttc", 36)
FONT_DEVA_SM = ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttc", 22)
FONT_SERIF_SM = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 23)
FONT_SERIF_XS = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 17)

# ── Drawing Helper Functions ─────────────────────────────────

def draw_ornate_border(draw, pw, ph, gold_color=(218, 180, 70)):
    """Draws exquisite double gold borders with corner flourishes and fleurons."""
    # Outer frame
    draw.rectangle([(24, 24), (pw - 24, ph - 24)], outline=gold_color + (240,), width=3)
    draw.rectangle([(32, 32), (pw - 32, ph - 32)], outline=gold_color + (130,), width=1)
    # Inner thin frame
    draw.rectangle([(42, 42), (pw - 42, ph - 42)], outline=gold_color + (80,), width=1)

    # 4 Corner decorative accents
    for x, y, dx, dy in [(24, 24, 1, 1), (pw-24, 24, -1, 1), (pw-24, ph-24, -1, -1), (24, ph-24, 1, -1)]:
        draw.line([(x + dx*6, y + dy*6), (x + dx*28, y + dy*6)], fill=gold_color + (240,), width=2)
        draw.line([(x + dx*6, y + dy*6), (x + dx*6, y + dy*28)], fill=gold_color + (240,), width=2)
        draw.ellipse([(x + dx*12 - 3, y + dy*12 - 3), (x + dx*12 + 3, y + dy*12 + 3)], fill=gold_color + (255,))

def draw_header(draw, pw, title_top="॥ ॐ ॥", gold_color=(218, 180, 70)):
    """Draws top auspicious invocation and divider."""
    draw.text((pw // 2, 85), title_top, fill=(255, 238, 175), font=FONT_DEVA_MD, anchor="mm")
    cx = pw // 2
    draw.line([(cx - 85, 120), (cx + 85, 120)], fill=gold_color + (170,), width=1)
    draw.polygon([(cx, 114), (cx + 6, 120), (cx, 126), (cx - 6, 120)], fill=(255, 238, 175))

def draw_footer(draw, pw, ph, publisher="आर्य पाठशाला • वैदिक वाङ्मय", gold_color=(218, 180, 70)):
    """Draws publisher footer seal."""
    cx = pw // 2
    draw.line([(cx - 100, ph - 95), (cx + 100, ph - 95)], fill=gold_color + (150,), width=1)
    draw.text((cx, ph - 65), publisher, fill=(215, 190, 135), font=FONT_DEVA_SM, anchor="mm")

# ── Specialized Artwork Renderers ─────────────────────────────

def render_yajna_fire(draw, cx, cy):
    """Vedic Yajna Kunda with blazing holy flames and solar radiance."""
    # Rays
    for ang in range(0, 360, 20):
        rad = np.deg2rad(ang)
        r1, r2 = 140, 170
        draw.line([(cx + r1*np.cos(rad), cy + r1*np.sin(rad)), (cx + r2*np.cos(rad), cy + r2*np.sin(rad))], fill=(255, 220, 100, 90), width=1)
    # Altar tiers
    draw.polygon([(cx-115, cy+85), (cx+115, cy+85), (cx+135, cy+125), (cx-135, cy+125)], fill=(150, 42, 35), outline=(218, 180, 70), width=2)
    draw.polygon([(cx-85, cy+55), (cx+85, cy+55), (cx+105, cy+85), (cx-105, cy+85)], fill=(175, 55, 42), outline=(218, 180, 70), width=2)
    draw.polygon([(cx-60, cy+30), (cx+60, cy+30), (cx+75, cy+55), (cx-75, cy+55)], fill=(195, 70, 48), outline=(218, 180, 70), width=2)
    # Layered flames
    draw.polygon([(cx, cy-120), (cx+36, cy-45), (cx+52, cy+20), (cx, cy+32), (cx-52, cy+20), (cx-36, cy-45)], fill=(245, 145, 25))
    draw.polygon([(cx, cy-90), (cx+24, cy-35), (cx+32, cy+15), (cx, cy+25), (cx-32, cy+15), (cx-24, cy-35)], fill=(255, 205, 45))
    draw.polygon([(cx, cy-60), (cx+14, cy-20), (cx+16, cy+10), (cx, cy+18), (cx-16, cy+10), (cx-14, cy-20)], fill=(255, 250, 195))

def render_purna_kalash(draw, cx, cy):
    """Sacred Purna Kalash with coconut, mango leaves, and holy oblations."""
    # Sun disk behind kalash
    draw.ellipse([(cx-120, cy-120), (cx+120, cy+120)], outline=(218, 180, 70, 120), width=2)
    for a in range(0, 360, 24):
        rad = np.deg2rad(a)
        draw.line([(cx + 125*np.cos(rad), cy + 125*np.sin(rad)), (cx + 145*np.cos(rad), cy + 145*np.sin(rad))], fill=(255, 215, 100, 110), width=1)
    # Coconut
    draw.ellipse([(cx-40, cy-95), (cx+40, cy-25)], fill=(95, 52, 28), outline=(218, 180, 70), width=2)
    # Mango leaves radiating outward
    draw.polygon([(cx-55, cy-45), (cx-20, cy-80), (cx-30, cy-35)], fill=(40, 130, 60))
    draw.polygon([(cx+55, cy-45), (cx+20, cy-80), (cx+30, cy-35)], fill=(40, 130, 60))
    draw.polygon([(cx, cy-90), (cx-15, cy-40), (cx+15, cy-40)], fill=(50, 150, 70))
    # Golden Kalash pot
    draw.polygon([(cx-70, cy-15), (cx+70, cy-15), (cx+55, cy+5), (cx-55, cy+5)], fill=(218, 175, 55), outline=(255, 225, 120), width=2)
    draw.ellipse([(cx-75, cy-5), (cx+75, cy+95)], fill=(195, 135, 30), outline=(235, 195, 70), width=3)
    # Swastika on pot
    draw.line([(cx-20, cy+45), (cx+20, cy+45)], fill=(130, 35, 25), width=4)
    draw.line([(cx, cy+25), (cx, cy+65)], fill=(130, 35, 25), width=4)
    draw.line([(cx-20, cy+45), (cx-20, cy+30)], fill=(130, 35, 25), width=4)
    draw.line([(cx+20, cy+45), (cx+20, cy+60)], fill=(130, 35, 25), width=4)
    draw.line([(cx, cy+25), (cx+15, cy+25)], fill=(130, 35, 25), width=4)
    draw.line([(cx, cy+65), (cx-15, cy+65)], fill=(130, 35, 25), width=4)

def render_veena(draw, cx, cy):
    """Classical Saraswati Veena with musical vibrations and divine notes."""
    # Musical resonance rings
    for r in [90, 130, 160]:
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], outline=(218, 180, 70, 70), width=1)
    # Veena Neck
    draw.line([(cx-75, cy+85), (cx+75, cy-85)], fill=(185, 125, 45), width=14)
    draw.line([(cx-75, cy+85), (cx+75, cy-85)], fill=(240, 205, 110), width=4) # strings
    # Gourds (sound boxes)
    draw.ellipse([(cx-115, cy+45), (cx-45, cy+115)], fill=(140, 70, 25), outline=(218, 180, 70), width=3)
    draw.ellipse([(cx+45, cy-115), (cx+105, cy-55)], fill=(140, 70, 25), outline=(218, 180, 70), width=3)
    # Dragon/Yali head finial
    draw.ellipse([(cx+78, cy-92), (cx+98, cy-72)], fill=(218, 180, 70))
    # Sound sparks
    for dx, dy in [(-90, -50), (90, 40), (0, -120), (-40, -100)]:
        draw.text((cx + dx, cy + dy), "♪", fill=(255, 235, 140), font=FONT_DEVA_MD)

def render_healing_lotus(draw, cx, cy):
    """Sacred Sanjeevani Lotus & Amrita Healing Kalash."""
    # Aura
    for r in [85, 125, 155]:
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], outline=(80, 200, 120, 80), width=1)
    # Lotus petals
    petals = 12
    for i in range(petals):
        ang = (i * 360 / petals)
        rad = np.deg2rad(ang)
        px, py = cx + 65 * np.cos(rad), cy + 65 * np.sin(rad)
        draw.ellipse([(px-28, py-28), (px+28, py+28)], fill=(45, 145, 80, 140), outline=(218, 200, 90), width=2)
    # Amrita Drop / Central Vessel
    draw.ellipse([(cx-45, cy-25), (cx+45, cy+65)], fill=(210, 165, 45), outline=(255, 235, 130), width=3)
    draw.polygon([(cx, cy-75), (cx-30, cy-25), (cx+30, cy-25)], fill=(255, 230, 90))

def render_divine_conch(draw, cx, cy):
    """Sacred Shankha (Conch) with concentric acoustic soundwaves."""
    # Concentric soundwaves
    for r in range(40, 170, 25):
        draw.arc([(cx-r, cy-r), (cx+r, cy+r)], start=-45, end=225, fill=(218, 180, 70, 120), width=2)
    # Spiral Conch body
    draw.ellipse([(cx-55, cy-75), (cx+55, cy+75)], fill=(245, 240, 225), outline=(218, 180, 70), width=3)
    draw.ellipse([(cx-35, cy-55), (cx+35, cy+45)], fill=(230, 215, 195), outline=(190, 145, 50), width=2)
    draw.polygon([(cx-15, cy+55), (cx+15, cy+55), (cx, cy+110)], fill=(250, 245, 235), outline=(218, 180, 70), width=2)

def render_shulba_altar(draw, cx, cy):
    """Shulba Sutras geometric ritual altar and sacred geometry."""
    # Nested geometric squares & circles
    draw.ellipse([(cx-120, cy-120), (cx+120, cy+120)], outline=(218, 180, 70), width=2)
    draw.rectangle([(cx-85, cy-85), (cx+85, cy+85)], outline=(245, 195, 65), width=2)
    # Rotated diamond
    draw.polygon([(cx, cy-105), (cx+105, cy), (cx, cy+105), (cx-105, cy)], outline=(218, 180, 70), width=2)
    # Ritual ladles crossed
    draw.line([(cx-70, cy-70), (cx+70, cy+70)], fill=(200, 140, 50), width=5)
    draw.line([(cx+70, cy-70), (cx-70, cy+70)], fill=(200, 140, 50), width=5)
    draw.ellipse([(cx-25, cy-25), (cx+25, cy+25)], fill=(160, 45, 30), outline=(255, 220, 100), width=2)

def render_damaru(draw, cx, cy):
    """Lord Shiva's Damaru vibrating the 14 Maheshvara Sutras."""
    # Cosmic vibration aura
    for r in [90, 135, 165]:
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], outline=(218, 180, 70, 70), width=1)
    # Upper cone
    draw.polygon([(cx-70, cy-90), (cx+70, cy-90), (cx, cy-10)], fill=(175, 60, 40), outline=(218, 180, 70), width=3)
    # Lower cone
    draw.polygon([(cx-70, cy+70), (cx+70, cy+70), (cx, cy-10)], fill=(175, 60, 40), outline=(218, 180, 70), width=3)
    # Central ring
    draw.ellipse([(cx-18, cy-18), (cx+18, cy-2)], fill=(218, 180, 70))
    # Sound cords and beads
    draw.line([(cx, cy-10), (cx-65, cy-15)], fill=(245, 215, 120), width=2)
    draw.ellipse([(cx-75, cy-22), (cx-60, cy-7)], fill=(255, 235, 150))
    draw.line([(cx, cy-10), (cx+65, cy-5)], fill=(245, 215, 120), width=2)
    draw.ellipse([(cx+60, cy-12), (cx+75, cy+3)], fill=(255, 235, 150))

def render_vedic_tree(draw, cx, cy):
    """Yaska's Tree of Etymology and Palm-leaf Shastra."""
    # Roots & Trunk
    draw.line([(cx, cy-80), (cx, cy+75)], fill=(155, 95, 40), width=12)
    # Branches
    draw.line([(cx, cy-20), (cx-60, cy-70)], fill=(155, 95, 40), width=6)
    draw.line([(cx, cy-20), (cx+60, cy-70)], fill=(155, 95, 40), width=6)
    draw.line([(cx, cy+20), (cx-75, cy-15)], fill=(155, 95, 40), width=6)
    draw.line([(cx, cy+20), (cx+75, cy-15)], fill=(155, 95, 40), width=6)
    # Golden word leaves
    for px, py in [(cx-60, cy-70), (cx+60, cy-70), (cx, cy-85), (cx-75, cy-15), (cx+75, cy-15), (cx-35, cy-45), (cx+35, cy-45)]:
        draw.ellipse([(px-16, py-10), (px+16, py+10)], fill=(218, 180, 70), outline=(255, 235, 150))
    # Palm-leaf manuscript base
    draw.rectangle([(cx-95, cy+70), (cx+95, cy+95)], fill=(245, 230, 195), outline=(160, 100, 45), width=2)
    draw.line([(cx-85, cy+82), (cx+85, cy+82)], fill=(160, 100, 45), width=1)

def render_poetic_chhanda(draw, cx, cy):
    """Metric Celestial Rhythm Waves and Poetic Lyre."""
    # Rhythmic sine waves
    for y_off in [-60, -20, 20, 60]:
        pts = [(x, cy + y_off + int(20 * np.sin((x - cx) * 0.04))) for x in range(cx-120, cx+125, 8)]
        draw.line(pts, fill=(218, 180, 70, 140), width=2)
    # Golden Lyre
    draw.arc([(cx-70, cy-80), (cx+70, cy+80)], start=0, end=180, fill=(218, 180, 70), width=5)
    draw.line([(cx-70, cy-60), (cx-70, cy)], fill=(218, 180, 70), width=5)
    draw.line([(cx+70, cy-60), (cx+70, cy)], fill=(218, 180, 70), width=5)
    for sx in [-40, -20, 0, 20, 40]:
        draw.line([(cx+sx, cy-70), (cx+sx, cy+40)], fill=(255, 235, 140), width=2)

def render_zodiac_dial(draw, cx, cy):
    """Planetary Zodiac Dial, Sun, Moon, and 27 Nakshatras."""
    # Outer ring with 27 markers
    draw.ellipse([(cx-130, cy-130), (cx+130, cy+130)], outline=(218, 180, 70), width=3)
    draw.ellipse([(cx-115, cy-115), (cx+115, cy+115)], outline=(218, 180, 70, 100), width=1)
    for i in range(27):
        rad = np.deg2rad(i * 360 / 27)
        x1, y1 = cx + 115 * np.cos(rad), cy + 115 * np.sin(rad)
        x2, y2 = cx + 130 * np.cos(rad), cy + 130 * np.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=(255, 235, 140), width=2)
    # Sun & Moon in center
    draw.ellipse([(cx-45, cy-45), (cx+45, cy+45)], fill=(235, 150, 35), outline=(255, 235, 120), width=2)
    draw.arc([(cx-35, cy-35), (cx+35, cy+35)], start=-90, end=90, fill=(255, 255, 255), width=8)

def render_radiant_sun(draw, cx, cy):
    """The All-pervading Golden Sun (Ishopanishad)."""
    for ang in range(0, 360, 15):
        rad = np.deg2rad(ang)
        r1, r2 = 70, 150 if ang % 30 == 0 else 125
        draw.line([(cx + r1*np.cos(rad), cy + r1*np.sin(rad)), (cx + r2*np.cos(rad), cy + r2*np.sin(rad))], fill=(255, 215, 80, 150), width=2)
    draw.ellipse([(cx-65, cy-65), (cx+65, cy+65)], fill=(225, 135, 25), outline=(255, 240, 160), width=3)
    draw.text((cx, cy), "ॐ", fill=(255, 255, 240), font=FONT_DEVA_LG, anchor="mm")

def render_eye_of_consciousness(draw, cx, cy):
    """The Eye of Brahman Consciousness (Kenopanishad)."""
    # Radiance rays
    for ang in range(0, 360, 18):
        rad = np.deg2rad(ang)
        draw.line([(cx + 60*np.cos(rad), cy + 60*np.sin(rad)), (cx + 140*np.cos(rad), cy + 140*np.sin(rad))], fill=(100, 200, 255, 120), width=1)
    # Eye curves
    draw.arc([(cx-110, cy-70), (cx+110, cy+70)], start=20, end=160, fill=(218, 180, 70), width=4)
    draw.arc([(cx-110, cy-70), (cx+110, cy+70)], start=200, end=340, fill=(218, 180, 70), width=4)
    # Inner iris & pupil
    draw.ellipse([(cx-45, cy-45), (cx+45, cy+45)], fill=(25, 110, 180), outline=(218, 180, 70), width=2)
    draw.ellipse([(cx-22, cy-22), (cx+22, cy+22)], fill=(255, 255, 255))
    draw.ellipse([(cx-12, cy-12), (cx+12, cy+12)], fill=(255, 215, 80))

def render_ratha_chariot(draw, cx, cy):
    """The Chariot Wheel of the Soul (Kathopanishad)."""
    # Spoked wheel of Atman
    draw.ellipse([(cx-125, cy-125), (cx+125, cy+125)], outline=(218, 180, 70), width=6)
    draw.ellipse([(cx-105, cy-105), (cx+105, cy+105)], outline=(218, 180, 70, 120), width=2)
    draw.ellipse([(cx-35, cy-35), (cx+35, cy+35)], fill=(160, 45, 30), outline=(255, 235, 120), width=3)
    for a in range(0, 360, 30):
        rad = np.deg2rad(a)
        draw.line([(cx + 35*np.cos(rad), cy + 35*np.sin(rad)), (cx + 105*np.cos(rad), cy + 105*np.sin(rad))], fill=(218, 180, 70), width=3)
    # Nachiketa Flame on hub
    draw.polygon([(cx, cy-25), (cx+12, cy+10), (cx-12, cy+10)], fill=(255, 225, 80))

def render_six_pranas(draw, cx, cy):
    """Six-Spoke Cosmic Prana Wheel (Prashnopanishad)."""
    for a in range(0, 360, 60):
        rad = np.deg2rad(a)
        px, py = cx + 85*np.cos(rad), cy + 85*np.sin(rad)
        draw.ellipse([(px-28, py-28), (px+28, py+28)], fill=(35, 125, 75, 160), outline=(218, 180, 70), width=2)
        draw.line([(cx, cy), (px, py)], fill=(218, 180, 70), width=3)
    draw.ellipse([(cx-40, cy-40), (cx+40, cy+40)], fill=(210, 160, 40), outline=(255, 240, 160), width=3)
    draw.text((cx, cy), "प्राण", fill=(255, 255, 240), font=FONT_DEVA_MD, anchor="mm")

def render_two_birds_tree(draw, cx, cy):
    """Two Golden Birds on the Pippala Tree (Mundakopanishad)."""
    # Sacred Tree Canopy
    draw.ellipse([(cx-130, cy-120), (cx+130, cy+60)], fill=(25, 85, 55, 120), outline=(218, 180, 70), width=2)
    draw.line([(cx, cy-40), (cx, cy+110)], fill=(145, 85, 35), width=10)
    # Left Branch (Jivatma eating fruit)
    draw.line([(cx, cy+20), (cx-60, cy-10)], fill=(145, 85, 35), width=6)
    draw.ellipse([(cx-75, cy-35), (cx-45, cy-5)], fill=(218, 180, 70), outline=(255, 235, 150), width=2) # Bird 1
    # Right Branch (Paramatma witnessing calmly)
    draw.line([(cx, cy), (cx+60, cy-30)], fill=(145, 85, 35), width=6)
    draw.ellipse([(cx+45, cy-55), (cx+75, cy-25)], fill=(255, 225, 80), outline=(255, 255, 220), width=3) # Bird 2 (Radiant)
    # Halo around Paramatma
    draw.ellipse([(cx+35, cy-65), (cx+85, cy-15)], outline=(255, 245, 160, 140), width=1)

def render_turiya_mandala(draw, cx, cy):
    """The 4 States of Consciousness Turiya Mandala (Mandukyopanishad)."""
    radii = [140, 105, 70, 35]
    colors = [(70, 25, 95, 80), (95, 35, 125, 100), (125, 50, 165, 120), (225, 175, 45, 255)]
    for r, c in zip(radii, colors):
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], fill=c, outline=(218, 180, 70), width=2)
    draw.text((cx, cy), "ॐ", fill=(255, 255, 255), font=FONT_DEVA_LG, anchor="mm")

def render_triguna_triangle(draw, cx, cy):
    """The 3 Gunas (Sattva-Rajas-Tamas) Balance (Sankhya)."""
    # Outer circle
    draw.ellipse([(cx-130, cy-130), (cx+130, cy+130)], outline=(218, 180, 70, 100), width=1)
    # Equilateral triangle
    pts = [(cx, cy-105), (cx+95, cy+60), (cx-95, cy+60)]
    draw.polygon(pts, outline=(218, 180, 70), width=3)
    # 3 Gunas nodes
    # Sattva (White/Gold)
    draw.ellipse([(cx-25, cy-130), (cx+25, cy-80)], fill=(255, 250, 230), outline=(218, 180, 70), width=2)
    # Rajas (Red)
    draw.ellipse([(cx+70, cy+35), (cx+120, cy+85)], fill=(200, 50, 40), outline=(218, 180, 70), width=2)
    # Tamas (Dark Blue/Black)
    draw.ellipse([(cx-120, cy+35), (cx-70, cy+85)], fill=(30, 35, 55), outline=(218, 180, 70), width=2)
    draw.text((cx, cy), "सत्त्व • रज • तम", fill=(255, 235, 140), font=FONT_DEVA_SM, anchor="mm")

def render_yogi_samadhi(draw, cx, cy):
    """Meditating Yogi in Lotus Pose with 7 Chakras (Yoga Darshan)."""
    # Aura
    for r in [90, 130, 160]:
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], outline=(245, 175, 45, 80), width=1)
    # Head & Shoulders silhouette
    draw.ellipse([(cx-24, cy-105), (cx+24, cy-57)], fill=(218, 180, 70)) # Head
    draw.polygon([(cx-55, cy-50), (cx+55, cy-50), (cx+75, cy+50), (cx-75, cy+50)], fill=(195, 135, 35)) # Torso
    # Crossed legs
    draw.ellipse([(cx-85, cy+35), (cx+85, cy+85)], fill=(170, 110, 25), outline=(218, 180, 70), width=2)
    # 7 Kundalini chakras gems
    chakra_colors = [(180, 50, 200), (70, 70, 220), (50, 180, 220), (60, 200, 80), (240, 220, 50), (240, 130, 40), (220, 40, 40)]
    for idx, col in enumerate(chakra_colors):
        y_pos = cy - 75 + idx * 22
        draw.ellipse([(cx-6, y_pos-6), (cx+6, y_pos+6)], fill=col, outline=(255, 255, 255), width=1)

def render_scales_of_truth(draw, cx, cy):
    """Golden Scales of Pramana & Logical Truth (Nyaya Darshan)."""
    # Central column
    draw.line([(cx, cy-95), (cx, cy+80)], fill=(218, 180, 70), width=6)
    draw.ellipse([(cx-40, cy+70), (cx+40, cy+95)], fill=(180, 125, 40)) # Base
    # Balance beam
    draw.line([(cx-95, cy-55), (cx+95, cy-55)], fill=(218, 180, 70), width=4)
    # Left pan
    draw.line([(cx-95, cy-55), (cx-115, cy-5)], fill=(255, 225, 120), width=2)
    draw.line([(cx-95, cy-55), (cx-75, cy-5)], fill=(255, 225, 120), width=2)
    draw.arc([(cx-120, cy-15), (cx-70, cy+15)], start=0, end=180, fill=(218, 180, 70), width=4)
    # Right pan
    draw.line([(cx+95, cy-55), (cx+75, cy-5)], fill=(255, 225, 120), width=2)
    draw.line([(cx+95, cy-55), (cx+115, cy-5)], fill=(255, 225, 120), width=2)
    draw.arc([(cx+70, cy-15), (cx+120, cy+15)], start=0, end=180, fill=(218, 180, 70), width=4)
    # Top flame of discernment
    draw.polygon([(cx, cy-125), (cx+12, cy-95), (cx-12, cy-95)], fill=(255, 215, 60))

def render_vedanta_oneness(draw, cx, cy):
    """Universal Ocean of Oneness & Aham Brahmasmi (Vedanta)."""
    # Cosmic radiating rings
    for r in range(40, 160, 25):
        draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], outline=(218, 180, 70, 80), width=1)
    # Blooming Sahasrara Lotus
    for i in range(16):
        a = np.deg2rad(i * 360 / 16)
        draw.ellipse([(cx + 60*np.cos(a) - 20, cy + 60*np.sin(a) - 20), (cx + 60*np.cos(a) + 20, cy + 60*np.sin(a) + 20)], fill=(90, 20, 45, 120), outline=(218, 180, 70))
    draw.ellipse([(cx-45, cy-45), (cx+45, cy+45)], fill=(218, 180, 70), outline=(255, 240, 160), width=2)
    draw.text((cx, cy), "ब्रह्म", fill=(60, 10, 25), font=FONT_DEVA_MD, anchor="mm")

def render_gita_chariot(draw, cx, cy):
    """Lord Krishna's Divine Chariot & Sudarshana (Bhagavad Gita)."""
    # Sudarshana Chakra Halo
    draw.ellipse([(cx-125, cy-125), (cx+125, cy+125)], outline=(245, 185, 45), width=3)
    for a in range(0, 360, 20):
        rad = np.deg2rad(a)
        draw.polygon([(cx + 125*np.cos(rad), cy + 125*np.sin(rad)), (cx + 140*np.cos(rad + 0.1), cy + 140*np.sin(rad + 0.1)), (cx + 115*np.cos(rad + 0.2), cy + 115*np.sin(rad + 0.2))], fill=(255, 215, 80))
    # Sacred Conch & Chariot wheel
    draw.ellipse([(cx-65, cy-65), (cx+65, cy+65)], fill=(25, 75, 135), outline=(218, 180, 70), width=4)
    # Lotus petals inside
    for a in range(0, 360, 45):
        rad = np.deg2rad(a)
        draw.ellipse([(cx + 35*np.cos(rad) - 12, cy + 35*np.sin(rad) - 12), (cx + 35*np.cos(rad) + 12, cy + 35*np.sin(rad) + 12)], fill=(218, 180, 70))
    draw.text((cx, cy), "गीता", fill=(255, 255, 255), font=FONT_DEVA_MD, anchor="mm")

def render_satyarth_torch(draw, cx, cy):
    """The Blazing Torch of Truth (Satyarth Prakash)."""
    # Radiance
    for a in range(0, 360, 18):
        rad = np.deg2rad(a)
        draw.line([(cx + 50*np.cos(rad), cy - 30 + 50*np.sin(rad)), (cx + 145*np.cos(rad), cy - 30 + 145*np.sin(rad))], fill=(255, 215, 70, 130), width=2)
    # Torch handle
    draw.polygon([(cx-15, cy-20), (cx+15, cy-20), (cx+8, cy+105), (cx-8, cy+105)], fill=(160, 90, 35), outline=(218, 180, 70), width=2)
    # Torch cup
    draw.polygon([(cx-40, cy-50), (cx+40, cy-50), (cx+22, cy-20), (cx-22, cy-20)], fill=(218, 180, 70), outline=(255, 235, 130), width=2)
    # Blazing Truth Fire
    draw.polygon([(cx, cy-135), (cx+38, cy-75), (cx+45, cy-45), (cx, cy-35), (cx-45, cy-45), (cx-38, cy-75)], fill=(255, 140, 20))
    draw.polygon([(cx, cy-105), (cx+22, cy-65), (cx+25, cy-40), (cx, cy-35), (cx-25, cy-40), (cx-22, cy-65)], fill=(255, 215, 50))
    draw.polygon([(cx, cy-75), (cx+12, cy-50), (cx, cy-40), (cx-12, cy-50)], fill=(255, 255, 220))

def render_sanskar_wheel(draw, cx, cy):
    """16 Samskaras Wheel & Sacred Homa (Sanskar Vidhi)."""
    # 16 spokes wheel
    draw.ellipse([(cx-125, cy-125), (cx+125, cy+125)], outline=(218, 180, 70), width=4)
    draw.ellipse([(cx-105, cy-105), (cx+105, cy+105)], outline=(218, 180, 70, 110), width=1)
    for i in range(16):
        rad = np.deg2rad(i * 360 / 16)
        draw.line([(cx + 45*np.cos(rad), cy + 45*np.sin(rad)), (cx + 105*np.cos(rad), cy + 105*np.sin(rad))], fill=(218, 180, 70), width=2)
    # Auspicious Swastika in center
    draw.ellipse([(cx-45, cy-45), (cx+45, cy+45)], fill=(160, 35, 45), outline=(255, 230, 120), width=3)
    # Swastika
    draw.line([(cx-22, cy), (cx+22, cy)], fill=(255, 235, 130), width=4)
    draw.line([(cx, cy-22), (cx, cy+22)], fill=(255, 235, 130), width=4)
    draw.line([(cx-22, cy), (cx-22, cy-15)], fill=(255, 235, 130), width=4)
    draw.line([(cx+22, cy), (cx+22, cy+15)], fill=(255, 235, 130), width=4)
    draw.line([(cx, cy-22), (cx+15, cy-22)], fill=(255, 235, 130), width=4)
    draw.line([(cx, cy+22), (cx-15, cy+22)], fill=(255, 235, 130), width=4)

def render_academic_crest(draw, cx, cy, code_text="CODE 25"):
    """Academic Excellence Crest & Open Shastra (UGC NET Sanskrit)."""
    # Laurel wreath
    for a in range(60, 240, 20):
        rad = np.deg2rad(a)
        draw.ellipse([(cx + 120*np.cos(rad)-8, cy + 100*np.sin(rad)-8), (cx + 120*np.cos(rad)+8, cy + 100*np.sin(rad)+8)], fill=(218, 180, 70))
    for a in range(-60, 120, 20):
        rad = np.deg2rad(a)
        draw.ellipse([(cx - 120*np.cos(rad)-8, cy + 100*np.sin(rad)-8), (cx - 120*np.cos(rad)+8, cy + 100*np.sin(rad)+8)], fill=(218, 180, 70))
    # University Academic Shield
    draw.polygon([(cx-65, cy-80), (cx+65, cy-80), (cx+65, cy+10), (cx, cy+60), (cx-65, cy+10)], fill=(20, 45, 80), outline=(218, 180, 70), width=3)
    # Open Shastra Book inside shield
    draw.polygon([(cx-45, cy-50), (cx-5, cy-45), (cx-5, cy-15), (cx-45, cy-20)], fill=(245, 240, 220))
    draw.polygon([(cx+5, cy-45), (cx+45, cy-50), (cx+45, cy-20), (cx+5, cy-15)], fill=(245, 240, 220))
    draw.text((cx, cy+20), code_text, fill=(255, 235, 130), font=FONT_DEVA_SM, anchor="mm")

def render_gurukula_crest(draw, cx, cy, code_text="CODE 73"):
    """Traditional Shastric Gurukula Seal (UGC NET Sanskrit 73)."""
    # Double seal ring
    draw.ellipse([(cx-125, cy-125), (cx+125, cy+125)], outline=(218, 180, 70), width=3)
    draw.ellipse([(cx-112, cy-112), (cx+112, cy+112)], outline=(218, 180, 70, 100), width=1)
    # Palm-leaf shastric bundle
    draw.rectangle([(cx-70, cy-50), (cx+70, cy-20)], fill=(235, 210, 160), outline=(150, 90, 40), width=2)
    draw.rectangle([(cx-65, cy-25), (cx+65, cy+5)], fill=(245, 225, 180), outline=(150, 90, 40), width=2)
    # Traditional Inkpot and reed pen
    draw.line([(cx-35, cy+45), (cx+45, cy-25)], fill=(180, 120, 50), width=4)
    draw.ellipse([(cx-55, cy+30), (cx-15, cy+65)], fill=(160, 45, 30), outline=(218, 180, 70), width=2)
    draw.text((cx, cy+85), code_text, fill=(255, 235, 130), font=FONT_DEVA_SM, anchor="mm")

def render_aitareya_consciousness(draw, cx, cy):
    """Radiant golden cosmic eye & halo: Prajnanam Brahma (Consciousness is Brahman)."""
    for i in range(16):
        ang = i * (2 * math.pi / 16)
        x1 = cx + int(60 * math.cos(ang))
        y1 = cy + int(60 * math.sin(ang))
        x2 = cx + int(115 * math.cos(ang))
        y2 = cy + int(115 * math.sin(ang))
        draw.line([(x1, y1), (x2, y2)], fill=(255, 220, 110, 180), width=2)
    draw.ellipse([(cx - 72, cy - 72), (cx + 72, cy + 72)], outline=(245, 205, 95, 230), width=3)
    draw.ellipse([(cx - 52, cy - 52), (cx + 52, cy + 52)], outline=(218, 180, 70, 160), width=1)
    draw.arc([(cx - 45, cy - 35), (cx + 45, cy + 35)], 20, 160, fill=(255, 235, 160), width=3)
    draw.arc([(cx - 45, cy - 35), (cx + 45, cy + 35)], 200, 340, fill=(255, 235, 160), width=3)
    draw.ellipse([(cx - 18, cy - 18), (cx + 18, cy + 18)], fill=(218, 165, 32, 220), outline=(255, 240, 180), width=2)
    draw.ellipse([(cx - 8, cy - 8), (cx + 8, cy + 8)], fill=(255, 255, 230))
    for dx, dy in [(0, -90), (0, 90), (-90, 0), (90, 0)]:
        draw.ellipse([(cx + dx - 3, cy + dy - 3), (cx + dx + 3, cy + dy + 3)], fill=(255, 235, 150))

def render_taittiriya_panchakosha(draw, cx, cy):
    """5 concentric sacred layered lotus shields representing the 5 Sheaths of Self."""
    radii = [105, 85, 65, 45, 25]
    alphas = [90, 130, 170, 210, 255]
    for r, a in zip(radii, alphas):
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=(255, 215, 90, a), width=2)
    for i in range(8):
        ang = i * (2 * math.pi / 8)
        px = cx + int(65 * math.cos(ang))
        py = cy + int(65 * math.sin(ang))
        draw.ellipse([(px - 6, py - 6), (px + 6, py + 6)], fill=(255, 230, 130), outline=(200, 150, 40), width=1)
    draw.ellipse([(cx - 14, cy - 14), (cx + 14, cy + 14)], fill=(255, 245, 200), outline=(218, 165, 32), width=2)
    draw.ellipse([(cx - 5, cy - 5), (cx + 5, cy + 5)], fill=(255, 255, 255))
    for i in range(12):
        ang = i * (2 * math.pi / 12)
        tip_x = cx + int(118 * math.cos(ang))
        tip_y = cy + int(118 * math.sin(ang))
        b1_x = cx + int(105 * math.cos(ang - 0.2))
        b1_y = cy + int(105 * math.sin(ang - 0.2))
        b2_x = cx + int(105 * math.cos(ang + 0.2))
        b2_y = cy + int(105 * math.sin(ang + 0.2))
        draw.polygon([(tip_x, tip_y), (b1_x, b1_y), (b2_x, b2_y)], fill=(255, 215, 100, 180))

def render_brihadaranyaka_flame(draw, cx, cy):
    """Infinite flame & golden spiral: Tamaso Ma Jyotirgamaya."""
    draw.ellipse([(cx - 95, cy - 95), (cx + 95, cy + 95)], outline=(255, 215, 90, 140), width=2)
    draw.ellipse([(cx - 78, cy - 78), (cx + 78, cy + 78)], outline=(218, 180, 70, 180), width=1)
    draw.polygon([(cx - 50, cy + 50), (cx + 50, cy + 50), (cx + 35, cy + 68), (cx - 35, cy + 68)], fill=(218, 165, 32, 230), outline=(255, 235, 160), width=2)
    draw.rectangle([(cx - 20, cy + 68), (cx + 20, cy + 78)], fill=(180, 130, 20), outline=(255, 220, 130), width=1)
    flame_pts = [
        (cx, cy - 75),
        (cx + 25, cy - 35),
        (cx + 35, cy + 15),
        (cx + 15, cy + 45),
        (cx - 15, cy + 45),
        (cx - 35, cy + 15),
        (cx - 25, cy - 35)
    ]
    draw.polygon(flame_pts, fill=(255, 180, 40, 220), outline=(255, 235, 160), width=2)
    inner_flame = [
        (cx, cy - 55),
        (cx + 14, cy - 20),
        (cx + 18, cy + 20),
        (cx - 18, cy + 20),
        (cx - 14, cy - 20)
    ]
    draw.polygon(inner_flame, fill=(255, 240, 140, 240))
    draw.ellipse([(cx - 7, cy), (cx + 7, cy + 30)], fill=(255, 255, 240))

def render_shvetashvatara_wheel(draw, cx, cy):
    """The 16-spoked Brahmachakra with inner Rudra trident motif."""
    draw.ellipse([(cx - 90, cy - 90), (cx + 90, cy + 90)], outline=(255, 215, 90, 220), width=4)
    draw.ellipse([(cx - 76, cy - 76), (cx + 76, cy + 76)], outline=(200, 150, 40, 180), width=1)
    for i in range(16):
        ang = i * (2 * math.pi / 16)
        x2 = cx + int(76 * math.cos(ang))
        y2 = cy + int(76 * math.sin(ang))
        draw.line([(cx, cy), (x2, y2)], fill=(255, 215, 90, 160), width=2)
    draw.ellipse([(cx - 28, cy - 28), (cx + 28, cy + 28)], fill=(180, 120, 25), outline=(255, 235, 150), width=3)
    draw.line([(cx, cy + 18), (cx, cy - 18)], fill=(255, 245, 190), width=3)
    draw.line([(cx - 14, cy - 8), (cx + 14, cy - 8)], fill=(255, 245, 190), width=2)
    draw.line([(cx - 14, cy - 8), (cx - 14, cy - 16)], fill=(255, 245, 190), width=2)
    draw.line([(cx + 14, cy - 8), (cx + 14, cy - 16)], fill=(255, 245, 190), width=2)
    draw.ellipse([(cx - 4, cy - 4), (cx + 4, cy + 4)], fill=(255, 255, 240))

def render_mimansa_vedi(draw, cx, cy):
    """Vedic Yajna Vedi altar with sacred fire & ladle."""
    draw.polygon([(cx - 85, cy + 60), (cx + 85, cy + 60), (cx + 65, cy + 30), (cx - 65, cy + 30)], fill=(200, 140, 30, 220), outline=(255, 225, 130), width=2)
    draw.polygon([(cx - 65, cy + 30), (cx + 65, cy + 30), (cx + 45, cy), (cx - 45, cy)], fill=(225, 160, 45, 230), outline=(255, 235, 150), width=2)
    draw.polygon([(cx, cy - 65), (cx + 28, cy - 10), (cx + 15, cy), (cx - 15, cy), (cx - 28, cy - 10)], fill=(255, 170, 30, 240), outline=(255, 230, 130), width=2)
    draw.polygon([(cx, cy - 48), (cx + 14, cy - 5), (cx - 14, cy - 5)], fill=(255, 235, 120))
    draw.line([(cx - 40, cy - 35), (cx + 40, cy + 35)], fill=(255, 220, 110), width=3)
    draw.ellipse([(cx - 52, cy - 47), (cx - 36, cy - 31)], fill=(255, 215, 90), outline=(180, 130, 20), width=2)
    draw.arc([(cx - 95, cy - 95), (cx + 95, cy + 95)], 200, 340, fill=(255, 215, 90), width=2)

def render_vaisheshika_atom(draw, cx, cy):
    """Maharshi Kanada's atomic cosmos (Paramanu) — nucleus & planetary orbits."""
    for angle_deg in [0, 60, 120]:
        rad = math.radians(angle_deg)
        pts = []
        for t in range(0, 360, 10):
            tr = math.radians(t)
            x0 = 85 * math.cos(tr)
            y0 = 35 * math.sin(tr)
            xr = cx + int(x0 * math.cos(rad) - y0 * math.sin(rad))
            yr = cy + int(x0 * math.sin(rad) + y0 * math.cos(rad))
            pts.append((xr, yr))
        for j in range(len(pts)):
            draw.line([pts[j], pts[(j + 1) % len(pts)]], fill=(255, 215, 90, 170), width=2)
        nx = pts[0][0]
        ny = pts[0][1]
        draw.ellipse([(nx - 5, ny - 5), (nx + 5, ny + 5)], fill=(255, 245, 180), outline=(180, 130, 20), width=1)
    draw.ellipse([(cx - 24, cy - 24), (cx + 24, cy + 24)], fill=(230, 160, 30, 240), outline=(255, 235, 160), width=3)
    draw.ellipse([(cx - 12, cy - 12), (cx + 12, cy + 12)], fill=(255, 250, 210))

def render_manusmriti_dharma(draw, cx, cy):
    """Royal Crest of Vedic Dharma — Crown of Dharma & Scales of Justice."""
    draw.ellipse([(cx - 90, cy - 90), (cx + 90, cy + 90)], outline=(255, 215, 90, 140), width=2)
    crown_pts = [
        (cx - 55, cy - 30),
        (cx - 40, cy - 75),
        (cx - 20, cy - 45),
        (cx, cy - 85),
        (cx + 20, cy - 45),
        (cx + 40, cy - 75),
        (cx + 55, cy - 30),
        (cx, cy - 20)
    ]
    draw.polygon(crown_pts, fill=(225, 165, 30, 230), outline=(255, 235, 160), width=2)
    for px, py in [(cx - 40, cy - 75), (cx, cy - 85), (cx + 40, cy - 75)]:
        draw.ellipse([(px - 4, py - 4), (px + 4, py + 4)], fill=(255, 255, 220))
    draw.line([(cx - 55, cy + 15), (cx + 55, cy + 15)], fill=(255, 220, 110), width=4)
    draw.line([(cx, cy - 20), (cx, cy + 60)], fill=(255, 220, 110), width=4)
    for px in [cx - 55, cx + 55]:
        draw.line([(px, cy + 15), (px - 18, cy + 45)], fill=(218, 180, 70), width=2)
        draw.line([(px, cy + 15), (px + 18, cy + 45)], fill=(218, 180, 70), width=2)
        draw.arc([(px - 22, cy + 35), (px + 22, cy + 55)], 0, 180, fill=(255, 215, 90), width=3)
    draw.rectangle([(cx - 35, cy + 60), (cx + 35, cy + 70)], fill=(218, 165, 32), outline=(255, 235, 160), width=2)

def render_dayanand_bhashya(draw, cx, cy):
    """Maharshi Dayanand's Vedic wisdom: Radiant dawn sun illuminating sacred manuscript & quill."""
    draw.arc([(cx - 70, cy - 90), (cx + 70, cy + 50)], 180, 360, fill=(255, 215, 90), width=3)
    for i in range(11):
        ang = math.pi + i * (math.pi / 10)
        x1 = cx + int(60 * math.cos(ang))
        y1 = cy - 20 + int(60 * math.sin(ang))
        x2 = cx + int(95 * math.cos(ang))
        y2 = cy - 20 + int(95 * math.sin(ang))
        draw.line([(x1, y1), (x2, y2)], fill=(255, 225, 120, 190), width=2)
    draw.polygon([(cx - 65, cy + 10), (cx - 5, cy + 5), (cx - 5, cy + 55), (cx - 65, cy + 60)], fill=(255, 240, 200), outline=(180, 130, 20), width=2)
    draw.polygon([(cx + 5, cy + 5), (cx + 65, cy + 10), (cx + 65, cy + 60), (cx + 5, cy + 55)], fill=(255, 240, 200), outline=(180, 130, 20), width=2)
    for yoff in [18, 28, 38, 48]:
        draw.line([(cx - 55, cy + yoff), (cx - 15, cy + yoff - 3)], fill=(160, 110, 40), width=2)
        draw.line([(cx + 15, cy + yoff - 3), (cx + 55, cy + yoff)], fill=(160, 110, 40), width=2)
    draw.line([(cx + 45, cy - 40), (cx - 15, cy + 35)], fill=(255, 220, 120), width=3)
    draw.polygon([(cx - 15, cy + 35), (cx - 20, cy + 42), (cx - 10, cy + 38)], fill=(255, 235, 150))

def render_yajnavalkya_smriti(draw, cx, cy):
    """Sacred Pillar of Eternal Dharma flanked by holy lotus."""
    draw.ellipse([(cx - 85, cy - 85), (cx + 85, cy + 85)], outline=(255, 215, 90, 150), width=2)
    draw.rectangle([(cx - 18, cy - 60), (cx + 18, cy + 60)], fill=(220, 160, 30, 230), outline=(255, 235, 160), width=2)
    draw.polygon([(cx - 32, cy - 60), (cx + 32, cy - 60), (cx + 20, cy - 45), (cx - 20, cy - 45)], fill=(255, 220, 100), outline=(180, 130, 20), width=2)
    draw.polygon([(cx - 20, cy + 45), (cx + 20, cy + 45), (cx + 32, cy + 60), (cx - 32, cy + 60)], fill=(255, 220, 100), outline=(180, 130, 20), width=2)
    draw.line([(cx - 7, cy - 45), (cx - 7, cy + 45)], fill=(180, 120, 20), width=2)
    draw.line([(cx + 7, cy - 45), (cx + 7, cy + 45)], fill=(180, 120, 20), width=2)
    draw.arc([(cx - 25, cy - 85), (cx + 25, cy - 55)], 0, 180, fill=(255, 235, 160), width=3)
    draw.ellipse([(cx - 6, cy - 78), (cx + 6, cy - 66)], fill=(255, 255, 220))

def render_kautilya_arthashastra(draw, cx, cy):
    """Royal Citadel Fortress & Chakra of Governance (Statecraft & Economics)."""
    draw.ellipse([(cx - 90, cy - 90), (cx + 90, cy + 90)], outline=(255, 215, 90, 200), width=3)
    draw.polygon([(cx - 60, cy + 50), (cx + 60, cy + 50), (cx + 50, cy), (cx - 50, cy)], fill=(200, 140, 30, 240), outline=(255, 235, 160), width=2)
    for bx in [-45, -22, 0, 22, 45]:
        draw.rectangle([(cx + bx - 8, cy - 15), (cx + bx + 8, cy)], fill=(225, 165, 40), outline=(255, 235, 160), width=2)
    draw.ellipse([(cx - 30, cy - 65), (cx + 30, cy - 5)], fill=(180, 120, 20), outline=(255, 235, 150), width=3)
    for i in range(8):
        ang = i * (2 * math.pi / 8)
        x2 = cx + int(24 * math.cos(ang))
        y2 = cy - 35 + int(24 * math.sin(ang))
        draw.line([(cx, cy - 35), (x2, y2)], fill=(255, 220, 110), width=2)
    draw.ellipse([(cx - 8, cy - 43), (cx + 8, cy - 27)], fill=(255, 245, 190))
    draw.arc([(cx - 15, cy + 18), (cx + 15, cy + 52)], 180, 360, fill=(255, 235, 160), width=3)
    draw.rectangle([(cx - 15, cy + 35), (cx + 15, cy + 50)], fill=(40, 20, 10))

# ── Master Course Metadata Dictionary ───────────────────────────

COURSES_CONFIG = [
    {
        "filename": "Rigveda.jpg",
        "title": "ऋग्वेद अध्ययन",
        "title_en": "RIGVEDA STUDY",
        "bg_color": (38, 10, 14),
        "renderer": render_yajna_fire,
    },
    {
        "filename": "Yajurveda.jpg",
        "title": "यजुर्वेद अध्ययन",
        "title_en": "YAJURVEDA STUDY",
        "bg_color": (45, 22, 10),
        "renderer": render_purna_kalash,
    },
    {
        "filename": "Samveda.jpg",
        "title": "सामवेद अध्ययन",
        "title_en": "SAMAVEDA STUDY",
        "bg_color": (16, 26, 48),
        "renderer": render_veena,
    },
    {
        "filename": "AtharvaVeda.jpg",
        "title": "अथर्ववेद अध्ययन",
        "title_en": "ATHARVAVEDA STUDY",
        "bg_color": (12, 36, 22),
        "renderer": render_healing_lotus,
    },
    {
        "filename": "ShikshaVedang.jpg",
        "title": "शिक्षा वेदांग",
        "title_en": "SHIKSHA VEDANGA",
        "bg_color": (40, 20, 10),
        "renderer": render_divine_conch,
    },
    {
        "filename": "KalpVedang.jpg",
        "title": "कल्प वेदांग",
        "title_en": "KALPA VEDANGA",
        "bg_color": (42, 16, 12),
        "renderer": render_shulba_altar,
    },
    {
        "filename": "VyakaranVedang.jpg",
        "title": "व्याकरण वेदांग",
        "title_en": "VYAKARANA VEDANGA",
        "bg_color": (36, 10, 20),
        "renderer": render_damaru,
    },
    {
        "filename": "NiruktVedang.jpg",
        "title": "निरुक्त वेदांग",
        "title_en": "NIRUKTA VEDANGA",
        "bg_color": (32, 16, 10),
        "renderer": render_vedic_tree,
    },
    {
        "filename": "ChhandVedang.jpg",
        "title": "छन्द वेदांग",
        "title_en": "CHHANDA VEDANGA",
        "bg_color": (10, 32, 28),
        "renderer": render_poetic_chhanda,
    },
    {
        "filename": "JyotishVedang.jpg",
        "title": "ज्योतिष वेदांग",
        "title_en": "JYOTISHA VEDANGA",
        "bg_color": (10, 18, 36),
        "renderer": render_zodiac_dial,
    },
    {
        "filename": "Ishopanishad.jpg",
        "title": "ईशोपनिषद्",
        "title_en": "ISHOPANISHAD",
        "bg_color": (42, 18, 10),
        "renderer": render_radiant_sun,
    },
    {
        "filename": "Kenopanishad.jpg",
        "title": "केनोपनिषद्",
        "title_en": "KENOPANISHAD",
        "bg_color": (12, 24, 42),
        "renderer": render_eye_of_consciousness,
    },
    {
        "filename": "Kathopanishad.jpg",
        "title": "कठोपनिषद्",
        "title_en": "KATHOPANISHAD",
        "bg_color": (40, 10, 14),
        "renderer": render_ratha_chariot,
    },
    {
        "filename": "Prashnopanishad.jpg",
        "title": "प्रश्नोपनिषद्",
        "title_en": "PRASHNOPANISHAD",
        "bg_color": (14, 34, 22),
        "renderer": render_six_pranas,
    },
    {
        "filename": "Mundakopanishad.jpg",
        "title": "मुण्डकोपनिषद्",
        "title_en": "MUNDAKOPANISHAD",
        "bg_color": (10, 32, 24),
        "renderer": render_two_birds_tree,
    },
    {
        "filename": "Mandukyopanishad.jpg",
        "title": "माण्डूक्योपनिषद्",
        "title_en": "MANDUKYOPANISHAD",
        "bg_color": (28, 12, 38),
        "renderer": render_turiya_mandala,
    },
    {
        "filename": "SankhyaDarshan.jpg",
        "title": "सांख्य दर्शन",
        "title_en": "SANKHYA PHILOSOPHY",
        "bg_color": (36, 12, 16),
        "renderer": render_triguna_triangle,
    },
    {
        "filename": "YogDarshan.jpg",
        "title": "योग दर्शन",
        "title_en": "YOGA PHILOSOPHY",
        "bg_color": (42, 18, 10),
        "renderer": render_yogi_samadhi,
    },
    {
        "filename": "NyayaDarshan.jpg",
        "title": "न्याय दर्शन",
        "title_en": "NYAYA PHILOSOPHY",
        "bg_color": (12, 22, 38),
        "renderer": render_scales_of_truth,
    },
    {
        "filename": "VedantDarshan.jpg",
        "title": "वेदान्त दर्शन",
        "title_en": "VEDANTA PHILOSOPHY",
        "bg_color": (34, 10, 18),
        "renderer": render_vedanta_oneness,
    },
    {
        "filename": "BhagavadGita.jpg",
        "title": "भगवद्गीता",
        "title_en": "BHAGAVAD GITA",
        "bg_color": (12, 26, 46),
        "renderer": render_gita_chariot,
    },
    {
        "filename": "SatyarthPrakash.jpg",
        "title": "सत्यार्थ प्रकाश",
        "title_en": "SATYARTH PRAKASH",
        "bg_color": (40, 14, 10),
        "renderer": render_satyarth_torch,
    },
    {
        "filename": "SanskarVidhi.jpg",
        "title": "संस्कार विधि",
        "title_en": "SANSKAR VIDHI",
        "bg_color": (38, 10, 16),
        "renderer": render_sanskar_wheel,
    },
    {
        "filename": "UgcNet25.jpg",
        "title": "UGC NET संस्कृत (25)",
        "title_en": "UGC NET SANSKRIT 25",
        "bg_color": (12, 22, 38),
        "renderer": lambda d, cx, cy: render_academic_crest(d, cx, cy, "CODE 25"),
    },
    {
        "filename": "UgcNet73.jpg",
        "title": "UGC NET संस्कृत (73)",
        "title_en": "UGC NET TRADITIONAL 73",
        "bg_color": (32, 12, 18),
        "renderer": lambda d, cx, cy: render_gurukula_crest(d, cx, cy, "CODE 73"),
    },
    {
        "filename": "Aitareyopanishad.jpg",
        "title": "ऐतरेयोपनिषद्",
        "title_en": "AITAREYA UPANISHAD",
        "bg_color": (36, 16, 12),
        "renderer": render_aitareya_consciousness,
    },
    {
        "filename": "Taittireyopanishad.jpg",
        "title": "तैत्तिरीयोपनिषद्",
        "title_en": "TAITTIRIYA UPANISHAD",
        "bg_color": (16, 32, 24),
        "renderer": render_taittiriya_panchakosha,
    },
    {
        "filename": "Brihadaranyakopanishad.jpg",
        "title": "बृहदारण्यकोपनिषद्",
        "title_en": "BRIHADARANYAKA UPANISHAD",
        "bg_color": (28, 12, 34),
        "renderer": render_brihadaranyaka_flame,
    },
    {
        "filename": "Shvetashvataropanishad.jpg",
        "title": "श्वेताश्वतरोपनिषद्",
        "title_en": "SHVETASHVATARA UPANISHAD",
        "bg_color": (34, 18, 12),
        "renderer": render_shvetashvatara_wheel,
    },
    {
        "filename": "MimansaDarshan.jpg",
        "title": "मीमांसा दर्शन",
        "title_en": "MIMANSA PHILOSOPHY",
        "bg_color": (40, 16, 10),
        "renderer": render_mimansa_vedi,
    },
    {
        "filename": "VaisheshikDarshan.jpg",
        "title": "वैशेषिक दर्शन",
        "title_en": "VAISHESHIKA PHILOSOPHY",
        "bg_color": (14, 24, 40),
        "renderer": render_vaisheshika_atom,
    },
    {
        "filename": "Manusmriti.jpg",
        "title": "मनुस्मृति",
        "title_en": "MANUSMRITI",
        "bg_color": (38, 14, 16),
        "renderer": render_manusmriti_dharma,
    },
    {
        "filename": "RigvedadibhashyaBhumika.jpg",
        "title": "ऋग्वेदादिभाष्यभूमिका",
        "title_en": "RIGVEDADI BHASHYA BHUMIKA",
        "bg_color": (32, 18, 12),
        "renderer": render_dayanand_bhashya,
    },
    {
        "filename": "YagyavalkyaSmriti.jpg",
        "title": "याज्ञवल्क्य स्मृति",
        "title_en": "YAJYAVALKYA SMRITI",
        "bg_color": (24, 20, 36),
        "renderer": render_yajnavalkya_smriti,
    },
    {
        "filename": "KautilyaArthashastra.jpg",
        "title": "कौटिल्य अर्थशास्त्र",
        "title_en": "KAUTILYA ARTHASHASTRA",
        "bg_color": (20, 28, 18),
        "renderer": render_kautilya_arthashastra,
    },
]

# ── Generator Pipeline ──────────────────────────────────────────

def generate_book_cover(cfg):
    """Generates an individual 3D book cover and perspective-warps it onto the template."""
    filename = cfg["filename"]
    title = cfg["title"]
    title_en = cfg["title_en"]
    bg_color = cfg["bg_color"]
    renderer = cfg["renderer"]

    # 1. Create flat design plate in PIL
    plate = Image.new("RGBA", (PW, PH), bg_color + (255,))
    draw = ImageDraw.Draw(plate)

    # 2. Add ornate gold border & corner fleurons
    draw_ornate_border(draw, PW, PH)

    # 3. Add top invocation
    draw_header(draw, PW)

    # 4. Render subject-specific sacred visual illustration
    cx, cy = PW // 2, 375
    renderer(draw, cx, cy)

    # 5. Render Sanskrit main title
    # Choose font size depending on title length
    if len(title) > 16:
        font_title = FONT_DEVA_MD
        title_y = 615
    else:
        font_title = FONT_DEVA_LG
        title_y = 615

    # Shadow for title
    draw.text((cx + 2, title_y + 2), title, fill=(15, 5, 8, 200), font=font_title, anchor="mm")
    # Gold title
    draw.text((cx, title_y), title, fill=(255, 235, 150), font=font_title, anchor="mm")

    # 6. Render English serif subtitle
    draw.text((cx + 1, 676), title_en, fill=(15, 5, 8, 160), font=FONT_SERIF_SM, anchor="mm")
    draw.text((cx, 675), title_en, fill=(230, 205, 140), font=FONT_SERIF_SM, anchor="mm")

    # Divider below title
    draw.line([(cx - 110, 725), (cx + 110, 725)], fill=(218, 180, 70, 160), width=1)
    draw.ellipse([(cx - 4, 721), (cx + 4, 729)], fill=(255, 235, 160))

    # 7. Add footer imprint
    draw_footer(draw, PW, PH)

    # Convert to OpenCV image (BGRA)
    plate_cv = cv2.cvtColor(np.array(plate), cv2.COLOR_RGBA2BGRA)

    # Apply lighting gradient
    plate_color = plate_cv[:, :, :3].astype(np.float32)
    plate_color = np.clip(plate_color * GRADIENT_MAP[:, :, None], 0, 255).astype(np.uint8)
    plate_shaded = np.dstack([plate_color, plate_cv[:, :, 3]])

    # 8. Perspective warp onto 1024x1024 book
    warped = cv2.warpPerspective(
        plate_shaded,
        TRANSFORM_MATRIX,
        (bw, bh),
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )

    alpha = warped[:, :, 3:4] / 255.0
    color = warped[:, :, :3]

    # 9. Blend with antique leather grain
    blended_color = np.clip(color * LEATHER_NORM, 0, 255)
    result = (blended_color * alpha + base_cv * (1.0 - alpha)).astype(np.uint8)

    # 10. Save high quality JPEG
    out_path = os.path.join(IMG_DIR, filename)
    cv2.imwrite(out_path, result, [cv2.IMWRITE_JPEG_QUALITY, 96])
    print(f"✅ Generated: {filename} ({title})")

def main():
    print(f"📚 Starting Course Book Covers Generation ({len(COURSES_CONFIG)} covers)...")
    for cfg in COURSES_CONFIG:
        generate_book_cover(cfg)
    print("🎉 All course book covers have been successfully generated and customized!")

if __name__ == "__main__":
    main()
