"""Extract item titles + section headings from both PDFs and diff them."""
import fitz
import re

OLD = r"C:\projects\your-mate-matt\your-mate-site\tmp\pdf-inspect\orig-p1.png"  # reference only
OLD_PDF = None  # we already have plain.txt for the old one
NEW_PDF = r"C:\projects\your-mate-matt\your-mate-site\downloads\gbp-checklist.pdf"

doc_new = fitz.open(NEW_PDF)
new_text = ""
for page in doc_new:
    new_text += page.get_text("text") + "\n"
doc_new.close()

# Reload original plain.txt
with open(r"C:\projects\your-mate-matt\your-mate-site\tmp\pdf-inspect\plain.txt", "r", encoding="utf-8") as f:
    old_text = f.read()

# Strings that MUST appear in both — section headings, item titles, key phrases
required = [
    # title + subtitle
    "The Google Business Profile",
    "Accommodation Operators",
    "25 things to fix",
    "guests book direct",
    "not through Booking.com",
    # intro
    "Booking.com and the other OTAs charge you 15",
    "$25,000+",
    "up the road in Mallacoota",
    "set up wrong",
    "Tick each box as you go",
    # section headings
    "1. Foundation",
    "THE BASICS",
    "GET THESE WRONG AND NOTHING ELSE MATTERS",
    "2. Categories",
    "Attributes",
    "TELL GOOGLE EXACTLY WHAT YOU ARE",
    "3. Hours",
    "Contact",
    "NO SURPRISES FOR GUESTS",
    "4. Photos",
    "THIS IS WHERE MOST OPERATORS LOSE THE BOOKING",
    "5. The Direct Booking Bit",
    "WHERE THE COMMISSION SAVINGS ACTUALLY HAPPEN",
    "6. Reviews",
    "YOUR MOST POWERFUL CONVERSION TOOL",
    "7. Posts",
    "Q&A",
    "FREE REAL ESTATE MOST OPERATORS IGNORE",
    # item titles (all 25)
    "Claim and verify your listing",
    "Business name matches your real signage",
    "Address is correct and consistent",
    "Phone number is your direct line",
    "Website link points to your own site",
    "Primary category set correctly",
    "Add 2",
    "secondary categories",
    "Tick every relevant amenity",
    "Set accessibility attributes honestly",
    "Check-in and check-out hours set",
    "Public holidays and seasonal closures added",
    "Description fills the full 750 characters",
    "Logo uploaded (square, high-res)",
    "Cover photo is your best exterior shot",
    "At least 10 interior photos uploaded",
    "Outdoor and surrounds covered",
    "Add a new photo at least monthly",
    "Reservation link goes to your own booking engine",
    "Menu / services link added (if applicable)",
    "Messaging turned on",
    "Why this matters",
    "Reply to every review",
    "Set up a review request system",
    "Get your short Google review link",
    "Post an update every 2",
    "weeks",
    "Pre-load the Q",
    "section",
    # CTA + footer
    "Done it all",
    "Here's what's next",
    "Run the commission calculator",
    "Your Mate Agency",
    "helping regional businesses get found online",
    "Matt Rowlands",
    "Mallacoota",
    "East Gippsland",
    "matt@yourmateagency.com.au",
    "0478 101 521",
    "yourmateagency.com.au",
]

print(f"OLD PDF text length: {len(old_text)} chars")
print(f"NEW PDF text length: {len(new_text)} chars")
print(f"Page count: OLD=5, NEW={len(fitz.open(NEW_PDF))}")
print()

missing_new = [s for s in required if s not in new_text]
missing_old = [s for s in required if s not in old_text]

if missing_new:
    print(f"MISSING from NEW ({len(missing_new)}):")
    for s in missing_new:
        print(f"  - {s!r}")
else:
    print(f"ALL {len(required)} required strings present in NEW PDF.")

if missing_old:
    print(f"\nMISSING from OLD reference ({len(missing_old)}):")
    for s in missing_old:
        print(f"  - {s!r}")

# Count checkboxes by counting item titles
# Each item title is a unique bold short line. Crude: count lines that look like item titles.
print(f"\nOLD page count: 5 (per Phase 1)")
print(f"NEW page count: {fitz.open(NEW_PDF).page_count}")

# Check links in NEW
doc = fitz.open(NEW_PDF)
print("\nLinks in NEW PDF:")
for i, page in enumerate(doc):
    for L in page.get_links():
        if L.get("uri"):
            print(f"  Page {i+1}: {L['uri']}")
doc.close()
