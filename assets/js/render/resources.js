window.RenderResources = (function(){
  const COLLAPSE_ICON = "-";
  const EXPAND_ICON = "+";

  function lookupItemByName(name){
    return AppUtils.findItemByName(name);
  }

  function buildResources(){
    const map = new Map();
    (((window.RenderCrafts && window.RenderCrafts.getRecipes && window.RenderCrafts.getRecipes()) || window.AppRecipes || [])).forEach(craft => {
      craft.formulas.forEach(formula => {
        formula.componentsData.forEach(component => {
          const item = component.item || lookupItemByName(component.originalName || component.name);
          const key = item ? AppUtils.itemKey(item) : AppUtils.normalizeKey(component.name);
          if(!map.has(key)){
            map.set(key, {
              key,
              name: item ? AppUtils.displayName(item) : component.name,
              image: item?.image || component.image || "",
              rarity: item?.rarity ?? component.rarity ?? 0,
              item,
              itemKey: item ? AppUtils.itemKey(item) : "",
              crafts: [],
              role: item ? AppUtils.itemRoles(item)[0] || "general" : "general",
              range: item ? AppUtils.itemRange(item) : "flexible",
              attr: item ? AppUtils.itemAttribute(item) : "neutral",
              damageTypes: item ? AppUtils.itemDamageTypes(item) : ["none"]
            });
          }
          const entry = map.get(key);
          if(item){
            entry.name = AppUtils.displayName(item);
            entry.image = item.image || entry.image;
            entry.rarity = item.rarity;
            entry.item = item;
            entry.itemKey = AppUtils.itemKey(item);
            entry.role = AppUtils.itemRoles(item)[0] || "general";
            entry.range = AppUtils.itemRange(item);
            entry.attr = AppUtils.itemAttribute(item);
            entry.damageTypes = AppUtils.itemDamageTypes(item);
          }
          if(!entry.crafts.some(existing => existing.key === craft.key)) entry.crafts.push(craft);
        });
      });
    });
    return [...map.values()].sort((a, b) => ((b.rarity || 0) - (a.rarity || 0)) || a.name.localeCompare(b.name));
  }

  function groupedResources(filtered){
    return AppUtils.rarityGroupOrder.map(groupKey => ({
      key: groupKey,
      resources: filtered
        .filter(resource => AppUtils.rarityMeta(resource.rarity).group === groupKey)
        .sort((a, b) => (b.rarity - a.rarity) || a.name.localeCompare(b.name))
    })).filter(group => group.resources.length);
  }

  function resourceTooltip(resource){
    const itemTooltip = resource.item && window.RenderItems?.tooltipForItem ? RenderItems.tooltipForItem(resource.item) : "";
    const craftsSection = `<div class="tooltip-section tooltip-section-craft"><div class="tooltip-section-title">${AppUtils.t("usedToCraftTitle")}</div><ul>${resource.crafts.map(craft => `<li>${craft.result}</li>`).join("")}</ul></div>`;
    return `${itemTooltip || `<div class="tooltip-head"><img src="${resource.image}" alt=""><div><div class="tooltip-title rarity-text r${resource.rarity}">${resource.name}</div><div class="tooltip-sub">${AppUtils.rarityName(resource.rarity)}</div></div></div>`}${craftsSection}`;
  }

  function openModal(resourceKey){
    const resource = buildResources().find(entry => entry.key === resourceKey);
    if(!resource) return;
    const modal = document.getElementById("resourceModal");
    const backdrop = document.getElementById("resourceBackdrop");
    const body = document.getElementById("resourceModalBody");
    body.innerHTML = `<button class="btn modal-close" id="resourceCloseBtn" type="button">&times;</button><div class="modal-title-wrap"><div class="tooltip-title rarity-text r${resource.rarity}">${resource.name}</div><div class="tooltip-sub">${AppUtils.t("resourceCraftsAvailable")}</div></div><div class="resource-modal-list">${resource.crafts.map(craft => `<article class="resource-modal-card r${craft.rarity || 0}"><div class="resource-modal-head"><div class="craft-thumb rarity-shell r${craft.rarity || 0}">${craft.image ? `<img src="${craft.image}" alt="${craft.result}">` : ""}</div><div><div class="craft-name rarity-text r${craft.rarity || 0}">${craft.result}</div><div class="tooltip-sub">${AppUtils.rarityName(craft.rarity)}</div></div></div><div class="resource-formulas">${craft.formulas.map(formula => `<div class="resource-formula"><div class="resource-formula-title">${AppUtils.t("components")}</div><div class="resource-components">${formula.componentsData.map(component => `<div class="resource-chip hover-resource-item" data-item-key="${component.item ? AppUtils.itemKey(component.item) : ""}" data-item-name="${String(component.originalName || component.name).replace(/"/g, "&quot;")}">${component.image ? `<img src="${component.image}" alt="${component.name}">` : ""}<span>${component.name}</span></div>`).join("")}</div></div>`).join("")}</div></article>`).join("")}</div>`;
    modal.classList.add("open");
    backdrop.classList.add("open");
    document.getElementById("resourceCloseBtn").onclick = closeModal;
    CommonUI.bindHover(".hover-resource-item", el => {
      const item = (el.dataset.itemKey && (ITEMS || []).find(entry => AppUtils.itemKey(entry) === el.dataset.itemKey || entry.codename === el.dataset.itemKey)) || lookupItemByName(el.dataset.itemName);
      return item && window.RenderItems?.tooltipForItem ? RenderItems.tooltipForItem(item) : `<div class="tooltip-title">${el.dataset.itemName}</div>`;
    });
  }

  function closeModal(){
    document.getElementById("resourceModal").classList.remove("open");
    document.getElementById("resourceBackdrop").classList.remove("open");
  }

  function filteredResources(){
    return buildResources()
      .filter(resource => AppUtils.filterIsInactive(AppState.resourceSelectedRarities) || AppState.resourceSelectedRarities.has(resource.rarity))
      .filter(resource => AppUtils.matchesFilter(resource.role, AppState.resourceSelectedRoles))
      .filter(resource => AppUtils.matchesFilter(resource.range, AppState.resourceSelectedRanges))
      .filter(resource => AppUtils.matchesFilter(resource.attr, AppState.resourceSelectedAttrs))
      .filter(resource => AppUtils.filterIsInactive(AppState.resourceSelectedDamageTypes) || (resource.damageTypes || ["none"]).some(value => AppState.resourceSelectedDamageTypes.has(value)))
      .filter(resource => AppUtils.searchMatch(`${resource.name} ${resource.crafts.map(craft => craft.result).join(" ")}`, AppState.resourceSearch));
  }

  function bindGroupToggles(root){
    root.querySelectorAll(".item-group-head").forEach(head => {
      head.onclick = () => {
        const section = head.closest(".resource-group");
        const grid = section.querySelector(".resource-grid");
        const button = head.querySelector(".resource-group-toggle");
        const collapsed = grid.classList.toggle("hidden");
        if(button) button.textContent = collapsed ? EXPAND_ICON : COLLAPSE_ICON;
        section.classList.toggle("collapsed", collapsed);
      };
    });
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
    return AppState.resourceSelectedRarities.size + AppState.resourceSelectedRoles.size + AppState.resourceSelectedRanges.size + AppState.resourceSelectedAttrs.size + AppState.resourceSelectedDamageTypes.size;
  }

  function rememberFiltersScroll(){
    const panel = document.getElementById("resourcesFilters");
    if(panel) AppState.resourcesFiltersScroll = panel.scrollTop;
  }

  function renderFilters(){
    const hasActiveFilters = activeFilterCount() > 0;
    return `<div class="filters-drawer-backdrop ${AppState.resourcesFiltersOpen ? "open" : ""}" id="resourcesFiltersBackdrop"></div><aside class="section-card filters-panel filters-drawer ${AppState.resourcesFiltersOpen ? "open" : ""}" id="resourcesFilters"><div class="filters-toolbar"><div><div class="filters-label">${AppUtils.t("resourceFiltersTitle")}</div><div class="filters-tip">${AppUtils.t("resourceFiltersTip")}</div></div><div class="filters-toolbar-actions"><button class="btn mini-reset" id="closeResourceFilters" type="button">${AppUtils.t("closeFilters")}</button>${hasActiveFilters ? `<button class="btn mini-reset" id="resetAllResourceFilters" type="button">${AppUtils.t("clearAllFilters")}</button>` : ""}</div></div><div class="filters-stack compact-grid"><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("rarityLabel")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rarityOrder, AppState.resourceSelectedRarities, "resource-rarity", rarity => AppUtils.rarityName(rarity))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("roleFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.roleOrder, AppState.resourceSelectedRoles, "resource-role", role => AppUtils.roleName(role))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("rangeFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rangeOrder, AppState.resourceSelectedRanges, "resource-range", range => AppUtils.rangeName(range))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("attributeFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.attrOrder, AppState.resourceSelectedAttrs, "resource-attr", attr => AppUtils.attrName(attr))}</div></div><div class="filters-block filters-block-wide"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("damageFilters")}</div></div><div class="filters-grid filters-grid-damage">${renderChoiceChips(AppUtils.damageTypeOrder, AppState.resourceSelectedDamageTypes, "resource-damage", damage => AppUtils.damageTypeName(damage))}</div></div></div></aside>`;
  }

  function recipeWord(count){
    return count === 1 ? AppUtils.t("recipeSingularLabel") : AppUtils.t("recipePluralLabel");
  }

  function render(){
    const root = document.getElementById("pageRoot");
    const filtered = filteredResources();
    const groups = groupedResources(filtered);
    root.innerHTML = `${renderFilters()}<div class="section-card resource-intro"><div class="catalog-hero"><div><div class="catalog-label">${AppUtils.t("resourceCatalogLabel")}</div><h2>${AppUtils.t("resourceIntroTitle")}</h2><p>${AppUtils.t("resourceIntroText")}</p></div></div></div><div class="section-card"><div class="count-badge">${filtered.length} ${AppUtils.t("resourcesCountLabel")}</div>${groups.map(group => `<section class="resource-group" data-group="${group.key}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityGroupName(group.key)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.resources.length} ${AppUtils.t("resourcesCountLabel")}</div><button class="btn resource-group-toggle" type="button">${COLLAPSE_ICON}</button></div></div><div class="resource-grid">${group.resources.map(resource => `<article class="item-card resource-card r${resource.rarity} hover-resource-card" data-resource-key="${resource.key}"><div class="item-thumb rarity-shell r${resource.rarity}">${resource.image ? `<img src="${resource.image}" alt="${resource.name}">` : ""}</div><div class="item-meta"><div class="item-name rarity-text r${resource.rarity}">${resource.name}</div><div class="item-tags"><span class="mini-badge filter-badge">${resource.crafts.length} ${recipeWord(resource.crafts.length)}</span><span class="mini-badge vivid-badge badge-rarity">${AppUtils.rarityCardLabel(resource.rarity)}</span>${(resource.damageTypes || ["none"]).slice(0, 1).map(damage => `<span class="mini-badge filter-badge damage-badge">${AppUtils.damageTypeName(damage)}</span>`).join("")}</div></div></article>`).join("")}</div></section>`).join("")}</div><div class="modal-backdrop" id="resourceBackdrop"></div><div class="modal" id="resourceModal"><div id="resourceModalBody"></div></div>`;

    const filtersPanel = document.getElementById("resourcesFilters");
    if(filtersPanel && AppState.resourcesFiltersOpen){
      filtersPanel.scrollTop = AppState.resourcesFiltersScroll || 0;
      filtersPanel.onscroll = () => {
        AppState.resourcesFiltersScroll = filtersPanel.scrollTop;
      };
    }

    root.querySelectorAll(".resource-card").forEach(card => card.onclick = () => openModal(card.dataset.resourceKey));
    document.getElementById("resourceBackdrop").onclick = closeModal;
    bindGroupToggles(root);

    root.querySelectorAll("[data-resource-rarity]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.resourceSelectedRarities = toggleSetValue(AppState.resourceSelectedRarities, Number(button.dataset.resourceRarity)); render(); });
    root.querySelectorAll("[data-resource-role]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.resourceSelectedRoles = toggleSetValue(AppState.resourceSelectedRoles, button.dataset.resourceRole); render(); });
    root.querySelectorAll("[data-resource-range]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.resourceSelectedRanges = toggleSetValue(AppState.resourceSelectedRanges, button.dataset.resourceRange); render(); });
    root.querySelectorAll("[data-resource-attr]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.resourceSelectedAttrs = toggleSetValue(AppState.resourceSelectedAttrs, button.dataset.resourceAttr); render(); });
    root.querySelectorAll("[data-resource-damage]").forEach(button => button.onclick = event => { event.stopPropagation(); rememberFiltersScroll(); AppState.resourceSelectedDamageTypes = toggleSetValue(AppState.resourceSelectedDamageTypes, button.dataset.resourceDamage); render(); });

    const closeFilters = document.getElementById("closeResourceFilters");
    if(closeFilters) closeFilters.onclick = () => {
      AppState.resourcesFiltersOpen = false;
      AppState.resourcesFiltersScroll = 0;
      render();
    };

    const resetAll = document.getElementById("resetAllResourceFilters");
    if(resetAll) resetAll.onclick = () => {
      rememberFiltersScroll();
      AppState.resourceSelectedRarities = new Set();
      AppState.resourceSelectedRoles = new Set();
      AppState.resourceSelectedRanges = new Set();
      AppState.resourceSelectedAttrs = new Set();
      AppState.resourceSelectedDamageTypes = new Set();
      render();
    };

    const backdrop = document.getElementById("resourcesFiltersBackdrop");
    if(backdrop) backdrop.onclick = () => {
      AppState.resourcesFiltersOpen = false;
      AppState.resourcesFiltersScroll = 0;
      render();
    };

    CommonUI.bindHover(".hover-resource-card", el => {
      const resource = buildResources().find(entry => entry.key === el.dataset.resourceKey);
      return resource ? resourceTooltip(resource) : "";
    });
  }

  return {
    render,
    setSearch(value){
      rememberFiltersScroll();
      AppState.resourceSearch = value;
      render();
    },
    toggleFilters(){
      rememberFiltersScroll();
      AppState.resourcesFiltersOpen = !AppState.resourcesFiltersOpen;
      if(!AppState.resourcesFiltersOpen) AppState.resourcesFiltersScroll = 0;
      render();
    }
  };
})();
