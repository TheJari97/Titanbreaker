window.RenderCrafts = (function(){
  function allRawRecipes(){ return [...CRAFTS, ...EXTRA_RECIPES]; }

  function lookupItemByName(name){
    return AppUtils.findItemByName(name);
  }

  function normalizeRecipes(){
    const grouped = new Map();
    allRawRecipes().forEach(recipe => {
      const resultDisplay = AppUtils.recipeDisplayName(recipe.result);
      const groupKey = AppUtils.normalizeKey(resultDisplay);
      const formulaComponents = (recipe.components || []).map(component => AppUtils.recipeDisplayName(component));
      const formulaKey = formulaComponents.map(AppUtils.normalizeKey).join(' + ');
      if(!grouped.has(groupKey)) grouped.set(groupKey, { key: groupKey, result: resultDisplay, rawResults: [], formulas: [], image: '', rarity: 0, role:'general', range:'flexible', attr:'neutral', acts:[] });
      const group = grouped.get(groupKey);
      if(!group.rawResults.includes(recipe.result)) group.rawResults.push(recipe.result);
      if(group.formulas.some(formula => formula.formulaKey === formulaKey)) return;
      const componentsData = formulaComponents.map((displayName, idx) => {
        const originalName = recipe.components[idx];
        const item = lookupItemByName(originalName);
        return { name: displayName, originalName, image: item ? item.image : '', rarity: item ? item.rarity : 0, item, itemKey: item ? AppUtils.itemKey(item) : '' };
      });
      group.formulas.push({ formulaKey, components: formulaComponents, componentsData });
    });
    const values = [...grouped.values()].map(group => {
      const item = lookupItemByName(group.result) || group.rawResults.map(lookupItemByName).find(Boolean);
      if(item){
        group.image = item.image || '';
        group.rarity = item.rarity;
        group.role = AppUtils.itemRoles(item)[0] || 'general';
        group.range = AppUtils.itemRange(item);
        group.attr = AppUtils.itemAttribute(item);
        group.acts = AppUtils.itemActs(item);
      } else {
        const best = group.formulas.flatMap(f=>f.componentsData).sort((a,b)=>(b.rarity||0)-(a.rarity||0))[0];
        group.image = best?.image || '';
        group.rarity = best?.rarity || 0;
      }
      return group;
    });
    values.sort((a,b)=>((b.rarity||0)-(a.rarity||0)) || a.result.localeCompare(b.result));
    return values;
  }

  window.AppRecipes = normalizeRecipes();

  function craftTooltip(craft){
    const componentsPreview = craft.formulas[0] ? craft.formulas[0].components.map(component => `<li>${component}</li>`).join('') : '';
    return `<div class="tooltip-head"><img src="${craft.image||''}" alt=""><div><div class="tooltip-title">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div></div><div class="tooltip-section tooltip-section-profile"><div class="tooltip-section-title">${AppUtils.lang()==='es'?'Perfil de receta':'Recipe profile'}</div><div class="tooltip-badge-row"><span class="mini-badge role-badge role-${craft.role}">${AppUtils.roleName(craft.role)}</span><span class="mini-badge filter-badge">${AppUtils.rangeName(craft.range)}</span><span class="mini-badge filter-badge">${AppUtils.attrName(craft.attr)}</span>${(craft.acts||[]).map(act => `<span class="mini-badge filter-badge">${AppUtils.actName(act)}</span>`).join('')}</div></div><div class="tooltip-section tooltip-section-craft"><div class="tooltip-section-title">${AppUtils.lang()==='es'?'Componentes base':'Base components'}</div><ul>${componentsPreview}</ul></div>`;
  }

  function closeModal(){ document.getElementById('craftModal').classList.remove('open'); document.getElementById('craftBackdrop').classList.remove('open'); }
  function formulaBlock(craft, formula){
    return `<section class="recipe-layout recipe-layout-block ${craft.formulas.length>1?'multi':''}"><div class="recipe-components">${formula.componentsData.map(component => `<div class="recipe-item r${component.rarity||0} hover-recipe-item" data-item-key="${component.itemKey}" data-item-name="${component.originalName.replace(/"/g,'&quot;')}"><div class="thumb">${component.image?`<img src="${component.image}" alt="${component.name}">`:''}</div><div><div style="font-weight:900">${component.name}</div><div class="tooltip-sub">${AppUtils.rarityName(component.rarity||0)}</div></div></div>`).join('')}</div><div class="recipe-arrow">→</div><div class="recipe-result r${craft.rarity||0} hover-recipe-result" data-item-key="${AppUtils.itemKey(lookupItemByName(craft.result) || {})}" data-item-name="${craft.result.replace(/"/g,'&quot;')}"><div class="thumb">${craft.image?`<img src="${craft.image}" alt="${craft.result}">`:''}</div><div class="tooltip-title">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div>${(craft.acts||[]).length?`<div class="tooltip-badge-row" style="justify-content:center">${craft.acts.map(act=>`<span class="mini-badge filter-badge">${AppUtils.actName(act)}</span>`).join('')}</div>`:''}</div></section>`;
  }
  function bindModalItemHover(scope){
    const resolver = (el)=>{
      if(el.dataset.itemKey){
        const direct = (ITEMS||[]).find(item => AppUtils.itemKey(item) === el.dataset.itemKey || item.codename === el.dataset.itemKey);
        if(direct) return direct;
      }
      return lookupItemByName(el.dataset.itemName);
    };
    CommonUI.bindHover('.hover-recipe-item', el=>{ const item = resolver(el); return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : `<div class="tooltip-title">${el.dataset.itemName}</div>`; });
    CommonUI.bindHover('.hover-recipe-result', el=>{ const item = resolver(el); return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : `<div class="tooltip-title">${el.dataset.itemName}</div>`; });
  }
  function openModal(resultKey){ const craft = window.AppRecipes.find(c=>c.key===resultKey); if(!craft) return; const modal=document.getElementById('craftModal'); const backdrop=document.getElementById('craftBackdrop'); document.getElementById('craftModalBody').innerHTML = `<button class="btn modal-close" id="craftCloseBtn">×</button><div class="modal-title-wrap"><div class="tooltip-title">${craft.result}</div><div class="tooltip-sub">${craft.formulas.length>1 ? (AppUtils.lang()==='es' ? 'Variantes de receta' : 'Recipe variants') : (AppUtils.lang()==='es' ? 'Receta' : 'Recipe')}</div></div>${craft.formulas.map(formula=>formulaBlock(craft, formula)).join(craft.formulas.length>1?'<div class="recipe-divider"></div>':'')}`; modal.classList.add('open'); backdrop.classList.add('open'); document.getElementById('craftCloseBtn').onclick = closeModal; bindModalItemHover(document.getElementById('craftModalBody')); }

  function renderChoiceChips(order, selectedSet, dataAttr, labelFn){
    return order.map(value => `<button class="chip filter-chip ${selectedSet.has(value)?'active':''}" data-${dataAttr}="${value}">${labelFn(value)}</button>`).join('');
  }
  function toggleSetValue(set, value){ const next = new Set(set); if(next.has(value)) next.delete(value); else next.add(value); return next; }
  function groupedCrafts(filtered){ return AppUtils.rarityOrder.map(rarity => ({ rarity, crafts: filtered.filter(craft => craft.rarity === rarity) })).filter(group => group.crafts.length); }
  function filterCrafts(){
    return window.AppRecipes
      .filter(craft => AppUtils.filterIsInactive(AppState.craftSelectedRarities) || AppState.craftSelectedRarities.has(craft.rarity))
      .filter(craft => AppUtils.matchesFilter(craft.role, AppState.craftSelectedRoles))
      .filter(craft => AppUtils.matchesFilter(craft.range, AppState.craftSelectedRanges))
      .filter(craft => AppUtils.matchesFilter(craft.attr, AppState.craftSelectedAttrs))
      .filter(craft => AppUtils.searchMatch(`${craft.result} ${craft.formulas.map(formula => formula.components.join(' ')).join(' ')}`, AppState.craftSearch));
  }
  function bindGroupToggles(root){ root.querySelectorAll('.item-group-head').forEach(head => head.onclick = () => { const section=head.closest('.craft-group'); const grid=section.querySelector('.craft-grid'); const button=head.querySelector('.craft-group-toggle'); const collapsed=grid.classList.toggle('hidden'); if(button) button.textContent=collapsed?'+':'–'; section.classList.toggle('collapsed', collapsed); }); }
  function renderFilters(){
    return `<div class="section-card filters-panel ${AppState.craftsFiltersOpen?'open':''}" id="craftsFilters"><div class="filters-toolbar"><div class="filters-tip">${AppUtils.lang()==='es' ? 'Selecciona solo los filtros que quieras aplicar. Si no eliges ninguno, se muestran todos los crafteos.' : 'Select only the filters you want to apply. If none are selected, all crafts are shown.'}</div><button class="btn mini-reset" id="resetAllCraftFilters">${AppUtils.lang()==='es'?'Limpiar filtros':'Clear filters'}</button></div><div class="filters-stack compact-grid"><div class="filters-block"><div class="filters-row-head"><div class="filters-label">Rareza</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rarityOrder, AppState.craftSelectedRarities, 'craft-rarity', rarity => AppUtils.rarityName(rarity))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('roleFilters')}</div></div><div class="filters-grid role-grid">${renderChoiceChips(AppUtils.roleOrder, AppState.craftSelectedRoles, 'craft-role', role => AppUtils.roleName(role))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('rangeFilters')}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rangeOrder, AppState.craftSelectedRanges, 'craft-range', range => AppUtils.rangeName(range))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t('attributeFilters')}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.attrOrder, AppState.craftSelectedAttrs, 'craft-attr', attr => AppUtils.attrName(attr))}</div></div></div></div>`;
  }
  function render(){
    const root=document.getElementById('pageRoot');
    const filtered = filterCrafts();
    const groups = groupedCrafts(filtered);
    root.innerHTML = `${renderFilters()}<div class="section-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div class="count-badge">${filtered.length} crafts</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllCrafts">${AppUtils.t('expandAll')}</button><button class="btn" id="collapseAllCrafts">${AppUtils.t('collapseAll')}</button></div></div>${groups.map(group => `<section class="craft-group" data-group="${group.rarity}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityName(group.rarity)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.crafts.length} crafts</div><button class="btn craft-group-toggle" data-group="${group.rarity}">–</button></div></div><div class="craft-grid">${group.crafts.map(craft => `<article class="craft-card r${craft.rarity} hover-craft" data-result-key="${craft.key}"><div class="craft-thumb rarity-shell r${craft.rarity}">${craft.image?`<img src="${craft.image}" alt="${craft.result}">`:''}</div><div class="craft-name">${craft.result}</div><div class="craft-meta"><span class="mini-badge role-badge role-${craft.role}">${AppUtils.roleName(craft.role)}</span> <span class="mini-badge filter-badge">${AppUtils.rangeName(craft.range)}</span> <span class="mini-badge filter-badge">${AppUtils.attrName(craft.attr)}</span>${(craft.acts||[]).map(act => ` <span class="mini-badge filter-badge">${AppUtils.actName(act)}</span>`).join('')}</div></article>`).join('')}</div></section>`).join('')}</div><div class="modal-backdrop" id="craftBackdrop"></div><div class="modal" id="craftModal"><div id="craftModalBody"></div></div>`;
    root.querySelectorAll('.craft-card').forEach(card => card.onclick = () => openModal(card.dataset.resultKey));
    root.querySelectorAll('[data-craft-rarity]').forEach(button => button.onclick = (event)=>{ event.stopPropagation(); AppState.craftSelectedRarities = toggleSetValue(AppState.craftSelectedRarities, Number(button.dataset.craftRarity)); render(); });
    root.querySelectorAll('[data-craft-role]').forEach(button => button.onclick = (event)=>{ event.stopPropagation(); AppState.craftSelectedRoles = toggleSetValue(AppState.craftSelectedRoles, button.dataset.craftRole); render(); });
    root.querySelectorAll('[data-craft-range]').forEach(button => button.onclick = (event)=>{ event.stopPropagation(); AppState.craftSelectedRanges = toggleSetValue(AppState.craftSelectedRanges, button.dataset.craftRange); render(); });
    root.querySelectorAll('[data-craft-attr]').forEach(button => button.onclick = (event)=>{ event.stopPropagation(); AppState.craftSelectedAttrs = toggleSetValue(AppState.craftSelectedAttrs, button.dataset.craftAttr); render(); });
    const resetAll = document.getElementById('resetAllCraftFilters');
    if(resetAll) resetAll.onclick = () => { AppState.craftSelectedRarities = new Set(); AppState.craftSelectedRoles = new Set(); AppState.craftSelectedRanges = new Set(); AppState.craftSelectedAttrs = new Set(); render(); };
    bindGroupToggles(root);
    document.getElementById('expandAllCrafts').onclick = () => { root.querySelectorAll('.craft-grid').forEach(grid => grid.classList.remove('hidden')); root.querySelectorAll('.craft-group-toggle').forEach(button => button.textContent='–'); };
    document.getElementById('collapseAllCrafts').onclick = () => { root.querySelectorAll('.craft-grid').forEach(grid => grid.classList.add('hidden')); root.querySelectorAll('.craft-group-toggle').forEach(button => button.textContent='+'); };
    document.getElementById('craftBackdrop').onclick = closeModal;
    CommonUI.bindHover('.hover-craft', el=> craftTooltip(window.AppRecipes.find(c=>c.key===el.dataset.resultKey)) );
  }
  return { render, toggleFilters(){ AppState.craftsFiltersOpen = !AppState.craftsFiltersOpen; render(); }, setSearch(value){ AppState.craftSearch = value; render(); } };
})();
