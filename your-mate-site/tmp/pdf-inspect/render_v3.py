"""Render the PRINT-FRIENDLY PDF (v3 — no buttons) and verify."""
import fitz
import os

PDF_PATH = r"C:\projects\your-mate-matt\your-mate-site\downloads\gbp-checklist.pdf"
OUT_DIR = r"C:\projects\your-mate-matt\your-mate-site\tmp\pdf-inspect"

doc = fitz.open(PDF_PATH)
print(f"PDF: {PDF_PATH}")
print(f"Page count: {doc.page_count}")

for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    out_png = os.path.join(OUT_DIR, f"v3-p{i+1}.png")
    pix.save(out_png)
    text = page.get_text("text")
    nonblank = [L for L in text.splitlines() if L.strip()]
    print(f"  Page {i+1}: {pix.width}x{pix.height}  |  {len(nonblank)} non-blank text lines")

print("LINKS (should be footer only, no m.me / ig.me / direct-booking-switch):")
for i, page in enumerate(doc):
    for L in page.get_links():
        uri = L.get("uri", "")
        if uri:
            print(f"  Page {i+1}: {uri}")

# Check old links absent
all_text = "\n".join(p.get_text("text") for p in doc)
absent_checks = [
    "m.me/yourmateagency",
    "ig.me/m/yourmate_agency",
    "Message me on Facebook",
    "DM me on Instagram",
    "Run the commission calculator",
    "Flick me a message",
    "direct-booking-switch",
]
print("\nMUST BE ABSENT (button/CTA copy):")
for s in absent_checks:
    print(f"  [{'gone' if s not in all_text else 'STILL PRESENT'}] {s!r}")

# New copy present
present_checks = [
    "Done it all? Here's what's next.",
    "find me on Facebook or Instagram as Your Mate Agency",
    "my email and number are right below",
]
print("\nMUST BE PRESENT (new print-friendly copy):")
for s in present_checks:
    print(f"  [{'OK' if s in all_text else 'MISSING'}] {s!r}")

doc.close()
