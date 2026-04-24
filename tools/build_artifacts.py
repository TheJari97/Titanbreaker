from pathlib import Path
import json, re, html

ROOT = Path(__file__).resolve().parents[1]
SITE_DATA = ROOT / "assets" / "data"
SITE_JSON = ROOT / "assets" / "json"
CACHE = ROOT / "tools" / "cache"


def parse_js_const(path, name):
    text = path.read_text(encoding="utf-8")
    m = re.search(rf"^const {re.escape(name)} = (.*);\\s*$", text, re.S)
    if not m:
        raise RuntimeError(f"Could not parse {name} from {path}")
    return json.loads(m.group(1))


def parse_kv(text):
    text = re.sub(r"//.*", "", text)
    tokens = re.findall(r'\"(?:\\\\.|[^\"\\\\])*\"|\{|\}', text)
    idx = 0
    def parse_obj():
        nonlocal idx
        obj = {}
        while idx < len(tokens):
            tok = tokens[idx]
            if tok == '}':
                idx += 1
                break
            key = tok[1:-1]
            idx += 1
            nxt = tokens[idx]
            if nxt == '{':
                idx += 1
                val = parse_obj()
            else:
                val = nxt[1:-1]
                idx += 1
            obj[key] = val
        return obj
    root = tokens[0][1:-1]
    idx = 2
    return {root: parse_obj()}


def strip_html(s):
    s = (s or "").replace("%%", "%").replace("\\n", "\n")
    s = re.sub(r"<font[^>]*>", "", s)
    s = re.sub(r"</font>", "", s)
    s = html.unescape(s)
    return s.strip()


def split_desc(desc):
    desc = strip_html(desc)
    if not desc:
        return []
    return [p.strip() for p in re.split(r"\n+|(?<=\.)\s+(?=Rank\\b)|(?<=\.)\s+(?=[A-Z][a-z])", desc) if p.strip()]


items = parse_js_const(SITE_DATA / "items_data.js", "ITEMS")
item_map = {item["codename"]: item for item in items}
raw_items = parse_kv((CACHE / "items_kv.txt").read_text(encoding="utf-8"))["DOTAAbilities"]
loc_tokens = parse_kv((CACHE / "loc_items.txt").read_text(encoding="utf-8"))["lang"]["Tokens"]
image_stems = {path.stem for path in (ROOT / "assets" / "images" / "items").glob("*.png")}

artifacts = []
for code, entry in raw_items.items():
    if not isinstance(entry, dict) or entry.get("ItemQuality") != "artifact":
        continue
    existing = item_map.get(code)
    if existing:
        art = dict(existing)
    else:
        texture = entry.get("AbilityTextureName", "")
        stem = texture.split("/")[-1] if texture else ""
        image = f"assets/images/items/{stem}.png" if stem in image_stems else "assets/images/items/items_arcane_ring.png"
        name = strip_html(loc_tokens.get(f"DOTA_Tooltip_ability_{code}", code))
        desc = split_desc(loc_tokens.get(f"DOTA_Tooltip_ability_{code}_Description", ""))
        art = {
            "codename": code,
            "rarity": 9,
            "rarityEs": "Artefacto",
            "rarityEn": "Artifact",
            "name": name,
            "displayName": re.sub(r"^\[[^\]]+\]\s*", "", name).strip() or code,
            "descEn": desc,
            "descEs": desc,
            "descPt": desc,
            "image": image,
        }
        art["searchText"] = " ".join([art["displayName"], art["name"], code, *art["descEn"]])
    art["artifactQuality"] = entry.get("ItemQuality", "artifact")
    art["artifactTexture"] = entry.get("AbilityTextureName", "")
    artifacts.append(art)

artifacts.sort(key=lambda item: re.sub(r"^\[[^\]]+\]\s*", "", item.get("displayName") or item.get("name", "")).lower())
(SITE_DATA / "artifacts_data.js").write_text(f"const ARTIFACT_ITEMS = {json.dumps(artifacts, ensure_ascii=False)};\n", encoding="utf-8")
if SITE_JSON.exists():
    (SITE_JSON / "artifacts.json").write_text(json.dumps(artifacts, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Artifacts generated: {len(artifacts)}")
