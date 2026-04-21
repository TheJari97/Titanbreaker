window.RenderCrafts = (function(){
  function allRawRecipes(){ return [...CRAFTS, ...EXTRA_RECIPES]; }

  function recipeResultLabel(name){ return AppUtils.recipeDisplayName(name); }

  function lookupItemByName(name){
    const raw = String(name||'').trim();
    const aliases = [raw, RECIPE_ALIASES[raw], AppUtils.recipeDisplayName(raw)].filter(Boolean);
    for(const alias of aliases){
      const target = AppUtils.normalizeKey(alias);
      const exact = ITEMS.find(it => AppUtils.normalizeKey(AppUtils.displayName(it))===target || AppUtils.normalizeKey(it.name)===target);
      if(exact) return exact;
    }
    const target = AppUtils.normalizeKey(raw);
    return ITEMS.find(it => AppUtils.normalizeKey(AppUtils.displayName(it)).includes(target) || target.includes(AppUtils.normalizeKey(AppUtils.displayName(it)))) || null;
  }

  function normalizeRecipes(){
    const grouped = new Map();
    allRawRecipes().forEach(recipe => {
      const resultDisplay = recipeResultLabel(recipe.result);
      const groupKey = AppUtils.normalizeKey(resultDisplay);
      const formulaComponents = (recipe.components || []).map(component => AppUtils.recipeDisplayName(component));
      const formulaKey = formulaComponents.map(AppUtils.normalizeKey).join(' + ');
      if(!grouped.has(groupKey)){
        grouped.set(groupKey, { key:groupKey, result:resultDisplay, rawResults:[], formulas:[], image:'', rarity:0 });
      }
      const group = grouped.get(groupKey);
      if(!group.rawResults.includes(recipe.result)) group.rawResults.push(recipe.result);
      if(group.formulas.some(formula => formula.formulaKey===formulaKey)) return;
      const componentsData = formulaComponents.map((displayName, idx) => {
        const originalName = recipe.components[idx];
        const item = lookupItemByName(originalName);
        return { name:displayName, originalName, image:item?item.image:'', rarity:item?item.rarity:0 };
      });
      group.formulas.push({ formulaKey, components:formulaComponents, componentsData });
    });

    const values = [...grouped.values()].map(group => {
      const item = lookupItemByName(group.result) || group.rawResults.map(lookupItemByName).find(Boolean);
      if(item){
        group.image = item.image || '';
        group.rarity = item.rarity;
      } else {
        const bestComponent = group.formulas.flatMap(formula => formula.componentsData).sort((a,b)=>(b.rarity||0)-(a.rarity||0))[0];
        group.image = bestComponent && bestComponent.image ? bestComponent.image : '';
        group.rarity = bestComponent ? bestComponent.rarity : 0;
      }
      return group;
    });

    values.sort((a,b)=> ((b.rarity||0)-(a.rarity||0)) || a.result.localeCompare(b.result));
    return values;
  }

  window.AppRecipes = normalizeRecipes();
  function buildLinks(){
    const map = {};
    window.AppRecipes.forEach(craft => {
      const resultKey = AppUtils.normalizeKey(craft.result);
      if(!map[resultKey]) map[resultKey] = { crafted:false, formulas:[], creates:[] };
      map[resultKey].crafted = true;
      craft.formulas.forEach(formula => {
        const formulaText = formula.components.join(' + ');
        if(!map[resultKey].formulas.includes(formulaText)) map[resultKey].formulas.push(formulaText);
        formula.components.forEach(component => {
          const compKey = AppUtils.normalizeKey(component);
          if(!map[compKey]) map[compKey] = { crafted:false, formulas:[], creates:[] };
          if(!map[compKey].creates.includes(craft.result)) map[compKey].creates.push(craft.result);
        });
      });
    });
    window.CRAFT_ITEM_LINKS = map;
  }
  buildLinks();

  function craftTooltip(craft){
    const componentsPreview = craft.formulas[0] ? craft.formulas[0].components.map(component => `<li>${component}</li>`).join('') : '';
    return `<div class="tooltip-head"><img src="${craft.image||''}" alt=""><div><div class="tooltip-title">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div></div><div class="tooltip-body"><ul>${componentsPreview}</ul></div>`;
  }

  function closeModal(){
    document.getElementById('craftModal').classList.remove('open');
    document.getElementById('craftBackdrop').classList.remove('open');
  }

  function formulaBlock(craft, formula){
    return `<section class="recipe-layout recipe-layout-block ${craft.formulas.length>1?'multi':''}">
      <div class="recipe-components">${formula.componentsData.map(component => `<div class="recipe-item r${component.rarity||0}"><div class="thumb">${component.image?`<img src="${component.image}" alt="${component.name}">`:''}</div><div><div style="font-weight:900">${component.name}</div><div class="tooltip-sub">${AppUtils.rarityName(component.rarity||0)}</div></div></div>`).join('')}</div>
      <div class="recipe-arrow">→</div>
      <div class="recipe-result r${craft.rarity||0}"><div class="thumb">${craft.image?`<img src="${craft.image}" alt="${craft.result}">`:''}</div><div class="tooltip-title">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div>
    </section>`;
  }

  function openModal(resultKey){
    const craft = window.AppRecipes.find(c=>c.key===resultKey); if(!craft) return;
    const modal=document.getElementById('craftModal'); const backdrop=document.getElementById('craftBackdrop');
    document.getElementById('craftModalBody').innerHTML = `<button class="btn modal-close" id="craftCloseBtn">×</button>${craft.formulas.map((formula)=>formulaBlock(craft, formula)).join(craft.formulas.length>1?'<div class="recipe-divider"></div>':'')}`;
    modal.classList.add('open'); backdrop.classList.add('open');
    document.getElementById('craftCloseBtn').onclick = closeModal;
  }

  function groupedCrafts(filtered){
    return AppUtils.rarityOrder.map(rarity => ({ rarity, crafts: filtered.filter(craft => craft.rarity === rarity) })).filter(group => group.crafts.length);
  }

  function ensureCollapseState(rarity, collapsed){
    AppState.craftCollapsed = AppState.craftCollapsed || {};
    AppState.craftCollapsed[rarity] = collapsed;
  }
  function isCollapsed(rarity){
    AppState.craftCollapsed = AppState.craftCollapsed || {};
    return !!AppState.craftCollapsed[rarity];
  }

  function render(){
    const root=document.getElementById('pageRoot');
    const query = AppState.craftSearch || '';
    const filtered = window.AppRecipes.filter(craft => AppUtils.searchMatch(`${craft.result} ${craft.formulas.map(formula => formula.components.join(' ')).join(' ')}`, query));
    const groups = groupedCrafts(filtered);
    root.innerHTML = `<div class="section-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div class="count-badge">${filtered.length} crafts</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllCrafts">${AppUtils.t('expandAll')}</button><button class="btn" id="collapseAllCrafts">${AppUtils.t('collapseAll')}</button></div></div>${groups.map(group => `<section class="craft-group" data-group="${group.rarity}"><div class="item-group-head"><div class="count-badge">${AppUtils.rarityName(group.rarity)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.crafts.length} crafts</div><button class="btn craft-group-toggle" data-group="${group.rarity}">${isCollapsed(group.rarity)?'+':'–'}</button></div></div><div class="craft-grid ${isCollapsed(group.rarity)?'hidden':''}">${group.crafts.map(craft => `<article class="craft-card r${craft.rarity} hover-craft" data-result-key="${craft.key}"><div class="craft-thumb">${craft.image?`<img src="${craft.image}" alt="${craft.result}">`:''}</div><div class="craft-name">${craft.result}</div><div class="craft-meta">${craft.formulas.length} recipe${craft.formulas.length===1?'':'s'}</div></article>`).join('')}</div></section>`).join('')}</div><div class="modal-backdrop" id="craftBackdrop"></div><div class="modal" id="craftModal"><div id="craftModalBody"></div></div>`;
    root.querySelectorAll('.craft-card').forEach(card => card.onclick = () => openModal(card.dataset.resultKey));
    root.querySelectorAll('.craft-group-toggle').forEach(button => button.onclick = () => {
      const rarity = button.dataset.group;
      const section = button.closest('.craft-group');
      const grid = section.querySelector('.craft-grid');
      const collapsed = grid.classList.toggle('hidden');
      ensureCollapseState(rarity, collapsed);
      button.textContent = collapsed ? '+' : '–';
    });
    document.getElementById('expandAllCrafts').onclick = () => { root.querySelectorAll('.craft-grid').forEach(grid => grid.classList.remove('hidden')); root.querySelectorAll('.craft-group-toggle').forEach(button => { button.textContent='–'; ensureCollapseState(button.dataset.group, false); }); };
    document.getElementById('collapseAllCrafts').onclick = () => { root.querySelectorAll('.craft-grid').forEach(grid => grid.classList.add('hidden')); root.querySelectorAll('.craft-group-toggle').forEach(button => { button.textContent='+'; ensureCollapseState(button.dataset.group, true); }); };
    document.getElementById('craftBackdrop').onclick = closeModal;
    CommonUI.bindHover('.hover-craft', el=> craftTooltip(window.AppRecipes.find(c=>c.key===el.dataset.resultKey)) );
  }

  return { render, setSearch(value){ AppState.craftSearch = value || ''; render(); } };
})();