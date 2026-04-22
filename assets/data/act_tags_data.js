(function(){
  const manual = {
    'Temple Shard':[13],
    'Moonstone':[13],
    'Titan Blood':[13],
    'Cain\'s Family Armor':[13],
    'Cain\'s Family Legacy':[13],
    'Cain\'s Family Amulet':[13],
    'Cain\'s Family Treads':[13],
    'Cain\'s Family Bible':[13]
  };
  function norm(name){ return String(name||'').replace(/\[[^\]]+\]\s*/g,'').replace(/\s+/g,' ').trim().toLowerCase(); }
  const byName = {};
  Object.keys(manual).forEach(name => byName[norm(name)] = manual[name]);
  ITEMS.forEach(item => {
    const key = norm(item.displayName || item.name);
    let acts = byName[key] || [];
    if(!acts.length){
      const raw = String(item.name||'');
      const clean = String(item.displayName||item.name||'');
      if((/\[(Ancient|Mythical|Divine)\]/i.test(raw) || item.rarity >= 7) && /set|moonstone|titan blood|temple shard|legacy/i.test(clean)) acts=[13];
    }
    if(acts.length) item.acts = acts;
  });
})();
