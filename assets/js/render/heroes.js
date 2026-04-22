window.RenderHeroes = (function(){
  const HERO_TABS = ['overview','abilities','talents','equipment','artifacts'];

  const ARTIFACT_INFO = {
    intro:[l('Los artefactos pueden caer de jefes y mobs como items normales.','Artifact Items can be acquired from Bosses and Mobs like normal Items.'), l('Existen en calidad Épica, Legendaria, Inmortal, Inmortal [Ancient], Divina y Mítica.','They exist in Epic, Legendary, Immortal, [Ancient] Immortal, Divine and Mythical Item quality.'), l('Los rasgos especiales de artefacto, bonificaciones de Path y Runewords pueden salir en artefactos Inmortales o mejores.','Special Artifact Traits, Path Bonuses and Rune Words can roll on Artifacts of Immortal or better quality.')],
  };
  const ARTIFACT_TRAITS = {
    mainhand:[['Almighty','Gain % Auto Attack Critical Strike Damage equal to a percentage of your Strength, Agility and Intellect.'],['Balance of Power','Gain % Ability Damage equal to a percentage of your lowest Attribute.'],['Conjurer','When summons deal Damage, there is a 25% chance that they gain % Summon Damage equal to a percentage of current Mana for that Damage instance (does not work for Energy based Heroes).'],['Hunter','Gain Agility equal to a percentage of Movement Speed above 250.'],['Cold Chain','Whenever you cast an Ability with a base cooldown of 15 secs or higher, increase your % Frost Damage for 7 secs, stacking 25 times.'],['Lion King','Abilities that scale purely from Agility will now also scale from Strength, equal to a percentage of the original Agility scaling.'],['Mountain King','Gain % Ability Critical Strike Damage for every 100 Strength. Twice as effective against stunned enemies.'],['Overheat','Gain % Fire Damage equal to a percentage of your Attack Speed when Critical Striking.'],['Overpower','Abilities gain % Bonus Damage equal to a percentage of their cost when they Critical Strike.']],
    offhand:[['Fist of Fire','Gain % Fire Damage equal to a percentage of your Strength.'],['Frost Fever','Gain % Frost Damage equal to a percentage of your Agility.'],['Hand of God','Gain % Holy Damage equal to a percentage of your Intellect.'],['Nether Core','Gain % Arcane Damage equal to a percentage of your % Mana and % Health Bonuses.'],['Sacred Protection','Gain % Damage Reduction while at full Health. Capped at 50% reduction.'],['Shadow Warrior','Gain % Shadow and % Physical Damage equal to a percentage of your Spell Resistance.'],['Supercharge','Abilities with charges gain more max charges.'],['Underlord','Gain % Chaos and % Physical Damage equal to a percentage of your Armor.'],['Wrath of Zeus','Gain % Nature Damage equal to a percentage of your Attack Speed.']],
    cape:[['Archmage','Gain an Aura, increasing the Intellect of all allies. Stacks with other Players.'],['Black Mirror','Add a percentage of your Attack Damage plus Spellpower as Base Damage to all Ability Damage instances that deal Shadow Damage.'],['Echo','Abilities with a cooldown of 30 or more seconds have a chance to reset their cooldown when cast, capped at 50%, with an inner cooldown of 300 secs.'],['Force of Nature','Gain % Nature Damage equal to a percentage of your Strength.'],['Leader of the Pack','Gain an Aura, increasing the Agility of all allies. Stacks with other Players.'],['Manaworm','When you cast an Ability that costs Resources, refund a flat amount of Resources (Mana or Energy).'],['Metamorphosis','While you have taken on a different Form, gain a % Elemental Damage Bonus for all Elements, including Physical.'],['Netherfusion','Abilities that have a resource cost of 30 or higher have their Damage and Healing increased by a percentage.'],['Radiance','When you deal Holy Damage, Heal the most injured ally within 900 yards for a percentage of max Health, with an inner Cooldown of 10 secs.'],['Shapeshifter','Abilities that scale purely from Strength will now also scale from Agility, equal to a percentage of the original Strength scaling.'],['Shivering Cold','Frost Damage with a scaling of 500% or higher has a chance to Critical Strike for 500%.'],['Sonic Wall','Improves the cap at which Spellhaste affects the tick rate of Channeled Abilities by a percentage.'],['Swift Mending','A percentage of your Bonus Attack Speed now also increases your Healing output by a percentage.'],['Tides of Time','Increase all Damage by a percentage for 3 secs every 10 secs.'],['War Leader','Gain an Aura, increasing the Strength of all allies. Stacks with other Players.']],
    legs:[['Beast Within','Whenever you deal Damage with a Summon or Companion, restore a percentage of max Resource. Inner cooldown 0.25 secs.'],['Berserker','After having cast 25 Abilities, gain 10% Movement Speed and increase your Auto Attack Critical Strike Damage by a percentage for 5 secs.'],['Chivalry','Bonuses that increase your Strength by a percentage will now also affect your Armor by a portion of that percentage.'],['Corrosive Skin','When you are being attacked, lower the attacker\'s Armor and Spell Resistance for 10 secs.'],['Crusader','A portion of your % Healing Bonuses will now also affect your Damage output by a percentage.'],['Eye of the Tiger','Bonuses that increase your total Agility by a percentage are now more effective.'],['Flamewalker','Damage all nearby enemies every sec for Fire Damage equal to a percentage of your Strength plus Agility.'],['Fortress of Destruction','Effects that reduce your total Damage taken by a percentage, now grant a portion of that as % Damage Bonus.'],['Inner Fire','Whenever you cast an Ability with a Cooldown of 30 secs or higher, increase your Primary Attribute by a percentage for 10 secs, stacking up to 5 times.'],['Massive Massacre','Ability Damage with a scaling of 500% or higher gains a Critical Strike Damage Bonus.'],['Boulder Giant','Bonuses that increase your max Health by a percentage will now also affect your Attack Damage by a portion of that percentage.'],['Thunder Giant','Bonuses that increase your max Mana by a percentage will now also affect your Spellpower by a portion of that percentage.'],['Titan Sorcerer','Gain Intellect based on a percentage of your Strength.'],['Tower of Chaos','After dealing Chaos Damage, reduce the next Damage instance you take by a percentage.'],['Wrath of God','After taking Damage, increase all Damage and Healing caused by a percentage for 8 secs.']],
    gloves:[['Afterburn','Increase all Ability Damage that is of type Fire and is against enemies below 50% of max Health by a percentage.'],['Alchemist','Increase the max stack count of stack based debuffs by a percentage.'],['Divine Shield','When you cause Single Target Healing that is not over time, you place a Divine Shield on the target, absorbing Damage equal to a percentage of Healing done.'],['First Blood','The first Ability Damage instance you deal to an enemy will deal increased Damage.'],['Frostbite','When you deal Frost Damage to an enemy, there is a 25% chance to increase the Damage by a percentage and stun them in a Block of Ice for 3 secs.'],['Hemorrhage','All Critical Strike Chances are increased by a percentage for Damage instances that are Physical Damage over Time.'],['Interstellar','Gain a Bonus to Cast and Attack range as well as half of that Bonus to Spellpower.'],['Multistrike','Auto Attacks have a chance to cause an Auto Attack on all other enemies within 250 yards around the original target.'],["Nature\'s Harmony",'When you are not landing a Critical Strike, your Healing and Ability Damage when dealing Nature Damage is increased by a percentage.'],['Primal Fear','The first Debuff you apply to an enemy will last longer.'],['Spell Cleave','All Ability Damage has a chance to also affect all other enemies within 250 yards of the original target.'],['Star Collapse','When you deal Arcane Damage, Pure Damage and a Critical Strike in the same Damage instance, you gain a percentage Ability Damage Bonus for that Damage instance.'],['Twin Blast','All Ability Damage instances that cause exactly two different Elemental Damage types, have their Damage increased by a percentage. Physical Damage is not considered Elemental Damage for Twin Blast.']]
  };

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
  function findItemByKey(itemKey){
    return (ITEMS||[]).find(it=>AppUtils.itemKey(it)===itemKey || it.codename===itemKey) || null;
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
    AppState.heroEquipmentModalOpen = false;
    AppState.heroEquipment = {};
    AppState.heroArtifacts = {};
    AppState.heroSkillLevels[heroName] = hero.skills.map((_, idx) => idx===0 ? 1 : 0);
    AppState.heroEquipment[heroName] = new Array(6).fill(null);
    const artifactDefaults={}; artifactSlots().forEach(slot=>artifactDefaults[slot.key]=null); AppState.heroArtifacts[heroName]=artifactDefaults;
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
    ensureHeroArtifacts(name);
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
    const labels={overview:l('Información','Overview'), abilities:l('Habilidades','Abilities'), talents:l('Talentos','Talents'), equipment:l('Equipamiento','Equipment'), artifacts:l('Artefactos','Artifacts')};
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
    }).sort((a,b)=> AppUtils.displayName(a).localeCompare(AppUtils.displayName(b))).slice(0,160);
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

  function availableEquipmentItems(query){
    const q=(query||'').trim().toLowerCase();
    if(!q) return [];
    const eq = AppState.selectedHero ? ensureHeroEquipment(AppState.selectedHero) : [];
    const used = new Set(eq.filter((key, idx) => key && idx !== AppState.heroActiveSlot));
    return (ITEMS||[]).filter(item=>{
      const itemKey = AppUtils.itemKey(item);
      if(item.rarity !== 0 && used.has(itemKey)) return false;
      return AppUtils.displayName(item).toLowerCase().includes(q);
    }).sort((a,b)=> AppUtils.displayName(a).localeCompare(AppUtils.displayName(b))).slice(0,160);
  }
  function setEquipmentSlot(index){
    AppState.heroActiveSlot=index;
    AppState.heroEquipmentSearch='';
    AppState.heroEquipmentModalOpen=true;
    render();
  }
  function closeEquipmentPicker(){
    AppState.heroActiveSlot=null;
    AppState.heroEquipmentSearch='';
    AppState.heroEquipmentModalOpen=false;
    render();
  }
  function clearEquipmentSlot(heroName,index){
    const eq=ensureHeroEquipment(heroName);
    eq[index]=null;
    AppState.heroActiveSlot=null;
    AppState.heroEquipmentSearch='';
    AppState.heroEquipmentModalOpen=false;
    render();
  }
  function pickEquipment(heroName, itemKey){
    const eq=ensureHeroEquipment(heroName);
    const item=findItemByKey(itemKey);
    if(!item) return;
    const normalized = AppUtils.itemKey(item);
    const duplicateIndex = item.rarity === 0 ? -1 : eq.findIndex((key, idx) => key===normalized && idx!==AppState.heroActiveSlot);
    if(duplicateIndex !== -1) return;
    let slot = Number.isInteger(AppState.heroActiveSlot) ? AppState.heroActiveSlot : eq.findIndex(v=>!v);
    if(slot<0) slot=0;
    eq[slot]=normalized;
    AppState.heroActiveSlot = null;
    AppState.heroEquipmentSearch = '';
    AppState.heroEquipmentModalOpen = false;
    render();
  }
  function equipmentPanel(heroName){
    const eq=ensureHeroEquipment(heroName);
    const items = availableEquipmentItems(AppState.heroEquipmentSearch);
    const summary = aggregateEquipment(heroName);
    const activeSlotLabel = Number.isInteger(AppState.heroActiveSlot) ? `#${AppState.heroActiveSlot+1}` : '-';
    const searchValue = (AppState.heroEquipmentSearch||'').replace(/"/g,'&quot;');
    const hasSearch = Boolean((AppState.heroEquipmentSearch||'').trim());
    const modalMarkup = AppState.heroEquipmentModalOpen ? `<div class="modal-backdrop open" id="equipmentBackdrop"></div><div class="modal equipment-modal open" id="equipmentModal"><div id="equipmentModalBody"><button class="btn modal-close" id="equipmentCloseBtn">&times;</button><div class="modal-title-wrap"><div class="tooltip-title">${AppUtils.t('equipmentModalTitle')}</div><div class="tooltip-sub">${AppUtils.t('equipmentModalHint')}</div><div class="tooltip-badge-row" style="margin-top:10px"><span class="mini-badge filter-badge">${AppUtils.t('equipmentSelectedSlot')}: ${activeSlotLabel}</span></div></div><div class="equip-search-wrap"><input id="heroEquipSearch" class="search-input hero-equip-search is-modal" type="search" value="${searchValue}" placeholder="${AppUtils.t('equipmentModalSearch')}"></div>${!hasSearch ? `<div class="hero-empty-inline">${AppUtils.t('equipmentModalEmpty')}</div>` : items.length ? `<div class="equipment-browser equipment-browser-modal">${items.map(item=>`<article class="equip-option hover-equip-option r${item.rarity}" data-equip-item="${AppUtils.itemKey(item)}"><div class="equip-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="equip-name rarity-text r${item.rarity}">${AppUtils.displayName(item)}</div><div class="equip-meta"><span class="mini-badge vivid-badge">${AppUtils.rarityCardLabel(item.rarity)}</span></div></article>`).join('')}</div>` : `<div class="hero-empty-inline">${AppUtils.t('equipmentModalNoResults')}</div>`}</div></div>` : '';
    return `<section class="hero-panel"><div class="equipment-toolbar"><div class="count-badge">${eq.filter(Boolean).length} / 6 ${AppUtils.t('itemsEquipped')}</div><button class="btn" id="resetEquipmentBtn">${AppUtils.t('clearEquipment')}</button></div><div class="equipment-layout"><div><div class="equipment-slots">${eq.map((key, idx)=>{ const item = key ? findItemByKey(key) : null; return `<button class="equipment-slot ${AppState.heroActiveSlot===idx?'active':''} ${item?`r${item.rarity}`:''} hover-equip-slot" data-slot="${idx}" data-item-key="${item?AppUtils.itemKey(item):''}">${item ? `<div class="slot-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="slot-name rarity-text r${item.rarity}">${AppUtils.displayName(item)}</div><div class="slot-actions"><span class="mini-badge filter-badge">${AppUtils.rarityCardLabel(item.rarity)}</span><span class="slot-remove" data-clear-slot="${idx}">&times;</span></div>` : `<div class="slot-empty">${AppUtils.t('emptySlot')}</div>`}</button>`; }).join('')}</div><div class="hero-empty-inline">${AppUtils.t('clickSlot')}</div></div><aside class="equipment-summary"><div class="summary-title">${AppUtils.t('equipmentStats')}</div>${summary.totals.length ? `<div class="equip-stat-list">${summary.totals.map(([label,val])=>`<div class="equip-stat-row"><span>${label}</span><strong>${val>0?'+':''}${val}</strong></div>`).join('')}</div>` : `<div class="tooltip-sub">${AppUtils.t('noItemsEquipped')}</div>`}${summary.extras && summary.extras.length ? `<div class="equip-extra-list">${summary.extras.map(entry=>`<div class="equip-extra-card"><strong>${entry.item}</strong><ul><li>${entry.text}</li></ul></div>`).join('')}</div>` : ``}</aside></div>${modalMarkup}</section>`;
  }

  function artifactSlots(){
    return [
      {key:'head', label:'Head'}, {key:'shoulder', label:'Shoulder'},
      {key:'amulet', label:'Amulet'}, {key:'chest', label:'Chest'}, {key:'cape', label:'Cape'},
      {key:'gloves', label:'Gloves'}, {key:'legs', label:'Legs'}, {key:'ring', label:'Ring'},
      {key:'mainhand', label:'Main Hand'}, {key:'boots', label:'Boots'}, {key:'offhand', label:'Off Hand'}
    ];
  }
  function ensureHeroArtifacts(heroName){
    if(!AppState.heroArtifacts[heroName]){
      const obj={}; artifactSlots().forEach(slot=>obj[slot.key]=null); AppState.heroArtifacts[heroName]=obj;
    }
    return AppState.heroArtifacts[heroName];
  }
  function artifactsPanel(heroName){
    ensureHeroArtifacts(heroName);
    const traitGroups = [
      ['mainhand', l('Mainhand Traits','Mainhand Traits')],
      ['offhand', l('Unique Offhand Traits','Unique Offhand Traits')],
      ['cape', l('Cape Traits','Cape Traits')],
      ['legs', l('Leg Traits','Leg Traits')],
      ['gloves', l('Glove Traits','Glove Traits')]
    ];
    return `<section class="hero-panel artifact-panel-wrap"><div class="summary-title">${AppUtils.t('artifacts')}</div><div class="artifact-info-card"><div class="summary-title">${AppUtils.t('artifactInfo')}</div>${ARTIFACT_INFO.intro.map(line=>`<p>${line}</p>`).join('')}</div><div class="artifact-grid">${artifactSlots().map(slot=>`<article class="artifact-slot-card"><div class="artifact-slot-head">[${slot.label}]</div><div class="artifact-slot-body"><div class="artifact-slot-placeholder">${AppUtils.t('artifactSlotEmpty')}</div></div></article>`).join('')}</div><div class="artifact-traits-wrap">${traitGroups.map(([key,title])=>`<section class="artifact-trait-group"><div class="summary-title">${title}</div><div class="artifact-trait-list">${(ARTIFACT_TRAITS[key]||[]).map(([name,desc])=>`<article class="artifact-trait-card"><div class="artifact-trait-name">${name}</div><div class="artifact-trait-desc">${desc}</div></article>`).join('')}</div></section>`).join('')}</div></section>`;
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
      else if(AppState.heroView==='equipment') panelHtml = equipmentPanel(hero.name);
      else panelHtml = artifactsPanel(hero.name);
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
    const equipSearch = document.getElementById('heroEquipSearch'); if(equipSearch){ equipSearch.focus(); if(equipSearch.setSelectionRange){ const cursor=equipSearch.value.length; equipSearch.setSelectionRange(cursor, cursor); } equipSearch.oninput=(e)=>{ AppState.heroEquipmentSearch=e.target.value; render(); }; }
    const equipmentCloseBtn = document.getElementById('equipmentCloseBtn'); if(equipmentCloseBtn) equipmentCloseBtn.onclick=closeEquipmentPicker;
    const equipmentBackdrop = document.getElementById('equipmentBackdrop'); if(equipmentBackdrop) equipmentBackdrop.onclick=closeEquipmentPicker;
    const resetEquip = document.getElementById('resetEquipmentBtn'); if(resetEquip) resetEquip.onclick=()=>{ AppState.heroEquipment[AppState.selectedHero]=new Array(6).fill(null); AppState.heroActiveSlot=null; AppState.heroEquipmentModalOpen=false; AppState.heroEquipmentSearch=''; render(); };
    root.querySelectorAll('[data-slot]').forEach(el=>el.onclick=(e)=>{ if(e.target.closest('[data-clear-slot]')) return; setEquipmentSlot(Number(el.dataset.slot)); });
    root.querySelectorAll('[data-clear-slot]').forEach(el=>el.onclick=(e)=>{ e.stopPropagation(); clearEquipmentSlot(AppState.selectedHero, Number(el.dataset.clearSlot)); });
    root.querySelectorAll('[data-equip-item]').forEach(el=>el.onclick=()=>pickEquipment(AppState.selectedHero, el.dataset.equipItem));
    CommonUI.bindHover('.hover-skill', el=>skillTooltip(el.dataset.hero, Number(el.dataset.skill)));
    CommonUI.bindHover('.hover-equip-option', el=>{ const item=findItemByKey(el.dataset.equipItem); return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : ''; });
    CommonUI.bindHover('.hover-equip-slot', el=>{ if(!el.dataset.itemKey) return ''; const item=findItemByKey(el.dataset.itemKey); return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : ''; });
  }
  return { render };
})();
