ESHAAL SYED PORTFOLIO — README
==============================

1. HOW TO RUN
   The 3D hero uses Three.js loaded as an ES module, so run it from a local server
   (double-clicking index.html still works, but the 3D scene is replaced by the CSS fallback).

     cd portfolio
     python -m http.server 8000      (use python3 on Mac/Linux if needed)

   Then open http://localhost:8000 in your browser. An internet connection is needed
   for Three.js (cdn.jsdelivr.net) and Google Fonts.

2. ADD / REPLACE IMAGES
   Replace the files in images/ keeping the same names:
     eshaal-profile.png, cake-it-out-website.png, cake-it-out-logo.png,
     cake-it-out-flyer.png, social-media-designs.png, canva-templates.png
   Or edit the src="images/..." paths in index.html. Update width/height and alt text if the shape changes.

3. CHANGE TEXT
   All text is plain HTML in index.html. Search for the sentence and edit it.

4. CHANGE COLORS
   Open style.css and edit the variables at the top (:root):
     --bg (background), --ink (text), --gold (accent). For the 3D objects, change 0xd9bb8c in script.js.

5. CHANGE THE LINKEDIN URL
   Search index.html for  linkedin.com/in/eshaal-syed-design  and replace every match (nav, contact, footer).
   To make CONTACT ME open email instead, change its href to  mailto:you@example.com

6. DEPLOY
   Vercel: push the portfolio folder to GitHub, import the repo at vercel.com/new, click Deploy
           (Framework: "Other", no build command).
   GitHub Pages: push to GitHub, then Settings > Pages > Deploy from branch > main / (root).
