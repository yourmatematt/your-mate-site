"""Extract text + render pages from gbp-checklist.pdf for faithful rebuild."""
import fitz
import json
import os
import sys

PDF_PATH = r"C:\projects\your-mate-matt\your-mate-site\downloads\gbp-checklist.pdf"
OUT_DIR = r"C:\projects\your-mate-matt\your-mate-site\tmp\pdf-inspect"

os.makedirs(OUT_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
print(f"PDF opened: {PDF_PATH}")
print(f"Pages: {doc.page_count}")
print(f"Metadata: {doc.metadata}")
print(f"Page 0 size: {doc[0].rect}")
print("=" * 80)

# 1) Render every page at 2x scale
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    out_png = os.path.join(OUT_DIR, f"orig-p{i+1}.png")
    pix.save(out_png)
    print(f"Rendered page {i+1} -> {out_png} ({pix.width}x{pix.height})")

print("=" * 80)

# 2) Dump links per page (for the CTA target)
for i, page in enumerate(doc):
    links = page.get_links()
    if links:
        print(f"\nPage {i+1} links:")
        for L in links:
            print(f"  {L}")

print("=" * 80)

# 3) Extract structured text (font/size/color/position) per page
structured = []
for i, page in enumerate(doc):
    page_data = {"page": i + 1, "blocks": []}
    d = page.get_text("dict")
    for block in d.get("blocks", []):
        if block.get("type") != 0:
            continue  # skip image blocks
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                page_data["blocks"].append({
                    "text": span.get("text", ""),
                    "font": span.get("font", ""),
                    "size": round(span.get("size", 0), 2),
                    "flags": span.get("flags", 0),  # 16 = bold, 2 = italic, etc.
                    "color": span.get("color", 0),  # int RGB
                    "bbox": [round(v, 2) for v in span.get("bbox", [0, 0, 0, 0])],
                })
    structured.append(page_data)

structured_path = os.path.join(OUT_DIR, "structured.json")
with open(structured_path, "w", encoding="utf-8") as f:
    json.dump(structured, f, indent=2, ensure_ascii=False)
print(f"\nStructured text -> {structured_path}")

# 4) Plain text per page
plain_path = os.path.join(OUT_DIR, "plain.txt")
with open(plain_path, "w", encoding="utf-8") as f:
    for i, page in enumerate(doc):
        f.write(f"\n{'='*80}\nPAGE {i+1}\n{'='*80}\n")
        f.write(page.get_text("text"))
print(f"Plain text     -> {plain_path}")

# 5) Color summary — what colors appear in text
colors = {}
for pd in structured:
    for b in pd["blocks"]:
        c = b["color"]
        hex_c = f"#{c:06X}"
        colors.setdefault(hex_c, 0)
        colors[hex_c] += 1
print("\nText colors used (count):")
for c, n in sorted(colors.items(), key=lambda x: -x[1]):
    print(f"  {c}  x{n}")

# 6) Font summary
fonts = {}
for pd in structured:
    for b in pd["blocks"]:
        k = (b["font"], b["size"], b["flags"])
        fonts.setdefault(k, 0)
        fonts[k] += 1
print("\nFont/size/flags combos (count):")
for (f, s, flags), n in sorted(fonts.items(), key=lambda x: -x[1]):
    print(f"  {f} {s}pt flags={flags}  x{n}")

doc.close()
print("\nDone.")
