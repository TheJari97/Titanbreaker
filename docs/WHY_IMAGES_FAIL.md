# Why the images fail on GitHub Pages

Even when the external image URL is correct, GitHub Pages serves your site over HTTPS.
If the asset URL is HTTP, many browsers will block it as **mixed content**.

That is why the long-term safe solution is:
- download the images into your repository
- update the paths so the site loads them locally
