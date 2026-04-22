window.RenderResources = (function(){
  function lookupItemByName(name){
    return AppUtils.findItemByName(name);
  }

  function buildResources(){
    const map = new Map();
    (window.AppRecipes || []).forEach(craft => {
      craft.formulas.forEach(formula => {
        formula.componentsData.forEach(component => {
          const key = AppUtils.normalizeKey(component.name);
          if(!map.has(key)){
            const item = component.item || lookupItemByName(component.originalName || component.name);
            map.set(key, {
              key,
              name: component.name,
              image: component.image || item?.image || '',
              rarity: component.rarity || item?.rarity || 0,
              item,
              itemKey: item ? AppUtils.itemKey(item) : '',
              crafts: []
            });
          }
          const entry = map.get(key);
          if(!entry.crafts.some(c => c.key === craft.key)) entry.crafts.push(craft);
        });
      });
    });
    return [...map.values()].sort((a,b)=> ((b.rarity||0)-(a.rarity||0)) || a.name.localeCompare(b.name));
  }

  function groupedResources(filtered){
    return AppUtils.rarityOrder.map(rarity => ({ rarity, resources: filtered.filter(resource => resource.rarity === rarity) })).filter(group => group.resources.length);
  }

  function resourceTooltip(resource){
    const itemTooltip = resource.item && window.RenderItems?.tooltipForItem ? RenderItems.tooltipForItem(resource.item) : '';
    const craftsSection = `<div class="tooltip-section tooltip-section-craft"><div class="tooltip-section-title">${AppUtils.lang()==='es' ? 'Se usa para crear' : 'Used to craft'}</div><ul>${resource.crafts.map(c=>`<li>${c.result}</li>`).join('')}</ul></div>`;
    return `${itemTooltip || `<div class="tooltip-head"><img src="${resource.image}" alt=""><div><div class="tooltip-title">${resource.name}</div><div class="tooltip-sub">${AppUtils.rarityName(resource.rarity)}</div></div></div>`}${craftsSection}`;
  }

  function openModal(resourceKey){
    const resource = buildResources().find(r => r.key === resourceKey);
    if(!resource) return;
    const modal = document.getElementById('resourceModal');
    const backdrop = document.getElementById('resourceBackdrop');
    const body = document.getElementById('resourceModalBody');
    body.innerHTML = `<button class="btn modal-close" id="resourceCloseBtn">×</button><div class="modal-title-wrap"><div class="tooltip-title">${resource.name}</div><div class="tooltip-sub">${AppUtils.lang()==='es' ? 'Crafteos disponibles con este recurso' : 'Crafts available with this resource'}</div></div><div class="resource-modal-list">${resource.crafts.map(craft => `<article class="resource-modal-card r${craft.rarity||0}"><div class="resource-modal-head"><div class="craft-thumb rarity-shell r${craft.rarity||0}">${craft.image ? `<img src="${craft.image}" alt="${craft.result}">` : ''}</div><div><div class="craft-name">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div></div><div class="resource-formulas">${craft.formulas.map(formula => `<div class="resource-formula"><div class="resource-formula-title">${AppUtils.lang()==='es' ? 'Componentes' : 'Components'}</div><div class="resource-components">${formula.componentsData.map(component => `<div class="resource-chip hover-resource-item" data-item-key="${component.item ? AppUtils.itemKey(component.item) : ''}" data-item-name="${(component.originalName||component.name).replace(/"/g,'&quot;')}">${component.image ? `<img src="${component.image}" alt="${component.name}">` : ''}<span>${component.name}</span></div>`).join('')}</div></div>`).join('')}</div></article>`).join('')}</div>`;
    modal.classList.add('open'); backdrop.classList.add('open');
    document.getElementById('resourceCloseBtn').onclick = closeModal;
    CommonUI.bindHover('.hover-resource-item', el => {
      const item = (el.dataset.itemKey && (ITEMS||[]).find(entry => AppUtils.itemKey(entry)===el.dataset.itemKey || entry.codename===el.dataset.itemKey)) || lookupItemByName(el.dataset.itemName);
      return item && window.RenderItems?.tooltipForItem ? RenderItems.tooltipForItem(item) : `<div class="tooltip-title">${el.dataset.itemName}</div>`;
    });
  }
  function closeModal(){ document.getElementById('resourceModal').classList.remove('open'); document.getElementById('resourceBackdrop').classList.remove('open'); }

  function filteredResources(){
    return buildResources().filter(resource => AppUtils.searchMatch(`${resource.name} ${resource.crafts.map(c=>c.result).join(' ')}`, AppState.resourceSearch));
  }

  function bindGroupToggles(root){ root.querySelectorAll('.item-group-head').forEach(head => head.onclick = () => { const section=head.closest('.resource-group'); const grid=section.querySelector('.resource-grid'); const button=head.querySelector('.resource-group-toggle'); const collapsed=grid.classList.toggle('hidden'); if(button) button.textContent=collapsed?'+':'–'; section.classList.toggle('collapsed', collapsed); }); }

  function render(){
    const root = document.getElementById('pageRoot');
    const filtered = filteredResources();
    const groups = groupedResources(filtered);
    root.innerHTML = `<div class="section-card resource-intro"><div class="catalog-hero"><div><div class="catalog-label">${AppUtils.lang()==='es' ? 'Catálogo de materiales' : 'Crafting materials catalog'}</div><h2>${AppUtils.lang()==='es' ? 'Recursos' : 'Resources'}</h2><p>${AppUtils.lang()==='es' ? 'Aquí verás solo los items que sirven como componentes de recetas. Pasa el mouse para ver a qué crafteos llevan y haz click para abrir todas sus combinaciones posibles.' : 'Here you only see items that are used as recipe components. Hover to see which crafts they lead to, and click to open every possible combination.'}</p></div></div></div><div class="section-card"><div class="count-badge">${filtered.length} ${AppUtils.lang()==='es' ? 'recursos' : 'resources'}</div>${groups.map(group => `<section class="resource-group" data-group="${group.rarity}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityName(group.rarity)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.resources.length} ${AppUtils.lang()==='es' ? 'recursos' : 'resources'}</div><button class="btn resource-group-toggle">–</button></div></div><div class="resource-grid">${group.resources.map(resource => `<article class="item-card resource-card r${resource.rarity} hover-resource-card" data-resource-key="${resource.key}"><div class="item-thumb rarity-shell r${resource.rarity}">${resource.image ? `<img src="${resource.image}" alt="${resource.name}">` : ''}</div><div class="item-meta"><div class="item-name">${resource.name}</div><div class="item-tags"><span class="mini-badge filter-badge">${resource.crafts.length} ${resource.crafts.length===1 ? (AppUtils.lang()==='es'?'receta':'recipe') : (AppUtils.lang()==='es'?'recetas':'recipes')}</span></div></div></article>`).join('')}</div></section>`).join('')}</div><div class="modal-backdrop" id="resourceBackdrop"></div><div class="modal" id="resourceModal"><div id="resourceModalBody"></div></div>`;
    root.querySelectorAll('.resource-card').forEach(card => card.onclick = ()=> openModal(card.dataset.resourceKey));
    document.getElementById('resourceBackdrop').onclick = closeModal;
    bindGroupToggles(root);
    CommonUI.bindHover('.hover-resource-card', el => {
      const resource = buildResources().find(r=>r.key===el.dataset.resourceKey);
      return resource ? resourceTooltip(resource) : '';
    });
  }
  return { render, setSearch(value){ AppState.resourceSearch = value; render(); } };
})();