# Perfectly Polished — Website

Rose-gold themed website for a handmade resin art business. Plain HTML/CSS/JS —
no build step, deploys straight to Vercel.

## Pages
- `index.html` — Home (shuffling featured pieces)
- `gallery.html` — Gallery (all pieces, shuffled, click to enlarge, "Order this")
- `about.html` — About
- `contact.html` — Contact Us (personalised message, saves to Google Sheet)
- `admin.html` — Password-protected page to add new pieces (not linked in the navbar on purpose)

## Step 1 — Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet.
2. Rename the first tab to **Products**. In row 1, add these headers exactly:
   `id | imageUrl | title | description | price | dateAdded`
3. Add a second tab named **Contacts**. In row 1, add these headers:
   `dateSubmitted | name | email | message | productRef`

## Step 2 — Add the Apps Script backend
1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code, and paste in the contents of `apps-script/Code.gs` (in this project).
3. Click **Save**, then **Deploy → New deployment**.
4. Click the gear icon next to "Select type" and choose **Web app**.
5. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy**, and authorize when prompted (click through the "unsafe" warning — this is your own script).
7. Copy the **Web app URL** it gives you (ends in `/exec`).

## Step 3 — Connect the website to your Sheet
1. Open `js/config.js` in this project.
2. Paste your Web app URL into `SCRIPT_URL`.
3. (Optional) Change `ADMIN_PASSWORD` to something only you know.
4. Save the file.

That's it — the Gallery/Home pages will now load real products from your Sheet,
and Contact form submissions + Admin-added products will save there automatically.

> Until you complete this step, the site shows demo placeholder products and
> contact form messages are just logged to the browser console — nothing is lost,
> but nothing is saved anywhere permanent either.

## Adding products (as the site owner)
1. Go to `yoursite.com/admin.html`.
2. Enter the admin password.
3. Paste a photo link (see below for how to get one), add a title, description
   and optional price, then click **Add to gallery**.
4. It appears on the Gallery and Home pages within seconds — no file ever
   touches the website's code, so nothing needs to be "saved" or redeployed.

### Getting a photo link
Since this is a simple static site (no server storage), product photos are
added by **link** rather than file upload. Easiest free options:
- Upload the photo to **Google Drive**, right-click → Share → "Anyone with the link",
  then use a direct-image link converter (search "Google Drive direct image link generator"), or
- Use a free image host like **postimages.org** or **imgbb.com** — upload and copy
  the "direct link".

## Step 3.5 — WhatsApp button on Contact page (optional)
1. Open `js/config.js`.
2. Set `WHATSAPP_NUMBER` to your number **with country code, no spaces or +**
   (e.g. `919876543210` for an Indian number).
3. Save. A green **"Chat on WhatsApp"** button will now appear on the Contact
   page — it opens a chat with your number, and if the visitor came from a
   gallery piece, the message is pre-filled with that piece's name.
4. Leave it blank to keep the button hidden.

## Step 4 — Deploy (GitHub → Vercel)
1. Push this whole folder to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import that repo.
3. Framework preset: **Other** (it's a static site, no build command needed).
4. Click **Deploy**. Vercel will give you a live `.vercel.app` URL — you can
   later add a custom domain from the Vercel dashboard.

## Notes
- The gallery and home page shuffle order every time someone loads the page.
- The admin password check happens in the browser, which is fine for a small
  single-owner site "for now" — it isn't bank-level security. Let me know if
  you'd like a stronger login later.
- Colours, text, and images can all be tweaked in `css/style.css` and the
  `.html` files directly.
