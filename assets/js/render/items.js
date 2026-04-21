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

  function roleHtml(item){
    const roles = AppUtils.itemRoles(item);
    return `<div class="tooltip-sub" style="color:#9fe7b7;font-weight:800;margin-top:10px">${AppUtils.t('recommendedFor')}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${roles.map(role => `<span class="mini-badge role-badge role-${role}">${AppUtils.roleName(role)}</span>`).join('')}</div>`;
  }

  function itemTooltip(item){
    const links = buildCraftLinks(window.AppRecipes || []);
    const craft = links[AppUtils.normalizeKey(AppUtils.displayName(item))] || { crafted:false, formulas:[], creates:[] };
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
    return `<div class="tooltip-head"><img src="${item.image}" alt=""><div><div class="tooltip-title">${AppUtils.displayName(item)}</div><div class="tooltip-sub">${AppUtils.rarityName(item.rarity)}</div></div></div><div class="tooltip-body"><ul>${AppUtils.descByLang(item).map(line => `<li>${line}</li>`).join('')}</ul></div>${roleHtml(item)}${craftHtml}`;
  }

  function renderFilters(){
    return `<div class="section-card filters-panel ${AppState.itemsFiltersOpen?'open':''}" id="itemsFilters"><div class="filters-block"><div class="filters-label">${AppUtils.t('showFilters')}</div><div class="filters-grid">${AppUtils.rarityOrder.map(rarity => `<button class="chip ${AppState.selectedRarities.has(rarity)?'active':''}" data-rarity="${rarity}">${AppUtils.rarityName(rarity)}</button>`).join('')}</div></div><div class="filters-block role-block"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div class="filters-label">${AppUtils.t('roleFilters')}</div><button class="btn mini-reset" id="resetRolesBtn">${AppUtils.t('clearRoles')}</button></div><div class="filters-grid role-grid">${AppUtils.roleOrder.map(role => `<button class="chip role-chip role-${role} ${AppState.selectedRoles.has(role)?'active':''}" data-role="${role}">${AppUtils.roleName(role)}</button>`).join('')}</div></div></div>`;
  }

  function filteredItems(){
    const roleFiltering = AppState.selectedRoles.size > 0 && AppState.selectedRoles.size < AppUtils.roleOrder.length;
    return ITEMS.filter(item => AppState.selectedRarities.has(item.rarity))
      .filter(item => !roleFiltering || AppUtils.itemRoles(item).some(role => AppState.selectedRoles.has(role)))
      .filter(item => AppUtils.searchMatch(item.searchText || AppUtils.displayName(item), AppState.itemSearch));
  }

  function bindGroupToggles(root){
    root.querySelectorAll('.item-group-head').forEach(head => head.onclick = (event) => {
      const section = head.closest('.item-group');
      const grid = section.querySelector('.item-grid');
      const button = head.querySelector('.group-toggle');
      const collapsed = grid.classList.toggle('hidden');
      if(button) button.textContent = collapsed ? '+' : '–';
    });
  }

  function render(){
    const root = document.getElementById('pageRoot');
    const filtered = filteredItems();
    const groups = AppUtils.rarityOrder.map(rarity => ({ rarity, items: filtered.filter(item => item.rarity === rarity) })).filter(group => group.items.length);
    root.innerHTML = `${renderFilters()}<div class="section-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div class="count-badge">${filtered.length} items</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllBtn">${AppUtils.t('expandAll')}</button><button class="btn" id="collapseAllBtn">${AppUtils.t('collapseAll')}</button></div></div>${groups.map(group => `<section class="item-group" data-group="${group.rarity}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityName(group.rarity)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.items.length} items</div><button class="btn group-toggle" data-group="${group.rarity}" type="button">–</button></div></div><div class="item-grid">${group.items.map(item => { const roles = AppUtils.itemRoles(item); const leadRole = roles[0] || 'general'; return `<article class="item-card r${item.rarity} hover-item" data-code="${item.codename}"><div class="item-thumb"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="item-meta"><div class="item-name">${AppUtils.displayName(item)}</div><div class="item-tags"><span class="mini-badge">${AppUtils.rarityName(item.rarity)}</span><span class="mini-badge role-badge role-${leadRole}">${AppUtils.roleName(leadRole)}</span></div></div></article>`; }).join('')}</div></section>`).join('')}</div>`;

    root.querySelectorAll('[data-rarity]').forEach(button => button.onclick = (event) => {
      event.stopPropagation();
      const rarity = Number(button.dataset.rarity);
      if(AppState.selectedRarities.has(rarity)) AppState.selectedRarities.delete(rarity); else AppState.selectedRarities.add(rarity);
      render();
    });
    root.querySelectorAll('[data-role]').forEach(button => button.onclick = (event) => {
      event.stopPropagation();
      const role = button.dataset.role;
      if(AppState.selectedRoles.has(role)) AppState.selectedRoles.delete(role); else AppState.selectedRoles.add(role);
      if(AppState.selectedRoles.size === 0) AppUtils.roleOrder.forEach(entry => AppState.selectedRoles.add(entry));
      render();
    });
    document.getElementById('resetRolesBtn').onclick = () => { AppState.selectedRoles = new Set(AppUtils.roleOrder); render(); };
    bindGroupToggles(root);
    document.getElementById('expandAllBtn').onclick = () => { root.querySelectorAll('.item-grid').forEach(grid => grid.classList.remove('hidden')); root.querySelectorAll('.group-toggle').forEach(button => button.textContent='–'); };
    document.getElementById('collapseAllBtn').onclick = () => { root.querySelectorAll('.item-grid').forEach(grid => grid.classList.add('hidden')); root.querySelectorAll('.group-toggle').forEach(button => button.textContent='+'); };
    CommonUI.bindHover('.hover-item', element => { const item = ITEMS.find(entry => entry.codename === element.dataset.code); return itemTooltip(item); });
  }

  return { render, toggleFilters(){ AppState.itemsFiltersOpen = !AppState.itemsFiltersOpen; render(); }, setSearch(value){ AppState.itemSearch = value; render(); } };
})();
