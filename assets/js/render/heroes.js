window.RenderHeroes = (function(){
  const HERO_TABS = ['overview','abilities','talents','equipment'];

  function l(es,en){ return AppUtils.lang()==='es' ? es : en; }
  function heroIcon(hero){ return hero.icon ? `<img src="${hero.icon}" alt="${hero.name}">` : hero.iconText; }

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
  function resetHeroState(heroName){
    const hero = HERO_DETAILS[heroName];
    if(!hero) return;
    AppState.heroSkillLevels = {};
    AppState.heroTalentChoices = {};
    AppState.heroExtraSkillPoints = 0;
    AppState.heroView = 'overview';
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
  function resetBuild(heroName){ resetHeroState(heroName); AppState.selectedHero = heroName; render(); }

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
    const baseBlock = parts.base.length ? `<div class="tooltip-section tooltip-section-desc ${currentLevel===1?'tooltip-section-current':''}"><div class="tooltip-section-title">${l('Descripción base','Base description')}${currentLevel===1?` <span class="current-rank-pill">${l('Rango actual','Current rank')}: 1</span>`:''}</div><ul>${parts.base.map(line=>`<li>${line}</li>`).join('')}</ul></div>`:'';
    const currentRankLabel = currentLevel===0 ? l('Sin puntos','Unlearned') : String(currentLevel);
    const ranksBlock = parts.ranks.length ? `<div class="tooltip-section tooltip-section-effects"><div class="tooltip-section-title">${l('Rangos','Ranks')} <span class="current-rank-pill">${l('Actual','Current')}: ${currentRankLabel}</span></div><div class="hero-rank-list">${parts.ranks.map(line=>{ const m=line.match(/^Rank\s*(\d+)/i); const rank=m?Number(m[1]):0; const text=line.replace(/^Rank\s*\d+\s*:?\s*/i,''); return `<div class="hero-rank-card ${rank===currentLevel?'is-current':''}"><div class="rank-badge">Rank ${rank}</div><div>${text}</div></div>`; }).join('')}</div></div>`:'';
    const statsBlock = parts.stats.length ? `<div class="tooltip-section tooltip-section-stats"><div class="tooltip-section-title">${l('Escalados y detalles','Scaling and details')}</div><div class="tooltip-stat-grid">${parts.stats.map(line=>`<div class="tooltip-stat-row">${line}</div>`).join('')}</div></div>`:'';
    return `<div class="tooltip-head"><div class="hero-icon" style="width:70px;height:70px;border-radius:16px">${heroIcon(HEROES.find(h=>h.name===heroName)||{name:heroName,iconText:heroName.slice(0,2)})}</div><div><div class="tooltip-title">${skill.name}</div><div class="tooltip-sub">${skill.type[AppUtils.lang()]||skill.type.en} · ${skill.target[AppUtils.lang()]||skill.target.en} · ${skill.damage[AppUtils.lang()]||skill.damage.en}</div></div></div>${baseBlock}${ranksBlock}${statsBlock}`;
  }
  function skillCard(heroName, skill, idx, currentLevel, attr){
    const maxRank=AppUtils.maxSkillRank(skill);
    return `<div class="skill-card skill-${attr} hover-skill" data-hero="${heroName.replace(/"/g,'&quot;')}" data-skill="${idx}"><div class="skill-top"><div><div class="skill-title">${skill.name}</div><div class="skill-type">${skill.type[AppUtils.lang()]||skill.type.en}</div></div><div class="skill-level-pill">${currentLevel===0?l('Sin puntos','Unlearned'):`${l('Rango','Rank')} ${currentLevel}`}</div></div><div class="skill-controls"><button class="skill-btn minus" data-hero-skill="${idx}" data-delta="-1" ${currentLevel <= (idx===0?1:0)?'disabled':''}>−</button><div class="skill-current">${currentLevel} / ${maxRank}</div><button class="skill-btn plus" data-hero-skill="${idx}" data-delta="1" ${currentLevel >= maxRank ? 'disabled':''}>+</button></div></div>`;
  }

  function heroTabsMarkup(){
    const labels={overview:l('Información','Overview'), abilities:l('Habilidades','Abilities'), talents:l('Talentos','Talents'), equipment:l('Equipamiento','Equipment')};
    return `<div class="hero-subnav">${HERO_TABS.map(tab=>`<button class="hero-subtab ${AppState.heroView===tab?'active':''}" data-hero-view="${tab}">${labels[tab]}</button>`).join('')}</div>`;
  }
  function overviewPanel(heroName, heroData, attr){
    const chips = [
      `<span class="mini-badge vivid-badge">${l('14 puntos base','14 base points')}</span>`,
      `<span class="mini-badge filter-badge">${l('Hasta 17 extras','Up to 17 extra')}</span>`,
      `<span class="mini-badge role-badge role-${attr==='intelligence'?'mage':attr==='agility'?'assassin':'fighter'}">${attr==='intelligence'?AppUtils.roleName('mage'):attr==='agility'?AppUtils.roleName('assassin'):AppUtils.roleName('fighter')}</span>`
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
    const levels=ensureHeroBuild(heroName); const spent=totalPoints(levels); const available=totalAvailable(); const remaining=Math.max(0, available-spent);
    return `<section class="hero-panel"><div class="build-summary"><div class="count-badge">${AppUtils.t('skillPoints')}: ${spent} / ${available}</div><div class="count-badge">${AppUtils.t('remaining')}: ${remaining}</div><div class="count-badge">${l('Puntos extra','Extra points')}: ${AppState.heroExtraSkillPoints} / 17</div><div style="display:flex;gap:8px"><button class="btn" id="heroExtraMinus">-</button><button class="btn" id="heroExtraPlus">+</button></div><div class="tooltip-sub">${l('La primera habilidad empieza con 1 punto. Máximo 14 puntos base más 17 extra.','The first skill starts with 1 point. Maximum 14 base points plus 17 extra.')}</div><button class="btn" id="resetBuildBtn">${AppUtils.t('resetBuild')}</button></div><div class="skills-grid">${heroData.skills.map((s,idx)=>skillCard(heroName,s,idx,levels[idx]||0,attr)).join('')}</div></section>`;
  }
  function talentsPanel(heroData){
    return `<section class="hero-panel"><div class="talent-choice">${heroData.talents.map(t=>`<div class="tier"><button class="tier-btn ${AppState.heroTalentChoices[t.level]==='left'?'active':''}" data-tier="${t.level}" data-side="left">${t.left[AppUtils.lang()]||t.left.en}</button><div class="tier-lvl">${t.level}</div><button class="tier-btn ${AppState.heroTalentChoices[t.level]==='right'?'active':''}" data-tier="${t.level}" data-side="right">${t.right[AppUtils.lang()]||t.right.en}</button></div>`).join('')}</div></section>`;
  }
  function availableEquipmentItems(query){
    const q=(query||'').trim().toLowerCase();
    return (RenderItems.getFilteredItems ? RenderItems.getFilteredItems() : ITEMS).filter(item=>{
      if(!q) return true;
      return `${AppUtils.displayName(item)} ${(item.searchText||'')}`.toLowerCase().includes(q);
    }).sort((a,b)=> (b.rarity-a.rarity) || AppUtils.displayName(a).localeCompare(AppUtils.displayName(b))).slice(0,120);
  }
  function setEquipmentSlot(index){ AppState.heroActiveSlot=index; render(); }
  function clearEquipmentSlot(heroName,index){ const eq=ensureHeroEquipment(heroName); eq[index]=null; AppState.heroActiveSlot=index; render(); }
  function pickEquipment(heroName, itemKey){
    const eq=ensureHeroEquipment(heroName); const item=(ITEMS||[]).find(it=>AppUtils.itemKey(it)===itemKey || it.codename===itemKey);
    if(!item) return;
    let slot = Number.isInteger(AppState.heroActiveSlot) ? AppState.heroActiveSlot : eq.findIndex(v=>!v);
    if(slot<0) slot=0;
    eq[slot]=AppUtils.itemKey(item);
    AppState.heroActiveSlot = slot<5 ? slot+1 : slot;
    render();
  }
  function equipmentPanel(heroName){
    const eq=ensureHeroEquipment(heroName);
    const items = availableEquipmentItems(AppState.heroEquipmentSearch);
    return `<section class="hero-panel"><div class="equipment-toolbar"><div class="count-badge">${eq.filter(Boolean).length} / 6 ${l('items equipados','items equipped')}</div><div class="equip-search-wrap"><input id="heroEquipSearch" class="search-input hero-equip-search" type="search" value="${(AppState.heroEquipmentSearch||'').replace(/"/g,'&quot;')}" placeholder="${l('Buscar item...','Search item...')}"></div><button class="btn" id="resetEquipmentBtn">${l('Limpiar equipo','Clear equipment')}</button></div><div class="equipment-slots">${eq.map((key, idx)=>{ const item = key ? ITEMS.find(it=>AppUtils.itemKey(it)===key || it.codename===key) : null; return `<button class="equipment-slot ${AppState.heroActiveSlot===idx?'active':''} ${item?`r${item.rarity}`:''} hover-equip-slot" data-slot="${idx}" data-item-key="${item?AppUtils.itemKey(item):''}">${item ? `<div class="slot-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="slot-name">${AppUtils.displayName(item)}</div><div class="slot-actions"><span class="mini-badge filter-badge">${AppUtils.rarityName(item.rarity)}</span><span class="slot-remove" data-clear-slot="${idx}">×</span></div>` : `<div class="slot-empty">${l('Slot vacío','Empty slot')} #${idx+1}</div>`}</button>`; }).join('')}</div><div class="equipment-browser">${items.map(item=>`<article class="equip-option hover-equip-option r${item.rarity}" data-equip-item="${AppUtils.itemKey(item)}"><div class="equip-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="equip-name">${AppUtils.displayName(item)}</div><div class="equip-meta"><span class="mini-badge vivid-badge">${AppUtils.rarityName(item.rarity)}</span></div></article>`).join('')}</div></section>`;
  }

  function render(){
    const root=document.getElementById('pageRoot');
    const groups={intelligence:[], agility:[], strength:[]}; HEROES.forEach(h=>groups[h.attr].push(h));
    const panels=['intelligence','agility','strength'].map(attr=>`<section class="attr-panel attr-panel-${attr}"><div class="attr-head"><span class="attr-orb orb-${attr==='intelligence'?'int':attr==='agility'?'agi':'str'}"></span>${AppUtils.t(attr)}</div><div class="hero-list">${groups[attr].map(h=>`<div class="hero-chip hero-chip-${attr} ${AppState.selectedHero===h.name?'active':''}" data-hero="${h.name.replace(/"/g,'&quot;')}"><div class="hero-icon">${heroIcon(h)}</div><div><div class="name" style="font-weight:900">${h.name}</div><div class="tooltip-sub">${h.status==='coming'?AppUtils.t('comingSoon'):''}</div></div><div class="tooltip-sub">${AppState.selectedHero===h.name?AppUtils.t('selected'):''}</div></div>`).join('')}</div></section>`).join('');
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
      detail = `<div class="hero-detail hero-detail-${heroAttr}"><div class="hero-detail-frame"><div class="hero-detail-head"><div class="hero-icon">${heroIcon(heroMeta)}</div><div><div style="font-size:28px;font-weight:900">${hero.name}</div><div class="tooltip-sub hero-subline">${(hero.subtitle && (hero.subtitle[AppUtils.lang()]||hero.subtitle.en)) || ''}</div></div></div>${tabs}${panelHtml}</div></div>`;
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
