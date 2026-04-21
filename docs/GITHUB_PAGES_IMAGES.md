# Fixing images on GitHub Pages

If your images do not load on GitHub Pages, the usual causes are:

1. **Mixed content**: your site is served over `https://`, but the images are loaded from `http://`.
2. **Hotlink protection**: the external host blocks loading files from another domain.

## Best fix
Mirror the external assets into your own repository and make the site use local copies.

## Steps

### 1) Open a terminal in the project root

### 2) Run the mirror script

On Windows / PowerShell:

```powershell
python tools/mirror_external_assets.py
```

### 3) Review what changed

```powershell
git status
```

You should see:
- new files under `assets/external_mirror/`
- changes in `.html` / `.js` files replacing external URLs with local paths

### 4) Commit and push

```powershell
git add .
git commit -m "Mirror external assets locally for GitHub Pages"
git push origin main
```

## Notes
- Run the script **only when you still have external URLs** to mirror.
- After the rewrite, the project becomes more stable because it no longer depends on the external host for those assets.
