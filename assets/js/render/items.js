window.RenderItems = (function(){
  const COLLAPSE_ICON = "-";
  const EXPAND_ICON = "+";

  function rawRecipes(){
    return [...(window.CRAFTS || []), ...(window.EXTRA_RECIPES || [])];
  }

  function buildCraftLinks(recipes){
    const links = {};
    recipes.forEach(recipe => {
      const resultName = AppUtils.recipeDisplayName(recipe.result);
      const resultKey = AppUtils.normalizeKey(resultName);
      if(!links[resultKey]) links[resultKey] = { crafted: false, formulas: [], creates: [] };
      links[resultKey].crafted = true;
      const formulaText = (recipe.components || []).map(AppUtils.recipeDisplayName).join(" + ");
      if(formulaText && !links[resultKey].formulas.includes(formulaText)) links[resultKey].formulas.push(formulaText);
      (recipe.components || []).forEach(component => {
        const componentName = AppUtils.recipeDisplayName(component);
        const componentKey = AppUtils.normalizeKey(componentName);
        if(!links[componentKey]) links[componentKey] = { crafted: false, formulas: [], creates: [] };
        if(!links[componentKey].creates.includes(resultName)) links[componentKey].creates.push(resultName);
      });
    });
    return links;
  }

  function splitSections(lines){
    const sections = { headline: [], effects: [], notes: [], stats: [], special: [], prices: [] };
    (lines || []).forEach(rawLine => {
      const line = String(rawLine || "").trim();
      if(!line) return;
      if(/^Uniquely Equipped\.?$/i.test(line) || /^Equipamiento unico\.?$/i.test(line)){
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
      if(/^(Intellect|Strength|Agility|Health|Mana|Armor|Spell Resistance|Spellpower|Attack Damage|Auto Attack Damage|Cooldown Reduction|Fire Damage|Frost Damage|Arcane Damage|Shadow Damage|Holy Damage|Nature Damage|Chaos Damage|Physical Damage|Movement Speed|Attack Speed|Healing|Primary Attribute|Max Health|Max Mana|Ability Critical Strike Chance|Ability Critical Strike Factor|Dragon Intellect to Healing|Dragon Spellpower to Healing|Primary Attribute to Companion Damage|Chance on|Poder de hechizo|Intelecto|Fuerza|Agilidad|Vida|Mana|Armadura|Resistencia a hechizos|Dano de ataque|Dano de autoataque|Reduccion de enfriamiento|Dano de Fuego|Dano de Escarcha|Dano Arcano|Dano de Sombra|Dano Sagrado|Dano de Naturaleza|Dano de Caos|Dano Fisico|Velocidad de movimiento|Velocidad de ataque|Curacion|Atributo principal|Vida maxima|Mana maximo|Probabilidad de golpe critico de habilidad|Factor de golpe critico de habilidad|Intelecto del dragon a curacion|Poder de hechizo del dragon a curacion|Atributo principal a dano de companero|Probabilidad al)/i.test(line) || /^[+\-]?\d/.test(line)){
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

  function sectionBlock(title, content, kind = "default"){
    if(!content) return "";
    return `<div class="tooltip-section tooltip-section-${kind}"><div class="tooltip-section-title">${title}</div>${content}</div>`;
  }

  function statGrid(lines){
    return `<div class="tooltip-stat-grid">${lines.map(line => `<div class="tooltip-stat-row">${line}</div>`).join("")}</div>`;
  }

  function listBlock(lines){
    return `<ul>${lines.map(line => `<li>${line}</li>`).join("")}</ul>`;
  }

  function itemTooltip(item){
    const links = buildCraftLinks(rawRecipes());
    const craft = links[AppUtils.normalizeKey(AppUtils.displayName(item))] || { crafted: false, formulas: [], creates: [] };
    const roles = AppUtils.itemRoles(item);
    const range = AppUtils.itemRange(item);
    const attr = AppUtils.itemAttribute(item);
    const sections = splitSections(AppUtils.descByLang(item));

    const craftHtml = (!craft.crafted && !craft.creates.length) ? "" : sectionBlock(
      AppUtils.t("itemCraftingTitle"),
      `${craft.crafted ? `<div class="tooltip-craft-block"><div class="tooltip-label gold">${AppUtils.t("itemCraftedByLabel")}</div>${listBlock(craft.formulas)}</div>` : ""}
       ${craft.creates.length ? `<div class="tooltip-craft-block"><div class="tooltip-label green">${AppUtils.t("itemCreatesLabel")}</div>${listBlock(craft.creates)}</div>` : ""}`,
      "craft"
    );

    const profileBadges = `<div class="tooltip-badge-row">${roles.map(role => `<span class="mini-badge role-badge role-${role}">${AppUtils.roleName(role)}</span>`).join("")}<span class="mini-badge filter-badge filter-range">${AppUtils.rangeName(range)}</span><span class="mini-badge filter-badge filter-attr">${AppUtils.attrName(attr)}</span></div>`;

    return `<div class="tooltip-head"><img src="${item.image}" alt=""><div><div class="tooltip-title rarity-text r${item.rarity}">${AppUtils.displayName(item)}</div><div class="tooltip-sub">${AppUtils.rarityName(item.rarity)}</div></div></div>
      ${sectionBlock(AppUtils.t("itemProfileTitle"), profileBadges, "profile")}
      ${sections.headline.length ? sectionBlock(AppUtils.t("itemDescriptionTitle"), listBlock(sections.headline), "desc") : ""}
      ${sections.effects.length ? sectionBlock(AppUtils.t("itemEffectsTitle"), listBlock(sections.effects), "effects") : ""}
      ${sections.notes.length ? sectionBlock(AppUtils.t("itemNotesTitle"), listBlock(sections.notes), "notes") : ""}
      ${sections.special.length ? sectionBlock(AppUtils.t("itemSpecialTitle"), `<div class="tooltip-pill-list">${sections.special.map(line => `<span class="tooltip-special-pill">${line}</span>`).join("")}</div>`, "special") : ""}
      ${sections.stats.length ? sectionBlock(AppUtils.t("itemStatsTitle"), statGrid(sections.stats), "stats compact") : ""}
      ${sections.prices.length ? sectionBlock(AppUtils.t("itemPriceTitle"), statGrid(sections.prices), "price") : ""}
      ${craftHtml}`;
  }

  function renderChoiceChips(order, selectedSet, dataAttr, labelFn, extraClass = ""){
    return order.map(value => `<button class="chip filter-chip ${selectedSet.has(value) ? "active" : ""} ${extraClass}" data-${dataAttr}="${value}" type="button">${labelFn(value)}</button>`).join("");
  }

  function passesDamage(item, selectedSet){
    return passesMulti(AppUtils.itemDamageTypes(item), selectedSet);
  }

  function passesMulti(itemValues, selectedSet){
    if(AppUtils.filterIsInactive(selectedSet)) return true;
    return itemValues.some(value => selectedSet.has(value));
  }

  function activeFilterCount(){
    return AppState.selectedRarities.size + AppState.selectedRoles.size + AppState.selectedRanges.size + AppState.selectedAttrs.size + AppState.selectedDamageTypes.size;
  }

  function rememberFiltersScroll(){
    const panel = document.getElementById("itemsFilters");
    if(panel) AppState.itemsFiltersScroll = panel.scrollTop;
  }

  function renderFilters(){
    const hasActiveFilters = activeFilterCount() > 0;
    return `<div class="filters-drawer-backdrop ${AppState.itemsFiltersOpen ? "open" : ""}" id="itemsFiltersBackdrop"></div><aside class="section-card filters-panel filters-drawer ${AppState.itemsFiltersOpen ? "open" : ""}" id="itemsFilters"><div class="filters-toolbar"><div><div class="filters-label">${AppUtils.t("itemFiltersTitle")}</div><div class="filters-tip">${AppUtils.t("itemFiltersTip")}</div></div><div class="filters-toolbar-actions"><button class="btn mini-reset" id="closeItemFilters" type="button">${AppUtils.t("closeFilters")}</button>${hasActiveFilters ? `<button class="btn mini-reset" id="resetAllItemFilters" type="button">${AppUtils.t("clearAllFilters")}</button>` : ""}</div></div><div class="filters-stack compact-grid"><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("rarityLabel")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rarityOrder, AppState.selectedRarities, "rarity", rarity => AppUtils.rarityName(rarity))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("roleFilters")}</div></div><div class="filters-grid role-grid">${renderChoiceChips(AppUtils.roleOrder, AppState.selectedRoles, "role", role => AppUtils.roleName(role))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("rangeFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.rangeOrder, AppState.selectedRanges, "range", range => AppUtils.rangeName(range))}</div></div><div class="filters-block"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("attributeFilters")}</div></div><div class="filters-grid">${renderChoiceChips(AppUtils.attrOrder, AppState.selectedAttrs, "attr", attr => AppUtils.attrName(attr))}</div></div><div class="filters-block filters-block-wide"><div class="filters-row-head"><div class="filters-label">${AppUtils.t("damageFilters")}</div></div><div class="filters-grid filters-grid-damage">${renderChoiceChips(AppUtils.damageTypeOrder, AppState.selectedDamageTypes, "damage", damage => AppUtils.damageTypeName(damage))}</div></div></div></aside>`;
  }

  function toggleSetValue(set, value){
    const next = new Set(set);
    if(next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function filteredItems(){
    return ITEMS
      .filter(item => AppUtils.filterIsInactive(AppState.selectedRarities) || AppState.selectedRarities.has(item.rarity))
      .filter(item => passesMulti(AppUtils.itemRoles(item), AppState.selectedRoles))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemRange(item), AppState.selectedRanges))
      .filter(item => AppUtils.matchesFilter(AppUtils.itemAttribute(item), AppState.selectedAttrs))
      .filter(item => passesDamage(item, AppState.selectedDamageTypes))
      .filter(item => AppUtils.searchMatch(item.searchText || AppUtils.displayName(item), AppState.itemSearch));
  }

  function groupedItems(filtered){
    return AppUtils.rarityGroupOrder.map(groupKey => ({
      key: groupKey,
      items: filtered
        .filter(item => AppUtils.rarityMeta(item).group === groupKey)
        .sort((a, b) => (b.rarity - a.rarity) || AppUtils.displayName(a).localeCompare(AppUtils.displayName(b)))
    })).filter(group => group.items.length);
  }

  function bindGroupToggles(root){
    root.querySelectorAll(".item-group-head").forEach(head => {
      head.onclick = () => {
        const section = head.closest(".item-group");
        const grid = section.querySelector(".item-grid");
        const button = head.querySelector(".group-toggle");
        const collapsed = grid.classList.toggle("hidden");
        if(button) button.textContent = collapsed ? EXPAND_ICON : COLLAPSE_ICON;
        section.classList.toggle("collapsed", collapsed);
      };
    });
  }

  function toggleDataSet(attrName){
    return event => {
      event.stopPropagation();
      rememberFiltersScroll();
      const value = attrName === "rarity" ? Number(event.currentTarget.dataset[attrName]) : event.currentTarget.dataset[attrName];
      const map = {
        rarity: "selectedRarities",
        role: "selectedRoles",
        range: "selectedRanges",
        attr: "selectedAttrs",
        damage: "selectedDamageTypes"
      };
      AppState[map[attrName]] = toggleSetValue(AppState[map[attrName]], value);
      render();
    };
  }

  function render(){
    const root = document.getElementById("pageRoot");
    const filtered = filteredItems();
    const groups = groupedItems(filtered);
    root.innerHTML = `${renderFilters()}<div class="section-card"><div class="catalog-toolbar"><div class="count-badge">${filtered.length} ${AppUtils.t("itemsCountLabel")}</div><div style="display:flex;gap:8px"><button class="btn" id="expandAllBtn" type="button">${AppUtils.t("expandAll")}</button><button class="btn" id="collapseAllBtn" type="button">${AppUtils.t("collapseAll")}</button></div></div>${groups.map(group => `<section class="item-group" data-group="${group.key}"><div class="item-group-head clickable-head"><div class="count-badge">${AppUtils.rarityGroupName(group.key)}</div><div style="display:flex;gap:10px;align-items:center"><div class="count-badge">${group.items.length} ${AppUtils.t("itemsCountLabel")}</div><button class="btn group-toggle" data-group="${group.key}" type="button">${COLLAPSE_ICON}</button></div></div><div class="item-grid">${group.items.map(item => { const roles = AppUtils.itemRoles(item); const leadRole = roles[0] || "general"; return `<article class="item-card r${item.rarity} hover-item" data-code="${item.codename}" data-item-key="${AppUtils.itemKey(item)}"><div class="item-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="item-meta"><div class="item-name rarity-text r${item.rarity}">${AppUtils.displayName(item)}</div><div class="item-tags"><span class="mini-badge vivid-badge badge-rarity">${AppUtils.rarityCardLabel(item.rarity)}</span><span class="mini-badge role-badge role-${leadRole}">${AppUtils.roleName(leadRole)}</span><span class="mini-badge filter-badge filter-range">${AppUtils.rangeName(AppUtils.itemRange(item))}</span><span class="mini-badge filter-badge filter-attr">${AppUtils.attrName(AppUtils.itemAttribute(item))}</span>${AppUtils.itemDamageTypes(item).slice(0, 1).map(damage => `<span class="mini-badge filter-badge damage-badge">${AppUtils.damageTypeName(damage)}</span>`).join("")}</div></div></article>`; }).join("")}</div></section>`).join("")}</div>`;

    const filtersPanel = document.getElementById("itemsFilters");
    if(filtersPanel && AppState.itemsFiltersOpen){
      filtersPanel.scrollTop = AppState.itemsFiltersScroll || 0;
      filtersPanel.onscroll = () => {
        AppState.itemsFiltersScroll = filtersPanel.scrollTop;
      };
    }

    root.querySelectorAll("[data-rarity]").forEach(button => button.onclick = toggleDataSet("rarity"));
    root.querySelectorAll("[data-role]").forEach(button => button.onclick = toggleDataSet("role"));
    root.querySelectorAll("[data-range]").forEach(button => button.onclick = toggleDataSet("range"));
    root.querySelectorAll("[data-attr]").forEach(button => button.onclick = toggleDataSet("attr"));
    root.querySelectorAll("[data-damage]").forEach(button => button.onclick = toggleDataSet("damage"));

    const resetAll = document.getElementById("resetAllItemFilters");
    if(resetAll) resetAll.onclick = () => {
      rememberFiltersScroll();
      AppState.selectedRarities = new Set();
      AppState.selectedRoles = new Set();
      AppState.selectedRanges = new Set();
      AppState.selectedAttrs = new Set();
      AppState.selectedDamageTypes = new Set();
      render();
    };

    const closeFilters = document.getElementById("closeItemFilters");
    if(closeFilters) closeFilters.onclick = () => {
      AppState.itemsFiltersOpen = false;
      AppState.itemsFiltersScroll = 0;
      render();
    };

    const backdrop = document.getElementById("itemsFiltersBackdrop");
    if(backdrop) backdrop.onclick = () => {
      AppState.itemsFiltersOpen = false;
      AppState.itemsFiltersScroll = 0;
      render();
    };

    bindGroupToggles(root);

    document.getElementById("expandAllBtn").onclick = () => {
      root.querySelectorAll(".item-grid").forEach(grid => grid.classList.remove("hidden"));
      root.querySelectorAll(".group-toggle").forEach(button => button.textContent = COLLAPSE_ICON);
    };

    document.getElementById("collapseAllBtn").onclick = () => {
      root.querySelectorAll(".item-grid").forEach(grid => grid.classList.add("hidden"));
      root.querySelectorAll(".group-toggle").forEach(button => button.textContent = EXPAND_ICON);
    };

    CommonUI.bindHover(".hover-item", el => itemTooltip(ITEMS.find(item => AppUtils.itemKey(item) === el.dataset.itemKey || item.codename === el.dataset.code)));
  }

  return {
    render,
    toggleFilters(){
      rememberFiltersScroll();
      AppState.itemsFiltersOpen = !AppState.itemsFiltersOpen;
      if(!AppState.itemsFiltersOpen) AppState.itemsFiltersScroll = 0;
      render();
    },
    setSearch(value){
      rememberFiltersScroll();
      AppState.itemSearch = value;
      render();
    },
    tooltipForItem: itemTooltip,
    getFilteredItems: filteredItems
  };
})();
