window.RenderItems = (function(){
  function rawRecipes(){ return [...(window.CRAFTS || []), ...(window.EXTRA_RECIPES || [])]; }

  function buildCraftLinks(recipes){
    const links = {};
    recipes.forEach(recipe => {
      const resultName = AppUtils.recipeDisplayName(recipe.result);
      const resultKey = AppUtils.normalizeKey(resultName);
      if(!links[resultKey]) links[resultKey] = { crafted:false, formulas:[], creates:[] };
      links[resultKey].crafted = true;
      const formulaText = (recipe.components || []).map(AppUtils.recipeDisplayName).join(' + ');
      if(formulaText && !links[resultKey].formulas.includes(formulaText)) links[resultKey].formulas.push(formulaText);
      (recipe.components || []).forEach(component => {
        const compName = AppUtils.recipeDisplayName(component);
        const compKey = AppUtils.normalizeKey(compName);
        if(!links[compKey]) links[compKey] = { crafted:false, formulas:[], creates:[] };
        if(!links[compKey].creates.includes(resultName)) links[compKey].creates.push(resultName);
      });
    });
    return links;
  }

  function splitSections(lines){
    const sections = { headline:[], effects:[], notes:[], stats:[], special:[], prices:[] };
    (lines || []).forEach(rawLine => {
      const line = String(rawLine || '').trim();
      if(!line) return;
      if(/^Uniquely Equipped\.?$/i.test(line) || /^Equipamiento único\.?$/i.test(line)){
        sections.special.push(line);
        return;
      }
      if(/^(Sell price|Precio de venta)\s*:/i.test(line)){
        sections.prices.push(line);
        return;
      }
      if(/^(Titan Power|Set Bonus|Passive|Montura|Mount|Proc|Aura|Bono de set|Pasiva)\s*:/i.test(line)){
        sections.effects.push(line);
        return;
      }
      if(/^(Intellect|Strength|Agility|Health|Mana|Armor|Spell Resistance|Spellpower|Attack Damage|Auto Attack Damage|Cooldown Reduction|Fire Damage|Frost Damage|Arcane Damage|Shadow Damage|Holy Damage|Nature Damage|Chaos Damage|Physical Damage|Movement Speed|Attack Speed|Healing|Primary Attribute|Max Health|Max Mana|Ability Critical Strike Chance|Ability Critical Strike Factor|Dragon Intellect to Healing|Dragon Spellpower to Healing|Primary Attribute to Companion Damage|Chance on|Poder de hechizo|Intelecto|Fuerza|Agilidad|Vida|Maná|Armadura|Resistencia a hechizos|Daño de ataque|Daño de autoataque|Reducción de enfriamiento|Daño de Fuego|Daño de Escarcha|Daño Arcano|Daño de Sombra|Daño Sagrado|Daño de Naturaleza|Daño de Caos|Daño Físico|Velocidad de movimiento|Velocidad de ataque|Curación|Atributo principal|Vida máxima|Maná máximo|Probabilidad de golpe crítico de habilidad|Factor de golpe crítico de habilidad|Intelecto del dragón a curación|Poder de hechizo del dragón a curación|Atributo principal a daño de compañero|Probabilidad al)/i.test(line) || /^[+\-]?\d/.test(line)){
        sections.stats.push(line);
        return;
      }
      if(/<font/i.test(line) || /color\s*=/.test(line)){
        sections.notes.push(line);
        return;
      }
      if(/\./.test(line)){
        sections.headline.push(line);
        return;
      }
      sections.notes.push(line);
    });
    return sections;
  }

  function sectionBlock(title, content, kind='default'){
    if(!content) return '';
    return `<div class="tooltip-section tooltip-section-${kind}"><div class="tooltip-section-title">${title}</div>${content}</div>`;
  }

  function statGrid(lines){
    return `<div class="tooltip-stat-grid">${lines.map(line => `<div class="tooltip-stat-row">${line}</div>`).join('')}</div>`;
  }

  function listBlock(lines){
    return `<ul>${lines.map(line => `<li>${line}</li>`).join('')}</ul>`;
  }

  function itemTooltip(item){
    const links = buildCraftLinks(rawRecipes());
    const craft = links[AppUtils.normalizeKey(AppUtils.displayName(item))] || { crafted:false, formulas:[], creates:[] };
    const roles = AppUtils.itemRoles(item);
    const range = AppUtils.itemRange(item);
    const attr = AppUtils.itemAttribute(item);
    const acts = AppUtils.itemActs(item);
    const sections = splitSections(AppUtils.descByLang(item));

    const craftHtml = (!craft.crafted && !craft.creates.length) ? '' : sectionBlock(AppUtils.lang()==='es' ? 'Crafteo' : 'Crafting',
      `${craft.crafted ? `<div class="tooltip-craft-block"><div class="tooltip-label gold">${AppUtils.lang()==='es'?'Este item es resultado de una receta':'This item is the result of a recipe'}</div>${listBlock(craft.formulas)}</div>` : ''}
       ${craft.creates.length ? `<div class="tooltip-craft-block"><div class="tooltip-label green">${AppUtils.lang()==='es'?'Este item se usa para crear':'This item is used to create'}</div>${listBlock(craft.creates)}</div>` : ''}`,
      'craft');

    const profileBadges = `<div class="tooltip-badge-row">${roles.map(role => `<span class="mini-badge role-badge role-${role}">${AppUtils.roleName(role)}</span>`).join('')}<span class="mini-badge filter-badge">${AppUtils.rangeName(range)}</span><span class="mini-badge filter-badge">${AppUtils.attrName(attr)}</span>${acts.map(act => `<span class="mini-badge filter-badge">${AppUtils.actName(act)}</span>`).join('')}</div>`;

    return `<div class="tooltip-head"><img src="${item.image}" alt=""><div><div class="tooltip-title">${AppUtils.displayName(item)}</div><div class="tooltip-sub">${AppUtils.rarityName(item.rarity)}</div></div></div>
      ${sectionBlock(AppUtils.lang()==='es' ? 'Perfil del item' : 'Item profile', profileBadges, 'profile')}
      ${sections.headline.length ? sectionBlock(AppUtils.lang()==='es' ? 'Descripción' : 'Description', listBlock(sections.headline), 'desc') : ''}
      ${sections.effects.length ? sectionBlock(AppUtils.lang()==='es' ? 'Efectos' : 'Effects', listBlock(sections.effects), 'effects') : ''}
      ${sections.notes.length ? sectionBlock(AppUtils.lang()==='es' ? 'Notas' : 'Notes', listBlock(sections.notes), 'notes') : ''}
      ${sections.special.length ? sectionBlock(AppUtils.lang()==='es' ? 'Especial' : 'Special', `<div class="tooltip-pill-list">${sections.special.map(line => `<span class="tooltip-special-pill">${line}</span>`).join('')}</div>`, 'special') : ''}
      ${sections.stats.length ? sectionBlock(AppUtils.lang()==='es' ? 'Atributos y escalados' : 'Stats and scaling', statGrid(sections.stats), 'stats') : ''}
      ${sections.prices.length ? sectionBlock(AppUtils.lang()==='es' ? 'Precio' : 'Price', statGrid(sections.prices), 'price') : ''}
      ${craftHtml}`;
  }

  function renderChoiceChips(order, selectedSet, dataAttr, labelFn, extraClass=''){
    return order.map(value => `<button class="chip filter-chip ${selectedSet.has(value)?'active':''} ${extraClass}" data-${dataAttr}="${value}">${labelFn(value)}</button>`).join('');
  }

  function passesMulti(itemValues, selectedSet){
    if(AppUtils.filterIsInactive(selectedSet)) return true;
    return itemValues.some(value => selectedSet.has(value));
  }

  function renderFilters(){
    return `<div class="section-card filters-panel ${AppState.itemsFiltersOpen?'open':''}" id="itemsFilters">
      <div class="filters-toolbar"><div class="filters-tip">${AppUtils.lang()==='es' ? 'Selecciona solo los filtros que quieras aplicar. Si no eliges ninguno, se muestran todos los items.' : 'Select only the filters you want to apply. If none are selected, all items are shown.'}</div><button class="btn mini-reset" id="resetAllItemFilters">${AppUtils.lang()==='es'?'Limpiar filtros':'Clear filters'}</button></div>
      <div class="filters-stack compact-grid">
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">Rareza</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rarityOrder, AppState.selectedRarities, 'rarity', rarity => AppUtils.rarityName(rarity))}</div></div>
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('roleFilters')}</div></div><div class="filters-grid role-grid">${renderChoiceChips(AppUtils.roleOrder, AppState.selectedRoles, 'role', role => AppUtils.roleName(role))}</div></div>
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('rangeFilters')}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rangeOrder, AppState.selectedRanges, 'range', range => AppUtils.rangeName(range))}</div></div>
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('attributeFilters')}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.attrOrder, AppState.selectedAttrs, 'attr', attr => AppUtils.attrName(attr))}</div></div>
        <div class="filters-block filters-block-wide"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('actFilters')}</div></div><div class="filters-grid acts-grid">${renderChoiceChips(AppUtils.actOrder, AppState.selectedActs, 'act', act => AppUtils.actName(act), 'act-chip')}</div></div>
      </div>
    </div>`;
  }

  function toggleSetValue(set, value){
    const next = new Set(set);
    if(next.has(value)) next.delete(value); else next.add(value);
    return next;
  }

  function filteredItems(){
    return ITEMS
      .filter(item => AppUtils.filterIsInactive(AppState.selectedRarities) || AppState.selectedRarities.has(item.rarity))
      .filter(item => passesMulti(AppUtils.itemRoles(item), AppState.selectedRoles))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemRange(item), AppState.selectedRanges))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemAttribute(item), AppState.selectedAttrs))
      .filter(item => {
        if(AppUtils.filterIsInactive(AppState.selectedActs)) return true;
        const acts = AppUtils.itemActs(item);
        return acts.length ? acts.some(act => AppState.selectedActs.has(act)) : false;
      })
      .filter(item => AppUtils.searchMatch(item.searchText || AppUtils.displayName(item), AppState.itemSearch));
  }

  function bindGroupToggles(root){
    root.querySelectorAll('.item-group-head').forEach(head => head.onclick = () => {
      const section = head.closest('.item-group');
      const grid = section.querySelector('.item-grid');
      const button = head.querySelector('.group-toggle');
      const collapsed = grid.classList.toggle('hidden');
      if(button) button.textContent = collapsed ? '+' : '–';
      section.classList.toggle('collapsed', collapsed);
    });
  }

  function toggleDataSet(attrName){
    return event => {
      event.stopPropagation();
      const value = attrName === 'rarity' ? Number(event.currentTarget.dataset[attrName]) : (attrName === 'act' ? Number(event.currentTarget.dataset[attrName]) : event.currentTarget.dataset[attrName]);
      const map = {
        rarity:'selectedRarities', role:'selectedRoles', range:'selectedRanges', attr:'selectedAttrs', act:'selectedActs'
      };
      AppState[map[attrName]] = toggleSetValue(AppState[map[attrName]], value);
      render();
    };
  }

  function render(){
    const root = document.getElementById('pageRoot');
    const filtered = filteredItems();
    const groups = AppUtils.rarityOrder.map(rarity => ({ rarity, items: filtered.filter(item => item.rarity === rarity) })).filter(group => group.items.length);
    root.innerHTML = `${renderFilters()}<div class="section-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div class="count-badge">${filtered.length} items</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllBtn">${AppUtils.t('expandAll')}</button><button class="btn" id="collapseAllBtn">${AppUtils.t('collapseAll')}</button></div></div>${groups.map(group => `<section class="item-group" data-group="${group.rarity}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityName(group.rarity)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.items.length} items</div><button class="btn group-toggle" data-group="${group.rarity}" type="button">–</button></div></div><div class="item-grid">${group.items.map(item => { const roles = AppUtils.itemRoles(item); const leadRole = roles[0] || 'general'; const acts = AppUtils.itemActs(item); return `<article class="item-card r${item.rarity} hover-item" data-code="${item.codename}" data-item-key="${AppUtils.itemKey(item)}"><div class="item-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="item-meta"><div class="item-name">${AppUtils.displayName(item)}</div><div class="item-tags"><span class="mini-badge vivid-badge">${AppUtils.rarityName(item.rarity)}</span><span class="mini-badge role-badge role-${leadRole}">${AppUtils.roleName(leadRole)}</span><span class="mini-badge filter-badge">${AppUtils.rangeName(AppUtils.itemRange(item))}</span><span class="mini-badge filter-badge">${AppUtils.attrName(AppUtils.itemAttribute(item))}</span>${acts.map(act => `<span class="mini-badge filter-badge">${AppUtils.actName(act)}</span>`).join('')}</div></div></article>`; }).join('')}</div></section>`).join('')}</div>`;

    root.querySelectorAll('[data-rarity]').forEach(button => button.onclick = toggleDataSet('rarity'));
    root.querySelectorAll('[data-role]').forEach(button => button.onclick = toggleDataSet('role'));
    root.querySelectorAll('[data-range]').forEach(button => button.onclick = toggleDataSet('range'));
    root.querySelectorAll('[data-attr]').forEach(button => button.onclick = toggleDataSet('attr'));
    root.querySelectorAll('[data-act]').forEach(button => button.onclick = toggleDataSet('act'));

    const resetAll = document.getElementById('resetAllItemFilters');
    if(resetAll) resetAll.onclick = () => {
      AppState.selectedRarities = new Set();
      AppState.selectedRoles = new Set();
      AppState.selectedRanges = new Set();
      AppState.selectedAttrs = new Set();
      AppState.selectedActs = new Set();
      render();
    };

    bindGroupToggles(root);
    document.getElementById('expandAllBtn').onclick = () => { root.querySelectorAll('.item-grid').forEach(grid => grid.classList.remove('hidden')); root.querySelectorAll('.group-toggle').forEach(button => button.textContent='–'); };
    document.getElementById('collapseAllBtn').onclick = () => { root.querySelectorAll('.item-grid').forEach(grid => grid.classList.add('hidden')); root.querySelectorAll('.group-toggle').forEach(button => button.textContent='+'); };
    CommonUI.bindHover('.hover-item', el => itemTooltip(ITEMS.find(item => AppUtils.itemKey(item) === el.dataset.itemKey || item.codename === el.dataset.code)) );
  }

  return {
    render,
    toggleFilters(){ AppState.itemsFiltersOpen = !AppState.itemsFiltersOpen; render(); },
    setSearch(value){ AppState.itemSearch = value; render(); },
    tooltipForItem:itemTooltip,
    getFilteredItems:filteredItems
  };
})();
