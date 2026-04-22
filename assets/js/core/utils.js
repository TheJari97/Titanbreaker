window.AppUtils = (function(){
  const rarityOrder = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const rarityGroupOrder = ["singularity", "mythical", "divine", "immortal", "legendary", "epic", "rare", "common"];
  const rarityDefinitions = {
    10: { group: "singularity", variant: "ml500", label: { en: "Singularity ML500", es: "Singularity ML500" } },
    9: { group: "mythical", variant: null, label: { en: "Mythical", es: "Mitico" } },
    8: { group: "divine", variant: null, label: { en: "Divine", es: "Divino" } },
    7: { group: "immortal", variant: "ancient", label: { en: "Ancient Immortal", es: "Inmortal Ancient" } },
    6: { group: "singularity", variant: "ml20", label: { en: "Singularity ML20", es: "Singularity ML20" } },
    5: { group: "immortal", variant: null, label: { en: "Immortal", es: "Inmortal" } },
    4: { group: "legendary", variant: "ancient", label: { en: "Ancient Legendary", es: "Legendario Ancient" } },
    3: { group: "legendary", variant: null, label: { en: "Legendary", es: "Legendario" } },
    2: { group: "epic", variant: null, label: { en: "Epic", es: "Epico" } },
    1: { group: "rare", variant: null, label: { en: "Rare", es: "Raro" } },
    0: { group: "common", variant: null, label: { en: "Common", es: "Comun" } }
  };
  const rarityNames = Object.fromEntries(Object.entries(rarityDefinitions).map(([value, def]) => [value, def.label]));
  const rarityGroupKeys = {
    singularity: "rarityGroupSingularity",
    mythical: "rarityGroupMythical",
    divine: "rarityGroupDivine",
    immortal: "rarityGroupImmortal",
    legendary: "rarityGroupLegendary",
    epic: "rarityGroupEpic",
    rare: "rarityGroupRare",
    common: "rarityGroupCommon"
  };
  const rarityVariantKeys = {
    ml500: "rarityVariantMl500",
    ml20: "rarityVariantMl20",
    ancient: "rarityVariantAncient",
    standard: "rarityVariantStandard"
  };
  const roleOrder = ["general", "fighter", "assassin", "mage", "healer", "tank"];
  const roleNames = {
    general: { en: "General", es: "General" },
    fighter: { en: "Fighter", es: "Peleador" },
    assassin: { en: "Assassin", es: "Asesino" },
    mage: { en: "Mage", es: "Mago" },
    healer: { en: "Healer", es: "Healer" },
    tank: { en: "Tank", es: "Tank" }
  };
  const rangeOrder = ["flexible", "melee", "ranged"];
  const rangeNames = {
    flexible: { en: "Flexible", es: "Flexible" },
    melee: { en: "Melee", es: "Melee" },
    ranged: { en: "Ranged", es: "Rango" }
  };
  const attrOrder = ["neutral", "strength", "agility", "intelligence"];
  const attrNames = {
    neutral: { en: "No attribute", es: "Sin atributo" },
    strength: { en: "Strength", es: "Fuerza" },
    agility: { en: "Agility", es: "Agilidad" },
    intelligence: { en: "Intelligence", es: "Inteligencia" }
  };
  const damageTypeOrder = ["fire", "frost", "nature", "arcane", "shadow", "holy", "chaos", "physical", "pure", "none"];
  const damageTypeNames = {
    fire: { en: "Fire", es: "Fuego" },
    frost: { en: "Frost", es: "Hielo" },
    nature: { en: "Nature", es: "Naturaleza" },
    arcane: { en: "Arcane", es: "Arcano" },
    shadow: { en: "Shadow", es: "Sombra" },
    holy: { en: "Holy", es: "Sagrado" },
    chaos: { en: "Chaos", es: "Caos" },
    physical: { en: "Physical", es: "Fisico" },
    pure: { en: "Pure", es: "Puro" },
    none: { en: "No damage type", es: "Sin tipo de dano" }
  };
  const leadingQualityWords = /^(?:Ancient|Mythical|Divine|Immortal|Legendary|Epic|Rare|Common|Singularity)\s+/i;
  const fuzzyTokenMap = {
    gloves: "glove",
    glove: "glove",
    gauntlets: "glove",
    gauntlet: "glove",
    bracers: "bracer",
    bracer: "bracer",
    hood: "headpiece",
    mask: "headpiece",
    helmet: "headpiece",
    headdress: "headpiece",
    faceguard: "headpiece",
    chestplate: "chestpiece",
    chest: "chestpiece",
    cuirass: "chestpiece",
    armor: "chestpiece",
    robe: "chestpiece",
    health: "life",
    life: "life",
    poisoned: "poison",
    poison: "poison",
    wizardy: "wizardry",
    wizar: "wizard",
    hearth: "heart"
  };
  const ignoredTokens = new Set(["of", "the", "and"]);

  function lang(){
    const value = localStorage.getItem("tb_lang") || "en";
    if(typeof I18N !== "undefined" && I18N[value]) return value;
    if(typeof I18N !== "undefined" && I18N.en) return "en";
    const languages = typeof I18N !== "undefined" ? Object.keys(I18N) : [];
    return languages[0] || "en";
  }

  function lookupKey(source, key){
    return String(key || "").split(".").reduce((value, part) => (value && value[part] !== undefined ? value[part] : undefined), source);
  }

  function t(key, language){
    language = language || lang();
    return lookupKey(I18N[language] || {}, key) || lookupKey(I18N.en || {}, key) || key;
  }

  function formatText(key, values, language){
    let text = t(key, language);
    Object.entries(values || {}).forEach(([name, value]) => {
      text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
    });
    return text;
  }

  function translateMap(map, language){
    language = language || lang();
    return (map && map[language]) || (map && map.en) || "";
  }

  function stripBrackets(name){
    return String(name || "").replace(/\[[^\]]+\]\s*/g, "");
  }

  function stripQualityWords(name){
    let value = String(name || "").trim();
    let previous;
    do {
      previous = value;
      value = value.replace(leadingQualityWords, "").trim();
    } while (value !== previous);
    return value;
  }

  function sanitizeName(name){
    return stripQualityWords(stripBrackets(name)).replace(/\s+/g, " ").trim();
  }

  function normalizeKey(name){
    return sanitizeName(name).toLowerCase();
  }

  function aliasName(name){
    const raw = String(name || "").trim();
    if(typeof RECIPE_ALIASES !== "undefined" && RECIPE_ALIASES[raw]) return RECIPE_ALIASES[raw];
    return raw;
  }

  function stemToken(token){
    let value = String(token || "").toLowerCase();
    if(!value || ignoredTokens.has(value)) return "";
    value = fuzzyTokenMap[value] || value;
    if(value.endsWith("ies") && value.length > 4) value = `${value.slice(0, -3)}y`;
    else if(value.endsWith("ed") && value.length > 4) value = value.slice(0, -2);
    else if(value.endsWith("s") && value.length > 3) value = value.slice(0, -1);
    value = fuzzyTokenMap[value] || value;
    return ignoredTokens.has(value) ? "" : value;
  }

  function fuzzyTokens(name){
    return normalizeKey(aliasName(name)).split(/\s+/).map(stemToken).filter(Boolean);
  }

  function descByLang(item, language){
    language = language || lang();
    if(language === "es") return item.descEs || item.descEn || [];
    return item.descEn || [];
  }

  function displayName(item){
    return sanitizeName(item.displayName || item.name || "");
  }

  function recipeDisplayName(name){
    return sanitizeName(aliasName(name));
  }

  function rarityMeta(valueOrItem){
    const rarity = typeof valueOrItem === "number" ? valueOrItem : Number(valueOrItem?.rarity ?? 0);
    const definition = rarityDefinitions[rarity] || rarityDefinitions[0];
    return { rarity, group: definition.group, variant: definition.variant || null };
  }

  function rarityName(value, language){
    language = language || lang();
    return translateMap((rarityNames[value] || rarityNames[0]), language) || "Common";
  }

  function rarityGroupName(groupOrValue, language){
    language = language || lang();
    const group = typeof groupOrValue === "string" ? groupOrValue : rarityMeta(groupOrValue).group;
    return t(rarityGroupKeys[group] || "rarityGroupCommon", language);
  }

  function rarityVariantName(value, language){
    language = language || lang();
    const variant = typeof value === "string" ? value : rarityMeta(value).variant;
    return variant ? t(rarityVariantKeys[variant] || "", language) : "";
  }

  function rarityCardLabel(value, language){
    return rarityVariantName(value, language) || rarityGroupName(value, language);
  }

  function roleName(value, language){
    language = language || lang();
    return translateMap(roleNames[value], language) || value;
  }

  function rangeName(value, language){
    language = language || lang();
    return translateMap(rangeNames[value], language) || value;
  }

  function attrName(value, language){
    language = language || lang();
    return translateMap(attrNames[value], language) || value;
  }

  function damageTypeName(value, language){
    language = language || lang();
    return translateMap(damageTypeNames[value], language) || value;
  }

  function searchMatch(text, needle){
    const query = String(needle || "").toLowerCase().trim();
    if(!query) return true;
    return String(text || "").toLowerCase().includes(query);
  }

  function uniq(values){
    return [...new Set(values)];
  }

  function textBlob(item){
    return [item.name, item.displayName, item.searchText, ...(item.descEn || []), ...(item.descEs || [])].filter(Boolean).join(" ").toLowerCase();
  }

  function hasAny(text, values){
    return values.some(value => text.includes(value));
  }

  function itemRoles(item){
    const text = textBlob(item);
    const roles = [];
    if(hasAny(text, ["healing", "heal ", "heals", "curacion", "cura", "barrier", "aura", "mana regeneration", "mana regen", "healer", "support", "revive", "healing received", "curacion recibida", "blessing"])) roles.push("healer");
    if(hasAny(text, ["spellpower", "spellhaste", "intellect", "arcane", "fire damage", "frost damage", "shadow damage", "chaos damage", "ability damage", "mana", "wizard", "caster", "mago", "intelecto", "poder de hechizo", "dano de habilidad", "arcano", "fuego", "escarcha", "sombra", "caos", "staff", "wand", "book"])) roles.push("mage");
    if(hasAny(text, ["critical strike", "crit", "agility", "evasion", "backstab", "assassin", "rogue", "shadow gloves", "stealth", "agilidad", "golpe critico", "evasion", "asesino", "daga", "dagger", "warglaive", "ballista", "quiver"])) roles.push("assassin");
    if(hasAny(text, ["armor", "health", "damage block", "taunt", "aggro", "shield", "block", "spell resistance", "vida maxima", "armadura", "bloqueo de dano", "resistencia a hechizos", "tank", "defender", "fortress", "guardian"])) roles.push("tank");
    if(hasAny(text, ["strength", "attack damage", "physical damage", "lifesteal", "life steal", "brawler", "melee", "fuerza", "dano de ataque", "dano fisico", "auto attack", "ataques automaticos", "movement speed", "velocidad de ataque", "axe", "sword", "blade", "hammer", "lance", "gloves"])) roles.push("fighter");
    if(hasAny(text, ["all attributes", "all attribute", "todos los atributos", "movement speed", "cooldown reduction", "resource generation", "non-mana resource", "max resource", "spell resistance aura", "armor aura", "aura", "points", "ability points"])) roles.push("general");
    if(!roles.length) roles.push("general");
    if(roles.length > 1 && !roles.includes("general") && hasAny(text, ["all ", "todos", "aura", "resource", "movement speed"])) roles.push("general");
    return uniq(roles);
  }

  function itemRange(item){
    const text = textBlob(item);
    if(hasAny(text, ["bow", "arrow", "quiver", "ballista", "sniper", "ranger", "warglaive", "glaive", "projectile", "hawk"])) return "ranged";
    if(hasAny(text, ["sword", "blade", "axe", "hammer", "mace", "lance", "gauntlet", "gloves", "cleaver", "dagger", "shield", "melee", "brawler", "crusader"])) return "melee";
    return "flexible";
  }

  function itemAttribute(item){
    const text = textBlob(item);
    const hasStrength = hasAny(text, ["strength", "fuerza"]);
    const hasAgility = hasAny(text, ["agility", "agilidad"]);
    const hasIntelligence = hasAny(text, ["intellect", "intelecto"]);
    const count = [hasStrength, hasAgility, hasIntelligence].filter(Boolean).length;
    if(count !== 1) return "neutral";
    if(hasStrength) return "strength";
    if(hasAgility) return "agility";
    if(hasIntelligence) return "intelligence";
    return "neutral";
  }

  function itemDamageTypes(item){
    const text = textBlob(item);
    const found = [];
    const checks = [
      ["fire", ["fire damage", " de fuego", "fuego", "flame", "burn damage"]],
      ["frost", ["frost damage", "escarcha", "hielo", "ice ", "frost "]],
      ["nature", ["nature damage", "naturaleza", "nature "]],
      ["arcane", ["arcane damage", "arcano", "arcane "]],
      ["shadow", ["shadow damage", "sombra", "shadow "]],
      ["holy", ["holy damage", "sagrado", "holy "]],
      ["chaos", ["chaos damage", "caos", "chaos "]],
      ["physical", ["physical damage", "fisico", "physical "]],
      ["pure", ["pure damage", "puro", "pure "]]
    ];
    for(const [key, terms] of checks){
      if(hasAny(text, terms)) found.push(key);
    }
    return found.length ? uniq(found) : ["none"];
  }

  function itemActs(){
    return [];
  }

  function itemKey(item){
    return item ? (item.codename || normalizeKey(displayName(item))) : "";
  }

  function fuzzyFindItem(name){
    const targetTokens = fuzzyTokens(name);
    if(!targetTokens.length) return null;
    const targetSet = new Set(targetTokens);
    let best = null;
    let bestScore = 0;
    for(const item of (ITEMS || [])){
      const candidateTokens = fuzzyTokens(displayName(item));
      if(!candidateTokens.length) continue;
      const candidateSet = new Set(candidateTokens);
      let shared = 0;
      targetSet.forEach(token => {
        if(candidateSet.has(token)) shared += 1;
      });
      if(!shared) continue;
      const score = shared / Math.max(targetSet.size, candidateSet.size);
      const adjusted = candidateTokens[0] === targetTokens[0] ? score + 0.1 : score;
      if(adjusted > bestScore){
        bestScore = adjusted;
        best = item;
      }
    }
    return bestScore >= 0.66 ? best : null;
  }

  function findItemByName(name){
    const raw = String(name || "").trim();
    if(!raw) return null;
    const aliased = aliasName(raw);
    const attempts = uniq([raw, aliased, recipeDisplayName(raw), stripBrackets(raw), stripQualityWords(raw), sanitizeName(raw), sanitizeName(aliased)]).filter(Boolean);
    for(const candidate of attempts){
      const target = normalizeKey(candidate);
      const exact = (ITEMS || []).find(item => normalizeKey(displayName(item)) === target || normalizeKey(item.name || "") === target || String(item.codename || "") === candidate);
      if(exact) return exact;
    }
    for(const candidate of attempts){
      const target = normalizeKey(candidate);
      const partial = (ITEMS || []).find(item => normalizeKey(displayName(item)).includes(target) || target.includes(normalizeKey(displayName(item))));
      if(partial) return partial;
    }
    return fuzzyFindItem(aliased) || fuzzyFindItem(raw) || null;
  }

  function maxSkillRank(skill){
    const lines = [...(skill.desc?.en || []), ...(skill.desc?.es || [])];
    let max = 1;
    for(const line of lines){
      const match = String(line).match(/Rank\s*(\d+)/i);
      if(match) max = Math.max(max, Number(match[1]));
    }
    return max;
  }

  function cloneSet(order){
    return new Set(order);
  }

  function setIsAll(set, order){
    return set && set.size === order.length && order.every(value => set.has(value));
  }

  function filterIsInactive(set){
    return !set || set.size === 0;
  }

  function matchesFilter(value, set){
    return filterIsInactive(set) || set.has(value);
  }

  return {
    rarityOrder,
    rarityGroupOrder,
    rarityNames,
    roleOrder,
    roleNames,
    rangeOrder,
    rangeNames,
    attrOrder,
    attrNames,
    damageTypeOrder,
    damageTypeNames,
    lang,
    t,
    formatText,
    translateMap,
    stripBrackets,
    stripQualityWords,
    sanitizeName,
    normalizeKey,
    descByLang,
    displayName,
    aliasName,
    recipeDisplayName,
    rarityName,
    rarityGroupName,
    rarityVariantName,
    rarityCardLabel,
    roleName,
    rangeName,
    attrName,
    damageTypeName,
    searchMatch,
    itemRoles,
    itemRange,
    itemAttribute,
    itemDamageTypes,
    itemActs,
    rarityMeta,
    itemKey,
    findItemByName,
    maxSkillRank,
    cloneSet,
    setIsAll,
    filterIsInactive,
    matchesFilter
  };
})();
