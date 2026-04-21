window.AppUtils = (function(){
  const rarityOrder = [10,9,8,7,6,5,4,3,2,1,0];
  const rarityNames = {10:{en:'Singularity ML500',es:'Singularidad ML500'},9:{en:'Mythical',es:'Mítico'},8:{en:'Divine',es:'Divino'},7:{en:'Ancient Immortal',es:'Inmortal antiguo'},6:{en:'Singularity ML20',es:'Singularidad ML20'},5:{en:'Immortal',es:'Inmortal'},4:{en:'Ancient Legendary',es:'Legendario antiguo'},3:{en:'Legendary',es:'Legendario'},2:{en:'Epic',es:'Épico'},1:{en:'Rare',es:'Raro'},0:{en:'Common',es:'Común'}};
  const roleOrder = ['general','fighter','assassin','mage','healer','tank'];
  const roleNames = {
    general:{en:'General',es:'General'},
    fighter:{en:'Fighter',es:'Peleador'},
    assassin:{en:'Assassin',es:'Asesino'},
    mage:{en:'Mage',es:'Mago'},
    healer:{en:'Healer',es:'Healer'},
    tank:{en:'Tank',es:'Tank'}
  };
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
  function searchMatch(text, needle){ const q=String(needle||'').toLowerCase().trim(); if(!q) return true; return String(text||'').toLowerCase().includes(q); }
  function uniq(arr){ return [...new Set(arr)]; }
  function textBlob(item){
    return [item.name, item.displayName, item.searchText, ...(item.descEn||[]), ...(item.descEs||[])]
      .filter(Boolean).join(' ').toLowerCase();
  }
  function itemRoles(item){
    const text = textBlob(item);
    const roles = [];
    const has = (...keys) => keys.some(key => text.includes(key));
    if (has('healing','heal ','heals','curación','cura','barrier','aura','mana regeneration','mana regen','healer','support','revive','healing received','curación recibida')) roles.push('healer');
    if (has('spellpower','spellhaste','intellect','arcane','fire damage','frost damage','shadow damage','chaos damage','ability damage','mana','wizard','caster','mago','intelecto','poder de hechizo','daño de habilidad','arcano','fuego','escarcha','sombra','caos')) roles.push('mage');
    if (has('critical strike','crit','agility','evasion','backstab','assassin','rogue','shadow gloves','stealth','agilidad','golpe crítico','evasión','asesino','daga','dagger','attack speed')) roles.push('assassin');
    if (has('armor','health','damage block','taunt','aggro','shield','block','spell resistance','vida máxima','armadura','bloqueo de daño','resistencia a hechizos','tank','defender')) roles.push('tank');
    if (has('strength','attack damage','physical damage','lifesteal','life steal','brawler','melee','fuerza','daño de ataque','daño físico','auto attack','ataques automáticos','movement speed','velocidad de ataque')) roles.push('fighter');
    if (has('all attributes','all attribute','todos los atributos','movement speed','cooldown reduction','resource generation','non-mana resource','max resource','spell resistance aura','armor aura','aura', 'points', 'ability points')) roles.push('general');
    if (roles.length === 0) roles.push('general');
    if (roles.length > 1 && !roles.includes('general') && has('all ','todos','aura','resource','movement speed')) roles.push('general');
    return uniq(roles);
  }
  return { rarityOrder, rarityNames, roleOrder, roleNames, lang, t, stripBrackets, stripQualityWords, sanitizeName, normalizeKey, descByLang, displayName, recipeDisplayName, rarityName, roleName, searchMatch, itemRoles };
})();
