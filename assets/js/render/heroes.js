window.RenderHeroes = (function(){
  const HERO_TABS = ['overview','abilities','talents','equipment'];

  function l(es,en){ return AppUtils.lang()==='es' ? es : en; }
  function heroIcon(hero){ return hero.icon ? `<img src="${hero.icon}" alt="${hero.name}">` : hero.iconText; }


  function heroCombatType(heroName){
    return /Ranger|Wizard/i.test(heroName) ? 'ranged' : 'melee';
  }
  function heroClassTag(heroName){
    if(/Ranger/i.test(heroName)) return 'Ranger';
    if(/Wizard/i.test(heroName)) return 'Wizard';
    if(/Crusader/i.test(heroName)) return 'Crusader';
    if(/Deathbringer/i.test(heroName)) return 'Deathbringer';
    return 'Hero';
  }
  function heroRoleTag(heroName){
    if(/Ranger/i.test(heroName)) return 'assassin';
    if(/Wizard/i.test(heroName)) return 'mage';
    if(/Crusader/i.test(heroName)) return 'fighter';
    if(/Deathbringer/i.test(heroName)) return 'tank';
    return 'general';
  }
  function heroAttrTag(attr){
    return attr === 'strength' ? 'strength' : attr === 'agility' ? 'agility' : 'intelligence';
  }
  function parseStatLine(line){
    const clean = String(line||'').replace(/<[^>]+>/g,'').trim();
    const m = clean.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ' %]+?)\s*:\s*([+\-]?\d+(?:\.\d+)?)(?:\b|$)/);
    if(!m) return null;
    const label = m[1].trim();
    const value = Number(m[2]);
    if(Number.isNaN(value)) return null;
    return {label, value};
  }
  function aggregateEquipment(heroName){
    const eq = ensureHeroEquipment(heroName);
    const items = eq.map(key => (ITEMS||[]).find(it=>AppUtils.itemKey(it)===key || it.codename===key)).filter(Boolean);
    const totals = new Map();
    const extras = [];
    items.forEach(item => {
      AppUtils.descByLang(item).forEach(line => {
        const clean = String(line||'').replace(/<[^>]+>/g,'').trim();
        if(!clean) return;
        const parsed = parseStatLine(clean);
        if(parsed){
          totals.set(parsed.label, (totals.get(parsed.label) || 0) + parsed.value);
        } else {
          extras.push({item: AppUtils.displayName(item), text: clean});
        }
      });
    });
    const uniqueExtras = [];
    const seen = new Set();
    extras.forEach(entry => {
      const key = `${entry.item}__${entry.text}`;
      if(seen.has(key)) return;
      seen.add(key);
      uniqueExtras.push(entry);
    });
    return {items, totals:[...totals.entries()].sort((a,b)=>a[0].localeCompare(b[0])), extras: uniqueExtras};
  }
  function currentHeroLevels(heroName){ return AppState.heroSkillLevels[heroName] || []; }
  function ensureHeroBuild(heroName){
    const hero = HERO_DETAILS[heroName];
    if(!hero) return [];
    if(!AppState.heroSkillLevels[heroName]) AppState.heroSkillLevels[heroName] = hero.skills.map((_, idx) => idx===0 ? 1 : 0);
    if(!AppState.heroEquipment[heroName]) AppState.heroEquipment[heroName] = new Array(6).fill(null);
    return AppState.heroSkillLevels[heroName];
  }
  function ensureHeroEquipment(heroName){
    if(!AppState.heroEquipment[heroName]) AppState.heroEquipment[heroName] = new Array(6).fill(null);
    return AppState.heroEquipment[heroName];
  }
  function resetHeroState(heroName, opts={}){
    const hero = HERO_DETAILS[heroName];
    if(!hero) return;
    const keepView = opts.keepView ? AppState.heroView : 'overview';
    AppState.heroSkillLevels = {};
    AppState.heroTalentChoices = {};
    AppState.heroExtraSkillPoints = 0;
    AppState.heroView = keepView;
    AppState.heroEquipmentSearch = '';
    AppState.heroActiveSlot = null;
    AppState.heroEquipment = {};
    AppState.heroSkillLevels[heroName] = hero.skills.map((_, idx) => idx===0 ? 1 : 0);
    AppState.heroEquipment[heroName] = new Array(6).fill(null);
  }
  function totalPoints(levels){ return levels.reduce((sum,val)=>sum+val,0); }
  function totalAvailable(){ return 14 + Math.min(17, Math.max(0, AppState.heroExtraSkillPoints || 0)); }

  function selectHero(name){
    const h = HEROES.find(x=>x.name===name);
    if(!(h && h.status==='ready')){ AppState.selectedHero = null; render(); return; }
    if(AppState.selectedHero !== name) resetHeroState(name);
    AppState.selectedHero = name;
    ensureHeroBuild(name);
    ensureHeroEquipment(name);
    render();
  }
  function setHeroView(view){ if(HERO_TABS.includes(view)){ AppState.heroView=view; render(); } }
  function pickTalent(level, side){ AppState.heroTalentChoices[level] = AppState.heroTalentChoices[level]===side ? null : side; render(); }
  function changeSkill(heroName, idx, delta){
    const hero = HERO_DETAILS[heroName]; if(!hero) return;
    const levels = ensureHeroBuild(heroName);
    const maxRank = AppUtils.maxSkillRank(hero.skills[idx]);
    const minRank = idx===0 ? 1 : 0;
    const next = levels[idx] + delta;
    const spent = totalPoints(levels);
    if(delta>0 && spent>=totalAvailable()) return;
    if(next<minRank || next>maxRank) return;
    levels[idx]=next; render();
  }
  function adjustExtra(delta){
    AppState.heroExtraSkillPoints = Math.max(0, Math.min(17, (AppState.heroExtraSkillPoints||0) + delta));
    const hero = AppState.selectedHero ? HERO_DETAILS[AppState.selectedHero] : null;
    if(hero){
      const levels=ensureHeroBuild(hero.name);
      while(totalPoints(levels) > totalAvailable()){
        for(let i=levels.length-1; i>=0 && totalPoints(levels)>totalAvailable(); i--){
          const minRank=i===0?1:0; if(levels[i]>minRank) levels[i]-=1;
        }
      }
    }
    render();
  }
  function resetBuild(heroName){ const currentView = AppState.heroView; resetHeroState(heroName, {keepView:true}); AppState.heroView = currentView; AppState.selectedHero = heroName; render(); }

  function splitSkillLines(skill){
    const lines = skill.desc[AppUtils.lang()] || skill.desc.en || [];
    const base=[], ranks=[], stats=[];
    lines.forEach(line => {
      const clean = String(line||'').trim(); if(!clean) return;
      if(/^Rank\s*\d+/i.test(clean)) ranks.push(clean);
      else if(/^(Intellect|Spellpower|Duration|Radius|Chance|Max|Slow|Stun|Elemental|Ice Bolt|Deepfrost|Damage|Fator|Daño|Duración|Radio|Probabilidad|Máx\.|Factor|Factor de|Daño por|Dano por|Fator de|Crit chance|Instant Ice|Duration on enemies|Intelecto|Velocidad|Armadura|Resistencia|Probabilidad)/i.test(clean)) stats.push(clean);
      else base.push(clean);
    });
    return {base, ranks, stats};
  }
  function skillTooltip(heroName, idx){
    const hero=HERO_DETAILS[heroName]; if(!hero) return '';
    const skill=hero.skills[idx]; const currentLevel=(currentHeroLevels(heroName)[idx]||0);
    const parts=splitSkillLines(skill);
    const baseBlock = parts.base.length ? `<div class="tooltip-section tooltip-section-desc ${currentLevel===1?'tooltip-section-current':''}"><div class="tooltip-section-title">${l('Descripción base','Base description')}</div><ul>${parts.base.map(line=>`<li>${line}</li>`).join('')}</ul></div>`:'';
    const currentRankLabel = currentLevel===0 ? l('Unlearned','Unlearned') : `${l('Rango','Rank')} ${currentLevel}`;
    const ranksBlock = parts.ranks.length ? `<div class="tooltip-section tooltip-section-effects"><div class="tooltip-section-title">${l('Rangos','Ranks')} <span class="current-rank-pill">${currentRankLabel}</span></div><div class="hero-rank-list">${parts.ranks.map(line=>{ const m=line.match(/^Rank\s*(\d+)/i); const rank=m?Number(m[1]):0; const text=line.replace(/^Rank\s*\d+\s*:?\s*/i,''); return `<div class="hero-rank-card ${rank===currentLevel?'is-current':''}"><div class="rank-badge">${l('Rango','Rank')} ${rank}</div><div>${text}</div></div>`; }).join('')}</div></div>`:'';
    const statsBlock = parts.stats.length ? `<div class="tooltip-section tooltip-section-stats"><div class="tooltip-section-title">${l('Escalados y detalles','Scaling and details')}</div><div class="tooltip-stat-grid">${parts.stats.map(line=>`<div class="tooltip-stat-row">${line}</div>`).join('')}</div></div>`:'';
    return `<div class="tooltip-head"><div class="hero-icon" style="width:70px;height:70px;border-radius:16px">${heroIcon(HEROES.find(h=>h.name===heroName)||{name:heroName,iconText:heroName.slice(0,2)})}</div><div><div class="tooltip-title">${skill.name}</div><div class="tooltip-sub">${skill.type[AppUtils.lang()]||skill.type.en} · ${skill.target[AppUtils.lang()]||skill.target.en} · ${skill.damage[AppUtils.lang()]||skill.damage.en}</div></div></div>${baseBlock}${ranksBlock}${statsBlock}`;
  }
  function skillCard(heroName, skill, idx, currentLevel, attr){
    const maxRank=AppUtils.maxSkillRank(skill);
    return `<div class="skill-card skill-${attr} hover-skill" data-hero="${heroName.replace(/"/g,'&quot;')}" data-skill="${idx}"><div class="skill-top"><div><div class="skill-title">${skill.name}</div><div class="skill-type">${skill.type[AppUtils.lang()]||skill.type.en}</div></div><div class="skill-level-pill ${currentLevel===0?'unlearned':''}">${currentLevel===0?l('Sin puntos','Unlearned'):`${l('Rango','Rank')} ${currentLevel}`}</div></div><div class="skill-controls"><button class="skill-btn minus" data-hero-skill="${idx}" data-delta="-1" ${currentLevel <= (idx===0?1:0)?'disabled':''}>−</button><div class="skill-current">${currentLevel} / ${maxRank}</div><button class="skill-btn plus" data-hero-skill="${idx}" data-delta="1" ${currentLevel >= maxRank ? 'disabled':''}>+</button></div></div>`;
  }

  function heroTabsMarkup(){
    const labels={overview:l('Información','Overview'), abilities:l('Habilidades','Abilities'), talents:l('Talentos','Talents'), equipment:l('Equipamiento','Equipment')};
    return `<div class="hero-subnav">${HERO_TABS.map(tab=>`<button class="hero-subtab ${AppState.heroView===tab?'active':''}" data-hero-view="${tab}">${labels[tab]}</button>`).join('')}</div>`;
  }
  function overviewPanel(heroName, heroData, attr){
    const combat = heroCombatType(heroName);
    const role = heroRoleTag(heroName);
    const chips = [
      `<span class="mini-badge role-badge role-${role}">${AppUtils.roleName(role)}</span>`,
      `<span class="mini-badge filter-badge filter-range">${AppUtils.rangeName(combat)}</span>`,
      `<span class="mini-badge filter-badge filter-attr">${AppUtils.attrName(heroAttrTag(attr))}</span>`,
      `<span class="mini-badge vivid-badge">${heroClassTag(heroName)}</span>`
    ].join('');
    const talentSummary = heroData.talents.map(t => {
      const side = AppState.heroTalentChoices[t.level];
      if(!side) return `<div class="summary-row"><span>Lv ${t.level}</span><span class="tooltip-sub">${l('Sin elegir','Not chosen')}</span></div>`;
      const entry = side==='left' ? t.left : t.right;
      return `<div class="summary-row"><span>Lv ${t.level}</span><strong>${entry[AppUtils.lang()]||entry.en}</strong></div>`;
    }).join('');
    return `<section class="hero-panel hero-panel-overview"><div class="hero-summary-grid"><div class="summary-card"><div class="summary-title">${l('Perfil','Profile')}</div><p>${(heroData.subtitle && (heroData.subtitle[AppUtils.lang()]||heroData.subtitle.en)) || ''}</p><div class="tooltip-badge-row" style="margin-top:12px">${chips}</div></div><div class="summary-card"><div class="summary-title">${l('Talentos elegidos','Chosen talents')}</div>${talentSummary}</div></div></section>`;
  }
  function abilitiesPanel(heroName, heroData, attr){
    const levels=ensureHeroBuild(heroName);
    return `<section class="hero-panel"><div class="build-summary compact"><div class="hero-build-meta"><strong>${l('Plan de habilidades','Skill planner')}</strong><span class="tooltip-sub">${l('La primera habilidad empieza aprendida. Ajusta puntos extra solo si tu personaje tiene más.','The first skill starts learned. Adjust extra points only if your character has more.')}</span></div><div class="hero-extra-control"><span>${l('Puntos extra','Extra points')}</span><button class="btn hero-mini-btn" id="heroExtraMinus">-</button><span class="mini-badge vivid-badge">${AppState.heroExtraSkillPoints}</span><button class="btn hero-mini-btn" id="heroExtraPlus">+</button></div></div><div class="skills-grid">${heroData.skills.map((s,idx)=>skillCard(heroName,s,idx,levels[idx]||0,attr)).join('')}</div></section>`;
  }
  function talentsPanel(heroData){
    return `<section class="hero-panel"><div class="talent-choice">${heroData.talents.map(t=>`<div class="tier"><button class="tier-btn ${AppState.heroTalentChoices[t.level]==='left'?'active':''}" data-tier="${t.level}" data-side="left">${t.left[AppUtils.lang()]||t.left.en}</button><div class="tier-lvl">${t.level}</div><button class="tier-btn ${AppState.heroTalentChoices[t.level]==='right'?'active':''}" data-tier="${t.level}" data-side="right">${t.right[AppUtils.lang()]||t.right.en}</button></div>`).join('')}</div></section>`;
  }
  function availableEquipmentItems(query){
    const q=(query||'').trim().toLowerCase();
    const eq = AppState.selectedHero ? ensureHeroEquipment(AppState.selectedHero) : [];
    const activeKey = Number.isInteger(AppState.heroActiveSlot) ? eq[AppState.heroActiveSlot] : null;
    const used = new Set(eq.filter(Boolean).filter(key => key !== activeKey));
    return (RenderItems.getFilteredItems ? RenderItems.getFilteredItems() : ITEMS).filter(item=>{
      if(used.has(AppUtils.itemKey(item))) return false;
      if(!q) return true;
      return `${AppUtils.displayName(item)} ${(item.searchText||'')}`.toLowerCase().includes(q);
    }).sort((a,b)=> (b.rarity-a.rarity) || AppUtils.displayName(a).localeCompare(AppUtils.displayName(b))).slice(0,120);
  }
  function setEquipmentSlot(index){ AppState.heroActiveSlot=index; render(); }
  function clearEquipmentSlot(heroName,index){ const eq=ensureHeroEquipment(heroName); eq[index]=null; AppState.heroActiveSlot=index; render(); }
  function pickEquipment(heroName, itemKey){
    const eq=ensureHeroEquipment(heroName); const item=(ITEMS||[]).find(it=>AppUtils.itemKey(it)===itemKey || it.codename===itemKey);
    if(!item) return;
    const normalized = AppUtils.itemKey(item);
    const duplicateIndex = eq.findIndex((key, idx) => key===normalized && idx!==AppState.heroActiveSlot);
    if(duplicateIndex !== -1) return;
    let slot = Number.isInteger(AppState.heroActiveSlot) ? AppState.heroActiveSlot : eq.findIndex(v=>!v);
    if(slot<0) slot=0;
    eq[slot]=normalized;
    AppState.heroActiveSlot = slot;
    render();
  }
  function equipmentPanel(heroName){
    const eq=ensureHeroEquipment(heroName);
    const items = availableEquipmentItems(AppState.heroEquipmentSearch);
    const summary = aggregateEquipment(heroName);
    const activeSlotLabel = Number.isInteger(AppState.heroActiveSlot) ? `#${AppState.heroActiveSlot+1}` : l('ninguno','none');
    return `<section class="hero-panel"><div class="equipment-toolbar"><div class="count-badge">${eq.filter(Boolean).length} / 6 ${l('items equipados','items equipped')}</div><button class="btn" id="resetEquipmentBtn">${l('Limpiar equipo','Clear equipment')}</button></div><div class="equipment-layout"><div><div class="equipment-slots">${eq.map((key, idx)=>{ const item = key ? ITEMS.find(it=>AppUtils.itemKey(it)===key || it.codename===key) : null; return `<button class="equipment-slot ${AppState.heroActiveSlot===idx?'active':''} ${item?`r${item.rarity}`:''} hover-equip-slot" data-slot="${idx}" data-item-key="${item?AppUtils.itemKey(item):''}">${item ? `<div class="slot-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="slot-name">${AppUtils.displayName(item)}</div><div class="slot-actions"><span class="mini-badge filter-badge">${AppUtils.rarityName(item.rarity)}</span><span class="slot-remove" data-clear-slot="${idx}">×</span></div>` : `<div class="slot-empty">${l('Slot vacío','Empty slot')}</div>`}</button>`; }).join('')}</div>${Number.isInteger(AppState.heroActiveSlot) ? `<div class="equipment-picker"><div class="equipment-picker-head"><strong>${l('Seleccionando slot','Selecting slot')} ${activeSlotLabel}</strong><div class="equip-search-wrap"><input id="heroEquipSearch" class="search-input hero-equip-search" type="search" value="${(AppState.heroEquipmentSearch||'').replace(/"/g,'&quot;')}" placeholder="${l('Buscar item...','Search item...')}"></div></div><div class="equipment-browser">${items.map(item=>`<article class="equip-option hover-equip-option r${item.rarity}" data-equip-item="${AppUtils.itemKey(item)}"><div class="equip-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="equip-name">${AppUtils.displayName(item)}</div><div class="equip-meta"><span class="mini-badge vivid-badge">${AppUtils.rarityName(item.rarity)}</span></div></article>`).join('')}</div></div>` : `<div class="hero-empty-inline">${l('Haz click en un slot para elegir un item.','Click a slot to choose an item.')}</div>`}</div><aside class="equipment-summary"><div class="summary-title">${l('Estadísticas del equipamiento','Equipment stats')}</div>${summary.totals.length ? `<div class="equip-stat-list">${summary.totals.map(([label,val])=>`<div class="equip-stat-row"><span>${label}</span><strong>${val>0?'+':''}${val}</strong></div>`).join('')}</div>` : `<div class="tooltip-sub">${l('Aún no has equipado items.','No items equipped yet.')}</div>`}${summary.extras && summary.extras.length ? `<div class="equip-extra-list">${summary.extras.map(entry=>`<div class="equip-extra-card"><strong>${entry.item}</strong><ul><li>${entry.text}</li></ul></div>`).join('')}</div>` : ``}</aside></div></section>`;
  }

  function render(){
    const root=document.getElementById('pageRoot');
    const groups={intelligence:[], agility:[], strength:[]}; HEROES.forEach(h=>groups[h.attr].push(h));
    const panels=['intelligence','agility','strength'].map(attr=>`<section class="attr-panel attr-panel-${attr}"><div class="attr-head"><span class="attr-orb orb-${attr==='intelligence'?'int':attr==='agility'?'agi':'str'}"></span>${AppUtils.t(attr)}</div><div class="hero-list">${groups[attr].map(h=>`<div class="hero-chip hero-chip-${attr} ${AppState.selectedHero===h.name?'active':''}" data-hero="${h.name.replace(/"/g,'&quot;')}"><div class="hero-icon">${heroIcon(h)}</div><div><div class="name" style="font-weight:900">${h.name}</div><div class="hero-chip-tags"><span class="mini-badge filter-badge filter-range">${AppUtils.rangeName(heroCombatType(h.name))}</span><span class="mini-badge filter-badge filter-attr">${AppUtils.attrName(heroAttrTag(h.attr))}</span><span class="mini-badge vivid-badge">${heroClassTag(h.name)}</span></div><div class="tooltip-sub">${h.status==='coming'?AppUtils.t('comingSoon'):''}</div></div><div class="tooltip-sub">${AppState.selectedHero===h.name?AppUtils.t('selected'):''}</div></div>`).join('')}</div></section>`).join('');
    let detail=''; const hero=AppState.selectedHero ? HERO_DETAILS[AppState.selectedHero] : null;
    if(hero){
      const heroMeta = HEROES.find(h=>h.name===hero.name);
      const heroAttr = heroMeta?.attr || 'intelligence';
      const tabs = heroTabsMarkup();
      let panelHtml='';
      if(AppState.heroView==='overview') panelHtml = overviewPanel(hero.name, hero, heroAttr);
      else if(AppState.heroView==='abilities') panelHtml = abilitiesPanel(hero.name, hero, heroAttr);
      else if(AppState.heroView==='talents') panelHtml = talentsPanel(hero);
      else panelHtml = equipmentPanel(hero.name);
      detail = `<div class="hero-detail hero-detail-${heroAttr}"><div class="hero-detail-frame"><div class="hero-detail-head"><div class="hero-icon">${heroIcon(heroMeta)}</div><div><div style="font-size:28px;font-weight:900">${hero.name}</div><div class="tooltip-sub hero-subline">${(hero.subtitle && (hero.subtitle[AppUtils.lang()]||hero.subtitle.en)) || ''}</div><div class="tooltip-badge-row hero-detail-tags"><span class="mini-badge filter-badge filter-range">${AppUtils.rangeName(heroCombatType(hero.name))}</span><span class="mini-badge filter-badge filter-attr">${AppUtils.attrName(heroAttrTag(heroAttr))}</span><span class="mini-badge vivid-badge">${heroClassTag(hero.name)}</span><span class="mini-badge role-badge role-${heroRoleTag(hero.name)}">${AppUtils.roleName(heroRoleTag(hero.name))}</span></div></div><div class="hero-head-actions"><button class="btn hero-reset-btn" id="resetBuildBtn">${AppUtils.t('resetBuild')}</button></div></div>${tabs}${panelHtml}</div></div>`;
    } else {
      detail = `<div class="hero-empty-state section-card"><div class="catalog-label">${l('Configura tu héroe','Configure your hero')}</div><h2>${l('Selecciona un héroe listo para empezar','Select a ready hero to begin')}</h2><p>${l('Aquí podrás revisar su información general, planear habilidades, elegir talentos y preparar su equipamiento de 6 items.','Here you can review general information, plan abilities, choose talents and prepare a 6-item equipment setup.')}</p></div>`;
    }
    root.innerHTML = `<div class="hero-groups">${panels}</div>${detail}`;
    root.querySelectorAll('.hero-chip').forEach(el=>el.onclick=()=>selectHero(el.dataset.hero));
    root.querySelectorAll('[data-hero-view]').forEach(el=>el.onclick=()=>setHeroView(el.dataset.heroView));
    root.querySelectorAll('.tier-btn').forEach(el=>el.onclick=()=>pickTalent(el.dataset.tier, el.dataset.side));
    root.querySelectorAll('[data-hero-skill]').forEach(el=>el.onclick=(e)=>{ e.stopPropagation(); changeSkill(AppState.selectedHero, Number(el.dataset.heroSkill), Number(el.dataset.delta)); });
    const reset=document.getElementById('resetBuildBtn'); if(reset) reset.onclick=()=>resetBuild(AppState.selectedHero);
    const plus=document.getElementById('heroExtraPlus'); if(plus) plus.onclick=()=>adjustExtra(1);
    const minus=document.getElementById('heroExtraMinus'); if(minus) minus.onclick=()=>adjustExtra(-1);
    const equipSearch = document.getElementById('heroEquipSearch'); if(equipSearch) equipSearch.oninput=(e)=>{ AppState.heroEquipmentSearch=e.target.value; render(); };
    const resetEquip = document.getElementById('resetEquipmentBtn'); if(resetEquip) resetEquip.onclick=()=>{ AppState.heroEquipment[AppState.selectedHero]=new Array(6).fill(null); AppState.heroActiveSlot=null; render(); };
    root.querySelectorAll('[data-slot]').forEach(el=>el.onclick=(e)=>{ if(e.target.closest('[data-clear-slot]')) return; setEquipmentSlot(Number(el.dataset.slot)); });
    root.querySelectorAll('[data-clear-slot]').forEach(el=>el.onclick=(e)=>{ e.stopPropagation(); clearEquipmentSlot(AppState.selectedHero, Number(el.dataset.clearSlot)); });
    root.querySelectorAll('[data-equip-item]').forEach(el=>el.onclick=()=>pickEquipment(AppState.selectedHero, el.dataset.equipItem));
    CommonUI.bindHover('.hover-skill', el=>skillTooltip(el.dataset.hero, Number(el.dataset.skill)));
    CommonUI.bindHover('.hover-equip-option', el=>{ const item=(ITEMS||[]).find(it=>AppUtils.itemKey(it)===el.dataset.equipItem || it.codename===el.dataset.equipItem); return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : ''; });
    CommonUI.bindHover('.hover-equip-slot', el=>{ if(!el.dataset.itemKey) return ''; const item=(ITEMS||[]).find(it=>AppUtils.itemKey(it)===el.dataset.itemKey || it.codename===el.dataset.itemKey); return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : ''; });
  }
  return { render };
})();
