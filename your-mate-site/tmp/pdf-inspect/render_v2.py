"""Render the regenerated PDF (v2 — chat CTAs) and verify links."""
import fitz
import os

PDF_PATH = r"C:\projects\your-mate-matt\your-mate-site\downloads\gbp-checklist.pdf"
OUT_DIR = r"C:\projects\your-mate-matt\your-mate-site\tmp\pdf-inspect"

doc = fitz.open(PDF_PATH)
print(f"PDF: {PDF_PATH}")
print(f"Page count: {doc.page_count}")
print("=" * 80)

for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    out_png = os.path.join(OUT_DIR, f"v2-p{i+1}.png")
    pix.save(out_png)
    text = page.get_text("text")
    nonblank_lines = [L for L in text.splitlines() if L.strip()]
    print(f"  Page {i+1}: rendered {pix.width}x{pix.height}  |  {len(nonblank_lines)} non-blank text lines")

print("=" * 80)
print("LINKS PER PAGE:")
for i, page in enumerate(doc):
    for L in page.get_links():
        uri = L.get("uri", "")
        rect = L.get("from", None)
        if uri:
            print(f"  Page {i+1}: {uri}   (rect={rect})")

print("=" * 80)
# Verify the specific URIs we expect
expected = {
    "https://m.me/yourmateagency": False,
    "https://ig.me/m/yourmate_agency": False,
    "mailto:matt@yourmateagency.com.au": False,
    "https://yourmateagency.com.au/": False,
}
absent = "https://yourmateagency.com.au/direct-booking-switch"
old_present = False
for page in doc:
    for L in page.get_links():
        uri = L.get("uri", "")
        if uri in expected:
            expected[uri] = True
        if uri == absent:
            old_present = True

print("EXPECTED LINKS:")
for uri, found in expected.items():
    print(f"  [{'OK' if found else 'MISSING'}] {uri}")
print(f"\nOLD CTA REMOVED ({absent}): {'YES (good)' if not old_present else 'NO (BAD — old link still present!)'}")

# Quick scan for new copy
all_text = "\n".join(page.get_text("text") for page in doc)
for phrase in [
    "Want a hand keeping more of those bookings direct",
    "handing 15-20% to Booking.com",
    "Flick me a message",
    "happy to point you in the right direction",
    "Message me on Facebook",
    "DM me on Instagram",
]:
    print(f"  [{'OK' if phrase in all_text else 'MISSING'}] {phrase!r}")

# Old copy must be gone
print("\nOLD CTA COPY REMOVED:")
for phrase in [
    "Want to see how much commission you could save",
    "Run the commission calculator",
]:
    print(f"  [{'GONE' if phrase not in all_text else 'STILL PRESENT (BAD)'}] {phrase!r}")

doc.close()
