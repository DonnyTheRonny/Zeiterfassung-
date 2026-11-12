# Erzeugt die App-Symbole (Uhr auf blauem Grund) für die iPhone-Web-App
import math
import os
import sys
from PIL import Image, ImageDraw

out = sys.argv[1]
os.makedirs(out, exist_ok=True)

BLUE = (31, 79, 138)
WHITE = (255, 255, 255)
GREEN = (82, 201, 162)


def icon(size, maskable=False):
    s = size * 4  # hochauflösend zeichnen, dann verkleinern
    im = Image.new("RGB", (s, s), BLUE)
    d = ImageDraw.Draw(im)
    cx = cy = s / 2
    r = s * (0.30 if maskable else 0.34)
    w = max(4, int(s * 0.045))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=WHITE, width=w)
    # Stundenstriche
    for i in range(12):
        a = math.radians(i * 30)
        r1, r2 = r * 0.78, r * 0.9
        d.line([cx + r1 * math.sin(a), cy - r1 * math.cos(a), cx + r2 * math.sin(a), cy - r2 * math.cos(a)], fill=WHITE, width=max(2, w // 2))
    # Zeiger: 10 nach 10 wie bei einer Stempeluhr-Abbildung
    def hand(angle_deg, length, width, color):
        a = math.radians(angle_deg)
        d.line([cx, cy, cx + length * math.sin(a), cy - length * math.cos(a)], fill=color, width=width)
    hand(-60, r * 0.5, w, WHITE)
    hand(60, r * 0.72, int(w * 0.8), GREEN)
    d.ellipse([cx - w, cy - w, cx + w, cy + w], fill=WHITE)
    return im.resize((size, size), Image.LANCZOS)


icon(180).save(os.path.join(out, "apple-touch-icon.png"))
icon(192).save(os.path.join(out, "icon-192.png"))
icon(512).save(os.path.join(out, "icon-512.png"))
icon(512, maskable=True).save(os.path.join(out, "icon-maskable-512.png"))
print("Symbole geschrieben nach", out)
