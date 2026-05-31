import fitz, json, os
src = r"downloads\gbp-checklist.pdf"
out = r"tmp\pdf-inspect"
doc = fitz.open(src)
print("PAGE_COUNT:", doc.page_count)
meta = doc.metadata or {}
print("TITLE:", meta.get("title"))
print("AUTHOR:", meta.get("author"))
print("PRODUCER:", meta.get("producer"))
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=110)
    p = os.path.join(out, f"page{i+1}.png")
    pix.save(p)
    print(f"RENDERED page{i+1} -> {p}  size={pix.width}x{pix.height}")
    links = page.get_links()
    print(f"  LINKS on page {i+1}: {len(links)}")
    for L in links:
        uri = L.get("uri") or L.get("file") or L.get("page")
        print(f"    -> kind={L.get('kind')} target={uri}")
print("---TEXT_SNIPPETS---")
for i, page in enumerate(doc):
    txt = page.get_text("text").strip()
    snippet = txt[:600].replace("\r"," ").replace("\n"," / ")
    print(f"PAGE {i+1} ({len(txt)} chars): {snippet}")
doc.close()
