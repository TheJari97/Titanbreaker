#!/usr/bin/env python3
import json, re, html, urllib.request, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE_DATA = ROOT / "assets" / "data"
SITE_JSON = ROOT / "assets" / "json"
ITEM_IMG_DIR = ROOT / "assets" / "images" / "items"
HERO_IMG_DIR = ROOT / "assets" / "images" / "heroes"
BLACKLIST_PATH = ROOT / "tools" / "catzee_blacklist.json"

URLS = {
    "items_kv": "https://raw.githubusercontent.com/Catzee/Titanbreaker/master/game/scripts/npc/npc_items_custom.txt",
    "abilities_kv": "https://raw.githubusercontent.com/Catzee/Titanbreaker/master/game/scripts/npc/npc_abilities_custom.txt",
    "heroes_kv": "https://raw.githubusercontent.com/Catzee/Titanbreaker/master/game/scripts/npc/npc_heroes_custom.txt",
    "loc_items": "https://raw.githubusercontent.com/Catzee/Titanbreaker/master/game/resource/addon_english.txt",
    "loc_panorama": "https://raw.githubusercontent.com/Catzee/Titanbreaker/master/game/panorama/localization/addon_english.txt",
}
CACHE_FILES = {
    "items_kv": ROOT / "tools" / "cache" / "items_kv.txt",
    "abilities_kv": ROOT / "tools" / "cache" / "abilities_kv.txt",
    "heroes_kv": ROOT / "tools" / "cache" / "heroes_kv.txt",
    "loc_items": ROOT / "tools" / "cache" / "loc_items.txt",
    "loc_panorama": ROOT / "tools" / "cache" / "loc_panorama.txt",
}

def fetch_text(key: str) -> str:
    url = URLS[key]
    cache_path = CACHE_FILES[key]
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            text = response.read().decode("utf-8", errors="replace")
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(text, encoding="utf-8")
        return text
    except Exception:
        if cache_path.exists():
            return cache_path.read_text(encoding="utf-8", errors="replace")
        raise

def strip_comments(text: str) -> str:
    out = []
    i = 0
    in_str = False
    esc = False
    while i < len(text):
        ch = text[i]
        if in_str:
            out.append(ch)
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            i += 1
            continue
        if ch == '"':
            in_str = True
            out.append(ch)
            i += 1
            continue
        if ch == "/" and i + 1 < len(text) and text[i + 1] == "/":
            while i < len(text) and text[i] not in "\r\n":
                i += 1
            continue
        out.append(ch)
        i += 1
    return "".join(out)

def tokenize_kv(text: str):
    text = strip_comments(text)
    tokens = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch.isspace():
            i += 1
            continue
        if ch in "{}":
            tokens.append(ch)
            i += 1
            continue
        if ch == '"':
            i += 1
            buf = []
            esc = False
            while i < len(text):
                ch = text[i]
                if esc:
                    buf.append("\n" if ch == "n" else "\t" if ch == "t" else ch)
                    esc = False
                else:
                    if ch == "\\":
                        esc = True
                    elif ch == '"':
                        i += 1
                        break
                    else:
                        buf.append(ch)
                i += 1
            tokens.append("".join(buf))
            continue
        j = i
        while j < len(text) and (not text[j].isspace()) and text[j] not in "{}":
            j += 1
        tokens.append(text[i:j])
        i = j
    return tokens

def parse_kv_tokens(tokens, idx=0):
    obj = collections.OrderedDict()
    while idx < len(tokens):
        tok = tokens[idx]
        if tok == "}":
            return obj, idx + 1
        key = tok
        idx += 1
        if idx >= len(tokens):
            obj[key] = ""
            return obj, idx
        tok = tokens[idx]
        if tok == "{":
            value, idx = parse_kv_tokens(tokens, idx + 1)
        else:
            value = tok
            idx += 1
        if key in obj:
            if not isinstance(obj[key], list):
                obj[key] = [obj[key]]
            obj[key].append(value)
        else:
            obj[key] = value
    return obj, idx

def parse_kv(text: str):
    return parse_kv_tokens(tokenize_kv(text))[0]

def parse_js_const(path: Path, var_name: str):
    text = path.read_text(encoding="utf-8")
    marker = f"const {var_name} = "
    start = text.find(marker)
    if start < 0:
        raise ValueError(f"Missing {var_name} in {path}")
    start += len(marker)
    opener = text[start]
    closer = {"[": "]", "{": "}"}[opener]
    depth = 0
    in_str = False
    esc = False
    quote = None
    for i, ch in enumerate(text[start:], start=start):
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == quote:
                in_str = False
        else:
            if ch in ("'", '"'):
                in_str = True
                quote = ch
            elif ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    return json.loads(text[start:i + 1])
    raise ValueError(f"Unclosed literal for {var_name} in {path}")

def choose_loc_value(value):
    return value[-1] if isinstance(value, list) else value

def clean_markup_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\ufeff", "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</h\d>", "\n", text, flags=re.I)
    text = re.sub(r"<h\d[^>]*>", "", text, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"<p[^>]*>", "", text, flags=re.I)
    text = re.sub(r"</font>", "", text, flags=re.I)
    text = re.sub(r"<font[^>]*>", "", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text).replace("\r", "")
    text = text.replace("%%", "%")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def extract_placeholder_values(node: dict):
    values = {}
    ability_values = node.get("AbilityValues")
    if isinstance(ability_values, dict):
        for key, value in ability_values.items():
            if isinstance(value, str):
                values.setdefault(key, value)
    ability_special = node.get("AbilitySpecial")
    if isinstance(ability_special, dict):
        for _, block in ability_special.items():
            if not isinstance(block, dict):
                continue
            for key, value in block.items():
                if key in {"var_type", "LinkedSpecialBonus", "ad_linked_ability", "RequiresScepter"}:
                    continue
                if isinstance(value, str):
                    values.setdefault(key, value)
    return values

PLACEHOLDER_RE = re.compile(r"%([A-Za-z0-9_]+)%")
def resolve_text(text: str, values: dict) -> str:
    if not text:
        return ""
    text = PLACEHOLDER_RE.sub(lambda m: str(values.get(m.group(1), m.group(0))), text)
    return clean_markup_text(text)

def strip_rarity_prefix(name: str) -> str:
    return re.sub(r"^\[[^\]]+\]\s*", "", name or "").strip()

def infer_rarity(name: str, quality: str, current=None):
    if current:
        return current["rarity"], current.get("rarityEn", "Common"), current.get("rarityEs", "Común"), current.get("rarityPt", current.get("rarityEn", "Common"))
    prefix = ""
    m = re.match(r"^\[([^\]]+)\]", name or "")
    if m:
        prefix = m.group(1).strip().lower()
    by_prefix = {
        "rare": (1, "Rare", "Raro"),
        "epic": (2, "Epic", "Épico"),
        "legendary": (3, "Legendary", "Legendario"),
        "ancient legendary": (4, "Ancient Legendary", "Legendario antiguo"),
        "immortal": (5, "Immortal", "Inmortal"),
        "ancient": (7, "Ancient Immortal", "Ancient Immortal"),
        "divine": (8, "Divine", "Divino"),
        "mythical": (9, "Mythical", "Mítico"),
        "singularity": (10, "Singularity ML500", "Singularidad ML500"),
    }
    if prefix in by_prefix:
        n, en, es = by_prefix[prefix]
        return n, en, es, en
    by_quality = {
        "common": (0, "Common", "Común"),
        "component": (0, "Common", "Común"),
        "consumable": (0, "Common", "Común"),
        "rare": (1, "Rare", "Raro"),
        "epic": (2, "Epic", "Épico"),
        "artifact": (8, "Divine", "Divino"),
        "secret_shop": (7, "Ancient Immortal", "Ancient Immortal"),
    }
    n, en, es = by_quality.get((quality or "").lower(), (0, "Common", "Común"))
    return n, en, es, en

def normalize_desc_lines(text: str):
    return [line.strip() for line in (text or "").split("\n") if line.strip()]

def translate_behavior(behavior):
    b = (behavior or "").upper()
    if "PASSIVE" in b:
        return {"en": "Passive", "es": "Pasiva", "pt": "Passiva"}
    if "AUTOCAST" in b:
        return {"en": "Autocast", "es": "Autolanzable", "pt": "Autolançável"}
    if "TOGGLE" in b:
        return {"en": "Toggle", "es": "Alternable", "pt": "Alternável"}
    if "NO_TARGET" in b:
        return {"en": "No target", "es": "Sin objetivo", "pt": "Sem alvo"}
    if "POINT" in b:
        return {"en": "Point target", "es": "Punto objetivo", "pt": "Alvo no ponto"}
    if "UNIT_TARGET" in b:
        return {"en": "Unit target", "es": "Unidad objetivo", "pt": "Alvo em unidade"}
    return {"en": "Active", "es": "Activa", "pt": "Ativa"}

def translate_target(team, unit_type, behavior):
    team = (team or "").upper()
    behavior = (behavior or "").upper()
    if "NO_TARGET" in behavior:
        return {"en": "Nearby units", "es": "Unidades cercanas", "pt": "Unidades próximas"}
    if team == "DOTA_UNIT_TARGET_TEAM_ENEMY":
        return {"en": "Enemy units", "es": "Unidades enemigas", "pt": "Unidades inimigas"}
    if team == "DOTA_UNIT_TARGET_TEAM_FRIENDLY":
        return {"en": "Allied units", "es": "Unidades aliadas", "pt": "Unidades aliadas"}
    if team == "DOTA_UNIT_TARGET_TEAM_BOTH":
        return {"en": "Allied and enemy units", "es": "Unidades aliadas y enemigas", "pt": "Unidades aliadas e inimigas"}
    return {"en": "Units", "es": "Unidades", "pt": "Unidades"}

def translate_damage(damage_type):
    d = (damage_type or "").upper()
    if "PHYSICAL" in d:
        return {"en": "Physical", "es": "Físico", "pt": "Físico"}
    if "MAGICAL" in d:
        return {"en": "Magical", "es": "Mágico", "pt": "Mágico"}
    if "PURE" in d:
        return {"en": "Pure", "es": "Puro", "pt": "Puro"}
    return {"en": "Mixed", "es": "Mixto", "pt": "Misto"}

def format_costs(node: dict) -> str:
    values = []
    for key in ("AbilityManaCost", "AbilityCooldown", "AbilityCastRange"):
        value = node.get(key)
        if not value or str(value).strip() in {"0", "0.0", "0 0 0 0", "0 0 0 0 0"}:
            continue
        values.append(str(value).strip())
    return " / ".join(values) if values else "—"

def load_project_data():
    return (
        parse_js_const(SITE_DATA / "items_data.js", "ITEMS"),
        parse_js_const(SITE_DATA / "crafts_data.js", "CRAFTS"),
        parse_js_const(SITE_DATA / "talents_data.js", "TALENTS"),
        parse_js_const(SITE_DATA / "heroes_data.js", "HEROES"),
    )

def hero_icon_for(name, raw_name, base_hero, current_hero):
    if current_hero:
        if "icon" in current_hero:
            return {"icon": current_hero["icon"]}
        if "iconText" in current_hero:
            return {"iconText": current_hero["iconText"]}
    explicit = {
        "Flame wizard": "assets/images/heroes/heroes_flame_wizard_icon.png",
        "Winter wizard": "assets/images/heroes/heroes_winter_wizard_icon.png",
        "Jungle Ranger": "assets/images/heroes/heroes_jungle_ranger_icon.png",
        "Snow Ranger": "assets/images/heroes/heroes_snow_ranger_icon.png",
        "Fanatic Crusader": "assets/images/heroes/heroes_fanatic_crusader_icon.png",
    }
    if raw_name in explicit:
        return {"icon": explicit[raw_name]}
    base_icons = {
        "npc_dota_hero_lina": "assets/images/heroes/lina_icon.png",
        "npc_dota_hero_crystal_maiden": "assets/images/heroes/crystal_maiden_icon.png",
        "npc_dota_hero_windrunner": "assets/images/heroes/windranger_icon.png",
    }
    if base_hero in base_icons:
        return {"icon": base_icons[base_hero]}
    initials = "".join(word[0] for word in re.findall(r"[A-Za-z]+", strip_rarity_prefix(name))[:2]).upper()[:2] or name[:2].upper()
    return {"iconText": initials}

def main():
    blacklist = json.loads(BLACKLIST_PATH.read_text(encoding="utf-8"))
    excluded_repo_only = set(blacklist.get("exclude_repo_only_items", []))

    current_items, current_crafts, current_talents, current_heroes = load_project_data()
    current_items_by_code = {item["codename"]: item for item in current_items}
    current_heroes_by_name = {hero["name"]: hero for hero in current_heroes}
    item_images = {path.name for path in ITEM_IMG_DIR.glob("*")}

    items_kv = parse_kv(fetch_text("items_kv"))["DOTAAbilities"]
    abilities_kv = parse_kv(fetch_text("abilities_kv"))["DOTAAbilities"]
    heroes_kv = parse_kv(fetch_text("heroes_kv"))["DOTAHeroes"]
    loc = parse_kv(fetch_text("loc_items"))["lang"]["Tokens"]
    pan_loc = parse_kv(fetch_text("loc_panorama"))["addon"]["Tokens"]

    repo_items_by_code = {}
    for code, node in items_kv.items():
        if not isinstance(node, dict):
            continue
        raw_name = choose_loc_value(loc.get(f"DOTA_Tooltip_ability_{code}"))
        if not raw_name:
            continue
        repo_items_by_code[code] = {
            "codename": code,
            "name": clean_markup_text(raw_name),
            "quality": node.get("ItemQuality"),
            "texture": node.get("AbilityTextureName"),
        }

    def find_local_item_image(code, texture, current=None):
        if current and current.get("image"):
            return current["image"]
        candidates = []
        if texture:
            candidates.extend([f"items_{texture}.png", f"{texture}.png"])
            if texture.startswith("item_"):
                candidates.append(f"items_{texture[5:]}.png")
        candidates.extend([f"{code}.png", f"items_{code}.png"])
        for candidate in candidates:
            if candidate in item_images:
                return f"assets/images/items/{candidate}"
        return "assets/images/items/items_recipe.png"

    updated_items = []
    seen_codes = set()
    for current in current_items:
        code = current["codename"]
        repo = repo_items_by_code.get(code)
        if not repo:
            updated_items.append(current)
            seen_codes.add(code)
            continue
        values = extract_placeholder_values(items_kv[code])
        name = resolve_text(choose_loc_value(loc.get(f"DOTA_Tooltip_ability_{code}", current["name"])), values) or current["name"]
        desc_en = normalize_desc_lines(resolve_text(choose_loc_value(loc.get(f"DOTA_Tooltip_ability_{code}_Description", "")), values))
        if not desc_en:
            desc_en = current.get("descEn", [])
        changed = (current.get("name") != name) or (current.get("descEn", []) != desc_en)
        rarity, rarity_en, rarity_es, rarity_pt = infer_rarity(name, repo["quality"], current=current)
        item = {
            "codename": code,
            "rarity": rarity,
            "rarityEs": rarity_es,
            "rarityEn": rarity_en,
            "name": name,
            "descEn": desc_en,
            "descEs": desc_en if changed else current.get("descEs", desc_en),
            "image": find_local_item_image(code, repo["texture"], current=current),
            "descPt": desc_en if changed else current.get("descPt", desc_en),
            "displayName": strip_rarity_prefix(name) or current.get("displayName") or name,
        }
        item["searchText"] = " ".join(filter(None, [item["displayName"], item["name"], code, " ".join(item["descEn"]), " ".join(item["descEs"]), " ".join(item["descPt"])]))
        updated_items.append(item)
        seen_codes.add(code)

    for code in sorted(set(repo_items_by_code) - seen_codes):
        if code in excluded_repo_only:
            continue
        repo = repo_items_by_code[code]
        values = extract_placeholder_values(items_kv[code])
        name = resolve_text(choose_loc_value(loc.get(f"DOTA_Tooltip_ability_{code}", "")), values)
        if not name:
            continue
        desc_en = normalize_desc_lines(resolve_text(choose_loc_value(loc.get(f"DOTA_Tooltip_ability_{code}_Description", "")), values))
        rarity, rarity_en, rarity_es, rarity_pt = infer_rarity(name, repo["quality"], current=None)
        item = {
            "codename": code,
            "rarity": rarity,
            "rarityEs": rarity_es,
            "rarityEn": rarity_en,
            "name": name,
            "descEn": desc_en,
            "descEs": desc_en,
            "image": find_local_item_image(code, repo["texture"], current=None),
            "descPt": desc_en,
            "displayName": strip_rarity_prefix(name),
        }
        item["searchText"] = " ".join(filter(None, [item["displayName"], item["name"], code, " ".join(item["descEn"])]))
        updated_items.append(item)

    updated_items_by_display = {item["displayName"]: item for item in updated_items}

    updated_crafts = []
    for craft in current_crafts:
        entry = dict(craft)
        result_item = updated_items_by_display.get(craft["result"])
        if result_item:
            entry["image"] = result_item["image"]
            entry["rarity"] = result_item["rarity"]
            entry["rarityEn"] = result_item["rarityEn"]
            entry["rarityEs"] = result_item["rarityEs"]
            entry["rarityPt"] = result_item.get("rarityPt", result_item["rarityEn"])
        components_data = []
        for name in craft.get("components", []):
            item = updated_items_by_display.get(name)
            if item:
                components_data.append({"name": name, "image": item["image"], "rarity": item["rarity"]})
            else:
                existing = next((row for row in craft.get("componentsData", []) if row.get("name") == name), None)
                components_data.append(existing or {"name": name, "image": "assets/images/items/items_recipe.png", "rarity": 0})
        entry["componentsData"] = components_data
        updated_crafts.append(entry)

    updated_talents = []
    for current in current_talents:
        token = choose_loc_value(pan_loc.get(f"talent{current['id']}") or pan_loc.get(f"Talent{current['id']}"))
        if not token:
            updated_talents.append(current)
            continue
        token = clean_markup_text(token)
        name, desc = token.split(":", 1) if ":" in token else (token, "")
        name, desc = name.strip(), desc.strip()
        changed = current.get("name") != name or current.get("desc") != desc
        entry = dict(current)
        entry["name"] = name
        entry["desc"] = desc
        entry["descEs"] = desc if changed else current.get("descEs", desc)
        updated_talents.append(entry)

    def resolve_hero_name(entry_key, node):
        raw = loc.get(node.get("override_hero", entry_key)) or loc.get(entry_key) or node.get("override_hero", entry_key)
        raw = clean_markup_text(choose_loc_value(raw))
        if raw == "Flame Wizard":
            return "Flame wizard"
        if raw == "Winter Wizard":
            return "Winter wizard"
        return raw

    raw_hero_entries = []
    for key, node in heroes_kv.items():
        if not isinstance(node, dict):
            continue
        raw_name = resolve_hero_name(key, node)
        base = node.get("override_hero", key).replace("npc_dota_hero_", "").replace("_", " ").title()
        raw_hero_entries.append((key, node, raw_name, base))

    name_counts = collections.Counter(name for _, _, name, _ in raw_hero_entries)
    used_counter = collections.Counter()
    resolved_names = {}
    for key, node, raw_name, base in raw_hero_entries:
        final_name = raw_name
        if name_counts[raw_name] > 1:
            used_counter[raw_name] += 1
            if raw_name in current_heroes_by_name and used_counter[raw_name] == 1:
                final_name = raw_name
            else:
                final_name = f"{raw_name} ({base})"
        resolved_names[key] = final_name

    def translate_attr(attr):
        return {
            "DOTA_ATTRIBUTE_STRENGTH": "strength",
            "DOTA_ATTRIBUTE_AGILITY": "agility",
            "DOTA_ATTRIBUTE_INTELLECT": "intelligence",
            "DOTA_ATTRIBUTE_INTELLIGENCE": "intelligence",
        }.get(attr, "strength")

    def ability_name(key):
        value = loc.get(f"DOTA_Tooltip_Ability_{key}") or loc.get(f"DOTA_Tooltip_ability_{key}")
        return resolve_text(choose_loc_value(value), {}) if value else key

    def ability_desc_lines(key, node):
        values = extract_placeholder_values(node)
        desc = loc.get(f"DOTA_Tooltip_Ability_{key}_Description") or loc.get(f"DOTA_Tooltip_ability_{key}_Description")
        lines = normalize_desc_lines(resolve_text(choose_loc_value(desc), values))
        if not lines:
            lines = ["Description pending from repository."]
        for idx in range(10):
            note = loc.get(f"DOTA_Tooltip_Ability_{key}_Note{idx}") or loc.get(f"DOTA_Tooltip_ability_{key}_Note{idx}")
            if note:
                lines.append(resolve_text(choose_loc_value(note), values))
        return lines

    def talent_text(key):
        value = loc.get(f"DOTA_Tooltip_Ability_{key}") or loc.get(f"DOTA_Tooltip_ability_{key}") or key or "—"
        value = clean_markup_text(choose_loc_value(value))
        return {"en": value, "es": value, "pt": value}

    def is_real_ability(key):
        return bool(key) and not str(key).startswith("empty_spell") and key != "generic_hidden"

    def subtitle(attr, skill_count):
        en = {"strength": "Strength", "agility": "Agility", "intelligence": "Intelligence"}[attr]
        es = {"strength": "Fuerza", "agility": "Agilidad", "intelligence": "Inteligencia"}[attr]
        pt = {"strength": "Força", "agility": "Agilidade", "intelligence": "Inteligência"}[attr]
        return {
            "en": f"Auto-synced {en} hero from the Catzee repository. {skill_count} skill entries imported from KV data.",
            "es": f"Héroe de {es} sincronizado automáticamente desde el repositorio de Catzee. Se importaron {skill_count} habilidades desde los archivos KV.",
            "pt": f"Herói de {pt} sincronizado automaticamente do repositório do Catzee. {skill_count} habilidades foram importadas dos arquivos KV.",
        }

    heroes = []
    hero_details = collections.OrderedDict()
    for key, node in heroes_kv.items():
        if not isinstance(node, dict):
            continue
        raw_name = resolve_hero_name(key, node)
        final_name = resolved_names[key]
        attr = translate_attr(node.get("AttributePrimary"))
        real_abilities = [node.get(f"Ability{i}") for i in range(1, 7)]
        real_abilities = [ability for ability in real_abilities if is_real_ability(ability)]
        current_hero = current_heroes_by_name.get(raw_name) or current_heroes_by_name.get(final_name)
        entry = {"name": final_name, "attr": attr, "status": "ready" if len(real_abilities) >= 4 else "coming"}
        entry.update(hero_icon_for(final_name, raw_name, node.get("override_hero"), current_hero))
        heroes.append(entry)

        talents = []
        bonus_keys = [node.get(f"Ability{i}") for i in range(10, 18)]
        for row, level in enumerate((10, 15, 20, 25)):
            left_key = bonus_keys[row * 2] if row * 2 < len(bonus_keys) else None
            right_key = bonus_keys[row * 2 + 1] if row * 2 + 1 < len(bonus_keys) else None
            talents.append({"level": level, "left": talent_text(left_key), "right": talent_text(right_key)})

        skills = []
        for ability_key in real_abilities:
            ability_node = abilities_kv.get(ability_key, {})
            skills.append({
                "name": ability_name(ability_key),
                "level": "1",
                "type": translate_behavior(ability_node.get("AbilityBehavior")),
                "target": translate_target(ability_node.get("AbilityUnitTargetTeam"), ability_node.get("AbilityUnitTargetType"), ability_node.get("AbilityBehavior")),
                "damage": translate_damage(ability_node.get("AbilityUnitDamageType")),
                "costs": format_costs(ability_node),
                "desc": {
                    "en": ability_desc_lines(ability_key, ability_node),
                    "es": ability_desc_lines(ability_key, ability_node),
                    "pt": ability_desc_lines(ability_key, ability_node),
                },
            })

        hero_details[final_name] = {
            "name": final_name,
            "subtitle": subtitle(attr, len(skills)),
            "skills": skills,
            "talents": talents,
        }

    preferred_order = ["Fanatic Crusader", "Arctic Deathbringer", "Flame wizard", "Winter wizard", "Jungle Ranger", "Snow Ranger"]
    def hero_sort_key(hero):
        return (0, preferred_order.index(hero["name"])) if hero["name"] in preferred_order else (1, hero["name"].lower())
    heroes = sorted(heroes, key=hero_sort_key)

    SITE_DATA.joinpath("items_data.js").write_text(f"const ITEMS = {json.dumps(updated_items, ensure_ascii=False)};\n", encoding="utf-8")
    SITE_DATA.joinpath("crafts_data.js").write_text(f"const CRAFTS = {json.dumps(updated_crafts, ensure_ascii=False)};\n", encoding="utf-8")
    SITE_DATA.joinpath("talents_data.js").write_text(f"const TALENTS = {json.dumps(updated_talents, ensure_ascii=False)};\n", encoding="utf-8")
    SITE_DATA.joinpath("heroes_data.js").write_text(
        f"const HEROES = {json.dumps(heroes, ensure_ascii=False)};\nconst HERO_DETAILS = {json.dumps(hero_details, ensure_ascii=False)};\n",
        encoding="utf-8",
    )

    SITE_JSON.joinpath("items.json").write_text(json.dumps(updated_items, ensure_ascii=False, indent=2), encoding="utf-8")
    SITE_JSON.joinpath("crafts.json").write_text(json.dumps(updated_crafts, ensure_ascii=False, indent=2), encoding="utf-8")
    SITE_JSON.joinpath("path_talents.json").write_text(json.dumps(updated_talents, ensure_ascii=False, indent=2), encoding="utf-8")
    SITE_JSON.joinpath("heroes.json").write_text(json.dumps({"heroes": heroes, "details": hero_details}, ensure_ascii=False, indent=2), encoding="utf-8")

    report = {
        "items_before": len(current_items),
        "items_after": len(updated_items),
        "items_repo_overlap": sum(1 for item in current_items if item["codename"] in repo_items_by_code),
        "items_repo_only_added": len(updated_items) - len(current_items),
        "talents_before": len(current_talents),
        "talents_after": len(updated_talents),
        "heroes_after": len(heroes),
        "hero_details_after": len(hero_details),
        "excluded_repo_only_items": sorted(excluded_repo_only),
    }
    ROOT.joinpath("tools", "last_sync_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Update completed.")
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
