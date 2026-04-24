#!/usr/bin/env python3
import json, re, html, collections, shutil, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def parse_js_const(path: Path, name: str):
    txt = path.read_text(encoding="utf-8")
    marker = f"const {name} = "
    i = txt.find(marker)
    if i < 0:
        raise ValueError(f"Missing {name} in {path}")
    i += len(marker)
    opener = txt[i]
    closer = {"[": "]", "{": "}"}[opener]
    depth = 0; in_str = False; esc = False; quote = None
    for j, ch in enumerate(txt[i:], start=i):
        if in_str:
            if esc: esc = False
            elif ch == "\\":
                esc = True
            elif ch == quote:
                in_str = False
        else:
            if ch in "\"'":
                in_str = True; quote = ch
            elif ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    return json.loads(txt[i:j+1])
    raise ValueError(f"Unclosed literal in {path}")

def write_js_const(path: Path, name: str, value):
    path.write_text(f"const {name} = {json.dumps(value, ensure_ascii=False)};\n", encoding="utf-8")

def write_js_multi_consts(path: Path, mapping):
    path.write_text("".join(f"const {k} = {json.dumps(v, ensure_ascii=False)};\n" for k, v in mapping.items()), encoding="utf-8")

def strip_comments(text: str) -> str:
    out=[]; i=0; in_str=False; esc=False
    while i < len(text):
        ch=text[i]
        if in_str:
            out.append(ch)
            if esc: esc=False
            elif ch=="\\":
                esc=True
            elif ch=='"':
                in_str=False
            i += 1; continue
        if ch=='"':
            in_str=True; out.append(ch); i += 1; continue
        if ch=='/' and i+1 < len(text) and text[i+1]=='/':
            while i < len(text) and text[i] not in '\r\n':
                i += 1
            continue
        out.append(ch); i += 1
    return ''.join(out)

def tokenize_kv(text: str):
    text = strip_comments(text)
    tokens=[]; i=0
    while i < len(text):
        ch=text[i]
        if ch.isspace():
            i += 1; continue
        if ch in '{}':
            tokens.append(ch); i += 1; continue
        if ch=='"':
            i += 1; buf=[]; esc=False
            while i < len(text):
                ch=text[i]
                if esc:
                    buf.append('\n' if ch=='n' else '\t' if ch=='t' else ch); esc=False
                else:
                    if ch=="\\":
                        esc=True
                    elif ch=='"':
                        i += 1; break
                    else:
                        buf.append(ch)
                i += 1
            tokens.append(''.join(buf)); continue
        j=i
        while j < len(text) and (not text[j].isspace()) and text[j] not in '{}':
            j += 1
        tokens.append(text[i:j]); i = j
    return tokens

def parse_kv_tokens(tokens, idx=0):
    obj = collections.OrderedDict()
    while idx < len(tokens):
        tok = tokens[idx]
        if tok == "}":
            return obj, idx+1
        key = tok; idx += 1
        if idx >= len(tokens):
            obj[key] = ""; return obj, idx
        tok = tokens[idx]
        if tok == "{":
            value, idx = parse_kv_tokens(tokens, idx+1)
        else:
            value = tok; idx += 1
        if key in obj:
            if not isinstance(obj[key], list):
                obj[key] = [obj[key]]
            obj[key].append(value)
        else:
            obj[key] = value
    return obj, idx

def parse_kv_file(path):
    return parse_kv_tokens(tokenize_kv(Path(path).read_text(encoding="utf-8", errors="replace")))[0]

def choose(v):
    return v[-1] if isinstance(v, list) else v

def clean_markup(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\ufeff", "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()

def sanitize_filename(name):
    return re.sub(r'[^a-z0-9_]+','_',name.lower()).strip('_')

def improve_es_line(line):
    replacements = [
        (r'\bDamage Reduction\b', 'reducción de daño'),
        (r'\bCritical Strike Damage\b', 'daño de golpe crítico'),
        (r'\bCritical Strike Chance\b', 'probabilidad de golpe crítico'),
        (r'\bCritical Strike\b', 'golpe crítico'),
        (r'\bAttack Damage\b', 'daño de ataque'),
        (r'\bAbility Damage\b', 'daño de habilidad'),
        (r'\bMovement Speed\b', 'velocidad de movimiento'),
        (r'\bAttack Speed\b', 'velocidad de ataque'),
        (r'\bSpellpower\b', 'poder de hechizo'),
        (r'\bSpellhaste\b', 'celeridad de hechizos'),
        (r'\bSpell Resistance\b', 'resistencia mágica'),
        (r'\bCooldown\b', 'enfriamiento'),
        (r'\bResource cost\b', 'coste de recurso'),
        (r'\bAuto Attacks\b', 'ataques básicos'),
        (r'\bAuto Attack\b', 'ataque básico'),
        (r'\bHealth\b', 'vida'),
        (r'\bMana\b', 'maná'),
        (r'\bArmor\b', 'armadura'),
        (r'\bStrength\b', 'Fuerza'),
        (r'\bAgility\b', 'Agilidad'),
        (r'\bIntellect\b', 'Intelecto'),
        (r'\bHealing\b', 'curación'),
        (r'\bHeal\b', 'cura'),
        (r'\bDamage\b', 'daño'),
        (r'\bPassive\b', 'Pasiva'),
        (r'\bActive\b', 'Activa'),
        (r'\bAutocast\b', 'Autolanzable'),
        (r'\bNo target\b', 'Sin objetivo'),
        (r'\bPoint target\b', 'Objetivo en punto'),
        (r'\bUnit target\b', 'Objetivo de unidad'),
        (r'\bEnemy units\b', 'unidades enemigas'),
        (r'\bAllied units\b', 'unidades aliadas'),
        (r'\bNearby units\b', 'unidades cercanas'),
        (r'\bNearby enemies\b', 'enemigos cercanos'),
        (r'\bFire\b', 'Fuego'),
        (r'\bFrost\b', 'Escarcha'),
        (r'\bNature\b', 'Naturaleza'),
        (r'\bArcane\b', 'Arcano'),
        (r'\bShadow\b', 'Sombra'),
        (r'\bHoly\b', 'Sagrado'),
        (r'\bChaos\b', 'Caos'),
        (r'\bPhysical\b', 'Físico'),
        (r'\bPure\b', 'Puro'),
        (r'\bseconds?\b', 's'),
        (r'\bsecs?\b', 's'),
    ]
    text = line or ""
    for pat, repl in replacements:
        text = re.sub(pat, repl, text)
    return re.sub(r"\s{2,}", " ", text).strip()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repo_dir", nargs="?", default=str(ROOT / "sources" / "Titanbreaker-master"))
    args = parser.parse_args()
    repo = Path(args.repo_dir)
    if not repo.exists():
        raise SystemExit(f"Repository folder not found: {repo}")

    items = parse_js_const(ROOT / "assets" / "data" / "items_data.js", "ITEMS")
    talents = parse_js_const(ROOT / "assets" / "data" / "talents_data.js", "TALENTS")
    heroes = parse_js_const(ROOT / "assets" / "data" / "heroes_data.js", "HEROES")
    hero_details = parse_js_const(ROOT / "assets" / "data" / "heroes_data.js", "HERO_DETAILS")

    loc = parse_kv_file(repo / "game" / "resource" / "addon_english.txt")["lang"]["Tokens"]
    items_kv = parse_kv_file(repo / "game" / "scripts" / "npc" / "npc_items_custom.txt")["DOTAAbilities"]
    heroes_kv = parse_kv_file(repo / "game" / "scripts" / "npc" / "npc_heroes_custom.txt")["DOTAHeroes"]

    repo_pngs = list(repo.rglob("*.png"))
    repo_png_by_name = collections.defaultdict(list)
    for p in repo_pngs:
        repo_png_by_name[p.name.lower()].append(p)

    def copy_repo_image(src: Path, dest_dir: Path, prefix="repo"):
        dest_name = f"{prefix}_{src.name.lower()}"
        dest = dest_dir / dest_name
        if not dest.exists():
            shutil.copy2(src, dest)
        return dest_name

    def find_repo_item_image(code, texture):
        cands = []
        if texture:
            cands += [f"{texture}.png", f"items_{texture}.png"]
            if texture.startswith("item_"):
                cands += [f"{texture[5:]}.png", f"items_{texture[5:]}.png"]
        core = code[5:] if code.startswith("item_") else code
        cands += [f"{code}.png", f"items_{code}.png", f"{core}.png", f"items_{core}.png"]
        for cand in cands:
            hits = repo_png_by_name.get(cand.lower())
            if hits:
                hits = sorted(hits, key=lambda p: (0 if "/images/items/" in str(p).replace("\\", "/") else 1, len(str(p))))
                return hits[0]
        return None

    items_dir = ROOT / "assets" / "images" / "items"
    for item in items:
        if not str(item.get("image", "")).endswith("items_recipe.png"):
            continue
        node = items_kv.get(item["codename"])
        tex = node.get("AbilityTextureName") if isinstance(node, dict) else None
        src = find_repo_item_image(item["codename"], tex)
        if src:
            item["image"] = f"assets/images/items/{copy_repo_image(src, items_dir)}"
        item["descEs"] = [improve_es_line(x) for x in (item.get("descEs") or item.get("descEn") or [])]

    paths_dir = ROOT / "assets" / "images" / "path_trees"
    for talent in talents:
        cand = f"mastery_{talent['id']:03d}_002.png"
        src = None
        for folder in [repo / "content" / "panorama" / "images" / "items", repo / "content" / "panorama" / "images" / "items" / "fixe", repo / "content" / "panorama" / "images" / "items" / "fix"]:
            path = folder / cand
            if path.exists():
                src = path
                break
        if src:
            dest = paths_dir / cand
            if not dest.exists():
                shutil.copy2(src, dest)
            talent["image"] = f"assets/images/path_trees/{cand}"
        if isinstance(talent.get("descEs"), str):
            talent["descEs"] = improve_es_line(talent["descEs"])

    heroicons_dir = repo / "content" / "panorama" / "images" / "custom_game" / "heroicons"
    heroicon_files = list(heroicons_dir.glob("*.png"))
    def norm(s): return re.sub(r'[^a-z0-9]+', '', s.lower())
    heroicon_index = {norm(p.stem): p for p in heroicon_files}
    aliases = {'windrunner':'windrunner','windranger':'windrunner','keeperofthelight':'keeperofthelight','witchdoctor':'witchdoctor','phantomlancer':'phantomlancer','phantomassassin':'phantomassassin','legioncommander':'legioncommander','vengefulspirit':'vengefulspirit','skeletonking':'skeletonking','shadowshaman':'shadowshaman','darkseer':'darkseer','bountyhunter':'bountyhunter'}

    def resolve_hero_name(entry_key, node):
        raw = loc.get(node.get("override_hero", entry_key)) or loc.get(entry_key) or node.get("override_hero", entry_key)
        raw = clean_markup(choose(raw))
        if raw == "Flame Wizard": return "Flame wizard"
        if raw == "Winter Wizard": return "Winter wizard"
        return raw

    raw_rows = []
    for key, node in heroes_kv.items():
        if not isinstance(node, dict): continue
        raw_name = resolve_hero_name(key, node)
        base = node.get("override_hero", key).replace("npc_dota_hero_", "")
        raw_rows.append((raw_name, base))
    counts = collections.Counter(name for name, _ in raw_rows)
    used = collections.Counter()
    resolved = {}
    for raw_name, base in raw_rows:
        final = raw_name
        if counts[raw_name] > 1:
            used[raw_name] += 1
            if used[raw_name] != 1:
                final = f"{raw_name} ({base.replace('_', ' ').title()})"
        resolved[final] = base
    resolved["Elemental Voodoo (Shadow Shaman)"] = "shadow_shaman"

    hero_manual = {
        "[Temple] Witcher": repo / "content" / "panorama" / "images" / "spellicons" / "lion_voodoo.png",
        "[Tank] Terrific Demonslayer": repo / "content" / "panorama" / "images" / "spellicons" / "terrorblade_metamorphosis.png",
    }

    heroes_dir = ROOT / "assets" / "images" / "heroes"
    for hero in heroes:
        base = resolved.get(hero["name"])
        hero["baseHero"] = base
        clean = re.sub(r'^\[[^\]]+\]\s*', '', hero["name"])
        prefix = re.match(r'^\[([^\]]+)\]', hero["name"])
        prefix = prefix.group(1).lower() if prefix else ""
        subgroup = "other"
        if "temple" in prefix: subgroup = "temple"
        elif "healer" in prefix: subgroup = "healer"
        elif "tank" in prefix: subgroup = "tank"
        elif re.search(r'Wizard', clean, re.I): subgroup = "wizard"
        elif re.search(r'Ranger', clean, re.I): subgroup = "ranger"
        elif re.search(r'Cleric', clean, re.I): subgroup = "cleric"
        elif re.search(r'Guardian', clean, re.I): subgroup = "guardian"
        elif re.search(r'Voodoo', clean, re.I): subgroup = "voodoo"
        elif re.search(r'Witcher', clean, re.I): subgroup = "witcher"
        elif re.search(r'Shadowstalker', clean, re.I): subgroup = "shadowstalker"
        elif re.search(r'Demonslayer', clean, re.I): subgroup = "demonslayer"
        elif re.search(r'Deathbringer', clean, re.I): subgroup = "deathbringer"
        elif re.search(r'Crusader', clean, re.I): subgroup = "crusader"
        elif re.search(r'Brawler', clean, re.I): subgroup = "brawler"
        elif re.search(r'Shaolin', clean, re.I): subgroup = "shaolin"
        hero["subgroup"] = subgroup

        src = None
        if base:
            key = aliases.get(norm(base), norm(base))
            src = heroicon_index.get(key)
            if not src:
                matches = [p for p in heroicon_files if key in norm(p.stem) or norm(p.stem) in key]
                src = matches[0] if matches else None
        if not src:
            src = hero_manual.get(hero["name"])
        if src and src.exists():
            dest_name = f"repo_{sanitize_filename(base or hero['name'])}.png"
            dest = heroes_dir / dest_name
            if not dest.exists():
                shutil.copy2(src, dest)
            hero["icon"] = f"assets/images/heroes/{dest_name}"
            hero.pop("iconText", None)

    for detail in hero_details.values():
        for skill in detail.get("skills", []):
            if isinstance(skill.get("desc"), dict):
                skill["desc"]["es"] = [improve_es_line(x) for x in (skill["desc"].get("es") or skill["desc"].get("en") or [])]

    write_js_const(ROOT / "assets" / "data" / "items_data.js", "ITEMS", items)
    write_js_const(ROOT / "assets" / "data" / "talents_data.js", "TALENTS", talents)
    write_js_multi_consts(ROOT / "assets" / "data" / "heroes_data.js", {"HEROES": heroes, "HERO_DETAILS": hero_details})
    print("Visual sync completed.")

if __name__ == "__main__":
    main()
