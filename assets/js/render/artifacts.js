window.RenderArtifacts = (function(){
  function matchesSearch(item){
    const q = String(AppState.artifactSearch || '').trim().toLowerCase();
    if(!q) return true;
    const text = [AppUtils.displayName(item), item.name, item.searchText, ...(item.descEn||[]), ...(item.descEs||[])].filter(Boolean).join(' ').toLowerCase();
    return text.includes(q);
  }
  function groupedArtifacts(items){
    const groups = new Map();
    items.forEach(item => {
      const key = AppUtils.rarityMeta(item).group;
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()].map(([key, artifacts]) => ({ key, artifacts: artifacts.sort((a,b)=>AppUtils.displayName(a).localeCompare(AppUtils.displayName(b)))}));
  }
  function render(){
    const root = document.getElementById('pageRoot');
    const filtered = (window.ARTIFACT_ITEMS || []).filter(matchesSearch);
    const groups = groupedArtifacts(filtered);
    root.innerHTML = `<div class="section-card"><div class="catalog-toolbar"><div class="count-badge">${filtered.length} ${AppUtils.t('artifacts')}</div><div class="tooltip-sub">${AppUtils.t('artifactCatalogIntro')}</div></div>${groups.map(group => `<section class="artifact-group"><div class="item-group-head"><div class="count-badge">${AppUtils.rarityGroupName(group.key)}</div><div class="count-badge">${group.artifacts.length}</div></div><div class="items-grid artifact-grid-page">${group.artifacts.map(item => `<article class="item-card hover-artifact r${item.rarity}"><div class="item-thumb rarity-shell r${item.rarity}"><img src="${item.image}" alt="${AppUtils.displayName(item)}"></div><div class="item-name rarity-text r${item.rarity}">${AppUtils.displayName(item)}</div><div class="item-rarity">${AppUtils.rarityCardLabel(item.rarity)}</div></article>`).join('')}</div></section>`).join('') || `<div class="hero-empty-inline">${AppUtils.t('artifactNoResults')}</div>`}</div>`;
    CommonUI.bindHover('.hover-artifact', el => {
      const name = el.querySelector('.item-name')?.textContent || '';
      const item = (window.ARTIFACT_ITEMS || []).find(entry => AppUtils.displayName(entry) === name);
      return item && RenderItems.tooltipForItem ? RenderItems.tooltipForItem(item) : '';
    });
  }
  function setSearch(value){ AppState.artifactSearch = value || ''; render(); }
  return { render, setSearch };
})();
