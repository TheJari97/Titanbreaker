window.RenderCrafts = (function(){
  const COLLAPSE_ICON = "-";
  const EXPAND_ICON = "+";

  function allRawRecipes(){
    return [...CRAFTS, ...EXTRA_RECIPES];
  }

  function lookupItemByName(name){
    return AppUtils.findItemByName(name);
  }

  function normalizeRecipes(){
    const grouped = new Map();
    allRawRecipes().forEach(recipe => {
      const resultDisplay = AppUtils.recipeDisplayName(recipe.result);
      const groupKey = AppUtils.normalizeKey(resultDisplay);
      const formulaComponents = (recipe.components || []).map(component => AppUtils.recipeDisplayName(component));
      const formulaKey = formulaComponents.map(AppUtils.normalizeKey).join(" + ");
      if(!grouped.has(groupKey)){
        grouped.set(groupKey, { key: groupKey, result: resultDisplay, rawResults: [], formulas: [], image: "", rarity: 0, role: "general", range: "flexible", attr: "neutral", acts: [] });
      }
      const group = grouped.get(groupKey);
      if(!group.rawResults.includes(recipe.result)) group.rawResults.push(recipe.result);
      if(group.formulas.some(formula => formula.formulaKey === formulaKey)) return;
      const componentsData = formulaComponents.map((displayName, index) => {
        const originalName = recipe.components[index];
        const item = lookupItemByName(originalName);
        return {
          name: item ? AppUtils.displayName(item) : displayName,
          originalName,
          image: item ? item.image : "",
          rarity: item ? item.rarity : 0,
          item,
          itemKey: item ? AppUtils.itemKey(item) : ""
        };
      });
      group.formulas.push({ formulaKey, components: formulaComponents, componentsData });
    });

    const values = [...grouped.values()].map(group => {
      const item = lookupItemByName(group.result) || group.rawResults.map(lookupItemByName).find(Boolean);
      if(item){
        group.result = AppUtils.displayName(item);
        group.image = item.image || "";
        group.rarity = item.rarity;
        group.role = AppUtils.itemRoles(item)[0] || "general";
        group.range = AppUtils.itemRange(item);
        group.attr = AppUtils.itemAttribute(item);
        group.damageTypes = AppUtils.itemDamageTypes(item);
        group.acts = [];
      } else {
        const best = group.formulas.flatMap(formula => formula.componentsData).sort((a, b) => (b.rarity || 0) - (a.rarity || 0))[0];
        group.image = best?.image || "";
        group.rarity = best?.rarity || 0;
        group.damageTypes = best?.item ? AppUtils.itemDamageTypes(best.item) : ["none"];
      }
      return group;
    });

    values.sort((a, b) => ((b.rarity || 0) - (a.rarity || 0)) || a.result.localeCompare(b.result));
    return values;
  }

  window.AppRecipes = normalizeRecipes();

  function craftTooltip(craft){
    const componentsPreview = craft.formulas[0] ? craft.formulas[0].components.map(component => `<li>${component}</li>`).join("") : "";
    return `<div class="tooltip-head"><img src="${craft.image || ""}" alt=""><div><div class="tooltip-title rarity-text r${craft.rarity}">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div></div><div class="tooltip-section tooltip-section-profile"><div class="tooltip-section-title">${AppUtils.t("recipeProfileTitle")}</div><div class="tooltip-badge-row"><span class="mini-badge role-badge role-${craft.role}">${AppUtils.roleName(craft.role)}</span><span class="mini-badge filter-badge filter-range">${AppUtils.rangeName(craft.range)}</span><span class="mini-badge filter-badge filter-attr">${AppUtils.attrName(craft.attr)}</span></div></div><div class="tooltip-section tooltip-section-craft"><div class="tooltip-section-title">${AppUtils.t("baseComponentsTitle")}</div><ul>${componentsPreview}</ul></div>`;
  }

  function closeModal(){
    document.getElementById("craftModal").classList.remove("open");
    document.getElementById("craftBackdrop").classList.remove("open");
  }

  function formulaBlock(craft, formula){
    return `<section class="recipe-layout recipe-layout-block ${craft.formulas.length > 1 ? "multi" : ""}"><div class="recipe-components">${formula.componentsData.map(component => `<div class="recipe-item r${component.rarity || 0} hover-recipe-item" data-item-key="${component.itemKey}" data-item-name="${String(component.originalName || component.name).replace(/"/g, "&quot;")}"><div class="thumb">${component.image ? `<img src="${component.image}" alt="${component.name}">` : ""}</div><div><div class="rarity-text r${component.rarity || 0}" style="font-weight:900">${component.name}</div><div class="tooltip-sub">${AppUtils.rarityName(component.rarity || 0)}</div></div></div>`).join("")}</div><div class="recipe-arrow">&rarr;</div><div class="recipe-result r${craft.rarity || 0} hover-recipe-result" data-item-key="${AppUtils.itemKey(lookupItemByName(craft.result) || {})}" data-item-name="${craft.result.replace(/"/g, "&quot;")}"><div class="thumb">${craft.image ? `<img src="${craft.image}" alt="${craft.result}">` : ""}</div><div class="tooltip-title rarity-text r${craft.rarity || 0}">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div></section>`;
  }

  function bindModalItemHover(){
    const resolveItem = el => {
      if(el.dataset.itemKey){
        const direct = (ITEMS || []).find(item => AppUtils.itemKey(item) === el.dataset.itemKey || item.codename === el.dataset.itemKey);
        if(direct) return direct;
      }
      return lookupItemByName(el.dataset.itemName);
    };

    CommonUI.bindHover(".hover-recipe-item", el => {
      const item = resolveItem(el);
      return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : `<div class="tooltip-title">${el.dataset.itemName}</div>`;
    });

    CommonUI.bindHover(".hover-recipe-result", el => {
      const item = resolveItem(el);
      return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : `<div class="tooltip-title">${el.dataset.itemName}</div>`;
    });
  }

  function openModal(resultKey){
    const craft = window.AppRecipes.find(entry => entry.key === resultKey);
    if(!craft) return;
    const modal = document.getElementById("craftModal");
    const backdrop = document.getElementById("craftBackdrop");
    document.getElementById("craftModalBody").innerHTML = `<button class="btn modal-close" id="craftCloseBtn" type="button">&times;</button><div class="modal-title-wrap"><div class="tooltip-title rarity-text r${craft.rarity}">${craft.result}</div><div class="tooltip-sub">${craft.formulas.length > 1 ? AppUtils.t("recipeVariantsTitle") : AppUtils.t("recipeSingleTitle")}</div></div>${craft.formulas.map(formula => formulaBlock(craft, formula)).join(craft.formulas.length > 1 ? '<div class="recipe-divider"></div>' : "")}`;
    modal.classList.add("open");
    backdrop.classList.add("open");
    document.getElementById("craftCloseBtn").onclick = closeModal;
    bindModalItemHover();
  }

  function renderChoiceChips(order, selectedSet, dataAttr, labelFn){
    return order.map(value => `<button class="chip filter-chip ${selectedSet.has(value) ? "active" : ""}" data-${dataAttr}="${value}" type="button">${labelFn(value)}</button>`).join("");
  }

  function toggleSetValue(set, value){
    const next = new Set(set);
    if(next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function activeFilterCount(){
    return AppState.craftSelectedRarities.size + AppState.craftSelectedRoles.size + AppState.craftSelectedRanges.size + AppState.craftSelectedAttrs.size + AppState.craftSelectedDamageTypes.size;
  }

  function rememberFiltersScroll(){
    const panel = document.getElementById("craftsFilters");
    if(panel) AppState.craftsFiltersScroll = panel.scrollTop;
  }

  function groupedCrafts(filtered){
    return AppUtils.rarityGroupOrder.map(groupKey => ({
      key: groupKey,
      crafts: filtered
        .filter(craft => AppUtils.rarityMeta(craft.rarity).group === groupKey)
        .sort((a, b) => (b.rarity - a.rarity) || a.result.localeCompare(b.result))
    })).filter(group => group.crafts.length);
  }

  function filterCrafts(){
    return window.AppRecipes
      .filter(craft => AppUtils.filterIsInactive(AppState.craftSelectedRarities) || AppState.craftSelectedRarities.has(craft.rarity))
      .filter(craft => AppUtils.matchesFilter(craft.role, AppState.craftSelectedRoles))
      .filter(craft => AppUtils.matchesFilter(craft.range, AppState.craftSelectedRanges))
      .filter(craft => AppUtils.matchesFilter(craft.attr, AppState.craftSelectedAttrs))
      .filter(craft => AppUtils.filterIsInactive(AppState.craftSelectedDamageTypes) || (craft.damageTypes || ["none"]).some(value => AppState.craftSelectedDamageTypes.has(value)))
      .filter(craft => AppUtils.searchMatch(`${craft.result} ${craft.formulas.map(formula => formula.components.join(" ")).join(" ")}`, AppState.craftSearch));
  }

  function bindGroupToggles(root){
    root.querySelectorAll(".item-group-head").forEach(head => {
      head.onclick = () => {
        const section = head.closest(".craft-group");
        const grid = section.querySelector(".craft-grid");
        const button = head.querySelector(".craft-group-toggle");
        const collapsed = grid.classList.toggle("hidden");
        if(button) button.textContent = collapsed ? EXPAND_ICON : COLLAPSE_ICON;
        section.classList.toggle("collapsed", collapsed);
      };
    });
  }

  function renderFilters(){
    const hasActiveFilters = activeFilterCount() > 0;
    return `<div class="filters-drawer-backdrop ${AppState.craftsFiltersOpen ? "open" : ""}" id="craftsFiltersBackdrop"></div><aside class="section-card filters-panel filters-drawer ${AppState.craftsFiltersOpen ? "open" : ""}" id="craftsFilters"><div class="filters-toolbar"><div><div class="filters-label">${AppUtils.t("craftFiltersTitle")}</div><div class="filters-tip">${AppUtils.t("craftFiltersTip")}</div></div><div class="filters-toolbar-actions"><button class="btn mini-reset" id="closeCraftFilters" type="button">${AppUtils.t("closeFilters")}</button>${hasActiveFilters ? `<button class="btn mini-reset" id="resetAllCraftFilters" type="button">${AppUtils.t("clearAllFilters")}</button>` : ""}</div></div><div class="filters-stack compact-grid"><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("rarityLabel")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rarityOrder, AppState.craftSelectedRarities, "craft-rarity", rarity => AppUtils.rarityName(rarity))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("roleFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.roleOrder, AppState.craftSelectedRoles, "craft-role", role => AppUtils.roleName(role))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("rangeFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rangeOrder, AppState.craftSelectedRanges, "craft-range", range => AppUtils.rangeName(range))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("attributeFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.attrOrder, AppState.craftSelectedAttrs, "craft-attr", attr => AppUtils.attrName(attr))}</div></div><div class="filters-block filters-block-wide"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("damageFilters")}</div></div><div class="filters-grid filters-grid-damage">${renderChoiceChips(AppUtils.damageTypeOrder, AppState.craftSelectedDamageTypes, "craft-damage", damage => AppUtils.damageTypeName(damage))}</div></div></div></aside>`;
  }

  function render(){
    const root = document.getElementById("pageRoot");
    const filtered = filterCrafts();
    const groups = groupedCrafts(filtered);
    root.innerHTML = `${renderFilters()}<div class="section-card"><div class="catalog-toolbar"><div class="count-badge">${filtered.length} ${AppUtils.t("craftsCountLabel")}</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllCrafts" type="button">${AppUtils.t("expandAll")}</button><button class="btn" id="collapseAllCrafts" type="button">${AppUtils.t("collapseAll")}</button></div></div>${groups.map(group => `<section class="craft-group" data-group="${group.key}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityGroupName(group.key)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.crafts.length} ${AppUtils.t("craftsCountLabel")}</div><button class="btn craft-group-toggle" data-group="${group.key}" type="button">${COLLAPSE_ICON}</button></div></div><div class="craft-grid">${group.crafts.map(craft => `<article class="craft-card r${craft.rarity} hover-craft" data-result-key="${craft.key}"><div class="craft-thumb rarity-shell r${craft.rarity}">${craft.image ? `<img src="${craft.image}" alt="${craft.result}">` : ""}</div><div class="craft-name rarity-text r${craft.rarity}">${craft.result}</div><div class="craft-meta"><span class="mini-badge role-badge role-${craft.role}">${AppUtils.roleName(craft.role)}</span> <span class="mini-badge filter-badge">${AppUtils.rangeName(craft.range)}</span> <span class="mini-badge filter-badge">${AppUtils.attrName(craft.attr)}</span></div></article>`).join("")}</div></section>`).join("")}</div><div class="modal-backdrop" id="craftBackdrop"></div><div class="modal" id="craftModal"><div id="craftModalBody"></div></div>`;

    const filtersPanel = document.getElementById("craftsFilters");
    if(filtersPanel && AppState.craftsFiltersOpen){
      filtersPanel.scrollTop = AppState.craftsFiltersScroll || 0;
      filtersPanel.onscroll = () => {
        AppState.craftsFiltersScroll = filtersPanel.scrollTop;
      };
    }

    root.querySelectorAll(".craft-card").forEach(card => card.onclick = () => openModal(card.dataset.resultKey));
    root.querySelectorAll("[data-craft-rarity]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.craftSelectedRarities = toggleSetValue(AppState.craftSelectedRarities, Number(button.dataset.craftRarity)); render(); });
    root.querySelectorAll("[data-craft-role]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.craftSelectedRoles = toggleSetValue(AppState.craftSelectedRoles, button.dataset.craftRole); render(); });
    root.querySelectorAll("[data-craft-range]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.craftSelectedRanges = toggleSetValue(AppState.craftSelectedRanges, button.dataset.craftRange); render(); });
    root.querySelectorAll("[data-craft-attr]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.craftSelectedAttrs = toggleSetValue(AppState.craftSelectedAttrs, button.dataset.craftAttr); render(); });
    root.querySelectorAll("[data-craft-damage]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.craftSelectedDamageTypes = toggleSetValue(AppState.craftSelectedDamageTypes, button.dataset.craftDamage); render(); });

    const resetAll = document.getElementById("resetAllCraftFilters");
    if(resetAll) resetAll.onclick = () => {
      rememberFiltersScroll();
      AppState.craftSelectedRarities = new Set();
      AppState.craftSelectedRoles = new Set();
      AppState.craftSelectedRanges = new Set();
      AppState.craftSelectedAttrs = new Set();
      AppState.craftSelectedDamageTypes = new Set();
      render();
    };

    const closeFilters = document.getElementById("closeCraftFilters");
    if(closeFilters) closeFilters.onclick = () => {
      AppState.craftsFiltersOpen = false;
      AppState.craftsFiltersScroll = 0;
      render();
    };

    const craftBackdrop = document.getElementById("craftsFiltersBackdrop");
    if(craftBackdrop) craftBackdrop.onclick = () => {
      AppState.craftsFiltersOpen = false;
      AppState.craftsFiltersScroll = 0;
      render();
    };

    bindGroupToggles(root);

    document.getElementById("expandAllCrafts").onclick = () => {
      root.querySelectorAll(".craft-grid").forEach(grid => grid.classList.remove("hidden"));
      root.querySelectorAll(".craft-group-toggle").forEach(button => button.textContent = COLLAPSE_ICON);
    };

    document.getElementById("collapseAllCrafts").onclick = () => {
      root.querySelectorAll(".craft-grid").forEach(grid => grid.classList.add("hidden"));
      root.querySelectorAll(".craft-group-toggle").forEach(button => button.textContent = EXPAND_ICON);
    };

    document.getElementById("craftBackdrop").onclick = closeModal;
    CommonUI.bindHover(".hover-craft", el => craftTooltip(window.AppRecipes.find(craft => craft.key === el.dataset.resultKey)));
  }

  return {
    render,
    toggleFilters(){
      rememberFiltersScroll();
      AppState.craftsFiltersOpen = !AppState.craftsFiltersOpen;
      if(!AppState.craftsFiltersOpen) AppState.craftsFiltersScroll = 0;
      render();
    },
    setSearch(value){
      rememberFiltersScroll();
      AppState.craftSearch = value;
      render();
    },
    getRecipes(){
      return window.AppRecipes;
    }
  };
})();
