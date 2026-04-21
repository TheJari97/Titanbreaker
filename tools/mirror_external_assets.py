#!/usr/bin/env python3
"""
Mirror external assets from n981185z.beget.tech into local project files for GitHub Pages.

Why this exists:
- GitHub Pages serves your site over HTTPS.
- Browsers usually block HTTP images/scripts/styles on HTTPS pages (mixed content).
- Some external hosts also block hotlinking.

What this script does:
1. Scans HTML/JS/CSS files for external asset URLs.
2. Downloads the files into assets/external_mirror/... preserving path structure.
3. Rewrites the project files to point to the local mirrored copies.

Run from the project root:
  python tools/mirror_external_assets.py
"""
from __future__ import annotations
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen, Request

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MIRROR_ROOT = PROJECT_ROOT / 'assets' / 'external_mirror'
TEXT_EXTS = {'.html', '.js', '.css'}
TARGET_HOSTS = {
    'n981185z.beget.tech',
}
URL_RE = re.compile(r'https?://[^\s"\'\)<>]+')


def find_text_files(root: Path):
    for path in root.rglob('*'):
        if path.is_file() and path.suffix.lower() in TEXT_EXTS:
            if 'external_mirror' in path.parts:
                continue
            yield path


def collect_urls(files):
    urls = set()
    for path in files:
        text = path.read_text(encoding='utf-8', errors='ignore')
        for url in URL_RE.findall(text):
            try:
                parsed = urlparse(url)
            except Exception:
                continue
            if parsed.hostname in TARGET_HOSTS:
                urls.add(url)
    return sorted(urls)


def local_web_path(url: str) -> str:
    parsed = urlparse(url)
    rel = parsed.path.lstrip('/')
    return f'assets/external_mirror/{rel}'


def local_fs_path(url: str) -> Path:
    parsed = urlparse(url)
    rel = parsed.path.lstrip('/')
    return MIRROR_ROOT / rel


def download(url: str, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        print(f'[skip] {dest}')
        return
    print(f'[download] {url} -> {dest}')
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(req, timeout=45) as resp:
        data = resp.read()
    dest.write_bytes(data)


def rewrite_files(files, urls):
    for path in files:
        text = path.read_text(encoding='utf-8', errors='ignore')
        new_text = text
        for url in urls:
            new_text = new_text.replace(url, local_web_path(url))
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            print(f'[rewrite] {path.relative_to(PROJECT_ROOT)}')


def main():
    files = list(find_text_files(PROJECT_ROOT))
    urls = collect_urls(files)
    if not urls:
        print('No matching external URLs found.')
        return 0
    print(f'Found {len(urls)} external URLs from target hosts.')
    failures = []
    for url in urls:
        try:
            download(url, local_fs_path(url))
        except Exception as e:
            failures.append((url, str(e)))
            print(f'[error] {url} -> {e}')
    success_urls = [u for u in urls if not any(f[0] == u for f in failures)]
    rewrite_files(files, success_urls)
    print('\nDone.')
    if failures:
        print('\nSome downloads failed:')
        for url, err in failures:
            print(f'- {url}: {err}')
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
