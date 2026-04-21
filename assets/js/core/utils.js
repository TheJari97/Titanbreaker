window.AppUtils = (function(){
  const rarityOrder = [10,9,8,7,6,5,4,3,2,1,0];
  const rarityNames = {10:{en:'Singularity ML500',es:'Singularidad ML500'},9:{en:'Mythical',es:'Mítico'},8:{en:'Divine',es:'Divino'},7:{en:'Ancient Immortal',es:'Inmortal antiguo'},6:{en:'Singularity ML20',es:'Singularidad ML20'},5:{en:'Immortal',es:'Inmortal'},4:{en:'Ancient Legendary',es:'Legendario antiguo'},3:{en:'Legendary',es:'Legendario'},2:{en:'Epic',es:'Épico'},1:{en:'Rare',es:'Raro'},0:{en:'Common',es:'Común'}};
  const roleOrder = ['general','fighter','assassin','mage','healer','tank'];
  const roleNames = {general:{en:'General',es:'General'},fighter:{en:'Fighter',es:'Peleador'},assassin:{en:'Assassin',es:'Asesino'},mage:{en:'Mage',es:'Mago'},healer:{en:'Healer',es:'Healer'},tank:{en:'Tank',es:'Tank'}};
  const rangeOrder = ['flexible','melee','ranged'];
  const rangeNames = {flexible:{en:'Flexible',es:'Flexible'},melee:{en:'Melee',es:'Melee'},ranged:{en:'Ranged',es:'Rango'}};
  const attrOrder = ['neutral','strength','agility','intelligence'];
  const attrNames = {neutral:{en:'No attribute',es:'Sin atributo'},strength:{en:'Strength',es:'Fuerza'},agility:{en:'Agility',es:'Agilidad'},intelligence:{en:'Intelligence',es:'Inteligencia'}};
  const leadingQualityWords = /^(?:Ancient|Mythical|Divine|Immortal|Legendary|Epic|Rare|Common|Singularity)\s+/i;
  function lang(){ const v=localStorage.getItem('tb_lang') || 'en'; return ['en','es'].includes(v) ? v : 'en'; }
  function t(key){ return (I18N[lang()] && I18N[lang()][key]) || (I18N.en && I18N.en[key]) || key; }
  function stripBrackets(name){ return String(name||'').replace(/\[[^\]]+\]\s*/g,''); }
  function stripQualityWords(name){ let value = String(name || '').trim(); let prev; do { prev = value; value = value.replace(leadingQualityWords, '').trim(); } while (value !== prev); return value; }
  function sanitizeName(name){ return stripQualityWords(stripBrackets(name)).replace(/\s+/g,' ').trim(); }
  function normalizeKey(name){ return sanitizeName(name).toLowerCase(); }
  function descByLang(item, language){ language = language || lang(); if(language==='es') return item.descEs || item.descEn || []; return item.descEn || []; }
  function displayName(item){ return sanitizeName(item.displayName || item.name || ''); }
  function recipeDisplayName(name){ return sanitizeName(name); }
  function rarityName(value, language){ language = language || lang(); return (rarityNames[value] && rarityNames[value][language]) || (rarityNames[value] && rarityNames[value].en) || 'Common'; }
  function roleName(value, language){ language = language || lang(); return (roleNames[value] && roleNames[value][language]) || value; }
  function rangeName(value, language){ language = language || lang(); return (rangeNames[value] && rangeNames[value][language]) || value; }
  function attrName(value, language){ language = language || lang(); return (attrNames[value] && attrNames[value][language]) || value; }
  function searchMatch(text, needle){ const q=String(needle||'').toLowerCase().trim(); if(!q) return true; return String(text||'').toLowerCase().includes(q); }
  function uniq(arr){ return [...new Set(arr)]; }
  function textBlob(item){ return [item.name, item.displayName, item.searchText, ...(item.descEn||[]), ...(item.descEs||[])].filter(Boolean).join(' ').toLowerCase(); }
  function hasAny(text, arr){ return arr.some(v => text.includes(v)); }
  function itemRoles(item){
    const text = textBlob(item); const roles = [];
    if (hasAny(text,['healing','heal ','heals','curación','cura','barrier','aura','mana regeneration','mana regen','healer','support','revive','healing received','curación recibida','blessing'])) roles.push('healer');
    if (hasAny(text,['spellpower','spellhaste','intellect','arcane','fire damage','frost damage','shadow damage','chaos damage','ability damage','mana','wizard','caster','mago','intelecto','poder de hechizo','daño de habilidad','arcano','fuego','escarcha','sombra','caos','staff','wand','book'])) roles.push('mage');
    if (hasAny(text,['critical strike','crit','agility','evasion','backstab','assassin','rogue','shadow gloves','stealth','agilidad','golpe crítico','evasión','asesino','daga','dagger','warglaive','ballista','quiver'])) roles.push('assassin');
    if (hasAny(text,['armor','health','damage block','taunt','aggro','shield','block','spell resistance','vida máxima','armadura','bloqueo de daño','resistencia a hechizos','tank','defender','fortress','guardian'])) roles.push('tank');
    if (hasAny(text,['strength','attack damage','physical damage','lifesteal','life steal','brawler','melee','fuerza','daño de ataque','daño físico','auto attack','ataques automáticos','movement speed','velocidad de ataque','axe','sword','blade','hammer','lance','gloves'])) roles.push('fighter');
    if (hasAny(text,['all attributes','all attribute','todos los atributos','movement speed','cooldown reduction','resource generation','non-mana resource','max resource','spell resistance aura','armor aura','aura','points','ability points'])) roles.push('general');
    if (roles.length === 0) roles.push('general');
    if (roles.length > 1 && !roles.includes('general') && hasAny(text,['all ','todos','aura','resource','movement speed'])) roles.push('general');
    return uniq(roles);
  }
  function itemRange(item){
    const text = textBlob(item);
    if (hasAny(text,['bow','arrow','quiver','ballista','sniper','ranger','warglaive','glaive','projectile','hawk'])) return 'ranged';
    if (hasAny(text,['sword','blade','axe','hammer','mace','lance','gauntlet','gloves','cleaver','dagger','shield','melee','brawler','crusader'])) return 'melee';
    return 'flexible';
  }
  function itemAttribute(item){
    const text = textBlob(item);
    const hasStr = hasAny(text,['strength','fuerza']);
    const hasAgi = hasAny(text,['agility','agilidad']);
    const hasInt = hasAny(text,['intellect','intelecto']);
    const count = [hasStr,hasAgi,hasInt].filter(Boolean).length;
    if (count !== 1) return 'neutral';
    if (hasStr) return 'strength';
    if (hasAgi) return 'agility';
    if (hasInt) return 'intelligence';
    return 'neutral';
  }
  function cloneSet(order){ return new Set(order); }
  function setIsAll(set, order){ return set.size === order.length && order.every(v => set.has(v)); }
  function matchesFilter(value, set, order){ return setIsAll(set, order) || set.has(value); }
  return { rarityOrder, rarityNames, roleOrder, roleNames, rangeOrder, rangeNames, attrOrder, attrNames, lang, t, stripBrackets, stripQualityWords, sanitizeName, normalizeKey, descByLang, displayName, recipeDisplayName, rarityName, roleName, rangeName, attrName, searchMatch, itemRoles, itemRange, itemAttribute, cloneSet, setIsAll, matchesFilter };
})();
