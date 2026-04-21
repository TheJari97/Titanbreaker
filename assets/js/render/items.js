window.RenderItems = (function(){
  function buildCraftLinks(recipes){
    const links = {};
    recipes.forEach(recipe => {
      const resultKey = AppUtils.normalizeKey(recipe.result);
      if(!links[resultKey]) links[resultKey] = { crafted:false, formulas:[], creates:[] };
      links[resultKey].crafted = true;
      recipe.formulas.forEach(formula => {
        const formulaText = formula.components.join(' + ');
        if(!links[resultKey].formulas.includes(formulaText)) links[resultKey].formulas.push(formulaText);
        formula.components.forEach(component => {
          const key = AppUtils.normalizeKey(component);
          if(!links[key]) links[key] = { crafted:false, formulas:[], creates:[] };
          if(!links[key].creates.includes(recipe.result)) links[key].creates.push(recipe.result);
        });
      });
    });
    return links;
  }

  function itemTooltip(item){
    const links = buildCraftLinks(window.AppRecipes || []);
    const craft = links[AppUtils.normalizeKey(AppUtils.displayName(item))] || { crafted:false, formulas:[], creates:[] };
    const roles = AppUtils.itemRoles(item);
    const range = AppUtils.itemRange(item);
    const attr = AppUtils.itemAttribute(item);
    let craftHtml = '';
    if(craft.crafted || craft.creates.length){
      craftHtml += '<div class="tooltip-body" style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px">';
      if(craft.crafted){
        craftHtml += `<div class="tooltip-sub" style="color:var(--gold2);font-weight:800">${AppUtils.lang()==='es'?'Item crafteado':'Crafted item'}</div>`;
        craftHtml += `<ul>${craft.formulas.map(formula => `<li>${formula}</li>`).join('')}</ul>`;
      }
      if(craft.creates.length){
        craftHtml += `<div class="tooltip-sub" style="color:#9fe7b7;font-weight:800;margin-top:10px">${AppUtils.lang()==='es'?'Se usa para crear':'Used for crafting'}</div>`;
        craftHtml += `<ul>${craft.creates.map(result => `<li>${result}</li>`).join('')}</ul>`;
      }
      craftHtml += '</div>';
    }
    const profile=`<div class="tooltip-body" style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px"><div style="display:flex;gap:6px;flex-wrap:wrap">${roles.map(role => `<span class="mini-badge role-badge role-${role}">${AppUtils.roleName(role)}</span>`).join('')}<span class="mini-badge filter-badge">${AppUtils.rangeName(range)}</span><span class="mini-badge filter-badge">${AppUtils.attrName(attr)}</span></div></div>`;
    return `<div class="tooltip-head"><img src="${item.image}" alt=""><div><div class="tooltip-title">${AppUtils.displayName(item)}</div><div class="tooltip-sub">${AppUtils.rarityName(item.rarity)}</div></div></div><div class="tooltip-body"><ul>${AppUtils.descByLang(item).map(line => `<li>${line}</li>`).join('')}</ul></div>${profile}${craftHtml}`;
  }

  function choiceButtons(order, selectedSet, dataAttr, labelFn){
    const allActive = AppUtils.setIsAll(selectedSet, order);
    return `<button class="chip filter-chip ${allActive?'active all-active':''}" data-${dataAttr}="__all__">${AppUtils.t('all')}</button>` + order.map(value => `<button class="chip filter-chip ${selectedSet.has(value)?'active':''}" data-${dataAttr}="${value}">${labelFn(value)}</button>`).join('');
  }

  function renderFilters(){
    return `<div class="section-card filters-panel ${AppState.itemsFiltersOpen?'open':''}" id="itemsFilters">
      <div class="filters-stack">
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">Rareza</div></div><div class="filters-grid">${AppUtils.rarityOrder.map(rarity => `<button class="chip filter-chip ${AppState.selectedRarities.has(rarity)?'active':''}" data-rarity="${rarity}">${AppUtils.rarityName(rarity)}</button>`).join('')}</div></div>
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('roleFilters')}</div><button class="btn mini-reset" id="resetRolesBtn">${AppUtils.t('clearRoles')}</button></div><div class="filters-grid role-grid">${choiceButtons(AppUtils.roleOrder, AppState.selectedRoles, 'role', AppUtils.roleName)}</div></div>
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('rangeFilters')}</div><button class="btn mini-reset" id="resetRangesBtn">${AppUtils.t('clearRanges')}</button></div><div class="filters-grid">${choiceButtons(AppUtils.rangeOrder, AppState.selectedRanges, 'range', AppUtils.rangeName)}</div></div>
        <div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('attributeFilters')}</div><button class="btn mini-reset" id="resetAttrsBtn">${AppUtils.t('clearAttrs')}</button></div><div class="filters-grid">${choiceButtons(AppUtils.attrOrder, AppState.selectedAttrs, 'attr', AppUtils.attrName)}</div></div>
      </div>
    </div>`;
  }

  function toggleChoice(currentSet, order, value){
    if(value==='__all__') return new Set(order);
    if(AppUtils.setIsAll(currentSet, order)){
      const next = new Set(order); next.delete(value); return next.size ? next : new Set([value]);
    }
    const next = new Set(currentSet);
    if(next.has(value)) next.delete(value); else next.add(value);
    if(next.size===0) next.add(value);
    return next;
  }

  function filteredItems(){
    return ITEMS.filter(item => AppState.selectedRarities.has(item.rarity))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemRoles(item)[0] || 'general', AppState.selectedRoles, AppUtils.roleOrder) || AppUtils.itemRoles(item).some(role => AppState.selectedRoles.has(role)) || AppUtils.setIsAll(AppState.selectedRoles, AppUtils.roleOrder))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemRange(item), AppState.selectedRanges, AppUtils.rangeOrder))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemAttribute(item), AppState.selectedAttrs, AppUtils.attrOrder))
      .filter(item => AppUtils.searchMatch(item.searchText || AppUtils.displayName(item), AppState.itemSearch));
  }

  function bindGroupToggles(root){
    root.querySelectorAll('.item-group-head').forEach(head => head.onclick = (event) => {
      if(event.target.closest('.group-toggle') || event.target.closest('.count-badge')){}
      const section = head.closest('.item-group');
      const grid = section.querySelector('.item-grid');
      const button = head.querySelector('.group-toggle');
      const collapsed = grid.classList.toggle('hidden');
      if(button) button.textContent = collapsed ? '+' : '–';
      section.classList.toggle('collapsed', collapsed);
    });
  }

  function render(){
    const root = document.getElementById('pageRoot');
    const filtered = filteredItems();
    const groups = AppUtils.rarityOrder.map(rarity => ({ rarity, items: filtered.filter(item => item.rarity === rarity) })).filter(group => group.items.length);
    root.innerHTML = `${renderFilters()}<div class="section-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div class="count-badge">${filtered.length} items</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllBtn">${AppUtils.t('expandAll')}</button><button class="btn" id="collapseAllBtn">${AppUtils.t('collapseAll')}</button></div></div>${groups.map(group => `<section class="item-group" data-group="${group.rarity}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityName(group.rarity)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.items.length} items</div><button class="btn group-toggle" data-group="${group.rarity}" type="button">–</button></div></div><div class="item-grid">${group.items.map(item => { const roles = AppUtils.itemRoles(item); const leadRole = roles[0] || 'general'; return `<article class="item-card r${item.rarity} hover-item" data-code="${item.codename}"><div class="item-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="item-meta"><div class="item-name">${AppUtils.displayName(item)}</div><div class="item-tags"><span class="mini-badge vivid-badge">${AppUtils.rarityName(item.rarity)}</span><span class="mini-badge role-badge role-${leadRole}">${AppUtils.roleName(leadRole)}</span><span class="mini-badge filter-badge">${AppUtils.rangeName(AppUtils.itemRange(item))}</span><span class="mini-badge filter-badge">${AppUtils.attrName(AppUtils.itemAttribute(item))}</span></div></div></article>`; }).join('')}</div></section>`).join('')}</div>`;

    root.querySelectorAll('[data-rarity]').forEach(button => button.onclick = (event) => { event.stopPropagation(); const rarity = Number(button.dataset.rarity); if(AppState.selectedRarities.has(rarity)) AppState.selectedRarities.delete(rarity); else AppState.selectedRarities.add(rarity); if(AppState.selectedRarities.size===0) AppState.selectedRarities = new Set(AppUtils.rarityOrder); render(); });
    root.querySelectorAll('[data-role]').forEach(button => button.onclick = (event) => { event.stopPropagation(); AppState.selectedRoles = toggleChoice(AppState.selectedRoles, AppUtils.roleOrder, button.dataset.role); render(); });
    root.querySelectorAll('[data-range]').forEach(button => button.onclick = (event) => { event.stopPropagation(); AppState.selectedRanges = toggleChoice(AppState.selectedRanges, AppUtils.rangeOrder, button.dataset.range); render(); });
    root.querySelectorAll('[data-attr]').forEach(button => button.onclick = (event) => { event.stopPropagation(); AppState.selectedAttrs = toggleChoice(AppState.selectedAttrs, AppUtils.attrOrder, button.dataset.attr); render(); });
    document.getElementById('resetRolesBtn').onclick = () => { AppState.selectedRoles = new Set(AppUtils.roleOrder); render(); };
    document.getElementById('resetRangesBtn').onclick = () => { AppState.selectedRanges = new Set(AppUtils.rangeOrder); render(); };
    document.getElementById('resetAttrsBtn').onclick = () => { AppState.selectedAttrs = new Set(AppUtils.attrOrder); render(); };
    bindGroupToggles(root);
    document.getElementById('expandAllBtn').onclick = () => { root.querySelectorAll('.item-grid').forEach(grid => grid.classList.remove('hidden')); root.querySelectorAll('.group-toggle').forEach(button => button.textContent='–'); };
    document.getElementById('collapseAllBtn').onclick = () => { root.querySelectorAll('.item-grid').forEach(grid => grid.classList.add('hidden')); root.querySelectorAll('.group-toggle').forEach(button => button.textContent='+'); };
    CommonUI.bindHover('.hover-item', element => { const item = ITEMS.find(entry => entry.codename === element.dataset.code); return itemTooltip(item); });
  }

  return { render, toggleFilters(){ AppState.itemsFiltersOpen = !AppState.itemsFiltersOpen; render(); }, setSearch(value){ AppState.itemSearch = value; render(); } };
})();
