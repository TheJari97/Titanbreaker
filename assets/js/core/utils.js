window.AppUtils = (function(){
  const rarityOrder = [10,9,8,7,6,5,4,3,2,1,0];
  const rarityNames = {10:{en:'Singularity ML500',es:'Singularidad ML500'},9:{en:'Mythical',es:'Mítico'},8:{en:'Divine',es:'Divino'},7:{en:'Ancient Immortal',es:'Inmortal antiguo'},6:{en:'Singularity ML20',es:'Singularidad ML20'},5:{en:'Immortal',es:'Inmortal'},4:{en:'Ancient Legendary',es:'Legendario antiguo'},3:{en:'Legendary',es:'Legendario'},2:{en:'Epic',es:'Épico'},1:{en:'Rare',es:'Raro'},0:{en:'Common',es:'Común'}};
  const leadingQualityWords = /^(?:Ancient|Mythical|Divine|Immortal|Legendary|Epic|Rare|Common|Singularity)\s+/i;
  function lang(){ const v=localStorage.getItem('tb_lang') || 'en'; return ['en','es'].includes(v) ? v : 'en'; }
  function t(key){ return (I18N[lang()] && I18N[lang()][key]) || (I18N.en && I18N.en[key]) || key; }
  function stripBrackets(name){ return String(name||'').replace(/\[[^\]]+\]\s*/g,''); }
  function stripQualityWords(name){
    let value = String(name || '').trim();
    let prev;
    do {
      prev = value;
      value = value.replace(leadingQualityWords, '').trim();
    } while (value !== prev);
    return value;
  }
  function sanitizeName(name){
    return stripQualityWords(stripBrackets(name)).replace(/\s+/g,' ').trim();
  }
  function normalizeKey(name){ return sanitizeName(name).toLowerCase(); }
  function descByLang(item, language){ language = language || lang(); if(language==='es') return item.descEs || item.descEn || []; return item.descEn || []; }
  function displayName(item){ return sanitizeName(item.displayName || item.name || ''); }
  function recipeDisplayName(name){ return sanitizeName(name); }
  function rarityName(value, language){ language = language || lang(); return (rarityNames[value] && rarityNames[value][language]) || (rarityNames[value] && rarityNames[value].en) || 'Common'; }
  function searchMatch(text, needle){ const q=String(needle||'').toLowerCase().trim(); if(!q) return true; return String(text||'').toLowerCase().includes(q); }
  return { rarityOrder, rarityNames, lang, t, stripBrackets, stripQualityWords, sanitizeName, normalizeKey, descByLang, displayName, recipeDisplayName, rarityName, searchMatch };
})();
