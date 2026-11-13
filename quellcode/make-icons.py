# Erzeugt die App-Symbole der iPhone-Web-App aus der Symbol-Vorlage (icon-quelle.png).
# iOS rundet die Ecken selbst ab: durchsichtige Ecken der Vorlage werden mit der Hintergrundfarbe
# gefüllt, sonst erscheinen sie auf dem iPhone schwarz.
# Aufruf: python3 make-icons.py <Vorlage.png> <Zielordner>
import os
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

logo = Image.open(src).convert("RGBA")
w, h = logo.size
bg = logo.getpixel((w // 2, max(2, h // 25)))[:3]  # Hintergrundfarbe oben in der Mitte


def full(size):
    """Volles Quadrat ohne durchsichtige Ecken."""
    canvas = Image.new("RGBA", logo.size, bg + (255,))
    canvas.alpha_composite(logo)
    return canvas.convert("RGB").resize((size, size), Image.LANCZOS)


def maskable(size):
    """Für Android: Motiv verkleinert in der sicheren Mitte, Rand in Hintergrundfarbe."""
    canvas = Image.new("RGB", (size, size), bg)
    inner = full(int(size * 0.8))
    canvas.paste(inner, ((size - inner.width) // 2, (size - inner.height) // 2))
    return canvas


full(180).save(os.path.join(out, "apple-touch-icon.png"))
full(192).save(os.path.join(out, "icon-192.png"))
full(512).save(os.path.join(out, "icon-512.png"))
maskable(512).save(os.path.join(out, "icon-maskable-512.png"))
print("Symbole geschrieben nach", out, "Hintergrund", bg)
