const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  @page {
    size: A4;
    margin: 0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #000;
    color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 48px 56px 70px;
    background: #000;
    position: relative;
    page-break-after: always;
    page-break-inside: avoid;
  }
  .page:last-child { page-break-after: auto; }

  .footer {
    position: absolute;
    bottom: 30px;
    left: 56px;
    right: 56px;
    border-top: 1px solid #222;
    padding-top: 12px;
    font-size: 9px;
    color: #777;
    text-align: center;
    letter-spacing: 0.03em;
  }

  .logo {
    position: absolute;
    top: 48px;
    right: 56px;
    background: #2D9F5E;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    padding: 7px 18px;
    border-radius: 3px;
    letter-spacing: 0.04em;
  }

  h1 {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  h1 .green { color: #2D9F5E; }

  .subtitle {
    font-size: 12px;
    color: #999;
    margin-bottom: 28px;
  }

  .accent-line {
    width: 50px;
    height: 3px;
    background: #2D9F5E;
    border-radius: 2px;
    margin-bottom: 20px;
  }

  .intro {
    font-size: 11px;
    color: #bbb;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  .fix {
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid #1a1a1a;
    position: relative;
  }
  .fix:last-child { border-bottom: none; }

  .fix-num {
    font-size: 11px;
    font-weight: 700;
    color: #2D9F5E;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .fix-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .fix-title {
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    flex: 1;
    padding-right: 20px;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid #2D9F5E;
    border-radius: 3px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .fix-body {
    font-size: 10.5px;
    color: #aaa;
    line-height: 1.65;
  }
  .fix-body p { margin-bottom: 8px; }
  .fix-body p:last-child { margin-bottom: 0; }

  .whats-next {
    margin-top: 8px;
  }

  .whats-next h2 {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 16px;
  }

  .whats-next .lead {
    font-size: 11px;
    color: #bbb;
    line-height: 1.7;
    margin-bottom: 6px;
  }

  .cta-link {
    display: block;
    margin-top: 20px;
    margin-bottom: 4px;
  }
  .cta-link a {
    font-size: 13px;
    font-weight: 700;
    color: #2D9F5E;
    text-decoration: underline;
  }
  .cta-link .url {
    font-size: 10px;
    color: #777;
    margin-top: 2px;
    padding-left: 2px;
  }
  .cta-link .desc {
    font-size: 10px;
    color: #666;
    margin-top: 3px;
    padding-left: 2px;
  }
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page">
  <div class="logo">YMA</div>

  <h1>5 Google Business Profile Fixes<br><span class="green">That Stop Sending Your Guests to Booking.com</span></h1>
  <div class="subtitle">A 30-minute checklist for regional accommodation owners | Your Mate Agency</div>

  <div class="accent-line"></div>

  <div class="intro">
    Your Google Business Profile is the first thing most guests see when they search your property name. If it's not set up right, it's quietly sending them to Booking.com instead of your own front door. These 5 fixes take about 30 minutes total and you don't need any tech skills.
  </div>

  <div class="fix">
    <div class="fix-num">FIX 01</div>
    <div class="fix-title-row">
      <div class="fix-title">Check Where Your Website Link Goes</div>
      <div class="checkbox"></div>
    </div>
    <div class="fix-body">
      <p>Log into your Google Business Profile at business.google.com. Click &ldquo;Edit profile&rdquo; then &ldquo;Business information.&rdquo; Find the website field. If it links to your Booking.com or Expedia listing &mdash; change it to your own website immediately. If you don&rsquo;t have a website, use your Facebook page as a temporary fix, but a proper booking site should be the goal.</p>
      <p>This single change stops Google from sending people to an OTA on your behalf.</p>
    </div>
  </div>

  <div class="fix">
    <div class="fix-num">FIX 02</div>
    <div class="fix-title-row">
      <div class="fix-title">Post an Update This Week</div>
      <div class="checkbox"></div>
    </div>
    <div class="fix-body">
      <p>Google treats your profile like a social feed &mdash; if you haven&rsquo;t posted in months, it assumes you&rsquo;re less active than your competitors. Click &ldquo;Add update&rdquo; in your GBP dashboard and post something: a photo of the property, a seasonal special, a local event happening nearby.</p>
      <p>Aim for at least one post every two weeks. It takes 2 minutes and tells Google you&rsquo;re open for business.</p>
    </div>
  </div>

  <div class="footer">Your Mate Agency &nbsp;|&nbsp; yourmateagency.com.au &nbsp;|&nbsp; Mallacoota, VIC</div>
</div>

<!-- PAGE 2 -->
<div class="page">
  <div class="fix">
    <div class="fix-num">FIX 03</div>
    <div class="fix-title-row">
      <div class="fix-title">Replace Your Oldest Photos</div>
      <div class="checkbox"></div>
    </div>
    <div class="fix-body">
      <p>Scroll through your GBP photos. If any are more than 2 years old, blurry, or show outdated furnishings &mdash; remove them and upload fresh ones. Guests make snap decisions based on photos.</p>
      <p>You need 10&ndash;15 quality images minimum: exterior, rooms, bathrooms, common areas, the view, breakfast if you offer it. Phone photos are fine &mdash; natural light, no filters.</p>
    </div>
  </div>

  <div class="fix">
    <div class="fix-num">FIX 04</div>
    <div class="fix-title-row">
      <div class="fix-title">Get 3 New Reviews This Month</div>
      <div class="checkbox"></div>
    </div>
    <div class="fix-body">
      <p>Google weighs recent reviews heavily. If your last review was 3+ months ago, you&rsquo;re losing ground to competitors who are actively collecting them.</p>
      <p>The easiest method: when a guest checks out and says something positive, hand them your phone with the review link open. Or text/email them a direct link within 24 hours. Find your review link in your GBP dashboard under &ldquo;Ask for reviews.&rdquo; Target 2&ndash;3 new reviews per month minimum.</p>
    </div>
  </div>

  <div class="fix">
    <div class="fix-num">FIX 05</div>
    <div class="fix-title-row">
      <div class="fix-title">Rewrite Your Business Description</div>
      <div class="checkbox"></div>
    </div>
    <div class="fix-body">
      <p>You get 750 characters. Most accommodation owners either leave this blank or write something generic. Use this formula:</p>
      <p>What you are + Where you are + What makes you different + How to book direct.</p>
      <p>Example: &ldquo;Family-run motel in Mallacoota, East Gippsland. Walking distance to the beach, pet-friendly, with ocean views from every room. Book direct on our website for the best rate &mdash; no booking fees.&rdquo;</p>
      <p>Mention &ldquo;book direct&rdquo; or &ldquo;best rate on our website&rdquo; &mdash; this gives guests a reason to skip the OTA.</p>
    </div>
  </div>

  <div class="footer">Your Mate Agency &nbsp;|&nbsp; yourmateagency.com.au &nbsp;|&nbsp; Mallacoota, VIC</div>
</div>

<!-- PAGE 3 -->
<div class="page">
  <div class="accent-line"></div>

  <div class="whats-next">
    <h2>What&rsquo;s Next</h2>
    <p class="lead">You&rsquo;ve just fixed the front door. But here&rsquo;s the bigger question &mdash; how much are you actually paying in OTA commissions every year?</p>
    <p class="lead">Most accommodation owners are shocked when they see the number.</p>

    <div class="cta-link">
      <a href="https://yourmateagency.com.au/calculator">&raquo; Use our free Commission Calculator to find out</a>
      <div class="url">yourmateagency.com.au/calculator</div>
    </div>

    <div class="cta-link">
      <a href="https://yourmateagency.com.au/direct-booking-switch">&raquo; Get the Direct Booking Switch toolkit</a>
      <div class="url">yourmateagency.com.au/direct-booking-switch</div>
      <div class="desc">The full system to switch guests from OTAs to direct bookings &mdash; $47 one-time.</div>
    </div>
  </div>

  <div class="footer">Your Mate Agency &nbsp;|&nbsp; yourmateagency.com.au &nbsp;|&nbsp; Mallacoota, VIC</div>
</div>

</body>
</html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle' });

  const outputPath = path.join(__dirname, 'public', 'downloads', 'gbp-checklist.pdf');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log('PDF created at:', outputPath);
  console.log('Size:', Math.round(stats.size / 1024) + 'KB');
})();
