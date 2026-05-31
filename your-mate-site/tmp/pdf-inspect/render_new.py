"""Render the NEW gbp-checklist.pdf and check page count + orphan signals."""
import fitz
import os

PDF_PATH = r"C:\projects\your-mate-matt\your-mate-site\downloads\gbp-checklist.pdf"
OUT_DIR = r"C:\projects\your-mate-matt\your-mate-site\tmp\pdf-inspect"

doc = fitz.open(PDF_PATH)
print(f"NEW PDF: {PDF_PATH}")
print(f"Pages  : {doc.page_count}")
print(f"Title  : {doc.metadata.get('title', '')}")
print(f"Size   : {doc[0].rect}")
print("=" * 80)

for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    out_png = os.path.join(OUT_DIR, f"new-p{i+1}.png")
    pix.save(out_png)
    # Get rough text density (lines of text) to detect near-blank pages
    text = page.get_text("text")
    nonblank_lines = [L for L in text.splitlines() if L.strip()]
    print(f"  Page {i+1}: {pix.width}x{pix.height}  |  {len(nonblank_lines)} non-blank text lines")

print("=" * 80)

# Check links
for i, page in enumerate(doc):
    links = page.get_links()
    if links:
        for L in links:
            uri = L.get('uri', '')
            print(f"  Page {i+1}: link -> {uri}")

doc.close()
